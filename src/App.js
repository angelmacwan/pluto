import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
import FileManager from './FileManager';

import DataInput from './nodes/DataInput';
import ApiFetch from './nodes/ApiFetch';
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
import LinearSVC from './nodes/LinearSVC';
import SVC from './nodes/SVC';
import KfoldCV from './nodes/KfoldCV';
import TrainModel from './nodes/TrainModel';
import PCA from './nodes/PCA';
import LableEncoder from './nodes/LableEncoder';
import MissingValueImputer from './nodes/MissingValueImputer';
import OneHotEncoder from './nodes/OneHotEncoder';
import DuplicateRemover from './nodes/DuplicateRemover';

// PROGRAMMING / LOGIC NODES
import ListNode from './nodes/ListNode';
import DictNode from './nodes/DictNode';
import MathOp from './nodes/MathOp';
import Comparison from './nodes/Comparison';
import WhileLoop from './nodes/WhileLoop';
import FunctionDef from './nodes/FunctionDef';
import FunctionCall from './nodes/FunctionCall';
import InputNode from './nodes/InputNode';
import CommentNode from './nodes/CommentNode';
import ReferenceNode from './nodes/ReferenceNode';


// ── Node type registry ──────────────────────────────────────────────

const nodeTypes = {
  // DATA LOADERS
  DataInput: DataInput,
  ApiFetch: ApiFetch,
  RandomSeed: RandomSeed,

  // DATA PROCESSORS
  DropColumn: DropColumn,
  RemoveNa: RemoveNa,
  MissingValueImputer: MissingValueImputer,
  TrainTestSplit: TrainTestSplit,
  StandardScaler: StandardScaler,
  RobustScaler: RobustScaler,
  PCA: PCA,
  LableEncoder: LableEncoder,
  OneHotEncoder: OneHotEncoder,
  DuplicateRemover: DuplicateRemover,

  // MODELS
  KnnClassifier: KnnClassifier,
  DecisionTree: DecisionTree,
  RandomForest: RandomForest,
  LinearSVC: LinearSVC,
  SVC: SVC,

  // CV and other
  TrainModel: TrainModel,
  KfoldCV: KfoldCV,

  // OUTPUT
  ClassificationReport: ClassificationReport,

  // PROGRAMMING & LOGIC
  Variable: (props) => <ReferenceNode {...props} nodeKind="Variable" />,
  List: ListNode,
  Dictionary: DictNode,
  MathOperation: MathOp,
  Comparison: Comparison,
  TypeCheck: (props) => <ReferenceNode {...props} nodeKind="TypeCheck" />,
  IfCondition: (props) => <ReferenceNode {...props} nodeKind="IfCondition" />,
  ForLoop: (props) => <ReferenceNode {...props} nodeKind="ForLoop" />,
  WhileLoop: WhileLoop,
  FunctionDef: FunctionDef,
  FunctionCall: FunctionCall,
  Print: (props) => <ReferenceNode {...props} nodeKind="Print" />,
  Input: InputNode,
  FileRead: (props) => <ReferenceNode {...props} nodeKind="FileRead" />,
  FileWrite: (props) => <ReferenceNode {...props} nodeKind="FileWrite" />,
  ImportLib: (props) => <ReferenceNode {...props} nodeKind="ImportLib" />,
  Comment: CommentNode,

  // CUSTOM
  CustomCode: CustomCode,
};

// ── Node category groups (for sidebar display) ──────────────────────

