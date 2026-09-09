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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#121215] border border-[#27272A] shadow-2xl shadow-black font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#27272A] bg-[#121215]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs uppercase tracking-widest bg-[#1E1E24] text-[#F4F4F5] border border-[#27272A]">
              {getCategoryLabel(project.category)}
            </span>
            <span className="text-xs text-[#9CA3AF]">Technical Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1E1E24] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFFFFF] mb-2 leading-tight">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="text-sm font-serif italic text-[#9CA3AF]">
                {project.subtitle}
              </p>
            )}
            <p className="mt-3 text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              {project.shortDesc}
            </p>
          </div>

          {/* Key Specifications / Quantitative Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {project.metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-[#09090B] border border-[#27272A] flex flex-col justify-between"
              >
                <span className="text-xs uppercase tracking-wider text-[#9CA3AF] mb-1">{m.label}</span>
                <span className="text-lg font-serif font-bold text-[#FFFFFF]">{m.value}</span>
              </div>
            ))}
          </div>

          {/* System Architecture & Overview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase tracking-widest text-[#FFFFFF] flex items-center gap-2 font-bold">
              <Cpu className="w-4 h-4 text-[#9CA3AF]" />
              <span>System Overview & Mathematical Formulation</span>
            </h4>
            <div className="p-5 bg-[#09090B] border border-[#27272A]">
              <p className="text-sm text-[#F4F4F5] leading-relaxed">
                {project.fullDesc}
              </p>
            </div>
          </div>

          {/* Tools & Methodologies (No checkmarks) */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#FFFFFF] flex items-center gap-2 font-bold">
              <Wrench className="w-4 h-4 text-[#9CA3AF]" />
              <span>Computational Toolstack & Frameworks</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 text-xs bg-[#1E1E24] text-[#F4F4F5] border border-[#27272A] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-[#FFFFFF] shrink-0" />
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-[#27272A] bg-[#121215]">
          <div className="flex flex-wrap items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#F4F4F5] bg-[#1E1E24] hover:bg-[#FFFFFF] hover:text-[#09090B] border border-[#27272A] hover:border-[#FFFFFF] transition-all cursor-pointer"
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
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-bold text-[#F4F4F5] bg-[#1E1E24] hover:bg-[#FFFFFF] hover:text-[#09090B] border border-[#27272A] hover:border-[#FFFFFF] transition-all cursor-pointer"
              >
                <YoutubeIcon className="w-4 h-4 text-inherit" />
                <span>YouTube Simulation Demo</span>
              </a>
            )}
            {project.colabUrl && (
              <a
                href={project.colabUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-bold text-[#F4F4F5] bg-[#1E1E24] hover:bg-[#FFFFFF] hover:text-[#09090B] border border-[#27272A] hover:border-[#FFFFFF] transition-all cursor-pointer"
              >
                <ColabIcon className="w-4 h-4 text-inherit" />
                <span>Google Colab Notebook</span>
              </a>
            )}
            {project.paperUrl && (
              <a
                href={project.paperUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#9CA3AF] hover:text-[#09090B] bg-[#1E1E24] hover:bg-[#FFFFFF] border border-[#27272A] hover:border-[#FFFFFF] transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Manuscript</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif uppercase tracking-wider text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#1E1E24] border border-[#27272A] transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
