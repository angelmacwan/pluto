import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useReactFlow } from '@xyflow/react';

export function useKeyboardShortcuts() {
  const { undo, redo, removeNode, removeEdge, copyNodes, pasteNodes } = useGraphStore();
  const rf = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        const nodes = rf.getNodes().filter(n => n.selected);
        if (nodes.length > 0) {
          copyNodes(nodes as any);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        pasteNodes();
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        const nodes = rf.getNodes().filter(n => n.selected);
        const edges = rf.getEdges().filter(e => e.selected);
        nodes.forEach(n => removeNode(n.id));
        edges.forEach(e => removeEdge(e.id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, removeNode, removeEdge, copyNodes, pasteNodes, rf]);
}
