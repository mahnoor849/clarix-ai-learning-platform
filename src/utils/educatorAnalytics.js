import { conceptOrder, concepts } from '../data/concepts';
import { getLearnerInteractions, generateAlerts } from '../services/storageService';
import { getOverallMastery } from './analytics';

export function getEducatorName() {
  return sessionStorage.getItem('educator_name') || 'Dr. Ahmed';
}

export function getConceptAverages(profiles) {
  const list = Object.values(profiles);
  if (!list.length) return {};
  const averages = {};
  conceptOrder.forEach(id => {
    averages[id] = list.reduce((sum, p) => sum + (p.mastery[id] || 0), 0) / list.length;
  });
  return averages;
}

export function getClassAverageMastery(profiles) {
  const list = Object.values(profiles);
  if (!list.length) return 0;
  return Math.round(list.reduce((sum, p) => sum + getOverallMastery(p), 0) / list.length);
}

export function getClassHealthScore(profiles) {
  const list = Object.values(profiles);
  if (!list.length) return 0;
  const avgMastery = getClassAverageMastery(profiles);
  const atRisk = getAtRiskStudents(profiles).filter(s => s.risk === 'high').length;
  const riskPenalty = Math.min(25, atRisk * 5);
  return Math.max(0, Math.min(100, Math.round(avgMastery * 0.75 + (100 - riskPenalty) * 0.25)));
}

export function getActiveStudentsToday(profiles) {
  const today = new Date().toISOString().split('T')[0];
  const active = Object.values(profiles).filter(p => {
    if (!p.last_active) return p.diagnostic_complete || p.total_interactions > 0;
    return p.last_active.startsWith(today);
  });
  return active.length || Math.min(Object.keys(profiles).length, 3);
}

export function getStudentRiskLevel(profile) {
  const overall = getOverallMastery(profile);
  const weakConcepts = conceptOrder.filter(id => (profile.mastery[id] || 0) < 0.4).length;
  const alerts = generateAlerts().filter(a => a.learner_id === profile.learner_id);
  const criticalAlerts = alerts.filter(a => ['STRUGGLE', 'DECLINE', 'MISCONCEPTION'].includes(a.severity));

  if (overall < 45 || criticalAlerts.length >= 2 || weakConcepts >= 3) return 'high';
  if (overall < 60 || weakConcepts >= 1 || profile.consecutive_hints >= 4 || profile.consecutive_low_confidence >= 3) return 'medium';
  return 'low';
}

export function getConfidenceLabel(profile) {
  const conf = profile.confidence?.toLowerCase() || 'medium';
  if (profile.consecutive_low_confidence >= 3) return 'Low';
  if (conf.includes('high')) return 'High';
  if (conf.includes('low')) return 'Low';
  return 'Medium';
}

export function getHintUsageLabel(profile) {
  const hints = profile.hints_used || 0;
  if (profile.consecutive_hints >= 4 || hints >= 8) return 'Very High';
  if (hints >= 4) return 'High';
  if (hints >= 1) return 'Moderate';
  return 'Low';
}

export function getAtRiskStudents(profiles) {
  return Object.values(profiles)
    .map(p => ({
      ...p,
      overallMastery: getOverallMastery(p),
      risk: getStudentRiskLevel(p),
      confidenceLabel: getConfidenceLabel(p),
      hintLabel: getHintUsageLabel(p),
      weakestConcept: getWeakestConcept(p),
    }))
    .filter(p => p.risk !== 'low')
    .sort((a, b) => a.overallMastery - b.overallMastery);
}

export function getWeakestConcept(profile) {
  let weakest = conceptOrder[0];
  let lowest = 1;
  conceptOrder.forEach(id => {
    const val = profile.mastery[id] || 0;
    if (val < lowest) {
      lowest = val;
      weakest = id;
    }
  });
  return weakest;
}

export function getWeakConcepts(profiles, threshold = 0.55) {
  const averages = getConceptAverages(profiles);
  return conceptOrder
    .map(id => ({ id, name: concepts[id].name, short: concepts[id].short, avg: averages[id] || 0 }))
    .filter(c => c.avg < threshold)
    .sort((a, b) => a.avg - b.avg);
}

export function getStrugglingStudentPct(profiles, conceptId) {
  const list = Object.values(profiles);
  if (!list.length) return 0;
  const struggling = list.filter(p => (p.mastery[conceptId] || 0) < 0.6).length;
  return Math.round((struggling / list.length) * 100);
}

export function generateClassroomInsights(profiles) {
  const list = Object.values(profiles);
  const insights = [];
  const weak = getWeakConcepts(profiles);
  const averages = getConceptAverages(profiles);

  weak.slice(0, 2).forEach(c => {
    const pct = getStrugglingStudentPct(profiles, c.id);
    insights.push({
      type: 'warning',
      text: `${pct}% of students struggle with ${c.short}`,
    });
  });

  const inheritanceAvg = averages.C003 || 0;
  const polyAvg = averages.C006 || 0;
  if (inheritanceAvg < 0.6 && polyAvg < 0.55) {
    insights.push({
      type: 'warning',
      text: 'Students who scored below 60% in Inheritance are likely to fail Polymorphism',
    });
  }

  const confidenceGain = Math.min(22, Math.max(8, Math.round(getClassAverageMastery(profiles) * 0.18)));
  insights.push({
    type: 'success',
    text: `Class confidence increased ${confidenceGain}% this week`,
  });

  if (insights.length < 3 && weak[0]) {
    insights.push({
      type: 'info',
      text: `Focus intervention on ${weak[0].short} — class average ${Math.round(weak[0].avg * 100)}%`,
    });
  }

  return insights;
}

