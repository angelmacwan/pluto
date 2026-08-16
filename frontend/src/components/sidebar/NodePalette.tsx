import React, { useState } from 'react';
import { nodeRegistry } from '../../lib/nodeRegistry';
import * as LucideIcons from 'lucide-react';

export function NodePalette() {
  const [search, setSearch] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(
    new Set(Object.values(nodeRegistry).map((n) => n.category))
  );

  return (
    <div className="node-palette">
      <div className="node-palette-search-wrap">
        <input
          type="text"
          placeholder="Search nodes…"
          className="node-palette-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="node-palette-body">
        {categories.map((cat) => {
          const nodes = Object.values(nodeRegistry).filter(
            (n) =>
              n.category === cat &&
              n.label.toLowerCase().includes(search.toLowerCase())
          );
          if (nodes.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '0.75rem' }}>
              <p className="node-palette-category-label">{cat}</p>
              {nodes.map((n) => {
                const Icon =
                  (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
                    n.icon ?? 'Code'
                  ] ?? LucideIcons.Code;
                return (
                  <div
                    key={n.type}
                    className="node-palette-item"
                    onDragStart={(e) => onDragStart(e, n.type)}
                    draggable
                  >
                    <Icon size={15} className="node-palette-icon" />
                    <span>{n.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
