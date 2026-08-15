import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';

export function useBridge() {
  const { 
    bridgeUrl, 
    setBridgeConnected, 
    appendConsoleOutput, 
    setIsRunning, 
    isRunning 
  } = useAppStore();
  const wsRef = useRef<WebSocket | null>(null);

  const checkConnection = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setBridgeConnected(true);
      return;
    }
    const ws = new WebSocket(bridgeUrl);
    ws.onopen = () => setBridgeConnected(true);
    ws.onclose = () => setBridgeConnected(false);
    ws.onerror = () => setBridgeConnected(false);
    ws.onmessage = (e) => {
      appendConsoleOutput(e.data);
    };
    wsRef.current = ws;
  };

  useEffect(() => {
    checkConnection();
    return () => {
      wsRef.current?.close();
    };
  }, [bridgeUrl]);

  const runCode = async (code: string) => {
    setIsRunning(true);
    try {
      const res = await fetch(bridgeUrl.replace('ws://', 'http://').replace('/ws', '/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      appendConsoleOutput(data.output || 'Run completed.');
    } catch (e) {
      appendConsoleOutput(`Error: ${e}`);
    } finally {
      setIsRunning(false);
    }
  };

  const installRequirements = async (packages: string[]) => {
    appendConsoleOutput(`Installing: ${packages.join(', ')}...`);
    try {
      const res = await fetch(bridgeUrl.replace('ws://', 'http://').replace('/ws', '/install'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages })
      });
      const data = await res.json();
      appendConsoleOutput(data.output || 'Installed.');
    } catch (e) {
      appendConsoleOutput(`Error installing: ${e}`);
    }
  };

  return { isConnected: useAppStore(s => s.bridgeConnected), isRunning, runCode, installRequirements, checkConnection };
}
