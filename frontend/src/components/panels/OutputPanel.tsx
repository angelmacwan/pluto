
import { useAppStore } from '../../store/appStore';
import { X, Trash2 } from 'lucide-react';

export function OutputPanel() {
  const { isOutputPanelOpen, toggleOutputPanel, consoleOutput, clearConsole } = useAppStore();

  if (!isOutputPanelOpen) return null;

  return (
    <div className="h-[250px] w-full bg-gray-950 border-t border-gray-800 flex flex-col absolute bottom-0 left-0 z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
        <div className="flex gap-4">
          <button className="text-sm font-medium text-gray-300 border-b-2 border-blue-500 pb-1">Console</button>
        </div>
        <div className="flex gap-2">
          <button onClick={clearConsole} className="p-1 text-gray-400 hover:text-white rounded"><Trash2 size={16} /></button>
          <button onClick={toggleOutputPanel} className="p-1 text-gray-400 hover:text-white rounded"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-300 space-y-1">
        {consoleOutput.length === 0 ? (
          <span className="text-gray-600 italic">No output yet...</span>
        ) : (
          consoleOutput.map((line, i) => (
            <div key={i} className={line.toLowerCase().includes('error') ? 'text-red-400' : ''}>{line}</div>
          ))
        )}
      </div>
    </div>
  );
}
