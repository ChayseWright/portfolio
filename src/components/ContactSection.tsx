import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Building2, 
  Send, 
  Copy, 
  Check, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const ContactSection: React.FC = () => {
  const { contact } = portfolioData;
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'Academic / Research Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build mailto link so it opens user's email client directly with prefilled parameters
    const mailtoUri = `mailto:${contact.email}?subject=${encodeURIComponent(
      `[Portfolio Inquiry] ${formState.subject}`
    )}&body=${encodeURIComponent(
      `From: ${formState.name} (${formState.email})\n\nMessage:\n${formState.message}`
    )}`;
    window.location.href = mailtoUri;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-24 relative bg-slate-950/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>CONNECT & COLLABORATE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Interested in research collaborations, postdoctoral opportunities, or student mentorship? Feel free to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: BYU Lab Office & Details */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">
                  {contact.labName}
                </h3>
                <p className="text-xs font-mono text-cyan-400">
                  {contact.department} · {contact.institution}
                </p>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Lab & Office:</span> {contact.office}, {contact.building}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Address:</span> {contact.address}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-cyan-300 font-mono">{contact.email}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lab Website Link */}
              <div className="pt-4 border-t border-slate-800/80">
                <a
                  href={contact.labSite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Visit BYU Neuromechanics Group Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Academic Availability Callout */}
            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono text-cyan-200/90 leading-relaxed">
              <strong className="text-cyan-300 block mb-1">Academic Dialogue:</strong>
              {contact.availability}
            </div>

          </div>

          {/* Right: Direct Email Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Send a Direct Message</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill out the form below to dispatch an email inquiry directly to my inbox.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jdoe@institution.edu"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Subject Area
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="Academic / Research Inquiry">Academic / Research Inquiry</option>
                    <option value="Postdoctoral Opportunity">Postdoctoral Opportunity</option>
                    <option value="Paper / Data / Code Request">Paper / Data / Code Request</option>
                    <option value="Industry R&D Collaboration">Industry R&D Collaboration</option>
                    <option value="Student Mentorship">Student Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question, project, or collaboration proposal..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    Dispatches via default mail client
                  </span>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
                  >
                    {submitted ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Opening Mail Client...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
