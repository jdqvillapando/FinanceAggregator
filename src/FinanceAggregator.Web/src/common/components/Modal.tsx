import  React, { useEffect, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';


export interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
    title: string;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, isOpen, title, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') onClose();
        };

        // Prevent background scrolling
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 animate-fade-in'
            onClick = {(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            role = 'dialog'
            aria-modal = 'true'
        >
            <div className = 'bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100'>
                <div className = 'flex justify-between items-center mb-4'>
                    <h3 className = 'text-lg font-bold text-slate-800'>{title}</h3>
                    <button
                        type = 'button'
                        onClick = {onClose}
                        className = 'text-slate-400 hover:text-slate-600 transition-colors'
                    >
                        <X />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};