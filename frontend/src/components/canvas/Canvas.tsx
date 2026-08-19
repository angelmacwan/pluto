import React, { useCallback, useMemo, useRef, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useReactFlow,
  ConnectionMode,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { Map } from 'lucide-react';
import { useGraphStore } from '../../store/graphStore';
import { useAppStore } from '../../store/appStore';
import { nodeTypes as registryNodeTypes } from '../nodes/NodeFactory';
import { BaseNode } from '../nodes/BaseNode';

export function Canvas() {
  const { nodes, edges, setNodes, addEdge, addNode } = useGraphStore();
  const { currentProjectId, projects } = useAppStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(true);

  // Build a stable nodeTypes map that covers both registry nodes and any
  // custom nodes saved to the current project. Without this, React Flow
  // falls back to its default plain-white-box renderer for custom types.
  const nodeTypes = useMemo(() => {
    const currentProject = projects.find(p => p.id === currentProjectId);
    const customEntries = (currentProject?.customNodes ?? []).reduce<Record<string, typeof BaseNode>>(
      (acc, cn) => { acc[cn.id] = BaseNode; return acc; },
      {}
    );
    return { ...registryNodeTypes, ...customEntries };
  }, [currentProjectId, projects]);

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
    <div className="flex-1 h-full w-full bg-[#0d0f13] canvas-workspace" ref={reactFlowWrapper}>
      <button
        className="canvas-minimap-toggle"
        onClick={() => setIsMiniMapVisible(visible => !visible)}
        title={isMiniMapVisible ? 'Hide minimap' : 'Show minimap'}
        aria-label={isMiniMapVisible ? 'Hide minimap' : 'Show minimap'}
        aria-pressed={isMiniMapVisible}
      >
        <Map size={16} />
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => setNodes(nodes => applyNodeChanges(changes, nodes))}
        onEdgesChange={(changes) => useGraphStore.getState().setEdges(edges => applyEdgeChanges(changes, edges))}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[16, 16]}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background color="#1f2937" gap={16} size={1} />
        <Controls className="bg-gray-800 border-gray-700 fill-gray-300 text-gray-300" />
        {isMiniMapVisible && (
          <MiniMap nodeStrokeColor="#374151" nodeColor="#1f2937" maskColor="rgba(13, 15, 19, 0.8)" />
        )}
      </ReactFlow>
    </div>
  );
}
