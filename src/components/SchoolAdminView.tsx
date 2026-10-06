import React, { useState } from 'react';
import type { School, SchoolClass, Subject } from '../types';
import { 
  Building2, 
  Settings, 
  BookOpen, 
  Printer, 
  CheckCircle2, 
  Palette, 
  Award 
} from 'lucide-react';

interface SchoolAdminViewProps {
  school: School;
  classes: SchoolClass[];
  subjects: Subject[];
  onUpdateSchool: (updatedSchool: School) => void;
  onPreviewLetterhead: () => void;
  onPreviewReportCard: () => void;
}

export const SchoolAdminView: React.FC<SchoolAdminViewProps> = ({
  school,
  subjects,
  onUpdateSchool,
  onPreviewLetterhead,
  onPreviewReportCard,
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
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Principal & School Admin Console</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-semibold">
                {school.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your institution's letterhead, digital stamps, admission criteria, and academic subjects.
            </p>
          </div>
        </div>

        {/* Preview Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviewLetterhead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Preview Letterhead
          </button>
          <button
            onClick={onPreviewReportCard}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            Preview Report Card
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'branding' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          Letterhead & Branding
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'rules' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Admissions Criteria
        </button>
        <button
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'academics' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Classes & Subjects ({subjects.length})
        </button>
      </div>

      {/* Tab 1: Letterhead Branding Config */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Name (Header)</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">EMIS / Registration Code</label>
              <input
                type="text"
                required
                value={emis}
                onChange={(e) => setEmis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">School Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 italic"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <span className="font-mono text-slate-500">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Admissions Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Physical Campus Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all"
            >
              Save Letterhead Configuration
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Admission Rules */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 text-xs">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/25"
            >
              Update Admission Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Academics & Subjects */}
      {activeTab === 'academics' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Academic Subjects & Assigned Teachers</h3>
              <p className="text-slate-500">Teachers are restricted to managing homework and marks only for their assigned subjects.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-3">Subject Code</th>
                  <th className="py-3 px-3">Grade Level</th>
                  <th className="py-3 px-4">Assigned Teacher</th>
                  <th className="py-3 px-4">Security Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 px-3 font-mono text-blue-900 font-semibold">{s.code}</td>
                    <td className="py-3 px-3 font-mono">Grade {s.gradeLevel}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.teacherIds.includes('usr_teacher_elena') ? 'Ms. Elena Rostova' : 'Mr. David Okonkwo'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                        Isolated in JWT
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
