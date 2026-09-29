import { useState } from 'react';

export default function KnowledgeCheck({ question, options, correctAnswer, onComplete, hint }) {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const hints = [
    hint || 'Think about the core definition of this concept.',
    'Eliminate options that contradict basic OOP principles.',
    `The correct answer relates to: ${correctAnswer.slice(0, 20)}...`,
  ];

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    const isCorrect = selected === correctAnswer;
    onComplete?.(isCorrect);
  }

  return (
    <div className="knowledge-check">
      <div className="knowledge-check-header">
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: 'rgba(94,106,210,0.15)', color: 'var(--color-primary-light)' }}>?</div>
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary-light)' }}>Knowledge Check</span>
      </div>

      <p className="knowledge-check-question">{question}</p>

      <div className="knowledge-check-options">
        {options.map((opt, i) => {
          let cls = 'option-btn';
          if (submitted) {
            if (opt === correctAnswer) cls += ' correct';
            else if (opt === selected) cls += ' incorrect';
          } else if (selected === opt) cls += ' selected';
          return (
            <button key={i} onClick={() => !submitted && setSelected(opt)} disabled={submitted} className={cls}>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <div className="knowledge-check-actions">
          <button onClick={handleSubmit} disabled={!selected} className="btn-primary text-[12px] py-2 px-5">Check Answer</button>
          <button onClick={() => { setShowHint(true); setHintLevel(h => Math.min(h + 1, 3)); }} className="btn-ghost text-[12px]">
            💡 Hint {hintLevel > 0 ? `(${hintLevel}/3)` : ''}
          </button>
        </div>
      )}

      {showHint && hintLevel > 0 && (
        <div className="knowledge-check-feedback" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p className="text-[12px]" style={{ color: 'var(--color-accent-amber)' }}>{hints[hintLevel - 1]}</p>
        </div>
      )}

      {submitted && (
        <div
          className={`knowledge-check-feedback ${selected === correctAnswer ? 'border-[rgba(52,211,153,0.3)]' : 'border-[rgba(251,113,133,0.3)]'}`}
          style={{ background: selected === correctAnswer ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)', border: '1px solid' }}
        >
          <p className="text-[13px] font-semibold" style={{ color: selected === correctAnswer ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)' }}>
            {selected === correctAnswer ? '✓ Correct! Great understanding.' : `✗ Not quite. The answer is: ${correctAnswer}`}
          </p>
        </div>
      )}
    </div>
  );
}
