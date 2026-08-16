import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { Plus, GitBranch } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';

export function ProjectsPage() {
  const { projects, user } = useAppStore();
  const { loadUserProjects, createProject } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadUserProjects(user.uid);
  }, [user, loadUserProjects]);

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
                <p className="project-card-name">{p.name}</p>
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
