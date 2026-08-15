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
  const base = (node.type || 'node').replace(/[^a-zA-Z0-9]/g, '_');
  return `${base}_${index}`;
}

export function generateCode(nodes: PlutoNode[], edges: PlutoEdge[]): { code: string, requirements: string[], error: string | null } {
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
      inputVars[e.targetHandle!] = varNames[e.source];
    });
    
    const nodeCode = def.generateCode(node, inputVars, varNames[node.id]);
    nodeCodes.push(`# ${node.data.label}\n${nodeCode}`);
  });
  
  const importBlock = Array.from(imports).join('\n');
  code = `${importBlock}\n\n${nodeCodes.join('\n\n')}\n`;
  
  return { code, requirements: Array.from(pipPackages), error: null };
}
