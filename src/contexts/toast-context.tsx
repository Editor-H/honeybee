"use client";

import React, { createContext, useContext, useState } from 'react';

interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'success' | 'error', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // 자동 제거
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="animate-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${
            toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {toast.type === 'info' && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>}
            {toast.type === 'success' && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-1 bg-white rounded transform rotate-45"></div>
            </div>}
            {toast.type === 'error' && <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-0.5 bg-white rounded"></div>
              <div className="w-2 h-0.5 bg-white rounded absolute transform rotate-90"></div>
            </div>}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
            >
              <span className="text-xs">✕</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}