import React from 'react';

interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  withHatch?: boolean;
}

export const Frame: React.FC<FrameProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  withHatch = false,
  ...rest
}) => {
  return (
    // Outer page wrapper with cool-gray canvas ground per DESIGN.md
    <div
      data-testid="page-wrapper"
      className={`min-h-screen bg-canvas text-ink font-sans transition-colors ${wrapperClassName}`}
    >
      <main
        data-testid="main-frame"
        className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}
        {...rest}
      >
        {children}
      </main>
    </div>
  );
};

