import React, { useState } from 'react';
import type { School, SchoolClass, Subject } from '../types';
import { 
  Building2, 
  Settings, 
  BookOpen, 
  Printer, 
  CheckCircle2, 
  Palette, 
  Award,
  Eye,
  Sparkles
} from 'lucide-react';

interface SchoolAdminViewProps {
  school: School;
  classes: SchoolClass[];
  subjects: Subject[];
  onUpdateSchool: (updatedSchool: School) => void;
  onPreviewLetterhead: () => void;
  onPreviewReportCard: () => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SchoolAdminView: React.FC<SchoolAdminViewProps> = ({
  school,
  subjects,
  onUpdateSchool,
  onPreviewLetterhead,
  onPreviewReportCard,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'rules' | 'academics'>('branding');

  // Form State
  const [schoolName, setSchoolName] = useState(school.letterhead.schoolName);
  const [motto, setMotto] = useState(school.letterhead.motto);
  const [emis, setEmis] = useState(school.letterhead.emisNumber);
  const [address, setAddress] = useState(school.letterhead.address);
  const [phone, setPhone] = useState(school.letterhead.phone);
  const [email, setEmail] = useState(school.letterhead.email);
  const [primaryColor, setPrimaryColor] = useState(school.letterhead.primaryColor);

  // Admission Rules State
  const [passThreshold, setPassThreshold] = useState(school.admissionRules.passScoreThreshold);
  const [minAge, setMinAge] = useState(school.admissionRules.minAge);
  const [maxAge, setMaxAge] = useState(school.admissionRules.maxAge);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const colorPresets = [
    { label: 'Crest Navy', hex: '#092451' },
    { label: 'Forest Green', hex: '#0f766e' },
    { label: 'Oxford Crimson', hex: '#881337' },
    { label: 'Imperial Purple', hex: '#581c87' },
    { label: 'Slate Royal', hex: '#1e293b' },
  ];

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: School = {
      ...school,
      letterhead: {
        ...school.letterhead,
        schoolName,
        motto,
        emisNumber: emis,
        address,
        phone,
        email,
        primaryColor,
      },
      admissionRules: {
        ...school.admissionRules,
        passScoreThreshold: Number(passThreshold),
        minAge: Number(minAge),
        maxAge: Number(maxAge),
      }
    };

    onUpdateSchool(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (onNotify) {
      onNotify(
        'School Settings & Letterhead Saved',
        `Official branding for ${schoolName} updated across all vector templates.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-crest-navy/5 text-crest-navy rounded-2xl border border-crest-navy/10">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-crest-navy font-serif">
                Principal & School Admin Console
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-crest-navy/10 text-crest-navy font-mono font-bold">
                {school.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure institutional letterhead, digital registrar seals, admission cutoffs, and teacher subject scopes.
            </p>
          </div>
        </div>

        {/* Preview Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviewLetterhead}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-crest-navy font-bold rounded-2xl text-xs transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-crest-gold" />
            <span>Preview Letterhead</span>
          </button>
          <button
            onClick={onPreviewReportCard}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-2xl text-xs transition-colors shadow-xs"
          >
            <Award className="w-4 h-4" />
            <span>Preview Report Card</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'branding' 
              ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4 text-crest-gold" />
          Letterhead & Branding
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'rules' 
              ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4 text-crest-gold" />
          Admissions Criteria
        </button>
        <button
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'academics' 
              ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-crest-gold" />
          Classes & Subjects ({subjects.length})
        </button>
      </div>

      {/* Tab 1: Letterhead Branding Config */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Name (Letterhead Header)</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-serif font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">EMIS / Registration Code</label>
                <input
                  type="text"
                  required
                  value={emis}
                  onChange={(e) => setEmis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School Motto</label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy italic"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Institutional Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-9 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPresets.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setPrimaryColor(c.hex)}
                        className={`w-6 h-6 rounded-full border border-slate-300 transition-transform ${primaryColor === c.hex ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admissions Office Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Physical Campus Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Letterhead updated successfully!
                </span>
              ) : <span></span>}

              <button
                type="submit"
                className="px-6 py-3 bg-crest-navy hover:bg-crest-navyDark text-white font-bold rounded-2xl shadow-md shadow-crest-navy/20 transition-all"
              >
                Save Letterhead Configuration
              </button>
            </div>
          </form>

          {/* Live Mini Preview of School Letterhead Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5 text-crest-navy">
                <Eye className="w-4 h-4 text-crest-gold" />
                Live Mini Letterhead Header Preview
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono">
                Dynamically Vector Rendered
              </span>
            </div>

            <div className="p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 space-y-4">
              <div 
                className="border-b-4 pb-4 flex flex-wrap items-center justify-between gap-4"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                    <img src="/icon.svg" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 
                      className="text-lg font-serif font-extrabold uppercase tracking-wide"
                      style={{ color: primaryColor }}
                    >
                      {schoolName}
                    </h4>
                    <p className="text-xs font-bold text-crest-gold italic">"{motto}"</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{emis}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-800">{address}</p>
                  <p>Tel: {phone} • {email}</p>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onPreviewLetterhead}
                  className="inline-flex items-center gap-1.5 text-crest-navy hover:text-crest-navyDark text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-crest-gold" />
                  <span>Open Full Screen Letterhead Modal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Admission Rules */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pass Mark Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passThreshold}
                  onChange={(e) => setPassThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
                />
                <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Applications with previous averages below this cutoff are automatically flagged.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Age</label>
              <input
                type="number"
                min="5"
                max="25"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Maximum Age</label>
              <input
                type="number"
                min="5"
                max="25"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-crest-navy hover:bg-crest-navyDark text-white font-bold rounded-2xl shadow-md shadow-crest-navy/20"
            >
              Update Admission Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Academics & Subjects */}
      {activeTab === 'academics' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-crest-navy text-sm font-serif">Academic Subjects & Assigned Teachers</h3>
              <p className="text-slate-500">Teachers are restricted to managing homework and marks only for their assigned subjects.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Subject Name</th>
                  <th className="py-3.5 px-3">Subject Code</th>
                  <th className="py-3.5 px-3">Grade Level</th>
                  <th className="py-3.5 px-4">Assigned Teacher</th>
                  <th className="py-3.5 px-4">Security Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-3 font-mono text-crest-navy font-bold">{s.code}</td>
                    <td className="py-3.5 px-3 font-mono">Grade {s.gradeLevel}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {s.teacherIds.includes('usr_teacher_elena') ? 'Ms. Elena Rostova' : 'Mr. David Okonkwo'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                        Isolated in JWT Claim
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
