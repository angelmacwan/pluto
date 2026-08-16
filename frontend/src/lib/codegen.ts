import type { PlutoNode, PlutoEdge } from '../types';
import { nodeRegistry } from './nodeRegistry';

export function topologicalSort(nodes: PlutoNode[], edges: PlutoEdge[]): PlutoNode[] | null {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  
  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
  });
  
  edges.forEach(e => {
    if (isFlowEdge(e, nodes)) return;
    if (!adjList[e.source] || !adjList[e.target]) return;
    adjList[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });
  
  const queue: PlutoNode[] = [];
  nodes.forEach(n => {
    if (inDegree[n.id] === 0) queue.push(n);
  });
  
  const sorted: PlutoNode[] = [];
  while(queue.length > 0) {
    const n = queue.shift()!;
    sorted.push(n);
    adjList[n.id].forEach(neighbor => {
      inDegree[neighbor]--;
      if(inDegree[neighbor] === 0) {
        queue.push(nodes.find(node => node.id === neighbor)!);
      }
    });
  }
  
  if (sorted.length !== nodes.length) return null; // Cycle detected
  return sorted;
}

export function generateVariableName(node: PlutoNode, index: number): string {
  if (node.type === 'variable') {
    const name = String(node.data.config.name || '').trim();
    if (name) return name;
  }
  const base = (node.type || 'node').replace(/[^a-zA-Z0-9]/g, '_');
  return `${base}_${index}`;
}

export function generateCode(nodes: PlutoNode[], edges: PlutoEdge[]): { code: string, requirements: string[], error: string | null } {
  const validationError = validateGraph(nodes, edges);
  if (validationError) return { code: '', requirements: [], error: validationError };

  const sorted = topologicalSort(nodes, edges);
  if (!sorted) return { code: '', requirements: [], error: 'Cycle detected in graph' };
  
  let code = '';
  const imports = new Set<string>();
  const pipPackages = new Set<string>();
  
  const varNames: Record<string, string> = {};
  sorted.forEach((n, idx) => {
    varNames[n.id] = generateVariableName(n, idx);
  });
  
  const nodeCodeById: Record<string, string> = {};

  sorted.forEach(node => {
    const def = nodeRegistry[node.type || ''];
    if (!def) return;
    
    def.imports.forEach((i: string) => imports.add(i));
    def.pipPackages.forEach((p: string) => pipPackages.add(p));
    
    const inputVars: Record<string, string> = {};
    const incomingEdges = edges.filter(e => e.target === node.id && !isFlowEdge(e, nodes));
    
    incomingEdges.forEach(e => {
      const sourceDef = nodeRegistry[nodes.find(n => n.id === e.source)?.type || ''];
      const sourceHandle = e.sourceHandle || sourceDef?.outputs[0]?.id;
      const dataOutputs = sourceDef?.outputs.filter(handle => handle.type !== 'flow') || [];
      inputVars[e.targetHandle!] = dataOutputs.length > 1
        ? `${varNames[e.source]}_${sourceHandle}`
        : varNames[e.source];
    });
    
    const nodeCode = def.generateCode(node, inputVars, varNames[node.id]);
    nodeCodeById[node.id] = `# ${node.data.label}\n${nodeCode}`;
  });

  const flowEdges = edges.filter(edge => isFlowEdge(edge, nodes));
  const nodesWithFlowInput = new Set(flowEdges.map(edge => edge.target));
  const emitted = new Set<string>();
  const nodeCodes: string[] = [];
  const indent = (value: string, level: number) => value.split('\n').map(line => `${'    '.repeat(level)}${line}`).join('\n');

  // Find nodes that consume data produced by a given source node (and have no flow_in)
  const getDataConsumersWithoutFlow = (sourceId: string): string[] => {
    return edges
      .filter(e => e.source === sourceId && !isFlowEdge(e, nodes))
      .map(e => e.target)
      .filter(targetId => !nodesWithFlowInput.has(targetId));
  };

  // Helper to collect non-flow ancestor data nodes that haven't been emitted yet
  const emitDataDependencies = (nodeId: string, level: number) => {
    const dataIncomingEdges = edges.filter(e => e.target === nodeId && !isFlowEdge(e, nodes));
    dataIncomingEdges.forEach(e => {
      // If the source node hasn't been emitted yet, emit its data dependencies first, then emit it.
      if (!emitted.has(e.source)) {
        emitDataDependencies(e.source, level);
        emit(e.source, level);
      }
    });
  };

  const emit = (nodeId: string, level = 0) => {
    if (emitted.has(nodeId)) return;

    const node = nodes.find(item => item.id === nodeId);
    if (!node) return;

    // First ensure any data inputs needed by this node are generated before this node line
    emitDataDependencies(nodeId, level);

    // Stop if emitting dependencies recursively caused this node to be emitted already
    if (emitted.has(nodeId)) return;

    emitted.add(nodeId);
    nodeCodes.push(indent(nodeCodeById[nodeId], level));

    // Emit any non-flow data consumers of this node if they have no explicit flow input
    const dataConsumers = getDataConsumersWithoutFlow(nodeId);
    dataConsumers.forEach(consumerId => {
      emit(consumerId, level);
    });

    const outgoing = flowEdges.filter(edge => edge.source === nodeId);
    if (node.type === 'if_condition') {
      const trueTargets = outgoing.filter(edge => edge.sourceHandle === 'true_branch');
      const falseTargets = outgoing.filter(edge => edge.sourceHandle === 'false_branch');
      if (trueTargets.length || falseTargets.length) {
        nodeCodes.push(`${'    '.repeat(level)}if ${varNames[nodeId]}:`);
        if (trueTargets.length) {
          trueTargets.forEach(edge => emit(edge.target, level + 1));
        } else {
          nodeCodes.push(`${'    '.repeat(level + 1)}pass`);
        }
        if (falseTargets.length) {
          nodeCodes.push(`${'    '.repeat(level)}else:`);
          falseTargets.forEach(edge => emit(edge.target, level + 1));
        }
      }
      return;
    }
    outgoing.forEach(edge => emit(edge.target, level));
  };

  // First pass: Emit all standalone flow roots or nodes without flow inputs in topological order
  sorted.forEach(node => {
    if (!nodesWithFlowInput.has(node.id) && !emitted.has(node.id)) {
      emit(node.id);
    }
  });

  // Second pass: Catch any un-emitted nodes
  sorted.forEach(node => {
    if (!emitted.has(node.id)) {
      emit(node.id);
    }
  });
  
  const importBlock = Array.from(imports).join('\n');
  code = `${importBlock}\n\n${nodeCodes.join('\n\n')}\n`;
  
  return { code, requirements: Array.from(pipPackages), error: null };
}

