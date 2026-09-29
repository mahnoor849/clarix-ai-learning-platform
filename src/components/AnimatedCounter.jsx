import { useState, useEffect } from 'react';

export default function AnimatedCounter({ end, suffix = '', duration = 2000, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <div className="landing-metric">
      <div className="landing-metric-value">{count}{suffix}</div>
      <div className="landing-metric-label">{label}</div>
    </div>
  );
}
