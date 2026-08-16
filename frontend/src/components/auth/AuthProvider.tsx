import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useProjectStore } from '../../store/projectStore';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAppStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        useProjectStore.getState().loadUserProjects(user.uid);
      }
    });
    return unsub;
  }, [setUser]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

export const signOut = async () => {
  await fbSignOut(auth);
};