function isFlowEdge(edge: PlutoEdge, nodes: PlutoNode[]): boolean {
  const source = nodes.find(node => node.id === edge.source);
  const def = source && nodeRegistry[source.type || ''];
  return def?.outputs.some(handle => handle.id === edge.sourceHandle && handle.type === 'flow') || false;
}

function validateGraph(nodes: PlutoNode[], edges: PlutoEdge[]): string | null {
  const nodesById = new Map(nodes.map(node => [node.id, node]));
  const occupiedInputs = new Set<string>();
  const variableNames = new Set<string>();

  for (const node of nodes) {
    if (node.type !== 'variable') continue;
    const name = String(node.data.config.name || '').trim();
    if (!name) continue;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      return `Variable names must be valid Python identifiers. “${name}” is not valid.`;
    }
    if (variableNames.has(name)) return `Variable name “${name}” is used more than once.`;
    variableNames.add(name);
  }

  for (const edge of edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) return 'Graph contains a connection to a missing node.';

    const sourceDef = nodeRegistry[source.type || ''];
    const targetDef = nodeRegistry[target.type || ''];
    const sourceHandle = edge.sourceHandle || sourceDef?.outputs[0]?.id;
    const targetHandle = edge.targetHandle || targetDef?.inputs[0]?.id;
    const output = sourceDef?.outputs.find(handle => handle.id === sourceHandle);
    const input = targetDef?.inputs.find(handle => handle.id === targetHandle);

    if (!output || !input) return `Invalid connection between “${source.data.label}” and “${target.data.label}”.`;
    if (output.type !== 'any' && input.type !== 'any' && output.type !== input.type) {
      return `Cannot connect ${output.type} output to ${input.type} input on “${target.data.label}”.`;
    }

    const inputKey = `${target.id}:${targetHandle}`;
    if (occupiedInputs.has(inputKey)) return `“${target.data.label}” has more than one connection to its ${input.label} input.`;
    occupiedInputs.add(inputKey);
  }

  for (const node of nodes) {
    const def = nodeRegistry[node.type || ''];
    if (!def) return `Unknown node type: ${node.type || 'missing type'}.`;
    const missing = def.inputs.find(input => !input.optional && !occupiedInputs.has(`${node.id}:${input.id}`));
    if (missing) return `Connect the required ${missing.label} input on “${node.data.label}”.`;
  }

  return null;
}
