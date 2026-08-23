import { referenceDefinitions } from './nodes/referenceDefinitions';

const fallbackName = (node, index) => `${String(node.type || 'node').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${index}`;

export function generateGraphCode(nodes, edges) {
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  const degree = new Map(nodes.map(node => [node.id, 0]));
  const children = new Map(nodes.map(node => [node.id, []]));
  const isFlowEdge = edge => referenceDefinitions[nodeById.get(edge.source)?.type]?.outputs?.some(output => output.id === edge.sourceHandle && output.flow);
  edges.forEach(edge => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) return;
    if (isFlowEdge(edge)) return;
    degree.set(edge.target, degree.get(edge.target) + 1);
    children.get(edge.source).push(edge.target);
  });
  const queue = nodes.filter(node => degree.get(node.id) === 0);
  const ordered = [];
  while (queue.length) {
    const node = queue.shift();
    ordered.push(node);
    children.get(node.id).forEach(id => {
      degree.set(id, degree.get(id) - 1);
      if (degree.get(id) === 0) queue.push(nodeById.get(id));
    });
  }
  if (ordered.length !== nodes.length) return { code: '', error: 'Cycle detected in graph. Remove the cyclic connection before generating code.' };

  const names = {};
  ordered.forEach((node, index) => {
    const def = referenceDefinitions[node.type];
    names[node.id] = def?.variableName?.(node.data.config || {}, fallbackName(node, index)) || fallbackName(node, index);
  });

  const codeById = new Map();
  const imports = new Set();
  ordered.forEach(node => {
    const def = referenceDefinitions[node.type];
    if (!def) {
      if (node.data.imports) imports.add(node.data.imports);
      if (node.data.code) codeById.set(node.id, node.data.code);
      return;
    }
    const inputVars = {};
    edges.filter(edge => edge.target === node.id && !isFlowEdge(edge)).forEach(edge => {
      const sourceDef = referenceDefinitions[nodeById.get(edge.source)?.type];
      const sourceHandle = edge.sourceHandle || sourceDef?.outputs?.[0]?.id;
      inputVars[edge.targetHandle || def.inputs[0]?.id] = sourceDef?.outputs?.length > 1 ? `${names[edge.source]}_${sourceHandle}` : names[edge.source];
    });
    const generated = def.generate(node.data.config || {}, inputVars, names[node.id]);
    if (generated) codeById.set(node.id, node.type === 'IfCondition' ? `if ${generated}:` : generated);
  });

  const flowEdges = edges.filter(isFlowEdge);
  const flowTargets = new Set(flowEdges.map(edge => edge.target));
  const emitted = new Set();
  const indent = (value, level) => value.split('\n').map(line => `${'    '.repeat(level)}${line}`).join('\n');
  const output = [];
  const emit = (nodeId, level = 0) => {
    if (emitted.has(nodeId)) return;
    emitted.add(nodeId);
    const node = nodeById.get(nodeId);
    if (!node) return;
    if (codeById.has(nodeId)) output.push(indent(codeById.get(nodeId), level));
    if (node.type === 'IfCondition') {
      const trueEdges = flowEdges.filter(edge => edge.source === nodeId && edge.sourceHandle === 'true_branch');
      const falseEdges = flowEdges.filter(edge => edge.source === nodeId && edge.sourceHandle === 'false_branch');
      if (trueEdges.length) trueEdges.forEach(edge => emit(edge.target, level + 1));
      else output.push(`${'    '.repeat(level + 1)}pass`);
      if (falseEdges.length) {
        output.push(`${'    '.repeat(level)}else:`);
        falseEdges.forEach(edge => emit(edge.target, level + 1));
      }
    } else if (node.type === 'ForLoop' || node.type === 'WhileLoop') {
      const bodyEdges = flowEdges.filter(edge => edge.source === nodeId && edge.sourceHandle === 'body');
      const doneEdges = flowEdges.filter(edge => edge.source === nodeId && edge.sourceHandle === 'done');
      if (bodyEdges.length) {
        bodyEdges.forEach(edge => emit(edge.target, level + 1));
      } else {
        output.push(`${'    '.repeat(level + 1)}pass`);
      }
      if (doneEdges.length) {
        doneEdges.forEach(edge => emit(edge.target, level));
      }
    } else {
      flowEdges.filter(edge => edge.source === nodeId).forEach(edge => emit(edge.target, level));
      edges.filter(edge => edge.source === nodeId && !isFlowEdge(edge)).forEach(edge => {
        if (!flowTargets.has(edge.target)) {
          emit(edge.target, level);
        }
      });
    }
  };
  ordered.forEach(node => { if (!flowTargets.has(node.id)) emit(node.id); });
  ordered.forEach(node => emit(node.id));
  const code = output.join('\n\n');
  return { code: [...imports].filter(Boolean).join('\n') + (imports.size && code ? '\n\n' : '') + code, error: null };
}
