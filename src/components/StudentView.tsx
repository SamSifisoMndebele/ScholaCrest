import React, { useState } from 'react';
import type { School, AppUser, Subject, HomeworkAssignment, TermReportCard } from '../types';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Printer, 
  CheckCircle2, 
  Download, 
  Clock, 
  Upload, 
  Sparkles, 
  TrendingUp, 
  GraduationCap,
  Calendar,
  MapPin,
  Search,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { uploadStrategicFile } from '../services/storageRouter';

interface StudentViewProps {
  school: School;
  student: AppUser;
  subjects: Subject[];
  homework: HomeworkAssignment[];
  reportCard: TermReportCard;
  onOpenReportCard: () => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  school,
  student,
  subjects,
  homework,
  reportCard,
  onOpenReportCard,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'homework' | 'subjects' | 'schedule' | 'results'>('homework');
  const [hwFilter, setHwFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [searchHwQuery, setSearchHwQuery] = useState('');
  
  // Track homework turned in by student
  const [submittedHwIds, setSubmittedHwIds] = useState<string[]>(['hw_unit1_calc']);
  const [activeTurnInHw, setActiveTurnInHw] = useState<HomeworkAssignment | null>(null);
  const [turnInNote, setTurnInNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedStats, setCompressedStats] = useState<{ originalKb: number; storedKb: number } | null>(null);
  const [showIdCard, setShowIdCard] = useState(false);

  // Subject syllabus & accent color mapping
  const subjectMetadata: Record<string, { color: string; bgLight: string; progress: number; room: string; time: string }> = {
    sub_math_10: { color: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-200', progress: 74, room: 'Room 104', time: 'Period 2 • 09:05 AM' },
    sub_phys_10: { color: 'text-indigo-600', bgLight: 'bg-indigo-50 border-indigo-200', progress: 68, room: 'Lab 2', time: 'Period 1 • 08:00 AM' },
    sub_chem_10: { color: 'text-emerald-600', bgLight: 'bg-emerald-50 border-emerald-200', progress: 82, room: 'Lab 3', time: 'Period 3 • 10:30 AM' },
    sub_eng_10: { color: 'text-purple-600', bgLight: 'bg-purple-50 border-purple-200', progress: 78, room: 'Room 102', time: 'Period 4 • 11:35 AM' },
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCompressedStats({
        originalKb: Math.round(file.size / 1024),
        storedKb: Math.max(12, Math.round((file.size / 1024) * 0.08)), // simulated WebP savings
      });
    }
  };

  const handleTurnInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTurnInHw || !selectedFile) return;

    setIsCompressing(true);

