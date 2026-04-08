import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: type === 'success' ? '#16A34A' : '#DC2626',
        color: 'white',
      }}
    >
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};
