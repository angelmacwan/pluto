
import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store/appStore';
import { Copy, Download } from 'lucide-react';

export function CodePanel() {
  const { generatedCode, isCodePanelOpen, codeError } = useAppStore();

  if (!isCodePanelOpen) return null;

  return (
    <div className="w-[500px] h-full bg-gray-900 border-l border-gray-800 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <span className="font-semibold text-sm text-gray-300">Generated Python</span>
        <div className="flex gap-2">
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition" title="Copy">
            <Copy size={16} onClick={() => navigator.clipboard.writeText(generatedCode)} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition" title="Download">
            <Download size={16} onClick={() => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([generatedCode], {type: 'text/plain'}));
                a.download = 'main.py';
                a.click();
            }} />
          </button>
        </div>
      </div>
      {codeError && (
        <div className="bg-red-900/50 text-red-400 p-2 text-xs border-b border-red-900/50">
          {codeError}
        </div>
      )}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={generatedCode}
          options={{ readOnly: true, minimap: { enabled: false }, fontFamily: 'JetBrains Mono', fontSize: 13 }}
        />
      </div>
    </div>
  );
}
