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
  Search,
  Sparkles,
  Radio,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface SuperAdminViewProps {
  schools: School[];
  onAddSchool: (school: School) => void;
  onToggleStatus: (schoolId: string) => void;
  onDeleteSchool: (schoolId: string) => void;
  onSeedDatabase: () => void;
  onSelectSchoolForInspection: (school: School) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  schools,
  onAddSchool,
  onToggleStatus,
  onDeleteSchool,
  onSeedDatabase,
  onSelectSchoolForInspection,
  onNotify,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newMotto, setNewMotto] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmis, setNewEmis] = useState('');
  const [newColor, setNewColor] = useState('#092451');

  const filteredSchools = schools.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'active') return s.status === 'active';
    if (statusFilter === 'suspended') return s.status === 'suspended';
    return true;
  });

  const handleDelete = (schoolId: string, schoolName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${schoolName}" from the real database? This action cannot be undone.`)) {
      onDeleteSchool(schoolId);
      if (onNotify) {
        onNotify('School Tenant Deleted', `"${schoolName}" was removed permanently from Cloudflare D1.`, 'warning');
      }
    }
  };

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
        primaryColor: newColor,
        secondaryColor: '#c27f1a',
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

    if (onNotify) {
      onNotify(
        'New Institution Onboarded!',
        `${newSchoolName} (${newSchool.code}) created with isolated D1 tables and R2 storage partition.`,
        'success'
      );
    }

    setNewSchoolName('');
    setNewSchoolCode('');
    setNewMotto('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewEmis('');
    setNewColor('#092451');
  };

  const handleToggle = (schoolId: string, currentStatus: string, name: string) => {
    onToggleStatus(schoolId);
    if (onNotify) {
      onNotify(
        `Tenant ${currentStatus === 'active' ? 'Suspended' : 'Activated'}`,
        `${name} is now ${currentStatus === 'active' ? 'suspended' : 'active'}.`,
        currentStatus === 'active' ? 'warning' : 'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: SaaS Owner Overview */}
      <div className="bg-gradient-to-r from-crest-navy via-crest-navyDark to-crest-navy text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-crest-navyDark">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-crest-gold text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Console • Global Multi-Tenant Control
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-serif">Platform Overview & School Tenants</h2>
              <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                You hold master administrative authority across all registered institutions. Each school operates in complete tenant isolation with dedicated vector letterheads, Cloudflare D1 gradebooks, and scoped security.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onSeedDatabase}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all"
                title="Seed or reset standard demo schools in real D1 database"
              >
                <RotateCcw className="w-4 h-4 text-crest-gold" />
                <span>Seed Starter Data</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-crest-gold hover:bg-crest-goldLight text-crest-navyDark px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all shadow-lg hover:shadow-glow-gold hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register New School</span>
              </button>
            </div>
          </div>

          {/* Infrastructure & Security Health Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xs">
              <div className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Building2 className="w-4 h-4 text-blue-300" />
                Active School Tenants
              </div>
              <div className="text-xl font-extrabold mt-1 text-white">{schools.length} Institutions</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xs">
              <div className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Database className="w-4 h-4 text-emerald-300" />
                Cloudflare D1 Reads
              </div>
              <div className="text-xl font-extrabold mt-1 text-emerald-300">5M Free / Day</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xs">
              <div className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <HardDrive className="w-4 h-4 text-purple-300" />
                Cloudflare R2 Egress
              </div>
              <div className="text-xl font-extrabold mt-1 text-purple-300">$0.00 Egress Fees</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xs">
              <div className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                App Check & RTDB
              </div>
              <div className="text-xl font-extrabold mt-1 text-amber-300">reCAPTCHA Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schools Directory & Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-crest-navy/5 text-crest-navy rounded-2xl border border-crest-navy/10">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-crest-navy text-base font-serif">Registered Institutions ({schools.length})</h3>
              <p className="text-xs text-slate-500">Manage tenant activation and configure institution defaults</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-crest-navy font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({schools.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'active' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Active ({schools.filter(s => s.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'suspended' ? 'bg-white text-rose-800 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Suspended ({schools.filter(s => s.status === 'suspended').length})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
              />
            </div>
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
                <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                        style={{ backgroundColor: school.letterhead.primaryColor || '#092451' }}
                      >
                        <img src="/icon.svg" alt="" className="w-6 h-6 object-contain" />
                      </div>
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
                  <td className="py-4 px-4 font-bold text-crest-navy">
                    {school.admissionRules.passScoreThreshold}% Minimum
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      school.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {school.status === 'active' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      {school.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => onSelectSchoolForInspection(school)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-crest-navy rounded-xl font-bold text-xs transition-colors"
                    >
                      Inspect Tenant
                    </button>
                    <button
                      onClick={() => handleToggle(school.id, school.status, school.name)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        school.status === 'active'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {school.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(school.id, school.name)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors inline-flex items-center gap-1"
                      title="Permanently delete school from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-auto animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-crest-navy mb-1 font-serif">Onboard New School Tenant</h3>
            <p className="text-xs text-slate-500 mb-5">
              Registers a new isolated school tenant in the database with automated letterhead defaults.
            </p>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude's Collegiate Academy"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">School Code (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STJU-01"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">EMIS / Reg. Number</label>
                  <input
                    type="text"
                    placeholder="e.g. EMIS: 700912441"
                    value={newEmis}
                    onChange={(e) => setNewEmis(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Veritas et Virtus"
                  value={newMotto}
                  onChange={(e) => setNewMotto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="admin@stjude.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    placeholder="+27 21 555 0199"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="12 St. Jude Lane, Constantia"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institutional Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-10 h-8 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-slate-500 text-[11px]">{newColor}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-crest-gold" />
                  Isolation Schema:
                </span>
                <span className="font-mono text-crest-navy font-bold">Scoped D1 Tenant Partition</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-crest-navy hover:bg-crest-navyDark text-white font-bold transition-all shadow-md shadow-crest-navy/20"
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
