import { useState, useEffect } from 'react';

function simulateJavaOutput(code) {
  const outputs = [];
  const printMatches = code.matchAll(/System\.out\.println\(([^)]+)\)/g);
  for (const match of printMatches) {
    const expr = match[1].trim();
    if (expr.startsWith('"') && expr.endsWith('"')) {
      outputs.push(expr.slice(1, -1));
    } else if (expr.includes('+')) {
      const parts = expr.split('+').map(p => p.trim().replace(/"/g, ''));
      outputs.push(parts.join(''));
    } else {
      outputs.push(expr);
    }
  }
  if (outputs.length === 0) {
    if (code.includes('new ')) return ['Object created successfully ✓'];
    return ['// Code compiled. No output statements found.', '// Add System.out.println() to see output.'];
  }
  return outputs;
}

export default function CodePlayground({ initialCode, title = 'Try It Yourself', onRun }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setOutput(null);
    setError(null);
    setHasRun(false);
  }, [initialCode]);

  function handleRun() {
    setRunning(true);
    setError(null);
    setOutput(null);
    setTimeout(() => {
      try {
        if (!code.trim()) {
          setError('No code to run');
          setRunning(false);
          return;
        }
        const results = simulateJavaOutput(code);
        setOutput(results.join('\n'));
        setHasRun(true);
        onRun?.();
      } catch {
        setError('Compilation error: check your syntax');
      }
      setRunning(false);
    }, 400);
  }

  function handleReset() {
    setCode(initialCode);
    setOutput(null);
    setError(null);
    setHasRun(false);
  }

  return (
    <div className="code-playground my-6">
      <div className="code-editor-header">
        <div className="flex items-center gap-2">
          <div className="code-editor-dots">
            <span style={{ background: '#FF5F57' }} /><span style={{ background: '#FEBC2E' }} /><span style={{ background: '#28C840' }} />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{title}</span>
          {hasRun && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--color-accent-emerald)' }}>✓ Executed</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleReset} className="text-[10px] text-[var(--color-text-secondary)] hover:text-white transition-colors uppercase font-bold tracking-widest px-2 py-1">Reset</button>
          <button type="button" onClick={handleRun} disabled={running} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md transition-all"
            style={{ background: running ? 'rgba(255,255,255,0.05)' : 'var(--color-primary)', color: running ? 'var(--color-text-muted)' : '#fff' }}>
            {running ? 'Running...' : '▶ Run Code'}
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="code-playground-editor"
        spellCheck={false}
      />
      <div className="code-playground-output" style={{ minHeight: output || error ? 'auto' : '0', padding: output || error ? '12px 16px' : '0', borderTop: output || error ? '1px solid var(--color-border)' : 'none' }}>
        {(output || error) && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Output</div>
            <pre className={`text-[12px] font-mono whitespace-pre-wrap ${error ? 'text-[var(--color-accent-rose)]' : 'text-[var(--color-accent-emerald)]'}`}>
              {error || output}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
