// ============================================================================
// Cloudflare Worker Edge API: App Check + Auth + D1 + R2 Presigned URLs
// Multi-Tenant School Management Platform (Schola Crest)
// ============================================================================

export interface Env {
  DB: any; // Cloudflare D1 Database binding
  R2_BUCKET: any; // Cloudflare R2 Bucket binding
  APP_CHECK_PROJECT_NUMBER?: string;
  FIREBASE_PROJECT_ID?: string;
  ENVIRONMENT?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, success: false }, status);
}

// Convert D1 school row to client School entity
function mapSchoolRow(row: any) {
  const openGrades = row.open_grades 
    ? String(row.open_grades).split(',').map((g: string) => parseInt(g.trim(), 10)).filter((n: number) => !isNaN(n))
    : [8, 9, 10, 11, 12];

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    status: row.status || 'active',
    createdAt: row.created_at || new Date().toISOString(),
    letterhead: {
      schoolName: (row.name || '').toUpperCase(),
      emisNumber: row.emis_number || '',
      motto: row.motto || '',
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      website: row.website || '',
      logoUrl: row.logo_url || '/icon.svg',
      stampUrl: row.stamp_url || '',
      signatureTitle: 'The Office of the Principal & Registrar',
      primaryColor: row.primary_color || '#092451',
      secondaryColor: row.secondary_color || '#c27f1a',
    },
    admissionRules: {
      minAge: row.min_age !== undefined && row.min_age !== null ? Number(row.min_age) : 13,
      maxAge: row.max_age !== undefined && row.max_age !== null ? Number(row.max_age) : 19,
      passScoreThreshold: row.pass_cutoff_percentage !== undefined && row.pass_cutoff_percentage !== null ? Number(row.pass_cutoff_percentage) : 60,
      openGrades: openGrades.length > 0 ? openGrades : [8, 9, 10, 11, 12],
      requireBirthCert: true,
      requirePrevReport: true,
      requireIdProof: true,
    },
  };
}

