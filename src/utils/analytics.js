import { conceptOrder, concepts } from '../data/concepts';
import { getLearnerInteractions } from '../services/storageService';

export const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'First Steps', desc: 'Complete your first lesson', icon: '🎯', check: (p) => p.total_interactions >= 1 },
  { id: 'diagnostic_done', title: 'Self-Aware', desc: 'Finish the diagnostic assessment', icon: '🔍', check: (p) => p.diagnostic_complete },
  { id: 'streak_3', title: 'On Fire', desc: 'Maintain a 3-day learning streak', icon: '🔥', check: (p) => (p.streak_days || 0) >= 3 },
  { id: 'streak_7', title: 'Dedicated', desc: 'Maintain a 7-day learning streak', icon: '⚡', check: (p) => (p.streak_days || 0) >= 7 },
  { id: 'mastery_50', title: 'Halfway There', desc: 'Reach 50% overall mastery', icon: '📈', check: (p) => getOverallMastery(p) >= 50 },
  { id: 'mastery_80', title: 'OOP Expert', desc: 'Reach 80% overall mastery', icon: '🏆', check: (p) => getOverallMastery(p) >= 80 },
  { id: 'concept_master', title: 'Concept Master', desc: 'Master any module above 85%', icon: '💎', check: (p) => Object.values(p.mastery || {}).some(v => v >= 0.85) },
  { id: 'quiz_ace', title: 'Quiz Ace', desc: 'Answer 5 questions correctly in a row', icon: '✅', check: (p) => (p.correct_streak || 0) >= 5 },
  { id: 'tutor_user', title: 'Curious Mind', desc: 'Use the AI tutor 3 times', icon: '🤖', check: (p) => (p.tutor_sessions || 0) >= 3 },
  { id: 'all_modules', title: 'Full Stack OOP', desc: 'Start all 6 modules', icon: '📚', check: (p) => getStartedModules(p) >= 6 },
];

export function getOverallMastery(profile) {
  if (!profile?.mastery) return 0;
  const vals = Object.values(profile.mastery);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
}

export function getStartedModules(profile) {
  const interactions = getLearnerInteractions(profile.learner_id);
  const touched = new Set(interactions.map(i => i.concept_id));
  return touched.size;
}

export function getUnlockedAchievements(profile) {
  return ACHIEVEMENTS.filter(a => a.check(profile));
}

export function getRadarData(profile) {
  return conceptOrder.map(id => ({
    label: concepts[id].short,
    value: Math.round((profile.mastery?.[id] || 0) * 100),
  }));
}

export function getLearningStreak(profile) {
  return profile.streak_days || 0;
}

export function updateStreak(profile) {
  const today = new Date().toISOString().split('T')[0];
  const last = profile.last_streak_date;
  if (last === today) return profile;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = last === yesterday ? (profile.streak_days || 0) + 1 : 1;
  return { ...profile, streak_days: newStreak, last_streak_date: today };
}

export function getWeeklyActivity(learnerId) {
  const interactions = getLearnerInteractions(learnerId);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = days.map(() => 0);
  interactions.forEach(i => {
    const d = new Date(i.timestamp);
    const dayIdx = d.getDay();
    counts[dayIdx]++;
  });
  return days.map((day, i) => ({ day, count: counts[i] }));
}

export function getAccuracyRate(learnerId) {
  const interactions = getLearnerInteractions(learnerId).filter(i => i.question_id && i.question_id !== 'TUTOR');
  if (interactions.length === 0) return 0;
  const correct = interactions.filter(i => i.is_correct).length;
  return Math.round((correct / interactions.length) * 100);
}

export function getTimeSpentMinutes(profile) {
  const interactions = getLearnerInteractions(profile.learner_id);
  const totalSeconds = interactions.reduce((sum, i) => sum + (i.response_time_seconds || 30), 0);
  return Math.max(1, Math.round(totalSeconds / 60));
}

export function buildLearningRoadmap(mastery) {
  return conceptOrder.map((id, index) => {
    const m = mastery[id] || 0;
    let status = 'locked';
    if (m >= 0.85) status = 'completed';
    else if (m > 0 || index === 0 || (mastery[conceptOrder[index - 1]] || 0) >= 0.5) status = 'active';
    else if ((mastery[conceptOrder[index - 1]] || 0) >= 0.3) status = 'available';
    return { id, name: concepts[id].name, short: concepts[id].short, mastery: m, status, difficulty: concepts[id].difficulty };
  });
}

export function generateAIRecommendations(profile) {
  const recs = [];
  const weakest = conceptOrder
    .map(id => ({ id, m: profile.mastery[id] || 0 }))
    .sort((a, b) => a.m - b.m)[0];
  if (weakest && weakest.m < 0.7) {
    recs.push({ type: 'focus', text: `Focus on ${concepts[weakest.id].short} — your weakest area at ${Math.round(weakest.m * 100)}%` });
  }
  if ((profile.consecutive_low_confidence || 0) >= 2) {
    recs.push({ type: 'confidence', text: 'Try easier practice questions to rebuild confidence before advancing' });
  }
  if ((profile.hints_used || 0) > 3) {
    recs.push({ type: 'review', text: 'Review prerequisite concepts — you\'ve been relying on hints frequently' });
  }
  const strong = conceptOrder.filter(id => (profile.mastery[id] || 0) >= 0.85);
  if (strong.length > 0 && strong.length < 6) {
    recs.push({ type: 'advance', text: `Great progress on ${concepts[strong[strong.length - 1]].short}! Ready to tackle the next module` });
  }
  if (recs.length === 0) {
    recs.push({ type: 'general', text: 'Keep your daily streak going — consistent practice is the fastest path to mastery' });
  }
  return recs;
}
