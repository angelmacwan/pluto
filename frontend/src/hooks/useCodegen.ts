import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useAppStore } from '../store/appStore';
import { generateCode } from '../lib/codegen';

export function useCodegen() {
  const { nodes, edges } = useGraphStore();
  const { setGeneratedCode, setRequirements, setCodeError } = useAppStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      const { code, requirements, error } = generateCode(nodes, edges);
      setGeneratedCode(code);
      setRequirements(requirements);
      setCodeError(error);
    }, 500);

    return () => clearTimeout(handler);
  }, [nodes, edges, setGeneratedCode, setRequirements, setCodeError]);

  return { 
    code: useAppStore(s => s.generatedCode), 
    requirements: useAppStore(s => s.requirements), 
    error: useAppStore(s => s.codeError) 
  };
}
