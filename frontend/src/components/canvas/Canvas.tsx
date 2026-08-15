import React, { useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useReactFlow,
  ConnectionMode
} from '@xyflow/react';
import { useGraphStore } from '../../store/graphStore';
import { nodeTypes } from '../nodes/NodeFactory';

export function Canvas() {
  const { nodes, edges, setNodes, addEdge, addNode } = useGraphStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback((connection: any) => addEdge(connection), [addEdge]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="flex-1 h-full w-full bg-[#0d0f13]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(chs) => setNodes((nds) => {
            const next = [...nds];
            chs.forEach(c => {
                if (c.type === 'position' && c.position) {
                    const n = next.find(n => n.id === c.id);
                    if (n) n.position = c.position;
                }
            });
            return next;
        })}
        onEdgesChange={() => {}} // simplified for brevity
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#1f2937" gap={16} size={1} />
        <Controls className="bg-gray-800 border-gray-700 fill-gray-300 text-gray-300" />
        <MiniMap nodeStrokeColor="#374151" nodeColor="#1f2937" maskColor="rgba(13, 15, 19, 0.8)" />
      </ReactFlow>
    </div>
  );
}
