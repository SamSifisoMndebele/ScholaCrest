import React from 'react';
import type { School, TermReportCard } from '../types';
import { Printer, Award, TrendingUp, Calendar } from 'lucide-react';

interface OfficialReportCardProps {
  school: School;
  reportCard: TermReportCard;
  onClose?: () => void;
}

export const OfficialReportCard: React.FC<OfficialReportCardProps> = ({ school, reportCard, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                Official Academic Term Report Card
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  1-Read Denormalized Doc
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {reportCard.studentName} ({reportCard.admissionNumber}) • {reportCard.termName}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
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

        {/* Printable Report Card Sheet */}
        <div className="letterhead-sheet bg-white p-8 md:p-12 text-slate-800 font-sans leading-relaxed select-text">
          {/* 1. Official Header */}
          <div className="border-b-4 border-blue-900 pb-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              {school.letterhead.logoUrl ? (
                <img 
                  src={school.letterhead.logoUrl} 
                  alt={school.name} 
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm" 
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold">
                  {school.code.substring(0, 3)}
                </div>
              )}
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-blue-950 tracking-wide uppercase">
                  {school.letterhead.schoolName}
                </h1>
                <p className="text-xs font-semibold text-amber-700 italic tracking-wider">
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
              <div className="mt-1 inline-block bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                OFFICIAL REPORT CARD
              </div>
            </div>
          </div>

          {/* 2. Learner & Term Demographics Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">STUDENT NAME</span>
              <span className="font-bold text-slate-900 text-sm">{reportCard.studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">ADMISSION NO</span>
              <span className="font-mono font-bold text-slate-900">{reportCard.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">CLASS & GRADE</span>
              <span className="font-bold text-slate-900">{reportCard.className}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">ACADEMIC PERIOD</span>
              <span className="font-bold text-blue-900">{reportCard.termName}</span>
            </div>
          </div>

          {/* 3. Subject Marks Table */}
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-blue-950 text-white font-semibold uppercase tracking-wider text-[11px]">
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
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{subj.subjectName}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-500">{subj.subjectCode}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-blue-900">{subj.mark}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{subj.maxMark}</td>
                    <td className="py-2.5 px-2 text-center font-bold">{subj.percentage}%</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
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

          {/* 4. Academic Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">Overall Term Average</span>
                <div className="text-2xl font-extrabold text-blue-950 mt-0.5">{reportCard.overallAverage.toFixed(1)}%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">Class Position</span>
                <div className="text-2xl font-extrabold text-emerald-950 mt-0.5">
                  {reportCard.classRank} <span className="text-xs font-medium text-emerald-700">of {reportCard.classSize} students</span>
                </div>
              </div>
              <Award className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">Attendance Record</span>
                <div className="text-2xl font-extrabold text-amber-950 mt-0.5">
                  {reportCard.attendanceDays} <span className="text-xs font-medium text-amber-700">/ {reportCard.totalDays} Days ({((reportCard.attendanceDays/reportCard.totalDays)*100).toFixed(0)}%)</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          {/* 5. Principal Remarks & Official Sign-off */}
          <div className="border border-slate-200 rounded-xl p-5 mb-6 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
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
                <div className="font-serif italic text-2xl text-blue-950 tracking-wide select-none">
                  Dr. S. Khumalo
                </div>
                <div className="w-44 h-0.5 bg-slate-300"></div>
              </div>
              <p className="text-xs font-bold text-slate-900">Dr. Sarah Khumalo</p>
              <p className="text-[10px] text-slate-500">Principal & Head of Academic Board</p>
            </div>

            {/* Official School Seal Stamp */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-900/40 p-1 flex items-center justify-center rotate-[-8deg] select-none">
                <div className="w-full h-full rounded-full border border-blue-900/60 flex flex-col items-center justify-center text-center p-1 bg-blue-50/40">
                  <span className="text-[9px] font-bold text-blue-950 tracking-widest uppercase">ACADEMIC BOARD</span>
                  <span className="text-[8px] text-blue-800 font-serif font-bold leading-tight mt-0.5">APEX ACADEMY</span>
                  <span className="text-[7px] text-emerald-700 font-mono font-bold mt-0.5">CERTIFIED 2026</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-mono">Status: Published</span>
            </div>
          </div>

          {/* 7. Footer Grading Key */}
          <div className="mt-8 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Grading Key: A+ (90-100%) | A (80-89%) | B (70-79%) | C (60-69%) | D (50-59%) | Fail (&lt;50%)</span>
            <span>Ref: {reportCard.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
