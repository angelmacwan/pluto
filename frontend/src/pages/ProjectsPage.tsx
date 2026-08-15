import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';
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
    const p = await createProject('New Project', { nodes: [], edges: [], name: 'New Project', description: '', createdAt: Date.now(), updatedAt: Date.now() }, user.uid);
    navigate(`/editor/${p.id}`);
  };

  return (
    <div className="h-screen w-screen bg-[#0d0f13] flex flex-col text-gray-200">
      <TopBar />
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            <Plus size={18} /> New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
            <Folder size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No projects yet.</p>
            <p className="text-sm">Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div 
                key={p.id} 
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition cursor-pointer group"
                onClick={() => navigate(`/editor/${p.id}`)}
              >
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-4">Last updated {new Date(p.updatedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
