import { Handle, Position } from '@xyflow/react';
import type { PlutoNodeData } from '../../types';
import * as LucideIcons from 'lucide-react';
import { useGraphStore } from '../../store/graphStore';

export function BaseNode({ id, data }: { id: string; data: PlutoNodeData }) {
  const updateNodeConfig = useGraphStore(s => s.updateNodeConfig);
  const iconName = (data.icon as string) || 'Code';
  const Icon = (LucideIcons as Record<string, any>)[iconName] || LucideIcons.Code;
  
  const categoryColorMap: Record<string, string> = {
    primitive: 'var(--category-primitive)',
    data: 'var(--category-data)',
    ml: 'var(--category-ml)',
    dl: 'var(--category-dl)',
    agent: 'var(--category-agent)',
    eval: 'var(--category-eval)',
    math: 'var(--category-math)',
  };

  const catStr = String(data.category);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg min-w-[200px] shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      <div 
        className="px-3 py-2 border-b border-gray-700 flex items-center gap-2"
        style={{ borderLeft: `4px solid ${categoryColorMap[catStr] || '#fff'}` }}
      >
        <Icon size={16} className="text-gray-400" />
        <span className="font-semibold text-sm flex-1">{data.label as string}</span>
        {data.status === 'running' && <LucideIcons.Loader2 size={14} className="animate-spin text-blue-400" />}
        {data.status === 'done' && <LucideIcons.Check size={14} className="text-green-400" />}
        {data.status === 'error' && <LucideIcons.X size={14} className="text-red-400" />}
      </div>
      
      <div className="p-3 space-y-3">
        {data.configSchema?.map(field => (
          <div key={field.key} className="flex flex-col gap-1 nodrag cursor-auto">
            <label className="text-xs text-gray-400">{field.label}</label>
            {field.type === 'string' && (
              <input 
                type="text" 
                value={(data.config[field.key] as string) || ''}
                onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                className="bg-gray-800 text-sm border border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500"
              />
            )}
            {field.type === 'select' && (
              <select 
                value={(data.config[field.key] as string) || ''}
                onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                className="bg-gray-800 text-sm border border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500"
              >
                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {field.type === 'textarea' && (
              <textarea 
                value={(data.config[field.key] as string) || ''}
                onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                className="bg-gray-800 text-sm border border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500 min-h-[60px]"
              />
            )}
          </div>
        ))}
      </div>

      {data.inputs?.map((input, idx) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{ top: `${(idx + 1) * 30 + 50}px`, background: `var(--handle-${input.type})` }}
          className="w-3 h-3 border-2 border-gray-900"
        />
      ))}
      
      {data.outputs?.map((output, idx) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{ top: `${(idx + 1) * 30 + 50}px`, background: `var(--handle-${output.type})` }}
          className="w-3 h-3 border-2 border-gray-900"
        />
      ))}
    </div>
  );
}
