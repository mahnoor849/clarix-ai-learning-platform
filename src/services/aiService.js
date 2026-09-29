const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const isReady = Boolean(
  API_KEY &&
  API_KEY !== 'your_groq_api_key_here' &&
  API_KEY !== 'your_gemini_api_key_here'
);

/**
 * Call Groq chat completions API (OpenAI-compatible)
 */
export async function callAI(systemPrompt, userMessage, timeoutMs = 15000) {
  if (!isReady) {
    throw new Error('Groq API not available');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq');
    return text;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI request timed out');
    }
    console.error('Groq API call failed:', error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateTeaching(learnerProfile, conceptId, conceptName, mastery, confidence, teachingAction) {
  const misconceptions = learnerProfile.misconceptions_detected || [];
  const recentMisconception = misconceptions.length > 0 ? misconceptions[misconceptions.length - 1] : 'none detected';

  const systemPrompt = `You are Clarix, an adaptive OOP tutor for Java.

Learner profile:
- Name: ${learnerProfile.name}
- Concept: ${conceptName}
- Mastery score: ${mastery.toFixed(2)}
- Confidence level: ${confidence || 3}
- Profile type: ${learnerProfile.profile_type}
- Recent misconception: ${recentMisconception}
- Attempt number: ${learnerProfile.total_interactions + 1}

Teaching action selected: ${teachingAction}

Rules:
- Ground every explanation in verified OOP concepts
- Always include a Java code example (use JetBrains Mono formatting)
- If action is Simplified: use a real-world analogy FIRST before code
- If action is Advanced: pose a challenge question the learner must answer
- If action is Prerequisite Review: explicitly say "Let's review [prerequisite] first"
- End every teaching response with exactly ONE follow-up question to check understanding
- Never give the answer to your own follow-up question
- Keep responses under 350 words
- Format code blocks with triple backticks and java tag`;

  return callAI(systemPrompt, `Teach me about ${conceptName} in Java. My current mastery is ${(mastery * 100).toFixed(0)}%.`);
}

export async function generateTutorResponse(learnerProfile, conceptName, confusionText, lastIncorrect, misconception) {
  const systemPrompt = `You are Clarix in Tutor Mode.

Learner profile:
- Name: ${learnerProfile.name}
- Mastery: ${JSON.stringify(learnerProfile.mastery)}
- Profile type: ${learnerProfile.profile_type}
- Confidence: ${learnerProfile.confidence}
Concept being studied: ${conceptName}
What the learner said they're confused about: ${confusionText}
Last question they answered incorrectly: ${lastIncorrect || 'None'}
Detected misconception: ${misconception || 'None'}

Tutor Mode rules:
- DO NOT repeat the previous explanation word-for-word — reframe it differently
- Identify the EXACT step or sub-concept causing confusion
- Ask ONE diagnostic question to pinpoint the misunderstanding
- If a misconception is detected, address it directly by name
- Use a comparison or analogy they haven't seen yet
- After your response, ask a verification question to check if the reframe helped
- Maximum 250 words`;

  return callAI(systemPrompt, `I'm confused about: ${confusionText}`);
}

export async function evaluateShortAnswer(learnerAnswer, correctAnswer, conceptName) {
  const systemPrompt = `You are an OOP assessment evaluator. Compare the learner's answer to the expected answer.

Expected answer: ${correctAnswer}
Concept: ${conceptName}

Rules:
- Determine if the learner's answer demonstrates understanding of the concept
- Be lenient with wording but strict on conceptual accuracy
- Respond with EXACTLY this JSON format:
{"correct": true/false, "feedback": "brief explanation of why correct/incorrect"}
- Maximum 50 words for feedback`;

  try {
    const response = await callAI(systemPrompt, `Learner's answer: ${learnerAnswer}`);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch {
    return null;
  }
}

export async function generateInterventionPlan(learnerData) {
  const systemPrompt = `You are an educational analytics AI. Given this learner's data:
- Name: ${learnerData.name}
- Profile type: ${learnerData.profile_type}
- Mastery per concept: ${JSON.stringify(learnerData.mastery)}
- Total interactions: ${learnerData.total_interactions}
- Hints used: ${learnerData.hints_used}
- Detected misconceptions: ${JSON.stringify(learnerData.misconceptions_detected)}

Generate a specific 3-step intervention plan for the educator. Be concrete and practical.
Maximum 150 words. Format as numbered steps.`;

  return callAI(systemPrompt, `Generate an intervention plan for ${learnerData.name}.`);
}

export function isDirectAnswerRequest(text) {
  const patterns = [
    'give me the answer', 'tell me the answer', 'just give me',
    'what is the answer', 'tell me the correct', 'show me the answer',
    'just tell me', 'i want the answer',
  ];
  return patterns.some(p => text.toLowerCase().includes(p));
}

export function isOutOfScope(text) {
  const oopKeywords = ['class', 'object', 'encapsulation', 'inheritance', 'overload', 'override',
    'polymorphism', 'java', 'oop', 'method', 'constructor', 'interface', 'abstract',
    'extends', 'implements', 'private', 'public', 'protected', 'super', 'getter', 'setter'];
  const lower = text.toLowerCase();
  if (lower.length < 30) return false;
  const hasOOP = oopKeywords.some(k => lower.includes(k));
  if (hasOOP) return false;
  const offTopicPatterns = ['python', 'web scraper', 'machine learning', 'database', 'html', 'css',
    'javascript', 'write me a', 'build me a', 'create a website'];
  return offTopicPatterns.some(p => lower.includes(p));
}

export async function generateTutorAction(learnerProfile, conceptName, action, lessonContext = '') {
  const actionPrompts = {
    explain_again: `Re-explain the concept "${conceptName}" using a completely different approach than before. Use a new analogy and a different code example. End with a comprehension check question. Max 250 words.`,
    simplify: `Explain "${conceptName}" as simply as possible — imagine teaching a complete beginner. Use everyday language, avoid jargon, one tiny code example only. Max 200 words.`,
    give_example: `Provide 2 concrete, real-world Java code examples for "${conceptName}". Each example should solve a different practical problem. Briefly explain what each does. Max 300 words.`,
    quiz_me: `Create a quick 3-question mini-quiz about "${conceptName}". Format each as: **Q1:** question, then options A) B) C) D), then reveal answer at end. Make questions progressively harder.`,
    practice: `Generate one challenging practice coding problem about "${conceptName}". Include: problem statement, starter code skeleton, expected output, and 2 progressive hints (don't reveal solution). Max 250 words.`,
  };

  const systemPrompt = `You are Clarix, an adaptive Java OOP tutor.
Learner: ${learnerProfile.name} | Mastery: ${JSON.stringify(learnerProfile.mastery)}
Profile type: ${learnerProfile.profile_type}
Current lesson context: ${lessonContext || 'General lesson'}

${actionPrompts[action] || actionPrompts.explain_again}

Format with markdown. Include Java code in triple-backtick blocks with java tag.`;

  return callAI(systemPrompt, `Action: ${action} for ${conceptName}`);
}

export async function generateStudentProfile(learnerProfile, diagnosticResults) {
  const systemPrompt = `You are an educational AI analyst. Based on diagnostic results, generate a personalized learner profile summary.

Learner: ${learnerProfile.name}
Experience: ${learnerProfile.profile_type}
Mastery scores: ${JSON.stringify(learnerProfile.mastery)}
Diagnostic answers: ${JSON.stringify(diagnosticResults)}

Generate:
1. A 2-sentence learning style assessment
2. Top 2 strengths (concept names)
3. Top 2 areas to improve
4. Recommended study pace (slow/moderate/fast) with reason

Format as markdown with headers. Max 200 words. Be encouraging but honest.`;

  return callAI(systemPrompt, `Generate profile for ${learnerProfile.name}`);
}

export async function generateTutorChat(learnerProfile, conceptName, message, chatHistory = []) {
  const historyText = chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
  const systemPrompt = `You are Clarix, a friendly Java OOP tutor chatting with ${learnerProfile.name}.
Current topic: ${conceptName}
Mastery: ${JSON.stringify(learnerProfile.mastery)}

Rules: Be concise (max 150 words), use markdown, include code examples when relevant, ask follow-up questions to check understanding.
Previous messages:\n${historyText}`;

  return callAI(systemPrompt, message);
}

export async function generateEducatorQuiz(topic, difficulty, questionCount) {
  const systemPrompt = `You are an expert Java OOP educator creating a classroom quiz.
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${questionCount}

Generate a quiz with multiple-choice questions (A-D), correct answers marked, and a brief teacher note at the end.
Format as markdown. Max 400 words.`;

  return callAI(systemPrompt, `Generate a ${difficulty} quiz on ${topic} with ${questionCount} questions.`);
}

export async function generateAdaptiveAssignment(weakConcepts) {
  const systemPrompt = `You are an adaptive learning AI designing a classroom assignment.
Weak concepts in the class: ${weakConcepts.join(', ')}

Create an adaptive assignment with:
1. Section A — diagnostic review questions
2. Section B — scaffolded coding practice
3. Section C — reflection prompt

Include estimated time and adaptation notes for the educator.
Format as markdown. Max 300 words.`;

  return callAI(systemPrompt, `Create adaptive assignment targeting: ${weakConcepts.join(', ')}`);
}

export { isReady as isAIReady };
export { isReady as isGeminiReady };
