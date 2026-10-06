// ============================================================================
// Multi-Database Orchestrator & Tenant Store
// ============================================================================

import type { 
  School, 
  AppUser, 
  SchoolClass, 
  Subject, 
  OnlineApplication, 
  HomeworkAssignment, 
  SubjectAssessmentMark, 
  TermReportCard,
  AcademicTerm
} from '../types';

// Initial Demo School
export const INITIAL_SCHOOL: School = {
  id: 'sch_apex_academy',
  name: 'Apex International High School',
  code: 'AIHS-2026',
  status: 'active',
  createdAt: '2026-01-10T08:00:00Z',
  letterhead: {
    schoolName: 'APEX INTERNATIONAL HIGH SCHOOL',
    emisNumber: 'EMIS: 700401928',
    motto: 'Striving for Excellence, Integrity, and Knowledge',
    address: '104 Academy Boulevard, Education District, Cape Town, 8001',
    phone: '+27 (0)21 555 0192',
    email: 'admissions@apexacademy.edu',
    website: 'https://apexacademy.edu',
    logoUrl: '/icon.svg',
    stampUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=160&auto=format&fit=crop&q=80',
    signatureTitle: 'The Office of the Headmaster & Registrar',
    primaryColor: '#092451',
    secondaryColor: '#c27f1a',
  },
  admissionRules: {
    minAge: 13,
    maxAge: 19,
    passScoreThreshold: 60, // 60% minimum average in previous grade
    openGrades: [8, 9, 10, 11, 12],
    requireBirthCert: true,
    requirePrevReport: true,
    requireIdProof: true,
  },
};

// Initial Academic Term
export const INITIAL_TERM: AcademicTerm = {
  id: 'term_1_2026',
  schoolId: 'sch_apex_academy',
  name: 'Term 1 – Academic Year 2026',
  academicYear: '2026',
  isCurrent: true,
  startDate: '2026-01-15',
  endDate: '2026-03-27',
};

// Initial Classes
export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'cls_8A', schoolId: 'sch_apex_academy', name: 'Grade 8A', gradeLevel: 8, studentCount: 28 },
  { id: 'cls_9A', schoolId: 'sch_apex_academy', name: 'Grade 9A', gradeLevel: 9, studentCount: 30 },
  { id: 'cls_10A', schoolId: 'sch_apex_academy', name: 'Grade 10A (Sciences)', gradeLevel: 10, studentCount: 26 },
  { id: 'cls_11A', schoolId: 'sch_apex_academy', name: 'Grade 11A (Sciences)', gradeLevel: 11, studentCount: 25 },
  { id: 'cls_12A', schoolId: 'sch_apex_academy', name: 'Grade 12A (Matric Class)', gradeLevel: 12, studentCount: 24 },
];

// Initial Subjects
export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub_math_g10', schoolId: 'sch_apex_academy', name: 'Mathematics', code: 'MTH10', gradeLevel: 10, classIds: ['cls_10A'], teacherIds: ['usr_teacher_elena'] },
  { id: 'sub_phys_g10', schoolId: 'sch_apex_academy', name: 'Physical Sciences', code: 'PHY10', gradeLevel: 10, classIds: ['cls_10A'], teacherIds: ['usr_teacher_elena'] },
  { id: 'sub_eng_g10', schoolId: 'sch_apex_academy', name: 'English First Language', code: 'ENG10', gradeLevel: 10, classIds: ['cls_10A'], teacherIds: ['usr_teacher_david'] },
  { id: 'sub_life_g10', schoolId: 'sch_apex_academy', name: 'Life Sciences (Biology)', code: 'LSC10', gradeLevel: 10, classIds: ['cls_10A'], teacherIds: ['usr_teacher_david'] },
  { id: 'sub_comp_g10', schoolId: 'sch_apex_academy', name: 'Computer Applications', code: 'CAT10', gradeLevel: 10, classIds: ['cls_10A'], teacherIds: ['usr_teacher_elena'] },
];

