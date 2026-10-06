import React, { useState } from 'react';
import type { School, OnlineApplication, RegistrarDecisionStatus } from '../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileCheck,
  Search,
  Check,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface RegistrarViewProps {
  school: School;
  applications: OnlineApplication[];
  onUpdateStatus: (applicationId: string, newStatus: RegistrarDecisionStatus, notes?: string) => void;
  onOpenLetter: (application: OnlineApplication) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const RegistrarView: React.FC<RegistrarViewProps> = ({
  school,
  applications,
  onUpdateStatus,
  onOpenLetter,
  onNotify,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<OnlineApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [previewDocIndex, setPreviewDocIndex] = useState<number | null>(null);

  const schoolApps = applications.filter(a => a.schoolId === school.id);

  const filteredApps = schoolApps.filter(app => {
    // Search match
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.parentName.toLowerCase().includes(q) ||
      app.previousSchool.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'pending') return app.registrarReview.status === 'pending';
    if (filter === 'accepted') return app.registrarReview.status === 'accepted';
    if (filter === 'documents_requested') return app.registrarReview.status === 'documents_requested';
    if (filter === 'flagged') return app.autoEvaluation.status === 'flagged';
    return true;
  });

  const handleDecision = (status: RegistrarDecisionStatus) => {
    if (!selectedApp) return;
    onUpdateStatus(selectedApp.id, status, reviewNotes);

    const statusLabels: Record<RegistrarDecisionStatus, string> = {
      accepted: 'Admitted & Acceptance Letter Issued',
      rejected: 'Application Declined',
      documents_requested: 'Additional Documents Requested',
      pending: 'Set to Pending Review'
    };

    if (onNotify) {
      onNotify(
        `Registrar Decision: ${statusLabels[status]}`,
        `${selectedApp.applicantName} (${selectedApp.id}) status updated. Official letterhead refreshed.`,
        status === 'accepted' ? 'success' : status === 'rejected' ? 'warning' : 'info'
      );
    }

    setSelectedApp(null);
    setReviewNotes('');
    setPreviewDocIndex(null);
  };

  const applyPresetNote = (note: string) => {
    setReviewNotes(note);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-amber-500/10 text-amber-700 rounded-2xl border border-amber-200/50">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-crest-navy font-serif">
                Admissions & Registrar Console
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-crest-navy/10 text-crest-navy font-mono font-bold">
                {school.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review rule pre-evaluated candidate dossiers, verify Cloudflare R2 attachments, and issue official school letters.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant or ref ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-crest-navy"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-white text-crest-navy font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({schoolApps.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'pending' ? 'bg-white text-crest-navy font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({schoolApps.filter(a => a.registrarReview.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'accepted' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Accepted ({schoolApps.filter(a => a.registrarReview.status === 'accepted').length})
            </button>
          </div>
        </div>
      </div>

      {/* Applications List Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6">Applicant & Ref ID</th>
                <th className="py-3.5 px-4">Grade & Prior School</th>
                <th className="py-3.5 px-4">Automated Pre-Screening</th>
                <th className="py-3.5 px-4">Documents (R2)</th>
                <th className="py-3.5 px-4">Registrar Decision</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No applications match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{app.applicantName}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {app.id} • Parent: {app.parentName}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-crest-navy">Grade {app.gradeApplied}</div>
                      <div className="text-slate-500 text-[11px]">{app.previousSchool} ({app.previousAverageMarks.toFixed(1)}%)</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          app.autoEvaluation.status === 'passed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.autoEvaluation.status === 'passed' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          Score: {app.autoEvaluation.score}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {app.autoEvaluation.notes[0]}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                        <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>{app.documents.length} Files</span>
                        <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">R2</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        app.registrarReview.status === 'accepted' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : app.registrarReview.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : app.registrarReview.status === 'documents_requested'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {app.registrarReview.status === 'accepted' ? 'Accepted' :
                         app.registrarReview.status === 'rejected' ? 'Rejected' :
                         app.registrarReview.status === 'documents_requested' ? 'Action Req.' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => onOpenLetter(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-crest-navy rounded-xl font-bold text-xs transition-colors"
                        title="View Official School Letterhead"
                      >
                        <Printer className="w-3.5 h-3.5 text-crest-gold" />
                        <span>Letter</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNotes(app.registrarReview.reviewNotes || '');
                          setPreviewDocIndex(null);
                        }}
                        className="px-3 py-1.5 bg-crest-navy hover:bg-crest-navyDark text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
                      >
                        Inspect / Validate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Validation Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-crest-navy font-serif">
                  Registrar Evaluation: {selectedApp.applicantName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ref: {selectedApp.id} • Grade {selectedApp.gradeApplied} Candidate • DOB: {selectedApp.dateOfBirth}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Automated Evaluation Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="font-bold text-crest-navy flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-crest-gold" />
                    Automated App Pre-Evaluation Result
                  </span>
                  <span className="font-mono text-crest-navy font-extrabold text-sm">{selectedApp.autoEvaluation.score}% Score</span>
                </div>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {selectedApp.autoEvaluation.notes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Uploaded Documents List with Preview Simulation */}
              <div>
                <label className="block font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Uploaded Candidate Documents (Cloudflare R2 • $0 Egress):</span>
                  <span className="text-[10px] text-purple-700 font-mono">Click card to simulate preview</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedApp.documents.map((doc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setPreviewDocIndex(previewDocIndex === idx ? null : idx)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        previewDocIndex === idx 
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' 
                          : 'border-slate-200 bg-purple-50/40 hover:bg-purple-50'
                      }`}
                    >
                      <div className="font-bold text-slate-800 text-[11px] truncate">{doc.fileName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                        {doc.type.replace('_', ' ')} • {doc.fileSize} KB
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-purple-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          WebP
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Document Inspector Card */}
                {previewDocIndex !== null && (
                  <div className="mt-3 p-3 bg-slate-900 text-white rounded-2xl text-[11px] space-y-2 border border-slate-800 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold font-mono">Simulated R2 Edge Preview: {selectedApp.documents[previewDocIndex]?.fileName}</span>
                      <span className="text-emerald-400 font-mono">Cached @ Cloudflare Edge</span>
                    </div>
                    <div className="bg-slate-800 p-2.5 rounded-xl text-slate-300 font-mono text-[10px] flex items-center justify-between">
                      <span>MIME: image/webp • Size: {selectedApp.documents[previewDocIndex]?.fileSize} KB</span>
                      <span className="text-amber-400">Zero-Egress Bandwidth Protocol</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Decision Presets */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Quick Decision Notes Presets:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPresetNote(`Official admission granted for Grade ${selectedApp.gradeApplied} based on outstanding academic qualification and complete certified documentation.`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Standard Admission
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetNote(`Conditional acceptance granted. Candidate must furnish certified Term 4 final transcript prior to first day of orientation.`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Conditional Acceptance
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetNote(`Additional certified copy of unabridged birth certificate required for Department of Basic Education registration compliance.`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Request Compliance Docs
                  </button>
                </div>
              </div>

              {/* Registrar Decision Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Registrar / Principal Decision Notes (Appears on Official Letter)
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Academic records verified. Accepted into Grade 10 Science stream."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenLetter(selectedApp)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-crest-navy rounded-2xl font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                <Printer className="w-4 h-4 text-crest-gold" />
                <span>Preview Current Letter</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecision('rejected')}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                  Decline
                </button>
                <button
                  onClick={() => handleDecision('documents_requested')}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-xs transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  Request Docs
                </button>
                <button
                  onClick={() => handleDecision('accepted')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Accept & Issue Letter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
