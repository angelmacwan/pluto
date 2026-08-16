import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Braces } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useProjectStore } from '../../store/projectStore';
import type { CustomNodeDef, HandleDef } from '../../types';
import { nanoid } from 'nanoid';

interface InferredFunction {
  name: string;
  inputs: HandleDef[];
  output: HandleDef;
}

function splitParameters(parameters: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = '';

  for (let index = 0; index < parameters.length; index += 1) {
    const character = parameters[index];
    if (quote) {
      if (character === quote && parameters[index - 1] !== '\\') quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if ('([{'.includes(character)) depth += 1;
    else if (')]}'.includes(character)) depth -= 1;
    else if (character === ',' && depth === 0) {
      parts.push(parameters.slice(start, index).trim());
      start = index + 1;
    }
  }

  const last = parameters.slice(start).trim();
  if (last) parts.push(last);
  return parts;
}

function inferHandleType(annotation: string): HandleDef['type'] {
  const normalized = annotation.toLowerCase().replace(/['" ]/g, '');
  if (normalized.includes('bool')) return 'bool';
  if (normalized.includes('str')) return 'string';
  if (normalized.includes('float') || normalized.includes('int') || normalized.includes('number')) return 'number';
  if (normalized.includes('list') || normalized.includes('tuple')) return 'list';
  if (normalized.includes('dict') || normalized.includes('mapping')) return 'dict';
  return 'any';
}

function inferFunctionDefinition(code: string): InferredFunction | null {
  const match = /(^|\n)\s*def\s+([A-Za-z_]\w*)\s*\(/m.exec(code);
  if (!match || match.index === undefined) return null;

  const openParen = code.indexOf('(', match.index);
  let depth = 1;
  let closeParen = openParen + 1;
  while (closeParen < code.length && depth > 0) {
    if (code[closeParen] === '(') depth += 1;
    if (code[closeParen] === ')') depth -= 1;
    closeParen += 1;
  }
  if (depth !== 0) return null;

  const parameters = code.slice(openParen + 1, closeParen - 1);
  const afterSignature = code.slice(closeParen);
  const colonIndex = afterSignature.indexOf(':');
  if (colonIndex < 0) return null;
  const returnMatch = /^\s*->\s*([^:]+):/.exec(afterSignature.slice(0, colonIndex + 1));
  const returnAnnotation = returnMatch?.[1]?.trim() || '';

  const inputs = splitParameters(parameters)
    .filter(parameter => parameter && !parameter.startsWith('/'))
    .map(parameter => ({
      parameter,
      id: parameter.replace(/^\*{1,2}/, '').split('=')[0].split(':')[0].trim(),
    }))
    .filter(({ id }) => Boolean(id))
    .map(({ parameter, id }) => {
      const annotation = parameter.split(':')[1]?.split('=')[0].trim() || '';
      const optional = parameter.includes('=') || parameter.trim().startsWith('*');
      return { id, label: id, type: inferHandleType(annotation), optional };
    });

  return {
    name: match[2],
    inputs,
    output: { id: 'out', label: 'return', type: inferHandleType(returnAnnotation) },
  };
}

interface CustomNodeModalProps {
  onClose: () => void;
}

export function CustomNodeModal({ onClose }: CustomNodeModalProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('def custom_function(arg1):\n    return arg1');
  const [error, setError] = useState('');
  const inferredFunction = inferFunctionDefinition(code);
  const hasReturnStatement = /^\s*return\b/m.test(code);

  const { currentProjectId, projects } = useAppStore();
  const { saveProject } = useProjectStore();

  const handleSave = async () => {
    if (!label.trim()) return setError('Label is required');
    if (!inferredFunction || !/^\s*return\b/m.test(code)) return setError('Add a valid Python function definition with a return statement');
    
    const currentProject = projects.find(p => p.id === currentProjectId);
    if (!currentProject) return setError('No active project found');

    const newCustomNode: CustomNodeDef = {
      id: `custom_${nanoid()}`,
      name: inferredFunction.name,
      label: label.trim(),
      description: description.trim(),
      inputs: inferredFunction.inputs,
      output: inferredFunction.output,
      code: code
    };

    const updatedProject = {
      ...currentProject,
      customNodes: [...(currentProject.customNodes || []), newCustomNode],
      updatedAt: Date.now()
    };

    try {
      await saveProject(updatedProject);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save custom node to project');
    }
  };

  return createPortal(
    <div className="custom-node-modal-backdrop" role="presentation">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all" role="dialog" aria-modal="true" aria-labelledby="custom-node-modal-title" style={{ background: 'var(--surface-container-lowest)', borderRadius: '12px', boxShadow: '0 40px 40px -10px rgba(25, 28, 28, 0.06)' }}>
        <div className="custom-node-modal-header">
          <div className="custom-node-modal-heading">
            <span className="custom-node-modal-heading-icon"><Sparkles size={17} /></span>
            <div>
              <p className="custom-node-modal-kicker">Node builder</p>
              <h2 id="custom-node-modal-title" className="text-xl font-bold font-headline" style={{ color: 'var(--primary)', letterSpacing: '-0.04em' }}>Create Custom Node</h2>
              <p className="custom-node-modal-subtitle">Define a reusable Python step for your workflow.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close custom node dialog" className="custom-node-modal-close">
            <X size={22} />
          </button>
        </div>
        
        <div className="custom-node-modal-scroll flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="px-4 py-3 text-sm rounded-xl border font-medium" style={{ background: 'var(--error-container)', color: 'var(--error)', borderColor: 'rgba(186,26,26,0.2)' }}>
              {error}
            </div>
          )}

          <div className="custom-node-modal-identity grid grid-cols-1 gap-5">
            <div>
              <label className="block text-[0.88rem] font-semibold mb-1.5" style={{ color: 'var(--on-surface-variant)' }}>Node Label (UI)</label>
              <input
                type="text"
                className="w-full transition-all focus:outline-none"
                style={{ 
                  minHeight: '40px', padding: '0.55rem 0.75rem', borderRadius: '12px',
                  border: '1px solid rgba(18, 40, 60, 0.12)', background: 'rgba(255, 255, 255, 0.92)', color: 'var(--on-surface)', fontSize: '0.88rem' 
                }}
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. My Custom Fetch"
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(18, 40, 60, 0.3)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(18, 40, 60, 0.08)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(18, 40, 60, 0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.88rem] font-semibold mb-1.5" style={{ color: 'var(--on-surface-variant)' }}>Description (optional)</label>
            <input
              type="text"
              className="w-full transition-all focus:outline-none"
              style={{ 
                minHeight: '40px', padding: '0.55rem 0.75rem', borderRadius: '12px',
                border: '1px solid rgba(18, 40, 60, 0.12)', background: 'rgba(255, 255, 255, 0.92)', color: 'var(--on-surface)', fontSize: '0.88rem' 
              }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this node do?"
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(18, 40, 60, 0.3)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(18, 40, 60, 0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(18, 40, 60, 0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <div className="custom-node-modal-code-heading">
              <div>
                <label className="block text-[0.88rem] font-semibold mb-1" style={{ color: 'var(--on-surface-variant)' }}>Python Logic</label>
                <p className="text-[0.8rem] mb-2.5" style={{ color: 'var(--secondary)' }}>Define the function below. Its name, inputs, and output are inferred from this definition.</p>
              </div>
              <span className="custom-node-modal-code-badge"><Braces size={13} /> Python</span>
            </div>
            <textarea
              className="custom-node-modal-code w-full h-44 p-4 font-mono transition-all focus:outline-none"
              style={{ 
                borderRadius: '12px', border: '1px solid rgba(18, 40, 60, 0.12)', 
                background: 'rgba(255, 255, 255, 0.92)', color: 'var(--on-surface)', fontSize: '0.86rem', lineHeight: '1.6'
              }}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="def my_function(arg1):&#10;    return arg1 * 2"
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(18, 40, 60, 0.3)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(18, 40, 60, 0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(18, 40, 60, 0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div className={`custom-node-modal-signature ${inferredFunction && hasReturnStatement ? '' : 'is-invalid'}`}>
              <span className="custom-node-modal-signature-label">Inferred interface</span>
              <code>
                {inferredFunction
                  ? `${inferredFunction.name}(${inferredFunction.inputs.map(input => input.id).join(', ')}) → ${inferredFunction.output.label}`
                  : 'Write a function definition to preview its interface'}
              </code>
            </div>
          </div>
        </div>
        
        <div className="custom-node-modal-footer px-6 py-5 border-t flex justify-end gap-3" style={{ background: 'var(--surface-container-low)', borderColor: 'var(--outline-variant)' }}>
          <button onClick={onClose} className="custom-node-modal-cancel px-5 py-2.5 text-[0.88rem] font-bold rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="custom-node-modal-save px-5 py-2.5 text-[0.88rem] font-bold rounded-lg transition-all">
            Save Custom Node
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
