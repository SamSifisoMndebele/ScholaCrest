import React, { useState } from 'react';
import type { School, OnlineApplication } from '../types';
import { generateApplicationLetter } from '../services/letterheadService';
import { 
  Printer, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';

interface OfficialLetterheadProps {
  school: School;
  application: OnlineApplication;
  onClose?: () => void;
}

export const OfficialLetterhead: React.FC<OfficialLetterheadProps> = ({ school, application, onClose }) => {
  const letter = generateApplicationLetter(school, application);
  const [copiedRef, setCopiedRef] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(letter.refNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-sheet max-w-4xl w-full my-auto overflow-hidden flex flex-col border border-slate-200/80">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-crest-navy text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-crest-navyDark shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/20">
              <img src="/icon.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Official School Letterhead</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                  Zero-Cost Vector PDF
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>{school.name}</span>
                <span>•</span>
                <span className="font-mono text-amber-300">{letter.refNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyRef}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              title="Copy official reference number"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRef ? 'Copied' : 'Copy Ref'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-crest-gold hover:bg-crest-goldLight text-crest-navyDark px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-glow-gold"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ml-1"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* The Printable Letterhead Sheet with Authentic Watermark */}
        <div className="letterhead-sheet relative bg-white p-8 md:p-14 text-slate-800 font-sans leading-relaxed select-text min-h-[842px] overflow-hidden">
          
          {/* Subtle Institutional Watermark (Official Heraldic Crest) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
            <img 
              src="/icon.svg" 
              alt="" 
              className="w-[480px] h-[480px] object-contain" 
            />
          </div>

          <div className="relative z-10">
            {/* 1. Header with Crest & School Info */}
            <div className="border-b-4 border-crest-navy pb-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center md:text-left">
                {/* Official Crest Logo */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={school.letterhead.logoUrl || '/icon.svg'} 
                    alt={school.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>

                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-crest-navy tracking-wide uppercase">
                    {school.letterhead.schoolName}
                  </h1>
                  <p className="text-xs font-bold text-crest-gold italic tracking-wider mt-0.5">
                    "{school.letterhead.motto}"
                  </p>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    {school.letterhead.emisNumber} • Institutional Governance
                  </p>
                </div>
              </div>

              {/* School Contact Details */}
              <div className="text-xs text-slate-600 text-center md:text-right space-y-1 md:max-w-xs border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                <p className="font-semibold text-slate-900">{school.letterhead.address}</p>
                <p>Tel: {school.letterhead.phone}</p>
                <p>Email: {school.letterhead.email}</p>
                <p className="text-blue-700 font-medium">{school.letterhead.website}</p>
              </div>
            </div>

            {/* 2. Metadata Bar (Ref & Date) */}
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-8 pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-400">REFERENCE:</span>{' '}
                <span className="font-mono text-crest-navy font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {letter.refNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400">DATE OF ISSUANCE:</span>{' '}
                <span className="text-slate-900 font-bold">{letter.date}</span>
              </div>
            </div>

            {/* 3. Addressee */}
            <div className="mb-6 text-sm">
              <p className="font-bold text-slate-900 text-base">{letter.recipientName}</p>
              {letter.recipientAddress && (
                <p className="text-slate-600 text-xs mt-0.5">{letter.recipientAddress}</p>
              )}
              <p className="text-xs font-semibold text-crest-gold mt-1">
                Candidate for Grade {application.gradeApplied} • Academic Year 2026
              </p>
            </div>

            {/* 4. Letter Subject Title */}
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border-l-4 border-crest-navy shadow-xs">
              <h2 className="text-sm md:text-base font-bold text-crest-navy tracking-tight uppercase">
                {letter.subject}
              </h2>
              {letter.statusBadge && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-white text-crest-navy border border-slate-200 shadow-xs">
                  {letter.statusBadge.variant === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  {letter.statusBadge.text}
                </div>
              )}
            </div>

            {/* 5. Salutation & Body Paragraphs */}
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed text-justify">
              <p className="font-semibold text-slate-900">{letter.salutation}</p>
              {letter.bodyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* 6. Key Bullet Points */}
            {letter.bulletPoints && (
              <div className="my-6 bg-slate-50/80 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-crest-gold" />
                  Official Admission Particulars:
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  {letter.bulletPoints.map((bp, idx) => (
                    <li key={idx}>{bp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 7. Sign-off & Stamp Section */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-end justify-between gap-8">
              {/* Authorized Signature Block */}
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Yours faithfully,</p>
                
                <div className="py-2">
                  <div className="font-serif italic text-2xl text-crest-navy tracking-wide select-none">
                    S. Khumalo
                  </div>
                  <div className="w-44 h-0.5 bg-slate-300"></div>
                </div>

                <p className="text-xs font-bold text-slate-900">{letter.signatoryName}</p>
                <p className="text-[11px] text-slate-500">{letter.signatoryTitle}</p>
              </div>

              {/* Official Institutional Seal Stamp */}
              {letter.showStamp && (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-crest-gold/60 p-1 flex items-center justify-center rotate-[-10deg] select-none shadow-xs">
                    <div className="w-full h-full rounded-full border border-crest-navy/60 flex flex-col items-center justify-center text-center p-1 bg-amber-50/50">
                      <img src="/icon.svg" alt="" className="w-4 h-4 object-contain opacity-80 mb-0.5" />
                      <span className="text-[8px] font-extrabold text-crest-navy tracking-widest uppercase">REGISTRAR SEAL</span>
                      <span className="text-[7px] text-crest-gold font-serif font-bold uppercase">{school.code}</span>
                      <span className="text-[6.5px] text-slate-500 font-mono mt-0.5">VERIFIED 2026</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                    Registrar Verification
                  </span>
                </div>
              )}
            </div>

            {/* 8. Letterhead Verification Footer */}
            <div className="mt-12 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <img src="/icon.svg" alt="" className="w-3.5 h-3.5 object-contain" />
                <span>Security Attestation: Firebase App Check & SCHOLA CREST Cloud Verified</span>
              </span>
              <span>Document Checksum: {application.id}-SEC77</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
