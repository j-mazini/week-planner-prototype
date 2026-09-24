'use client';
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Delay para animação de saída
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const bgColor = type === 'success' 
    ? 'bg-gradient-to-r from-green-500 to-green-600' 
    : 'bg-gradient-to-r from-red-500 to-red-600';
  const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';

  return (
    <div 
      className={`fixed top-20 right-6 z-[10000] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`${bgColor} text-white px-5 py-3.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center gap-3 min-w-[300px] max-w-[400px] animate-fadeInUp`}>
        <div className="flex-shrink-0">
          <i className={`bi ${icon} text-xl`}></i>
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/20"
          aria-label="Close"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>
      </div>
    </div>
  );
};

