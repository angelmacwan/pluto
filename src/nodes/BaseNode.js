import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './node.css';

/**
 * BaseNode - shared wrapper for all pipeline nodes.
 * Handles the common layout: left input handle, header, body, right output handle.
 *
 * Props:
 *   title       {string}  - Node header label
 *   typeClass   {string}  - CSS class for the node color theme (e.g. 'node-type-model')
 *   hasInput    {boolean} - Whether to render a target (left) handle  [default: true]
 *   hasOutput   {boolean} - Whether to render a source (right) handle [default: true]
 *   children    {node}    - Node body content
 */
const BaseNode = memo(({ title, typeClass, hasInput = true, hasOutput = true, children }) => (
  <div className={`customNode ${typeClass}`}>
    {hasInput && <Handle type="target" position={Position.Left} />}
    <div className="node-header">{title}</div>
    <div className="node-body">{children}</div>
    {hasOutput && <Handle type="source" position={Position.Right} />}
  </div>
));

export default BaseNode;
