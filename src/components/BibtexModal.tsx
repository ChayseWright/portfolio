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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
            <FileText className="w-4 h-4" />
            <span>BibTeX Citation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper title info */}
        <div className="px-6 pt-4 pb-2">
          <h4 className="text-sm font-medium text-slate-200 line-clamp-2">
            {publication.title}
          </h4>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {publication.venue} ({publication.year})
          </p>
        </div>

        {/* BibTeX Code Box */}
        <div className="p-6 pt-2">
          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto">
            <pre className="whitespace-pre-wrap selection:bg-cyan-500/40">{publication.bibtex}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs font-mono text-slate-500">
            Click copy to add to your reference manager
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
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
