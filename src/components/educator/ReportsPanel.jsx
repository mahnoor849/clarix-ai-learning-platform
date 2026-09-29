import { buildWeeklyReport } from '../../utils/educatorAnalytics';

export default function ReportsPanel({ profiles }) {
  const report = buildWeeklyReport(profiles);

  function handleDownload() {
    const text = `Clarix — Weekly Class Report
Generated: ${report.generatedAt}

Class Health: ${report.classHealth}%
Average Mastery: ${report.averageMastery}%
At-Risk Students: ${report.atRiskCount}
Active Students: ${report.activeStudents}
Hint Dependency: ${report.hintDependency} students

Weak Concepts: ${report.weakConcepts.join(', ') || 'None'}

Mastery Trend:
${report.trend.map(t => `  ${t.week}: ${t.pct}%`).join('\n')}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnshift-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="educator-stack">
      <div className="educator-card">
        <div className="educator-card-header">
          <span className="section-label">Reports</span>
          <h3 className="educator-card-title">Weekly Performance Report</h3>
          <p className="educator-card-desc">Generated {report.generatedAt}</p>
        </div>
        <div className="educator-report-grid">
          {[
            { label: 'Class Health', value: `${report.classHealth}%` },
            { label: 'Avg Mastery', value: `${report.averageMastery}%` },
            { label: 'At-Risk', value: report.atRiskCount },
            { label: 'Active Today', value: report.activeStudents },
          ].map(item => (
            <div key={item.label} className="educator-report-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="educator-report-section">
          <span className="educator-trend-label">Learning Growth</span>
          <div className="educator-report-trend">
            {report.trend.map(t => (
              <div key={t.week} className="educator-report-trend-item">
                <span>{t.week}</span>
                <strong>{t.pct}%</strong>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleDownload} className="btn-secondary text-[13px] py-2.5 px-5">
          Download Analytics Report
        </button>
      </div>
    </section>
  );
}
