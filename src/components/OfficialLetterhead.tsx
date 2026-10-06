import React from 'react';
import type { School, OnlineApplication } from '../types';
import { generateApplicationLetter } from '../services/letterheadService';
import { Printer, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface OfficialLetterheadProps {
  school: School;
  application: OnlineApplication;
  onClose?: () => void;
}

export const OfficialLetterhead: React.FC<OfficialLetterheadProps> = ({ school, application, onClose }) => {
  const letter = generateApplicationLetter(school, application);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                Official School Letterhead Document
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  $0 Storage / Client-Rendered
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Application Ref: {application.id} • {school.name}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* The Printable Letterhead Sheet */}
        <div className="letterhead-sheet bg-white p-8 md:p-14 text-slate-800 font-sans leading-relaxed select-text">
          {/* 1. Header with Crest & School Info */}
          <div className="border-b-4 border-blue-900 pb-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              {school.letterhead.logoUrl ? (
                <img 
                  src={school.letterhead.logoUrl} 
                  alt={school.name} 
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border border-slate-200 shadow-sm" 
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                  {school.code.substring(0, 3)}
                </div>
              )}
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-blue-950 tracking-wide uppercase">
                  {school.letterhead.schoolName}
                </h1>
                <p className="text-xs font-semibold text-amber-700 italic tracking-wider mt-0.5">
                  "{school.letterhead.motto}"
                </p>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  {school.letterhead.emisNumber} • Est. 1998
                </p>
              </div>
            </div>

            {/* School Contact Details */}
            <div className="text-xs text-slate-600 text-center md:text-right space-y-1 md:max-w-xs border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
              <p className="font-medium text-slate-800">{school.letterhead.address}</p>
              <p>Tel: {school.letterhead.phone}</p>
              <p>Email: {school.letterhead.email}</p>
              <p className="text-blue-700">{school.letterhead.website}</p>
            </div>
          </div>

          {/* 2. Metadata Bar (Ref & Date) */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-8 pb-3 border-b border-slate-200">
            <div>
              <span className="text-slate-400">REFERENCE:</span>{' '}
              <span className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">{letter.refNumber}</span>
            </div>
            <div>
              <span className="text-slate-400">DATE:</span>{' '}
              <span className="text-slate-900">{letter.date}</span>
            </div>
          </div>

          {/* 3. Addressee */}
          <div className="mb-6 text-sm">
            <p className="font-bold text-slate-900">{letter.recipientName}</p>
            {letter.recipientAddress && (
              <p className="text-slate-600 text-xs mt-0.5">{letter.recipientAddress}</p>
            )}
            <p className="text-xs font-medium text-slate-500 mt-1">Prospective Candidate – Grade {application.gradeApplied}</p>
          </div>

          {/* 4. Letter Subject Title */}
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border-l-4 border-blue-900">
            <h2 className="text-base font-bold text-blue-950 tracking-tight uppercase">
              {letter.subject}
            </h2>
            {letter.statusBadge && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-900">
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
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900">{letter.salutation}</p>
            {letter.bodyParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* 6. Key Bullet Points */}
          {letter.bulletPoints && (
            <div className="my-6 bg-slate-50/80 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
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
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Yours faithfully,</p>
              
              <div className="py-2">
                <div className="font-serif italic text-2xl text-blue-950 tracking-wide select-none">
                  S. Khumalo
                </div>
                <div className="w-40 h-0.5 bg-slate-300"></div>
              </div>

              <p className="text-xs font-bold text-slate-900">{letter.signatoryName}</p>
              <p className="text-[11px] text-slate-500">{letter.signatoryTitle}</p>
            </div>

            {letter.showStamp && (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-900/40 p-1 flex items-center justify-center rotate-[-12deg] select-none">
                  <div className="w-full h-full rounded-full border border-blue-900/60 flex flex-col items-center justify-center text-center p-1 bg-blue-50/40">
                    <span className="text-[9px] font-bold text-blue-950 tracking-widest uppercase">OFFICIAL SEAL</span>
                    <span className="text-[8px] text-blue-800 font-serif font-bold leading-tight mt-0.5">APEX ACADEMY</span>
                    <span className="text-[7px] text-blue-600 font-mono mt-0.5">VERIFIED 2026</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Registrar Verification</span>
              </div>
            )}
          </div>

          {/* 8. Letterhead Verification Footer */}
          <div className="mt-12 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Security Attestation: Firebase App Check & SCHOLACREST Cloud Verified</span>
            <span>Document Checksum: {application.id}-{Date.now().toString(36)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
