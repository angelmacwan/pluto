
import { useAppStore } from '../../store/appStore';
import { signOut } from '../auth/AuthProvider';
import { Play, Save, Code, TerminalSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

interface TopBarProps {
  showBack?: boolean;
}

export function TopBar({ showBack = false }: TopBarProps) {
  const { user } = useAppStore();
  const { bridgeConnected, isRunning, toggleCodePanel, toggleOutputPanel, isCodePanelOpen, isOutputPanelOpen } = useAppStore();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

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

            <button className="topbar-save-btn">
              <Save size={13} />
              Save
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
