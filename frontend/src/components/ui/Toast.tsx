
import { create } from 'zustand';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastStore {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(s => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(toast => toast.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg shadow-xl pointer-events-auto flex items-center justify-between min-w-[250px] animate-slide-in">
          <span className="text-sm">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-white ml-4">×</button>
        </div>
      ))}
    </div>
  );
}
