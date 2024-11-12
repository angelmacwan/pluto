import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Node' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: { label: 'Middle Node' },
    position: { x: 250, y: 100 },
  },
  {
    id: '5',
    data: { label: 'Middle Node' },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'End Node' },
    position: { x: 250, y: 200 },
  },
];


const initialEdges = []

const MainApp = () => {
  const gridSize = 10;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle selection changes
  const onSelectionChange = useCallback(
    ({ nodes, edges }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete selected edges
        if (selectedEdges.length > 0) {
          const selectedEdgeIds = selectedEdges.map(edge => edge.id);
          setEdges(edges => edges.filter(edge => !selectedEdgeIds.includes(edge.id)));
        }

        // Delete selected nodes
        if (selectedNodes.length > 0) {
          const selectedNodeIds = selectedNodes.map(node => node.id);
          setNodes(nodes => nodes.filter(node => !selectedNodeIds.includes(node.id)));
          // Also remove any edges connected to deleted nodes
          setEdges(edges => edges.filter(edge =>
            !selectedNodeIds.includes(edge.source) &&
            !selectedNodeIds.includes(edge.target)
          ));
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdges, selectedNodes, setEdges, setNodes]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        selectionMode={SelectionMode.Full}
        selectionOnDrag={true}
        selectionKeyCode={null} // Allow selection without holding any modifier key
        multiSelectionKeyCode="Shift" // Hold shift to add to selection
        deleteKeyCode={null} // Disable default delete behavior
        fitView
        snapGrid={[gridSize, gridSize]}
        snapToGrid={true}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={gridSize} size={1} />
      </ReactFlow>
    </div>
  );
};

export default MainApp;