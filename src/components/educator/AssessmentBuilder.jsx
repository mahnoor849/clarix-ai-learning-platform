import { useState } from 'react';
import Markdown from 'react-markdown';
import { conceptOrder, concepts } from '../../data/concepts';
import { generateEducatorQuiz, isAIReady } from '../../services/aiService';
import EducatorCard from './EducatorCard';
import EducatorAssignmentsList, { AssignActions } from './EducatorAssignmentsList';

const DIFFICULTIES = ['Basic', 'Intermediate', 'Advanced'];

const FALLBACK_QUIZ = (topic, difficulty, count) => `## Generated Quiz: ${topic}
**Difficulty:** ${difficulty} · **Questions:** ${count}

**Q1.** What is the primary purpose of ${topic.toLowerCase()} in Java OOP?
A) Memory management  B) Code organization  C) Network I/O  D) File handling
**Answer:** B

**Q2.** Which keyword is most associated with ${topic.toLowerCase()}?
A) import  B) new  C) extends  D) package
**Answer:** C

**Q3.** A class acts as a ___ for creating objects.
A) compiler  B) blueprint  C) debugger  D) runtime
**Answer:** B`;

export default function AssessmentBuilder() {
  const [topic, setTopic] = useState(conceptOrder[3]);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [count, setCount] = useState(10);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listKey, setListKey] = useState(0);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const topicName = concepts[topic]?.name || topic;
      let result;
      if (isAIReady) {
        result = await generateEducatorQuiz(topicName, difficulty, count);
      } else {
        result = FALLBACK_QUIZ(topicName, difficulty, count);
      }
      setQuiz(result);
    } catch {
      setQuiz(FALLBACK_QUIZ(concepts[topic]?.name, difficulty, count));
    } finally {
      setLoading(false);
    }
  }

  const topicName = concepts[topic]?.name || topic;

  return (
    <div className="flex flex-col" style={{ gap: '40px' }}>
      <EducatorCard
        label="AI Assessment Builder"
        title="Generate Quiz"
        description="AI creates classroom-ready assessments. Assign to class when ready — students see it in Assigned Work."
      >
        <form onSubmit={handleGenerate} className="flex flex-col" style={{ gap: '20px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '16px' }}>
            <label className="flex flex-col" style={{ gap: '8px' }}>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Topic</span>
              <select value={topic} onChange={e => setTopic(e.target.value)} className="educator-select">
                {conceptOrder.map(id => (
                  <option key={id} value={id}>{concepts[id].name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col" style={{ gap: '8px' }}>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Difficulty</span>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="educator-select">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="flex flex-col" style={{ gap: '8px' }}>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Questions</span>
              <input type="number" min={5} max={20} value={count} onChange={e => setCount(Number(e.target.value))} className="educator-input" />
            </label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-[13px] self-start" style={{ padding: '10px 20px' }}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </form>

        {quiz && (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div className="educator-quiz-output markdown-content animate-fade-in rounded-xl border" style={{ padding: '24px', borderColor: 'var(--color-border)' }}>
              <Markdown>{quiz}</Markdown>
            </div>
            <AssignActions
              content={quiz}
              title={`${topicName} Quiz (${difficulty})`}
              type="quiz"
              meta={{ topic: topicName, conceptId: topic, difficulty, questionCount: count }}
              onAssigned={() => setListKey(k => k + 1)}
            />
          </div>
        )}
      </EducatorCard>

      <EducatorCard label="Assigned Quizzes" title="Class Quiz Queue">
        <EducatorAssignmentsList key={listKey} type="quiz" />
      </EducatorCard>
    </div>
  );
}
