
import { useAppStore } from '../../store/appStore';
import { X, Trash2 } from 'lucide-react';

export function OutputPanel() {
  const { isOutputPanelOpen, toggleOutputPanel, consoleOutput, clearConsole } =
    useAppStore();

  if (!isOutputPanelOpen) return null;

  return (
    <div className="output-panel">
      <div className="output-panel-header">
        <span className="output-panel-tab">Console</span>
        <div className="output-panel-controls">
          <button
            className="output-panel-btn"
            title="Clear console"
            onClick={clearConsole}
          >
            <Trash2 size={14} />
          </button>
          <button
            className="output-panel-btn"
            title="Close"
            onClick={toggleOutputPanel}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="output-panel-body">
        {consoleOutput.length === 0 ? (
          <span className="output-panel-empty">No output yet…</span>
        ) : (
          consoleOutput.map((line, i) => (
            <div
              key={i}
              className={
                line.toLowerCase().includes('error')
                  ? 'output-panel-line-error'
                  : ''
              }
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
