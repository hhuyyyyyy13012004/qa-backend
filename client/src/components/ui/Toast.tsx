import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${styles[type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
