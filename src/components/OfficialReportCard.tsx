import React, { useState } from 'react';
import type { School, TermReportCard } from '../types';
import { 
  Printer, 
  Award, 
  TrendingUp, 
  Calendar, 
  Copy, 
  Check, 
  Sparkles
} from 'lucide-react';

interface OfficialReportCardProps {
  school: School;
  reportCard: TermReportCard;
  onClose?: () => void;
}

export const OfficialReportCard: React.FC<OfficialReportCardProps> = ({ school, reportCard, onClose }) => {
  const [copiedId, setCopiedId] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(reportCard.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-sheet max-w-4xl w-full my-auto overflow-hidden flex flex-col border border-slate-200/80">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-crest-navy text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-crest-navyDark shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 p-1 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Official Academic Term Report Card</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                  1-Read Denormalized Doc
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>{reportCard.studentName} ({reportCard.admissionNumber})</span>
                <span>•</span>
                <span className="font-mono text-amber-300">{reportCard.termName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyId}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              title="Copy Report Card ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
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

        {/* Printable Report Card Sheet with Watermark */}
        <div className="letterhead-sheet relative bg-white p-8 md:p-14 text-slate-800 font-sans leading-relaxed select-text min-h-[842px] overflow-hidden">
          
          {/* Subtle Watermark Emblem */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
            <img src="/icon.svg" alt="" className="w-[480px] h-[480px] object-contain" />
          </div>

          <div className="relative z-10">
            {/* 1. Official Header */}
            <div className="border-b-4 border-crest-navy pb-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 flex items-center justify-center flex-shrink-0">
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
                  <p className="text-xs font-bold text-crest-gold italic tracking-wider">
                    "{school.letterhead.motto}"
                  </p>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    {school.letterhead.emisNumber} • Academic Term Progress Report
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 text-center md:text-right space-y-0.5">
                <p className="font-semibold text-slate-900">{school.letterhead.address}</p>
                <p>Tel: {school.letterhead.phone} • Email: {school.letterhead.email}</p>
                <div className="mt-1.5 inline-block bg-crest-navy text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs">
                  OFFICIAL ACADEMIC RECORD
                </div>
              </div>
            </div>

            {/* 2. Learner & Term Demographics Block */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-xs">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">STUDENT FULL NAME</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{reportCard.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">ADMISSION NUMBER</span>
                <span className="font-mono font-bold text-crest-navy text-sm mt-0.5 block">{reportCard.admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">CLASS & STREAM</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{reportCard.className}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">ACADEMIC PERIOD</span>
                <span className="font-bold text-crest-gold text-sm mt-0.5 block">{reportCard.termName}</span>
              </div>
            </div>

            {/* 3. Subject Marks Table */}
            <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-crest-navy text-white font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-2 text-center">Code</th>
                    <th className="py-3 px-2 text-center">Mark</th>
                    <th className="py-3 px-2 text-center">Max</th>
                    <th className="py-3 px-2 text-center">%</th>
                    <th className="py-3 px-2 text-center">Symbol</th>
                    <th className="py-3 px-4">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportCard.subjects.map((subj, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{subj.subjectName}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">{subj.subjectCode}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-crest-navy text-sm font-mono">{subj.mark}</td>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono">{subj.maxMark}</td>
                      <td className="py-2.5 px-2 text-center font-bold">{subj.percentage}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded font-bold text-[11px] ${
                          subj.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          subj.percentage >= 70 ? 'bg-blue-100 text-blue-800' :
                          subj.percentage >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {subj.gradeSymbol}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 italic text-[11px]">{subj.teacherRemark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Academic Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-crest-navy uppercase tracking-wide">Overall Term Average</span>
                  <div className="text-2xl font-black text-crest-navy mt-0.5">{reportCard.overallAverage.toFixed(1)}%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">Class Position</span>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">
                    {reportCard.classRank} <span className="text-xs font-medium text-emerald-700">of {reportCard.classSize} students</span>
                  </div>
                </div>
                <Award className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">Attendance Record</span>
                  <div className="text-2xl font-black text-amber-950 mt-0.5">
                    {reportCard.attendanceDays} <span className="text-xs font-medium text-amber-700">/ {reportCard.totalDays} Days ({((reportCard.attendanceDays/reportCard.totalDays)*100).toFixed(0)}%)</span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            {/* 5. Principal Remarks & Official Sign-off */}
            <div className="border border-slate-200 rounded-xl p-5 mb-6 bg-slate-50/60 shadow-xs">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-crest-gold" />
                Principal's Term Assessment & Recommendation:
              </div>
              <p className="text-sm italic text-slate-800 leading-relaxed">
                "{reportCard.principalRemark}"
              </p>
            </div>

            {/* 6. Signature & Digital Seal Block */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs text-slate-500">Authorized by:</p>
                <div className="py-2">
                  <div className="font-serif italic text-2xl text-crest-navy tracking-wide select-none">
                    Dr. S. Khumalo
                  </div>
                  <div className="w-44 h-0.5 bg-slate-300"></div>
                </div>
                <p className="text-xs font-bold text-slate-900">Dr. Sarah Khumalo</p>
                <p className="text-[10px] text-slate-500">Principal & Head of Academic Board</p>
              </div>

              {/* Official Academic Seal Stamp */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-crest-gold/60 p-1 flex items-center justify-center rotate-[-8deg] select-none shadow-xs">
                  <div className="w-full h-full rounded-full border border-crest-navy/60 flex flex-col items-center justify-center text-center p-1 bg-amber-50/50">
                    <img src="/icon.svg" alt="" className="w-4 h-4 object-contain opacity-80 mb-0.5" />
                    <span className="text-[8px] font-extrabold text-crest-navy tracking-widest uppercase">ACADEMIC BOARD</span>
                    <span className="text-[7px] text-crest-gold font-serif font-bold uppercase">{school.code}</span>
                    <span className="text-[6.5px] text-emerald-700 font-mono font-bold mt-0.5">CERTIFIED 2026</span>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-mono">Status: Published</span>
              </div>
            </div>

            {/* 7. Footer Grading Key */}
            <div className="mt-8 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Grading Key: A+ (90-100%) | A (80-89%) | B (70-79%) | C (60-69%) | D (50-59%) | Fail (&lt;50%)</span>
              <span>Document Checksum: {reportCard.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
