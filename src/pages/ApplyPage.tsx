import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { School, OnlineApplication } from '../types';
import { ApplicantView } from '../components/ApplicantView';
import { OfficialLetterhead } from '../components/OfficialLetterhead';
import { ScholaCrestLogo } from '../components/ScholaCrestLogo';
import { 
  Building2, 
  GraduationCap, 
  ArrowLeft, 
  LogIn 
} from 'lucide-react';

interface ApplyPageProps {
  schools: School[];
  onSubmitApplication: (app: OnlineApplication) => Promise<void>;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ApplyPage: React.FC<ApplyPageProps> = ({
  schools,
  onSubmitApplication,
  onNotify,
}) => {
  const { schoolId } = useParams<{ schoolId?: string }>();
  const navigate = useNavigate();

  // Official Letterhead Modal
  const [activeLetterApp, setActiveLetterApp] = useState<OnlineApplication | null>(null);

  const selectedSchoolId = schoolId || schools[0]?.id || 'sch_apex_academy';
  const currentSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];

  const handleSchoolChange = (newSchoolId: string) => {
    navigate(`/apply/${newSchoolId}`);
  };

  if (!currentSchool) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">No schools available in the database.</p>
          <Link to="/" className="px-4 py-2 bg-crest-navy text-white text-xs font-bold rounded-xl">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>

              <div className="h-6 w-px bg-slate-200" />

              <ScholaCrestLogo size={36} variant="icon-only" />
              <div>
                <div className="font-extrabold text-sm sm:text-base tracking-tight text-crest-navy flex items-center gap-1 leading-none font-serif">
                  ONLINE ADMISSIONS
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Paperless Evaluation & Instant Letter Issuance
                </div>
              </div>
            </div>

            {/* School Tenant Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Applying to:</span>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-crest-navy mr-1.5 flex-shrink-0" />
                <select
                  value={selectedSchoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer text-xs max-w-[200px] truncate"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-crest-navy hover:bg-slate-100 transition-colors ml-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Login</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicantView
          school={currentSchool}
          onSubmitApplication={onSubmitApplication}
          onOpenLetter={(app) => setActiveLetterApp(app)}
          onNotify={onNotify}
        />
      </main>

      {/* Branded Letter Modal */}
      {activeLetterApp && (
        <OfficialLetterhead
          school={currentSchool}
          application={activeLetterApp}
          onClose={() => setActiveLetterApp(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-crest-navy" />
            <span className="font-bold text-slate-800">Schola Crest Online Admissions Portal</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Selected Institution: <strong className="text-crest-navy">{currentSchool.name}</strong>
          </div>
        </div>
      </footer>
    </div>
  );
};
