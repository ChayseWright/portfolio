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
    <section id="publications" className="py-24 relative bg-[#09090B] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl font-serif">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#121215] text-[#9CA3AF] border border-[#27272A] mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>SCHOLARSHIP & PAPERS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#FFFFFF] tracking-tight">
              Publications & Working Papers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#9CA3AF]">
              Peer-reviewed journal articles, conference proceedings, and working manuscripts from the BYU Neuromechanics Research Group.
            </p>
          </div>

          <div className="flex items-center gap-3 font-serif">
            <a
              href="mailto:chaysew@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#F4F4F5] bg-[#121215] border border-[#27272A] hover:border-[#9CA3AF]/40 hover:bg-[#1E1E24] transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#9CA3AF]" />
              <span>Inquire for Preprints</span>
            </a>
          </div>
        </div>

        {/* When empty, show clean, dignified academic placeholder */}
        {publications.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-[#121215] border border-[#27272A] font-serif max-w-3xl mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#1E1E24] border border-[#27272A] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#FFFFFF]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FFFFFF] mb-2">
              Manuscripts in Preparation
            </h3>
            <p className="text-sm sm:text-base text-[#9CA3AF] max-w-xl mx-auto leading-relaxed mb-6">
              Research publications and conference proceedings from ongoing doctoral studies in Brain-Computer Interfaces (BCI) and Neuromechanics at Brigham Young University will be documented here.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-[#9CA3AF] bg-[#09090B] border border-[#27272A]">
              <span>Status: Doctoral Research in Progress</span>
            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
};
