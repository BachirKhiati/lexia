import { XCircle, AlertCircle, Wifi, Clock } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  details?: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorAlert({
  message,
  details,
  type = 'error',
  onDismiss,
  className = '',
}: ErrorAlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      text: 'text-red-200',
      icon: 'text-red-400',
      IconComponent: XCircle,
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500',
      text: 'text-yellow-200',
      icon: 'text-yellow-400',
      IconComponent: AlertCircle,
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500',
      text: 'text-blue-200',
      icon: 'text-blue-400',
      IconComponent: AlertCircle,
    },
  };

  const style = styles[type];
  const Icon = style.IconComponent;

  // Check if this is a network error
  const isNetworkError = message.toLowerCase().includes('network') ||
                         message.toLowerCase().includes('connection');
  const isTimeoutError = message.toLowerCase().includes('timeout');

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`${style.icon} flex-shrink-0 mt-0.5`}>
          {isNetworkError ? (
            <Wifi className="w-5 h-5" />
          ) : isTimeoutError ? (
            <Clock className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${style.text} mb-1`}>{message}</h3>
          {details && (
            <p className={`text-sm ${style.text} opacity-90`}>{details}</p>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${style.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Dismiss"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
