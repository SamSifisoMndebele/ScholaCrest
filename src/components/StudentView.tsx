import React, { useState } from 'react';
import type { School, AppUser, Subject, HomeworkAssignment, TermReportCard } from '../types';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Printer, 
  CheckCircle2, 
  Download,
  Clock
} from 'lucide-react';

interface StudentViewProps {
  school: School;
  student: AppUser;
  subjects: Subject[];
  homework: HomeworkAssignment[];
  reportCard: TermReportCard;
  onOpenReportCard: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  school,
  student,
  subjects,
  homework,
  reportCard,
  onOpenReportCard,
}) => {
  const [activeTab, setActiveTab] = useState<'homework' | 'subjects' | 'results'>('homework');

  return (
    <div className="space-y-6">
      {/* Student Welcome & Profile Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={student.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{student.fullName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {student.admissionNumber}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Enrolled: Grade 10A (Sciences) • {school.name}
            </p>
          </div>
        </div>

        {/* Action Button: Official Report Card */}
        <button
          onClick={onOpenReportCard}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/25"
        >
          <Award className="w-4 h-4" />
          <span>View Official Term Report Card</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'homework' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Homework & Assignments ({homework.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'subjects' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Enrolled Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'results' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Term Marks & Progress
        </button>
      </div>

      {/* Tab 1: Homework */}
      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homework.map((hw) => {
            const subject = subjects.find(s => s.id === hw.subjectId);
            return (
              <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {subject?.name || 'Subject'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{hw.title}</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {hw.maxMarks} pts
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {hw.instructions}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </div>

                  {hw.attachment && (
                    <button className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold text-xs bg-purple-50 px-2.5 py-1 rounded-lg">
                      <Download className="w-3.5 h-3.5" />
                      Download Worksheet (R2)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Enrolled Subjects */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {s.code}
                </span>
                <span className="text-xs text-slate-400 font-mono">Grade {s.gradeLevel}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Faculty of Science & Core Studies</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Modules: Active</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Enrolled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Term Marks Overview */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Academic Term Performance</h3>
              <p className="text-xs text-slate-500">{reportCard.termName}</p>
            </div>

            <button
              onClick={onOpenReportCard}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Official Report Card
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-center">%</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportCard.subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.subjectName}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">{sub.mark} / {sub.maxMark}</td>
                    <td className="py-3 px-3 text-center font-bold">{sub.percentage}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-100 text-blue-800">
                        {sub.gradeSymbol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic text-[11px]">{sub.teacherRemark}</td>
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
