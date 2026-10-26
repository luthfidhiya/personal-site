import { useEffect, type ReactNode } from "react";
import { PixelButton } from "./PixelButton";

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
}

export const PixelModal = ({
  isOpen,
  onClose,
  title = "MODAL_TITLE.EXE",
  children,
  onConfirm,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  showFooter = true,
}: PixelModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl bg-(--bg-card) pixel-border flex flex-col shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)] animate-[slideInUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-(--border-color) px-4 py-3 flex items-center justify-between border-b-4 border-(--border-color)">
          <span className="font-mono text-sm text-(--bg-primary)">
            {title}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="w-4 h-4 bg-(--accent-pink) border-2 border-(--border-color) hover:brightness-110 flex items-center justify-center"
            >
              <span className="sr-only">Close</span>
            </button>
            <div className="w-4 h-4 bg-(--accent-yellow) border-2 border-(--border-color)"></div>
            <div className="w-4 h-4 bg-(--accent-green) border-2 border-(--border-color)"></div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="bg-(--bg-card-alt) p-4 border-t-4 border-(--border-color) flex justify-end gap-4">
            <PixelButton variant="secondary" onClick={onClose} className="px-6 py-2">
              {cancelText}
            </PixelButton>
            {onConfirm && (
              <PixelButton variant="primary" onClick={onConfirm} className="px-6 py-2 group">
                <span className="group-hover:animate-ping mr-2">▶</span> {confirmText}
              </PixelButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
