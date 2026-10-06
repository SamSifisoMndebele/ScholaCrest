import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScholaCrestLogo } from '../components/ScholaCrestLogo';
import type { School, UserRole, OnlineApplication, TermReportCard } from '../types';
import { OfficialLetterhead } from '../components/OfficialLetterhead';
import { OfficialReportCard } from '../components/OfficialReportCard';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  HardDrive, 
  ArrowLeft, 
  LogOut, 
  Home, 
  CheckCircle2,
  AlertCircle,
  Radio
} from 'lucide-react';

interface PortalLayoutProps {
  schools: School[];
  activeSchoolId: string;
  onSelectSchool: (schoolId: string) => void;
  reportCard: TermReportCard;
  activeLetterApp: OnlineApplication | null;
  showReportCardModal: boolean;
  onCloseLetter: () => void;
  onCloseReportCard: () => void;
  toasts: Array<{ id: string; title: string; message: string; type: 'success' | 'info' | 'warning' }>;
  onDismissToast: (id: string) => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  schools,
  activeSchoolId,
  onSelectSchool,
  reportCard,
  activeLetterApp,
  showReportCardModal,
  onCloseLetter,
  onCloseReportCard,
  toasts,
  onDismissToast,
}) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentSchool = schools.find(s => s.id === activeSchoolId) || schools[0] || {
    id: 'sch_default',
    name: 'Schola Crest Academy',
    code: 'SCA-2026',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    letterhead: {
      schoolName: 'SCHOLA CREST ACADEMY',
      emisNumber: 'EMIS: 700100200',
      motto: 'Excellence in Leadership',
      address: '100 Academy Way',
      phone: '+27 21 555 0100',
      email: 'admissions@scholacrest.edu',
      website: 'https://scholacrest.edu',
      logoUrl: '/icon.svg',
      signatureTitle: 'The Office of the Principal',
      primaryColor: '#092451',
      secondaryColor: '#c27f1a',
    },
    admissionRules: {
      minAge: 13,
      maxAge: 19,
      passScoreThreshold: 60,
      openGrades: [8, 9, 10, 11, 12],
      requireBirthCert: true,
      requirePrevReport: true,
      requireIdProof: true,
    },
  };

  const handleRoleTabClick = (role: UserRole | 'applicant') => {
    switchRole(role);
    switch (role) {
      case 'super_admin':
        navigate('/portal/super-admin');
        break;
      case 'school_admin':
        navigate('/portal/school-admin');
        break;
      case 'registrar':
        navigate('/portal/registrar');
        break;
      case 'teacher':
        navigate('/portal/teacher');
        break;
      case 'student':
        navigate('/portal/student');
        break;
      case 'applicant':
        navigate('/apply');
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Determine active tab from URL path
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Home Button + Logo + School Tenant Picker */}
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200/60"
                title="Return to Public Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Landing Page</span>
              </Link>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <ScholaCrestLogo size={38} variant="icon-only" />
              <div>
                <div className="font-extrabold text-sm sm:text-base tracking-tight text-crest-navy flex items-center gap-1 leading-none font-sans">
                  SCHOLA CREST <span className="text-[10px] bg-blue-100 text-crest-navy px-1.5 py-0.5 rounded font-sans font-semibold">SaaS</span>
                </div>
                {/* School Tenant Dropdown */}
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-crest-navy flex-shrink-0" />
                  <select
                    value={activeSchoolId}
                    onChange={(e) => onSelectSchool(e.target.value)}
                    className="font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-3 text-xs truncate max-w-[160px] sm:max-w-[220px]"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Architecture & Live D1 Status Badges */}
            <div className="hidden xl:flex items-center space-x-2 text-[11px] font-mono">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                App Check: Active
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                R2: $0 Egress
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                <Database className="w-3.5 h-3.5 text-crest-navy" />
                D1: Online
              </span>
            </div>

            {/* Role Switcher Toolbar */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold overflow-x-auto max-w-[380px] sm:max-w-[440px]">
                <button
                  onClick={() => handleRoleTabClick('super_admin')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentPath.includes('super-admin') ? 'bg-crest-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Super Admin Console"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => handleRoleTabClick('school_admin')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentPath.includes('school-admin') ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="School Principal Dashboard"
                >
                  Principal
                </button>
                <button
                  onClick={() => handleRoleTabClick('registrar')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentPath.includes('registrar') ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Registrar Admissions Desk"
                >
                  Registrar
                </button>
                <button
                  onClick={() => handleRoleTabClick('teacher')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentPath.includes('teacher') ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Teacher Gradebook Desk"
                >
                  Teacher
                </button>
                <button
                  onClick={() => handleRoleTabClick('student')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentPath.includes('student') ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Learner Coursework & Reports"
                >
                  Learner
                </button>
              </div>

              {/* User Avatar & Logout */}
              {user && (
                <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title={`Sign Out (${user.fullName})`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Modal 1: Official School Letterhead */}
      {activeLetterApp && (
        <OfficialLetterhead
          school={currentSchool}
          application={activeLetterApp}
          onClose={onCloseLetter}
        />
      )}

      {/* Modal 2: Official Term Report Card */}
      {showReportCardModal && (
        <OfficialReportCard
          school={currentSchool}
          reportCard={reportCard}
          onClose={onCloseReportCard}
        />
      )}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border text-xs flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success' 
                ? 'bg-slate-900/95 text-white border-emerald-500/40' 
                : toast.type === 'warning'
                ? 'bg-amber-950/95 text-white border-amber-500/40'
                : 'bg-slate-900/95 text-white border-blue-500/40'
            }`}
          >
            <div className="p-1 rounded-lg mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
              {toast.type === 'info' && <Radio className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-100">{toast.title}</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismissToast(toast.id)}
              className="text-slate-400 hover:text-white font-bold ml-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ScholaCrestLogo size={22} variant="icon-only" />
            <span className="font-bold text-slate-800">Schola Crest Multi-Tenant SMS</span>
            <span>• Protected by Firebase App Check & Cloudflare Edge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-crest-navy hover:underline font-bold flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </Link>
            <span className="font-mono text-[11px] text-slate-400">
              Tenant: <strong className="text-crest-navy">{currentSchool.name} ({currentSchool.code})</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