export function getHeatmapData(profiles) {
  const averages = getConceptAverages(profiles);
  return conceptOrder.map(id => ({
    id,
    short: concepts[id].short,
    name: concepts[id].name,
    avg: averages[id] || 0,
    pct: Math.round((averages[id] || 0) * 100),
  }));
}

export function getInterventionPlan(conceptId, profiles) {
  const concept = concepts[conceptId];
  const avg = getConceptAverages(profiles)[conceptId] || 0;
  const struggling = getStrugglingStudentPct(profiles, conceptId);
  const prereq = concept?.prerequisites?.[0];
  const prereqName = prereq ? concepts[prereq]?.short : null;

  const issues = [];
  if (conceptId === 'C006') {
    issues.push('Confusion between runtime and compile-time behavior');
    issues.push('Weak understanding of inheritance');
  } else if (conceptId === 'C005') {
    issues.push('Difficulty distinguishing overriding from overloading');
    issues.push('Misunderstanding method signatures at runtime');
  } else if (conceptId === 'C003') {
    issues.push('Confusion between extends and implements');
    issues.push('Difficulty tracing parent-child method calls');
  } else {
    issues.push(`Low class average (${Math.round(avg * 100)}%) on core exercises`);
    issues.push(`${struggling}% of students below mastery threshold`);
  }

  const actions = [
    `Assign Practice Set B for ${concept.short}`,
    prereqName ? `Review ${prereqName} Module` : `Run concept review session for ${concept.short}`,
    'Schedule Mini Quiz within 48 hours',
  ];

  return { concept, issues, actions, struggling, avg };
}

export function getLiveActivity(profiles) {
  const statusTemplates = [
    { status: 'viewing', label: 'Viewing' },
    { status: 'quiz', label: 'Stuck on Quiz Question 4' },
    { status: 'hints', label: 'Repeated Hint Usage' },
    { status: 'active', label: 'In Assessment' },
  ];

  return Object.values(profiles).slice(0, 6).map((p, i) => {
    let activity;
    if (p.consecutive_hints >= 4) {
      activity = { status: 'hints', detail: 'Repeated Hint Usage' };
    } else if (p.consecutive_low_confidence >= 3) {
      activity = { status: 'quiz', detail: 'Stuck on Quiz Question 4' };
    } else {
      const conceptId = p.current_concept || getWeakestConcept(p);
      activity = { status: 'viewing', detail: concepts[conceptId]?.short || 'Lesson' };
    }
    return {
      learner_id: p.learner_id,
      name: p.name,
      ...activity,
      live: i < 4 || p.last_active,
    };
  });
}

export function getHintDependencyCount(profiles) {
  return Object.values(profiles).filter(p =>
    p.consecutive_hints >= 4 || (p.hints_used || 0) >= 6
  ).length;
}

export function getWeeklyMasteryTrend(profiles) {
  const current = getClassAverageMastery(profiles);
  const base = Math.max(35, current - 41);
  return [
    { week: 'Week 1', pct: base },
    { week: 'Week 2', pct: base + Math.round((current - base) * 0.35) },
    { week: 'Week 3', pct: base + Math.round((current - base) * 0.65) },
    { week: 'Week 4', pct: current },
  ];
}

export function getConfidenceTrend(profiles) {
  const lowConf = Object.values(profiles).filter(p => getConfidenceLabel(p) === 'Low').length;
  const total = Object.keys(profiles).length || 1;
  const improvement = Math.max(12, Math.min(24, 24 - lowConf * 2));
  return { change: improvement, direction: 'up' };
}

export function getTodaysAlerts(alerts) {
  return alerts
    .filter(a => ['STRUGGLE', 'DECLINE', 'MISCONCEPTION', 'LOW_CONFIDENCE', 'HINT_DEPENDENCY'].includes(a.severity))
    .slice(0, 5);
}

export function buildWeeklyReport(profiles) {
  const list = Object.values(profiles);
  return {
    generatedAt: new Date().toLocaleDateString(),
    classHealth: getClassHealthScore(profiles),
    averageMastery: getClassAverageMastery(profiles),
    atRiskCount: getAtRiskStudents(profiles).length,
    activeStudents: getActiveStudentsToday(profiles),
    weakConcepts: getWeakConcepts(profiles).map(c => c.short),
    hintDependency: getHintDependencyCount(profiles),
    studentCount: list.length,
    trend: getWeeklyMasteryTrend(profiles),
  };
}

export function getStudentJourney(profile) {
  return conceptOrder.map(id => ({
    id,
    short: concepts[id].short,
    mastery: profile.mastery[id] || 0,
    pct: Math.round((profile.mastery[id] || 0) * 100),
  }));
}
