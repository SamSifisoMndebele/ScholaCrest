-- ============================================================================
-- SCHOLACREST MULTI-TENANT CLOUDFLARE D1 (SQLITE AT EDGE) RELATIONAL SCHEMA
-- Free Tier Capacity: 5,000,000 Row Reads/Day, 100,000 Writes/Day, 5 GB Storage
-- ============================================================================

-- 1. Schools (Tenant Institutions)
CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    status TEXT CHECK(status IN ('active', 'suspended', 'trial')) DEFAULT 'active',
    emis_number TEXT NOT NULL,
    motto TEXT,
    address TEXT,
    phone TEXT,
    email TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    stamp_url TEXT,
    signature_url TEXT,
    primary_color TEXT DEFAULT '#1e3a8a',
    pass_cutoff_percentage REAL DEFAULT 60.0,
    min_age INTEGER DEFAULT 13,
    max_age INTEGER DEFAULT 19,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Academic Terms & Calendars
CREATE TABLE IF NOT EXISTS academic_terms (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    name TEXT NOT NULL, -- e.g. "Term 1 - 2026"
    academic_year TEXT NOT NULL,
    is_current INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- 3. Classes (Grade Rooms)
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    name TEXT NOT NULL, -- e.g. "Grade 10A"
    grade_level INTEGER NOT NULL,
    class_teacher_id TEXT,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- 4. Subjects (Curriculum Offerings)
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    name TEXT NOT NULL, -- e.g. "Physical Sciences"
    code TEXT NOT NULL, -- e.g. "PHY10"
    grade_level INTEGER NOT NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- 5. Teacher Subject Assignments (Granular Security Privilege Table)
CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
    teacher_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teacher_id, subject_id, class_id),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 6. Online Admissions Applications Pipeline
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY, -- e.g. "APP-2026-0812"
    school_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    grade_applied INTEGER NOT NULL,
    prev_school TEXT,
    prev_average REAL,
    auto_score INTEGER DEFAULT 0,
    auto_status TEXT CHECK(auto_status IN ('passed', 'flagged', 'failed')),
    auto_notes TEXT, -- JSON Array of evaluation remarks
    registrar_status TEXT CHECK(registrar_status IN ('pending', 'accepted', 'rejected', 'documents_requested')) DEFAULT 'pending',
    registrar_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    decision_date DATETIME,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- 7. Applicant Uploaded Documents (Cloudflare R2 Index)
CREATE TABLE IF NOT EXISTS application_documents (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    doc_type TEXT CHECK(doc_type IN ('birth_cert', 'prev_report', 'id_doc')),
    r2_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_kb INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- 8. Homework & Course Modules (Attachments on Cloudflare R2)
CREATE TABLE IF NOT EXISTS homework (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    due_date DATETIME NOT NULL,
    max_marks INTEGER DEFAULT 100,
    r2_attachment_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 9. Student Assessment Marks & Gradebook
CREATE TABLE IF NOT EXISTS student_marks (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    term_id TEXT NOT NULL,
    assessment_name TEXT NOT NULL,
    mark_obtained REAL NOT NULL,
    max_mark REAL NOT NULL,
    teacher_remark TEXT,
    entered_by_teacher_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES academic_terms(id) ON DELETE CASCADE
);

-- 10. Indexed Performance Optimization
CREATE INDEX IF NOT EXISTS idx_apps_school ON applications(school_id, registrar_status);
CREATE INDEX IF NOT EXISTS idx_marks_student_term ON student_marks(student_id, term_id);
CREATE INDEX IF NOT EXISTS idx_homework_subject ON homework(subject_id, class_id);
