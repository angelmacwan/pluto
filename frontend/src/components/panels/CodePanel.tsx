
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store/appStore';
import { useGraphStore } from '../../store/graphStore';
import { Copy, Download, Code2, Network } from 'lucide-react';

export function CodePanel() {
  const { generatedCode, isCodePanelOpen, codeError } = useAppStore();
  const toGraphState = useGraphStore((s) => s.toGraphState);
  const [activeTab, setActiveTab] = useState<'python' | 'json'>('python');

  if (!isCodePanelOpen) return null;

  const graphJson = JSON.stringify(toGraphState(), null, 2);
  const contentToDisplay = activeTab === 'python' ? generatedCode : graphJson;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay).catch(() => null);
  };

  const handleDownload = () => {
    const isPython = activeTab === 'python';
    const blob = new Blob([contentToDisplay], {
      type: isPython ? 'text/plain' : 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = isPython ? 'main.py' : 'graph.json';
    a.click();
  };

  return (
    <div className="code-panel animate-slide-in">
      <div className="code-panel-header">
        <div className="code-panel-tabs">
          <button
            className={`code-panel-tab ${activeTab === 'python' ? 'active' : ''}`}
            onClick={() => setActiveTab('python')}
          >
            <Code2 size={14} />
            <span>Python Code</span>
          </button>
          <button
            className={`code-panel-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Network size={14} />
            <span>Graph JSON</span>
          </button>
        </div>
        <div className="code-panel-actions">
          <button className="code-panel-btn" title="Copy" onClick={handleCopy}>
            <Copy size={14} />
          </button>
          <button className="code-panel-btn" title="Download" onClick={handleDownload}>
            <Download size={14} />
          </button>
        </div>
      </div>

      {codeError && activeTab === 'python' && (
        <div className="code-panel-error">{codeError}</div>
      )}

      <div className="code-panel-editor">
        <Editor
          key={activeTab}
          height="100%"
          defaultLanguage={activeTab === 'python' ? 'python' : 'json'}
          theme="vs"
          value={contentToDisplay}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontFamily: 'JetBrains Mono',
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}

