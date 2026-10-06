import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScholaCrestLogo } from '../components/ScholaCrestLogo';
import type { UserRole, School } from '../types';
import { 
  ShieldCheck, 
  Building2, 
  ClipboardCheck, 
  BookOpen, 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Home,
  UserPlus,
  LogIn
} from 'lucide-react';

interface LoginPageProps {
  schools: School[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ schools }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, registerWithEmail, loginAsRole, error, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<'quick' | 'email'>('quick');
  const [isRegister, setIsRegister] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedSchoolId, setSelectedSchoolId] = useState(schools[0]?.id || 'sch_apex_academy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Get redirect target from query or state
  const from = (location.state as any)?.from?.pathname || '/portal';

  const navigateToRolePortal = (role: UserRole | 'applicant') => {
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
      default:
        navigate('/portal');
        break;
    }
  };

  const handleQuickRoleLogin = async (role: UserRole | 'applicant') => {
    setIsSubmitting(true);
    try {
      await loginAsRole(role, selectedSchoolId);
      navigateToRolePortal(role);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!fullName) {
          setFormError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const user = await registerWithEmail(email, password, fullName, selectedRole, selectedSchoolId);
        navigateToRolePortal(user.role);
      } else {
        const user = await loginWithEmail(email, password);
        if (from !== '/portal') {
          navigate(from);
        } else {
          navigateToRolePortal(user.role);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-crest-gold selection:text-crest-navyDark">
      {/* Top Bar Return Link */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-crest-navy hover:border-crest-navy transition-colors shadow-xs"
        >
          <Home className="w-3.5 h-3.5 text-crest-gold" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <ScholaCrestLogo size={56} variant="icon-only" />
        </div>
        <h2 className="text-3xl font-extrabold text-crest-navy font-serif tracking-tight">
          Schola Crest SMS
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Sign in to your educational institution portal or switch between system roles.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/90">
          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-8 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('quick'); setFormError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'quick' 
                  ? 'bg-crest-navy text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-crest-gold" />
              <span>One-Click Role Access</span>
            </button>
            <button
              onClick={() => { setActiveTab('email'); setFormError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'email' 
                  ? 'bg-crest-navy text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-crest-gold" />
              <span>Firebase Email & Password</span>
            </button>
          </div>

          {(formError || error) && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* TAB 1: ONE-CLICK ROLE ACCESS */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-900 flex items-center justify-between">
                <span>Active Target Tenant:</span>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="font-bold bg-white px-2 py-1 rounded-lg border border-blue-200 text-crest-navy focus:outline-none text-xs"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {/* 1. Super Admin */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickRoleLogin('super_admin')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-crest-navy/50 bg-white hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-crest-navy text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <ShieldCheck className="w-5 h-5 text-crest-gold" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-crest-navy flex items-center gap-1.5 font-serif">
                        Super Administrator
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans font-semibold">Master</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Global oversight, onboarding tenants, Cloudflare D1 management</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-crest-navy group-hover:translate-x-1 transition-all" />
                </button>

                {/* 2. School Admin / Principal */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickRoleLogin('school_admin')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500/50 bg-white hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 font-serif">
                        School Principal / Admin
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-sans font-semibold">Dr. Khumalo</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Letterhead branding, admission rules, curricula & classes</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 3. Registrar */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickRoleLogin('registrar')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500/50 bg-white hover:bg-amber-50/30 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 font-serif">
                        Admissions Registrar
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-sans font-semibold">Mr. Vance</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Review candidate dossiers, inspect docs, issue official letters</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 4. Teacher */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickRoleLogin('teacher')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500/50 bg-white hover:bg-purple-50/30 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 font-serif">
                        Subject Teacher
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-sans font-semibold">Ms. Rostova</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Record assessment marks, publish homework, manage gradebook</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 5. Student */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickRoleLogin('student')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500/50 bg-white hover:bg-emerald-50/30 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 font-serif">
                        Enrolled Learner / Student
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans font-semibold">Ethan Parker</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Access homework, submit solutions, view term report card</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REAL FIREBASE EMAIL / PASSWORD FORM */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              {isRegister && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@scholacrest.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs font-semibold"
                    >
                      <option value="student">Student / Learner</option>
                      <option value="teacher">Subject Teacher</option>
                      <option value="registrar">Admissions Registrar</option>
                      <option value="school_admin">Principal / Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">School Tenant</label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                    >
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-crest-navy hover:bg-crest-navyDark disabled:bg-slate-400 text-white font-bold text-xs transition-all shadow-md shadow-crest-navy/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRegister ? <UserPlus className="w-4 h-4 text-crest-gold" /> : <LogIn className="w-4 h-4 text-crest-gold" />}
                <span>{isSubmitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              </button>

              <div className="text-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs font-bold text-crest-navy hover:underline cursor-pointer"
                >
                  {isRegister ? 'Already have an account? Sign In' : 'Need an institutional account? Register'}
                </button>
              </div>
            </form>
          )}

          {/* Public Application Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Applying as a prospective new learner?</span>{' '}
            <Link to="/apply" className="text-xs font-bold text-crest-gold hover:underline">
              Submit Public Admissions Application →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