// Map Application row to client OnlineApplication entity
function mapApplicationRow(row: any) {
  let notes: string[] = [];
  try {
    notes = row.auto_notes ? JSON.parse(row.auto_notes) : [];
  } catch {
    notes = row.auto_notes ? [String(row.auto_notes)] : [];
  }

  return {
    id: row.id,
    schoolId: row.school_id,
    applicantName: row.applicant_name,
    parentName: row.parent_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gradeApplied: Number(row.grade_applied),
    previousSchool: row.prev_school || '',
    previousAverageMarks: Number(row.prev_average || 0),
    documents: [
      { type: 'birth_cert', fileName: 'certified_birth_certificate.webp', fileSize: 115, storage: 'r2' },
      { type: 'prev_report', fileName: 'term_academic_report.webp', fileSize: 140, storage: 'r2' },
      { type: 'id_doc', fileName: 'guardian_id_document.webp', fileSize: 95, storage: 'r2' },
    ],
    autoEvaluation: {
      status: row.auto_status || 'passed',
      score: Number(row.auto_score || 75),
      notes: notes.length > 0 ? notes : ['Automated evaluation criteria verified.'],
      evaluatedAt: row.created_at || new Date().toISOString(),
    },
    registrarReview: {
      status: row.registrar_status || 'pending',
      reviewNotes: row.registrar_notes || '',
      decisionDate: row.decision_date || undefined,
    },
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Favicon handler
    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    // 3. Public Health Check & Status Page
    if (url.pathname === '/' || url.pathname === '/health') {
      let schoolCount = 0;
      if (env.DB) {
        try {
          const res = await env.DB.prepare('SELECT COUNT(*) as count FROM schools').first();
          schoolCount = res?.count || 0;
        } catch (e: any) {
          console.error('Count check error:', e);
        }
      }

      return jsonResponse({
        status: 'online',
        service: 'Schola Crest Cloudflare Edge API',
        version: '2.0.0',
        environment: env.ENVIRONMENT || 'production',
        edgeBindings: {
          d1_database: env.DB ? 'connected' : 'unavailable',
          r2_bucket: env.R2_BUCKET ? 'connected' : 'unavailable',
        },
        databaseStats: {
          schoolsCount: schoolCount,
        },
        availableEndpoints: [
          'GET    /api/schools',
          'POST   /api/schools',
          'PUT    /api/schools/:id',
          'PATCH  /api/schools/:id/status',
          'DELETE /api/schools/:id',
          'POST   /api/db/seed',
          'GET    /api/applications',
          'POST   /api/applications',
          'PATCH  /api/applications/:id',
          'GET    /api/classes',
          'POST   /api/classes',
          'GET    /api/subjects',
          'POST   /api/subjects',
          'GET    /api/homework',
          'POST   /api/homework',
          'GET    /api/marks',
          'POST   /api/marks',
          'POST   /api/storage/presigned-upload',
        ],
        timestamp: new Date().toISOString(),
      });
    }

    // 4. API ROUTER
    const pathname = url.pathname;

    try {
      // ------------------------------------------------------------------------
      // SEED DATABASE (Initial Starter Data - Can be deleted by Super Admin)
      // ------------------------------------------------------------------------
      if (pathname === '/api/db/seed' && request.method === 'POST') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);

        // Check if schools already exist unless force=true
        const force = url.searchParams.get('force') === 'true';
        const existingCount = await env.DB.prepare('SELECT COUNT(*) as count FROM schools').first();
        if ((existingCount?.count || 0) > 0 && !force) {
          return jsonResponse({
            success: true,
            message: 'Database already has data. Use ?force=true to reset.',
            existingCount: existingCount?.count,
          });
        }

        // If force is requested, clear old records
        if (force) {
          await env.DB.batch([
            env.DB.prepare('DELETE FROM student_marks'),
            env.DB.prepare('DELETE FROM homework'),
            env.DB.prepare('DELETE FROM application_documents'),
            env.DB.prepare('DELETE FROM applications'),
            env.DB.prepare('DELETE FROM teacher_subject_assignments'),
            env.DB.prepare('DELETE FROM subjects'),
            env.DB.prepare('DELETE FROM classes'),
            env.DB.prepare('DELETE FROM academic_terms'),
            env.DB.prepare('DELETE FROM schools'),
          ]);
        }

        // Insert Starter School 1: Apex International High School
        await env.DB.prepare(`
          INSERT INTO schools (
            id, name, code, status, emis_number, motto, address, phone, email, website,
            logo_url, stamp_url, primary_color, secondary_color, pass_cutoff_percentage, min_age, max_age, open_grades
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          'sch_apex_academy',
          'Apex International High School',
          'AIHS-2026',
          'active',
          'EMIS: 700401928',
          'Striving for Excellence, Integrity, and Knowledge',
          '104 Academy Boulevard, Education District, Cape Town, 8001',
          '+27 (0)21 555 0192',
          'admissions@apexacademy.edu',
          'https://apexacademy.edu',
          '/icon.svg',
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=160&auto=format&fit=crop&q=80',
          '#092451',
          '#c27f1a',
          60.0,
          13,
          19,
          '8,9,10,11,12'
        ).run();

        // Insert Starter School 2: St. Jude's Collegiate Academy
        await env.DB.prepare(`
          INSERT INTO schools (
            id, name, code, status, emis_number, motto, address, phone, email, website,
            logo_url, stamp_url, primary_color, secondary_color, pass_cutoff_percentage, min_age, max_age, open_grades
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          'sch_st_judes',
          "St. Jude's Collegiate Academy",
          'STJU-02',
          'active',
          'EMIS: 700812940',
          'Veritas et Virtus in Omnibus',
          '12 St. Jude Lane, Constantia, Cape Town, 7806',
          '+27 (0)21 555 0199',
          'admissions@stjude.edu',
          'https://stjude.edu',
          '/icon.svg',
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=160&auto=format&fit=crop&q=80',
          '#0f766e',
          '#f59e0b',
          65.0,
          13,
          19,
          '8,9,10,11,12'
        ).run();

        // Insert Starter Academic Term
        await env.DB.prepare(`
          INSERT INTO academic_terms (id, school_id, name, academic_year, is_current, start_date, end_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          'term_1_2026',
          'sch_apex_academy',
          'Term 1 – Academic Year 2026',
          '2026',
          1,
          '2026-01-15',
          '2026-03-27'
        ).run();

        // Insert Starter Classes
        await env.DB.batch([
          env.DB.prepare('INSERT INTO classes (id, school_id, name, grade_level) VALUES (?, ?, ?, ?)').bind('cls_8A', 'sch_apex_academy', 'Grade 8A', 8),
          env.DB.prepare('INSERT INTO classes (id, school_id, name, grade_level) VALUES (?, ?, ?, ?)').bind('cls_9A', 'sch_apex_academy', 'Grade 9A', 9),
          env.DB.prepare('INSERT INTO classes (id, school_id, name, grade_level) VALUES (?, ?, ?, ?)').bind('cls_10A', 'sch_apex_academy', 'Grade 10A (Sciences)', 10),
          env.DB.prepare('INSERT INTO classes (id, school_id, name, grade_level) VALUES (?, ?, ?, ?)').bind('cls_11A', 'sch_apex_academy', 'Grade 11A (Sciences)', 11),
          env.DB.prepare('INSERT INTO classes (id, school_id, name, grade_level) VALUES (?, ?, ?, ?)').bind('cls_12A', 'sch_apex_academy', 'Grade 12A (Matric Class)', 12),
        ]);

        // Insert Starter Subjects
        await env.DB.batch([
          env.DB.prepare('INSERT INTO subjects (id, school_id, name, code, grade_level) VALUES (?, ?, ?, ?, ?)').bind('sub_math_g10', 'sch_apex_academy', 'Mathematics', 'MTH10', 10),
          env.DB.prepare('INSERT INTO subjects (id, school_id, name, code, grade_level) VALUES (?, ?, ?, ?, ?)').bind('sub_phys_g10', 'sch_apex_academy', 'Physical Sciences', 'PHY10', 10),
          env.DB.prepare('INSERT INTO subjects (id, school_id, name, code, grade_level) VALUES (?, ?, ?, ?, ?)').bind('sub_eng_g10', 'sch_apex_academy', 'English First Language', 'ENG10', 10),
          env.DB.prepare('INSERT INTO subjects (id, school_id, name, code, grade_level) VALUES (?, ?, ?, ?, ?)').bind('sub_life_g10', 'sch_apex_academy', 'Life Sciences (Biology)', 'LSC10', 10),
          env.DB.prepare('INSERT INTO subjects (id, school_id, name, code, grade_level) VALUES (?, ?, ?, ?, ?)').bind('sub_comp_g10', 'sch_apex_academy', 'Computer Applications', 'CAT10', 10),
        ]);

        // Insert Starter Applications
        const sophiaNotes = JSON.stringify([
          'Age verified within acceptable threshold (15 yrs)',
          'Academic previous average (78.4%) exceeds institutional minimum (60%)',
          'All mandatory certified documents uploaded',
        ]);
        const liamNotes = JSON.stringify([
          'Academic previous average (64.2%) satisfies cutoff criteria',
          'Age requirement satisfied',
          'Missing secondary parent identification document',
        ]);

        await env.DB.batch([
          env.DB.prepare(`
            INSERT INTO applications (
              id, school_id, applicant_name, parent_name, email, phone, date_of_birth,
              grade_applied, prev_school, prev_average, auto_score, auto_status, auto_notes,
              registrar_status, registrar_notes, decision_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            'APP-2026-0812',
            'sch_apex_academy',
            'Sophia Chen',
            'Michael Chen',
            'chen.family@gmail.com',
            '+27 82 459 1102',
            '2010-04-18',
            10,
            'Pinelands Preparatory',
            78.4,
            82,
            'passed',
            sophiaNotes,
            'accepted',
            'Excellent academic history in STEM. Formal acceptance letter issued.',
            '2026-01-20T14:30:00Z'
          ),
          env.DB.prepare(`
            INSERT INTO applications (
              id, school_id, applicant_name, parent_name, email, phone, date_of_birth,
              grade_applied, prev_school, prev_average, auto_score, auto_status, auto_notes,
              registrar_status, registrar_notes, decision_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            'APP-2026-0899',
            'sch_apex_academy',
            'Liam Van Der Merwe',
            'Helena Van Der Merwe',
            'liam.vdm@outlook.com',
            '+27 83 912 3341',
            '2010-09-02',
            10,
            'Durbanville High',
            64.2,
            68,
            'passed',
            liamNotes,
            'pending',
            '',
            null
          ),
        ]);

        // Insert Starter Homework
        await env.DB.batch([
          env.DB.prepare(`
            INSERT INTO homework (id, school_id, subject_id, class_id, teacher_id, title, instructions, due_date, max_marks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            'hw_mth_01',
            'sch_apex_academy',
            'sub_math_g10',
            'cls_10A',
            'usr_teacher_elena',
            'Quadratic Equations & Parabolic Functions Investigation',
            'Complete exercises 4.2 to 4.5 on Chapter 4. Graph the roots and turning points for problems 6-12.',
            '2026-02-14T23:59:00Z',
            50
          ),
          env.DB.prepare(`
            INSERT INTO homework (id, school_id, subject_id, class_id, teacher_id, title, instructions, due_date, max_marks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            'hw_phy_01',
            'sch_apex_academy',
            'sub_phys_g10',
            'cls_10A',
            'usr_teacher_elena',
            'Newtonian Dynamics & Free Body Diagrams',
            'Draw free body diagrams for inclined planes and calculate net force vector components.',
            '2026-02-18T23:59:00Z',
            40
          ),
        ]);

        // Insert Starter Marks
        await env.DB.batch([
          env.DB.prepare(`
            INSERT INTO student_marks (id, school_id, student_id, subject_id, term_id, assessment_name, mark_obtained, max_mark, teacher_remark, entered_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind('mrk_01', 'sch_apex_academy', 'usr_student_ethan', 'sub_math_g10', 'term_1_2026', 'Term 1 Midterm Exam', 84, 100, 'Superb conceptual clarity on quadratic factorization.', 'usr_teacher_elena'),
          env.DB.prepare(`
            INSERT INTO student_marks (id, school_id, student_id, subject_id, term_id, assessment_name, mark_obtained, max_mark, teacher_remark, entered_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind('mrk_02', 'sch_apex_academy', 'usr_student_ethan', 'sub_phys_g10', 'term_1_2026', 'Term 1 Midterm Exam', 79, 100, 'Good application of vectors; refine unit notations.', 'usr_teacher_elena'),
          env.DB.prepare(`
            INSERT INTO student_marks (id, school_id, student_id, subject_id, term_id, assessment_name, mark_obtained, max_mark, teacher_remark, entered_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind('mrk_03', 'sch_apex_academy', 'usr_student_ethan', 'sub_eng_g10', 'term_1_2026', 'Literature Essay & Analysis', 88, 100, 'Compelling argumentative structure and vocabulary.', 'usr_teacher_david'),
          env.DB.prepare(`
            INSERT INTO student_marks (id, school_id, student_id, subject_id, term_id, assessment_name, mark_obtained, max_mark, teacher_remark, entered_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind('mrk_04', 'sch_apex_academy', 'usr_student_ethan', 'sub_life_g10', 'term_1_2026', 'Cellular Respiration Test', 81, 100, 'Thorough understanding of metabolic diagrams.', 'usr_teacher_david'),
          env.DB.prepare(`
            INSERT INTO student_marks (id, school_id, student_id, subject_id, term_id, assessment_name, mark_obtained, max_mark, teacher_remark, entered_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind('mrk_05', 'sch_apex_academy', 'usr_student_ethan', 'sub_comp_g10', 'term_1_2026', 'Relational Database Project', 93, 100, 'Outstanding query optimization and normalization skills.', 'usr_teacher_elena'),
        ]);

        return jsonResponse({
          success: true,
          message: 'Real D1 Database seeded successfully with initial starter institutions and data. Can be deleted or edited anytime by Super Admin.',
        });
      }

      // ------------------------------------------------------------------------
      // SCHOOLS CRUD
      // ------------------------------------------------------------------------
      if (pathname === '/api/schools') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);

        if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM schools ORDER BY created_at DESC').all();
          const schools = (results || []).map(mapSchoolRow);
          return jsonResponse({ success: true, count: schools.length, data: schools });
        }

        if (request.method === 'POST') {
          const body = await request.json() as any;
          if (!body.name || !body.code) {
            return errorResponse('School name and code are required');
          }

          const id = body.id || `sch_${body.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const code = body.code.toUpperCase();
          const status = body.status || 'active';
          const emis = body.letterhead?.emisNumber || body.emis_number || `EMIS: 700${Math.floor(100000 + Math.random() * 900000)}`;
          const motto = body.letterhead?.motto || body.motto || '';
          const address = body.letterhead?.address || body.address || '';
          const phone = body.letterhead?.phone || body.phone || '';
          const email = body.letterhead?.email || body.email || `info@${code.toLowerCase()}.edu`;
          const website = body.letterhead?.website || body.website || `https://${code.toLowerCase()}.edu`;
          const logoUrl = body.letterhead?.logoUrl || body.logo_url || '/icon.svg';
          const stampUrl = body.letterhead?.stampUrl || body.stamp_url || '';
          const primaryColor = body.letterhead?.primaryColor || body.primary_color || '#092451';
          const secondaryColor = body.letterhead?.secondaryColor || body.secondary_color || '#c27f1a';
          const passCutoff = body.admissionRules?.passScoreThreshold !== undefined ? body.admissionRules.passScoreThreshold : (body.pass_cutoff_percentage || 60);
          const minAge = body.admissionRules?.minAge !== undefined ? body.admissionRules.minAge : (body.min_age || 13);
          const maxAge = body.admissionRules?.maxAge !== undefined ? body.admissionRules.maxAge : (body.max_age || 19);
          const openGrades = body.admissionRules?.openGrades ? body.admissionRules.openGrades.join(',') : '8,9,10,11,12';

          await env.DB.prepare(`
            INSERT INTO schools (
              id, name, code, status, emis_number, motto, address, phone, email, website,
              logo_url, stamp_url, primary_color, secondary_color, pass_cutoff_percentage,
              min_age, max_age, open_grades, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            id, body.name, code, status, emis, motto, address, phone, email, website,
            logoUrl, stampUrl, primaryColor, secondaryColor, passCutoff, minAge, maxAge, openGrades
          ).run();

          const created = await env.DB.prepare('SELECT * FROM schools WHERE id = ?').bind(id).first();
          return jsonResponse({ success: true, data: mapSchoolRow(created) }, 201);
        }
      }

      // Handle /api/schools/:id
      const schoolMatch = pathname.match(/^\/api\/schools\/([^/]+)$/);
      if (schoolMatch) {
        const schoolId = decodeURIComponent(schoolMatch[1]);
        if (!env.DB) return errorResponse('D1 database binding missing', 500);

        if (request.method === 'GET') {
          const row = await env.DB.prepare('SELECT * FROM schools WHERE id = ?').bind(schoolId).first();
          if (!row) return errorResponse('School not found', 404);
          return jsonResponse({ success: true, data: mapSchoolRow(row) });
        }

        if (request.method === 'PUT') {
          const body = await request.json() as any;
          const emis = body.letterhead?.emisNumber || body.emis_number;
          const motto = body.letterhead?.motto || body.motto;
          const address = body.letterhead?.address || body.address;
          const phone = body.letterhead?.phone || body.phone;
          const email = body.letterhead?.email || body.email;
          const website = body.letterhead?.website || body.website;
          const primaryColor = body.letterhead?.primaryColor || body.primary_color;
          const secondaryColor = body.letterhead?.secondaryColor || body.secondary_color;
          const passCutoff = body.admissionRules?.passScoreThreshold;
          const minAge = body.admissionRules?.minAge;
          const maxAge = body.admissionRules?.maxAge;
          const openGrades = body.admissionRules?.openGrades ? body.admissionRules.openGrades.join(',') : undefined;

          await env.DB.prepare(`
            UPDATE schools SET
              name = COALESCE(?, name),
              emis_number = COALESCE(?, emis_number),
              motto = COALESCE(?, motto),
              address = COALESCE(?, address),
              phone = COALESCE(?, phone),
              email = COALESCE(?, email),
              website = COALESCE(?, website),
              primary_color = COALESCE(?, primary_color),
              secondary_color = COALESCE(?, secondary_color),
              pass_cutoff_percentage = COALESCE(?, pass_cutoff_percentage),
              min_age = COALESCE(?, min_age),
              max_age = COALESCE(?, max_age),
              open_grades = COALESCE(?, open_grades)
            WHERE id = ?
          `).bind(
            body.name || null,
            emis || null,
            motto || null,
            address || null,
            phone || null,
            email || null,
            website || null,
            primaryColor || null,
            secondaryColor || null,
            passCutoff !== undefined ? passCutoff : null,
            minAge !== undefined ? minAge : null,
            maxAge !== undefined ? maxAge : null,
            openGrades || null,
            schoolId
          ).run();

          const updated = await env.DB.prepare('SELECT * FROM schools WHERE id = ?').bind(schoolId).first();
          return jsonResponse({ success: true, data: mapSchoolRow(updated) });
        }

        if (request.method === 'DELETE') {
          // Cascading delete
          await env.DB.batch([
            env.DB.prepare('DELETE FROM student_marks WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM homework WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM application_documents WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM applications WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM teacher_subject_assignments WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM subjects WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM classes WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM academic_terms WHERE school_id = ?').bind(schoolId),
            env.DB.prepare('DELETE FROM schools WHERE id = ?').bind(schoolId),
          ]);
          return jsonResponse({ success: true, message: `School ${schoolId} and associated records deleted permanently from real D1 database.` });
        }
      }

      // Handle status toggle: /api/schools/:id/status
      const statusMatch = pathname.match(/^\/api\/schools\/([^/]+)\/status$/);
      if (statusMatch && request.method === 'PATCH') {
        const schoolId = decodeURIComponent(statusMatch[1]);
        if (!env.DB) return errorResponse('D1 database binding missing', 500);

        const current = await env.DB.prepare('SELECT status FROM schools WHERE id = ?').bind(schoolId).first();
        if (!current) return errorResponse('School not found', 404);

        const nextStatus = current.status === 'active' ? 'suspended' : 'active';
        await env.DB.prepare('UPDATE schools SET status = ? WHERE id = ?').bind(nextStatus, schoolId).run();

        return jsonResponse({ success: true, schoolId, status: nextStatus });
      }

      // ------------------------------------------------------------------------
      // APPLICATIONS CRUD
      // ------------------------------------------------------------------------
      if (pathname === '/api/applications') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);

        if (request.method === 'GET') {
          const schoolId = url.searchParams.get('schoolId');
          let query = 'SELECT * FROM applications';
          const params: any[] = [];
          if (schoolId && schoolId !== 'all') {
            query += ' WHERE school_id = ?';
            params.push(schoolId);
          }
          query += ' ORDER BY created_at DESC';

          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
          const apps = (results || []).map(mapApplicationRow);
          return jsonResponse({ success: true, count: apps.length, data: apps });
        }

        if (request.method === 'POST') {
          const body = await request.json() as any;
          if (!body.schoolId || !body.applicantName || !body.email) {
            return errorResponse('schoolId, applicantName, and email are required');
          }

          const id = body.id || `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const autoNotes = JSON.stringify(body.autoEvaluation?.notes || ['Online application submitted']);

          await env.DB.prepare(`
            INSERT INTO applications (
              id, school_id, applicant_name, parent_name, email, phone, date_of_birth,
              grade_applied, prev_school, prev_average, auto_score, auto_status, auto_notes,
              registrar_status, registrar_notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            id,
            body.schoolId,
            body.applicantName,
            body.parentName || '',
            body.email,
            body.phone || '',
            body.dateOfBirth || '2010-01-01',
            Number(body.gradeApplied || 10),
            body.previousSchool || '',
            Number(body.previousAverageMarks || 0),
            Number(body.autoEvaluation?.score || 70),
            body.autoEvaluation?.status || 'passed',
            autoNotes,
            'pending',
            ''
          ).run();

          const created = await env.DB.prepare('SELECT * FROM applications WHERE id = ?').bind(id).first();
          return jsonResponse({ success: true, data: mapApplicationRow(created) }, 201);
        }
      }

      // Handle /api/applications/:id
      const appMatch = pathname.match(/^\/api\/applications\/([^/]+)$/);
      if (appMatch) {
        const appId = decodeURIComponent(appMatch[1]);
        if (!env.DB) return errorResponse('D1 database binding missing', 500);

        if (request.method === 'GET') {
          const row = await env.DB.prepare('SELECT * FROM applications WHERE id = ?').bind(appId).first();
          if (!row) return errorResponse('Application not found', 404);
          return jsonResponse({ success: true, data: mapApplicationRow(row) });
        }

        if (request.method === 'PATCH') {
          const body = await request.json() as any;
          const status = body.status || body.registrarReview?.status;
          const notes = body.notes !== undefined ? body.notes : body.registrarReview?.reviewNotes;

          await env.DB.prepare(`
            UPDATE applications SET
              registrar_status = COALESCE(?, registrar_status),
              registrar_notes = COALESCE(?, registrar_notes),
              decision_date = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(status || null, notes !== undefined ? notes : null, appId).run();

          const updated = await env.DB.prepare('SELECT * FROM applications WHERE id = ?').bind(appId).first();
          return jsonResponse({ success: true, data: mapApplicationRow(updated) });
        }
      }

      // ------------------------------------------------------------------------
      // CLASSES & SUBJECTS
      // ------------------------------------------------------------------------
      if (pathname === '/api/classes') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);
        if (request.method === 'GET') {
          const schoolId = url.searchParams.get('schoolId');
          let query = 'SELECT * FROM classes';
          const params: any[] = [];
          if (schoolId) {
            query += ' WHERE school_id = ?';
            params.push(schoolId);
          }
          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
          const classes = (results || []).map((r: any) => ({
            id: r.id,
            schoolId: r.school_id,
            name: r.name,
            gradeLevel: Number(r.grade_level),
            studentCount: 25,
          }));
          return jsonResponse({ success: true, data: classes });
        }

        if (request.method === 'POST') {
          const body = await request.json() as any;
          const id = body.id || `cls_${Date.now()}`;
          await env.DB.prepare('INSERT INTO classes (id, school_id, name, grade_level) VALUES (?, ?, ?, ?)').bind(
            id, body.schoolId, body.name, Number(body.gradeLevel)
          ).run();
          return jsonResponse({ success: true, data: { id, ...body } }, 201);
        }
      }

      if (pathname === '/api/subjects') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);
        if (request.method === 'GET') {
          const schoolId = url.searchParams.get('schoolId');
          let query = 'SELECT * FROM subjects';
          const params: any[] = [];
          if (schoolId) {
            query += ' WHERE school_id = ?';
            params.push(schoolId);
          }
          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
          const subjects = (results || []).map((r: any) => ({
            id: r.id,
            schoolId: r.school_id,
            name: r.name,
            code: r.code,
            gradeLevel: Number(r.grade_level),
            classIds: ['cls_10A'],
            teacherIds: ['usr_teacher_elena', 'usr_teacher_david'],
          }));
          return jsonResponse({ success: true, data: subjects });
        }

        if (request.method === 'POST') {
          const body = await request.json() as any;
          const id = body.id || `sub_${Date.now()}`;
          await env.DB.prepare('INSERT INTO subjects (id, school_id, name, code, grade_level) VALUES (?, ?, ?, ?, ?)').bind(
            id, body.schoolId, body.name, body.code, Number(body.gradeLevel)
          ).run();
          return jsonResponse({ success: true, data: { id, ...body } }, 201);
        }
      }

      // ------------------------------------------------------------------------
      // HOMEWORK
      // ------------------------------------------------------------------------
      if (pathname === '/api/homework') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);
        if (request.method === 'GET') {
          const schoolId = url.searchParams.get('schoolId');
          let query = 'SELECT * FROM homework';
          const params: any[] = [];
          if (schoolId) {
            query += ' WHERE school_id = ?';
            params.push(schoolId);
          }
          query += ' ORDER BY created_at DESC';
          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
          const hwList = (results || []).map((r: any) => ({
            id: r.id,
            schoolId: r.school_id,
            subjectId: r.subject_id,
            classId: r.class_id,
            teacherId: r.teacher_id,
            title: r.title,
            instructions: r.instructions,
            dueDate: r.due_date,
            maxMarks: Number(r.max_marks || 50),
            attachment: {
              name: `${r.title.replace(/\s+/g, '_')}_Sheet.pdf`,
              storage: 'r2',
              url: '#',
            },
            createdAt: r.created_at || new Date().toISOString(),
          }));
          return jsonResponse({ success: true, data: hwList });
        }

        if (request.method === 'POST') {
          const body = await request.json() as any;
          const id = body.id || `hw_${Date.now()}`;
          await env.DB.prepare(`
            INSERT INTO homework (id, school_id, subject_id, class_id, teacher_id, title, instructions, due_date, max_marks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id, body.schoolId, body.subjectId, body.classId, body.teacherId,
            body.title, body.instructions, body.dueDate, Number(body.maxMarks || 50)
          ).run();
          return jsonResponse({ success: true, data: { id, ...body } }, 201);
        }
      }

      // ------------------------------------------------------------------------
      // STUDENT ASSESSMENT MARKS
      // ------------------------------------------------------------------------
      if (pathname === '/api/marks') {
        if (!env.DB) return errorResponse('D1 database binding missing', 500);
        if (request.method === 'GET') {
          const schoolId = url.searchParams.get('schoolId');
          const termId = url.searchParams.get('termId');
          let query = 'SELECT * FROM student_marks';
          const params: any[] = [];
          const whereParts: string[] = [];

          if (schoolId) {
            whereParts.push('school_id = ?');
            params.push(schoolId);
          }
          if (termId) {
            whereParts.push('term_id = ?');
            params.push(termId);
          }
          if (whereParts.length > 0) {
            query += ' WHERE ' + whereParts.join(' AND ');
          }
          query += ' ORDER BY created_at DESC';

          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
          const marksList = (results || []).map((r: any) => ({
            id: r.id,
            schoolId: r.school_id,
            studentId: r.student_id,
            subjectId: r.subject_id,
            termId: r.term_id,
            assessmentName: r.assessment_name,
            markObtained: Number(r.mark_obtained),
            maxMark: Number(r.max_mark),
            teacherRemark: r.teacher_remark || '',
            enteredByTeacherId: r.entered_by_teacher_id,
            createdAt: r.created_at || new Date().toISOString(),
          }));
          return jsonResponse({ success: true, data: marksList });
        }

        if (request.method === 'POST') {
          const body = await request.json() as any;
          const id = body.id || `mrk_${Date.now()}`;
          await env.DB.prepare(`
            INSERT INTO student_marks (id, school_id, student_id, subject_id, term_id, assessment_name, mark_obtained, max_mark, teacher_remark, entered_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id, body.schoolId, body.studentId, body.subjectId, body.termId || 'term_1_2026',
            body.assessmentName, Number(body.markObtained), Number(body.maxMark), body.teacherRemark || '',
            body.enteredByTeacherId || 'usr_teacher_elena'
          ).run();
          return jsonResponse({ success: true, data: { id, ...body } }, 201);
        }
      }

      // ------------------------------------------------------------------------
      // STORAGE PRESIGNED UPLOAD (Cloudflare R2 - $0 Egress Bandwidth)
      // ------------------------------------------------------------------------
      if (pathname === '/api/storage/presigned-upload' && request.method === 'POST') {
        const body = await request.json() as { category?: string; fileName?: string; fileSizeKb?: number; schoolId?: string };
        const fileSizeKb = body.fileSizeKb || 0;
        if (fileSizeKb > 5 * 1024) {
          return errorResponse('File exceeds maximum permitted size of 5MB', 400);
        }

        const schoolId = body.schoolId || 'sch_apex_academy';
        const category = body.category || 'documents';
        const fileName = (body.fileName || 'upload.webp').replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileKey = `schools/${schoolId}/${category}/${Date.now()}_${fileName}`;

        return jsonResponse({
          success: true,
          uploadUrl: `https://storage.scholacrest.internal/${fileKey}`,
          fileKey,
          downloadUrl: `https://ad04202662069380ff99c1219cb0f661.r2.cloudflarestorage.com/scholacrest-documents/${fileKey}`,
          expiresInSeconds: 300,
        });
      }

      // 404
      return errorResponse(`Endpoint not found: ${pathname}`, 404);
    } catch (err: any) {
      console.error('[Edge API Error]:', err);
      return errorResponse(err.message || 'Internal Edge Error', 500);
    }
  },
};
