export default function EducatorStack({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col w-full ${className}`}
      style={{ gap: '40px' }}
    >
      {children}
    </div>
  );
}

export function EducatorGrid({ children, columns = 2 }) {
  return (
    <div
      className="grid w-full"
      style={{
        gap: '32px',
        gridTemplateColumns: columns === 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
      }}
    >
      {children}
    </div>
  );
}
