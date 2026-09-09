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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-black border border-white/40 shadow-2xl shadow-white/5 font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-neutral-950/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs uppercase tracking-widest bg-neutral-900 text-white border border-white/30">
              {getCategoryLabel(project.category)}
            </span>
            <span className="text-xs text-neutral-400">Technical Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 leading-tight">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="text-sm font-serif italic text-neutral-400">
                {project.subtitle}
              </p>
            )}
            <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed">
              {project.shortDesc}
            </p>
          </div>

          {/* Key Specifications / Quantitative Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {project.metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-neutral-950 border border-white/20 flex flex-col justify-between"
              >
                <span className="text-xs uppercase tracking-wider text-neutral-400 mb-1">{m.label}</span>
                <span className="text-lg font-serif font-bold text-white">{m.value}</span>
              </div>
            ))}
          </div>

          {/* System Architecture & Overview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase tracking-widest text-white flex items-center gap-2 font-bold">
              <Cpu className="w-4 h-4 text-neutral-400" />
              <span>System Overview & Mathematical Formulation</span>
            </h4>
            <div className="p-5 bg-neutral-950 border border-white/20">
              <p className="text-sm text-neutral-200 leading-relaxed">
                {project.fullDesc}
              </p>
            </div>
          </div>

          {/* Tools & Methodologies (No checkmarks) */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-white flex items-center gap-2 font-bold">
              <Wrench className="w-4 h-4 text-neutral-400" />
              <span>Computational Toolstack & Frameworks</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 text-xs bg-neutral-900 text-neutral-300 border border-white/20 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-white shrink-0" />
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-white/20 bg-neutral-950">
          <div className="flex flex-wrap items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-black hover:bg-neutral-900 border border-white/40 hover:border-white transition-all"
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
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-bold text-white bg-black hover:bg-neutral-900 border border-white/40 hover:border-white transition-all"
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
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-bold text-white bg-black hover:bg-neutral-900 border border-white/40 hover:border-white transition-all"
              >
                <ColabIcon className="w-4 h-4 text-white" />
                <span>Google Colab Notebook</span>
              </a>
            )}
            {project.paperUrl && (
              <a
                href={project.paperUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-neutral-300 hover:text-white bg-black border border-white/40 hover:border-white transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Manuscript</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-white/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
