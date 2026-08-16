import { create } from 'zustand';
import type { PlutoNode, PlutoEdge, NodeStatus, GraphState, PlutoNodeData } from '../types';
import type { Connection } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { produce } from 'immer';
import { nodeRegistry } from '../lib/nodeRegistry';
import { useAppStore } from './appStore';

interface GraphStore {
  nodes: PlutoNode[];
  edges: PlutoEdge[];
  selectedNodes: string[];
  copiedNodes: PlutoNode[];
  history: { nodes: PlutoNode[], edges: PlutoEdge[] }[];
  historyIndex: number;
  setNodes: (nodes: PlutoNode[] | ((nodes: PlutoNode[]) => PlutoNode[])) => void;
  setEdges: (edges: PlutoEdge[] | ((edges: PlutoEdge[]) => PlutoEdge[])) => void;
  addNode: (type: string, position: {x: number, y: number}) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<PlutoNodeData>) => void;
  updateNodeConfig: (id: string, config: Partial<Record<string,any>>) => void;
  addEdge: (edge: Connection | PlutoEdge) => void;
  removeEdge: (id: string) => void;
  copyNodes: (nodes: PlutoNode[]) => void;
  pasteNodes: () => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  clearGraph: () => void;
  loadGraph: (state: GraphState) => void;
  toGraphState: () => GraphState;
  nodeStatuses: Record<string, NodeStatus>;
  setNodeStatus: (id: string, status: NodeStatus) => void;
  clearStatuses: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  copiedNodes: [],
  history: [],
  historyIndex: -1,
  
  setNodes: (updater) => {
    set(produce((state) => {
      state.nodes = typeof updater === 'function' ? updater(state.nodes) : updater;
    }));
  },
  
  setEdges: (updater) => {
    set(produce((state) => {
      state.edges = typeof updater === 'function' ? updater(state.edges) : updater;
    }));
  },
  
  addNode: (type, position) => {
    let def = nodeRegistry[type];
    
    // Check if it's a custom node
    if (!def && type.startsWith('custom_')) {
      const { projects, currentProjectId } = useAppStore.getState();
      const currentProject = projects.find(p => p.id === currentProjectId);
      const customNode = currentProject?.customNodes?.find(n => n.id === type);
      
      if (customNode) {
        def = {
          type: customNode.id,
          label: customNode.label,
          category: 'primitive',
          description: customNode.description,
          icon: 'Code2',
          inputs: [{ id: 'flow_in', label: '', type: 'flow', optional: true }, ...customNode.inputs],
          outputs: [customNode.output],
          configSchema: [],
          defaultConfig: {},
          generateCode: () => '', // Handled specially in codegen.ts
          imports: [],
          pipPackages: []
        };
      }
    }

    if (!def) return;
    
    const newNode: PlutoNode = {
      id: nanoid(),
      type,
      position,
      data: {
        label: def.label,
        category: def.category,
        description: def.description,
        status: 'idle',
        inputs: def.inputs,
        outputs: def.outputs,
        config: { ...def.defaultConfig },
        configSchema: def.configSchema
      }
    };
    
    set(produce((state) => {
      state.nodes.push(newNode);
    }));
    get().saveHistory();
  },
  
  removeNode: (id) => {
    set(produce((state) => {
      state.nodes = state.nodes.filter((n: PlutoNode) => n.id !== id);
      state.edges = state.edges.filter((e: PlutoEdge) => e.source !== id && e.target !== id);
    }));
    get().saveHistory();
  },
  
  updateNodeData: (id, data) => {
    set(produce((state) => {
      const node = state.nodes.find((n: PlutoNode) => n.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    }));
  },
  
  updateNodeConfig: (id, config) => {
    set(produce((state) => {
      const node = state.nodes.find((n: PlutoNode) => n.id === id);
      if (node) {
        node.data.config = { ...node.data.config, ...config };
      }
    }));
    get().saveHistory();
  },
  
  addEdge: (edge) => {
    const source = get().nodes.find(node => node.id === edge.source);
    const target = get().nodes.find(node => node.id === edge.target);
    const sourceDef = source && nodeRegistry[source.type || ''];
    const targetDef = target && nodeRegistry[target.type || ''];
    const sourceHandle = edge.sourceHandle || sourceDef?.outputs[0]?.id;
    const targetHandle = edge.targetHandle || targetDef?.inputs[0]?.id;
    const output = sourceDef?.outputs.find(handle => handle.id === sourceHandle);
    const input = targetDef?.inputs.find(handle => handle.id === targetHandle);

    if (!source || !target || !output || !input) return;
    if (output.type !== 'any' && input.type !== 'any' && output.type !== input.type) return;
    if (get().edges.some(existing => existing.target === target.id && existing.targetHandle === targetHandle)) return;

    const newEdge: PlutoEdge = {
      id: nanoid(),
      source: edge.source!,
      target: edge.target!,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    };
    set(produce((state) => {
      state.edges.push(newEdge);
    }));
    get().saveHistory();
  },
  
  removeEdge: (id) => {
    set(produce((state) => {
      state.edges = state.edges.filter((e: PlutoEdge) => e.id !== id);
    }));
    get().saveHistory();
  },

  copyNodes: (nodes) => {
    set({ copiedNodes: JSON.parse(JSON.stringify(nodes)) });
  },

  pasteNodes: () => {
    const copied = get().copiedNodes;
    if (!copied || copied.length === 0) return;
    set(produce((state) => {
      const newNodes = copied.map((n: PlutoNode) => ({
        ...n,
        id: nanoid(),
        position: { x: n.position.x + 50, y: n.position.y + 50 },
        selected: true
      }));
      state.nodes.forEach((n: PlutoNode) => { n.selected = false; });
      state.nodes.push(...newNodes);
      // We could also duplicate internal edges between copied nodes but omitting for brevity
    }));
    get().saveHistory();
  },
  
  saveHistory: () => {
    set(produce((state) => {
      const current = { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)) };
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(current);
      state.historyIndex = state.history.length - 1;
    }));
  },
  
  undo: () => {
    set(produce((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const hist = state.history[state.historyIndex];
        state.nodes = hist.nodes;
        state.edges = hist.edges;
      }
    }));
  },
  
  redo: () => {
    set(produce((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const hist = state.history[state.historyIndex];
        state.nodes = hist.nodes;
        state.edges = hist.edges;
      }
    }));
  },
  
  clearGraph: () => {
    set({ nodes: [], edges: [], history: [], historyIndex: -1 });
  },
  
  loadGraph: (stateObj) => {
    const hydratedNodes = stateObj.nodes.map(node => {
      const def = nodeRegistry[node.type || ''];
      if (!def) return node;
      return {
        ...node,
        data: {
          ...node.data,
          category: def.category,
          description: def.description,
          inputs: def.inputs,
          outputs: def.outputs,
          configSchema: def.configSchema,
          config: { ...def.defaultConfig, ...node.data.config },
        },
      };
    });
    const hydratedEdges = stateObj.edges
      .filter(edge => edge.sourceHandle !== 'flow_out')
      .map(edge => {
      const source = hydratedNodes.find(node => node.id === edge.source);
      // Earlier versions exposed If branches as data ports. Preserve existing
      // graphs by turning those connections into their equivalent flow path.
      if (
        source?.type === 'if_condition' &&
        (edge.sourceHandle === 'true_branch' || edge.sourceHandle === 'false_branch') &&
        edge.targetHandle !== 'flow_in'
      ) {
        return { ...edge, targetHandle: 'flow_in' };
      }
        return edge;
      });
    set({ nodes: hydratedNodes, edges: hydratedEdges, history: [], historyIndex: -1 });
    get().saveHistory();
  },
  
  toGraphState: () => {
    return {
      nodes: get().nodes,
      edges: get().edges,
      name: '',
      description: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  },
  
  nodeStatuses: {},
  setNodeStatus: (id, status) => {
    set(produce((state) => {
      state.nodeStatuses[id] = status;
    }));
  },
  clearStatuses: () => {
    set({ nodeStatuses: {} });
  }
}));
