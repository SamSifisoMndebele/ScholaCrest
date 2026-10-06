import React, { useState } from 'react';
import type { School, Subject, HomeworkAssignment, SubjectAssessmentMark, AppUser } from '../types';
import { 
  BookOpen, 
  PlusCircle, 
  CheckCircle2, 
  FileText, 
  Award,
  Clock,
  Download,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface TeacherViewProps {
  school: School;
  teacher: AppUser;
  subjects: Subject[];
  homework: HomeworkAssignment[];
  marks: SubjectAssessmentMark[];
  onAddHomework: (hw: HomeworkAssignment) => void;
  onAddOrUpdateMark: (mark: SubjectAssessmentMark) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  school,
  teacher,
  subjects,
  homework,
  marks,
  onAddHomework,
  onAddOrUpdateMark,
  onNotify,
}) => {
  // Scoped strictly to assigned subjects!
  const assignedSubjects = subjects.filter(s => 
    teacher.assignedSubjectIds?.includes(s.id) || s.teacherIds.includes(teacher.uid)
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    assignedSubjects[0]?.id || ''
  );

  // Homework Form State
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [hwTitle, setHwTitle] = useState('');
  const [hwInstructions, setHwInstructions] = useState('');
  const [hwDueDate, setHwDueDate] = useState('2026-02-28');
  const [hwMaxMarks, setHwMaxMarks] = useState(50);

  // Grade Entry State
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [assessmentName, setAssessmentName] = useState('Unit Test 2');
  const [markScore, setMarkScore] = useState(85);
  const [maxScore, setMaxScore] = useState(100);
  const [teacherRemark, setTeacherRemark] = useState('Outstanding geometric proofs.');

  const selectedSubject = assignedSubjects.find(s => s.id === selectedSubjectId);
  const currentHomework = homework.filter(h => h.subjectId === selectedSubjectId);
  const currentMarks = marks.filter(m => m.subjectId === selectedSubjectId);

  // Computed class metrics
  const avgMark = currentMarks.length > 0 
    ? Math.round(currentMarks.reduce((acc, curr) => acc + (curr.markObtained / curr.maxMark) * 100, 0) / currentMarks.length)
    : 0;

  // Live modal calculation
  const modalPercentage = maxScore > 0 ? Math.round((markScore / maxScore) * 100) : 0;
  const modalGrade = modalPercentage >= 80 ? 'A' : modalPercentage >= 70 ? 'B' : modalPercentage >= 60 ? 'C' : modalPercentage >= 50 ? 'D' : 'F';

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !hwTitle) return;

    const newHw: HomeworkAssignment = {
      id: `hw_${Date.now()}`,
      schoolId: school.id,
      subjectId: selectedSubject.id,
      classId: selectedSubject.classIds[0] || 'cls_10A',
      teacherId: teacher.uid,
      title: hwTitle,
      instructions: hwInstructions,
      dueDate: new Date(hwDueDate).toISOString(),
      maxMarks: hwMaxMarks,
      attachment: {
        name: `${hwTitle.replace(/\s+/g, '_')}_Worksheet.pdf`,
        storage: 'r2',
        url: '#',
      },
      createdAt: new Date().toISOString(),
    };

    onAddHomework(newHw);
    setShowHomeworkModal(false);
    setHwTitle('');
    setHwInstructions('');

    if (onNotify) {
      onNotify(
        'Homework Published!',
        `"${hwTitle}" assigned to ${selectedSubject.name}. Worksheet attached via Cloudflare R2 ($0 egress).`,
        'success'
      );
    }
  };

  const handleSaveMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    const newMark: SubjectAssessmentMark = {
      id: `mrk_${Date.now()}`,
      schoolId: school.id,
      studentId: 'usr_student_ethan',
      subjectId: selectedSubject.id,
      termId: 'term_1_2026',
      assessmentName,
      markObtained: Number(markScore),
      maxMark: Number(maxScore),
      teacherRemark,
      enteredByTeacherId: teacher.uid,
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateMark(newMark);
    setShowMarkModal(false);

    if (onNotify) {
      onNotify(
        'Mark Recorded & Calculated',
        `Recorded ${markScore}/${maxScore} (${modalPercentage}% - Grade ${modalGrade}) for Ethan Parker in ${selectedSubject.name}.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile & Scope Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-14 h-14 rounded-2xl object-cover border-2 border-crest-navy/30 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-crest-navy font-serif">{teacher.fullName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold font-mono">
                Teacher Access Scoped
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Institutional security enforces strict isolation: You can only view and manage marks for your assigned subjects.
            </p>
          </div>
        </div>

        {/* Assigned Subjects Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {assignedSubjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedSubjectId === subj.id
                  ? 'bg-crest-navy text-white shadow-md shadow-crest-navy/20 scale-[1.02]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-crest-gold" />
              <span>{subj.name}</span>
              <span className="font-mono text-[10px] opacity-75">({subj.code})</span>
            </button>
          ))}
        </div>
      </div>

      {selectedSubject ? (
        <>
          {/* Subject Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-crest-navy rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Enrolled Class</span>
                <div className="font-bold text-slate-900 text-sm">Grade 10A (28 Students)</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Subject Average</span>
                <div className="font-bold text-slate-900 text-sm">{avgMark > 0 ? `${avgMark}%` : 'N/A'} (Honors)</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Homework Tasks</span>
                <div className="font-bold text-slate-900 text-sm">{currentHomework.length} Active Tasks</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Data Protocol</span>
                <div className="font-bold text-slate-900 text-sm">Cloudflare D1 + R2</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Homework & Learning Content Management */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-crest-navy text-base flex items-center gap-2 font-serif">
                    <FileText className="w-5 h-5 text-crest-gold" />
                    Homework & Assignments
                  </h3>
                  <p className="text-xs text-slate-500">
                    Attached worksheets route to Cloudflare R2 for zero bandwidth fees
                  </p>
                </div>

                <button
                  onClick={() => setShowHomeworkModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-crest-navy hover:bg-crest-navyDark text-white font-bold rounded-2xl text-xs transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-crest-gold" />
                  <span>Post Homework</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentHomework.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No active homework assignments for this subject yet.
                  </div>
                ) : (
                  currentHomework.map((hw) => (
                    <div key={hw.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 text-sm">{hw.title}</div>
                        <span className="font-mono text-[11px] font-bold text-crest-navy bg-crest-navy/10 px-2.5 py-0.5 rounded-full">
                          Max {hw.maxMarks} pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {hw.instructions}
                      </p>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Due: {new Date(hw.dueDate).toLocaleDateString()}
                        </span>
                        {hw.attachment && (
                          <span className="flex items-center gap-1 text-purple-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            R2 Worksheet Attached
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Assessment Marks Entry & Live Gradebook */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-crest-navy text-base flex items-center gap-2 font-serif">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Subject Marks & Gradebook
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct entry into student term records with automated percentage calculation
                  </p>
                </div>

                <button
                  onClick={() => setShowMarkModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Record Mark</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentMarks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No assessment marks recorded for this subject yet.
                  </div>
                ) : (
                  currentMarks.map((m) => {
                    const pct = Math.round((m.markObtained / m.maxMark) * 100);
                    return (
                      <div key={m.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{m.assessmentName}</div>
                          <div className="text-xs text-slate-500 italic mt-0.5">
                            "{m.teacherRemark}"
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            Learner: Ethan Parker (AIHS-2024-0419)
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-extrabold text-crest-navy font-mono">
                            {m.markObtained} <span className="text-xs text-slate-400 font-normal">/ {m.maxMark}</span>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            pct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            pct >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pct}% Grade
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-3xl text-center text-slate-500 text-sm">
          No assigned subjects found for this teacher account.
        </div>
      )}

      {/* Post Homework Modal */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-crest-navy mb-1 font-serif">
              Post Homework: {selectedSubject?.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All students enrolled in Grade 10A will receive instant notification.
            </p>

            <form onSubmit={handleCreateHomework} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Problem Set"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions / Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed guidelines for learners..."
                  value={hwInstructions}
                  onChange={(e) => setHwInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Points</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={hwMaxMarks}
                    onChange={(e) => setHwMaxMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-[11px] text-purple-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-purple-700" />
                  R2 Storage Router: $0 Egress
                </span>
                <span className="font-mono font-bold text-emerald-700">Auto-Attached</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crest-navy hover:bg-crest-navyDark text-white font-bold shadow-xs transition-colors"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Mark Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-crest-navy mb-1 font-serif">
              Record Assessment Mark: {selectedSubject?.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording mark for: Ethan Parker (AIHS-2024-0419)
            </p>

            <form onSubmit={handleSaveMark} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Test"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mark Obtained</label>
                  <input
                    type="number"
                    min="0"
                    max={maxScore}
                    required
                    value={markScore}
                    onChange={(e) => setMarkScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Live Grade Indicator */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-crest-gold" />
                  Calculated Percentage:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-crest-navy text-sm">{modalPercentage}%</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                    modalGrade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                    modalGrade === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Grade {modalGrade}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher Remark</label>
                <input
                  type="text"
                  placeholder="e.g. Solid work on theorems."
                  value={teacherRemark}
                  onChange={(e) => setTeacherRemark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-crest-navy"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition-colors"
                >
                  Save & Update Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
