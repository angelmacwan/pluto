import { useAppStore } from '../../store/appStore';
import { useGraphStore } from '../../store/graphStore';
import { useProjectStore } from '../../store/projectStore';
import { useToastStore } from './Toast';
import { signOut } from '../auth/AuthProvider';
import { Play, Save, Code, TerminalSquare, ArrowLeft, Pencil, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

interface TopBarProps {
  showBack?: boolean;
}

export function TopBar({ showBack = false }: TopBarProps) {
  const { user, currentProjectId, projects } = useAppStore();
  const { bridgeConnected, isRunning, toggleCodePanel, toggleOutputPanel, isCodePanelOpen, isOutputPanelOpen } = useAppStore();
  const { toGraphState } = useGraphStore();
  const { saveProject } = useProjectStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // ── Project name editing ──────────────────────────────────────────────────
  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null;
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync when the project changes (e.g. navigating to a different project)
  useEffect(() => {
    setIsEditingName(false);
    setDraftName(currentProject?.name ?? '');
  }, [currentProjectId, currentProject?.name]);

  const startEditing = () => {
    setDraftName(currentProject?.name ?? '');
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.select();
    }, 0);
  };

  const commitName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || !user || !currentProject) {
      cancelEditing();
      return;
    }
    if (trimmed === currentProject.name) {
      setIsEditingName(false);
      return;
    }
    setIsEditingName(false);
    try {
      await saveProject({ ...currentProject, name: trimmed, updatedAt: Date.now() });
    } catch {
      addToast({ message: 'Failed to rename project', type: 'error' });
    }
  };

  const cancelEditing = () => {
    setIsEditingName(false);
    setDraftName(currentProject?.name ?? '');
  };

  // ── Graph save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !currentProjectId) return;
    const currentProj = projects.find((p) => p.id === currentProjectId);
    if (!currentProj) return;

    setIsSaving(true);
    try {
      const updatedGraphState = toGraphState();
      await saveProject({
        ...currentProj,
        graphState: updatedGraphState,
        updatedAt: Date.now(),
      });
      addToast({ message: 'Pipeline saved successfully', type: 'success' });
    } catch (err: any) {
      addToast({ message: `Save failed: ${err.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Close avatar menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="topbar">
      {/* ── Left: brand + back ─────────────────────────────────────────────── */}
      <div className="topbar-brand">
        {showBack && (
          <button
            className="topbar-back-btn"
            title="Back to Pipelines"
            onClick={() => navigate('/app')}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <img src="/logo.png" alt="Pluto" className="topbar-logo" />
        <span className="topbar-brand-name">Pluto</span>
      </div>

      {/* ── Centre: editable project name (editor only) ─────────────────── */}
      {showBack && currentProject && (
        <div className="topbar-project-name-wrap">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              className="topbar-project-name-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitName(); }
                if (e.key === 'Escape') cancelEditing();
              }}
              maxLength={64}
              aria-label="Project name"
              spellCheck={false}
            />
          ) : (
            <button
              className="topbar-project-name-btn"
              onClick={startEditing}
              title="Click to rename project"
            >
              <span className="topbar-project-name-text">{currentProject.name}</span>
              <Pencil size={11} className="topbar-project-name-icon" />
            </button>
          )}
        </div>
      )}

      {/* ── Right: actions ──────────────────────────────────────────────── */}
      <div className="topbar-actions">
        {showBack && (
          <>
            <button
              className={`topbar-icon-btn${isCodePanelOpen ? ' active' : ''}`}
              title="Toggle Code Panel"
              onClick={toggleCodePanel}
            >
              <Code size={17} />
            </button>
            <button
              className={`topbar-icon-btn${isOutputPanelOpen ? ' active' : ''}`}
              title="Toggle Output Panel"
              onClick={toggleOutputPanel}
            >
              <TerminalSquare size={17} />
            </button>

            <div className="topbar-divider" />

            <div className="topbar-status" title="Bridge Status">
              <span className={`topbar-status-dot ${bridgeConnected ? 'connected' : 'disconnected'}`} />
              {bridgeConnected ? 'Connected' : 'Disconnected'}
            </div>

            <button className="topbar-run-btn">
              <Play size={13} className={isRunning ? 'animate-pulse' : ''} />
              {isRunning ? 'Running…' : 'Run'}
            </button>

            <button
              className="topbar-save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={13} />
              {isSaving ? 'Saving…' : 'Save'}
            </button>

            <div className="topbar-divider" />
          </>
        )}

        {user && (
          <div className="topbar-avatar-wrap" ref={avatarRef}>
            <button
              className="topbar-avatar-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
              title={user.email ?? 'Account'}
            >
              <User size={18} />
            </button>
            {menuOpen && (
              <div className="topbar-avatar-menu">
                {user.email && (
                  <p className="topbar-avatar-email">{user.email}</p>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
