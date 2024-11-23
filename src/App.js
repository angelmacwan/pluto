import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
} from 'reactflow';

import 'reactflow/dist/style.css';

import CodeOutput from './CodeOutput';

import DataInput from './nodes/DataInput';
import TrainTestSplit from './nodes/TrainTestSplit';
import StandardScaler from './nodes/StandardScaler';
import RobustScaler from './nodes/RobustScaler';

const nodeTypes = {
  dataNode: DataInput,
  TrainTestSplit: TrainTestSplit,
  StandardScaler: StandardScaler,
  RobustScaler: RobustScaler
};
const initialState = {
  // Default state values based on node type
  dataNode: { input: null, type: 'file' },
  TrainTestSplit: { splitRatio: 0.8, randomState: 42, stratify: false, shuffle: true }
};

const MainApp = () => {
  const gridSize = 10;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);

  // Add a state object to track all node data
  const [nodeStates, setNodeStates] = useState({});

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );


  // Handle node state updates
  const updateNodeState = useCallback((nodeId, newData) => {
    setNodeStates(prev => ({
      ...prev,
      [nodeId]: newData
    }));

    // Also update the node's data in the nodes array
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onSelectionChange = useCallback(
    ({ nodes, edges }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') {
        if (selectedEdges.length > 0) {
          const selectedEdgeIds = selectedEdges.map(edge => edge.id);
          setEdges(edges => edges.filter(edge => !selectedEdgeIds.includes(edge.id)));
        }

        if (selectedNodes.length > 0) {
          const selectedNodeIds = selectedNodes.map(node => node.id);
          // Remove node states when deleting nodes
          setNodeStates(prev => {
            const newStates = { ...prev };
            selectedNodeIds.forEach(id => delete newStates[id]);
            return newStates;
          });
          setNodes(nodes => nodes.filter(node => !selectedNodeIds.includes(node.id)));
          setEdges(edges => edges.filter(edge =>
            !selectedNodeIds.includes(edge.source) &&
            !selectedNodeIds.includes(edge.target)
          ));
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdges, selectedNodes, setEdges, setNodes]);

  const getFlowOrder = () => {
    const graph = new Map();
    const inDegree = new Map();

    // Initialize the graph and in-degrees
    nodes.forEach((node) => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Populate the graph and in-degrees from edges
    edges.forEach((edge) => {
      if (graph.has(edge.source)) {
        graph.get(edge.source).push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    });

    // Find all nodes with no incoming edges
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const sortedOrder = [];
    while (queue.length > 0) {
      const current = queue.shift();
      sortedOrder.push(current);

      // Decrease the in-degree of neighbors
      graph.get(current).forEach((neighbor) => {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) queue.push(neighbor);
      });
    }

    // Check for cycles
    if (sortedOrder.length !== nodes.length) {
      console.error('The graph has a cycle or is not a DAG.');
      return 'The graph has a cycle or is not a DAG.';
    }

    const to_return = sortedOrder.map((nodeId) =>
      nodes.find((node) => node.id === nodeId)
    );

    return to_return;
    // return to_return.map((node) => [node.id, node.type]);

  };

  const addNewNode = (nodeType) => {
    const id = (Math.random() * 1000).toString();
    const newNode = {
      id,
      type: nodeType,
      data: {
        ...initialState[nodeType],
        // Pass the update function to the node
        updateNodeState: (newData) => updateNodeState(id, newData)
      },
      position: { x: 100, y: 100 },
    };

    setNodes(nodes => [...nodes, newNode]);
    setNodeStates(prev => ({
      ...prev,
      [id]: initialState[nodeType]
    }));
  };


  return (
    <>
      <div className="TopBar">
        <button>File</button>
        <button>Settings</button>
        <button onClick={getFlowOrder}>Get Flow</button>
      </div>

      <div className="SideBar">
        {Object.keys(nodeTypes).map((nodeType) => (
          <button
            key={nodeType}
            onClick={() => addNewNode(nodeType)}
          >
            {nodeType}
          </button>
        ))}
      </div>

      <CodeOutput data={getFlowOrder()} />

      <div className="ReactFlowContainer">
        <ReactFlow
          nodeTypes={nodeTypes}
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
          <Background variant="dots" gap={gridSize} size={1} />
        </ReactFlow>
      </div>
    </>
  );
};

export default MainApp;