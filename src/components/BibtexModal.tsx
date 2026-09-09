import React, { useState } from 'react';
import { Copy, Check, X, FileText } from 'lucide-react';
import type { Publication } from '../data/portfolioData';

interface BibtexModalProps {
  publication: Publication | null;
  onClose: () => void;
}

export const BibtexModal: React.FC<BibtexModalProps> = ({ publication, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!publication) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publication.bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#121215] border border-[#27272A] shadow-2xl shadow-black overflow-hidden font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A] bg-[#121215]">
          <div className="flex items-center gap-2 text-[#FFFFFF] text-xs font-serif uppercase tracking-widest font-bold">
            <FileText className="w-4 h-4 text-[#9CA3AF]" />
            <span>BibTeX Citation Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1E1E24] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper title info */}
        <div className="px-6 pt-5 pb-3">
          <h4 className="text-base font-serif font-bold text-[#FFFFFF] line-clamp-2">
            {publication.title}
          </h4>
          <p className="text-xs font-serif text-[#9CA3AF] mt-1">
            {publication.venue} ({publication.year})
          </p>
        </div>

        {/* BibTeX Code Box */}
        <div className="p-6 pt-2">
          <div className="relative bg-[#09090B] border border-[#27272A] p-4 font-mono text-xs text-[#F4F4F5] overflow-x-auto">
            <pre className="whitespace-pre-wrap selection:bg-[#FFFFFF] selection:text-[#09090B]">{publication.bibtex}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#27272A] bg-[#121215]">
          <span className="text-xs font-serif text-[#9CA3AF]">
            Copy to clipboard for academic citation managers
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1E1E24] border border-[#27272A] transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif uppercase tracking-wider font-bold bg-[#FFFFFF] hover:bg-[#F4F4F5] text-[#09090B] border border-[#FFFFFF] shadow-md transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#09090B]" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#09090B]" />
                  <span>Copy BibTeX</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
