import React from 'react';
import { Clock, AlertCircle, MessageSquare, User, ArrowRight } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'border-slate-700 bg-slate-800/30' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500/30 bg-emerald-500/5' },
];

const PRIORITY_COLORS = {
  LOW: 'bg-slate-700 text-slate-300',
  MEDIUM: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  HIGH: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  URGENT: 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse',
};

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'TODO': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'IN_REVIEW';
      case 'IN_REVIEW': return 'COMPLETED';
      default: return 'TODO';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl border ${col.color} backdrop-blur-sm p-4 min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-200">{col.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {colTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-600">No tasks in {col.title}</p>
                </div>
              ) : (
                colTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 rounded-xl p-3.5 transition cursor-pointer relative"
                    >
                      {/* Priority and Project badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM}`}>
                          {task.priority}
                        </span>
                        {task.project?.name && (
                          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                            {task.project.name}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition line-clamp-2 mb-1.5">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Footer: Due date & Assignee & Quick move button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <div className="flex items-center space-x-3">
                          {task.dueDate && (
                            <span className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                              <Clock className="w-3 h-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </span>
                          )}
                          {task._count?.comments > 0 && (
                            <span className="flex items-center space-x-1 text-slate-400">
                              <MessageSquare className="w-3 h-3" />
                              <span>{task._count.comments}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {task.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-300 font-bold" title={task.assignee.name}>
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-600" />
                          )}

                          {/* Quick advance status */}
                          {task.status !== 'COMPLETED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task.id, getNextStatus(task.status));
                              }}
                              title={`Advance to ${getNextStatus(task.status)}`}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded transition"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
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
        );
      })}
    </div>
  );
}
