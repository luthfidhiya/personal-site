import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  id?: string;
  subtitle?: string;
}

export const SectionTitle = ({ children, id, subtitle }: SectionTitleProps) => {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <h2
          className="font-pixel text-2xl md:text-4xl text-(--text-primary) tracking-tight uppercase"
          id={id}
        >
          {children}
        </h2>
      </div>
      {subtitle && (
        <p className="font-mono text-sm sm:text-base text-(--text-secondary) opacity-70 mt-4 max-w-lg mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};
