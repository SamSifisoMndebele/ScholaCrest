import React, { useState } from 'react';
import type { School } from '../types';
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Database, 
  HardDrive,
  Search
} from 'lucide-react';

interface SuperAdminViewProps {
  schools: School[];
  onAddSchool: (school: School) => void;
  onToggleStatus: (schoolId: string) => void;
  onSelectSchoolForInspection: (school: School) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  schools,
  onAddSchool,
  onToggleStatus,
  onSelectSchoolForInspection,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newMotto, setNewMotto] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmis, setNewEmis] = useState('');

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode) return;

    const id = `sch_${newSchoolCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newSchool: School = {
      id,
      name: newSchoolName,
      code: newSchoolCode.toUpperCase(),
      status: 'active',
      createdAt: new Date().toISOString(),
      letterhead: {
        schoolName: newSchoolName.toUpperCase(),
        emisNumber: newEmis || `EMIS: 700${Math.floor(100000 + Math.random() * 900000)}`,
        motto: newMotto || 'Integrity, Diligence and Success',
        address: newAddress || '120 School Way, Central District',
        phone: newPhone || '+27 11 555 0100',
        email: newEmail || `info@${newSchoolCode.toLowerCase()}.edu`,
        website: `https://${newSchoolCode.toLowerCase()}.edu`,
        signatureTitle: 'The Office of the Principal',
        primaryColor: '#1e3a8a',
        secondaryColor: '#b45309',
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

    onAddSchool(newSchool);
    setShowAddModal(false);
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewMotto('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewEmis('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: SaaS Owner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Console • Global Multi-Tenant Control
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Platform Overview & School Tenants</h2>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                You hold master control over all registered institutions. Each school operates in complete tenant isolation with dedicated letterhead, grading rules, and scoped access.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New School</span>
            </button>
          </div>

          {/* Infrastructure & Security Health Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                Active School Tenants
              </div>
              <div className="text-xl font-bold mt-1 text-white">{schools.length} Institutions</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Cloudflare D1 Reads
              </div>
              <div className="text-xl font-bold mt-1 text-emerald-400">5M Free / Day</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-purple-400" />
                Cloudflare R2 Egress
              </div>
              <div className="text-xl font-bold mt-1 text-purple-300">$0.00 Egress Fees</div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Firebase App Check
              </div>
              <div className="text-xl font-bold mt-1 text-cyan-300">Protected (reCAPTCHA)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schools Directory & Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registered Institutions ({schools.length})</h3>
              <p className="text-xs text-slate-500">Manage tenant activation and configure institution defaults</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search school name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6">School Name & Code</th>
                <th className="py-3.5 px-4">EMIS & Contact</th>
                <th className="py-3.5 px-4">Open Grades</th>
                <th className="py-3.5 px-4">Admissions Cut-Off</th>
                <th className="py-3.5 px-4">Tenant Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {school.letterhead.logoUrl ? (
                        <img 
                          src={school.letterhead.logoUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
                          {school.code.substring(0, 3)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{school.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{school.code} • {school.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-mono text-slate-900 font-medium">{school.letterhead.emisNumber}</div>
                    <div className="text-slate-400 text-[11px]">{school.letterhead.email}</div>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium text-slate-800">
                    Grades {school.admissionRules.openGrades.join(', ')}
                  </td>
                  <td className="py-4 px-4 font-bold text-blue-900">
                    {school.admissionRules.passScoreThreshold}% Minimum
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      school.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {school.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      )}
                      {school.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => onSelectSchoolForInspection(school)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-xs transition-colors"
                    >
                      Inspect Tenant
                    </button>
                    <button
                      onClick={() => onToggleStatus(school.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                        school.status === 'active'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {school.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Onboard New School Tenant</h3>
            <p className="text-xs text-slate-500 mb-5">
              Registers a new isolated school tenant in the database with automated letterhead defaults.
            </p>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude's Collegiate Academy"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">School Code (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STJU-01"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">EMIS / Reg. Number</label>
                  <input
                    type="text"
                    placeholder="e.g. EMIS: 700912441"
                    value={newEmis}
                    onChange={(e) => setNewEmis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Veritas et Virtus"
                  value={newMotto}
                  onChange={(e) => setNewMotto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="admin@stjude.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    placeholder="+27 21 555 0199"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="12 St. Jude Lane, Constantia"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm"
                >
                  Register School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
