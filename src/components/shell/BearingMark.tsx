interface BearingMarkProps {
  compact?: boolean;
}

export function BearingMark({ compact = false }: BearingMarkProps) {
  return (
    <div className={`bearing-mark${compact ? ' bearing-mark--compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 84 84" role="img">
        <defs>
          <linearGradient id="steel-ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#f3f6f7" />
            <stop offset="0.28" stopColor="#667680" />
            <stop offset="0.56" stopColor="#e9eef0" />
            <stop offset="1" stopColor="#3c4a53" />
          </linearGradient>
          <linearGradient id="cage-ring" x1="0" x2="1">
            <stop offset="0" stopColor="#a75c22" />
            <stop offset="0.5" stopColor="#f0b25d" />
            <stop offset="1" stopColor="#784017" />
          </linearGradient>
        </defs>
        <circle cx="42" cy="42" r="34" fill="none" stroke="url(#steel-ring)" strokeWidth="7" />
        <circle cx="42" cy="42" r="23" fill="none" stroke="url(#cage-ring)" strokeWidth="3" opacity=".92" />
        <g fill="url(#steel-ring)" stroke="#111b21" strokeWidth="1.2">
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index * 36 * Math.PI) / 180;
            const x = 42 + Math.cos(angle) * 28;
            const y = 42 + Math.sin(angle) * 28;
            return <circle key={index} cx={x} cy={y} r="4.6" />;
          })}
        </g>
        <circle cx="42" cy="42" r="15" fill="var(--mark-core, #081117)" stroke="url(#steel-ring)" strokeWidth="4" />
      </svg>
    </div>
  );
}
