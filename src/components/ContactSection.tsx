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
    <section id="contact" className="py-24 relative bg-[#09090B] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 font-serif">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-widest bg-[#121215] text-[#9CA3AF] border border-[#27272A] mb-3">
            <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>CONTACT & ACADEMIC COLLABORATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#FFFFFF] tracking-tight">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#9CA3AF]">
            For research collaborations, graduate inquiries, or dialogues regarding Brain-Computer Interfaces and Neuromechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-serif">
          
          {/* Left: BYU Lab Office & Details */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-7 bg-[#121215] border border-[#27272A] space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#FFFFFF] mb-1">
                  {contact.labName}
                </h3>
                <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">
                  {contact.department} · {contact.institution}
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#F4F4F5]">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-[#FFFFFF]">Institution:</span> {contact.institution}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-[#FFFFFF]">Location:</span> {contact.location}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-1" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#FFFFFF] font-mono">{contact.email}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-1 text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lab Website Link */}
              <div className="pt-4 border-t border-[#27272A]">
                <a
                  href={contact.labSite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#FFFFFF] hover:text-[#F4F4F5] transition-colors"
                >
                  <span>Visit BYU Neuromechanics Group</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Academic Availability */}
            <div className="p-5 bg-[#1E1E24] border border-[#27272A] text-xs text-[#9CA3AF] leading-relaxed">
              <strong className="text-[#FFFFFF] block mb-1 uppercase tracking-wider">Research Availability:</strong>
              {contact.availability}
            </div>

          </div>

          {/* Right: Direct Email Message Form (Clean Precision Rectangles) */}
          <div className="lg:col-span-7">
            <div className="p-7 sm:p-8 bg-[#121215] border border-[#27272A]">
              <h3 className="text-xl font-serif font-bold text-[#FFFFFF] mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9CA3AF]" />
                <span>Send a Direct Message</span>
              </h3>
              <p className="text-xs text-[#9CA3AF] mb-6">
                Fill out the fields below to dispatch an email inquiry.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#9CA3AF]/40 focus:outline-none focus:border-[#FFFFFF] focus:bg-[#1E1E24] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jdoe@institution.edu"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#9CA3AF]/40 focus:outline-none focus:border-[#FFFFFF] focus:bg-[#1E1E24] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                    Subject Area
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FFFFFF] focus:bg-[#1E1E24] transition-colors"
                  >
                    <option value="Academic / Research Inquiry">Academic / Research Inquiry</option>
                    <option value="Research Collaboration">Research Collaboration</option>
                    <option value="Neuromechanics & BCI Discussion">Neuromechanics & BCI Discussion</option>
                    <option value="Student Mentorship">Student Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter your inquiry or proposal..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#9CA3AF]/40 focus:outline-none focus:border-[#FFFFFF] focus:bg-[#1E1E24] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#9CA3AF]">
                    Dispatches via email client
                  </span>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#FFFFFF] hover:bg-[#F4F4F5] text-[#09090B] border border-[#FFFFFF] shadow-md transition-all cursor-pointer"
                  >
                    {submitted ? (
                      <>
                        <Check className="w-4 h-4 text-[#09090B]" />
                        <span>Opening Mail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#09090B]" />
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
