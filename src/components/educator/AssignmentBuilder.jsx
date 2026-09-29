import { useState } from 'react';
import Markdown from 'react-markdown';
import { getWeakConcepts } from '../../utils/educatorAnalytics';
import { generateAdaptiveAssignment, isAIReady } from '../../services/aiService';
import EducatorCard from './EducatorCard';
import EducatorAssignmentsList, { AssignActions } from './EducatorAssignmentsList';

const FALLBACK_ASSIGNMENT = (concepts) => `## Adaptive Assignment
**Target weak concepts:** ${concepts.join(', ')}

### Section A — Diagnostic Review (5 questions)
Focus on prerequisite gaps before advancing.

### Section B — Scaffolded Practice (3 coding tasks)
Progressive difficulty with hints available on request.

### Section C — Reflection
Students explain one misconception they corrected this week.

*Estimated completion: 25–35 minutes · Auto-adapts hint level per student.*`;

export default function AssignmentBuilder({ profiles }) {
  const weak = getWeakConcepts(profiles).map(c => c.short);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listKey, setListKey] = useState(0);

  async function handleGenerate() {
    setLoading(true);
    try {
      let result;
      if (isAIReady) {
        result = await generateAdaptiveAssignment(weak);
      } else {
        result = FALLBACK_ASSIGNMENT(weak.length ? weak : ['Inheritance', 'Polymorphism']);
      }
      setAssignment(result);
    } catch {
      setAssignment(FALLBACK_ASSIGNMENT(weak.length ? weak : ['Inheritance', 'Polymorphism']));
    } finally {
      setLoading(false);
    }
  }

  const title = weak.length
    ? `Adaptive Assignment: ${weak.slice(0, 2).join(', ')}`
    : 'Adaptive Class Assignment';

  return (
    <div className="flex flex-col" style={{ gap: '40px' }}>
      <EducatorCard
        label="Assignment Creation"
        title="Generate Adaptive Assignment"
        description={`AI builds questions targeting class weak spots: ${weak.length ? weak.join(', ') : 'analyzing...'}. Assign when ready.`}
      >
        <button onClick={handleGenerate} disabled={loading} className="btn-primary text-[13px] self-start" style={{ padding: '10px 20px' }}>
          {loading ? 'Creating Assignment...' : 'Generate Adaptive Assignment'}
        </button>

        {assignment && (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div className="educator-quiz-output markdown-content animate-fade-in rounded-xl border" style={{ padding: '24px', borderColor: 'var(--color-border)' }}>
              <Markdown>{assignment}</Markdown>
            </div>
            <AssignActions
              content={assignment}
              title={title}
              type="assignment"
              meta={{ weakConcepts: weak }}
              onAssigned={() => setListKey(k => k + 1)}
            />
          </div>
        )}
      </EducatorCard>

      <EducatorCard label="Assigned Work" title="Class Assignment Queue">
        <EducatorAssignmentsList key={listKey} type="assignment" />
      </EducatorCard>
    </div>
  );
}
