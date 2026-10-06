import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { 
  School, 
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPageView } from './components/LandingPageView';
import { ApplyPage } from './pages/ApplyPage';
import { LoginPage } from './pages/LoginPage';
import { PortalLayout } from './pages/PortalLayout';
import { SuperAdminView } from './components/SuperAdminView';
import { SchoolAdminView } from './components/SchoolAdminView';
import { RegistrarView } from './components/RegistrarView';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

function PortalIndexRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/portal/super-admin" replace />;
    case 'school_admin':
      return <Navigate to="/portal/school-admin" replace />;
    case 'registrar':
      return <Navigate to="/portal/registrar" replace />;
    case 'teacher':
      return <Navigate to="/portal/teacher" replace />;
    case 'student':
      return <Navigate to="/portal/student" replace />;
    default:
      return <Navigate to="/portal/super-admin" replace />;
  }
}

export function App() {
  // Real Database State
  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState<string>('');

  // Multi-Tenant Data Stores (Loaded from real D1 Database)
  const [applications, setApplications] = useState<OnlineApplication[]>([]);
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [marks, setMarks] = useState<SubjectAssessmentMark[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [reportCard, setReportCard] = useState<TermReportCard>(INITIAL_REPORT_CARD);

  // Modals
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

  // Demo user objects for role simulation
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
        let liveSchools = await api.getSchools();
        if (!liveSchools || liveSchools.length === 0) {
          await api.seedDatabase();
          liveSchools = await api.getSchools();
        }
        setSchools(liveSchools);
        if (liveSchools.length > 0) {
          setActiveSchoolId(liveSchools[0].id);
        }
      } catch (err) {
        console.warn('[App] Real DB initialization notice:', err);
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
      showToast('School Added', `${newSchool.name} registered.`, 'info');
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

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Landing Page */}
          <Route 
            path="/" 
            element={
              <LandingPageView 
                schools={schools} 
                onSeedDatabase={handleSeedDatabase} 
              />
            } 
          />

          {/* 2. Public Online Admissions Pages */}
          <Route 
            path="/apply" 
            element={
              <ApplyPage 
                schools={schools} 
                onSubmitApplication={handleSubmitApplication} 
                onNotify={showToast} 
              />
            } 
          />
          <Route 
            path="/apply/:schoolId" 
            element={
              <ApplyPage 
                schools={schools} 
                onSubmitApplication={handleSubmitApplication} 
                onNotify={showToast} 
              />
            } 
          />

          {/* 3. Authentication & Login */}
          <Route 
            path="/login" 
            element={<LoginPage schools={schools} />} 
          />

          {/* 4. Multi-Tenant Role Portals (Protected Routing) */}
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <PortalLayout
                  schools={schools}
                  activeSchoolId={activeSchoolId}
                  onSelectSchool={(id) => setActiveSchoolId(id)}
                  reportCard={reportCard}
                  activeLetterApp={activeLetterApp}
                  showReportCardModal={showReportCardModal}
                  onCloseLetter={() => setActiveLetterApp(null)}
                  onCloseReportCard={() => setShowReportCardModal(false)}
                  toasts={toasts}
                  onDismissToast={dismissToast}
                />
              </ProtectedRoute>
            }
          >
            {/* Auto-redirect /portal to appropriate role dashboard */}
            <Route index element={<PortalIndexRedirect />} />

            {/* Super Admin */}
            <Route 
              path="super-admin" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminView
                    schools={schools}
                    onAddSchool={handleAddSchool}
                    onToggleStatus={handleToggleSchoolStatus}
                    onDeleteSchool={handleDeleteSchool}
                    onSeedDatabase={handleSeedDatabase}
                    onSelectSchoolForInspection={(sch) => {
                      setActiveSchoolId(sch.id);
                      showToast('Switched to Tenant', `Now inspecting ${sch.name} as Principal.`, 'info');
                    }}
                    onNotify={showToast}
                  />
                </ProtectedRoute>
              } 
            />

            {/* School Admin / Principal */}
            <Route 
              path="school-admin" 
              element={
                <ProtectedRoute allowedRoles={['school_admin', 'super_admin']}>
                  <SchoolAdminView
                    school={currentSchool}
                    classes={classes}
                    subjects={subjects}
                    onUpdateSchool={handleUpdateSchool}
                    onPreviewLetterhead={() => setActiveLetterApp(applications[0] || null)}
                    onPreviewReportCard={() => setShowReportCardModal(true)}
                    onNotify={showToast}
                  />
                </ProtectedRoute>
              } 
            />

            {/* Admissions Registrar */}
            <Route 
              path="registrar" 
              element={
                <ProtectedRoute allowedRoles={['registrar', 'school_admin', 'super_admin']}>
                  <RegistrarView
                    school={currentSchool}
                    applications={applications}
                    onUpdateStatus={handleUpdateApplicationStatus}
                    onOpenLetter={(app) => setActiveLetterApp(app)}
                    onNotify={showToast}
                  />
                </ProtectedRoute>
              } 
            />

            {/* Teacher */}
            <Route 
              path="teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'school_admin', 'super_admin']}>
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
                </ProtectedRoute>
              } 
            />

            {/* Student */}
            <Route 
              path="student" 
              element={
                <ProtectedRoute allowedRoles={['student', 'school_admin', 'super_admin']}>
                  <StudentView
                    school={currentSchool}
                    student={studentUser}
                    subjects={subjects}
                    homework={homework}
                    reportCard={reportCard}
                    onOpenReportCard={() => setShowReportCardModal(true)}
                    onNotify={showToast}
                  />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
