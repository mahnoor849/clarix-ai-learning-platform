import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { questionBank } from '../data/questions';
import { concepts } from '../data/concepts';
import { detectMisconceptionFromOption, detectMisconception } from '../data/misconceptions';
import { getQuestionDifficulty, calculateMasteryChange } from '../engine/adaptationEngine';
import { evaluateShortAnswer, isGeminiReady, isDirectAnswerRequest } from '../services/geminiService';
import { logInteraction, updateMastery, saveLearnerProfile } from '../services/storageService';
import { highlightJava } from '../utils/highlighter';

export default function AssessmentPanel({ profile, conceptId, onAgentStateChange, onProfileUpdate, onBackToTeaching }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [showConfidence, setShowConfidence] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [misconception, setMisconception] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const startTimeRef = useRef(Date.now());
  const [directAnswerWarning, setDirectAnswerWarning] = useState('');

  const mastery = profile?.mastery[conceptId] || 0;

  useEffect(() => { selectNextQuestion(); }, [conceptId]);

  function selectNextQuestion() {
    const difficulty = getQuestionDifficulty(mastery);
    const available = questionBank.filter(q => q.concept === conceptId && !answeredQuestions.has(q.id));
    let question = available.find(q => q.difficulty === difficulty);
    if (!question) question = available[0];
    if (!question) question = questionBank.find(q => q.concept === conceptId);

    setCurrentQuestion(question);
    setSelectedOption(null); setTextAnswer(''); setSubmitted(false);
    setIsCorrect(null); setHintsRevealed(0); setShowAnswer(false);
    setShowConfidence(false); setFeedback(''); setMisconception(null);
    setEvaluatingAnswer(false); setDirectAnswerWarning('');
    startTimeRef.current = Date.now();
    onAgentStateChange('Assessing');
  }

  async function handleSubmit() {
    if (!currentQuestion) return;
    const responseTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correct = false;
    let detectedMisc = null;

    onAgentStateChange('Evaluating');

    if (currentQuestion.type === 'MCQ' || currentQuestion.type === 'True/False') {
      correct = selectedOption === currentQuestion.answer;
      if (!correct) detectedMisc = detectMisconceptionFromOption(conceptId, selectedOption, currentQuestion.answer);
    } else {
      setEvaluatingAnswer(true);
      onAgentStateChange('Thinking...');
      if (isDirectAnswerRequest(textAnswer)) {
        setDirectAnswerWarning("I can't give you the answer — try Hint Level 1 to get started.");
        setEvaluatingAnswer(false);
        onAgentStateChange('Assessing');
        return;
      }
      if (isGeminiReady) {
        try {
          const evaluation = await evaluateShortAnswer(textAnswer, currentQuestion.answer, concepts[conceptId].name);
          if (evaluation) { correct = evaluation.correct; setFeedback(evaluation.feedback || ''); }
          else correct = simpleCheck(textAnswer, currentQuestion.answer);
        } catch { correct = simpleCheck(textAnswer, currentQuestion.answer); }
      } else { correct = simpleCheck(textAnswer, currentQuestion.answer); }
      if (!correct) detectedMisc = detectMisconception(conceptId, textAnswer);
      setEvaluatingAnswer(false);
    }

    setIsCorrect(correct); setSubmitted(true); setMisconception(detectedMisc); setShowConfidence(true);

    const masteryChange = calculateMasteryChange(correct, hintsRevealed, confidence, attemptNumber);
    const result = updateMastery(profile.learner_id, conceptId, masteryChange);

    const updatedProfile = { ...profile };
    updatedProfile.mastery = { ...updatedProfile.mastery, [conceptId]: result.newMastery };
    updatedProfile.total_interactions += 1;
    updatedProfile.last_active = new Date().toISOString();
    if (correct) { updatedProfile.correct_streak = (updatedProfile.correct_streak || 0) + 1; updatedProfile.incorrect_streak = 0; }
    else { updatedProfile.incorrect_streak = (updatedProfile.incorrect_streak || 0) + 1; updatedProfile.correct_streak = 0; }
    if (hintsRevealed > 0) { updatedProfile.hints_used = (updatedProfile.hints_used || 0) + hintsRevealed; updatedProfile.consecutive_hints = (updatedProfile.consecutive_hints || 0) + 1; }
    else { updatedProfile.consecutive_hints = 0; }
    if (confidence <= 2) { updatedProfile.consecutive_low_confidence = (updatedProfile.consecutive_low_confidence || 0) + 1; }
    else { updatedProfile.consecutive_low_confidence = 0; }
    if (detectedMisc) { updatedProfile.misconceptions_detected = [...(updatedProfile.misconceptions_detected || []), detectedMisc.id]; }
    saveLearnerProfile(updatedProfile);

    logInteraction({
      learner_id: profile.learner_id, concept_id: conceptId, question_id: currentQuestion.id,
      learner_answer: selectedOption || textAnswer, is_correct: correct,
      confidence_before_answer: confidence, response_time_seconds: responseTime,
      attempt_number: attemptNumber, hints_requested: hintsRevealed,
      detected_misconception_id: detectedMisc?.id || null,
      mastery_before: result.oldMastery, mastery_after: result.newMastery,
      recommended_next_action: correct ? 'Proceed to next question' : 'Review concept',
    });

    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
    setQuestionsAnswered(prev => prev + 1);
    onAgentStateChange('Updating Profile');
    setTimeout(() => { onAgentStateChange('Assessing'); onProfileUpdate(updatedProfile); }, 800);
  }

  function handleNextQuestion() { setAttemptNumber(prev => prev + 1); setShowConfidence(false); selectNextQuestion(); }
  function revealHint() { if (hintsRevealed < 3) setHintsRevealed(prev => prev + 1); }

  if (!currentQuestion) return null;
  const isTextQuestion = currentQuestion.type === 'Short Answer' || currentQuestion.type === 'Code Output';

  return (
    <div className="animate-slide-up">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 mb-10 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="badge badge-primary">{concepts[conceptId]?.short}</span>
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
              Question {questionsAnswered + 1}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'var(--color-text-secondary)' }}>
              {currentQuestion.type}
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'var(--color-text-secondary)' }}>
              {currentQuestion.difficulty}
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Concept Assessment</h2>
      </div>

      {/* ── Question ── */}
      <div className="mb-10">
        <div className="markdown-content mb-8">
          <Markdown components={{
            code({ className, children, ...props }) {
              const codeText = String(children).replace(/\n$/, '');
              const isInline = !className;
              
              if (!isInline) {
                const highlighted = highlightJava(codeText);
                return (
                  <div className="code-editor mt-4 mb-6">
                    <div className="code-editor-header">
                      <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Java Code</span>
                    </div>
                    <pre>
                      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
                    </pre>
                  </div>
                );
              }
              return <code {...props}>{children}</code>;
            },
          }}>{currentQuestion.text}</Markdown>
        </div>

        {/* ── Options ── */}
        {!isTextQuestion && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => !submitted && setSelectedOption(option)} disabled={submitted}
                className={`option-btn ${selectedOption === option ? 'selected' : ''} 
                  ${submitted && option === currentQuestion.answer ? 'correct' : ''} 
                  ${submitted && selectedOption === option && option !== currentQuestion.answer ? 'incorrect' : ''}`}>
                <span className="font-bold text-[11px] w-6 h-6 rounded flex items-center justify-center flex-shrink-0" 
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)' }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{option}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Text Input ── */}
        {isTextQuestion && !submitted && (
          <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your answer here..." rows={4} className="resize-none"
            style={{ fontFamily: currentQuestion.type === 'Code Output' ? 'var(--font-mono)' : 'var(--font-sans)' }} />
        )}

        {/* ── Warnings & Hints ── */}
        <div className="mt-8 space-y-4">
          {directAnswerWarning && (
            <div className="p-4 rounded-xl border" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
              <p className="text-[13px] font-semibold text-[var(--color-accent-amber)]">🚫 {directAnswerWarning}</p>
            </div>
          )}

          {!submitted && (
            <div className="flex items-center gap-3">
              {hintsRevealed < 3 ? (
                <button onClick={revealHint} className="btn-secondary text-[12px] py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
                  </svg>
                  Get Hint ({3 - hintsRevealed} left)
                </button>
              ) : !showAnswer ? (
                <button onClick={() => setShowAnswer(true)} className="btn-secondary text-[12px] py-2" style={{ color: 'var(--color-accent-rose)', borderColor: 'rgba(251,113,133,0.3)' }}>
                  Show Answer
                </button>
              ) : null}
            </div>
          )}

          {!submitted && hintsRevealed > 0 && currentQuestion.hints && (
            <div className="space-y-3 pt-4">
              {currentQuestion.hints.slice(0, hintsRevealed).map((hint, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-[var(--color-surface)] animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary-light)] mb-2 block">
                    Hint {idx + 1}
                  </span>
                  <p className="text-[13px] text-white">{hint}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Confidence ── */}
      {!submitted && (
        <div className="glass-card p-6 mb-8">
          <label className="flex justify-between items-center text-[13px] font-semibold mb-4">
            <span className="text-[var(--color-text-secondary)]">How confident are you in this answer?</span>
            <span className="text-white bg-[rgba(255,255,255,0.05)] px-3 py-1 rounded-full">{confidence} / 5</span>
          </label>
          <input
            type="range" min="1" max="5" value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value))}
            className="w-full mb-4"
          />
          <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
            <span>Just Guessing</span>
            <span>Certain</span>
          </div>
        </div>
      )}

      {/* ── Submit & Actions ── */}
      {!submitted ? (
        <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSubmit} disabled={(!selectedOption && !textAnswer.trim()) || evaluatingAnswer} className="btn-primary py-3 px-8">
            {evaluatingAnswer ? 'Evaluating...' : 'Submit Answer'}
          </button>
          <p className="text-[11px] ml-auto hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>Need help? Use the AI Tutor panel →</p>
        </div>
      ) : (
        <div className="animate-slide-up space-y-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          
          {/* Result Card */}
          <div className="p-6 rounded-xl border" style={{ 
            background: isCorrect ? 'rgba(52,211,153,0.05)' : 'rgba(251,113,133,0.05)',
            borderColor: isCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{
                background: isCorrect ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
                borderColor: isCorrect ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)',
                color: isCorrect ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)'
              }}>
                {isCorrect ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </div>
              <span className="text-lg font-bold text-white">
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
              {hintsRevealed >= 2 && isCorrect && (
                <span className="badge badge-warning ml-auto">Assisted</span>
              )}
            </div>
            
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Correct answer:</p>
            <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[14px] font-semibold text-white">{currentQuestion.answer}</p>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {feedback || currentQuestion.explanation}
            </p>
          </div>

          {/* Misconception Alert */}
          {misconception && (
            <div className="p-5 rounded-xl border flex gap-4" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-[var(--color-accent-amber)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--color-accent-amber)]">
                  Misconception Detected
                </p>
                <p className="text-[13px] text-white leading-relaxed">{misconception.description}</p>
              </div>
            </div>
          )}

          {/* Next Actions */}
          <div className="flex gap-4 pt-2">
            <button onClick={handleNextQuestion} className="btn-primary py-3 px-8">Next Question</button>
            <button onClick={onBackToTeaching} className="btn-secondary py-3 px-6">Back to Lesson</button>
            <p className="text-[11px] sm:ml-auto" style={{ color: 'var(--color-text-muted)' }}>Stuck? Ask the AI Tutor →</p>
          </div>
        </div>
      )}
    </div>
  );
}

function simpleCheck(learnerAnswer, correctAnswer) {
  const a = learnerAnswer.toLowerCase().trim();
  const b = correctAnswer.toLowerCase().trim();
  if (a === b) return true;
  const keyTerms = b.split(/\s+/).filter(w => w.length > 3);
  const matchCount = keyTerms.filter(term => a.includes(term)).length;
  return matchCount >= Math.ceil(keyTerms.length * 0.5);
}
