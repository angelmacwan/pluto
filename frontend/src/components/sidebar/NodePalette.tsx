import React, { useState } from 'react';
import { nodeRegistry } from '../../lib/nodeRegistry';
import * as LucideIcons from 'lucide-react';

export function NodePalette() {
  const [search, setSearch] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(new Set(Object.values(nodeRegistry).map(n => n.category)));

  return (
    <div className="w-[260px] h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <input 
          type="text" 
          placeholder="Search nodes..." 
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-200"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map(cat => {
          const nodes = Object.values(nodeRegistry).filter(n => n.category === cat && n.label.toLowerCase().includes(search.toLowerCase()));
          if (nodes.length === 0) return null;
          return (
            <div key={cat} className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">{cat}</h3>
              <div className="space-y-1">
                {nodes.map(n => {
                  const Icon = (LucideIcons as any)[n.icon || 'Code'] || LucideIcons.Code;
                  return (
                    <div 
                      key={n.type}
                      className="flex items-center gap-2 p-2 rounded cursor-grab hover:bg-gray-800 transition text-sm text-gray-300"
                      onDragStart={(e) => onDragStart(e, n.type)}
                      draggable
                    >
                      <Icon size={16} className="text-gray-400" />
                      <span>{n.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
