import React from 'react';
import { X, ExternalLink, Cpu, Wrench } from 'lucide-react';
import { GithubIcon, YoutubeIcon, ColabIcon } from './Icons';
import type { Project } from '../data/portfolioData';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bci':
        return 'Neural Decoding & BCI';
      case 'simulation':
        return 'Thermodynamics & Graph Simulation';
      case 'software':
        return 'NLP & Knowledge Engineering';
      default:
        return category.toUpperCase();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0c1811] border border-[#2C5F3E] shadow-2xl shadow-[#2C5F3E]/40 font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#2C5F3E] bg-[#0e1f16]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs uppercase tracking-widest bg-[#162e20] text-[#CBA95D] border border-[#2C5F3E]">
              {getCategoryLabel(project.category)}
            </span>
            <span className="text-xs text-[#DDC6A4]">Technical Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#F1F1F1] mb-2 leading-tight">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="text-sm font-serif italic text-[#CBA95D]">
                {project.subtitle}
              </p>
            )}
            <p className="mt-3 text-sm sm:text-base text-[#DDC6A4] leading-relaxed">
              {project.shortDesc}
            </p>
          </div>

          {/* Key Specifications / Quantitative Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {project.metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-[#0e1f16] border border-[#2C5F3E] flex flex-col justify-between"
              >
                <span className="text-xs uppercase tracking-wider text-[#DDC6A4] mb-1">{m.label}</span>
                <span className="text-lg font-serif font-bold text-[#CBA95D]">{m.value}</span>
              </div>
            ))}
          </div>

          {/* System Architecture & Overview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase tracking-widest text-[#CBA95D] flex items-center gap-2 font-bold">
              <Cpu className="w-4 h-4 text-[#CBA95D]" />
              <span>System Overview & Mathematical Formulation</span>
            </h4>
            <div className="p-5 bg-[#060c08] border border-[#2C5F3E]">
              <p className="text-sm text-[#F1F1F1]/90 leading-relaxed">
                {project.fullDesc}
              </p>
            </div>
          </div>

          {/* Tools & Methodologies (No checkmarks) */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#CBA95D] flex items-center gap-2 font-bold">
              <Wrench className="w-4 h-4 text-[#CBA95D]" />
              <span>Computational Toolstack & Frameworks</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 text-xs bg-[#162e20] text-[#DDC6A4] border border-[#2C5F3E] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-[#CBA95D] shrink-0" />
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-[#2C5F3E] bg-[#0e1f16]">
          <div className="flex flex-wrap items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#F1F1F1] bg-[#162e20] hover:bg-[#1f3f2c] border border-[#2C5F3E] transition-all"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-bold text-[#F1F1F1] bg-[#8B0000]/70 hover:bg-[#8B0000] border border-red-500/50 shadow-md transition-all"
              >
                <YoutubeIcon className="w-4 h-4 text-white" />
                <span>YouTube Simulation Demo</span>
              </a>
            )}
            {project.colabUrl && (
              <a
                href={project.colabUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-bold text-[#CBA95D] bg-[#162e20] hover:bg-[#1f3f2c] border border-[#CBA95D]/60 transition-all"
              >
                <ColabIcon className="w-4 h-4 text-[#CBA95D]" />
                <span>Google Colab Notebook</span>
              </a>
            )}
            {project.paperUrl && (
              <a
                href={project.paperUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#DDC6A4] hover:text-[#F1F1F1] bg-[#162e20] border border-[#2C5F3E] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Manuscript</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif uppercase tracking-wider text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] border border-transparent hover:border-[#2C5F3E] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
