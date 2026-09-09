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
    <footer className="bg-black border-t border-white/20 py-12 text-neutral-400 font-serif text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/20">
          
          {/* Left info */}
          <div className="text-center md:text-left space-y-1">
            <div className="text-white font-serif font-bold text-sm">
              {personal.name} · Ph.D. Student
            </div>
            <div className="text-neutral-400">
              {personal.lab} · {personal.department}
            </div>
            <div className="text-neutral-500">
              {personal.university} · Provo, UT
            </div>
          </div>

          {/* Center Social Links (Sharp Rectangles) */}
          <div className="flex items-center gap-3">
            <a
              href={personal.links.scholar}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-neutral-950 border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-all"
              title="Google Scholar"
            >
              <span className="font-serif font-bold text-xs">GS</span>
            </a>

            <a
              href={personal.links.github}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-neutral-950 border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-all"
              title="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-neutral-950 border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-all"
              title="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            <a
              href={personal.links.email}
              className="p-2.5 bg-neutral-950 border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-all"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-all uppercase tracking-wider text-[11px]"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {personal.name}. Brigham Young University.
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-neutral-400">
              <span className="w-1.5 h-1.5 bg-white" />
              Cloudflare Pages & GitHub
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
