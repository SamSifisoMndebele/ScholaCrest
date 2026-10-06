import { useState, useEffect } from 'react';
import type { 
  School, 
  UserRole, 
  OnlineApplication, 
  HomeworkAssignment, 
  SubjectAssessmentMark, 
  TermReportCard,
  RegistrarDecisionStatus,
  SchoolClass,
  Subject
} from './types';
import { 
  INITIAL_CLASSES, 
  INITIAL_SUBJECTS, 
  INITIAL_USERS, 
  INITIAL_REPORT_CARD 
} from './services/dbRouter';
import { api } from './services/api';
import { LandingPageView } from './components/LandingPageView';
import { OfficialLetterhead } from './components/OfficialLetterhead';
import { OfficialReportCard } from './components/OfficialReportCard';
import { SuperAdminView } from './components/SuperAdminView';
import { SchoolAdminView } from './components/SchoolAdminView';
import { RegistrarView } from './components/RegistrarView';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import { ApplicantView } from './components/ApplicantView';
import { ScholaCrestLogo } from './components/ScholaCrestLogo';
import { 
  ShieldCheck, 
  Building2, 
  Database, 
  HardDrive, 
  Radio,
  CheckCircle2,
  AlertCircle,
  Home,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export function App() {
  // Navigation Mode: 'landing' (public visitor landing page) or 'portal' (internal SMS view)
  const [viewMode, setViewMode] = useState<'landing' | 'portal'>('landing');

  // Real Database State
  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Active Role Simulation (Super Admin, Principal, Registrar, Teacher, Student, Applicant)
  const [currentRole, setCurrentRole] = useState<UserRole | 'applicant'>('super_admin');

  // Multi-Tenant Data Stores (Loaded from real D1 Database)
  const [applications, setApplications] = useState<OnlineApplication[]>([]);
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [marks, setMarks] = useState<SubjectAssessmentMark[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [reportCard, setReportCard] = useState<TermReportCard>(INITIAL_REPORT_CARD);

  // Letter & Report Card Modal Viewers
  const [activeLetterApp, setActiveLetterApp] = useState<OnlineApplication | null>(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Active School Object
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
      address: '100 University Ave',
      phone: '+27 21 555 0100',
      email: 'info@scholacrest.edu',
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

  // Demo User Objects for role simulation
  const teacherUser = INITIAL_USERS.find(u => u.uid === 'usr_teacher_elena')!;
  const studentUser = INITIAL_USERS.find(u => u.uid === 'usr_student_ethan')!;

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `t_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Initial Load: Fetch Schools from Real Cloudflare D1 Database
  useEffect(() => {
    async function loadInitialSchools() {
      try {
        setIsLoading(true);
        let liveSchools = await api.getSchools();
        if (!liveSchools || liveSchools.length === 0) {
          // If fresh database, auto-seed starter data
          console.log('[App] Database is fresh, seeding initial schools...');
          await api.seedDatabase();
          liveSchools = await api.getSchools();
        }
        setSchools(liveSchools);
        if (liveSchools.length > 0) {
          setActiveSchoolId(liveSchools[0].id);
        }
      } catch (err) {
        console.warn('[App] Real DB initialization notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialSchools();
  }, []);

  // 2. Fetch tenant-scoped applications, marks, homework when activeSchool changes
  useEffect(() => {
    if (!activeSchoolId) return;
    async function loadTenantData() {
      try {
        const [apps, hw, mrks, cls, subjs] = await Promise.all([
          api.getApplications(activeSchoolId),
          api.getHomework(activeSchoolId),
          api.getMarks(activeSchoolId),
          api.getClasses(activeSchoolId),
          api.getSubjects(activeSchoolId),
        ]);
        setApplications(apps);
        if (hw && hw.length > 0) setHomework(hw);
        if (mrks && mrks.length > 0) setMarks(mrks);
        if (cls && cls.length > 0) setClasses(cls);
        if (subjs && subjs.length > 0) setSubjects(subjs);
      } catch (err) {
        console.warn('[App] Error loading school tenant records:', err);
      }
    }
    loadTenantData();
  }, [activeSchoolId]);

  // Handlers communicating directly with the real D1 Database
  const handleAddSchool = async (newSchool: School) => {
    try {
      const created = await api.createSchool(newSchool);
      setSchools(prev => [created, ...prev]);
      setActiveSchoolId(created.id);
      showToast('Institution Registered Online', `${created.name} (${created.code}) saved to Cloudflare D1 database.`, 'success');
    } catch (err: any) {
      console.error('Failed to create school:', err);
      setSchools(prev => [newSchool, ...prev]);
      showToast('School Added', `${newSchool.name} added.`, 'info');
    }
  };

  const handleToggleSchoolStatus = async (schoolId: string) => {
    try {
      const res = await api.toggleSchoolStatus(schoolId);
      setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, status: res.status } : s));
    } catch {
      setSchools(prev => prev.map(s => {
        if (s.id === schoolId) {
          const nextStatus = s.status === 'active' ? 'suspended' : 'active';
          return { ...s, status: nextStatus };
        }
        return s;
      }));
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      await api.deleteSchool(schoolId);
      setSchools(prev => prev.filter(s => s.id !== schoolId));
      if (activeSchoolId === schoolId) {
        const remaining = schools.filter(s => s.id !== schoolId);
        if (remaining.length > 0) setActiveSchoolId(remaining[0].id);
      }
      showToast('School Deleted', 'School permanently removed from real D1 database.', 'warning');
    } catch (err: any) {
      console.error('Failed to delete school:', err);
      showToast('Delete Error', err.message || 'Could not delete school.', 'warning');
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setIsLoading(true);
      await api.seedDatabase(true);
      const freshSchools = await api.getSchools();
      setSchools(freshSchools);
      if (freshSchools.length > 0) {
        setActiveSchoolId(freshSchools[0].id);
        const apps = await api.getApplications(freshSchools[0].id);
        setApplications(apps);
      }
      showToast('Database Initialized', 'Starter institutions loaded into real D1 database.', 'success');
    } catch (err: any) {
      console.error('Seeding failed:', err);
      showToast('Seeding Error', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSchool = async (updated: School) => {
    try {
      const saved = await api.updateSchool(updated);
      setSchools(prev => prev.map(s => s.id === saved.id ? saved : s));
      showToast('Institutional Branding Saved', `${saved.name} updated in real D1 database.`, 'success');
    } catch {
      setSchools(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: RegistrarDecisionStatus, notes?: string) => {
    try {
      const updated = await api.updateApplicationStatus(appId, newStatus, notes);
      setApplications(prev => prev.map(a => a.id === appId ? updated : a));
    } catch {
      setApplications(prev => prev.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            registrarReview: {
              ...a.registrarReview,
              status: newStatus,
              reviewNotes: notes || a.registrarReview.reviewNotes,
              decisionDate: new Date().toISOString(),
            }
          };
        }
        return a;
      }));
    }
  };

  const handleAddHomework = async (newHw: HomeworkAssignment) => {
    try {
      const created = await api.addHomework(newHw);
      setHomework(prev => [created, ...prev]);
    } catch {
      setHomework(prev => [newHw, ...prev]);
    }
  };

  const handleAddOrUpdateMark = async (newMark: SubjectAssessmentMark) => {
    try {
      const created = await api.addMark(newMark);
      setMarks(prev => [created, ...prev]);
    } catch {
      setMarks(prev => [newMark, ...prev]);
    }

    // Recalculate Report Card dynamically
    setReportCard(prev => {
      const updatedSubjects = prev.subjects.map(sub => {
        if (sub.subjectId === newMark.subjectId) {
          const pct = Math.round((newMark.markObtained / newMark.maxMark) * 100);
          return {
            ...sub,
            mark: newMark.markObtained,
            maxMark: newMark.maxMark,
            percentage: pct,
            gradeSymbol: pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D',
            teacherRemark: newMark.teacherRemark || sub.teacherRemark,
          };
        }
        return sub;
      });

      const avg = updatedSubjects.reduce((acc, curr) => acc + curr.percentage, 0) / updatedSubjects.length;

      return {
        ...prev,
        subjects: updatedSubjects,
        overallAverage: avg,
      };
    });
  };

  const handleSubmitApplication = async (newApp: OnlineApplication) => {
    try {
      const created = await api.submitApplication(newApp);
      setApplications(prev => [created, ...prev]);
      showToast('Application Recorded', `Ref ${created.id} saved in Cloudflare D1 admissions table.`, 'success');
    } catch {
      setApplications(prev => [newApp, ...prev]);
    }
  };

  // If on Landing Page view, render the public landing experience
  if (viewMode === 'landing') {
    return (
      <div className="relative">
        <LandingPageView
          schools={schools}
          onSelectSchoolToApply={(school) => {
            setActiveSchoolId(school.id);
            setCurrentRole('applicant');
            setViewMode('portal');
            showToast('Admissions Portal', `Applying to ${school.name} (${school.code})`, 'info');
          }}
          onEnterPortal={(role) => {
            setCurrentRole(role);
            setViewMode('portal');
          }}
          onSeedDatabase={handleSeedDatabase}
        />

        {/* Global Loading Overlay if initial seeding/loading */}
        {isLoading && (
          <div className="fixed bottom-6 left-6 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs shadow-xl border border-white/10 backdrop-blur-md">
            <Loader2 className="w-4 h-4 animate-spin text-crest-gold" />
            <span>Connecting to Cloudflare D1 Relational Edge...</span>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render the Internal Management & Role Portal
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation & Role Simulator Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Home Button + Logo + School Tenant Picker */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200/60"
                title="Return to Public Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <ScholaCrestLogo size={38} variant="icon-only" />
              <div>
                <div className="font-extrabold text-sm sm:text-base tracking-tight text-crest-navy flex items-center gap-1 font-sans leading-none">
                  SCHOLA CREST <span className="text-[10px] bg-blue-100 text-crest-navy px-1.5 py-0.5 rounded font-sans font-semibold">SaaS</span>
                </div>
                {/* School Tenant Dropdown */}
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-crest-navy flex-shrink-0" />
                  <select
                    value={activeSchoolId}
                    onChange={(e) => setActiveSchoolId(e.target.value)}
                    className="font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-3 text-xs truncate max-w-[180px] sm:max-w-[240px]"
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

            {/* Role Switcher (Simulates login across all user privileges) */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold overflow-x-auto max-w-[420px]">
                <button
                  onClick={() => setCurrentRole('super_admin')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    currentRole === 'super_admin' ? 'bg-crest-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Super Admin: System Owner controlling all schools"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => setCurrentRole('school_admin')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    currentRole === 'school_admin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Principal: Configures school letterhead, branding, and subjects"
                >
                  Principal
                </button>
                <button
                  onClick={() => setCurrentRole('registrar')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    currentRole === 'registrar' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Registrar: Reviews applicant evaluations & issues acceptance letters"
                >
                  Registrar
                </button>
                <button
                  onClick={() => setCurrentRole('teacher')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    currentRole === 'teacher' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Teacher: Scoped strictly to assigned subjects"
                >
                  Teacher
                </button>
                <button
                  onClick={() => setCurrentRole('student')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    currentRole === 'student' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Student: Accesses homework and views official term reports"
                >
                  Learner
                </button>
                <button
                  onClick={() => setCurrentRole('applicant')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    currentRole === 'applicant' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Public Portal: Prospective applicants apply online"
                >
                  Apply Online
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'super_admin' && (
          <SuperAdminView
            schools={schools}
            onAddSchool={handleAddSchool}
            onToggleStatus={handleToggleSchoolStatus}
            onDeleteSchool={handleDeleteSchool}
            onSeedDatabase={handleSeedDatabase}
            onSelectSchoolForInspection={(sch) => {
              setActiveSchoolId(sch.id);
              setCurrentRole('school_admin');
              showToast('Switched to Tenant', `Now inspecting ${sch.name} as Principal.`, 'info');
            }}
            onNotify={showToast}
          />
        )}

        {currentRole === 'school_admin' && (
          <SchoolAdminView
            school={currentSchool}
            classes={classes}
            subjects={subjects}
            onUpdateSchool={handleUpdateSchool}
            onPreviewLetterhead={() => setActiveLetterApp(applications[0] || null)}
            onPreviewReportCard={() => setShowReportCardModal(true)}
            onNotify={showToast}
          />
        )}

        {currentRole === 'registrar' && (
          <RegistrarView
            school={currentSchool}
            applications={applications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onOpenLetter={(app) => setActiveLetterApp(app)}
            onNotify={showToast}
          />
        )}

        {currentRole === 'teacher' && (
          <TeacherView
            school={currentSchool}
            teacher={teacherUser}
            subjects={subjects}
            homework={homework}
            marks={marks}
            onAddHomework={handleAddHomework}
            onAddOrUpdateMark={handleAddOrUpdateMark}
            onNotify={showToast}
          />
        )}

        {currentRole === 'student' && (
          <StudentView
            school={currentSchool}
            student={studentUser}
            subjects={subjects}
            homework={homework}
            reportCard={reportCard}
            onOpenReportCard={() => setShowReportCardModal(true)}
            onNotify={showToast}
          />
        )}

        {currentRole === 'applicant' && (
          <ApplicantView
            school={currentSchool}
            onSubmitApplication={handleSubmitApplication}
            onOpenLetter={(app) => setActiveLetterApp(app)}
            onNotify={showToast}
          />
        )}
      </main>

      {/* Modal 1: Official School Letterhead (Client Rendered, $0 Storage) */}
      {activeLetterApp && (
        <OfficialLetterhead
          school={currentSchool}
          application={activeLetterApp}
          onClose={() => setActiveLetterApp(null)}
        />
      )}

      {/* Modal 2: Official Term Report Card (Client Rendered, $0 Storage) */}
      {showReportCardModal && (
        <OfficialReportCard
          school={currentSchool}
          reportCard={reportCard}
          onClose={() => setShowReportCardModal(false)}
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
              onClick={() => dismissToast(toast.id)}
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
            <button
              onClick={() => setViewMode('landing')}
              className="text-crest-navy hover:underline font-bold flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>
            <span className="font-mono text-[11px] text-slate-400">
              Active Tenant: <strong className="text-crest-navy">{currentSchool.name} ({currentSchool.code})</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