const nodeGroups = [
  {
    label: 'Data Loaders',
    nodes: ['DataInput', 'ApiFetch', 'RandomSeed'],
  },
  {
    label: 'Processors',
    nodes: ['DropColumn', 'RemoveNa', 'MissingValueImputer', 'TrainTestSplit', 'DuplicateRemover'],
  },
  {
    label: 'Transforms',
    nodes: ['StandardScaler', 'RobustScaler', 'PCA', 'LableEncoder', 'OneHotEncoder'],
  },
  {
    label: 'Models',
    nodes: ['KnnClassifier', 'DecisionTree', 'RandomForest', 'LinearSVC', 'SVC'],
  },
  {
    label: 'Training & CV',
    nodes: ['TrainModel', 'KfoldCV'],
  },
  {
    label: 'Output',
    nodes: ['ClassificationReport'],
  },
  {
    label: 'Logic & Control',
    nodes: ['Variable', 'List', 'Dictionary', 'MathOperation', 'Comparison', 'TypeCheck',
            'IfCondition', 'ForLoop', 'WhileLoop'],
  },
  {
    label: 'Functions',
    nodes: ['FunctionDef', 'FunctionCall'],
  },
  {
    label: 'I/O & Misc',
    nodes: ['Print', 'Input', 'FileRead', 'FileWrite', 'ImportLib', 'Comment', 'CustomCode'],
  },
];

// css class per node type (for the dot indicator color)
const nodeTypeClass = {
  DataInput: 'node-type-input',
  ApiFetch: 'node-type-input',
  TrainTestSplit: 'node-type-data-processor',
  StandardScaler: 'node-type-data-processor',
  RobustScaler: 'node-type-data-processor',
  KnnClassifier: 'node-type-model',
  DecisionTree: 'node-type-model',
  ClassificationReport: 'node-type-output',
  DropColumn: 'node-type-data-processor',
  RandomForest: 'node-type-model',
  RandomSeed: 'node-type-input',
  CustomCode: 'node-type-custom',
  RemoveNa: 'node-type-data-processor',
  MissingValueImputer: 'node-type-data-processor',
  LinearSVC: 'node-type-model',
  SVC: 'node-type-model',
  KfoldCV: 'node-type-cv',
  TrainModel: 'node-type-model',
  PCA: 'node-type-data-transform',
  LableEncoder: 'node-type-data-transform',
  OneHotEncoder: 'node-type-data-transform',
  DuplicateRemover: 'node-type-data-processor',

  Variable: 'node-type-variable',
  List: 'node-type-variable',
  Dictionary: 'node-type-variable',
  MathOperation: 'node-type-primitive',
  Comparison: 'node-type-primitive',
  TypeCheck: 'node-type-primitive',
  IfCondition: 'node-type-control',
  ForLoop: 'node-type-control',
  WhileLoop: 'node-type-control',
  FunctionDef: 'node-type-function',
  FunctionCall: 'node-type-function',
  Print: 'node-type-output',
  Input: 'node-type-primitive',
  FileRead: 'node-type-io',
  FileWrite: 'node-type-io',
  ImportLib: 'node-type-primitive',
  Comment: 'node-type-custom',
};

// ── Inline SVG icons ────────────────────────────────────────────────

const IconSave = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d="M11 2H9v3h2z" />
    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
  </svg>
);

const IconFolder = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.267a2.5 2.5 0 0 1-2.483-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.267 14h9.466a1.5 1.5 0 0 0 1.49-1.314l.64-5.124A.5.5 0 0 0 14.367 7z"/>
  </svg>
);

const IconCode = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z"/>
  </svg>
);

const IconInfo = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
  </svg>
);

const IconFileDoc = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/>
  </svg>
);


// ── Main App ────────────────────────────────────────────────────────

