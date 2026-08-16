
import { useAppStore } from '../../store/appStore';
import { useGraphStore } from '../../store/graphStore';
import { useProjectStore } from '../../store/projectStore';
import { useToastStore } from './Toast';
import { signOut } from '../auth/AuthProvider';
import { Play, Save, Code, TerminalSquare, ArrowLeft } from 'lucide-react';
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

  // Close on any click outside the avatar wrapper
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
      <div className="topbar-brand">
        {showBack && (
          <button
            className="topbar-back-btn"
            title="Back to Pipelines"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <img src="/logo.png" alt="Pluto" className="topbar-logo" />
        <span className="topbar-brand-name">Pluto</span>
      </div>

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
            <img
              src={user.photoURL ?? `https://ui-avatars.com/api/?name=${user.email}`}
              alt="Avatar"
              className="topbar-avatar"
              onClick={() => setMenuOpen((o) => !o)}
            />
            {menuOpen && (
              <div className="topbar-avatar-menu">
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
