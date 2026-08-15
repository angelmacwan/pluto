import { create } from 'zustand';
import type { Project, GraphState } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { useAppStore } from './appStore';
import { nanoid } from 'nanoid';

interface ProjectStore {
  loadUserProjects: (userId: string) => Promise<void>;
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string, userId: string) => Promise<void>;
  createProject: (name: string, graphState: GraphState, userId: string) => Promise<Project>;
}

export const useProjectStore = create<ProjectStore>((_set) => ({
  loadUserProjects: async (userId) => {
    const q = collection(db, `users/${userId}/projects`);
    const snap = await getDocs(q);
    const projects = snap.docs.map(d => d.data() as Project);
    useAppStore.getState().setProjects(projects);
  },
  saveProject: async (project) => {
    const ref = doc(db, `users/${project.userId}/projects`, project.id);
    await setDoc(ref, project);
    await useProjectStore.getState().loadUserProjects(project.userId);
  },
  deleteProject: async (projectId, userId) => {
    const ref = doc(db, `users/${userId}/projects`, projectId);
    await deleteDoc(ref);
    await useProjectStore.getState().loadUserProjects(userId);
  },
  createProject: async (name, graphState, userId) => {
    const newProj: Project = {
      id: nanoid(),
      name,
      description: '',
      graphState,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId
    };
    await useProjectStore.getState().saveProject(newProj);
    return newProj;
  }
}));
