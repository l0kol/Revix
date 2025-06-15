
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-creator-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-creator-text-secondary hover:text-creator-text-primary transition-colors"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
    