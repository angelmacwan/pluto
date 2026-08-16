
import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store/appStore';
import { Copy, Download } from 'lucide-react';

export function CodePanel() {
  const { generatedCode, isCodePanelOpen, codeError } = useAppStore();

  if (!isCodePanelOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).catch(() => null);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([generatedCode], { type: 'text/plain' })
    );
    a.download = 'main.py';
    a.click();
  };

  return (
    <div className="code-panel animate-slide-in">
      <div className="code-panel-header">
        <span className="code-panel-title">Generated Python</span>
        <div className="code-panel-actions">
          <button className="code-panel-btn" title="Copy" onClick={handleCopy}>
            <Copy size={14} />
          </button>
          <button className="code-panel-btn" title="Download" onClick={handleDownload}>
            <Download size={14} />
          </button>
        </div>
      </div>

      {codeError && (
        <div className="code-panel-error">{codeError}</div>
      )}

      <div className="code-panel-editor">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs"
          value={generatedCode}
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
