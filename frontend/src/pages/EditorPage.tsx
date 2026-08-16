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

export function EditorPage() {
  useCodegen();
  useBridge();

  const { isSidebarOpen, isCodePanelOpen, isOutputPanelOpen } = useAppStore();

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
