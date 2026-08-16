import { Handle, Position } from '@xyflow/react';
import type { PlutoNodeData } from '../../types';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import { useGraphStore } from '../../store/graphStore';

const categoryColorMap: Record<string, string> = {
  primitive: 'var(--category-primitive)',
  data:      'var(--category-data)',
  ml:        'var(--category-ml)',
  dl:        'var(--category-dl)',
  agent:     'var(--category-agent)',
  eval:      'var(--category-eval)',
  math:      'var(--category-math)',
};

const categoryLabelMap: Record<string, string> = {
  primitive: 'Primitive',
  data:      'Data',
  ml:        'ML',
  dl:        'Deep Learning',
  agent:     'Agent',
  eval:      'Eval',
  math:      'Math',
};

export function BaseNode({ id, data }: { id: string; data: PlutoNodeData }) {
  const updateNodeConfig = useGraphStore(s => s.updateNodeConfig);
  const removeNode       = useGraphStore(s => s.removeNode);

  const iconName = (data.icon as string) || 'Code';
  const Icon = (LucideIcons as Record<string, any>)[iconName] || LucideIcons.Code;

  const catStr       = String(data.category);
  const accentColor  = categoryColorMap[catStr] ?? '#94a3b8';
  const categoryLabel = categoryLabelMap[catStr] ?? catStr;

  const hasInputs  = (data.inputs?.length  ?? 0) > 0;
  const hasOutputs = (data.outputs?.length ?? 0) > 0;

  return (
    <div className="pluto-node">
      {/* Header */}
      <div className="pluto-node__header" style={{ background: accentColor }}>
        <div
          className="pluto-node__icon-wrap"
          style={{
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.18)',
          }}
        >
          <Icon size={13} />
        </div>
        <div className="pluto-node__title-group">
          <span className="pluto-node__label">{data.label as string}</span>
          <span className="pluto-node__category">{categoryLabel}</span>
        </div>
        <div className="pluto-node__status-wrap">
          {data.status === 'running' && (
            <LucideIcons.Loader2 size={12} className="pluto-node__status-icon pluto-node__status--running" />
          )}
          {data.status === 'done' && (
            <LucideIcons.Check size={12} className="pluto-node__status-icon pluto-node__status--done" />
          )}
          {data.status === 'error' && (
            <LucideIcons.AlertCircle size={12} className="pluto-node__status-icon pluto-node__status--error" />
          )}
          <button
            className="pluto-node__delete-btn nodrag"
            onClick={() => removeNode(id)}
            title="Delete node"
            aria-label="Delete node"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Port rows — handles are positioned relative to each row (auto-centered by React Flow) */}
      {(hasInputs || hasOutputs) && (
        <div className="pluto-node__ports">
          <div className="pluto-node__port-col pluto-node__port-col--left">
            {data.inputs?.map(input => (
              <div key={input.id} className="pluto-node__port-row">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.id}
                  className="pluto-node__handle"
                  style={{ background: `var(--handle-${input.type}, var(--handle-any))` }}
                />
                <span className="pluto-node__port-label pluto-node__port-label--left" title={input.label}>
                  {input.label}
                  {input.optional && <span className="pluto-node__port-optional">?</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="pluto-node__port-col pluto-node__port-col--right">
            {data.outputs?.map(output => (
              <div key={output.id} className="pluto-node__port-row pluto-node__port-row--right">
                <span className="pluto-node__port-label pluto-node__port-label--right" title={output.label}>
                  {output.label}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.id}
                  className="pluto-node__handle"
                  style={{ background: `var(--handle-${output.type}, var(--handle-any))` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config fields */}
      {(data.configSchema?.length ?? 0) > 0 && (
        <div className="pluto-node__config nodrag">
          {data.configSchema.map(field => (
            <div key={field.key} className="pluto-node__field">
              <label className="pluto-node__field-label">{field.label}</label>

              {field.type === 'string' && (
                <input
                  type="text"
                  value={(data.config[field.key] as string) ?? ''}
                  onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                  className="pluto-node__input"
                />
              )}
              {field.type === 'number' && (
                <input
                  type="number"
                  value={(data.config[field.key] as string) ?? ''}
                  onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                  className="pluto-node__input"
                />
              )}
              {field.type === 'select' && (
                <select
                  value={(data.config[field.key] as string) ?? ''}
                  onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                  className="pluto-node__select"
                >
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {field.type === 'textarea' && (
                <textarea
                  value={(data.config[field.key] as string) ?? ''}
                  onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                  className="pluto-node__textarea"
                  rows={3}
                />
              )}
              {field.type === 'bool' && (
                <label className="pluto-node__toggle">
                  <input
                    type="checkbox"
                    checked={data.config[field.key] === true || data.config[field.key] === 'true'}
                    onChange={e => updateNodeConfig(id, { [field.key]: e.target.checked })}
                    className="pluto-node__toggle-input"
                  />
                  <span className="pluto-node__toggle-track">
                    <span className="pluto-node__toggle-thumb" />
                  </span>
                </label>
              )}
              {field.type === 'code' && (
                <textarea
                  value={(data.config[field.key] as string) ?? ''}
                  onChange={e => updateNodeConfig(id, { [field.key]: e.target.value })}
                  className="pluto-node__textarea font-mono"
                  rows={7}
                  spellCheck={false}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
