import React from 'react';

interface DecoDividerProps {
  className?: string;
}

export const DecoDivider: React.FC<DecoDividerProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 py-4 select-none ${className}`}>
      <span className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-[#C87D55]/30 to-[#C87D55]/70" />
      <span className="w-1.5 h-1.5 rotate-45 border border-[#C87D55] bg-[#09090B]" />
      <span className="text-[10px] text-[#C87D55] font-serif tracking-widest">◈</span>
      <span className="w-1.5 h-1.5 rotate-45 border border-[#C87D55] bg-[#09090B]" />
      <span className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent via-[#C87D55]/30 to-[#C87D55]/70" />
    </div>
  );
};
