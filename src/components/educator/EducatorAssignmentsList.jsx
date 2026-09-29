import { useState } from 'react';
import {
  getAllAssignments,
  getAssignmentCompletionCount,
  createAssignment,
} from '../../services/storageService';

const TYPE_LABELS = {
  quiz: 'Quiz',
  assignment: 'Assignment',
};

export default function EducatorAssignmentsList({ type }) {
  const assignments = getAllAssignments().filter(a => !type || a.type === type);

  if (assignments.length === 0) {
    return (
      <p className="text-sm m-0" style={{ color: 'var(--color-text-muted)' }}>
        No {type === 'quiz' ? 'quizzes' : type === 'assignment' ? 'assignments' : 'items'} assigned yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      {assignments.map(a => {
        const { completed, total } = getAssignmentCompletionCount(a.id);
        return (
          <div
            key={a.id}
            className="rounded-xl border flex flex-col"
            style={{
              gap: '8px',
              padding: '16px 18px',
              borderColor: 'var(--color-border)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-start justify-between" style={{ gap: '12px' }}>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  {TYPE_LABELS[a.type] || a.type}
                </span>
                <span className="text-[13px] font-bold text-white">{a.title}</span>
              </div>
              <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                {completed}/{total} done
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Assigned {new Date(a.createdAt).toLocaleDateString()} · Visible to all students
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AssignActions({ content, title, type, meta, onAssigned }) {
  const [assigned, setAssigned] = useState(false);

  if (!content) return null;

  function handleAssign() {
    createAssignment({ type, title, content, meta, assignedTo: 'all' });
    setAssigned(true);
    onAssigned?.();
    setTimeout(() => setAssigned(false), 3000);
  }

  return (
    <div className="flex flex-wrap items-center" style={{ gap: '12px', paddingTop: '8px' }}>
      <button type="button" onClick={handleAssign} className="btn-primary text-[13px]" style={{ padding: '10px 18px' }}>
        Assign to Class
      </button>
      {assigned && (
        <span className="text-[12px] font-semibold" style={{ color: 'var(--color-accent-emerald)' }}>
          ✓ Assigned — students can see this in Assigned Work
        </span>
      )}
    </div>
  );
}
