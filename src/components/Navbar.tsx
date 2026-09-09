import React, { useState, useEffect } from 'react';
import { Menu, X, FileDown, ExternalLink, Activity, BookOpen, Layers, Briefcase, Mail } from 'lucide-react';
import { GithubIcon } from './Icons';
import { portfolioData } from '../data/portfolioData';

interface NavbarProps {
  onOpenCv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCv }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Research', href: '#research', icon: Activity },
    { label: 'Publications', href: '#publications', icon: BookOpen },
    { label: 'Projects', href: '#projects', icon: Layers },
    { label: 'Experience', href: '#experience', icon: Briefcase },
    { label: 'Skills', href: '#skills', icon: null },
    { label: 'Contact', href: '#contact', icon: Mail },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-cyan-950/20 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a 
          href="#" 
          className="group flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-cyan-500 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-black text-cyan-300 text-sm tracking-tighter">
              CW
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-tight group-hover:text-cyan-300 transition-colors">
                {portfolioData.personal.name}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                BYU PhD
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400 truncate max-w-[200px] sm:max-w-none">
              Neuromechanics & BCI Lab
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={portfolioData.personal.links.github}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 transition-all hover:border-cyan-400"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenCv}
            className="p-2 rounded-lg text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono"
            title="CV"
          >
            <FileDown className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-slate-950/95 border-b border-cyan-500/20 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-slate-200 hover:text-cyan-300 hover:bg-slate-900"
              >
                {link.icon && <link.icon className="w-4 h-4 text-cyan-400" />}
                <span>{link.label}</span>
              </a>
            ))}
            
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={portfolioData.personal.links.byuLab}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 flex items-center gap-1.5"
              >
                <span>BYU Neuromechanics Group</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={portfolioData.personal.links.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-slate-100"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
