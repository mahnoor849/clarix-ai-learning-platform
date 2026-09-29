import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProfiles, generateAlerts } from '../services/storageService';
import {
  getClassHealthScore,
  getClassAverageMastery,
  getAtRiskStudents,
  getActiveStudentsToday,
  getHeatmapData,
  getLiveActivity,
} from '../utils/educatorAnalytics';
import EducatorSidebar from '../components/educator/EducatorSidebar';
import EducatorInsightsPanel from '../components/educator/EducatorInsightsPanel';
import CommandCenter from '../components/educator/CommandCenter';
import AIClassroomInsights from '../components/educator/AIClassroomInsights';
import ClassHeatmap from '../components/educator/ClassHeatmap';
import AtRiskStudents from '../components/educator/AtRiskStudents';
import LiveMonitoring from '../components/educator/LiveMonitoring';
import LearningTrends from '../components/educator/LearningTrends';
import InterventionCenter from '../components/educator/InterventionCenter';
import AssessmentBuilder from '../components/educator/AssessmentBuilder';
import AssignmentBuilder from '../components/educator/AssignmentBuilder';
import StudentsDirectory from '../components/educator/StudentsDirectory';
import ReportsPanel from '../components/educator/ReportsPanel';
import EducatorStack, { EducatorGrid } from '../components/educator/EducatorStack';

const VIEW_TITLES = {
  dashboard: 'Command Center',
  students: 'Students',
  classes: 'Class Overview',
  assignments: 'Assignments',
  assessments: 'Assessments',
  reports: 'Reports',
  insights: 'AI Insights',
  settings: 'Settings',
};

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedConceptId, setSelectedConceptId] = useState(null);

  useEffect(() => {
    setProfiles(getAllProfiles());
    setAlerts(generateAlerts());
  }, []);

  const profileList = useMemo(() => Object.values(profiles), [profiles]);
  const atRisk = useMemo(() => getAtRiskStudents(profiles), [profiles]);
  const heatmap = useMemo(() => getHeatmapData(profiles), [profiles]);
  const liveActivity = useMemo(() => getLiveActivity(profiles), [profiles]);

  const classHealth = getClassHealthScore(profiles);
  const avgMastery = getClassAverageMastery(profiles);
  const activeToday = getActiveStudentsToday(profiles);

  function handleNavigate(view) {
    setActiveView(view);
    if (view === 'insights') setSelectedConceptId(null);
  }

  function renderMainContent() {
    switch (activeView) {
      case 'students':
        return <StudentsDirectory profiles={profiles} />;
      case 'classes':
        return (
          <>
            <ClassHeatmap data={heatmap} onSelectConcept={setSelectedConceptId} selectedConceptId={selectedConceptId} />
            <LearningTrends profiles={profiles} />
          </>
        );
      case 'assignments':
        return <AssignmentBuilder profiles={profiles} />;
      case 'assessments':
        return <AssessmentBuilder />;
      case 'reports':
        return <ReportsPanel profiles={profiles} />;
      case 'insights':
        return (
          <>
            <AIClassroomInsights profiles={profiles} />
            <InterventionCenter profiles={profiles} selectedConceptId={selectedConceptId} onSelectConcept={setSelectedConceptId} />
          </>
        );
      case 'settings':
        return (
          <section className="educator-card">
            <div className="educator-card-header">
              <span className="section-label">Settings</span>
              <h3 className="educator-card-title">Portal Settings</h3>
            </div>
            <p className="educator-card-desc">Classroom notifications, alert thresholds, and AI insight frequency can be configured here in a future release.</p>
            <button onClick={() => navigate('/')} className="btn-secondary text-[13px] py-2.5 px-5 mt-4">Sign Out</button>
          </section>
        );
      case 'dashboard':
      default:
        return (
          <>
            <CommandCenter
              classHealth={classHealth}
              atRiskCount={atRisk.length}
              avgMastery={avgMastery}
              activeToday={activeToday}
              onViewInsights={() => setActiveView('insights')}
            />
            <AIClassroomInsights profiles={profiles} />
            <EducatorGrid>
              <ClassHeatmap data={heatmap} onSelectConcept={setSelectedConceptId} selectedConceptId={selectedConceptId} />
              <AtRiskStudents students={atRisk} />
            </EducatorGrid>
            <EducatorGrid>
              <LearningTrends profiles={profiles} />
              <LiveMonitoring activities={liveActivity} />
            </EducatorGrid>
            <InterventionCenter profiles={profiles} selectedConceptId={selectedConceptId} onSelectConcept={setSelectedConceptId} />
          </>
        );
    }
  }

  if (!profileList.length) {
    return (
      <div className="educator-shell">
        <div className="educator-loading">Loading classroom data...</div>
      </div>
    );
  }

  return (
    <div className="educator-shell h-screen w-full overflow-hidden flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <div
        className="flex-1 min-h-0 grid overflow-hidden box-border"
        style={{ gridTemplateColumns: '256px minmax(0, 1fr) 312px', gap: '20px', padding: '20px' }}
      >
        <EducatorSidebar activeView={activeView} onNavigate={handleNavigate} alertCount={alerts.length} />

        <main className="flex flex-col min-h-0 min-w-0 overflow-hidden rounded-[14px] border" style={{ background: '#0D0D0D', borderColor: 'var(--color-border)' }}>
          <div
            className="flex-shrink-0 flex flex-wrap items-center justify-between border-b"
            style={{ gap: '24px', padding: '28px 36px', borderColor: 'var(--color-border)', background: 'rgba(10,10,10,0.5)' }}
          >
            <div className="flex flex-col gap-2.5 min-w-0">
              <h1 className="text-xl font-bold text-white m-0 leading-tight">{VIEW_TITLES[activeView]}</h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {profileList.length} students enrolled
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={() => setActiveView('reports')} className="btn-ghost text-[12px]">Export Report</button>
              <button onClick={() => navigate('/')} className="btn-secondary text-[12px] py-2.5 px-4">Sign Out</button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '36px 40px 48px' }}>
            <EducatorStack>
              {renderMainContent()}
            </EducatorStack>
          </div>
        </main>

        <EducatorInsightsPanel
          profiles={profiles}
          alerts={alerts}
          onSelectConcept={(id) => { setSelectedConceptId(id); setActiveView('insights'); }}
          selectedConceptId={selectedConceptId}
        />
      </div>
    </div>
  );
}
