import React from 'react';
import { Bell, Award, BookOpen, Mic, Users, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { NewsItem } from '../data/portfolioData';

export const NewsSection: React.FC = () => {
  const { news } = portfolioData;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'paper':
        return <BookOpen className="w-3.5 h-3.5 text-cyan-400" />;
      case 'award':
        return <Award className="w-3.5 h-3.5 text-amber-400" />;
      case 'conference':
        return <Mic className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <section id="news" className="py-20 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>DISPATCHES & MILESTONES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Recent News & Highlights
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {news.map((item: NewsItem) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-950 text-slate-300 border border-slate-800">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {item.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1.5 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.link && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Read Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