    try {
      const res = await uploadStrategicFile({
        schoolId: school.id,
        category: 'student_submission',
        file: selectedFile,
      });

      setSubmittedHwIds(prev => [...prev, activeTurnInHw.id]);

      if (onNotify) {
        onNotify(
          'Assignment Submitted Successfully!',
          `"${activeTurnInHw.title}" compressed to WebP (${res.storedSizeKb} KB) and uploaded to Cloudflare R2 ($0 egress bandwidth).`,
          'success'
        );
      }

      setActiveTurnInHw(null);
      setSelectedFile(null);
      setCompressedStats(null);
      setTurnInNote('');
    } finally {
      setIsCompressing(false);
    }
  };

  const roundedAverage = Math.round(reportCard.overallAverage);
  const pendingHwCount = homework.filter(h => !submittedHwIds.includes(h.id)).length;
  const completedHwCount = homework.filter(h => submittedHwIds.includes(h.id)).length;

  const filteredHomework = homework.filter(hw => {
    const isSubmitted = submittedHwIds.includes(hw.id);
    const matchesSearch = hw.title.toLowerCase().includes(searchHwQuery.toLowerCase()) || 
      hw.instructions.toLowerCase().includes(searchHwQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (hwFilter === 'pending') return !isSubmitted;
    if (hwFilter === 'submitted') return isSubmitted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Modern Learner Welcome & Performance Cockpit */}
      <div className="bg-gradient-to-r from-crest-navy via-slate-900 to-crest-navy text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-crest-navyDark">
        {/* Heraldic Crest Watermark in Background */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-12 translate-y-12 select-none">
          <img src="/icon.svg" alt="" className="w-80 h-80 object-contain" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          {/* Student Profile Info */}
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={student.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=180&auto=format&fit=crop&q=80'}
                alt=""
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-crest-gold shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Active in Session" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Enrolled • Grade 10A
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-crest-gold font-mono font-bold border border-white/20">
                  {student.admissionNumber}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-serif mt-1">
                Good day, {student.fullName} 👋
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>STEM & Science Stream</span>
                <span>•</span>
                <span>{school.name}</span>
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setShowIdCard(true)}
                  className="text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-crest-gold" />
                  <span>Digital Student ID Card</span>
                </button>
                <button
                  onClick={onOpenReportCard}
                  className="text-[11px] font-bold text-crest-navyDark bg-crest-gold hover:bg-crest-goldLight px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Term Report Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Academic Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Average</span>
              <div className="text-xl md:text-2xl font-extrabold text-amber-300 font-mono mt-0.5">{roundedAverage}%</div>
              <span className="text-[10px] text-emerald-300 font-bold">Grade B+ (Honors)</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Assignments</span>
              <div className="text-xl md:text-2xl font-extrabold text-white font-mono mt-0.5">{pendingHwCount}</div>
              <span className="text-[10px] text-amber-300 font-bold">Pending To Do</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Subjects</span>
              <div className="text-xl md:text-2xl font-extrabold text-white font-mono mt-0.5">{subjects.length}</div>
              <span className="text-[10px] text-blue-300 font-bold">Active Courses</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Attendance</span>
              <div className="text-xl md:text-2xl font-extrabold text-emerald-300 font-mono mt-0.5">98.5%</div>
              <span className="text-[10px] text-slate-300 font-bold">Exemplary</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('homework')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === 'homework' 
                ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-crest-gold" />
            <span>Homework & Tasks</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'homework' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {homework.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === 'subjects' 
                ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-crest-gold" />
            <span>My Courses & Subjects</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'subjects' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {subjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === 'schedule' 
                ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-crest-gold" />
            <span>Today's Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === 'results' 
                ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-crest-gold" />
            <span>Gradebook & Marks</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: Homework & Tasks */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setHwFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  hwFilter === 'all' ? 'bg-white text-crest-navy shadow-xs' : 'text-slate-600'
                }`}
              >
                All Tasks ({homework.length})
              </button>
              <button
                onClick={() => setHwFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  hwFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                To Do ({pendingHwCount})
              </button>
              <button
                onClick={() => setHwFilter('submitted')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  hwFilter === 'submitted' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Completed ({completedHwCount})
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search homework by title..."
                value={searchHwQuery}
                onChange={(e) => setSearchHwQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
              />
            </div>
          </div>

          {/* Assignment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHomework.length === 0 ? (
              <div className="col-span-2 bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
                No assignments found in this category.
              </div>
            ) : (
              filteredHomework.map((hw) => {
                const subject = subjects.find(s => s.id === hw.subjectId);
                const isTurnedIn = submittedHwIds.includes(hw.id);

                return (
                  <div 
                    key={hw.id} 
                    className={`bg-white rounded-3xl border p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md ${
                      isTurnedIn ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-crest-navy bg-crest-navy/10 px-2.5 py-0.5 rounded-full">
                            {subject?.name || 'Subject'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base mt-1.5">{hw.title}</h3>
                        </div>
                        <span className="font-mono text-xs font-bold text-crest-navy bg-slate-100 px-2.5 py-1 rounded-xl">
                          {hw.maxMarks} pts
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {hw.instructions}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isTurnedIn ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                        </span>

                        {isTurnedIn ? (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Turned In (R2 Attached)
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                            Action Pending
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        {hw.attachment ? (
                          <button 
                            onClick={() => {
                              if (onNotify) {
                                onNotify('Downloading Worksheet', `Fetching assignment worksheet from Cloudflare R2 ($0 egress fees).`, 'info');
                              }
                            }}
                            className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold text-xs bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Worksheet (R2)</span>
                          </button>
                        ) : <span />}

                        {isTurnedIn ? (
                          <button
                            onClick={() => setActiveTurnInHw(hw)}
                            className="text-slate-600 hover:text-slate-900 font-bold text-xs px-3 py-1.5 bg-slate-100 rounded-xl transition-colors"
                          >
                            Resubmit Work
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTurnInHw(hw)}
                            className="flex items-center gap-1 text-white bg-crest-navy hover:bg-crest-navyDark px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all hover:scale-[1.02]"
                          >
                            <Upload className="w-3.5 h-3.5 text-crest-gold" />
                            <span>Turn In Solution</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: My Courses & Subjects */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((s) => {
            const meta = subjectMetadata[s.id] || { color: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-200', progress: 70, room: 'Room 101', time: 'Period 1 • 08:00 AM' };
            const subjectMarks = reportCard.subjects.find(sub => sub.subjectId === s.id);

            return (
              <div key={s.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                {/* Subject Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-crest-navy bg-crest-navy/10 px-2.5 py-0.5 rounded-full">
                      {s.code} • Grade {s.gradeLevel}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg font-serif mt-1">{s.name}</h3>
                  </div>

                  {subjectMarks && (
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-crest-navy font-mono">
                        {subjectMarks.percentage}%
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        subjectMarks.gradeSymbol === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        Grade {subjectMarks.gradeSymbol}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Term 1 Syllabus Completion</span>
                    <span className="font-bold text-slate-700">{meta.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-crest-navy h-full rounded-full transition-all duration-500"
                      style={{ width: `${meta.progress}%` }}
                    />
                  </div>
                </div>

                {/* Teacher & Room Info */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=80&auto=format&fit=crop&q=80"
                      alt=""
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-[11px]">Ms. Elena Rostova</div>
                      <div className="text-[10px] text-slate-400">Head of Subject</div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-end gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3 h-3 text-crest-gold" />
                      <span>{meta.room}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{meta.time}</div>
                  </div>
                </div>

                {/* Quick Subject Actions */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <GraduationCap className="w-3.5 h-3.5 text-crest-navy" />
                    Curriculum 2026
                  </span>

                  <button
                    onClick={() => {
                      setActiveTab('homework');
                      setSearchHwQuery(s.name.split(' ')[0]);
                    }}
                    className="inline-flex items-center gap-1 text-crest-navy hover:text-crest-navyDark font-bold text-xs"
                  >
                    <span>View Homework</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Today's Timetable & Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-crest-navy font-serif">Daily Academic Schedule</h3>
              <p className="text-xs text-slate-500">Academic Year 2026 • Grade 10A Daily Routine</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Current Day: Tuesday (Day 2 of Cycle)
            </span>
          </div>

          <div className="space-y-3">
            {[
              { period: 'Period 1', time: '08:00 - 09:00', name: 'Physical Sciences (Physics)', room: 'Laboratory 2', teacher: 'Mr. David Okonkwo', status: 'past' },
              { period: 'Period 2', time: '09:05 - 10:05', name: 'Mathematics (Core Calculus)', room: 'Room 104', teacher: 'Ms. Elena Rostova', status: 'current' },
              { period: 'Break', time: '10:05 - 10:30', name: 'Morning Recess & Refreshment', room: 'Courtyard', teacher: 'Campus Duty', status: 'upcoming', isBreak: true },
              { period: 'Period 3', time: '10:30 - 11:30', name: 'Physical Sciences (Chemistry)', room: 'Laboratory 3', teacher: 'Mr. David Okonkwo', status: 'upcoming' },
              { period: 'Period 4', time: '11:35 - 12:35', name: 'English Language & Literature', room: 'Room 102', teacher: 'Ms. Elena Rostova', status: 'upcoming' },
              { period: 'Period 5', time: '13:15 - 14:15', name: 'Life Sciences (Biology Lab)', room: 'Bio Science Wing', teacher: 'Dr. Sarah Ndlovu', status: 'upcoming' },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                  item.status === 'current' 
                    ? 'border-crest-navy bg-blue-50/50 ring-2 ring-crest-navy/20' 
                    : item.isBreak 
                    ? 'border-slate-200/60 bg-slate-50/50' 
                    : 'border-slate-100 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 text-center font-mono ${
                    item.status === 'current' ? 'text-crest-navy font-bold' : 'text-slate-400'
                  }`}>
                    <div className="text-[10px] uppercase">{item.period}</div>
                    <div className="text-xs font-bold text-slate-700">{item.time.split(' - ')[0]}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.status === 'current' && (
                        <span className="text-[10px] bg-crest-navy text-white px-2 py-0.5 rounded-full uppercase font-mono font-bold animate-pulse">
                          Active Now
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-crest-gold" />
                        {item.room}
                      </span>
                      <span>•</span>
                      <span>{item.teacher}</span>
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs text-slate-500">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Gradebook & Report Card */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-crest-navy text-lg font-serif">Official Term Marks & Progress</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Overall: {roundedAverage}%
                </span>
              </div>
              <p className="text-xs text-slate-500">{reportCard.termName} • Issued by Office of the Principal</p>
            </div>

            <button
              onClick={onOpenReportCard}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-crest-navy hover:bg-crest-navyDark text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-crest-navy/20 hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4 text-crest-gold" />
              <span>Print Official Term Report Card</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Subject Name</th>
                  <th className="py-3.5 px-3 text-center">Score</th>
                  <th className="py-3.5 px-3 text-center">% Average</th>
                  <th className="py-3.5 px-3 text-center">Grade</th>
                  <th className="py-3.5 px-4">Teacher Commendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportCard.subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{sub.subjectName}</td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-crest-navy">{sub.mark} / {sub.maxMark}</td>
                    <td className="py-4 px-3 text-center font-bold">{sub.percentage}%</td>
                    <td className="py-4 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        sub.gradeSymbol === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        sub.gradeSymbol === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Grade {sub.gradeSymbol}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 italic text-xs">"{sub.teacherRemark}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Turn In Assignment with in-browser WebP compression */}
      {activeTurnInHw && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-crest-navy font-serif">
                  Submit Homework Solution
                </h3>
                <p className="text-xs text-slate-500">{activeTurnInHw.title} • Max {activeTurnInHw.maxMarks} Points</p>
              </div>
              <button
                onClick={() => {
                  setActiveTurnInHw(null);
                  setSelectedFile(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTurnInSubmit} className="space-y-4 text-xs pt-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Guidelines</label>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
                  {activeTurnInHw.instructions}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attach Solution File (Photo, PDF, or Document)
                </label>
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-crest-navy bg-slate-50/60 hover:bg-slate-50 transition-all text-center space-y-2">
                  <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                  <div className="font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Choose file or drag & drop'}
                  </div>
                  <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Auto-compressed to WebP)</p>
                  
                  <label className="cursor-pointer inline-block bg-crest-navy hover:bg-crest-navyDark text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs">
                    <span>{selectedFile ? 'Change File' : 'Browse File'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* In-Browser WebP Compression Meter */}
              {compressedStats && (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                  <div className="flex items-center justify-between text-purple-900 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                      Client-Side WebP Compression:
                    </span>
                    <span className="text-emerald-700 font-mono">
                      ~92% Bandwidth Saved
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-purple-700 font-mono">
                    <span>Original: {compressedStats.originalKb} KB</span>
                    <span>$\rightarrow$</span>
                    <span className="font-bold">Cloudflare R2 Stored: {compressedStats.storedKb} KB ($0 Egress)</span>
                  </div>
                </div>
              )}

              {/* Student Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Note for Teacher (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Completed questions 1 through 8. Showed all working for trigonometry."
                  value={turnInNote}
                  onChange={(e) => setTurnInNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTurnInHw(null);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isCompressing}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-crest-navy hover:bg-crest-navyDark text-white font-bold shadow-xs disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4 text-crest-gold" />
                  <span>{isCompressing ? 'Compressing & Uploading...' : 'Submit Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Interactive Digital Student ID Card */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-crest-gold/50 my-auto animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-crest-navy uppercase tracking-wider font-serif">
                Verified Student Identity Card
              </span>
              <button
                onClick={() => setShowIdCard(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* The Badge Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm space-y-4 relative overflow-hidden">
              {/* Institutional Header */}
              <div className="flex items-center justify-between border-b-2 border-crest-navy pb-3">
                <div className="flex items-center gap-2">
                  <img src="/icon.svg" alt="" className="w-8 h-8 object-contain" />
                  <div>
                    <div className="font-serif font-extrabold text-crest-navy text-xs tracking-wider uppercase">
                      {school.letterhead.schoolName}
                    </div>
                    <div className="text-[9px] text-crest-gold font-bold italic">
                      "{school.letterhead.motto}"
                    </div>
                  </div>
                </div>

                <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase font-mono">
                  ACTIVE 2026
                </span>
              </div>

              {/* Photo & Details */}
              <div className="flex items-center gap-4 py-2">
                <img
                  src={student.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-20 h-24 rounded-xl object-cover border-2 border-slate-200 shadow-xs flex-shrink-0"
                />

                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 text-sm">{student.fullName}</div>
                  <div className="text-[11px] font-mono text-crest-navy font-bold">
                    ID: {student.admissionNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Grade 10A • Physical Sciences
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    EMIS: {school.letterhead.emisNumber}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Enrolled & Fee Verified
                  </div>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="pt-3 border-t border-slate-200 flex flex-col items-center">
                <div className="h-9 w-64 flex items-center justify-between opacity-80">
                  {[...Array(38)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full ${i % 4 === 0 ? 'w-1 bg-slate-900' : i % 2 === 0 ? 'w-0.5 bg-slate-800' : 'w-1.5 bg-slate-700'}`} 
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1">* {student.admissionNumber} *</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400 font-mono">Valid through 31 Dec 2026</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-crest-navy font-bold text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print ID</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
