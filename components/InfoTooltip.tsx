'use client';

import { useState } from 'react';

interface InfoTooltipProps {
  children: React.ReactNode;
  content: string;
}

export function InfoTooltip({ children, content }: InfoTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help underline decoration-dotted"
      >
        {children}
      </span>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-background border border-subtle rounded-lg shadow-lg text-xs z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 border-r border-b border-subtle bg-background rotate-45"></div>
        </div>
      )}
    </span>
  );
}
