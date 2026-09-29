// Adaptation rules — these run as real JavaScript logic after every interaction
import { concepts } from '../data/concepts';

export const adaptationRules = [
  { id: 'R001', condition: (s) => s.mastery < 0.3, action: 'simplified_explanation', priority: 'high' },
  { id: 'R002', condition: (s) => s.mastery >= 0.7 && s.confidence >= 4, action: 'advanced_application', priority: 'high' },
  { id: 'R003', condition: (s) => s.incorrect_streak >= 2 && s.hints >= 2, action: 'prerequisite_review', priority: 'high' },
  { id: 'R004', condition: (s) => s.correct_streak >= 3 && s.mastery > 0.7, action: 'increase_difficulty', priority: 'medium' },
  { id: 'R005', condition: (s) => s.confidence <= 2, action: 'simplified_explanation', priority: 'medium' },
  { id: 'R006', condition: (s) => s.consecutive_hints >= 4, action: 'tutor_mode_suggestion', priority: 'medium' },
  { id: 'R007', condition: (s) => s.same_misconception >= 2, action: 'targeted_misconception_teaching', priority: 'high' },
  { id: 'R008', condition: (s) => s.mastery >= 0.4 && s.mastery <= 0.7, action: 'standard_example_teaching', priority: 'low' },
  { id: 'R009', condition: (s) => s.response_time > 90 && !s.is_correct, action: 'simplified_explanation', priority: 'medium' },
  { id: 'R010', condition: (s) => s.mastery > 0.85, action: 'recommend_next_concept', priority: 'low' },
  { id: 'R011', condition: (s) => s.prerequisite_mastery < 0.4, action: 'prerequisite_first', priority: 'high' },
  { id: 'R012', condition: (s) => s.confidence_increasing && s.correct_streak >= 3, action: 'advance_to_next_concept', priority: 'low' },
];

const priorityOrder = { high: 3, medium: 2, low: 1 };

/**
 * Evaluate all adaptation rules and return the highest-priority matching action
 */
export function evaluateAdaptationRules(learnerState) {
  const matchingRules = adaptationRules.filter(rule => {
    try {
      return rule.condition(learnerState);
    } catch {
      return false;
    }
  });

  if (matchingRules.length === 0) {
    return { action: 'standard_example_teaching', rule: null };
  }

  // Sort by priority (high > medium > low)
  matchingRules.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  
  return { action: matchingRules[0].action, rule: matchingRules[0] };
}

/**
 * Determine teaching action based on mastery and confidence
 */
export function getTeachingAction(mastery, confidence, learnerProfile) {
  const state = {
    mastery,
    confidence,
    incorrect_streak: learnerProfile.incorrect_streak || 0,
    correct_streak: learnerProfile.correct_streak || 0,
    hints: learnerProfile.hints_used || 0,
    consecutive_hints: learnerProfile.consecutive_hints || 0,
    same_misconception: getMostFrequentMisconceptionCount(learnerProfile),
    response_time: 0,
    is_correct: true,
    prerequisite_mastery: getMinPrerequisiteMastery(learnerProfile.current_concept, learnerProfile.mastery),
    confidence_increasing: false,
  };

  const result = evaluateAdaptationRules(state);
  
  // Map actions to teaching modes
  switch (result.action) {
    case 'simplified_explanation':
      return { action: 'ACTION 1 — Simplified Explanation', mode: 'simplified' };
    case 'advanced_application':
      return { action: 'ACTION 3 — Advanced Application', mode: 'advanced' };
    case 'prerequisite_review':
    case 'prerequisite_first':
      return { action: 'ACTION 4 — Prerequisite Review', mode: 'prerequisite' };
    case 'targeted_misconception_teaching':
      return { action: 'ACTION 1 — Simplified Explanation', mode: 'simplified' };
    case 'standard_example_teaching':
    default:
      return { action: 'ACTION 2 — Standard Example-Led Teaching', mode: 'standard' };
  }
}

/**
 * Get question difficulty based on mastery score
 */
export function getQuestionDifficulty(mastery) {
  if (mastery < 0.4) return 'Basic';
  if (mastery <= 0.7) return 'Intermediate';
  return 'Advanced';
}

/**
 * Calculate mastery change after an interaction
 */
export function calculateMasteryChange(isCorrect, hintsUsed, confidence, attemptNumber) {
  let change = 0;
  if (isCorrect) {
    if (hintsUsed === 0 && confidence >= 4) {
      change = 0.08;
    } else if (hintsUsed > 0) {
      change = 0.04;
    } else if (confidence < 3) {
      change = 0.05;
    } else {
      change = 0.06;
    }
  } else {
    if (attemptNumber <= 1) {
      change = -0.05;
    } else {
      change = -0.08;
    }
  }
  return change;
}

/**
 * Recommend the next concept to study
 */
export function getRecommendedConcept(mastery) {
  const conceptList = Object.entries(concepts);
  
  // Check if all concepts are mastered
  const allMastered = conceptList.every(([id]) => (mastery[id] || 0) >= 0.7);
  if (allMastered) return { concept: null, reason: 'All concepts mastered! Try advanced challenges.' };

  // Find the concept with lowest mastery that has prerequisites met
  let bestConcept = null;
  let lowestMastery = 1.0;

  for (const [id, concept] of conceptList) {
    const m = mastery[id] || 0;
    if (m >= 0.7) continue; // Already mastered

    // Check if prerequisites are met
    const prereqsMet = concept.prerequisites.every(prereq => (mastery[prereq] || 0) >= 0.4);
    
    if (prereqsMet && m < lowestMastery) {
      lowestMastery = m;
      bestConcept = id;
    }
  }

  if (bestConcept) {
    const prereqStatus = concepts[bestConcept].prerequisites
      .map(p => `${concepts[p].short}: ${Math.round((mastery[p] || 0) * 100)}%`)
      .join(', ');
    const reason = concepts[bestConcept].prerequisites.length > 0
      ? `Mastery below ${Math.round(lowestMastery * 100)}%, prerequisites met (${prereqStatus})`
      : `Mastery below ${Math.round(lowestMastery * 100)}%, no prerequisites needed`;
    return { concept: bestConcept, reason };
  }

  // If no concept has prerequisites met, recommend the lowest prerequisite
  let lowestPrereq = null;
  let lowestPrereqMastery = 1.0;
  for (const [id] of conceptList) {
    const m = mastery[id] || 0;
    if (m < lowestPrereqMastery && concepts[id].prerequisites.length === 0) {
      lowestPrereqMastery = m;
      lowestPrereq = id;
    }
  }

  if (lowestPrereq) {
    return { concept: lowestPrereq, reason: 'Prerequisite concepts need strengthening first' };
  }

  return { concept: 'C001', reason: 'Start from the basics' };
}

function getMostFrequentMisconceptionCount(profile) {
  if (!profile.misconceptions_detected || profile.misconceptions_detected.length === 0) return 0;
  const counts = {};
  profile.misconceptions_detected.forEach(m => {
    counts[m] = (counts[m] || 0) + 1;
  });
  return Math.max(...Object.values(counts));
}

function getMinPrerequisiteMastery(conceptId, mastery) {
  if (!conceptId || !concepts[conceptId]) return 1.0;
  const prereqs = concepts[conceptId].prerequisites;
  if (prereqs.length === 0) return 1.0;
  return Math.min(...prereqs.map(p => mastery[p] || 0));
}
