
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
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast${t.type === 'error' ? ' toast-error' : t.type === 'success' ? ' toast-success' : ''}`}
        >
          <span style={{ flex: 1, fontSize: '0.875rem' }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              flexShrink: 0,
              fontSize: '1rem',
              color: 'var(--outline)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
