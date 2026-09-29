import { defaultProfiles } from '../data/learnerProfiles';

const INTERACTIONS_KEY = 'learnshift_interactions';
const LEARNER_PREFIX = 'learnshift_learner_';
const ACTIVE_LEARNER_KEY = 'learnshift_active_learner';
const ASSIGNMENTS_KEY = 'clarix_assignments';

export function setActiveLearner(learnerId) {
  sessionStorage.setItem(ACTIVE_LEARNER_KEY, learnerId);
}

export function getActiveLearnerId() {
  return sessionStorage.getItem(ACTIVE_LEARNER_KEY);
}

export function getActiveProfile() {
  const id = getActiveLearnerId();
  if (id) return getLearnerProfile(id);
  const profiles = getAllProfiles();
  return Object.values(profiles).find(p => p.diagnostic_complete) || null;
}

/**
 * Initialize all learner profiles in localStorage if not present
 */
export function initializeProfiles() {
  Object.entries(defaultProfiles).forEach(([id, profile]) => {
    const key = LEARNER_PREFIX + id;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(profile));
    }
  });
  if (!localStorage.getItem(INTERACTIONS_KEY)) {
    localStorage.setItem(INTERACTIONS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ASSIGNMENTS_KEY)) {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify([]));
  }
}

/**
 * Reset all local storage data
 */
export function resetAllData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(LEARNER_PREFIX) || key === INTERACTIONS_KEY || key === ASSIGNMENTS_KEY) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

/**
 * Get learner profile from localStorage
 */
export function getLearnerProfile(learnerId) {
  const data = localStorage.getItem(LEARNER_PREFIX + learnerId);
  return data ? JSON.parse(data) : null;
}

/**
 * Create a new learner profile
 */
export function createLearnerProfile(profile) {
  localStorage.setItem(LEARNER_PREFIX + profile.learner_id, JSON.stringify(profile));
}

/**
 * Save learner profile to localStorage
 */
export function saveLearnerProfile(profile) {
  localStorage.setItem(LEARNER_PREFIX + profile.learner_id, JSON.stringify(profile));
}

/**
 * Get all learner profiles
 */
export function getAllProfiles() {
  const profiles = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LEARNER_PREFIX)) {
      const id = key.replace(LEARNER_PREFIX, '');
      const profile = getLearnerProfile(id);
      if (profile) profiles[id] = profile;
    }
  }
  return profiles;
}

/**
 * Reset a learner profile to default
 */
export function resetLearnerProfile(learnerId) {
  const defaultProfile = defaultProfiles[learnerId];
  if (defaultProfile) {
    localStorage.setItem(LEARNER_PREFIX + learnerId, JSON.stringify({
      ...defaultProfile,
      session_start_mastery: { ...defaultProfile.mastery },
    }));
  }
}

/**
 * Log an interaction
 */
