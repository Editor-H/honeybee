"use client";

import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'success':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-1 bg-white rounded transform rotate-45"></div>
        </div>;
      case 'error':
        return <X className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${getColors()}`}>
      {getIcon()}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}