// Initial Demo Users across All Roles
export const INITIAL_USERS: AppUser[] = [
  {
    uid: 'usr_super_admin',
    email: 'superadmin@schoolsystem.platform',
    fullName: 'Platform Super Admin',
    role: 'super_admin',
    schoolId: 'all',
  },
  {
    uid: 'usr_principal_sarah',
    email: 'principal@apexacademy.edu',
    fullName: 'Dr. Sarah Khumalo (Principal)',
    role: 'school_admin',
    schoolId: 'sch_apex_academy',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr_registrar_marcus',
    email: 'registrar@apexacademy.edu',
    fullName: 'Mr. Marcus Vance (Registrar)',
    role: 'registrar',
    schoolId: 'sch_apex_academy',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr_teacher_elena',
    email: 'elena.rostova@apexacademy.edu',
    fullName: 'Ms. Elena Rostova',
    role: 'teacher',
    schoolId: 'sch_apex_academy',
    assignedSubjectIds: ['sub_math_g10', 'sub_phys_g10', 'sub_comp_g10'],
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr_teacher_david',
    email: 'david.okonkwo@apexacademy.edu',
    fullName: 'Mr. David Okonkwo',
    role: 'teacher',
    schoolId: 'sch_apex_academy',
    assignedSubjectIds: ['sub_eng_g10', 'sub_life_g10'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    uid: 'usr_student_ethan',
    email: 'ethan.parker@student.apexacademy.edu',
    fullName: 'Ethan Parker',
    role: 'student',
    schoolId: 'sch_apex_academy',
    classId: 'cls_10A',
    admissionNumber: 'AIHS-2024-0419',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
];

// Initial Demo Applications
export const INITIAL_APPLICATIONS: OnlineApplication[] = [
  {
    id: 'APP-2026-0812',
    schoolId: 'sch_apex_academy',
    applicantName: 'Sophia Chen',
    parentName: 'Michael Chen',
    email: 'chen.family@gmail.com',
    phone: '+27 82 459 1102',
    dateOfBirth: '2010-04-18', // Age 15
    gradeApplied: 10,
    previousSchool: 'Pinelands Preparatory',
    previousAverageMarks: 78.4,
    documents: [
      { type: 'birth_cert', fileName: 'sophia_birth_cert.webp', fileSize: 112, storage: 'r2' },
      { type: 'prev_report', fileName: 'term4_report_card.webp', fileSize: 145, storage: 'r2' },
      { type: 'id_doc', fileName: 'parent_id_verified.webp', fileSize: 98, storage: 'r2' },
    ],
    autoEvaluation: {
      status: 'passed',
      score: 82,
      notes: [
        'Age verified within acceptable threshold (15 yrs)',
        'Academic previous average (78.4%) exceeds institutional minimum (60%)',
        'All mandatory certified documents uploaded',
      ],
      evaluatedAt: '2026-01-18T10:14:00Z',
    },
    registrarReview: {
      status: 'accepted',
      reviewedBy: 'usr_registrar_marcus',
      reviewNotes: 'Excellent academic history in STEM. Formal acceptance letter issued.',
      decisionDate: '2026-01-20T14:30:00Z',
    },
    createdAt: '2026-01-18T10:14:00Z',
  },
  {
    id: 'APP-2026-0899',
    schoolId: 'sch_apex_academy',
    applicantName: 'Liam Van Der Merwe',
    parentName: 'Helena Van Der Merwe',
    email: 'liam.vdm@outlook.com',
    phone: '+27 83 912 3341',
    dateOfBirth: '2010-09-02',
    gradeApplied: 10,
    previousSchool: 'Durbanville High',
    previousAverageMarks: 64.2,
    documents: [
      { type: 'birth_cert', fileName: 'liam_birth_cert.webp', fileSize: 120, storage: 'r2' },
      { type: 'prev_report', fileName: 'durbanville_gr9_report.webp', fileSize: 160, storage: 'r2' },
    ],
    autoEvaluation: {
      status: 'passed',
      score: 68,
      notes: [
        'Academic previous average (64.2%) satisfies cutoff criteria',
        'Age requirement satisfied',
        'Missing secondary parent identification document',
      ],
      evaluatedAt: '2026-01-22T09:20:00Z',
    },
    registrarReview: {
      status: 'pending',
    },
    createdAt: '2026-01-22T09:20:00Z',
  },
];

// Initial Homework Assignments
export const INITIAL_HOMEWORK: HomeworkAssignment[] = [
  {
    id: 'hw_mth_01',
    schoolId: 'sch_apex_academy',
    subjectId: 'sub_math_g10',
    classId: 'cls_10A',
    teacherId: 'usr_teacher_elena',
    title: 'Quadratic Equations & Parabolic Functions Investigation',
    instructions: 'Complete exercises 4.2 to 4.5 on Chapter 4. Graph the roots and turning points for problems 6-12.',
    dueDate: '2026-02-14T23:59:00Z',
    maxMarks: 50,
    attachment: {
      name: 'Quadratics_Investigation_Sheet.pdf',
      storage: 'r2',
      url: '#',
    },
    createdAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'hw_phy_01',
    schoolId: 'sch_apex_academy',
    subjectId: 'sub_phys_g10',
    classId: 'cls_10A',
    teacherId: 'usr_teacher_elena',
    title: 'Newtonian Dynamics & Free Body Diagrams',
    instructions: 'Draw free body diagrams for inclined planes and calculate net force vector components.',
    dueDate: '2026-02-18T23:59:00Z',
    maxMarks: 40,
    attachment: {
      name: 'Free_Body_Problems.pdf',
      storage: 'r2',
      url: '#',
    },
    createdAt: '2026-02-08T09:30:00Z',
  },
];

// Initial Student Marks
export const INITIAL_MARKS: SubjectAssessmentMark[] = [
  {
    id: 'mrk_01',
    schoolId: 'sch_apex_academy',
    studentId: 'usr_student_ethan',
    subjectId: 'sub_math_g10',
    termId: 'term_1_2026',
    assessmentName: 'Term 1 Midterm Exam',
    markObtained: 84,
    maxMark: 100,
    teacherRemark: 'Superb conceptual clarity on quadratic factorization.',
    enteredByTeacherId: 'usr_teacher_elena',
    createdAt: '2026-02-28T11:00:00Z',
  },
  {
    id: 'mrk_02',
    schoolId: 'sch_apex_academy',
    studentId: 'usr_student_ethan',
    subjectId: 'sub_phys_g10',
    termId: 'term_1_2026',
    assessmentName: 'Term 1 Midterm Exam',
    markObtained: 79,
    maxMark: 100,
    teacherRemark: 'Good application of vectors; refine unit notations.',
    enteredByTeacherId: 'usr_teacher_elena',
    createdAt: '2026-02-28T11:15:00Z',
  },
  {
    id: 'mrk_03',
    schoolId: 'sch_apex_academy',
    studentId: 'usr_student_ethan',
    subjectId: 'sub_eng_g10',
    termId: 'term_1_2026',
    assessmentName: 'Literature Essay & Analysis',
    markObtained: 88,
    maxMark: 100,
    teacherRemark: 'Compelling argumentative structure and vocabulary.',
    enteredByTeacherId: 'usr_teacher_david',
    createdAt: '2026-03-01T14:00:00Z',
  },
  {
    id: 'mrk_04',
    schoolId: 'sch_apex_academy',
    studentId: 'usr_student_ethan',
    subjectId: 'sub_life_g10',
    termId: 'term_1_2026',
    assessmentName: 'Cellular Respiration Test',
    markObtained: 81,
    maxMark: 100,
    teacherRemark: 'Thorough understanding of metabolic diagrams.',
    enteredByTeacherId: 'usr_teacher_david',
    createdAt: '2026-03-02T10:30:00Z',
  },
  {
    id: 'mrk_05',
    schoolId: 'sch_apex_academy',
    studentId: 'usr_student_ethan',
    subjectId: 'sub_comp_g10',
    termId: 'term_1_2026',
    assessmentName: 'Relational Database Project',
    markObtained: 93,
    maxMark: 100,
    teacherRemark: 'Outstanding query optimization and normalization skills.',
    enteredByTeacherId: 'usr_teacher_elena',
    createdAt: '2026-03-03T09:00:00Z',
  },
];

// Initial Published Report Card
export const INITIAL_REPORT_CARD: TermReportCard = {
  id: 'usr_student_ethan_term_1_2026',
  schoolId: 'sch_apex_academy',
  studentId: 'usr_student_ethan',
  studentName: 'Ethan Parker',
  admissionNumber: 'AIHS-2024-0419',
  classId: 'cls_10A',
  className: 'Grade 10A (Sciences)',
  termId: 'term_1_2026',
  termName: 'Term 1 – Academic Year 2026',
  academicYear: '2026',
  subjects: [
    { subjectId: 'sub_math_g10', subjectName: 'Mathematics', subjectCode: 'MTH10', mark: 84, maxMark: 100, percentage: 84, gradeSymbol: 'A', teacherRemark: 'Superb conceptual clarity on quadratic factorization.' },
    { subjectId: 'sub_phys_g10', subjectName: 'Physical Sciences', subjectCode: 'PHY10', mark: 79, maxMark: 100, percentage: 79, gradeSymbol: 'B', teacherRemark: 'Good application of vectors; refine unit notations.' },
    { subjectId: 'sub_eng_g10', subjectName: 'English First Language', subjectCode: 'ENG10', mark: 88, maxMark: 100, percentage: 88, gradeSymbol: 'A', teacherRemark: 'Compelling argumentative structure and vocabulary.' },
    { subjectId: 'sub_life_g10', subjectName: 'Life Sciences (Biology)', subjectCode: 'LSC10', mark: 81, maxMark: 100, percentage: 81, gradeSymbol: 'A', teacherRemark: 'Thorough understanding of metabolic diagrams.' },
    { subjectId: 'sub_comp_g10', subjectName: 'Computer Applications', subjectCode: 'CAT10', mark: 93, maxMark: 100, percentage: 93, gradeSymbol: 'A+', teacherRemark: 'Outstanding query optimization and normalization skills.' },
  ],
  overallAverage: 85.0,
  attendanceDays: 48,
  totalDays: 50,
  classRank: 2,
  classSize: 26,
  principalRemark: 'An exceptional term of academic distinction and leadership. Keep up the remarkable momentum, Ethan!',
  status: 'published',
  publishedAt: '2026-03-25T12:00:00Z',
};
