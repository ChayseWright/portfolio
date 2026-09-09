import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  FileText, 
  Code2, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Star,
  Award
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { Publication } from '../data/portfolioData';

interface PublicationsSectionProps {
  onSelectBibtex: (pub: Publication) => void;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({ onSelectBibtex }) => {
  const { publications } = portfolioData;
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAbstracts, setExpandedAbstracts] = useState<{ [key: string]: boolean }>({});

  const filterTypes = [
    { id: 'all', label: 'All Publications' },
    { id: 'journal', label: 'Journal Articles' },
    { id: 'conference', label: 'Conferences' },
    { id: 'preprint', label: 'Preprints & Others' }
  ];

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const matchesType = selectedType === 'all' || pub.type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        pub.title.toLowerCase().includes(q) ||
        pub.authors.some(a => a.toLowerCase().includes(q)) ||
        pub.venue.toLowerCase().includes(q) ||
        pub.tags.some(t => t.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [publications, selectedType, searchQuery]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="publications" className="py-24 relative bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>PEER-REVIEWED SCHOLARSHIP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Publications & Preprints
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Journal papers, peer-reviewed conference proceedings, and engineering preprints with open code and reproducible datasets.
            </p>
          </div>

          {/* Quick Scholar Links */}
          <div className="flex items-center gap-3">
            <a
              href={portfolioData.personal.links.scholar}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-cyan-300 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition-all hover:bg-slate-800"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Google Scholar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {filterTypes.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  selectedType === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search paper, author, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-4">
          {filteredPublications.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-mono text-slate-400">No publications matched your search criteria.</p>
              <button 
                onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
                className="mt-3 text-xs font-mono text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredPublications.map((pub) => {
              const isAbstractOpen = !!expandedAbstracts[pub.id];

              return (
                <article
                  key={pub.id}
                  className={`p-6 rounded-2xl border transition-all duration-200 ${
                    pub.featured
                      ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    {/* Left: Metadata & Title */}
                    <div className="space-y-2 flex-1">
                      
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-950 text-cyan-300 border border-slate-800">
                          {pub.type} · {pub.year}
                        </span>

                        {pub.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                            <Star className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                            <span>Featured</span>
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-400">
                          {pub.venue}
                        </span>
                      </div>

                      {/* Paper Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                        {pub.title}
                      </h3>

                      {/* Authors List with Chayse Wright highlighted */}
                      <p className="text-xs sm:text-sm text-slate-400">
                        {pub.authors.map((author, aIdx) => {
                          const isSelf = author.toLowerCase().includes('wright') || author.toLowerCase().includes('chayse');
                          return (
                            <React.Fragment key={aIdx}>
                              <span className={isSelf ? 'font-bold text-cyan-300 underline decoration-cyan-500/40' : 'text-slate-300'}>
                                {author}
                              </span>
                              {aIdx < pub.authors.length - 1 && ', '}
                            </React.Fragment>
                          );
                        })}
                      </p>

                      {/* Keyword Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pub.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Expandable Abstract Accordion */}
                      {pub.abstract && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleAbstract(pub.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <span>{isAbstractOpen ? 'Hide Abstract' : 'View Abstract'}</span>
                            {isAbstractOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          
                          {isAbstractOpen && (
                            <div className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                              {pub.abstract}
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                      
                      {/* BibTeX Button */}
                      <button
                        onClick={() => onSelectBibtex(pub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-cyan-950/40 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-700/80 transition-all"
                        title="Copy BibTeX"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Cite (BibTeX)</span>
                      </button>

                      {/* PDF Download */}
                      {pub.pdfUrl && (
                        <a
                          href={pub.pdfUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>PDF</span>
                        </a>
                      )}

                      {/* Code Repository */}
                      {pub.codeUrl && pub.codeUrl !== '#' && (
                        <a
                          href={pub.codeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-all"
                        >
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Code</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      )}

                      {/* DOI Link */}
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                    </div>

                  </div>
                </article>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
