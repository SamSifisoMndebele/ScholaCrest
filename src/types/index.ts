// ==========================================
// Multi-Tenant School Management System Types
// ==========================================

export type UserRole = 
  | 'super_admin'     // System owner managing all schools
  | 'school_admin'    // Principal / Admin per school
  | 'registrar'       // Admissions officer reviewing & validating applications
  | 'teacher'         // Restricted strictly to assigned subjects/classes
  | 'student';        // Enrolled learner viewing homework, marks, reports

export interface SchoolAdmissionRules {
  minAge: number;
  maxAge: number;
  passScoreThreshold: number; // e.g., 60% minimum in prev school
  openGrades: number[];       // e.g. [8, 9, 10, 11, 12]
  requireBirthCert: boolean;
  requirePrevReport: boolean;
  requireIdProof: boolean;
}

export interface SchoolLetterheadConfig {
  schoolName: string;
  emisNumber: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;          // Stored in Firebase Storage (fast, small)
  stampUrl?: string;         // Stored in Firebase Storage
  signatureUrl?: string;     // Principal / Registrar signature
  signatureTitle: string;    // e.g., "The Headmaster / Admissions Office"
  primaryColor: string;      // Brand color (e.g. #1e3a8a)
  secondaryColor: string;    // Accent color
}

export interface School {
  id: string;                // e.g. "sch_apex_academy"
  name: string;
  code: string;              // e.g. "APEX-01"
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  letterhead: SchoolLetterheadConfig;
  admissionRules: SchoolAdmissionRules;
}

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId: string;
  avatarUrl?: string;        // Stored in Firebase Storage
  assignedSubjectIds?: string[]; // Teacher: restricted strictly to these subjects
  classId?: string;          // Student: assigned classroom (e.g., "cls_10A")
  admissionNumber?: string;  // Student identifier
}

export interface AcademicTerm {
  id: string;
  schoolId: string;
  name: string;              // e.g., "Term 1 - 2026"
  academicYear: string;      // e.g., "2026"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;              // e.g. "Grade 10A"
  gradeLevel: number;        // e.g. 10
  classTeacherId?: string;
  studentCount?: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;              // e.g. "Physical Sciences"
  code: string;              // e.g. "PSC10"
  gradeLevel: number;
  classIds: string[];        // Classes taking this subject
  teacherIds: string[];      // Assigned teachers
}

// ------------------------------------------
// Online Admissions & Dynamic Letters
// ------------------------------------------

export type AutoEvalStatus = 'passed' | 'flagged' | 'failed';
export type RegistrarDecisionStatus = 'pending' | 'accepted' | 'rejected' | 'documents_requested';

export interface ApplicantDocument {
  type: 'birth_cert' | 'prev_report' | 'id_doc';
  fileName: string;
  fileSize: number;
  storage: 'r2';             // High-volume/large docs use Cloudflare R2 ($0 egress)
  downloadUrl?: string;
}

export interface OnlineApplication {
  id: string;                // e.g. "APP-2026-0812"
  schoolId: string;
  applicantName: string;
  parentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gradeApplied: number;
  previousSchool: string;
  previousAverageMarks: number; // e.g. 74.5%
  documents: ApplicantDocument[];
  
  // Step 1: Automated Rules Evaluation
  autoEvaluation: {
    status: AutoEvalStatus;
    score: number;
    notes: string[];
    evaluatedAt: string;
  };

  // Step 2: Registrar / Manual Evaluation
  registrarReview: {
    status: RegistrarDecisionStatus;
    reviewedBy?: string;
    reviewNotes?: string;
    decisionDate?: string;
  };

  createdAt: string;
}

// ------------------------------------------
// Academics: Content & Homework
// ------------------------------------------

export interface SubjectContent {
  id: string;
  schoolId: string;
  subjectId: string;
  title: string;
  description: string;
  uploadedByTeacherId: string;
  attachments?: {
    name: string;
    storage: 'r2';           // Cloudflare R2 for zero bandwidth cost
    url: string;
    sizeKb: number;
  }[];
  createdAt: string;
}

export interface HomeworkAssignment {
  id: string;
  schoolId: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxMarks: number;
  attachment?: {
    name: string;
    storage: 'r2';
    url: string;
  };
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  schoolId: string;
  submittedAt: string;
  storage: 'r2';
  fileUrl: string;
  obtainedMark?: number;
  teacherFeedback?: string;
  gradedBy?: string;
}

// ------------------------------------------
// Marks & Term Report Cards
// ------------------------------------------

export interface SubjectAssessmentMark {
  id: string;
  schoolId: string;
  studentId: string;
  subjectId: string;
  termId: string;
  assessmentName: string;   // e.g. "Midterm Test"
  markObtained: number;
  maxMark: number;
  teacherRemark?: string;
  enteredByTeacherId: string;
  createdAt: string;
}

export interface SubjectReportSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  mark: number;
  maxMark: number;
  percentage: number;
  gradeSymbol: string;      // e.g. "A", "B", "C" or "7", "6"
  teacherRemark: string;
}

export interface TermReportCard {
  id: string;               // studentId_termId
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  termId: string;
  termName: string;
  academicYear: string;
  subjects: SubjectReportSummary[];
  overallAverage: number;
  attendanceDays: number;
  totalDays: number;
  classRank?: number;
  classSize?: number;
  principalRemark: string;
  status: 'draft' | 'published';
  publishedAt?: string;
}
