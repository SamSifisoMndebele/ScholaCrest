// ============================================================================
// Full Functional Authentication Context (Firebase Auth + Multi-Tenant Roles)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import type { AppUser, UserRole } from '../types';
import { INITIAL_USERS } from '../services/dbRouter';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | 'applicant';
  schoolId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<AppUser>;
  registerWithEmail: (email: string, pass: string, fullName: string, role: UserRole, schoolId: string) => Promise<AppUser>;
  loginAsRole: (role: UserRole | 'applicant', schoolId?: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole | 'applicant') => void;
  switchSchool: (newSchoolId: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_USERS: Record<string, AppUser> = {
  super_admin: {
    uid: 'usr_super_admin',
    email: 'superadmin@scholacrest.com',
    fullName: 'Platform Super Admin',
    role: 'super_admin',
    schoolId: 'all',
  },
  school_admin: {
    uid: 'usr_principal_sarah',
    email: 'principal@apexacademy.edu',
    fullName: 'Dr. Sarah Khumalo (Principal)',
    role: 'school_admin',
    schoolId: 'sch_apex_academy',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  registrar: {
    uid: 'usr_registrar_marcus',
    email: 'registrar@apexacademy.edu',
    fullName: 'Mr. Marcus Vance (Registrar)',
    role: 'registrar',
    schoolId: 'sch_apex_academy',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  teacher: {
    uid: 'usr_teacher_elena',
    email: 'elena.rostova@apexacademy.edu',
    fullName: 'Ms. Elena Rostova',
    role: 'teacher',
    schoolId: 'sch_apex_academy',
    assignedSubjectIds: ['sub_math_g10', 'sub_phys_g10', 'sub_comp_g10'],
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
  },
  student: {
    uid: 'usr_student_ethan',
    email: 'ethan.parker@student.apexacademy.edu',
    fullName: 'Ethan Parker',
    role: 'student',
    schoolId: 'sch_apex_academy',
    classId: 'cls_10A',
    admissionNumber: 'AIHS-2024-0419',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  applicant: {
    uid: 'usr_guest_applicant',
    email: 'applicant@scholacrest.com',
    fullName: 'Prospective Applicant',
    role: 'student',
    schoolId: 'sch_apex_academy',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('sc_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to Super Admin for dev inspection
    return PRESET_USERS.super_admin;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveUserSession = (appUser: AppUser) => {
    setUser(appUser);
    localStorage.setItem('sc_auth_user', JSON.stringify(appUser));
  };

  const loginWithEmail = async (email: string, pass: string): Promise<AppUser> => {
    setError(null);
    setIsLoading(true);
    try {
      let fbUser: FirebaseUser | null = null;
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        fbUser = cred.user;
      } catch (signInErr: any) {
        // If user not found, auto-create the Firebase account for seamless usability
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, email, pass);
            fbUser = createCred.user;
          } catch {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      // Find matching known user or derive role
      const matched = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      let appUser: AppUser;
      if (matched) {
        appUser = { ...matched, uid: fbUser?.uid || matched.uid };
      } else {
        // Default role based on email hint
        let inferredRole: UserRole = 'student';
        if (email.includes('super')) inferredRole = 'super_admin';
        else if (email.includes('admin') || email.includes('principal')) inferredRole = 'school_admin';
        else if (email.includes('registrar')) inferredRole = 'registrar';
        else if (email.includes('teacher')) inferredRole = 'teacher';

        appUser = {
          uid: fbUser?.uid || `usr_${Date.now()}`,
          email,
          fullName: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
          role: inferredRole,
          schoolId: inferredRole === 'super_admin' ? 'all' : 'sch_apex_academy',
        };
      }

      saveUserSession(appUser);
      return appUser;
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole,
    schoolId: string
  ): Promise<AppUser> => {
    setError(null);
    setIsLoading(true);
    try {
      let uid = `usr_${Date.now()}`;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        uid = cred.user.uid;
      } catch (err: any) {
        if (err.code !== 'auth/email-already-in-use') {
          throw err;
        }
      }

      const newUser: AppUser = {
        uid,
        email,
        fullName,
        role,
        schoolId: role === 'super_admin' ? 'all' : schoolId,
      };

      saveUserSession(newUser);
      return newUser;
    } catch (err: any) {
      console.error('[Auth] Registration error:', err);
      const msg = err.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsRole = async (role: UserRole | 'applicant', schoolId?: string): Promise<AppUser> => {
    setError(null);
    const preset = PRESET_USERS[role] || PRESET_USERS.super_admin;
    const finalUser: AppUser = {
      ...preset,
      schoolId: schoolId || preset.schoolId,
    };

    try {
      // Optional background anonymous Firebase attestation
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(() => {});
      }
    } catch {}

    saveUserSession(finalUser);
    return finalUser;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('[Auth] Sign out error:', err);
    }
    setUser(null);
    localStorage.removeItem('sc_auth_user');
  };

  const switchRole = (newRole: UserRole | 'applicant') => {
    if (newRole === 'applicant') {
      const applicantUser: AppUser = {
        ...PRESET_USERS.applicant,
        schoolId: user?.schoolId || 'sch_apex_academy',
      };
      saveUserSession(applicantUser);
      return;
    }

    const preset = PRESET_USERS[newRole];
    if (preset) {
      const updatedUser: AppUser = {
        ...preset,
        schoolId: newRole === 'super_admin' ? 'all' : (user?.schoolId || preset.schoolId),
      };
      saveUserSession(updatedUser);
    }
  };

  const switchSchool = (newSchoolId: string) => {
    if (user) {
      const updated = { ...user, schoolId: newSchoolId };
      saveUserSession(updated);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    firebaseUser,
    role: user?.role || 'super_admin',
    schoolId: user?.schoolId || 'sch_apex_academy',
    isAuthenticated: !!user,
    isLoading,
    error,
    loginWithEmail,
    registerWithEmail,
    loginAsRole,
    logout,
    switchRole,
    switchSchool,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
