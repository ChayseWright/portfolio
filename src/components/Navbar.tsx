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
          ? 'bg-black/95 backdrop-blur-md border-b border-white/20 shadow-xl shadow-black/80 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo (Sharp, Architectural Monogram Crest) */}
        <a 
          href="#" 
          className="group flex items-center gap-3.5 transition-transform"
        >
          <div className="w-10 h-10 bg-black border border-white flex items-center justify-center shadow-sm">
            <span className="font-serif font-bold text-white text-sm tracking-wider">
              CW
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white tracking-wide text-base group-hover:text-neutral-300 transition-colors">
                {portfolioData.personal.name}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-black text-white border border-white/50">
                BYU MechE
              </span>
            </div>
            <span className="text-xs font-serif italic text-neutral-400 tracking-normal">
              Neuromechanics & BCI Laboratory
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 font-serif">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all tracking-wide border-b-2 border-transparent hover:border-white"
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
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all border border-transparent hover:border-white/30"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif font-semibold tracking-wider uppercase bg-white hover:bg-neutral-200 text-black border border-white shadow-md transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-black" />
            <span>Curriculum Vitae</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenCv}
            className="p-2 text-black bg-white border border-white text-xs"
            title="CV"
          >
            <FileDown className="w-4 h-4 text-black" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-black/98 border-b border-white/30 font-serif">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:text-neutral-300 hover:bg-neutral-900 border-l-2 border-transparent hover:border-white"
              >
                {link.icon && <link.icon className="w-4 h-4 text-neutral-400" />}
                <span>{link.label}</span>
              </a>
            ))}
            
            <div className="pt-3 border-t border-white/20 flex items-center justify-between">
              <a
                href={portfolioData.personal.links.byuLab}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-300 hover:text-white flex items-center gap-1.5"
              >
                <span>BYU Neuromechanics Group</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={portfolioData.personal.links.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-neutral-400 hover:text-white"
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
