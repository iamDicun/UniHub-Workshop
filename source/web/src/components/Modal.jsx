import React, { useEffect } from 'react';

const Modal = ({ isOpen, title, description, onClose, children, size = 'lg' }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const widthClass = size === 'xl' ? 'max-w-4xl' : size === 'sm' ? 'max-w-md' : 'max-w-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-primary/15"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Đóng modal"
      />
      <div
        className={`relative flex max-h-[85vh] w-full flex-col ${widthClass} animate-rise rounded-xl border border-border bg-surface shadow-modal`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6">
          <div>
            {title ? (
              <h2 className="font-display text-xl font-semibold text-primary">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
          >
            Đóng
          </button>
        </div>
        <div className="mt-5 grid gap-5 overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
