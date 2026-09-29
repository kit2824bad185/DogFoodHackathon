import { useState, useCallback, type FC, type ReactNode } from 'react';
import { ToastContext, type ToastMessage, type ToastType } from './ToastContext';
import { Icon } from './Icon';

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  const typeConfigs: Record<
    ToastType,
    { icon: 'check-circle' | 'x-circle' | 'alert-triangle' | 'info'; bg: string; text: string; border: string }
  > = {
    success: {
      icon: 'check-circle',
      bg: 'var(--status-eligible-bg)',
      text: 'var(--status-eligible-text)',
      border: 'var(--status-eligible-border)',
    },
    error: {
      icon: 'x-circle',
      bg: 'var(--status-ineligible-bg)',
      text: 'var(--status-ineligible-text)',
      border: 'var(--status-ineligible-border)',
    },
    warning: {
      icon: 'alert-triangle',
      bg: 'var(--status-pending-bg)',
      text: 'var(--status-pending-text)',
      border: 'var(--status-pending-border)',
    },
    info: {
      icon: 'info',
      bg: 'var(--status-progress-bg)',
      text: 'var(--status-progress-text)',
      border: 'var(--status-progress-border)',
    },
  };

  const config = typeConfigs[toast.type];

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${config.border}`,
        borderLeft: `4px solid ${config.text}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ color: config.text, marginTop: '1px' }}>
        <Icon name={config.icon} size={18} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            {toast.message}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onClose}
        style={{
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
};
