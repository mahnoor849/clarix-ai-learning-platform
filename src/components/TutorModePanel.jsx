import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { generateTutorAction, generateTutorChat, isGeminiReady } from '../services/geminiService';
import { concepts } from '../data/concepts';
import { saveLearnerProfile, logInteraction } from '../services/storageService';
import { highlightJava } from '../utils/highlighter';

const QUICK_ACTIONS = [
  { id: 'explain_again', label: 'Explain Again', icon: '🔄' },
  { id: 'simplify', label: 'Simplify', icon: '💡' },
  { id: 'give_example', label: 'Give Example', icon: '📝' },
  { id: 'quiz_me', label: 'Quiz Me', icon: '❓' },
  { id: 'practice', label: 'Practice Question', icon: '💪' },
];

const FALLBACK_RESPONSES = {
  explain_again: 'Let me explain this differently. Think of a class as a blueprint — like an architectural plan for a house. The `new` keyword builds the actual house (object) from that plan.\n\n```java\nclass House {\n    String color;\n    void paint(String c) { color = c; }\n}\nHouse myHouse = new House();\nmyHouse.paint("blue");\n```\n\nDoes this analogy help clarify the concept?',
  simplify: 'Here\'s the simplest version:\n\n1. A **class** = a recipe\n2. An **object** = the actual dish you cook\n3. `new` = start cooking\n\nThat\'s it! Everything else builds on these three ideas.',
  give_example: '**Example 1 — Student Records:**\n```java\nclass Student {\n    String name;\n    int grade;\n}\nStudent s = new Student();\ns.name = "Ali";\n```\n\n**Example 2 — Bank Account:**\n```java\nclass Account {\n    double balance = 0;\n    void deposit(double amt) { balance += amt; }\n}\n```',
  quiz_me: '**Q1:** What keyword creates an object?\nA) create  B) new ✓  C) make  D) object\n\n**Q2:** A class is a ___?\nA) Object  B) Blueprint ✓  C) Method  D) Variable\n\n**Q3:** Each object has ___ copy of fields?\nA) Shared  B) Its own ✓  C) No  D) Global',
  practice: '**Challenge:** Create a `Car` class with `brand` and `speed` fields. Add a `accelerate(int amount)` method.\n\n**Starter:**\n```java\nclass Car {\n    // Your code here\n}\n```\n\n**Hint 1:** Declare fields as instance variables\n**Hint 2:** speed += amount in accelerate()',
};

export default function TutorModePanel({ profile, conceptId, lessonContext, onAgentStateChange, onProfileUpdate }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hi ${profile.name}! I'm your AI tutor for **${concepts[conceptId]?.name}**. Use the quick actions below or ask me anything.` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([{
      role: 'ai',
      content: `Now studying **${concepts[conceptId]?.name}**. How can I help?`,
    }]);
  }, [conceptId]);

  async function handleAction(actionId) {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    setMessages(prev => [...prev, { role: 'user', content: `[${action.label}]` }]);
    setLoading(true);
    onAgentStateChange('Tutoring');

    try {
      let response;
      if (isGeminiReady) {
        onAgentStateChange('Thinking...');
        response = await generateTutorAction(profile, concepts[conceptId].name, actionId, lessonContext);
      } else {
        response = FALLBACK_RESPONSES[actionId] || FALLBACK_RESPONSES.explain_again;
      }
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      const updated = { ...profile, tutor_sessions: (profile.tutor_sessions || 0) + 1 };
      saveLearnerProfile(updated);
      onProfileUpdate?.(updated);
      logInteraction({ learner_id: profile.learner_id, concept_id: conceptId, question_id: 'TUTOR_ACTION',
        learner_answer: actionId, is_correct: true, confidence_before_answer: 3, response_time_seconds: 0,
        attempt_number: 1, hints_requested: 0, detected_misconception_id: null,
        mastery_before: profile.mastery[conceptId] || 0, mastery_after: profile.mastery[conceptId] || 0,
        recommended_next_action: actionId });
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: FALLBACK_RESPONSES[actionId] || 'Let me try explaining that differently...' }]);
    } finally {
      setLoading(false);
      onAgentStateChange('Teaching');
    }
  }

  async function handleChat(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    onAgentStateChange('Thinking...');

    try {
      let response;
      if (isGeminiReady) {
        response = await generateTutorChat(profile, concepts[conceptId].name, userMsg, messages);
      } else {
        response = `Great question about "${concepts[conceptId]?.short}"! ${userMsg.includes('?') ? 'The key idea is understanding how classes define structure and objects hold actual data. Try running the code example in the lesson panel.' : 'I\'d suggest reviewing the concept map and trying the knowledge check to test your understanding.'}`;
      }
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      const updated = { ...profile, tutor_sessions: (profile.tutor_sessions || 0) + 1 };
      saveLearnerProfile(updated);
      onProfileUpdate?.(updated);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'I\'m having trouble connecting. Try one of the quick action buttons above!' }]);
    } finally {
      setLoading(false);
      onAgentStateChange('Teaching');
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: '#0A0A0A' }}>
      <div
        className="flex-shrink-0 border-b flex flex-col"
        style={{ padding: '24px 20px', gap: '18px', borderColor: 'var(--color-border)' }}
      >
        <span className="section-label" style={{ marginBottom: 0 }}>AI Tutor</span>

        <div className="flex items-center" style={{ gap: '10px' }}>
          <div className="w-2 h-2 rounded-full bg-[#5E6AD2] shadow-[0_0_8px_#5E6AD2]" />
          <span className="text-[12px] font-semibold text-white truncate">{concepts[conceptId]?.short}</span>
          <span
            className="ml-auto text-[9px] font-bold uppercase tracking-wider rounded-full"
            style={{ padding: '4px 10px', background: 'rgba(52,211,153,0.1)', color: 'var(--color-accent-emerald)' }}
          >
            Live
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: '10px' }}>
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.id}
              onClick={() => handleAction(a.id)}
              disabled={loading}
              className="tutor-action-btn w-full justify-start"
              title={a.label}
              style={{ padding: '13px 16px', gap: '12px' }}
            >
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '20px' }}>
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`tutor-msg ${msg.role}`}
              style={{ padding: '16px 18px', borderRadius: '14px', maxWidth: '92%' }}
            >
              {msg.role === 'ai' ? (
                <div className="markdown-content tutor-msg-content">
                  <Markdown components={{
                    code({ className, children, ...props }) {
                      const codeText = String(children).replace(/\n$/, '');
                      if (!className) return <code className="bg-white/5 rounded px-1" {...props}>{children}</code>;
                      return (
                        <div className="code-editor my-2 text-[10px]">
                          <pre className="p-2"><code dangerouslySetInnerHTML={{ __html: highlightJava(codeText) }} /></pre>
                        </div>
                      );
                    },
                  }}>{msg.content}</Markdown>
                </div>
              ) : (
                <p className="tutor-msg-content text-white m-0">{msg.content}</p>
              )}
            </div>
          ))}
          {loading && (
            <div className="tutor-msg ai" style={{ padding: '16px 18px', borderRadius: '14px' }}>
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div className="flex gap-1">
                  <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: '0.2s' }} /><span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleChat}
        className="flex-shrink-0 border-t"
        style={{ padding: '18px 20px', borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="flex items-center" style={{ gap: '12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="tutor-chat-input flex-1"
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading} className="btn-primary tutor-send-btn">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
