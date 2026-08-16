import type { Node, Edge } from '@xyflow/react';

export type NodeCategory = 'primitive' | 'data' | 'ml' | 'dl' | 'agent' | 'eval' | 'math';

export type HandleType = 'flow' | 'any' | 'dataframe' | 'model' | 'string' | 'number' | 'bool' | 'list' | 'dict' | 'image' | 'tensor';

export type NodeStatus = 'idle' | 'running' | 'done' | 'error';

export interface HandleDef {
  id: string;
  label: string;
  type: HandleType;
  optional?: boolean;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'bool' | 'select' | 'textarea' | 'code';
  options?: string[];
  default?: any;
}

export interface PlutoNodeData extends Record<string, unknown> {
  label: string;
  category: NodeCategory;
  description: string;
  status: NodeStatus;
  inputs: HandleDef[];
  outputs: HandleDef[];
  config: Record<string, any>;
  configSchema: ConfigField[];
}

export type PlutoNode = Node<PlutoNodeData>;
export type PlutoEdge = Edge;

export interface GraphState {
  nodes: PlutoNode[];
  edges: PlutoEdge[];
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  graphState: GraphState;
  createdAt: number;
  updatedAt: number;
  userId: string;
}
