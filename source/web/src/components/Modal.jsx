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
        className="absolute inset-0 bg-brand-900/30 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Đóng modal"
      />
      <div
        className={`relative w-full ${widthClass} animate-rise rounded-3xl border border-brand-200/70 bg-white/95 p-6 shadow-[0_40px_90px_-60px_rgba(15,76,92,0.6)]`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h2 className="font-display text-2xl font-semibold text-brand-900">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-brand-900/70">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand-200 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
          >
            Đóng
          </button>
        </div>
        <div className="mt-5 grid gap-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
