import { type } from '@testing-library/user-event/dist/type';
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  // MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
} from 'reactflow';

import 'reactflow/dist/style.css';

const MainApp = () => {
  const gridSize = 10;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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



  const getFlowOrder = () => {
    // TODO: Implement this
  };


  return (
    <>

      <div className='TopBar'>
        <button>File</button>
        <button>Settings</button>
        <button onClick={() => { console.log(getFlowOrder()) }}>Get Flow</button>
      </div>

      <div className='SideBar'>
        <button onClick={() => {
          let id = (Math.random() * 1000).toString();
          const newNode = {
            id: id,
            data: { label: id },
            position: { x: 100, y: 100 },
          };
          setNodes(nodes => [...nodes, newNode]);
        }}>Add Item 1</button>
      </div>

      <div className='ReactFlowContainer'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          selectionMode={SelectionMode.Full}
          selectionOnDrag={true}
          selectionKeyCode={null}
          multiSelectionKeyCode="Shift"
          deleteKeyCode={null}
          fitView
          snapGrid={[gridSize, gridSize]}
          snapToGrid={true}
        >
          <Controls />
          {/* <MiniMap /> */}
          <Background variant="dots" gap={gridSize} size={1} />
        </ReactFlow>
      </div>
    </>
  );
};

export default MainApp;