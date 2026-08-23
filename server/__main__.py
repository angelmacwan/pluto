"""
Pluto Lab - Python-hosted visual ML pipeline builder.

Usage:
    python -m server                     # starts on port 8765
    PLUTO_PORT=9000 python -m server     # custom port
    PLUTO_WORKSPACE=/my/dir python -m server  # custom workspace
"""
import os
import sys
import webbrowser
import threading
from pathlib import Path


def main():
    port = int(os.environ.get('PLUTO_PORT', 8765))
    workspace = Path(os.environ.get('PLUTO_WORKSPACE', Path.cwd() / 'workspace'))
    workspace.mkdir(parents=True, exist_ok=True)
    os.environ['PLUTO_WORKSPACE'] = str(workspace.resolve())

    build_dir = Path(__file__).parent.parent / 'build'
    if not build_dir.exists():
        print("\n⚠️  No build/ directory found.")
        print("   Run \"npm run build\" first, then start the server again.\n")
        sys.exit(1)

    print(f"\n🪐  Pluto Lab")
    print(f"   URL       : http://localhost:{port}")
    print(f"   Workspace : {workspace.resolve()}")
    print(f"   Press Ctrl+C to stop\n")

    def open_browser():
        import time
        time.sleep(1.5)
        webbrowser.open(f'http://localhost:{port}')

    threading.Thread(target=open_browser, daemon=True).start()

    from server.app import create_app
    app = create_app()
    # Use werkzeug directly to suppress the dev-server banner
    from werkzeug.serving import run_simple
    run_simple('127.0.0.1', port, app, use_reloader=False, use_debugger=False)


if __name__ == '__main__':
    main()