export function logInteraction(interaction) {
  const interactions = getInteractions();
  interactions.push({
    ...interaction,
    interaction_id: 'I' + Date.now(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
}

/**
 * Get all interactions
 */
export function getInteractions() {
  const data = localStorage.getItem(INTERACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get interactions for a specific learner
 */
export function getLearnerInteractions(learnerId) {
  return getInteractions().filter(i => i.learner_id === learnerId);
}

/**
 * Get recent interactions for a learner (last N)
 */
export function getRecentInteractions(learnerId, count = 10) {
  const all = getLearnerInteractions(learnerId);
  return all.slice(-count);
}

/**
 * Update mastery score for a learner
 */
export function updateMastery(learnerId, conceptId, change) {
  const profile = getLearnerProfile(learnerId);
  if (!profile) return null;

  const oldMastery = profile.mastery[conceptId] || 0;
  const newMastery = Math.max(0, Math.min(1, oldMastery + change));
  
  profile.mastery[conceptId] = parseFloat(newMastery.toFixed(4));
  profile.last_active = new Date().toISOString();
  
  saveLearnerProfile(profile);
  return { oldMastery, newMastery };
}

/**
 * Generate alerts for educator dashboard
 */
export function generateAlerts() {
  const alerts = [];
  const profiles = getAllProfiles();
  
  Object.values(profiles).forEach(profile => {
    const interactions = getLearnerInteractions(profile.learner_id);
    
    // A001 — STRUGGLE: Mastery < 40% after 3 attempts on same concept
    Object.entries(profile.mastery).forEach(([conceptId, mastery]) => {
      const conceptInteractions = interactions.filter(i => i.concept_id === conceptId);
      if (mastery < 0.4 && conceptInteractions.length >= 3) {
        alerts.push({
          type: 'A001',
          severity: 'STRUGGLE',
          learner: profile.name,
          learner_id: profile.learner_id,
          concept: conceptId,
          message: 'Learner requires support',
          evidence: `Mastery at ${Math.round(mastery * 100)}% after ${conceptInteractions.length} attempts`,
          action: 'Consider one-on-one session or prerequisite review',
        });
      }
    });

    // A002 — MISCONCEPTION: Same misconception detected 2+ times
    const miscCounts = {};
    (profile.misconceptions_detected || []).forEach(m => {
      miscCounts[m] = (miscCounts[m] || 0) + 1;
    });
    Object.entries(miscCounts).forEach(([miscId, count]) => {
      if (count >= 2) {
        alerts.push({
          type: 'A002',
          severity: 'MISCONCEPTION',
          learner: profile.name,
          learner_id: profile.learner_id,
          concept: null,
          message: 'Recurring misconception detected',
          evidence: `Misconception ${miscId} detected ${count} times`,
          action: 'Address misconception directly with targeted exercise',
        });
      }
    });

    // A003 — DECLINE: Mastery dropped 15%+ in one session
    if (profile.session_start_mastery) {
      Object.entries(profile.mastery).forEach(([conceptId, current]) => {
        const start = profile.session_start_mastery[conceptId] || 0;
        if (start - current >= 0.15) {
          alerts.push({
            type: 'A003',
            severity: 'DECLINE',
            learner: profile.name,
            learner_id: profile.learner_id,
            concept: conceptId,
            message: 'Performance decline',
            evidence: `Mastery dropped from ${Math.round(start * 100)}% to ${Math.round(current * 100)}%`,
            action: 'Review recent answers for patterns, consider a break or concept reteach',
          });
        }
      });
    }

    // A004 — LOW CONFIDENCE: Confidence ≤ 2 on 3+ consecutive answers
    if (profile.consecutive_low_confidence >= 3) {
      alerts.push({
        type: 'A004',
        severity: 'LOW_CONFIDENCE',
        learner: profile.name,
        learner_id: profile.learner_id,
        concept: profile.current_concept,
        message: 'Learner showing low confidence',
        evidence: `${profile.consecutive_low_confidence} consecutive low-confidence answers`,
        action: 'Encourage learner, provide easier questions to build confidence',
      });
    }

    // A005 — HINT DEPENDENCY: Hints used on 4+ consecutive questions
    if (profile.consecutive_hints >= 4) {
      alerts.push({
        type: 'A005',
        severity: 'HINT_DEPENDENCY',
        learner: profile.name,
        learner_id: profile.learner_id,
        concept: profile.current_concept,
        message: 'Hint dependency pattern',
        evidence: `Hints used on ${profile.consecutive_hints} consecutive questions`,
        action: 'Switch to tutor mode for direct concept reteaching',
      });
    }

    // A006 — ADVANCEMENT: Mastery ≥ 85% on concept
    Object.entries(profile.mastery).forEach(([conceptId, mastery]) => {
      if (mastery >= 0.85) {
        alerts.push({
          type: 'A006',
          severity: 'ADVANCEMENT',
          learner: profile.name,
          learner_id: profile.learner_id,
          concept: conceptId,
          message: 'Ready for advancement',
          evidence: `Mastery at ${Math.round(mastery * 100)}%`,
          action: 'Recommend advanced challenges or next concept',
        });
      }
    });
  });

  return alerts;
}

/**
 * Classroom assignments & quizzes created by educators
 */
export function getAllAssignments() {
  const data = localStorage.getItem(ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllAssignments(assignments) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export function createAssignment({ type, title, content, meta = {}, assignedTo = 'all' }) {
  const assignment = {
    id: `ASG_${Date.now()}`,
    type,
    title,
    content,
    meta,
    assignedTo,
    createdAt: new Date().toISOString(),
    completions: {},
  };
  const all = getAllAssignments();
  all.unshift(assignment);
  saveAllAssignments(all);
  return assignment;
}

export function getAssignmentsForLearner(learnerId) {
  return getAllAssignments().filter(a =>
    a.assignedTo === 'all' ||
    (Array.isArray(a.assignedTo) && a.assignedTo.includes(learnerId))
  );
}

export function getPendingAssignmentsForLearner(learnerId) {
  return getAssignmentsForLearner(learnerId).filter(a => !a.completions?.[learnerId]);
}

export function markAssignmentComplete(assignmentId, learnerId) {
  const all = getAllAssignments();
  const idx = all.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;

  all[idx] = {
    ...all[idx],
    completions: {
      ...all[idx].completions,
      [learnerId]: {
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    },
  };
  saveAllAssignments(all);
  return all[idx];
}

export function isAssignmentComplete(assignmentId, learnerId) {
  const assignment = getAllAssignments().find(a => a.id === assignmentId);
  return Boolean(assignment?.completions?.[learnerId]);
}

export function getAssignmentCompletionCount(assignmentId) {
  const assignment = getAllAssignments().find(a => a.id === assignmentId);
  if (!assignment) return { completed: 0, total: 0 };
  const completed = Object.keys(assignment.completions || {}).length;
  const total = Object.keys(getAllProfiles()).length;
  return { completed, total };
}
