import { useState } from 'react';
import type { 
  School, 
  UserRole, 
  OnlineApplication, 
  HomeworkAssignment, 
  SubjectAssessmentMark, 
  TermReportCard,
  RegistrarDecisionStatus 
} from './types';
import { 
  INITIAL_SCHOOL, 
  INITIAL_CLASSES, 
  INITIAL_SUBJECTS, 
  INITIAL_USERS, 
  INITIAL_APPLICATIONS, 
  INITIAL_HOMEWORK, 
  INITIAL_MARKS, 
  INITIAL_REPORT_CARD 
} from './services/dbRouter';
import { OfficialLetterhead } from './components/OfficialLetterhead';
import { OfficialReportCard } from './components/OfficialReportCard';
import { SuperAdminView } from './components/SuperAdminView';
import { SchoolAdminView } from './components/SchoolAdminView';
import { RegistrarView } from './components/RegistrarView';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import { ApplicantView } from './components/ApplicantView';
import { ScholaCrestLogo } from './components/ScholaCrestLogo';
import type { LogoVariant } from './components/ScholaCrestLogo';
import { 
  ShieldCheck, 
  Building2, 
  Database, 
  HardDrive, 
  Radio,
  Palette
} from 'lucide-react';

export function App() {
  // Global Multi-Tenant State
  const [schools, setSchools] = useState<School[]>([
    INITIAL_SCHOOL,
    {
      ...INITIAL_SCHOOL,
      id: 'sch_st_judes',
      name: "St. Jude's Collegiate Academy",
      code: 'STJU-02',
      letterhead: {
        ...INITIAL_SCHOOL.letterhead,
        schoolName: "ST. JUDE'S COLLEGIATE ACADEMY",
        emisNumber: 'EMIS: 700812940',
        motto: 'Veritas et Virtus in Omnibus',
        primaryColor: '#0f766e',
      }
    }
  ]);
  const [activeSchoolId, setActiveSchoolId] = useState<string>(INITIAL_SCHOOL.id);

  // Active Role Simulation (Super Admin, Principal, Registrar, Teacher, Student, Applicant)
  const [currentRole, setCurrentRole] = useState<UserRole | 'applicant'>('super_admin');

  // Vector SVG Logo Variant Switcher ('crest-classic' | 'crest-monogram' | 'crest-pillar')
  const [logoVariant, setLogoVariant] = useState<LogoVariant>('crest-classic');

  // Multi-Tenant Data Stores
  const [applications, setApplications] = useState<OnlineApplication[]>(INITIAL_APPLICATIONS);
  const [homework, setHomework] = useState<HomeworkAssignment[]>(INITIAL_HOMEWORK);
  const [marks, setMarks] = useState<SubjectAssessmentMark[]>(INITIAL_MARKS);
  const [reportCard, setReportCard] = useState<TermReportCard>(INITIAL_REPORT_CARD);

  // Letter & Report Card Modal Viewers
  const [activeLetterApp, setActiveLetterApp] = useState<OnlineApplication | null>(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Active School Object
  const currentSchool = schools.find(s => s.id === activeSchoolId) || schools[0];

  // Users Mock
  const teacherUser = INITIAL_USERS.find(u => u.uid === 'usr_teacher_elena')!;
  const studentUser = INITIAL_USERS.find(u => u.uid === 'usr_student_ethan')!;

  // Handlers
  const handleAddSchool = (newSchool: School) => {
    setSchools(prev => [...prev, newSchool]);
  };

  const handleToggleSchoolStatus = (schoolId: string) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return { ...s, status: s.status === 'active' ? 'suspended' : 'active' };
      }
      return s;
    }));
  };

  const handleUpdateSchool = (updated: School) => {
    setSchools(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleUpdateApplicationStatus = (appId: string, newStatus: RegistrarDecisionStatus, notes?: string) => {
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
  };

  const handleAddHomework = (newHw: HomeworkAssignment) => {
    setHomework(prev => [newHw, ...prev]);
  };

  const handleAddOrUpdateMark = (newMark: SubjectAssessmentMark) => {
    setMarks(prev => [newMark, ...prev]);

    // Recalculate Ethan's Report Card dynamically
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

  const handleSubmitApplication = (newApp: OnlineApplication) => {
    setApplications(prev => [newApp, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation & Role Simulator Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & School Tenant Picker */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-1.5 flex items-center justify-center shadow-md border border-slate-800">
                <ScholaCrestLogo size={32} variant={logoVariant} />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-blue-950 flex items-center gap-1.5 font-serif">
                  SCHOLACREST <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-sans font-semibold">SaaS</span>
                </div>
                {/* School Tenant Dropdown */}
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Building2 className="w-3 h-3 text-blue-700" />
                  <select
                    value={activeSchoolId}
                    onChange={(e) => setActiveSchoolId(e.target.value)}
                    className="font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-4 text-xs"
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

            {/* Architecture & Zero-Cost Status Badges */}
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                App Check: Active
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                R2: $0 Egress
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                D1: 5M Reads
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                RTDB: Live
              </span>
            </div>

            {/* Logo Style Switcher (Interactive Preview of all 3 SVG variants) */}
            <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
              <Palette className="w-3.5 h-3.5 ml-1.5 mr-1 text-amber-600" />
              <button
                onClick={() => setLogoVariant('crest-classic')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${logoVariant === 'crest-classic' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Crest
              </button>
              <button
                onClick={() => setLogoVariant('crest-monogram')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${logoVariant === 'crest-monogram' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Monogram
              </button>
              <button
                onClick={() => setLogoVariant('crest-pillar')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${logoVariant === 'crest-pillar' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Pillars
              </button>
            </div>

            {/* Role Switcher (Simulates login across all user privileges) */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Role View:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setCurrentRole('super_admin')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currentRole === 'super_admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Super Admin: System Owner controlling all schools"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => setCurrentRole('school_admin')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currentRole === 'school_admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Principal: Configures school letterhead, branding, and subjects"
                >
                  Principal
                </button>
                <button
                  onClick={() => setCurrentRole('registrar')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currentRole === 'registrar' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Registrar: Reviews applicant evaluations & issues acceptance letters"
                >
                  Registrar
                </button>
                <button
                  onClick={() => setCurrentRole('teacher')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currentRole === 'teacher' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Teacher: Scoped strictly to assigned subjects"
                >
                  Teacher
                </button>
                <button
                  onClick={() => setCurrentRole('student')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currentRole === 'student' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Student: Accesses homework and views official term reports"
                >
                  Learner
                </button>
                <button
                  onClick={() => setCurrentRole('applicant')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currentRole === 'applicant' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
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
            onSelectSchoolForInspection={(sch) => {
              setActiveSchoolId(sch.id);
              setCurrentRole('school_admin');
            }}
          />
        )}

        {currentRole === 'school_admin' && (
          <SchoolAdminView
            school={currentSchool}
            classes={INITIAL_CLASSES}
            subjects={INITIAL_SUBJECTS}
            onUpdateSchool={handleUpdateSchool}
            onPreviewLetterhead={() => setActiveLetterApp(applications[0])}
            onPreviewReportCard={() => setShowReportCardModal(true)}
          />
        )}

        {currentRole === 'registrar' && (
          <RegistrarView
            school={currentSchool}
            applications={applications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onOpenLetter={(app) => setActiveLetterApp(app)}
          />
        )}

        {currentRole === 'teacher' && (
          <TeacherView
            school={currentSchool}
            teacher={teacherUser}
            subjects={INITIAL_SUBJECTS}
            homework={homework}
            marks={marks}
            onAddHomework={handleAddHomework}
            onAddOrUpdateMark={handleAddOrUpdateMark}
          />
        )}

        {currentRole === 'student' && (
          <StudentView
            school={currentSchool}
            student={studentUser}
            subjects={INITIAL_SUBJECTS}
            homework={homework}
            reportCard={reportCard}
            onOpenReportCard={() => setShowReportCardModal(true)}
          />
        )}

        {currentRole === 'applicant' && (
          <ApplicantView
            school={currentSchool}
            onSubmitApplication={handleSubmitApplication}
            onOpenLetter={(app) => setActiveLetterApp(app)}
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

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ScholaCrestLogo size={20} variant={logoVariant} />
            <span className="font-bold text-slate-800">ScholaCrest Multi-Tenant SMS</span>
            <span>• Protected by Firebase App Check & Cloudflare Edge</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Domain: <strong className="text-blue-900">scholacrest.com</strong> • Tenant: {currentSchool.name} ({currentSchool.code})
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
