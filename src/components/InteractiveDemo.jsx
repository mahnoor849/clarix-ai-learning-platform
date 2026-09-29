import { useState, useEffect } from 'react';

const DEMO_MESSAGES = [
  { role: 'ai', text: 'Welcome! I noticed you struggled with **inheritance** last session. Let me explain it differently using a family tree analogy.' },
  { role: 'user', text: 'Why does Java use extends instead of implements here?' },
  { role: 'ai', text: '`extends` is for **class inheritance** (is-a relationship). `implements` is for **interfaces** (can-do relationship).\n\n```java\nclass Dog extends Animal { }  // Dog IS an Animal\ndog implements Runnable { }  // Dog CAN run\n```' },
  { role: 'system', text: '⚡ Adaptation: Difficulty lowered → Simplified mode activated' },
];

const ACTIONS = ['Explain Again', 'Simplify', 'Give Example', 'Quiz Me'];

export default function InteractiveDemo() {
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    if (visibleMsgs < DEMO_MESSAGES.length) {
      const t = setTimeout(() => setVisibleMsgs(v => v + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [visibleMsgs]);

  return (
    <div className="interactive-demo w-full max-w-[900px] mx-auto">
      <div className="demo-window w-full">
        <div className="demo-titlebar">
          <div className="code-editor-dots">
            <span style={{ background: '#FF5F57' }} /><span style={{ background: '#FEBC2E' }} /><span style={{ background: '#28C840' }} />
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Clarix — Live Tutor Session</span>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-emerald)] animate-pulse" />
            <span className="text-[10px] font-bold" style={{ color: 'var(--color-accent-emerald)' }}>ADAPTING</span>
          </div>
        </div>
        <div className="demo-body">
          <div className="demo-sidebar">
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Curriculum</div>
            <div className="demo-module-list">
              {['Classes', 'Encapsulation', 'Inheritance', 'Overloading', 'Overriding', 'Polymorphism'].map((m, i) => (
                <div key={m} className={`demo-module ${i === 2 ? 'active' : ''}`}>
                  <span>{m}</span>
                  <span className="text-[9px]">{[72, 85, 34, 0, 0, 0][i]}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="demo-chat">
            {DEMO_MESSAGES.slice(0, visibleMsgs).map((msg, i) => (
              <div key={i} className={`demo-msg ${msg.role} animate-fade-in`}>
                {msg.role === 'system' ? (
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--color-accent-amber)' }}>{msg.text}</span>
                ) : (
                  <div className="text-[12px] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatDemo(msg.text) }} />
                )}
              </div>
            ))}
            {visibleMsgs >= DEMO_MESSAGES.length && (
              <div className="demo-actions animate-fade-in">
                {ACTIONS.map(a => (
                  <button key={a} onClick={() => setActiveAction(a)} className={`demo-action-btn ${activeAction === a ? 'active' : ''}`}>{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDemo(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:4px;font-size:11px">$1</code>')
    .replace(/```java\n([\s\S]*?)```/g, '<pre style="background:#000;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;margin:8px 0;font-size:11px;overflow-x:auto"><code>$1</code></pre>')
    .replace(/\n/g, '<br/>');
}
