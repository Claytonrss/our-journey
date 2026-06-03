interface CompassRoseProps {
  size?: number;
  opacity?: number;
  className?: string;
}

export function CompassRose({
  size = 280,
  opacity = 0.06,
  className,
}: CompassRoseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <circle
        cx="140"
        cy="140"
        r="120"
        stroke="var(--gold)"
        strokeWidth="0.5"
      />
      <circle cx="140" cy="140" r="80" stroke="var(--gold)" strokeWidth="0.5" />
      <line
        x1="140"
        y1="10"
        x2="140"
        y2="270"
        stroke="var(--gold)"
        strokeWidth="0.5"
      />
      <line
        x1="10"
        y1="140"
        x2="270"
        y2="140"
        stroke="var(--gold)"
        strokeWidth="0.5"
      />
      <line
        x1="45"
        y1="45"
        x2="235"
        y2="235"
        stroke="var(--gold)"
        strokeWidth="0.3"
      />
      <line
        x1="235"
        y1="45"
        x2="45"
        y2="235"
        stroke="var(--gold)"
        strokeWidth="0.3"
      />
      <polygon
        points="140,20 145,50 140,40 135,50"
        fill="var(--gold)"
        opacity="0.6"
      />
      <polygon
        points="140,260 145,230 140,240 135,230"
        fill="var(--gold)"
        opacity="0.4"
      />
      <polygon
        points="20,140 50,135 40,140 50,145"
        fill="var(--gold)"
        opacity="0.4"
      />
      <polygon
        points="260,140 230,135 240,140 230,145"
        fill="var(--gold)"
        opacity="0.4"
      />
    </svg>
  );
}
