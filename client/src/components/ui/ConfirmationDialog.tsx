import type { FC, ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-ineligible-bg)',
              color: 'var(--status-ineligible-text)',
            }}
          >
            <Icon name="alert-triangle" size={24} />
          </div>
        );
      case 'warning':
        return (
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-pending-bg)',
              color: 'var(--status-pending-text)',
            }}
          >
            <Icon name="alert-circle" size={24} />
          </div>
        );
      case 'primary':
        return (
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
            }}
          >
            <Icon name="help-circle" size={24} />
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'warning' ? 'primary' : variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        {getIcon()}
        <div>
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {title}
          </h3>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </Modal>
  );
};
