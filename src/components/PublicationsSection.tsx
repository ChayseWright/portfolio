import React from 'react';
import { 
  BookOpen, 
  Mail, 
  FileText
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { Publication } from '../data/portfolioData';

interface PublicationsSectionProps {
  onSelectBibtex: (pub: Publication) => void;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = () => {
  const { publications } = portfolioData;

  return (
    <section id="publications" className="py-24 relative bg-[#0c1811] border-t border-[#2C5F3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl font-serif">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/40 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>SCHOLARSHIP & PAPERS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1F1F1] tracking-tight">
              Publications & Working Papers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#DDC6A4]">
              Peer-reviewed journal articles, conference proceedings, and working manuscripts from the BYU Neuromechanics Research Group.
            </p>
          </div>

          <div className="flex items-center gap-3 font-serif">
            <a
              href="mailto:chaysew@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#CBA95D] bg-[#162e20] border border-[#CBA95D]/50 hover:border-[#CBA95D] transition-all"
            >
              <Mail className="w-4 h-4 text-[#CBA95D]" />
              <span>Inquire for Preprints</span>
            </a>
          </div>
        </div>

        {/* When empty, show clean, dignified academic placeholder */}
        {publications.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-[#0e1f16] border border-[#2C5F3E] font-serif max-w-3xl mx-auto shadow-xl">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#162e20] border border-[#CBA95D] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#CBA95D]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F1F1F1] mb-2">
              Manuscripts in Preparation
            </h3>
            <p className="text-sm sm:text-base text-[#DDC6A4] max-w-xl mx-auto leading-relaxed mb-6">
              Research publications and conference proceedings from ongoing doctoral studies in Brain-Computer Interfaces (BCI) and Neuromechanics at Brigham Young University will be documented here.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-[#CBA95D] bg-[#0a160f] border border-[#2C5F3E]">
              <span>Status: Doctoral Research in Progress</span>
            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
};
