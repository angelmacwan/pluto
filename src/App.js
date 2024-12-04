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

import Info from './Info';
import CodeOutput from './CodeOutput';

import DataInput from './nodes/DataInput';
import TrainTestSplit from './nodes/TrainTestSplit';
import StandardScaler from './nodes/StandardScaler';
import RobustScaler from './nodes/RobustScaler';
import KnnClassifier from './nodes/KnnClassifier';
import DecisionTree from './nodes/DecisionTree';
import ClassificationReport from './nodes/ClassificationReport';
import DropColumn from './nodes/DropColumn';
import RandomForest from './nodes/RandomForest';
import RandomSeed from './nodes/RandomSeed';
import RemoveNa from './nodes/RemoveNa';
import CustomCode from './nodes/CustomCode';
import KNNImputer from './nodes/KNNImputer';
import SimpleImputer from './nodes/SimpleImputer';
import LinearSVC from './nodes/LinearSVC';
import SVC from './nodes/SVC';
import KfoldCV from './nodes/KfoldCV';
import TrainModel from './nodes/TrainModel';



// list of node types
const nodeTypes = {
  // DATA LOADERS
  DataInput: DataInput,
  RandomSeed: RandomSeed,

  // DATA PROCESSORS
  DropColumn: DropColumn,
  RemoveNa: RemoveNa,
  KNNImputer: KNNImputer,
  SimpleImputer: SimpleImputer,
  TrainTestSplit: TrainTestSplit,
  StandardScaler: StandardScaler,
  RobustScaler: RobustScaler,

  // MODELS
  KnnClassifier: KnnClassifier,
  DecisionTree: DecisionTree,
  RandomForest: RandomForest,
  LinearSVC: LinearSVC,
  SVC: SVC,

  //CV and Other
  TrainModel: TrainModel,
  KfoldCV: KfoldCV,

  // OUTPUT
  ClassificationReport: ClassificationReport,

  // CUSTOM
  CustomCode: CustomCode,
};

// Mappint of node type to its css class
const nodeTypeClass = {
  DataInput: 'node-type-input',
  TrainTestSplit: 'node-type-processor',
  StandardScaler: 'node-type-processor',
  RobustScaler: 'node-type-processor',
  KnnClassifier: 'node-type-model',
  DecisionTree: 'node-type-model',
  ClassificationReport: 'node-type-output',
  DropColumn: 'node-type-processor',
  RandomForest: 'node-type-model',
  RandomSeed: 'node-type-input',
  CustomCode: 'node-type-custom',
  RemoveNa: 'node-type-processor',
  KNNImputer: 'node-type-processor',
  SimpleImputer: 'node-type-processor',
  LinearSVC: 'node-type-model',
  SVC: 'node-type-model',
  KfoldCV: 'node-type-cv',
  TrainModel: 'node-type-model',
};


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
  const [displayInfo, setDisplayInfo] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const iconSize = 20

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
  );


  // Handle node state updates
  const updateNodeState = useCallback((nodeId, newData) => {
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
    // Data structures for graph representation
    const graph = new Map();
    const inDegree = new Map();

    // Initialize graph with empty adjacency lists and zero in-degrees
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build graph and calculate in-degrees
    edges.forEach(edge => {
      graph.get(edge.source).push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Find paths in the graph starting from a node
    const findPaths = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return null;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;

      visited.add(nodeId);
      const children = graph.get(nodeId);

      // Leaf node
      if (!children?.length) return node;

      // Single child - continue path
      if (children.length === 1) {
        const childPath = findPaths(children[0], visited);
        return childPath ? [node, childPath].flat() : [node];
      }

      // Multiple children - return parallel paths
      const parallelPaths = children
        .map(childId => findPaths(childId, new Set(visited)))
        .filter(Boolean);

      return parallelPaths.length ? [node, parallelPaths] : [node];
    };

    // Find root nodes (no incoming edges)
    const roots = Array.from(inDegree.entries())
      .filter(([, degree]) => degree === 0)
      .map(([id]) => id);

    // Process each root and combine results
    const result = roots
      .map(rootId => findPaths(rootId))
      .filter(Boolean)
      .flat();

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
  };


  const handleSave = () => {
    const flowOrder = getFlowOrder();

    // save position and data of all nodes as json
    const nodesData = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }));

    // save position and data of all edges as json
    const edgesData = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      data: edge.data
    }))

    const data = {
      nodes: nodesData,
      edges: edgesData,
      flowOrder
    };

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flow.json';
    link.click();

    alert('Flow saved successfully!');
  }


  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;
        const data = JSON.parse(contents);
        setNodes(data.nodes.map(node => ({
          ...node,
          position: node.position,
          data: node.data
        })))
        setEdges(data.edges.map(edge => ({
          ...edge,
          data: edge.data
        })))
      }
      reader.readAsText(file);
    }
    input.click();
  }

  return (
    <>
      <div className="TopBar">
        {/* INFO BTN */}
        <button className='tooltip' onClick={() => {
          setDisplayInfo(!displayInfo)
        }}>
          <svg width={iconSize} height={iconSize} fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
          </svg>
          <span className="tooltiptext">info</span>
        </button>

        {/* SAVE BTN */}
        <button className='tooltip' onClick={handleSave}>
          <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill="currentColor" className="bi bi-floppy" viewBox="0 0 16 16">
            <path d="M11 2H9v3h2z" />
            <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
          </svg>
          <span className="tooltiptext">Save</span>
        </button>

        {/* LOAD BTN */}
        <button className='tooltip' onClick={handleLoad}>
          <svg width={iconSize} height={iconSize} fill="currentColor" className="bi bi-file-earmark-arrow-up" viewBox="0 0 16 16">
            <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707z" />
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
          </svg>
          <span className="tooltiptext">Load File</span>
        </button>

        {/* AI BTN */}
        <button
          className='tooltip'
          onClick={() => { setuseAi(!useAi) }}
          style={{ background: useAi ? 'var(--node-processor-color)' : 'rgba(0,0,0,0.6)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
            <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135" />
            <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5" />
          </svg>
          <span className="tooltiptext">Use AI</span>
        </button>

      </div>


      {/* LIST OF ALL NODES AS BUTTONS */}
      <div className="SideBar btn-list">

        <div className="search-bar">
          <input
            type="search"
            placeholder="search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {Object.keys(nodeTypes).map((nodeType) => {
          if (searchTerm && !nodeType.toLowerCase().includes(searchTerm.toLowerCase())) {
            return null;
          }
          return <button
            className={nodeTypeClass[nodeType]}
            key={nodeType}
            onClick={() => addNewNode(nodeType)}
          >
            {nodeType}
          </button>
        })}
      </div>

      {/* INFO */}
      {displayInfo && (
        <div onClick={() => {
          setDisplayInfo(false);
        }}>
          <Info />
        </div>
      )}

      <div className='code-output-container' style={{ right: codeOutputVisible ? '0' : '-600px' }}>
        <div className='floating-button-container'>
          <button className='floating-button' style={{ transform: codeOutputVisible ? 'scaleX(-1)' : 'scaleX(1)' }} onClick={() => setCodeOutputVisible(!codeOutputVisible)}>
            <svg width={iconSize} height={iconSize} fill="currentColor"
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