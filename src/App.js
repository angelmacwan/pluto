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
import KnnClassifier from './nodes/KnnClassifier';
import DecisionTree from './nodes/DecisionTree';
import ClassificationReport from './nodes/ClassificationReport';

const nodeTypes = {
  DataInput: DataInput,
  TrainTestSplit: TrainTestSplit,
  StandardScaler: StandardScaler,
  RobustScaler: RobustScaler,
  KnnClassifier: KnnClassifier,
  DecisionTree: DecisionTree,
  ClassificationReport: ClassificationReport
};
const initialState = {
  dataNode: { input: null, type: 'file' },
  TrainTestSplit: { splitRatio: 0.8, randomState: 42, stratify: false, shuffle: true }
};

const MainApp = () => {
  const gridSize = 10;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [codeOutputVisible, setCodeOutputVisible] = useState(false);

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
    const outDegree = new Map();

    // Initialize the graph and degrees
    nodes.forEach((node) => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
      outDegree.set(node.id, 0);
    });

    // Populate the graph and degrees from edges
    edges.forEach((edge) => {
      if (graph.has(edge.source)) {
        graph.get(edge.source).push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
      }
    });

    // Helper function to get complete path from node to leaf
    const getPathToLeaf = (startNodeId, visited = new Set()) => {
      if (visited.has(startNodeId)) return [];
      visited.add(startNodeId);

      const currentNode = nodes.find(node => node.id === startNodeId);
      if (!currentNode) return [];

      const neighbors = graph.get(startNodeId);
      if (neighbors.length === 0) return [currentNode];

      // For single path, return flat array
      if (neighbors.length === 1) {
        const nextPath = getPathToLeaf(neighbors[0], visited);
        return [currentNode, ...nextPath];
      }

      // For multiple paths, return just this node
      return [currentNode];
    };

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) rootNodes.push(nodeId);
    });

    const result = [];
    const processed = new Set();

    // Process each root node
    for (const rootId of rootNodes) {
      let current = rootId;
      while (current && !processed.has(current)) {
        const path = getPathToLeaf(current, new Set());
        processed.add(current);

        // If this node has multiple children, process parallel branches
        if (outDegree.get(current) >= 2) {
          const children = graph.get(current);
          const parallelBranches = children.map(childId => {
            const branchPath = getPathToLeaf(childId, new Set());
            branchPath.forEach(node => processed.add(node.id));
            return branchPath;
          });

          // Add the path leading to the split
          result.push(...path);

          // Add the parallel branches as an array of arrays
          result.push(parallelBranches);

          break;
        } else {
          // Add the current node
          const currentNode = nodes.find(node => node.id === current);
          if (currentNode) {
            result.push(currentNode);
          }
          const neighbors = graph.get(current);
          current = neighbors.length > 0 ? neighbors[0] : null;
        }
      }
    }

    return result;
  };

  const addNewNode = (nodeType) => {
    const id = (Math.random() * 1000).toString();
    let newNodePosition = { x: 200, y: 200 }

    if (nodes.length > 0) {
      newNodePosition = {
        x: nodes[nodes.length - 1].position.x + 200,
        y: nodes[nodes.length - 1].position.y
      }
    }

    const newNode = {
      id,
      type: nodeType,
      data: {
        ...initialState[nodeType],
        updateNodeState: (newData) => updateNodeState(id, newData)
      },
      position: newNodePosition,
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
        <button>Save File</button>
        <button>Load File</button>
        <button>AI Generator</button>
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

      <div className='code-output-container'>
        <div className='floating-button-container'>

          <button className='floating-button' onClick={() => setCodeOutputVisible(!codeOutputVisible)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
              class="bi bi-arrow-bar-left"
              viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5" />
            </svg>
          </button>
        </div>

        <div className='code-output-display-block' style={{ right: codeOutputVisible ? '0' : '-100vw' }}>
          <CodeOutput data={getFlowOrder()} />
        </div>
      </div>

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