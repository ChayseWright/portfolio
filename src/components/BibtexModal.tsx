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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-black border border-white/40 shadow-2xl shadow-white/5 overflow-hidden font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-neutral-950">
          <div className="flex items-center gap-2 text-white text-xs font-serif uppercase tracking-widest font-bold">
            <FileText className="w-4 h-4 text-neutral-400" />
            <span>BibTeX Citation Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper title info */}
        <div className="px-6 pt-5 pb-3">
          <h4 className="text-base font-serif font-bold text-white line-clamp-2">
            {publication.title}
          </h4>
          <p className="text-xs font-serif text-neutral-400 mt-1">
            {publication.venue} ({publication.year})
          </p>
        </div>

        {/* BibTeX Code Box */}
        <div className="p-6 pt-2">
          <div className="relative bg-neutral-950 border border-white/20 p-4 font-mono text-xs text-neutral-200 overflow-x-auto">
            <pre className="whitespace-pre-wrap selection:bg-white selection:text-black">{publication.bibtex}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/20 bg-neutral-950">
          <span className="text-xs font-serif text-neutral-400">
            Copy to clipboard for academic citation managers
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-white/30 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif uppercase tracking-wider font-bold bg-white hover:bg-neutral-200 text-black border border-white shadow-md transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-black" />
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
