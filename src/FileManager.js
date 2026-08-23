import React, { useState, useEffect, useCallback, useRef } from 'react';
import './FileManager.css';

// ── SVG Icon helpers ────────────────────────────────────────────────

const IconFolder = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
  </svg>
);

const IconFile = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/>
  </svg>
);

const IconBack = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
  </svg>
);

const IconPencil = () => (
  <svg width="11" height="11" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
  </svg>
);

const IconTrash = () => (
  <svg width="11" height="11" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
  </svg>
);

const IconPlus = () => (
  <svg width="11" height="11" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
  </svg>
);


// ── Helpers ─────────────────────────────────────────────────────────

const isFlowFile = (name) => name.endsWith('.json') || name.endsWith('.pluto');

const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExt = (name) => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : '';
};


/**
 * FileManager — Jupyter-style file browser panel.
 *
 * Props:
 *   currentFilePath  string|null   — path of the currently open file
 *   onOpen(path, data)             — called when user opens a flow
 *   onCurrentPathChange(path|null) — called when current path changes (rename)
 *   onNewFlow(path, data)          — called after a brand-new empty flow is created
 */
const FileManager = ({ currentFilePath, onOpen, onCurrentPathChange, onNewFlow }) => {
  const [currentDir, setCurrentDir] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renamingPath, setRenamingPath] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  // ── Fetch directory listing ──────────────────────────────────────

  const fetchDir = useCallback(async (dir = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files${dir ? '/' + dir : ''}`);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setItems(data.items || []);
      setCurrentDir(dir);
    } catch {
      setError('Cannot reach server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDir(''); }, [fetchDir]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingPath]);

  // ── Navigation helpers ───────────────────────────────────────────

  const breadcrumbs = ['workspace', ...currentDir.split('/').filter(Boolean)];

  const navigateUp = () => {
    const parts = currentDir.split('/').filter(Boolean);
    parts.pop();
    fetchDir(parts.join('/'));
  };

  const navigateToCrumb = (index) => {
    if (index === 0) { fetchDir(''); return; }
    const parts = currentDir.split('/').filter(Boolean);
    fetchDir(parts.slice(0, index).join('/'));
  };

  // ── File operations ──────────────────────────────────────────────

  const handleOpen = async (item) => {
    if (item.type === 'directory') {
      fetchDir(item.path);
      return;
    }
    if (!isFlowFile(item.name)) {
      // Non-flow file: just notify without parsing as JSON
      return;
    }
    try {
      const res = await fetch(`/api/files/${item.path}`);
      const data = await res.json();
      const parsed = JSON.parse(data.content);
      onOpen(item.path, parsed);
    } catch {
      alert('Failed to open file.');
    }
  };

  const handleNewFlow = async () => {
    const raw = window.prompt('Flow name:', 'my-flow');
    if (!raw) return;
    const name = raw.endsWith('.json') ? raw : `${raw}.json`;
    const path = currentDir ? `${currentDir}/${name}` : name;
    const emptyFlow = { nodes: [], edges: [] };
    try {
      await fetch(`/api/files/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: emptyFlow }),
      });
      onNewFlow(path, emptyFlow);
      fetchDir(currentDir);
    } catch {
      alert('Failed to create flow.');
    }
  };

  const handleNewFolder = async () => {
    const name = window.prompt('Folder name:');
    if (!name) return;
    const path = currentDir ? `${currentDir}/${name}` : name;
    try {
      await fetch('/api/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      fetchDir(currentDir);
    } catch {
      alert('Failed to create folder.');
    }
  };

  const handleDelete = async (item, e) => {
    e.stopPropagation();
    const label = item.type === 'directory'
      ? `folder "${item.name}" and all its contents`
      : `"${item.name}"`;
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await fetch(`/api/files/${item.path}`, { method: 'DELETE' });
      if (currentFilePath === item.path) onCurrentPathChange(null);
      fetchDir(currentDir);
    } catch {
      alert('Failed to delete.');
    }
  };

  const startRename = (item, e) => {
    e.stopPropagation();
    setRenamingPath(item.path);
    setRenameValue(item.name);
  };

  const commitRename = async (item) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === item.name) {
      setRenamingPath(null);
      return;
    }
    const dir = item.path.includes('/')
      ? item.path.substring(0, item.path.lastIndexOf('/'))
      : '';
    const newPath = dir ? `${dir}/${trimmed}` : trimmed;
    try {
      await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_path: item.path, new_path: newPath }),
      });
      if (currentFilePath === item.path) onCurrentPathChange(newPath);
      setRenamingPath(null);
      fetchDir(currentDir);
    } catch {
      alert('Rename failed.');
      setRenamingPath(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="fm-panel">
      {/* Header */}
      <div className="fm-header">
        <span className="fm-title">Explorer</span>
        <div className="fm-header-actions">
          <button className="fm-btn fm-btn-primary" onClick={handleNewFlow} title="New Flow">
            <IconPlus /> Flow
          </button>
          <button className="fm-btn" onClick={handleNewFolder} title="New Folder">
            <IconPlus /> Folder
          </button>
          <button className="fm-btn fm-btn-refresh" onClick={() => fetchDir(currentDir)} title="Refresh">
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="fm-breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            <span
              className={`fm-crumb ${i < breadcrumbs.length - 1 ? 'fm-crumb-link' : ''}`}
              onClick={() => i < breadcrumbs.length - 1 && navigateToCrumb(i)}
            >
              {crumb}
            </span>
            {i < breadcrumbs.length - 1 && <span className="fm-crumb-sep">/</span>}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="fm-content">
        {error && <div className="fm-error">{error}</div>}
        {loading && <div className="fm-status">Loading…</div>}

        {/* Back row */}
        {currentDir && (
          <div className="fm-item fm-item-back" onClick={navigateUp}>
            <span className="fm-item-icon"><IconBack /></span>
            <span className="fm-item-name">..</span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="fm-empty">
            <div className="fm-empty-icon">📂</div>
            No files yet.<br />
            Click <strong>+ Flow</strong> to create one.
          </div>
        )}

        {items.map((item) => {
          const ext = item.type === 'file' ? getExt(item.name) : null;
          const isFlow = item.type === 'file' && isFlowFile(item.name);
          return (
            <div
              key={item.path}
              className={`fm-item ${
                item.type === 'directory' ? 'fm-item-dir' : 'fm-item-file'
              } ${currentFilePath === item.path ? 'fm-item-active' : ''}`}
              onClick={() => renamingPath !== item.path && handleOpen(item)}
              title={item.path}
            >
              <span className="fm-item-icon">
                {item.type === 'directory' ? <IconFolder /> : <IconFile />}
              </span>

              {renamingPath === item.path ? (
                <input
                  ref={renameInputRef}
                  className="fm-rename-input"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(item)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename(item);
                    if (e.key === 'Escape') setRenamingPath(null);
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="fm-item-name">{item.name}</span>
                  <div className="fm-item-meta">
                    {item.type === 'file' && (
                      <>
                        <span className="fm-item-size">{formatSize(item.size)}</span>
                        {ext && (
                          <span className={`fm-item-badge ${isFlow ? 'fm-item-badge-flow' : ''}`}>
                            {ext}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              <div className="fm-item-actions">
                <button
                  className="fm-action-btn"
                  onClick={(e) => startRename(item, e)}
                  title="Rename"
                >
                  <IconPencil />
                </button>
                <button
                  className="fm-action-btn fm-action-delete"
                  onClick={(e) => handleDelete(item, e)}
                  title="Delete"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileManager;
