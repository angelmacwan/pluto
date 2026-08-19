import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Braces, Loader2 } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

  const inferredFunction = inferFunctionDefinition(code);
  const hasReturnStatement = /^\s*return\b/m.test(code);
  const isValid = Boolean(inferredFunction && hasReturnStatement);

  const { currentProjectId, projects } = useAppStore();
  const { saveProject } = useProjectStore();

  const labelRef = useRef<HTMLInputElement>(null);

  // Focus label input on mount
  useEffect(() => {
    const timeout = setTimeout(() => labelRef.current?.focus(), 80);
    return () => clearTimeout(timeout);
  }, []);

  // Escape key closes the modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    setError('');
    if (!label.trim()) {
      setError('Node label is required.');
      labelRef.current?.focus();
      return;
    }
    if (!isValid) {
      setError('Add a valid Python function definition with a return statement.');
      return;
    }

    const currentProject = projects.find(p => p.id === currentProjectId);
    if (!currentProject) {
      setError('No active project found.');
      return;
    }

    const newCustomNode: CustomNodeDef = {
      id: `custom_${nanoid()}`,
      name: inferredFunction!.name,
      label: label.trim(),
      description: description.trim(),
      inputs: inferredFunction!.inputs,
      output: inferredFunction!.output,
      code,
    };

    const updatedProject = {
      ...currentProject,
      customNodes: [...(currentProject.customNodes || []), newCustomNode],
      updatedAt: Date.now(),
    };

    setIsSaving(true);
    try {
      await saveProject(updatedProject);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save custom node. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className="custom-node-modal-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="custom-node-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-node-modal-title"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="custom-node-modal-header">
          <div className="custom-node-modal-heading">
            <span className="custom-node-modal-heading-icon">
              <Sparkles size={17} />
            </span>
            <div>
              <p className="custom-node-modal-kicker">Node builder</p>
              <h2 id="custom-node-modal-title" className="custom-node-modal-title">
                Create Custom Node
              </h2>
              <p className="custom-node-modal-subtitle">
                Define a reusable Python step for your workflow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close custom node dialog"
            className="custom-node-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="custom-node-modal-scroll">

          {/* Error banner */}
          {error && (
            <div className="custom-node-modal-error" role="alert">
              {error}
            </div>
          )}

          {/* Identity section: Label + Description */}
          <div className="custom-node-modal-identity">
            <div className="custom-node-modal-field">
              <label htmlFor="cnm-label" className="custom-node-modal-field-label">
                Node label <span className="custom-node-modal-field-required">*</span>
              </label>
              <input
                id="cnm-label"
                ref={labelRef}
                type="text"
                className="custom-node-modal-input"
                value={label}
                onChange={e => { setLabel(e.target.value); if (error) setError(''); }}
                placeholder="e.g. My Custom Fetch"
                autoComplete="off"
              />
            </div>

            <div className="custom-node-modal-field">
              <label htmlFor="cnm-description" className="custom-node-modal-field-label">
                Description
                <span className="custom-node-modal-field-optional">optional</span>
              </label>
              <input
                id="cnm-description"
                type="text"
                className="custom-node-modal-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does this node do?"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Python logic section */}
          <div className="custom-node-modal-code-section">
            <div className="custom-node-modal-code-heading">
              <div>
                <label htmlFor="cnm-code" className="custom-node-modal-field-label">
                  Python logic
                </label>
                <p className="custom-node-modal-code-hint">
                  The function name, inputs, and output type are inferred automatically.
                </p>
              </div>
              <span className="custom-node-modal-code-badge">
                <Braces size={12} />
                Python
              </span>
            </div>

            <textarea
              id="cnm-code"
              className="custom-node-modal-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={'def my_function(arg1):\n    return arg1 * 2'}
              spellCheck={false}
              onKeyDown={e => {
                // Allow Tab to insert 4 spaces instead of moving focus
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const { selectionStart, selectionEnd } = el;
                  const next = `${el.value.slice(0, selectionStart)}    ${el.value.slice(selectionEnd)}`;
                  setCode(next);
                  // Restore cursor after state update
                  requestAnimationFrame(() => {
                    el.selectionStart = selectionStart + 4;
                    el.selectionEnd = selectionStart + 4;
                  });
                }
              }}
            />

            {/* Inferred signature preview */}
            <div className={`custom-node-modal-signature${isValid ? '' : ' is-invalid'}`}>
              <span className="custom-node-modal-signature-label">Inferred interface</span>
              <code>
                {inferredFunction
                  ? `${inferredFunction.name}(${inferredFunction.inputs.map(i => i.id).join(', ')}) → ${inferredFunction.output.label}`
                  : 'Write a function definition to preview its interface'}
              </code>
            </div>
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="custom-node-modal-footer">
          <button
            onClick={onClose}
            className="custom-node-modal-cancel"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="custom-node-modal-save"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="custom-node-modal-save-spinner" />
                Saving…
              </>
            ) : (
              'Save Node'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
