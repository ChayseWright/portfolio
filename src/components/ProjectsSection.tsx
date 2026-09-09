import React from 'react';
import { 
  Wrench, 
  Cpu
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { Project } from '../data/portfolioData';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = () => {
  const { projects } = portfolioData;

  return (
    <section id="projects" className="py-24 relative bg-[#09140e] border-t border-[#2C5F3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 font-serif">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/40 mb-3">
            <Wrench className="w-3.5 h-3.5" />
            <span>ENGINEERING & SYSTEMS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1F1F1] tracking-tight">
            Hardware Rigs & Systems
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#DDC6A4]">
            Physical biomechatronic testbenches, experimental rigs, and neural interface pipelines designed within the BYU Neuromechanics Research Group.
          </p>
        </div>

        {/* When empty, show clean, dignified placeholder */}
        {projects.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-[#0e1f16] border border-[#2C5F3E] font-serif max-w-3xl mx-auto shadow-xl">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#162e20] border border-[#CBA95D] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#CBA95D]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F1F1F1] mb-2">
              Laboratory Systems & Hardware Development
            </h3>
            <p className="text-sm sm:text-base text-[#DDC6A4] max-w-xl mx-auto leading-relaxed mb-6">
              Experimental rigs, mechanical CAD designs, and computational BCI software frameworks will be documented here.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-[#CBA95D] bg-[#0a160f] border border-[#2C5F3E]">
              <span>Hardware & Modeling In Progress</span>
            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
};
