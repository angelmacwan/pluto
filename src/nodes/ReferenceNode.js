import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { referenceDefinitions } from './referenceDefinitions';
import './node.css';

const ReferenceNode = memo(({ id, data, nodeKind }) => {
  const definition = referenceDefinitions[nodeKind];
  const config = data.config || {};

  useEffect(() => {
    if (!data.config) {
      const initialConfig = definition.fields.reduce((result, field) => ({ ...result, [field.key]: field.default }), {});
      data.updateNodeState?.({ config: initialConfig });
    }
  }, [data, definition]);

  const updateConfig = (key, value) => data.updateNodeState?.({ config: { ...config, [key]: value } });

  return (
    <div className={`customNode ${definition.typeClass} reference-node`}>
      {definition.inputs.map(input => <Handle key={input.id} id={input.id} type="target" position={Position.Left} style={{ top: `${40 + definition.inputs.indexOf(input) * 24}px` }} />)}
      <div className="node-header">
        {definition.title}
        <button className="node-delete-button nodrag" onClick={(event) => { event.stopPropagation(); data.removeNode?.(id); }} aria-label="Delete node" title="Delete node">×</button>
      </div>
      <div className="node-body">
        {definition.inputs.map(input => <div className="node-port-label node-port-label-left" key={input.id}>{input.label}{input.optional ? ' (optional)' : ''}</div>)}
        {definition.fields.map(field => <div className="input-group" key={field.key}>
          <label>{field.label}
            {field.type === 'select' ? <select value={config[field.key] ?? field.default} onChange={event => updateConfig(field.key, event.target.value)}>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select> : field.type === 'textarea' ? <textarea rows="3" value={config[field.key] ?? field.default} onChange={event => updateConfig(field.key, event.target.value)} /> : <input type="text" value={config[field.key] ?? field.default} onChange={event => updateConfig(field.key, event.target.value)} />}
          </label>
        </div>)}
        {definition.outputs.map(output => <div className="node-port-label node-port-label-right" key={output.id}>{output.label}</div>)}
      </div>
      {definition.outputs.map(output => <Handle key={output.id} id={output.id} type="source" position={Position.Right} style={{ top: `${40 + definition.outputs.indexOf(output) * 24}px` }} />)}
    </div>
  );
});

export default ReferenceNode;
