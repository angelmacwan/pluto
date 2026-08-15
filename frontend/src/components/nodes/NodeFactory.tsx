import { nodeRegistry } from '../../lib/nodeRegistry';
import { BaseNode } from './BaseNode';

export const nodeTypes = Object.keys(nodeRegistry).reduce((acc, key) => {
  acc[key] = BaseNode;
  return acc;
}, {} as Record<string, any>);
