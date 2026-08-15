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
    <div className="h-screen w-screen flex flex-col bg-[#0d0f13] overflow-hidden text-gray-200 font-sans">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Node Palette */}
        {isSidebarOpen && (
          <div className="w-[260px] h-full flex-shrink-0 border-r border-gray-800 bg-gray-900 z-10 transition-all duration-300 shadow-xl">
            <NodePalette />
          </div>
        )}

        {/* Center - Canvas area */}
        <div className="flex-1 h-full relative flex flex-col min-w-0 bg-[#0d0f13] z-0">
          <div className="flex-1 relative w-full h-full">
            <ReactFlowProvider>
              <EditorCanvasWrapper />
            </ReactFlowProvider>
          </div>
          
          {/* Bottom Panel - Output Console */}
          {isOutputPanelOpen && (
            <div className="h-[250px] w-full flex-shrink-0 border-t border-gray-800 bg-gray-950 z-20 transition-all duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <OutputPanel />
            </div>
          )}
        </div>

        {/* Right Sidebar - Code Panel */}
        {isCodePanelOpen && (
          <div className="w-[500px] h-full flex-shrink-0 border-l border-gray-800 bg-gray-900 z-10 transition-all duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <CodePanel />
          </div>
        )}
      </div>
      
      <ToastContainer />
    </div>
  );
}

function EditorCanvasWrapper() {
  useKeyboardShortcuts();
  return <Canvas />;
}
