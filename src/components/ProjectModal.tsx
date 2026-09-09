import React from 'react';
import { X, ExternalLink, Cpu, Wrench, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import type { Project } from '../data/portfolioData';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {project.category}
            </span>
            <span className="text-xs font-mono text-slate-400">Engineering Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-cyan-300 font-mono">
              {project.shortDesc}
            </p>
          </div>

          {/* Key Engineering Specifications / Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {project.metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
              >
                <span className="text-xs font-mono text-slate-400 mb-1">{m.label}</span>
                <span className="text-lg font-bold font-mono text-cyan-300">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Technical Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>System Overview & Architecture</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {project.fullDesc}
            </p>
          </div>

          {/* Hardware & Computational Toolstack */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Engineering Toolchain & Fabrication</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-200 border border-slate-700/80 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Interactive View</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
