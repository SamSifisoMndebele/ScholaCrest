import React, { useState } from 'react';
import type { School, OnlineApplication, ApplicantDocument, AutoEvalStatus } from '../types';
import { 
  GraduationCap, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  ArrowRight,
  Sparkles,
  Building,
  User,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { uploadStrategicFile } from '../services/storageRouter';

interface ApplicantViewProps {
  school: School;
  onSubmitApplication: (app: OnlineApplication) => void;
  onOpenLetter: (app: OnlineApplication) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ApplicantView: React.FC<ApplicantViewProps> = ({
  school,
  onSubmitApplication,
  onOpenLetter,
  onNotify,
}) => {
  const [applicantName, setApplicantName] = useState('Sophia Chen');
  const [parentName, setParentName] = useState('Michael Chen');
  const [email, setEmail] = useState('chen.family@gmail.com');
  const [phone, setPhone] = useState('+27 82 459 1102');
  const [dob, setDob] = useState('2010-04-18');
  const [gradeApplied, setGradeApplied] = useState(10);
  const [previousSchool, setPreviousSchool] = useState('Pinelands Preparatory');
  const [previousAverageMarks, setPreviousAverageMarks] = useState(78.4);
  
  // Document state with realistic initial files
  const [documents, setDocuments] = useState<ApplicantDocument[]>([
    { type: 'birth_cert', fileName: 'sophia_birth_cert.webp', fileSize: 112, storage: 'r2' },
    { type: 'prev_report', fileName: 'term4_report_card.webp', fileSize: 145, storage: 'r2' },
    { type: 'id_doc', fileName: 'parent_id_verified.webp', fileSize: 98, storage: 'r2' },
  ]);

  const [submittedApp, setSubmittedApp] = useState<OnlineApplication | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [lastUploadedType, setLastUploadedType] = useState<string | null>(null);

  // Simulated Document Upload with in-browser WebP compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'birth_cert' | 'prev_report' | 'id_doc') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsCompressing(true);
    setLastUploadedType(type);

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

      if (onNotify) {
        onNotify(
          'Document Compressed & Uploaded',
          `${file.name} compressed to WebP (${uploadResult.storedSizeKb} KB) and stored on Cloudflare R2 with $0 egress.`,
          'success'
        );
      }
    } finally {
      setIsCompressing(false);
    }
  };

  // Real-time Cutoff Calculation
  const cutoffDiff = previousAverageMarks - school.admissionRules.passScoreThreshold;
  const isCutoffSatisfied = cutoffDiff >= 0;

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
      notes.push(`Age verified: ${estimatedAge} years (satisfies institutional range ${school.admissionRules.minAge}-${school.admissionRules.maxAge})`);
      autoScore += 30;
    } else {
      notes.push(`Age alert: ${estimatedAge} years requires special registrar age exemption.`);
    }

    // Academic Minimum Average
    const meetsCutoff = previousAverageMarks >= school.admissionRules.passScoreThreshold;
    if (meetsCutoff) {
      notes.push(`Academic standard met: Prior average of ${previousAverageMarks}% exceeds the ${school.admissionRules.passScoreThreshold}% cutoff.`);
      autoScore += 50;
    } else {
      notes.push(`Academic threshold alert: Prior average ${previousAverageMarks}% is below standard cutoff.`);
    }

    // Document Completeness
    const hasBirthCert = documents.some(d => d.type === 'birth_cert');
    const hasReport = documents.some(d => d.type === 'prev_report');
    if (hasBirthCert && hasReport) {
      notes.push(`Documentation verified: Mandatory birth certificate & academic transcript attached via Cloudflare R2.`);
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

    if (onNotify) {
      onNotify(
        'Application Successfully Submitted!',
        `Ref ${appId} pre-evaluated: Score ${autoScore}% (${autoStatus === 'passed' ? 'Qualified' : 'Pending Review'}).`,
        'success'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crest-navy/5 text-crest-navy text-xs font-bold uppercase tracking-wider border border-crest-navy/10">
          <GraduationCap className="w-4 h-4 text-crest-gold" />
          Public Admissions Portal • Academic Year 2026
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-crest-navy font-serif">
          {school.name}
        </h2>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          Complete the official online application. Applications undergo instant rule-based pre-screening before being submitted to the Registrar's Office for document validation.
        </p>

        {/* Admissions Stepper Indicator */}
        <div className="pt-4 max-w-2xl mx-auto grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
              submittedApp ? 'bg-emerald-600 text-white' : 'bg-crest-navy text-white shadow-xs'
            }`}>
              1
            </div>
            <span className="text-slate-700">Bio & Parent</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
              submittedApp ? 'bg-emerald-600 text-white' : 'bg-crest-navy text-white shadow-xs'
            }`}>
              2
            </div>
            <span className="text-slate-700">Academics</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
              submittedApp ? 'bg-emerald-600 text-white' : 'bg-crest-navy text-white shadow-xs'
            }`}>
              3
            </div>
            <span className="text-slate-700">R2 Uploads</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
              submittedApp ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
            }`}>
              4
            </div>
            <span className={submittedApp ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
              Decision Letter
            </span>
          </div>
        </div>
      </div>

      {submittedApp ? (
        /* Submission Success & Instant Letterhead Access */
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-crest-navy font-serif">
              Application Successfully Submitted!
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Official Reference Number: <strong className="text-crest-navy font-bold">{submittedApp.id}</strong>
            </p>
          </div>

          {/* Automated Screening Result Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 max-w-xl mx-auto text-left space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-crest-navy uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-crest-gold" />
                Instant Automated Pre-Screening:
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                submittedApp.autoEvaluation.status === 'passed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {submittedApp.autoEvaluation.status === 'passed' ? 'QUALIFIED FOR ADMISSION' : 'REQUIRES REGISTRAR REVIEW'} ({submittedApp.autoEvaluation.score}%)
              </span>
            </div>

            <ul className="text-xs text-slate-700 space-y-2">
              {submittedApp.autoEvaluation.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Next Step: Registrar Office verification</span>
              <span className="font-mono text-emerald-700 font-bold">Priority Status: Queued</span>
            </div>
          </div>

          {/* Action Button: View Branded Letter */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onOpenLetter(submittedApp)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-crest-navy hover:bg-crest-navyDark text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-crest-navy/20 transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4 text-crest-gold" />
              <span>View Official School Letterhead Acknowledgement</span>
            </button>
            <button
              onClick={() => {
                setSubmittedApp(null);
                setApplicantName('');
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      ) : (
        /* Application Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6 text-xs">
          {/* Section 1: Biographical Info */}
          <div>
            <h3 className="text-xs font-bold text-crest-navy uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-crest-navy" />
              1. Learner & Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Learner Full Name
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Parent / Legal Guardian Name
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Applying for Grade
                </label>
                <select
                  value={gradeApplied}
                  onChange={(e) => setGradeApplied(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs font-semibold"
                >
                  {school.admissionRules.openGrades.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Previous Academic Record with Real-time Cutoff Gauge */}
          <div>
            <h3 className="text-xs font-bold text-crest-navy uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-crest-navy" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Previous Overall Academic Average (%)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isCutoffSatisfied ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isCutoffSatisfied ? `+${cutoffDiff.toFixed(1)}% above cutoff` : `${cutoffDiff.toFixed(1)}% below standard`}
                  </span>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono text-xs"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">%</span>
                </div>

                {/* Visual Cutoff Progress Bar */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${isCutoffSatisfied ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, previousAverageMarks))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span className="font-bold text-crest-navy">Target Cutoff: {school.admissionRules.passScoreThreshold}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Document Uploads with WebP Compression Preview */}
          <div>
            <h3 className="text-xs font-bold text-crest-navy uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                3. Mandatory Document Attachments (Cloudflare R2 • $0 Egress)
              </span>
              <span className="text-[11px] font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                In-Browser WebP Compression
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Birth Certificate */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">Birth Certificate</div>
                <p className="text-[10px] text-slate-400">PDF or Scanned Photo</p>
                <label className="cursor-pointer inline-block bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 font-bold text-[11px] shadow-xs">
                  <span>{isCompressing && lastUploadedType === 'birth_cert' ? 'Compressing...' : 'Upload / Replace'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={isCompressing}
                    onChange={(e) => handleFileUpload(e, 'birth_cert')}
                  />
                </label>
                {documents.find(d => d.type === 'birth_cert') && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Attached ({documents.find(d => d.type === 'birth_cert')?.fileSize} KB WebP)
                  </div>
                )}
              </div>

              {/* Previous Term Report */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">Prior Term Report Card</div>
                <p className="text-[10px] text-slate-400">Certified Academic Record</p>
                <label className="cursor-pointer inline-block bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 font-bold text-[11px] shadow-xs">
                  <span>{isCompressing && lastUploadedType === 'prev_report' ? 'Compressing...' : 'Upload / Replace'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={isCompressing}
                    onChange={(e) => handleFileUpload(e, 'prev_report')}
                  />
                </label>
                {documents.find(d => d.type === 'prev_report') && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Attached ({documents.find(d => d.type === 'prev_report')?.fileSize} KB WebP)
                  </div>
                )}
              </div>

              {/* Parent ID */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">Parent / Guardian ID</div>
                <p className="text-[10px] text-slate-400">National ID or Passport</p>
                <label className="cursor-pointer inline-block bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 font-bold text-[11px] shadow-xs">
                  <span>{isCompressing && lastUploadedType === 'id_doc' ? 'Compressing...' : 'Upload / Replace'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={isCompressing}
                    onChange={(e) => handleFileUpload(e, 'id_doc')}
                  />
                </label>
                {documents.find(d => d.type === 'id_doc') && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Attached ({documents.find(d => d.type === 'id_doc')?.fileSize} KB WebP)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Protected by Firebase App Check & reCAPTCHA Enterprise</span>
            </div>

            <button
              type="submit"
              disabled={isCompressing}
              className="flex items-center gap-2 px-6 py-3 bg-crest-navy hover:bg-crest-navyDark text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-crest-navy/20 hover:scale-[1.02]"
            >
              <span>Submit Application & Auto-Evaluate</span>
              <ArrowRight className="w-4 h-4 text-crest-gold" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
