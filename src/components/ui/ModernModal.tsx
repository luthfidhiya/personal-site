import { useEffect, type ReactNode } from "react";

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const ModernModal = ({
  isOpen,
  onClose,
  children,
}: ModernModalProps) => {
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
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-2xl bg-(--bg-card) border border-(--border-color) rounded-4xl flex flex-col shadow-2xl animate-[slideInUp_0.3s_ease-out] overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-(--bg-primary) border border-(--border-color) flex items-center justify-center text-(--text-primary) hover:bg-(--accent-pink) hover:text-white hover:border-(--accent-pink) transition-all z-20"
        >
          <i className="hn hn-cross text-lg"></i>
        </button>
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
