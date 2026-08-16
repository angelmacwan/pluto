import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { TopBar } from '../components/ui/TopBar';
import { NodePalette } from '../components/sidebar/NodePalette';
import { Canvas } from '../components/canvas/Canvas';
import { CodePanel } from '../components/panels/CodePanel';
import { OutputPanel } from '../components/panels/OutputPanel';
import { ToastContainer } from '../components/ui/Toast';
import { useCodegen } from '../hooks/useCodegen';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useBridge } from '../hooks/useBridge';
import { useAppStore } from '../store/appStore';
import { useGraphStore } from '../store/graphStore';

export function EditorPage() {
  useCodegen();
  useBridge();

  const { projectId } = useParams<{ projectId: string }>();
  const { isSidebarOpen, isCodePanelOpen, isOutputPanelOpen, projects, setCurrentProject } = useAppStore();
  const { loadGraph } = useGraphStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      const proj = projects.find((p) => p.id === projectId);
      if (proj && proj.graphState) {
        loadGraph(proj.graphState);
      }
    } else {
      setCurrentProject(null);
    }
  }, [projectId, projects, loadGraph, setCurrentProject]);

  return (
    <div className="pluto-root">
      <TopBar showBack />

      <div className="editor-workspace">
        {/* Left Sidebar — Node Palette */}
        {isSidebarOpen && <NodePalette />}

        {/* Centre — Canvas + Output Panel */}
        <div className="canvas-area">
          <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
            <ReactFlowProvider>
              <EditorCanvasWrapper />
            </ReactFlowProvider>
          </div>

          {isOutputPanelOpen && <OutputPanel />}
        </div>

        {/* Right Sidebar — Code Panel */}
        {isCodePanelOpen && <CodePanel />}
      </div>

      <ToastContainer />
    </div>
  );
}

function EditorCanvasWrapper() {
  useKeyboardShortcuts();
  return <Canvas />;
}
