import React from 'react';
import { Bell, Award, BookOpen, Mic, Users, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import type { NewsItem } from '../data/portfolioData';

export const NewsSection: React.FC = () => {
  const { news } = portfolioData;

  if (!news || news.length === 0) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'paper':
        return <BookOpen className="w-3.5 h-3.5 text-white" />;
      case 'award':
        return <Award className="w-3.5 h-3.5 text-white" />;
      case 'conference':
        return <Mic className="w-3.5 h-3.5 text-white" />;
      default:
        return <Users className="w-3.5 h-3.5 text-white" />;
    }
  };

  return (
    <section id="news" className="py-20 relative bg-black border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-10 font-serif">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-neutral-950 text-neutral-300 border border-white/30 mb-2">
              <Bell className="w-3.5 h-3.5 text-neutral-400" />
              <span>DISPATCHES & ANNOUNCEMENTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Recent News & Updates
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-serif">
          {news.map((item: NewsItem) => (
            <div
              key={item.id}
              className="p-5 bg-neutral-950 border border-white/20 hover:border-white transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-black text-white border border-white/30">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {item.date}
                  </span>
                </div>

                <h3 className="text-sm font-serif font-bold text-white mb-1.5 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.link && (
                <div className="mt-4 pt-3 border-t border-white/20">
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs text-white hover:text-neutral-300"
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
