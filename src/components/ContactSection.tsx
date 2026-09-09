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
    <section id="contact" className="py-24 relative bg-[#0c1811] border-t border-[#2C5F3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 font-serif">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]/40 mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>CONTACT & ACADEMIC COLLABORATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1F1F1] tracking-tight">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#DDC6A4]">
            For research collaborations, graduate inquiries, or dialogues regarding Brain-Computer Interfaces and Neuromechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-serif">
          
          {/* Left: BYU Lab Office & Details */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-7 bg-[#0e1f16] border border-[#2C5F3E] space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#F1F1F1] mb-1">
                  {contact.labName}
                </h3>
                <p className="text-xs uppercase tracking-wider text-[#CBA95D]">
                  {contact.department} · {contact.institution}
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#DDC6A4]">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-[#CBA95D] shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-[#F1F1F1]">Office & Lab:</span> {contact.office}, {contact.building}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#CBA95D] shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-[#F1F1F1]">Location:</span> {contact.address}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#CBA95D] shrink-0 mt-1" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#CBA95D] font-mono">{contact.email}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-1 text-[#DDC6A4] hover:text-[#CBA95D] transition-colors"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#CBA95D]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lab Website Link */}
              <div className="pt-4 border-t border-[#2C5F3E]">
                <a
                  href={contact.labSite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#CBA95D] hover:text-[#F1F1F1] transition-colors"
                >
                  <span>Visit BYU Neuromechanics Group</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Academic Availability */}
            <div className="p-5 bg-[#162e20] border border-[#CBA95D]/40 text-xs text-[#DDC6A4] leading-relaxed">
              <strong className="text-[#CBA95D] block mb-1 uppercase tracking-wider">Research Availability:</strong>
              {contact.availability}
            </div>

          </div>

          {/* Right: Direct Email Message Form (Sharp Formal Rectangles) */}
          <div className="lg:col-span-7">
            <div className="p-7 sm:p-8 bg-[#0e1f16] border border-[#2C5F3E]">
              <h3 className="text-xl font-serif font-bold text-[#F1F1F1] mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#CBA95D]" />
                <span>Send a Direct Message</span>
              </h3>
              <p className="text-xs text-[#DDC6A4] mb-6">
                Fill out the fields below to dispatch an email inquiry.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#DDC6A4] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0a160f] border border-[#2C5F3E] text-xs text-[#F1F1F1] placeholder-[#DDC6A4]/40 focus:outline-none focus:border-[#CBA95D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#DDC6A4] mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jdoe@institution.edu"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0a160f] border border-[#2C5F3E] text-xs text-[#F1F1F1] placeholder-[#DDC6A4]/40 focus:outline-none focus:border-[#CBA95D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#DDC6A4] mb-1.5">
                    Subject Area
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0a160f] border border-[#2C5F3E] text-xs text-[#F1F1F1] focus:outline-none focus:border-[#CBA95D]"
                  >
                    <option value="Academic / Research Inquiry">Academic / Research Inquiry</option>
                    <option value="Research Collaboration">Research Collaboration</option>
                    <option value="Neuromechanics & BCI Discussion">Neuromechanics & BCI Discussion</option>
                    <option value="Student Mentorship">Student Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#DDC6A4] mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter your inquiry or proposal..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0a160f] border border-[#2C5F3E] text-xs text-[#F1F1F1] placeholder-[#DDC6A4]/40 focus:outline-none focus:border-[#CBA95D]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#DDC6A4]/60">
                    Dispatches via email client
                  </span>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#2C5F3E] hover:bg-[#234d32] text-[#F1F1F1] border border-[#CBA95D] shadow-md transition-all"
                  >
                    {submitted ? (
                      <>
                        <Check className="w-4 h-4 text-[#CBA95D]" />
                        <span>Opening Mail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#CBA95D]" />
                        <span>Send Message</span>
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
