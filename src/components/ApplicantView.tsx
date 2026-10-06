import React, { useState } from 'react';
import type { School, OnlineApplication, ApplicantDocument, AutoEvalStatus } from '../types';
import { 
  GraduationCap, 
  Upload, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Printer, 
  ArrowRight
} from 'lucide-react';
import { uploadStrategicFile } from '../services/storageRouter';

interface ApplicantViewProps {
  school: School;
  onSubmitApplication: (app: OnlineApplication) => void;
  onOpenLetter: (app: OnlineApplication) => void;
}

export const ApplicantView: React.FC<ApplicantViewProps> = ({
  school,
  onSubmitApplication,
  onOpenLetter,
}) => {
  const [applicantName, setApplicantName] = useState('Sophia Chen');
  const [parentName, setParentName] = useState('Michael Chen');
  const [email, setEmail] = useState('chen.family@gmail.com');
  const [phone, setPhone] = useState('+27 82 459 1102');
  const [dob, setDob] = useState('2010-04-18');
  const [gradeApplied, setGradeApplied] = useState(10);
  const [previousSchool, setPreviousSchool] = useState('Pinelands Preparatory');
  const [previousAverageMarks, setPreviousAverageMarks] = useState(78.4);
  
  // Document state
  const [documents, setDocuments] = useState<ApplicantDocument[]>([
    { type: 'birth_cert', fileName: 'sophia_birth_cert.webp', fileSize: 112, storage: 'r2' },
    { type: 'prev_report', fileName: 'term4_report_card.webp', fileSize: 145, storage: 'r2' },
    { type: 'id_doc', fileName: 'parent_id_verified.webp', fileSize: 98, storage: 'r2' },
  ]);

  const [submittedApp, setSubmittedApp] = useState<OnlineApplication | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Simulated Document Upload with in-browser compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'birth_cert' | 'prev_report' | 'id_doc') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsCompressing(true);

    try {
      const uploadResult = await uploadStrategicFile({
        schoolId: school.id,
        category: 'applicant_doc',
        file,
      });

      setDocuments(prev => [
        ...prev.filter(d => d.type !== type),
        {
          type,
          fileName: file.name.replace(/\.[^/.]+$/, "") + ".webp",
          fileSize: uploadResult.storedSizeKb,
          storage: 'r2',
          downloadUrl: uploadResult.fileUrl,
        }
      ]);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Automated Rules Evaluation Engine
    const notes: string[] = [];
    let autoScore = 0;

    // Age Evaluation
    const birthYear = new Date(dob).getFullYear();
    const currentYear = 2026;
    const estimatedAge = currentYear - birthYear;
    const ageOk = estimatedAge >= school.admissionRules.minAge && estimatedAge <= school.admissionRules.maxAge;
    if (ageOk) {
      notes.push(`Age verified: ${estimatedAge} years (within institutional range ${school.admissionRules.minAge}-${school.admissionRules.maxAge})`);
      autoScore += 30;
    } else {
      notes.push(`Age warning: ${estimatedAge} years requires special age exemption.`);
    }

    // Academic Minimum Average
    const meetsCutoff = previousAverageMarks >= school.admissionRules.passScoreThreshold;
    if (meetsCutoff) {
      notes.push(`Academic standard met: Prior average ${previousAverageMarks}% satisfies the ${school.admissionRules.passScoreThreshold}% cutoff.`);
      autoScore += 50;
    } else {
      notes.push(`Academic threshold warning: ${previousAverageMarks}% is below standard cutoff.`);
    }

    // Document Completeness
    const hasBirthCert = documents.some(d => d.type === 'birth_cert');
    const hasReport = documents.some(d => d.type === 'prev_report');
    if (hasBirthCert && hasReport) {
      notes.push(`Documentation verified: Mandatory birth certificate & academic transcript attached.`);
      autoScore += 20;
    } else {
      notes.push(`Incomplete documentation: Additional certified documents required.`);
    }

    const autoStatus: AutoEvalStatus = autoScore >= 80 ? 'passed' : 'flagged';

    const appId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: OnlineApplication = {
      id: appId,
      schoolId: school.id,
      applicantName,
      parentName,
      email,
      phone,
      dateOfBirth: dob,
      gradeApplied: Number(gradeApplied),
      previousSchool,
      previousAverageMarks: Number(previousAverageMarks),
      documents,
      autoEvaluation: {
        status: autoStatus,
        score: autoScore,
        notes,
        evaluatedAt: new Date().toISOString(),
      },
      registrarReview: {
        status: 'pending',
      },
      createdAt: new Date().toISOString(),
    };

    onSubmitApplication(newApp);
    setSubmittedApp(newApp);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          Public Admissions Portal • Academic Year 2026
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 font-serif">
          {school.name}
        </h2>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Complete the official online application. Applications undergo instant automated pre-screening before being submitted to the Registrar's Office for final acceptance.
        </p>
      </div>

      {submittedApp ? (
        /* Submission Success & Instant Letterhead Access */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900">Application Successfully Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Reference Number: <strong className="text-blue-900">{submittedApp.id}</strong>
            </p>
          </div>

          {/* Automated Screening Result Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Instant Automated Pre-Screening:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                submittedApp.autoEvaluation.status === 'passed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {submittedApp.autoEvaluation.status === 'passed' ? 'QUALIFIED' : 'NEEDS REVIEW'} ({submittedApp.autoEvaluation.score}%)
              </span>
            </div>

            <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
              {submittedApp.autoEvaluation.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              Next Step: The School Registrar will verify certified certificates before class placement.
            </div>
          </div>

          {/* Action Button: View Branded Letter */}
          <div className="pt-2">
            <button
              onClick={() => onOpenLetter(submittedApp)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>View Official School Letterhead Acknowledgement</span>
            </button>
          </div>
        </div>
      ) : (
        /* Application Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
          {/* Section 1: Biographical Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              1. Learner & Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Learner Full Name</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent / Legal Guardian Name</label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applying for Grade</label>
                <select
                  value={gradeApplied}
                  onChange={(e) => setGradeApplied(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                >
                  {school.admissionRules.openGrades.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Previous Academic Record */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              2. Academic History & Qualifying Grades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous School Attended</label>
                <input
                  type="text"
                  required
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Previous Overall Academic Average (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={previousAverageMarks}
                    onChange={(e) => setPreviousAverageMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Institutional minimum requirement: {school.admissionRules.passScoreThreshold}%
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Document Uploads with in-browser WebP compression */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                3. Mandatory Document Uploads (Cloudflare R2 • $0 Egress)
              </span>
              <span className="text-[11px] font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Auto-Compressed to WebP
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Birth Certificate */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">Birth Certificate</div>
                <p className="text-[10px] text-slate-400">PDF or Scanned Photo</p>
                <label className="cursor-pointer inline-block bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-[11px]">
                  <span>Upload / Replace</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'birth_cert')}
                  />
                </label>
                {documents.find(d => d.type === 'birth_cert') && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Attached ({documents.find(d => d.type === 'birth_cert')?.fileSize} KB)
                  </div>
                )}
              </div>

              {/* Previous Term Report */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">Prior Term Report Card</div>
                <p className="text-[10px] text-slate-400">Certified Academic Record</p>
                <label className="cursor-pointer inline-block bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-[11px]">
                  <span>Upload / Replace</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'prev_report')}
                  />
                </label>
                {documents.find(d => d.type === 'prev_report') && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Attached ({documents.find(d => d.type === 'prev_report')?.fileSize} KB)
                  </div>
                )}
              </div>

              {/* Parent ID */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">Parent / Guardian ID</div>
                <p className="text-[10px] text-slate-400">National ID or Passport</p>
                <label className="cursor-pointer inline-block bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-[11px]">
                  <span>Upload / Replace</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'id_doc')}
                  />
                </label>
                {documents.find(d => d.type === 'id_doc') && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Attached ({documents.find(d => d.type === 'id_doc')?.fileSize} KB)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Protected by Firebase App Check</span>
            </div>

            <button
              type="submit"
              disabled={isCompressing}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25"
            >
              <span>Submit Application & Auto-Evaluate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
