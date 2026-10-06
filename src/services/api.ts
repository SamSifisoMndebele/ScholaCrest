// ============================================================================
// Real Database & Edge API Client
// Connects Web Client to Cloudflare D1 Relational Edge & R2 Object Storage
// ============================================================================

import type {
  School,
  OnlineApplication,
  SchoolClass,
  Subject,
  HomeworkAssignment,
  SubjectAssessmentMark,
  RegistrarDecisionStatus,
} from '../types';

const BASE_URL = import.meta.env.VITE_EDGE_API_URL || 'https://scholacrest-edge-api.sams-mndebele.workers.dev';

// Helper for fetch with fallback
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errJson;
    try {
      errJson = JSON.parse(errorText);
    } catch {
      // not json
    }
    throw new Error(errJson?.error || `API Request failed with status ${res.status}: ${errorText}`);
  }

  return res.json();
}

export const api = {
  // --------------------------------------------------------------------------
  // SCHOOLS
  // --------------------------------------------------------------------------
  async getSchools(): Promise<School[]> {
    try {
      const res = await request<{ success: boolean; data: School[] }>('/api/schools');
      if (res.data && res.data.length > 0) {
        localStorage.setItem('sc_schools_cache', JSON.stringify(res.data));
        return res.data;
      }
      return res.data || [];
    } catch (err) {
      console.warn('[API] Failed to fetch schools from live D1, checking cache:', err);
      const cached = localStorage.getItem('sc_schools_cache');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      throw err;
    }
  },

  async createSchool(school: School): Promise<School> {
    const res = await request<{ success: boolean; data: School }>('/api/schools', {
      method: 'POST',
      body: JSON.stringify(school),
    });
    return res.data;
  },

  async updateSchool(school: School): Promise<School> {
    const res = await request<{ success: boolean; data: School }>(`/api/schools/${encodeURIComponent(school.id)}`, {
      method: 'PUT',
      body: JSON.stringify(school),
    });
    return res.data;
  },

  async toggleSchoolStatus(schoolId: string): Promise<{ success: boolean; schoolId: string; status: 'active' | 'suspended' }> {
    return request<{ success: boolean; schoolId: string; status: 'active' | 'suspended' }>(
      `/api/schools/${encodeURIComponent(schoolId)}/status`,
      { method: 'PATCH' }
    );
  },

  async deleteSchool(schoolId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(
      `/api/schools/${encodeURIComponent(schoolId)}`,
      { method: 'DELETE' }
    );
  },

  async seedDatabase(force = false): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(
      `/api/db/seed${force ? '?force=true' : ''}`,
      { method: 'POST' }
    );
  },

  // --------------------------------------------------------------------------
  // APPLICATIONS
  // --------------------------------------------------------------------------
  async getApplications(schoolId?: string): Promise<OnlineApplication[]> {
    try {
      const q = schoolId && schoolId !== 'all' ? `?schoolId=${encodeURIComponent(schoolId)}` : '';
      const res = await request<{ success: boolean; data: OnlineApplication[] }>(`/api/applications${q}`);
      if (res.data) {
        localStorage.setItem(`sc_apps_cache_${schoolId || 'all'}`, JSON.stringify(res.data));
        return res.data;
      }
      return [];
    } catch (err) {
      console.warn('[API] Failed to fetch applications from live D1, checking cache:', err);
      const cached = localStorage.getItem(`sc_apps_cache_${schoolId || 'all'}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      return [];
    }
  },

  async submitApplication(app: OnlineApplication): Promise<OnlineApplication> {
    const res = await request<{ success: boolean; data: OnlineApplication }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    });
    return res.data;
  },

  async updateApplicationStatus(
    appId: string,
    status: RegistrarDecisionStatus,
    notes?: string
  ): Promise<OnlineApplication> {
    const res = await request<{ success: boolean; data: OnlineApplication }>(
      `/api/applications/${encodeURIComponent(appId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }
    );
    return res.data;
  },

  // --------------------------------------------------------------------------
  // CLASSES & SUBJECTS
  // --------------------------------------------------------------------------
  async getClasses(schoolId?: string): Promise<SchoolClass[]> {
    try {
      const q = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : '';
      const res = await request<{ success: boolean; data: SchoolClass[] }>(`/api/classes${q}`);
      return res.data || [];
    } catch (err) {
      console.warn('[API] getClasses fallback:', err);
      return [];
    }
  },

  async addClass(cls: SchoolClass): Promise<SchoolClass> {
    const res = await request<{ success: boolean; data: SchoolClass }>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(cls),
    });
    return res.data;
  },

  async getSubjects(schoolId?: string): Promise<Subject[]> {
    try {
      const q = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : '';
      const res = await request<{ success: boolean; data: Subject[] }>(`/api/subjects${q}`);
      return res.data || [];
    } catch (err) {
      console.warn('[API] getSubjects fallback:', err);
      return [];
    }
  },

  async addSubject(sub: Subject): Promise<Subject> {
    const res = await request<{ success: boolean; data: Subject }>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(sub),
    });
    return res.data;
  },

  // --------------------------------------------------------------------------
  // HOMEWORK
  // --------------------------------------------------------------------------
  async getHomework(schoolId?: string): Promise<HomeworkAssignment[]> {
    try {
      const q = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : '';
      const res = await request<{ success: boolean; data: HomeworkAssignment[] }>(`/api/homework${q}`);
      return res.data || [];
    } catch (err) {
      console.warn('[API] getHomework fallback:', err);
      return [];
    }
  },

  async addHomework(hw: HomeworkAssignment): Promise<HomeworkAssignment> {
    const res = await request<{ success: boolean; data: HomeworkAssignment }>('/api/homework', {
      method: 'POST',
      body: JSON.stringify(hw),
    });
    return res.data;
  },

  // --------------------------------------------------------------------------
  // MARKS
  // --------------------------------------------------------------------------
  async getMarks(schoolId?: string, termId?: string): Promise<SubjectAssessmentMark[]> {
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append('schoolId', schoolId);
      if (termId) params.append('termId', termId);
      const q = params.toString() ? `?${params.toString()}` : '';
      const res = await request<{ success: boolean; data: SubjectAssessmentMark[] }>(`/api/marks${q}`);
      return res.data || [];
    } catch (err) {
      console.warn('[API] getMarks fallback:', err);
      return [];
    }
  },

  async addMark(mark: SubjectAssessmentMark): Promise<SubjectAssessmentMark> {
    const res = await request<{ success: boolean; data: SubjectAssessmentMark }>('/api/marks', {
      method: 'POST',
      body: JSON.stringify(mark),
    });
    return res.data;
  },
};
