import json
import os
import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS


SERVER_DIR = Path(__file__).parent
BUILD_DIR = SERVER_DIR.parent / 'build'


def create_app():
    app = Flask(__name__, static_folder=str(BUILD_DIR), static_url_path='')
    CORS(app)

    def workspace() -> Path:
        return Path(os.environ['PLUTO_WORKSPACE'])

    def safe_resolve(rel_path: str) -> Path:
        """Resolve a user-supplied relative path safely inside the workspace."""
        base = workspace().resolve()
        target = (base / rel_path).resolve()
        if not str(target).startswith(str(base)):
            abort(403, description='Path traversal not allowed')
        return target

    # ── SPA / static files ────────────────────────────────────────────────────

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        # API and run_code routes are handled elsewhere; Flask won't reach here
        # for them, but guard just in case.
        if path.startswith('api/') or path == 'run_code':
            abort(404)
        full = BUILD_DIR / path
        if path and full.is_file():
            return send_from_directory(str(BUILD_DIR), path)
        # Fall back to index.html (SPA routing)
        return send_from_directory(str(BUILD_DIR), 'index.html')

    # ── File API ──────────────────────────────────────────────────────────────

    @app.route('/api/files', defaults={'path': ''})
    @app.route('/api/files/<path:path>')
    def api_files_get(path):
        target = safe_resolve(path) if path else workspace()

        if not target.exists():
            return jsonify({'error': 'Not found'}), 404

        if target.is_file():
            with open(target, 'r', encoding='utf-8') as f:
                raw = f.read()
            return jsonify({'type': 'file', 'content': raw})

        # Directory listing — folders first, then files, both sorted
        items = []
        try:
            entries = sorted(target.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            return jsonify({'error': 'Permission denied'}), 403

        for entry in entries:
            stat = entry.stat()
            items.append({
                'name': entry.name,
                'path': str(entry.relative_to(workspace())),
                'type': 'directory' if entry.is_dir() else 'file',
                'size': stat.st_size if entry.is_file() else None,
                'modified': stat.st_mtime,
            })
        return jsonify({'type': 'directory', 'items': items})

    @app.route('/api/files/<path:path>', methods=['PUT'])
    def api_files_put(path):
        target = safe_resolve(path)
        target.parent.mkdir(parents=True, exist_ok=True)

        body = request.get_json(silent=True)
        if body is None or 'content' not in body:
            return jsonify({'error': 'Request body must be JSON with a "content" key'}), 400

        with open(target, 'w', encoding='utf-8') as f:
            json.dump(body['content'], f, indent=2)

        return jsonify({'success': True, 'path': path})

    @app.route('/api/files/<path:path>', methods=['DELETE'])
    def api_files_delete(path):
        target = safe_resolve(path)
        if not target.exists():
            return jsonify({'error': 'Not found'}), 404
        import shutil
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
        return jsonify({'success': True})

    @app.route('/api/mkdir', methods=['POST'])
    def api_mkdir():
        body = request.get_json(silent=True) or {}
        path = (body.get('path') or '').strip()
        if not path:
            return jsonify({'error': '"path" is required'}), 400
        safe_resolve(path).mkdir(parents=True, exist_ok=True)
        return jsonify({'success': True})

    @app.route('/api/rename', methods=['POST'])
    def api_rename():
        body = request.get_json(silent=True) or {}
        old_path = (body.get('old_path') or '').strip()
        new_path = (body.get('new_path') or '').strip()
        if not old_path or not new_path:
            return jsonify({'error': '"old_path" and "new_path" are required'}), 400
        old = safe_resolve(old_path)
        new = safe_resolve(new_path)
        if not old.exists():
            return jsonify({'error': 'Source not found'}), 404
        old.rename(new)
        return jsonify({'success': True, 'new_path': new_path})

    # ── Code runner (keep same URL as before for CodeOutput.js) ───────────────

    @app.route('/run_code', methods=['POST'])
    def run_code():
        body = request.get_json(silent=True) or {}
        code = body.get('data', '')
        try:
            result = subprocess.run(
                [sys.executable, '-c', code],
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode != 0:
                return jsonify({'error': result.stderr or 'Process exited with non-zero status'})
            return jsonify({'output': result.stdout})
        except subprocess.TimeoutExpired:
            return jsonify({'error': 'Execution timed out (60 s limit)'})
        except Exception as exc:
            return jsonify({'error': str(exc)})

    return app
