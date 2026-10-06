import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { School } from '../types';
import { ScholaCrestLogo } from './ScholaCrestLogo';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  HardDrive, 
  Database, 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  LogIn,
  Layers,
  Cpu
} from 'lucide-react';

interface LandingPageViewProps {
  schools: School[];
  onSeedDatabase?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  schools,
  onSeedDatabase,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');

  const filteredSchools = schools.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.letterhead?.address || '').toLowerCase().includes(q) ||
      (s.letterhead?.motto || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedGradeFilter !== 'all') {
      const openGrades = s.admissionRules?.openGrades || [8, 9, 10, 11, 12];
      return openGrades.includes(selectedGradeFilter);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-crest-gold selection:text-crest-navyDark">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ScholaCrestLogo size={46} variant="icon-only" />
              <div>
                <div className="font-extrabold text-lg tracking-tight text-crest-navy flex items-center gap-1.5 leading-none">
                  SCHOLA CREST
                  <span className="text-[10px] bg-blue-100 text-crest-navy px-2 py-0.5 rounded-full font-semibold">
                    MULTI-TENANT
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Cloudflare Edge & Firebase Architecture
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
              <a href="#about" className="hover:text-crest-navy transition-colors">About Platform</a>
              <a href="#schools" className="hover:text-crest-navy transition-colors flex items-center gap-1.5">
                Available Schools
                <span className="bg-crest-navy text-white text-[10px] px-2 py-0.5 rounded-full">
                  {schools.length}
                </span>
              </a>
              <a href="#features" className="hover:text-crest-navy transition-colors">Core Modules</a>
              <a href="#architecture" className="hover:text-crest-navy transition-colors">Zero-Egress Tech</a>
            </div>

            {/* Portal & Apply Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-crest-navy text-crest-navy font-bold text-xs transition-all hover:bg-slate-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff & Admin Portal</span>
              </Link>

              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crest-navy hover:bg-crest-navyDark text-white font-bold text-xs transition-all shadow-md shadow-crest-navy/20 hover:scale-[1.02]"
              >
                <GraduationCap className="w-4 h-4 text-crest-gold" />
                <span>Apply Online</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-crest-navy via-crest-navyDark to-crest-navy text-white py-20 lg:py-28 border-b border-crest-navyDark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,127,26,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Edge Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/15 text-[11px] font-bold">
                <Database className="w-3.5 h-3.5" />
                Cloudflare D1 SQL: 5M Free Reads/Day
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-300 border border-white/15 text-[11px] font-bold">
                <HardDrive className="w-3.5 h-3.5" />
                Cloudflare R2: $0 Egress Bandwidth
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-crest-gold border border-white/15 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Firebase App Check Attested
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight leading-tight">
              Sovereign Multi-Tenant <br />
              <span className="text-crest-gold">School Management Platform</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Experience the end-to-end educational operating system. Zero-paper automated admissions, client-rendered official letterheads, scoped teacher gradebooks, and tamper-resistant term report cards — backed by an ultra-fast global edge database.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#schools"
                className="px-6 py-3.5 rounded-2xl bg-crest-gold hover:bg-crest-goldLight text-crest-navyDark font-extrabold text-sm transition-all shadow-xl hover:shadow-glow-gold hover:scale-[1.02] flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Explore Available Schools ({schools.length})</span>
              </a>

              <Link
                to="/login"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Layers className="w-4 h-4 text-crest-gold" />
                <span>Launch Institutional Console</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-crest-gold font-mono">{schools.length}</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Accredited Schools Online</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">100%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Automated Screening</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">$0.00</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Egress Bandwidth Fees</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">5,000,000</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Daily Free Reads (D1)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AVAILABLE SCHOOLS DIRECTORY (SAVED ONLINE IN REAL DB) */}
      <section id="schools" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crest-navy/5 text-crest-navy text-xs font-bold uppercase tracking-wider mb-2 border border-crest-navy/10">
                <Building2 className="w-3.5 h-3.5 text-crest-navy" />
                Live Cloudflare D1 Tenant Directory
              </div>
              <h2 className="text-3xl font-extrabold text-crest-navy font-serif">
                Available Registered Schools
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                Browse all accredited institutions registered on the platform. All schools are stored online and managed by administrators. Click &ldquo;Apply Online&rdquo; to start your admissions process.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by school name, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crest-navy shadow-xs"
                />
              </div>

              {/* Grade Filter */}
              <div className="flex items-center bg-white border border-slate-300 p-1 rounded-xl text-xs font-semibold shadow-xs">
                <span className="px-2 text-slate-400 text-[11px]">Grade:</span>
                {(['all', 8, 9, 10, 11, 12] as const).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGradeFilter(grade)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedGradeFilter === grade
                        ? 'bg-crest-navy text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {grade === 'all' ? 'All' : `Gr ${grade}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* School Cards Grid */}
          {filteredSchools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {filteredSchools.map((school) => {
                const primaryColor = school.letterhead?.primaryColor || '#092451';
                const openGrades = school.admissionRules?.openGrades || [8, 9, 10, 11, 12];
                const cutoff = school.admissionRules?.passScoreThreshold || 60;

                return (
                  <div
                    key={school.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col group"
                  >
                    {/* Card Header with Brand Color Banner */}
                    <div 
                      className="p-6 text-white relative overflow-hidden"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-xs">
                            <img src={school.letterhead?.logoUrl || '/icon.svg'} alt="" className="w-8 h-8 object-contain" />
                          </div>
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
                              {school.code}
                            </span>
                            <h3 className="font-bold text-base font-serif leading-tight">
                              {school.name}
                            </h3>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          school.status === 'active' 
                            ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' 
                            : 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                        }`}>
                          {school.status}
                        </span>
                      </div>

                      {/* Motto */}
                      {school.letterhead?.motto && (
                        <p className="mt-4 text-xs text-white/80 italic font-serif leading-snug line-clamp-1 border-t border-white/10 pt-3">
                          &ldquo;{school.letterhead.motto}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5 text-xs text-slate-600">
                      {/* Admissions Specs */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cutoff Score</div>
                          <div className="font-extrabold text-crest-navy text-sm mt-0.5">{cutoff}% Minimum</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Open Grades</div>
                          <div className="font-extrabold text-slate-800 text-sm mt-0.5">Gr {openGrades.join(', ')}</div>
                        </div>
                      </div>

                      {/* Institutional Contact Info */}
                      <div className="space-y-2 text-slate-500">
                        {school.letterhead?.emisNumber && (
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700">
                            <span className="font-bold text-crest-navy">EMIS:</span> {school.letterhead.emisNumber}
                          </div>
                        )}
                        {school.letterhead?.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{school.letterhead.address}</span>
                          </div>
                        )}
                        {school.letterhead?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{school.letterhead.email}</span>
                          </div>
                        )}
                        {school.letterhead?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{school.letterhead.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Action CTA */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <Link
                          to={`/apply/${school.id}`}
                          className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 group-hover:scale-[1.01] ${
                            school.status === 'active'
                              ? 'bg-crest-navy hover:bg-crest-navyDark'
                              : 'bg-slate-300 pointer-events-none'
                          }`}
                        >
                          <GraduationCap className="w-4 h-4 text-crest-gold" />
                          <span>Apply to {school.code}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800 font-serif">No Schools Found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                {searchQuery ? 'No institutions match your search filter.' : 'The database is currently empty.'}
              </p>
              {onSeedDatabase && (
                <button
                  onClick={onSeedDatabase}
                  className="px-5 py-2.5 rounded-xl bg-crest-navy text-white text-xs font-bold hover:bg-crest-navyDark transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-crest-gold" />
                  <span>Seed Standard Starter Schools in Real DB</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. ABOUT THE SYSTEM & ARCHITECTURE */}
      <section id="about" className="py-20 bg-white border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-crest-gold bg-crest-navy px-3 py-1 rounded-full">
              Platform Overview
            </span>
            <h2 className="text-3xl font-extrabold text-crest-navy font-serif mt-3">
              Designed for Sovereign Institutional Independence
            </h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Schola Crest is built from the ground up as a multi-tenant school operating system. Each registered school enjoys total cryptographic and data isolation, custom vector letterhead branding, automated admissions screening, and gradebook management.
            </p>
          </div>

          {/* 4 Core Pillars */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-crest-navy/30 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-crest-navy flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-serif">Automated Admissions Pipeline</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Smart rules engine evaluates applicant age, verifies cutoff marks, screens mandatory documents, and computes real-time recommendation scores.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-crest-navy/30 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-serif">Vector School Letterheads</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Every school generates official acceptance letters and term report cards directly on the client canvas with high-resolution vector crests and stamps — $0 storage cost.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-crest-navy/30 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-serif">Scoped Teacher Gradebooks</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Teachers are strictly scoped to their assigned subjects and classes. Marks, assignments, and curriculum homework are tracked seamlessly in Cloudflare D1.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-crest-navy/30 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-serif">Zero-Egress Object Storage</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Powered by Cloudflare R2 with WebP compression for applicant IDs, report cards, and teacher slide modules. Zero egress bandwidth charges forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SYSTEM ARCHITECTURE & ZERO-COST STRATEGY */}
      <section id="architecture" className="py-20 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-crest-gold text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                <Cpu className="w-3.5 h-3.5" />
                Zero-Trust Multi-Database Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
                Tiered Cloudflare Edge & Firebase Infrastructure
              </h2>
              <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                Rather than relying on an expensive monolithic database, Schola Crest strategically routes data to the tier where it is most cost-effective and performs at peak edge speed:
              </p>

              <div className="mt-8 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Database className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white text-sm">Cloudflare D1 (Edge Relational SQLite)</strong>
                    <p className="text-slate-300 mt-1">Handles high-concurrency student gradebooks, assessment marks, applications, and rosters with 5,000,000 free daily reads.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white text-sm">Cloudflare R2 (S3-Compatible Zero-Egress Storage)</strong>
                    <p className="text-slate-300 mt-1">Safely stores student birth certificates, prior transcripts, and homework attachments without incurring egress download bandwidth costs.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-crest-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white text-sm">Firebase App Check + reCAPTCHA Enterprise</strong>
                    <p className="text-slate-300 mt-1">Verifies device integrity and guarantees that only verified web clients can invoke the API, stopping bots, scraper abuse, and unauthorized requests.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Launcher Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/15">
              <h3 className="font-bold text-lg font-serif text-white">Experience All Roles in the System</h3>
              <p className="text-xs text-slate-300 mt-1 mb-6">
                Schola Crest enforces granular privileges across the entire educational hierarchy. Test any role instantly:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/portal/super-admin')}
                  className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-crest-navy text-white flex items-center justify-center font-bold text-xs">SA</div>
                    <div>
                      <div className="font-bold text-xs text-white">Super Admin Console</div>
                      <div className="text-[11px] text-slate-300">Register new institutions, suspend tenants, global analytics</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/portal/school-admin')}
                  className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">PR</div>
                    <div>
                      <div className="font-bold text-xs text-white">Principal / School Admin</div>
                      <div className="text-[11px] text-slate-300">Customize letterhead, brand colors, cutoff scores & curricula</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/portal/registrar')}
                  className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">RG</div>
                    <div>
                      <div className="font-bold text-xs text-white">Registrar Admissions Desk</div>
                      <div className="text-[11px] text-slate-300">Review candidate dossiers, inspect docs, issue official letters</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/portal/teacher')}
                  className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">TC</div>
                    <div>
                      <div className="font-bold text-xs text-white">Teacher Gradebook & Homework Desk</div>
                      <div className="text-[11px] text-slate-300">Enter assessment marks, create homework, manage classes</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/portal/student')}
                  className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">ST</div>
                    <div>
                      <div className="font-bold text-xs text-white">Learner Portal & Term Report Cards</div>
                      <div className="text-[11px] text-slate-300">View homework, turn in assignments, download official reports</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <ScholaCrestLogo size={32} variant="icon-only" />
              <div>
                <span className="font-bold text-slate-900 text-sm">Schola Crest Multi-Tenant SMS</span>
                <p className="text-[11px] text-slate-400">Next-Generation Zero-Egress Educational Operating System</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <a href="#about" className="hover:text-crest-navy">About</a>
              <a href="#schools" className="hover:text-crest-navy">Schools ({schools.length})</a>
              <a href="#architecture" className="hover:text-crest-navy">Edge Architecture</a>
              <Link to="/login" className="hover:text-crest-navy font-bold text-crest-navy">
                Staff Login
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>&copy; 2026 Schola Crest SaaS. All rights reserved. Operating with Cloudflare D1 & Firebase App Check.</div>
            <div className="font-mono">Database Status: <span className="text-emerald-600 font-bold">Online (scholacrest-db)</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
