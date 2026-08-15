
import { useAppStore } from '../../store/appStore';
import { signOut } from '../auth/AuthProvider';
import { Play, Save, Activity, Code, TerminalSquare } from 'lucide-react';

export function TopBar() {
  const { user } = useAppStore();
  const { bridgeConnected, isRunning, toggleCodePanel, toggleOutputPanel } = useAppStore();

  return (
    <div className="h-[52px] bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 text-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          P
        </div>
        <span className="font-semibold tracking-wide">Pluto</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition" title="Toggle Code" onClick={toggleCodePanel}>
          <Code size={18} />
        </button>
        <button className="text-gray-400 hover:text-white transition" title="Toggle Output" onClick={toggleOutputPanel}>
          <TerminalSquare size={18} />
        </button>
        <div className="h-4 w-px bg-gray-700 mx-1" />
        
        <div className="flex items-center gap-2 text-xs" title="Bridge Status">
          <Activity size={14} className={bridgeConnected ? 'text-green-500' : 'text-red-500'} />
          <span className="text-gray-400">{bridgeConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition shadow-lg shadow-blue-900/20">
          <Play size={14} className={isRunning ? 'animate-pulse' : ''} />
          {isRunning ? 'Running...' : 'Run'}
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition border border-gray-700">
          <Save size={14} />
          Save
        </button>

        <div className="h-4 w-px bg-gray-700 mx-1" />

        {user && (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-700" />
            <div className="absolute right-0 top-10 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-xl py-1 hidden group-hover:block z-50">
               <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700">Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
