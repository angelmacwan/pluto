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

// list of node types
const nodeTypes = {
  DataInput: DataInput,
  TrainTestSplit: TrainTestSplit,
  StandardScaler: StandardScaler,
  RobustScaler: RobustScaler,
  KnnClassifier: KnnClassifier,
  DecisionTree: DecisionTree,
  ClassificationReport: ClassificationReport
};

// Mappint of node type to its css class
const nodeTypeClass = {
  DataInput: 'node-type-input',
  TrainTestSplit: 'node-type-processor',
  StandardScaler: 'node-type-processor',
  RobustScaler: 'node-type-processor',
  KnnClassifier: 'node-type-model',
  DecisionTree: 'node-type-model',
  ClassificationReport: 'node-type-output'
}


// initialState will be removed at some point
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
  const [useAi, setuseAi] = useState(false)

  const iconSize = 20

  // Add a state object to track all node data
  const [nodeStates, setNodeStates] = useState({});

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: false, markerEnd: { type: 'arrow' } }, eds)),
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
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill="currentColor" className="bi bi-floppy" viewBox="0 0 16 16">
            <path d="M11 2H9v3h2z" />
            <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
          </svg></button>
        <button>
          <svg width={iconSize} height={iconSize} fill="currentColor" className="bi bi-file-earmark-arrow-up" viewBox="0 0 16 16">
            <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707z" />
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
          </svg>
        </button>
        <button
          onClick={() => { setuseAi(!useAi) }}
          style={{ background: useAi ? 'var(--node-processor-color)' : 'rgba(0,0,0,0.6)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
            <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135" />
            <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5" />
          </svg>
        </button>
      </div>


      {/* LIST OF ALL NODES AS BUTTONS */}
      <div className="SideBar btn-list">
        {Object.keys(nodeTypes).map((nodeType) => (
          <button
            className={nodeTypeClass[nodeType]}
            key={nodeType}
            onClick={() => addNewNode(nodeType)}
          >
            {nodeType}
          </button>
        ))}
      </div>

      <div className='code-output-container' style={{ right: codeOutputVisible ? '0' : '-600px' }}>
        <div className='floating-button-container'>
          <button className='floating-button' onClick={() => setCodeOutputVisible(!codeOutputVisible)}>
            <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill="currentColor"
              className="bi bi-arrow-bar-left"
              viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5" />
            </svg>
          </button>
        </div>

        <div className='code-output-display-block' style={{ width: '600px' }} >
          <CodeOutput useAi={useAi} data={getFlowOrder()} />
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