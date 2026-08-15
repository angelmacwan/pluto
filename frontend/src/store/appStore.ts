import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Project } from '../types';

interface AppStore {
  user: FirebaseUser | null;
  setUser: (user: FirebaseUser | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  currentProjectId: string | null;
  setCurrentProject: (id: string | null) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isCodePanelOpen: boolean;
  toggleCodePanel: () => void;
  isOutputPanelOpen: boolean;
  toggleOutputPanel: () => void;
  theme: 'dark';
  bridgeUrl: string;
  setBridgeUrl: (url: string) => void;
  bridgeConnected: boolean;
  setBridgeConnected: (v: boolean) => void;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  requirements: string[];
  setRequirements: (reqs: string[]) => void;
  codeError: string | null;
  setCodeError: (err: string | null) => void;
  consoleOutput: string[];
  appendConsoleOutput: (line: string) => void;
  clearConsole: () => void;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  projects: [],
  setProjects: (projects) => set({ projects }),
  currentProjectId: null,
  setCurrentProject: (id) => set({ currentProjectId: id }),
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  isCodePanelOpen: true,
  toggleCodePanel: () => set((s) => ({ isCodePanelOpen: !s.isCodePanelOpen })),
  isOutputPanelOpen: false,
  toggleOutputPanel: () => set((s) => ({ isOutputPanelOpen: !s.isOutputPanelOpen })),
  theme: 'dark',
  bridgeUrl: 'ws://localhost:8765/ws',
  setBridgeUrl: (url) => set({ bridgeUrl: url }),
  bridgeConnected: false,
  setBridgeConnected: (v) => set({ bridgeConnected: v }),
  generatedCode: '',
  setGeneratedCode: (code) => set({ generatedCode: code }),
  requirements: [],
  setRequirements: (reqs) => set({ requirements: reqs }),
  codeError: null,
  setCodeError: (err) => set({ codeError: err }),
  consoleOutput: [],
  appendConsoleOutput: (line) => set((s) => ({ consoleOutput: [...s.consoleOutput, line] })),
  clearConsole: () => set({ consoleOutput: [] }),
  isRunning: false,
  setIsRunning: (v) => set({ isRunning: v })
}));
