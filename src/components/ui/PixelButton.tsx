import type { ButtonHTMLAttributes } from "react";

type PixelButtonVariant = 'default' | 'primary' | 'secondary' | 'nav';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
}

export const PixelButton = ({ children, variant = 'default', className = '', ...props }: PixelButtonProps) => {
  const baseClasses = "font-pixel uppercase inline-flex items-center justify-center gap-2 no-underline cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_var(--pixel-shadow)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_var(--pixel-shadow)] pixel-border transition-all duration-200";
  
  const variants: Record<PixelButtonVariant, string> = {
    default: "bg-(--bg-card) text-(--text-primary) px-6 py-3 text-sm",
    primary: "bg-(--accent-pink) text-(--bg-primary) px-6 py-3 text-sm",
    secondary: "bg-(--accent-cyan) text-(--text-primary) px-6 py-3 text-sm",
    nav: "bg-(--accent-cyan) text-(--text-primary) px-3 py-2 text-sm pixel-border-sm",
  };

  return (
    <button className={`${baseClasses} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </button>
  );
};
