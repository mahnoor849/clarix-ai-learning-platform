import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { concepts } from '../data/concepts';
import { generateTeaching, isGeminiReady } from '../services/geminiService';
import { getTeachingAction } from '../engine/adaptationEngine';
import { highlightJava } from '../utils/highlighter';
import CodePlayground from './CodePlayground';
import ConceptMap from './ConceptMap';
import ProgressCheckpoints from './ProgressCheckpoints';
import KnowledgeCheck from './KnowledgeCheck';

const KNOWLEDGE_CHECKS = {
  C001: { question: 'What keyword is used to create a new object in Java?', options: ['create', 'new', 'make', 'instance'], answer: 'new', hint: 'It\'s a 3-letter keyword that allocates memory.' },
  C002: { question: 'Which access modifier hides a field from outside the class?', options: ['public', 'protected', 'private', 'default'], answer: 'private', hint: 'Think about data hiding — the most restrictive modifier.' },
  C003: { question: 'What keyword does a subclass use to inherit from a parent?', options: ['implements', 'inherits', 'extends', 'super'], answer: 'extends', hint: 'This keyword establishes an is-a relationship.' },
  C004: { question: 'Method overloading means having methods with the same ___ but different parameters.', options: ['return type', 'name', 'access modifier', 'class'], answer: 'name', hint: 'The methods share something — what identifies them as the same operation?' },
  C005: { question: 'Method overriding requires the same method signature in a ___ class.', options: ['parent', 'child', 'static', 'abstract'], answer: 'child', hint: 'Which class redefines the parent\'s behavior?' },
  C006: { question: 'Polymorphism allows a parent reference to hold a ___ object.', options: ['parent', 'child', 'static', 'private'], answer: 'child', hint: 'One interface, many forms — which type is substituted?' },
};

const DEFAULT_CODE = {
  C001: 'class Student {\n    String name;\n    int age;\n    \n    void introduce() {\n        System.out.println("I am " + name);\n    }\n}\n\nStudent s = new Student();\ns.name = "Ali";\ns.introduce();',
  C002: 'class BankAccount {\n    private double balance;\n    \n    public void deposit(double amount) {\n        balance += amount;\n    }\n    \n    public double getBalance() {\n        return balance;\n    }\n}\n\nBankAccount acc = new BankAccount();\nacc.deposit(100);\nSystem.out.println(acc.getBalance());',
  C003: 'class Animal {\n    void speak() { System.out.println("..."); }\n}\nclass Dog extends Animal {\n    void speak() { System.out.println("Woof!"); }\n}\n\nDog d = new Dog();\nd.speak();',
  C004: 'class Calculator {\n    int add(int a, int b) { return a + b; }\n    double add(double a, double b) { return a + b; }\n}\n\nCalculator calc = new Calculator();\nSystem.out.println(calc.add(2, 3));\nSystem.out.println(calc.add(2.5, 3.5));',
  C005: 'class Shape {\n    void draw() { System.out.println("Drawing shape"); }\n}\nclass Circle extends Shape {\n  @Override\n    void draw() { System.out.println("Drawing circle"); }\n}\n\nShape s = new Circle();\ns.draw();',
  C006: 'class Vehicle {\n    void move() { System.out.println("Moving"); }\n}\nclass Car extends Vehicle {\n    void move() { System.out.println("Driving"); }\n}\n\nVehicle v = new Car();\nv.move();',
};

