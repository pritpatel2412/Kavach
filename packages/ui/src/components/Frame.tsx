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
    // Outer page wrapper with exact padding p-3 sm:p-6 lg:p-10 on body bg #e3e8dc
    <div
      data-testid="page-wrapper"
      className={`min-h-screen bg-[#e3e8dc] p-3 sm:p-6 lg:p-10 font-body transition-colors ${wrapperClassName}`}
    >
      {/* Main frame: relative, overflow-hidden, rounded-[28px], background gradient */}
      <main
        data-testid="main-frame"
        className={`relative overflow-hidden rounded-[28px] min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-5rem)] border border-white/10 shadow-2xl text-white/90 ${className}`}
        style={{
          background: 'linear-gradient(160deg, #0a2a12 0%, #0d3617 45%, #0a2a12 100%)',
        }}
        {...rest}
      >
        {children}
      </main>
    </div>
  );
};
