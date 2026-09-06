import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  action,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200',
      text: 'text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
  }[type];

  return (
    <div className={`rounded-xl border p-4 ${styles.bg} ${styles.border} ${styles.text} ${className}`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 text-sm">
          {title && <h4 className="font-semibold mb-0.5 tracking-tight">{title}</h4>}
          <div className="opacity-90 leading-relaxed text-xs sm:text-sm">{message}</div>
          {action && <div className="mt-3">{action}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition duration-150"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