export default function TeachingPanel({ profile, conceptId, onAgentStateChange, onStartAssessment, onLessonContextChange }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [teachingMode, setTeachingMode] = useState('');
  const [isAIContent, setIsAIContent] = useState(false);
  const [checkpoints, setCheckpoints] = useState([]);
  const [codeRan, setCodeRan] = useState(false);

  const concept = concepts[conceptId];
  const mastery = profile?.mastery[conceptId] || 0;
  const kc = KNOWLEDGE_CHECKS[conceptId];

  useEffect(() => {
    if (conceptId && profile) {
      setCheckpoints([]);
      setCodeRan(false);
      loadTeaching();
    }
  }, [conceptId, profile?.learner_id]);

  useEffect(() => {
    onLessonContextChange?.(content.slice(0, 500));
  }, [content]);

  async function loadTeaching() {
    setLoading(true);
    onAgentStateChange('Diagnosing');
    const confidence = getConfidenceLevel(profile);
    const action = getTeachingAction(mastery, confidence, profile);
    setTeachingMode(action.action);
    onAgentStateChange('Teaching');

    if (isGeminiReady) {
      try {
        onAgentStateChange('Thinking...');
        const response = await generateTeaching(profile, conceptId, concept.name, mastery, confidence, action.action);
        setContent(response);
        setIsAIContent(true);
      } catch {
        setContent(concept.fallbackContent);
        setIsAIContent(false);
      }
    } else {
      setContent(concept.fallbackContent);
      setIsAIContent(false);
    }
    onAgentStateChange('Teaching');
    setLoading(false);
    setCheckpoints(['read']);
  }

  function handleKnowledgeCheck(isCorrect) {
    if (!checkpoints.includes('check')) {
      setCheckpoints(prev => [...prev, 'check']);
    }
  }

  function handleCodeRun() {
    setCodeRan(true);
    if (!checkpoints.includes('code')) {
      setCheckpoints(prev => [...prev, 'code']);
    }
  }

  if (!concept) return null;

  return (
    <div className="lesson-stack animate-fade-in">
      <ProgressCheckpoints completed={checkpoints} />
      <ConceptMap conceptId={conceptId} mastery={profile.mastery} />

      <div className="lesson-section">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: 'none' }}>{concept.difficulty}</span>
          <span className="adaptation-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-emerald)] animate-pulse" />
            {teachingMode || 'Adapting...'}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{concept.name}</h2>
        <div className="flex items-center gap-4 text-xs font-medium flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
          <span>Mastery: {Math.round(mastery * 100)}%</span>
          <span>·</span>
          <span>Mode: {teachingMode || 'Loading'}</span>
          {mastery < 0.4 && <span className="badge badge-warning text-[9px]">Extra hints enabled</span>}
        </div>
      </div>

      <div className="lesson-section">
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-[rgba(255,255,255,0.03)] rounded-md animate-pulse" />
            <div className="h-4 w-full bg-[rgba(255,255,255,0.03)] rounded-md animate-pulse" />
            <div className="h-4 w-5/6 bg-[rgba(255,255,255,0.03)] rounded-md animate-pulse" />
            <div className="h-40 w-full mt-6 bg-[rgba(255,255,255,0.03)] rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="markdown-content">
            <Markdown components={{
              code({ className, children, ...props }) {
                const codeText = String(children).replace(/\n$/, '');
                if (!className) return <code {...props}>{children}</code>;
                const highlighted = highlightJava(codeText);
                return (
                  <div className="code-editor">
                    <div className="code-editor-header">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Java Example</span>
                    </div>
                    <pre><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
                  </div>
                );
              },
            }}>{content}</Markdown>

            {isAIContent && (
              <div className="mt-6 flex items-center gap-3 p-3 rounded-xl text-[12px]" style={{ background: 'rgba(94, 106, 210, 0.05)', border: '1px solid rgba(94, 106, 210, 0.15)' }}>
                <span style={{ color: 'var(--color-primary-light)' }}>⚡ Dynamically adapted to your learning profile</span>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && (
        <>
          <div className="lesson-section">
            <CodePlayground
              initialCode={DEFAULT_CODE[conceptId] || DEFAULT_CODE.C001}
              title="Interactive Code Lab"
              onRun={handleCodeRun}
            />
          </div>

          {kc && (
            <div className="lesson-section">
              <KnowledgeCheck
                question={kc.question}
                options={kc.options}
                correctAnswer={kc.answer}
                hint={kc.hint}
                onComplete={handleKnowledgeCheck}
              />
            </div>
          )}

          {mastery < 0.5 && (
            <div className="lesson-section">
              <div className="adaptive-hint p-4 rounded-xl animate-fade-in" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span>💡</span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--color-accent-amber)' }}>Adaptive Hint</span>
                </div>
                <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Your mastery is below 50% — I've enabled extra hints and simplified explanations. Use the AI Tutor panel on the right for more help.
                </p>
              </div>
            </div>
          )}

          <div className="lesson-section">
            <div className="flex gap-4 pt-2 border-t flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => { setCheckpoints(prev => [...new Set([...prev, 'assess'])]); onStartAssessment(); }} className="btn-primary py-2.5 px-5 text-[13px]">
                Begin Assessment →
              </button>
              <button onClick={loadTeaching} className="btn-secondary py-2.5 px-5 text-[13px]">Refresh Lesson</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getConfidenceLevel(profile) {
  if (profile.confidence === 'High') return 5;
  if (profile.confidence === 'Medium') return 3;
  if (profile.confidence === 'Low') return 2;
  return 3;
}
