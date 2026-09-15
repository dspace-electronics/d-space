'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'>) => void;
  showToast: (title: string, description?: string, variant?: 'default' | 'success' | 'error' | 'info') => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', action }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, title, description, variant, action };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      setTimeout(() => {
        removeToast(id);
      }, 3600);
    },
    [removeToast]
  );

  const showToast = useCallback(
    (title: string, description?: string, variant: 'default' | 'success' | 'error' | 'info' = 'default') => {
      toast({ title, description, variant });
    },
    [toast]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: 'success' });
    },
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: 'error' });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: 'info' });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, showToast, success, error, info }}>
      {children}
      {/* Toast Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.94 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto flex items-start gap-3 bg-white/95 backdrop-blur-md border border-neutral-200/90 text-neutral-900 rounded-xl p-3.5 shadow-xl shadow-black/5"
            >
              <div className="shrink-0 mt-0.5">
                {item.variant === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {item.variant === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                {item.variant === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                {item.variant === 'default' && <Info className="w-4 h-4 text-neutral-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-950 leading-tight">{item.title}</p>
                {item.description && (
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{item.description}</p>
                )}
                {item.action && (
                  <button
                    onClick={() => {
                      item.action?.onClick();
                      removeToast(item.id);
                    }}
                    className="mt-1.5 text-[11px] font-medium text-[#6366f1] hover:underline"
                  >
                    {item.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-neutral-400 hover:text-neutral-700 p-0.5 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
