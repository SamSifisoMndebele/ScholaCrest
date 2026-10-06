import React, { useState } from 'react';
import type { School, Subject, HomeworkAssignment, SubjectAssessmentMark, AppUser } from '../types';
import { 
  BookOpen, 
  PlusCircle, 
  CheckCircle2, 
  FileText, 
  Award
} from 'lucide-react';

interface TeacherViewProps {
  school: School;
  teacher: AppUser;
  subjects: Subject[];
  homework: HomeworkAssignment[];
  marks: SubjectAssessmentMark[];
  onAddHomework: (hw: HomeworkAssignment) => void;
  onAddOrUpdateMark: (mark: SubjectAssessmentMark) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  school,
  teacher,
  subjects,
  homework,
  marks,
  onAddHomework,
  onAddOrUpdateMark,
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
  const [hwDueDate, setHwDueDate] = useState('2026-02-25');
  const [hwMaxMarks, setHwMaxMarks] = useState(50);

  // Grade Entry State
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [assessmentName, setAssessmentName] = useState('Unit Test 2');
  const [markScore, setMarkScore] = useState(85);
  const [maxScore, setMaxScore] = useState(100);
  const [teacherRemark, setTeacherRemark] = useState('Consistent improvement.');

  const selectedSubject = assignedSubjects.find(s => s.id === selectedSubjectId);
  const currentHomework = homework.filter(h => h.subjectId === selectedSubjectId);
  const currentMarks = marks.filter(m => m.subjectId === selectedSubjectId);

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
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile & Scope Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-600/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{teacher.fullName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold font-mono">
                Teacher Access Scoped
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Access is strictly restricted to your assigned subjects. You cannot view or modify grades for other teachers.
            </p>
          </div>
        </div>

        {/* Assigned Subjects Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {assignedSubjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedSubjectId === subj.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{subj.name}</span>
              <span className="font-mono text-[10px] opacity-80">({subj.code})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Teacher Work Area */}
      {selectedSubject ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Homework & Learning Content Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Active Homework & Tasks
                </h3>
                <p className="text-xs text-slate-500">
                  Attachments route to Cloudflare R2 for zero bandwidth fees
                </p>
              </div>

              <button
                onClick={() => setShowHomeworkModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Post Homework
              </button>
            </div>

            <div className="space-y-3">
              {currentHomework.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active homework assignments for this subject yet.
                </div>
              ) : (
                currentHomework.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900 text-sm">{hw.title}</div>
                      <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        Max {hw.maxMarks} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {hw.instructions}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      {hw.attachment && (
                        <span className="flex items-center gap-1 text-purple-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          R2 Attached
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Assessment Marks Entry & Live Gradebook */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Subject Marks & Gradebook
                </h3>
                <p className="text-xs text-slate-500">
                  Direct entry into student term records with automated percentages
                </p>
              </div>

              <button
                onClick={() => setShowMarkModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Record Mark
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
                    <div key={m.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{m.assessmentName}</div>
                        <div className="text-xs text-slate-500 italic mt-0.5">
                          "{m.teacherRemark}"
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Student: Ethan Parker (AIHS-2024-0419)
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-extrabold text-blue-900 font-mono">
                          {m.markObtained} <span className="text-xs text-slate-400 font-normal">/ {m.maxMark}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
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
      ) : (
        <div className="bg-white p-8 rounded-2xl text-center text-slate-500 text-sm">
          No assigned subjects found for this teacher account.
        </div>
      )}

      {/* Post Homework Modal */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Post Homework: {selectedSubject?.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Students enrolled in this subject will receive instant dashboard access.
            </p>

            <form onSubmit={handleCreateHomework} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Problem Set"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Enter Assessment Mark: {selectedSubject?.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording mark for: Ethan Parker (AIHS-2024-0419)
            </p>

            <form onSubmit={handleSaveMark} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Test"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher Remark</label>
                <input
                  type="text"
                  placeholder="e.g. Solid work on theorems."
                  value={teacherRemark}
                  onChange={(e) => setTeacherRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  Record Mark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
