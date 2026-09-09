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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0c1811] border border-[#2C5F3E] shadow-2xl shadow-[#2C5F3E]/30 overflow-hidden font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C5F3E] bg-[#0e1f16]">
          <div className="flex items-center gap-2 text-[#CBA95D] text-xs font-serif uppercase tracking-widest font-bold">
            <FileText className="w-4 h-4 text-[#CBA95D]" />
            <span>BibTeX Citation Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper title info */}
        <div className="px-6 pt-5 pb-3">
          <h4 className="text-base font-serif font-bold text-[#F1F1F1] line-clamp-2">
            {publication.title}
          </h4>
          <p className="text-xs font-serif text-[#CBA95D] mt-1">
            {publication.venue} ({publication.year})
          </p>
        </div>

        {/* BibTeX Code Box */}
        <div className="p-6 pt-2">
          <div className="relative bg-[#060c08] border border-[#2C5F3E] p-4 font-mono text-xs text-[#DDC6A4] overflow-x-auto">
            <pre className="whitespace-pre-wrap selection:bg-[#2C5F3E] selection:text-[#F1F1F1]">{publication.bibtex}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C5F3E] bg-[#0e1f16]">
          <span className="text-xs font-serif text-[#DDC6A4]">
            Copy to clipboard for academic citation managers
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] border border-transparent hover:border-[#2C5F3E] transition-all"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif uppercase tracking-wider font-bold bg-[#2C5F3E] hover:bg-[#1e422b] text-[#F1F1F1] border border-[#CBA95D] shadow-md transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#CBA95D]" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#CBA95D]" />
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
