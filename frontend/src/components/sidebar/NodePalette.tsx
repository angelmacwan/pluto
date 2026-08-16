import React, { useState } from 'react';
import { nodeRegistry } from '../../lib/nodeRegistry';
import * as LucideIcons from 'lucide-react';
import { CustomNodeModal } from './CustomNodeModal';
import { useAppStore } from '../../store/appStore';
import { Plus } from 'lucide-react';

export function NodePalette() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentProjectId, projects } = useAppStore();

  const currentProject = projects.find(p => p.id === currentProjectId);
  const customNodes = currentProject?.customNodes || [];

  const onDragStart = (event: React.DragEvent, nodeType: string, isCustom = false) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (isCustom) {
      event.dataTransfer.setData('application/pluto-custom', 'true');
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(
    new Set(Object.values(nodeRegistry).map((n) => n.category))
  );

  return (
    <div className="node-palette">
      <div className="node-palette-search-wrap">
        <button
          onClick={() => setIsModalOpen(true)}
          className="node-palette-create-btn"
        >
          <span className="node-palette-create-icon"><Plus size={16} /></span>
          <span>Create Custom Node</span>
        </button>
        <input
          type="text"
          placeholder="Search nodes…"
          className="node-palette-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="node-palette-body">
        {customNodes.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <p className="node-palette-category-label" style={{ color: 'var(--primary)' }}>Custom Nodes</p>
            {customNodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase())).map((n) => (
              <div
                key={n.id}
                className="node-palette-item"
                style={{ 
                  background: 'var(--primary-fixed)',
                  border: '1px solid var(--primary-fixed-dim)',
                  color: 'var(--primary)',
                  marginBottom: '0.35rem'
                }}
                onDragStart={(e) => onDragStart(e, n.id, true)}
                draggable
              >
                <LucideIcons.Code2 size={15} className="node-palette-icon" style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>{n.label}</span>
              </div>
            ))}
          </div>
        )}

        {categories.map((cat) => {
          const nodes = Object.values(nodeRegistry).filter(
            (n) =>
              n.category === cat &&
              n.label.toLowerCase().includes(search.toLowerCase()) &&
              n.type !== 'custom_python' // Hide the old custom_python node
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

      {isModalOpen && <CustomNodeModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