const MainApp = () => {
  const gridSize = 10;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [codeOutputVisible, setCodeOutputVisible] = useState(false);
  const [displayInfo, setDisplayInfo] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serverAvailable, setServerAvailable] = useState(false);
  const [fileBrowserVisible, setFileBrowserVisible] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(null);

  const FILE_PANEL_WIDTH = 260;
  const CODE_PANEL_WIDTH = 580;

  // Detect whether running inside the Python server
  useEffect(() => {
    fetch('/api/files')
      .then(r => {
        if (r.ok) {
          setServerAvailable(true);
          setFileBrowserVisible(true); // open by default when server is available
        }
      })
      .catch(() => {});
  }, []);

  // ── Graph helpers ──────────────────────────────────────────────

  const getFlowOrder = useCallback(() => {
    const graph = new Map();
    const inDegree = new Map();

    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      graph.get(edge.source).push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    const findPaths = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return null;
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;
      visited.add(nodeId);
      const children = graph.get(nodeId);
      if (!children?.length) return node;
      if (children.length === 1) {
        const childPath = findPaths(children[0], visited);
        return childPath ? [node, childPath].flat() : [node];
      }
      const parallelPaths = children
        .map(childId => findPaths(childId, new Set(visited)))
        .filter(Boolean);
      return parallelPaths.length ? [node, parallelPaths] : [node];
    };

    const roots = Array.from(inDegree.entries())
      .filter(([, degree]) => degree === 0)
      .map(([id]) => id);

    return roots.map(rootId => findPaths(rootId)).filter(Boolean).flat();
  }, [nodes, edges]);

  const updateNodeState = useCallback((nodeId, newData) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const removeNode = useCallback((nodeId) => {
    setNodes(currentNodes => currentNodes.filter(node => node.id !== nodeId));
    setEdges(currentEdges => currentEdges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    const header = event.target.closest?.('.node-header');
    if (header && !header.closest('.reference-node') &&
        event.clientX >= header.getBoundingClientRect().right - 28) {
      event.stopPropagation();
      removeNode(node.id);
    }
  }, [removeNode]);

  const onSelectionChange = useCallback(
    ({ nodes, edges }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    [setSelectedNodes, setSelectedEdges]
  );

  // ── Filtered sidebar nodes ─────────────────────────────────────

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return nodeGroups;
    const q = searchTerm.toLowerCase();
    return nodeGroups
      .map(group => ({
        ...group,
        nodes: group.nodes.filter(nodeType =>
          nodeType.toLowerCase().includes(q)
        ),
      }))
      .filter(group => group.nodes.length > 0);
  }, [searchTerm]);

  // ── Serialization ──────────────────────────────────────────────

  const buildFlowData = () => ({
    nodes: nodes.map(node => {
      const data = { ...node.data };
      delete data.updateNodeState;
      delete data.removeNode;
      delete data.fileContent;
      delete data.filePath;
      return { id: node.id, type: node.type, position: node.position, data };
    }),
    edges: edges.map(edge => ({
      id: edge.id, source: edge.source, target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      type: edge.type, data: edge.data,
    })),
  });

  // Recover sourceHandle / targetHandle from the ReactFlow auto-generated edge id
  // for files saved before these fields were persisted explicitly.
  // ReactFlow id format: "reactflow__edge-{source}{sourceHandle}-{target}{targetHandle}"
  const migrateEdge = (edge, nodes) => {
    if (edge.sourceHandle !== undefined && edge.targetHandle !== undefined) return edge;
    let { sourceHandle = null, targetHandle = null } = edge;
    const prefix = 'reactflow__edge-';
    if (edge.id?.startsWith(prefix)) {
      const body = edge.id.slice(prefix.length);
      const srcNode = nodes.find(n => n.id === edge.source);
      const tgtNode = nodes.find(n => n.id === edge.target);
      if (srcNode && tgtNode) {
        // The body is "{sourceId}{sourceHandle}-{targetId}{targetHandle}"
        // Find where the "-{targetId}" separator starts
        const targetSep = `-${edge.target}`;
        const sepIdx = body.lastIndexOf(targetSep);
        if (sepIdx !== -1) {
          const sourceSegment = body.slice(0, sepIdx);
          const targetSegment = body.slice(sepIdx + 1); // skip the leading "-"
          if (!sourceHandle && sourceSegment.startsWith(edge.source)) {
            const extracted = sourceSegment.slice(edge.source.length) || null;
            if (extracted) sourceHandle = extracted;
          }
          if (!targetHandle && targetSegment.startsWith(edge.target)) {
            const extracted = targetSegment.slice(edge.target.length) || null;
            if (extracted) targetHandle = extracted;
          }
        }
      }
    }
    return { ...edge, sourceHandle: sourceHandle || null, targetHandle: targetHandle || null };
  };

  const restoreFlow = useCallback((data, filePath = null) => {
    if (!data.nodes || !Array.isArray(data.nodes) ||
        !data.edges || !Array.isArray(data.edges)) {
      throw new Error('Invalid flow file format');
    }
    const invalidNodes = data.nodes.filter(node => !nodeTypes[node.type]);
    if (invalidNodes.length > 0) {
      throw new Error(`Unknown node types: ${invalidNodes.map(n => n.type).join(', ')}`);
    }
    setNodes(data.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        updateNodeState: (nd) => updateNodeState(node.id, nd),
        removeNode,
      },
    })));
    setEdges(data.edges.map(edge => ({ ...migrateEdge(edge, data.nodes), data: edge.data || {} })));
    if (filePath !== null) setCurrentFilePath(filePath);
  }, [setNodes, setEdges, updateNodeState, removeNode]);

  // ── Save / Load ────────────────────────────────────────────────

  const saveToServer = async (path) => {
    await fetch(`/api/files/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: buildFlowData() }),
    });
    setCurrentFilePath(path);
  };

  const handleSave = useCallback(async () => {
    if (serverAvailable) {
      let path = currentFilePath;
      if (!path) {
        const raw = window.prompt('Save flow as:', 'my-flow');
        if (!raw) return;
        path = raw.endsWith('.json') ? raw : `${raw}.json`;
      }
      try {
        await saveToServer(path);
      } catch {
        alert('Failed to save to server.');
      }
      return;
    }

    // Fallback: browser download
    try {
      const json = JSON.stringify(buildFlowData(), null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flow.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Error saving flow. Please try again.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverAvailable, currentFilePath, nodes, edges]);

  const handleLoad = () => {
    if (serverAvailable) {
      setFileBrowserVisible(true);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    const cleanup = () => input.remove();
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) { cleanup(); return; }
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large (max 10 MB).');
        cleanup(); return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          restoreFlow(data, null);
        } catch (err) {
          alert(`Error loading flow: ${err.message}`);
        } finally {
          cleanup();
        }
      };
      reader.onerror = () => { alert('Error reading file.'); cleanup(); };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleOpenFile = useCallback((filePath, data) => {
    try {
      restoreFlow(data, filePath);
    } catch (err) {
      alert(`Error loading flow: ${err.message}`);
    }
  }, [restoreFlow]);

  const handleNewFile = useCallback((filePath, data) => {
    restoreFlow(data, filePath);
  }, [restoreFlow]);

  // ── Keyboard shortcuts ─────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement) return;

      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
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
  }, [selectedEdges, selectedNodes, setEdges, setNodes, handleSave]);

  // ── Add node ───────────────────────────────────────────────────

  const addNewNode = (nodeType) => {
    const id = (Math.random() * 1000).toString();
    let newNodePosition = { x: 200, y: 200 };
    if (nodes.length > 0) {
      newNodePosition = {
        x: nodes[nodes.length - 1].position.x + 200,
        y: nodes[nodes.length - 1].position.y,
      };
    }
    const newNode = {
      id,
      type: nodeType,
      data: {
        updateNodeState: (newData) => updateNodeState(id, newData),
        removeNode,
      },
      position: newNodePosition,
    };
    setNodes(nodes => [...nodes, newNode]);
  };

  // ── Layout helpers ─────────────────────────────────────────────

  // Left offset for the canvas: file panel width when visible, else 0
  const canvasLeftOffset = fileBrowserVisible && serverAvailable ? FILE_PANEL_WIDTH : 0;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="TopBar">

        {/* Brand */}
        <div className="TopBar-brand">
          <img src="logo.png" alt="Pluto" className="TopBar-brand-logo" />
          <span className="TopBar-brand-name">Pluto</span>
        </div>

        <div className="TopBar-divider" />

        {/* File panel toggle (only when server is running) */}
        {serverAvailable && (
          <button
            className={`topbar-btn tooltip ${fileBrowserVisible ? 'active' : ''}`}
            onClick={() => setFileBrowserVisible(v => !v)}
            title="Toggle file explorer"
          >
            <IconFolder size={15} />
            <span>Explorer</span>
            <span className="tooltiptext">Toggle file panel</span>
          </button>
        )}

        {/* Current file indicator */}
        {serverAvailable && currentFilePath && (
          <div className="TopBar-file-crumb">
            <IconFileDoc size={13} />
            <span className="TopBar-file-name">
              {currentFilePath.split('/').pop()}
            </span>
          </div>
        )}

        <div className="TopBar-spacer" />

        {/* Save */}
        <button className="topbar-btn topbar-btn-primary tooltip" onClick={handleSave}>
          <IconSave size={14} />
          <span>Save</span>
          <span className="tooltiptext">Save (Cmd/Ctrl+S)</span>
        </button>

        {/* Code output toggle */}
        <button
          className={`topbar-btn tooltip ${codeOutputVisible ? 'active' : ''}`}
          onClick={() => setCodeOutputVisible(!codeOutputVisible)}
        >
          <IconCode size={15} />
          <span>Code</span>
          <span className="tooltiptext">Toggle generated code</span>
        </button>

        {/* Info */}
        <button className="topbar-btn tooltip" onClick={() => setDisplayInfo(true)}>
          <IconInfo size={15} />
          <span className="tooltiptext">About Pluto</span>
        </button>

      </div>


      {/* ── FILE MANAGER PANEL ──────────────────────────────────── */}
      {serverAvailable && (
        <div style={{
          position: 'fixed',
          top: 'var(--topbar-height)',
          left: fileBrowserVisible ? '0' : `-${FILE_PANEL_WIDTH}px`,
          width: `${FILE_PANEL_WIDTH}px`,
          height: 'calc(100vh - var(--topbar-height))',
          zIndex: 50,
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: fileBrowserVisible ? '2px 0 8px rgba(23,43,77,0.10)' : 'none',
        }}>
          <FileManager
            currentFilePath={currentFilePath}
            onOpen={handleOpenFile}
            onNewFlow={handleNewFile}
            onCurrentPathChange={setCurrentFilePath}
          />
        </div>
      )}


      {/* ── LEFT SIDEBAR (node palette) ─────────────────────────── */}
      <div
        className="SideBar"
        style={{
          left: fileBrowserVisible && serverAvailable ? `${FILE_PANEL_WIDTH}px` : '0',
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="SideBar-header">Nodes</div>

        <div className="search-bar">
          <input
            type="search"
            placeholder="Search nodes…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="btn-list">
          {filteredGroups.map((group) => (
            <React.Fragment key={group.label}>
              {!searchTerm && (
                <div className="sidebar-group-label">{group.label}</div>
              )}
              {group.nodes.map((nodeType) => (
                <button
                  className={nodeTypeClass[nodeType] || 'node-type-custom'}
                  key={nodeType}
                  onClick={() => addNewNode(nodeType)}
                >
                  {nodeType.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>


      {/* ── INFO / WELCOME MODAL ────────────────────────────────── */}
      {displayInfo && (
        <Info onClose={() => setDisplayInfo(false)} />
      )}


      {/* ── CODE OUTPUT PANEL (right) ────────────────────────────── */}
      <div
        className="code-output-container"
        style={{
          right: 0,
          transform: codeOutputVisible ? 'translateX(0)' : `translateX(${CODE_PANEL_WIDTH + 22}px)`,
        }}
      >
        <div className="floating-button-container">
          <button
            className="floating-button"
            style={{ transform: codeOutputVisible ? 'scaleX(-1)' : 'scaleX(1)' }}
            onClick={() => setCodeOutputVisible(!codeOutputVisible)}
          >
            <IconCode size={14} />
          </button>
        </div>

        <div className="code-output-display-block" style={{ width: `${CODE_PANEL_WIDTH}px` }}>
          <CodeOutput data={nodes} edges={edges} />
        </div>
      </div>


      {/* ── REACT FLOW CANVAS ───────────────────────────────────── */}
      <div
        className="ReactFlowContainer"
        style={{
          paddingLeft: canvasLeftOffset + 220, // file panel + sidebar
        }}
      >
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onNodeClick={onNodeClick}
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
          <Background variant="dots" gap={gridSize} size={1} color="var(--canvas-dot-color)" />
        </ReactFlow>
      </div>
    </>
  );
};

export default MainApp;
