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
  
  const nodeCodes: string[] = [];
  
  sorted.forEach(node => {
    const def = nodeRegistry[node.type || ''];
    if (!def) return;
    
    def.imports.forEach((i: string) => imports.add(i));
    def.pipPackages.forEach((p: string) => pipPackages.add(p));
    
    const inputVars: Record<string, string> = {};
    const incomingEdges = edges.filter(e => e.target === node.id);
    
    incomingEdges.forEach(e => {
      const sourceDef = nodeRegistry[nodes.find(n => n.id === e.source)?.type || ''];
      const sourceHandle = e.sourceHandle || sourceDef?.outputs[0]?.id;
      inputVars[e.targetHandle!] = sourceDef && sourceDef.outputs.length > 1
        ? `${varNames[e.source]}_${sourceHandle}`
        : varNames[e.source];
    });
    
    const nodeCode = def.generateCode(node, inputVars, varNames[node.id]);
    nodeCodes.push(`# ${node.data.label}\n${nodeCode}`);
  });
  
  const importBlock = Array.from(imports).join('\n');
  code = `${importBlock}\n\n${nodeCodes.join('\n\n')}\n`;
  
  return { code, requirements: Array.from(pipPackages), error: null };
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
