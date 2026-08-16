import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { Plus, GitBranch, MoreVertical, Trash2 } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';
import { useToastStore } from '../components/ui/Toast';

export function ProjectsPage() {
  const { projects, user } = useAppStore();
  const { loadUserProjects, createProject, deleteProject } = useProjectStore();
  const navigate = useNavigate();
  const addToast = useToastStore(s => s.addToast);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadUserProjects(user.uid);
  }, [user, loadUserProjects]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const handleCreate = async () => {
    if (!user) return;
    const p = await createProject(
      'New Pipeline',
      {
        nodes: [],
        edges: [],
        name: 'New Pipeline',
        description: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      user.uid
    );
    navigate(`/editor/${p.id}`);
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!user || !window.confirm(`Delete “${projectName}”? This cannot be undone.`)) return;

    try {
      await deleteProject(projectId, user.uid);
      setOpenMenuId(null);
      addToast({ type: 'success', message: `Deleted “${projectName}”.` });
    } catch {
      addToast({ type: 'error', message: `Could not delete “${projectName}”. Please try again.` });
    }
  };

  return (
    <div className="projects-page">
      <TopBar />
      <div className="projects-content">
        <div className="projects-header">
          <h1 className="projects-heading">My Pipelines</h1>
          <button className="projects-new-btn" onClick={handleCreate}>
            <Plus size={16} />
            New Pipeline
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="projects-empty">
            <GitBranch size={44} className="projects-empty-icon" />
            <h3>No pipelines yet</h3>
            <p>Create one to get started.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p) => (
              <div
                key={p.id}
                className="project-card"
                onClick={() => navigate(`/editor/${p.id}`)}
              >
                <div className="project-card-header">
                  <p className="project-card-name">{p.name}</p>
                  <div className="project-card-menu" ref={openMenuId === p.id ? menuRef : undefined}>
                    <button
                      className="project-card-menu-trigger"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId(openMenuId === p.id ? null : p.id);
                      }}
                      aria-label={`Open actions for ${p.name}`}
                      aria-expanded={openMenuId === p.id}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === p.id && (
                      <div className="project-card-menu-dropdown" role="menu">
                        <button
                          className="project-card-menu-delete"
                          role="menuitem"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(p.id, p.name);
                          }}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="project-card-meta">
                  Last updated{' '}
                  {new Date(p.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
