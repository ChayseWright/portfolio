import React from 'react';
import { Mail, ArrowUp } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';

export const Footer: React.FC = () => {
  const { personal } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          
          {/* Left info */}
          <div className="text-center md:text-left space-y-1">
            <div className="text-slate-200 font-bold text-sm">
              {personal.name} · Ph.D. Candidate
            </div>
            <div className="text-slate-400">
              {personal.lab} · {personal.department}
            </div>
            <div className="text-slate-500">
              {personal.university} · Provo, UT
            </div>
          </div>

          {/* Center Social Links */}
          <div className="flex items-center gap-4">
            <a
              href={personal.links.scholar}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="Google Scholar"
            >
              <span className="font-bold text-xs">GS</span>
            </a>

            <a
              href={personal.links.github}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.orcid}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="ORCID"
            >
              <span className="text-emerald-400 font-bold text-xs">iD</span>
            </a>

            <a
              href={personal.links.email}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom copyright & hosting attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {personal.name}. All rights reserved.
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Optimized for Cloudflare Pages & GitHub
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
