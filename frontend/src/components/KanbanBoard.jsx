import React from 'react';
import { Clock, MessageSquare, User, ArrowRight } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO',        title: 'To Do',       accentColor: '#4a6080', headerBg: 'rgba(74,96,128,0.06)',  border: 'rgba(74,96,128,0.2)' },
  { id: 'IN_PROGRESS', title: 'In Progress',  accentColor: '#f59e0b', headerBg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)' },
  { id: 'IN_REVIEW',   title: 'In Review',    accentColor: '#0066ff', headerBg: 'rgba(0,102,255,0.06)',  border: 'rgba(0,102,255,0.25)' },
  { id: 'COMPLETED',   title: 'Completed',    accentColor: '#00d4ff', headerBg: 'rgba(0,212,255,0.06)',  border: 'rgba(0,212,255,0.25)' },
];

const PRIORITY_STYLES = {
  LOW:    { color: '#4a6080', bg: 'rgba(74,96,128,0.12)',  border: 'rgba(74,96,128,0.25)' },
  MEDIUM: { color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.2)' },
  HIGH:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  URGENT: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
};

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const getNextStatus = (s) => ({ TODO: 'IN_PROGRESS', IN_PROGRESS: 'IN_REVIEW', IN_REVIEW: 'COMPLETED' }[s] || 'TODO');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="flex flex-col rounded-2xl min-h-[480px]"
            style={{ background: col.headerBg, border: `1px solid ${col.border}` }}>
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: col.border }}>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ background: col.accentColor, boxShadow: `0 0 6px ${col.accentColor}` }} />
                <h3 className="font-bold text-xs tracking-wider uppercase" style={{ color: col.accentColor }}>{col.title}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black"
                style={{ background: `${col.accentColor}15`, color: col.accentColor }}>
                {colTasks.length}
              </span>
            </div>

            {/* Task List */}
            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-28 flex items-center justify-center rounded-xl border border-dashed border-[#0d2040]">
                  <p className="text-[11px] text-[#4a6080]">No tasks</p>
                </div>
              ) : colTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

                return (
                  <div key={task.id} onClick={() => onTaskClick(task)}
                    className="group rounded-xl p-3.5 cursor-pointer transition-all duration-150 border border-[#0d2040] hover:border-[#00d4ff30]"
                    style={{ background: '#080c16' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(0,212,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ color: ps.color, background: ps.bg, border: `1px solid ${ps.border}` }}>
                        {task.priority}
                      </span>
                      {task.project?.name && (
                        <span className="text-[10px] text-[#4a6080] truncate max-w-[100px]">{task.project.name}</span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-[#e8f4ff] group-hover:text-[#00d4ff] transition line-clamp-2 mb-1.5">{task.title}</h4>
                    {task.description && (
                      <p className="text-[11px] text-[#4a6080] line-clamp-2 mb-2.5">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#0d2040] text-[10px] text-[#4a6080]">
                      <div className="flex items-center space-x-2.5">
                        {task.dueDate && (
                          <span className={`flex items-center space-x-1 ${isOverdue ? 'font-bold' : ''}`}
                            style={{ color: isOverdue ? '#ef4444' : '#4a6080' }}>
                            <Clock className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </span>
                        )}
                        {task._count?.comments > 0 && (
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task._count.comments}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.assignee ? (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
                            title={task.assignee.name}>
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <User className="w-3.5 h-3.5 text-[#0d2040]" />
                        )}
                        {task.status !== 'COMPLETED' && (
                          <button onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, getNextStatus(task.status)); }}
                            title={`Advance to ${getNextStatus(task.status)}`}
                            className="p-1 rounded transition text-[#4a6080] hover:text-[#00d4ff]"
                            style={{}} >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
