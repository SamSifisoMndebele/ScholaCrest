import React, { useState } from 'react';
import type { School, OnlineApplication, RegistrarDecisionStatus } from '../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileCheck
} from 'lucide-react';

interface RegistrarViewProps {
  school: School;
  applications: OnlineApplication[];
  onUpdateStatus: (applicationId: string, newStatus: RegistrarDecisionStatus, notes?: string) => void;
  onOpenLetter: (application: OnlineApplication) => void;
}

export const RegistrarView: React.FC<RegistrarViewProps> = ({
  school,
  applications,
  onUpdateStatus,
  onOpenLetter,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<OnlineApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const schoolApps = applications.filter(a => a.schoolId === school.id);

  const filteredApps = schoolApps.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.registrarReview.status === 'pending';
    if (filter === 'accepted') return app.registrarReview.status === 'accepted';
    if (filter === 'flagged') return app.autoEvaluation.status === 'flagged';
    return true;
  });

  const handleDecision = (status: RegistrarDecisionStatus) => {
    if (!selectedApp) return;
    onUpdateStatus(selectedApp.id, status, reviewNotes);
    setSelectedApp(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-700 rounded-2xl">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Admissions & Registrar Console</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-semibold">
                {school.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review pre-evaluated applicant dossiers, inspect R2 documents, and issue official school letterhead letters.
            </p>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Applicants ({schoolApps.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review ({schoolApps.filter(a => a.registrarReview.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'accepted' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accepted ({schoolApps.filter(a => a.registrarReview.status === 'accepted').length})
          </button>
        </div>
      </div>

      {/* Applications List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm">{app.applicantName}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {app.id} • Parent: {app.parentName}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-blue-900">Grade {app.gradeApplied}</div>
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
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors"
                      title="View Official School Letterhead"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Letter
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setReviewNotes(app.registrarReview.reviewNotes || '');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
                    >
                      Inspect / Validate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Validation Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Evaluation: {selectedApp.applicantName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Ref: {selectedApp.id} • Grade {selectedApp.gradeApplied}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Automated Evaluation Summary Card */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Automated App Pre-Evaluation Result</span>
                  <span className="font-mono text-blue-900 font-extrabold">{selectedApp.autoEvaluation.score}% Score</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                  {selectedApp.autoEvaluation.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Uploaded Applicant Documents (Cloudflare R2 • $0 Egress):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-purple-50/50 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-[11px] truncate">{doc.fileName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">{doc.type.replace('_', ' ')} • {doc.fileSize} KB</div>
                      </div>
                      <div className="mt-2 flex items-center text-[10px] font-bold text-purple-700 gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        WebP Compressed
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registrar Decision Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Registrar / Principal Decision Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Academic records verified. Accepted into Grade 10 Science stream."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenLetter(selectedApp)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Preview Current Letter
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecision('rejected')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Decline Application
                </button>
                <button
                  onClick={() => handleDecision('documents_requested')}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Request More Docs
                </button>
                <button
                  onClick={() => handleDecision('accepted')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Validate & Accept (Issue Letter)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
