import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  getAssignmentsForLearner,
  markAssignmentComplete,
  isAssignmentComplete,
} from '../services/storageService';

export default function AssignedWorkPanel({ profile, onAgentStateChange, onComplete }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  function refresh() {
    const list = getAssignmentsForLearner(profile.learner_id);
    setAssignments(list);
    if (selectedId && !list.find(a => a.id === selectedId)) {
      setSelectedId(list[0]?.id || null);
    }
  }

  useEffect(() => {
    refresh();
    onAgentStateChange?.('Idle');
  }, [profile.learner_id]);

  const selected = assignments.find(a => a.id === selectedId);
  const pendingCount = assignments.filter(a => !isAssignmentComplete(a.id, profile.learner_id)).length;

  function handleComplete(assignmentId) {
    markAssignmentComplete(assignmentId, profile.learner_id);
    refresh();
    onComplete?.();
    onAgentStateChange?.('Updating Profile');
    setTimeout(() => onAgentStateChange?.('Teaching'), 800);
  }

  if (assignments.length === 0) {
    return (
      <div className="lesson-stack">
        <div className="lesson-section">
          <span className="section-label">Assigned Work</span>
          <h2 className="text-xl font-bold text-white m-0">Nothing assigned yet</h2>
          <p className="text-sm m-0 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            When your educator assigns a quiz or assignment, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  if (selected) {
    const done = isAssignmentComplete(selected.id, profile.learner_id);
    return (
      <div className="lesson-stack">
        <div className="lesson-section">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="btn-ghost text-xs"
            style={{ padding: '6px 0', alignSelf: 'flex-start' }}
          >
            ← Back to list
          </button>
          <span className="section-label">
            {selected.type === 'quiz' ? 'Teacher Quiz' : 'Teacher Assignment'}
          </span>
          <h2 className="text-xl font-bold text-white m-0">{selected.title}</h2>
          <p className="text-[11px] m-0" style={{ color: 'var(--color-text-muted)' }}>
            Assigned {new Date(selected.createdAt).toLocaleDateString()}
            {done && (
              <span style={{ color: 'var(--color-accent-emerald)', marginLeft: '12px' }}>· Completed</span>
            )}
          </p>
        </div>

        <div
          className="markdown-content rounded-xl border"
          style={{
            padding: '28px 32px',
            borderColor: 'var(--color-border)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <Markdown>{selected.content}</Markdown>
        </div>

        {!done && (
          <button
            type="button"
            onClick={() => handleComplete(selected.id)}
            className="btn-primary text-sm"
            style={{ padding: '12px 24px', alignSelf: 'flex-start' }}
          >
            Mark as Complete
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="lesson-stack">
      <div className="lesson-section">
        <span className="section-label">Assigned Work</span>
        <h2 className="text-xl font-bold text-white m-0">From your educator</h2>
        <p className="text-sm m-0 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {pendingCount > 0
            ? `You have ${pendingCount} item${pendingCount > 1 ? 's' : ''} to complete.`
            : 'All assigned work is complete.'}
        </p>
      </div>

      <div className="flex flex-col" style={{ gap: '14px' }}>
        {assignments.map(a => {
          const done = isAssignmentComplete(a.id, profile.learner_id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedId(a.id)}
              className="glass-card w-full text-left flex items-center transition-all"
              style={{ gap: '16px', padding: '20px 22px' }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0 text-lg rounded-xl border"
                style={{
                  width: '44px',
                  height: '44px',
                  borderColor: done ? 'rgba(52,211,153,0.2)' : 'var(--color-border)',
                  background: done ? 'rgba(52,211,153,0.08)' : 'rgba(94,106,210,0.08)',
                }}
              >
                {done ? '✓' : a.type === 'quiz' ? '✎' : '☰'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap" style={{ gap: '8px', marginBottom: '6px' }}>
                  <span className="font-bold text-white text-sm">{a.title}</span>
                  {done ? (
                    <span className="badge badge-success text-[9px]">Done</span>
                  ) : (
                    <span className="badge badge-warning text-[9px]">Pending</span>
                  )}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {a.type === 'quiz' ? 'Quiz' : 'Assignment'} · {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <svg className="w-5 h-5 flex-shrink-0 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
