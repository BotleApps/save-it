import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/components/Toast';

interface ToastConfig {
  message: string;
  type?: 'error' | 'success';
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = (toast: ToastConfig) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== toast));
    }, toast.duration || 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} />
      ))}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
