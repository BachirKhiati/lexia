import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ type, title, message, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-lexia-success" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-lexia-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-lexia-info" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-lexia-success/30 bg-lexia-success/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-lexia-warning/30 bg-lexia-warning/10';
      case 'info':
        return 'border-lexia-info/30 bg-lexia-info/10';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-lexia-success';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-lexia-warning';
      case 'info':
        return 'bg-lexia-info';
    }
  };

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[320px] max-w-md
        bg-lexia-surface border-2 ${getColorClasses()}
        rounded-xl shadow-glow-md overflow-hidden
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Progress bar */}
      <div className="h-1 bg-lexia-border/30">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-50 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lexia-text text-sm mb-1">{title}</h4>
            {message && (
              <p className="text-sm text-lexia-text-secondary leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-lexia-background rounded-lg transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-lexia-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
