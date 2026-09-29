export default function SkillRadarChart({ data, size = 220 }) {
  const center = size / 2;
  const radius = size / 2 - 30;
  const count = data.length;
  const angleStep = (2 * Math.PI) / count;

  function point(i, value) {
    const angle = angleStep * i - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  }

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = data.map((d, i) => point(i, d.value));
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map(level => {
        const pts = data.map((_, i) => {
          const p = point(i, level);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon key={level} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}
      {data.map((_, i) => {
        const p = point(i, 100);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(94,106,210,0.25)" stroke="var(--color-primary-light)" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-primary-light)" />
      ))}
      {data.map((d, i) => {
        const labelPt = point(i, 115);
        return (
          <text key={i} x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle"
            fill="var(--color-text-muted)" fontSize="9" fontWeight="600">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
