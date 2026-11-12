/**
 * Ícones SVG em linha (stroke), estilo consistente. Todos ocupam um viewBox
 * de 24x24 e herdam a cor via `color` (currentColor).
 */
type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = ({ size = 48, color = "currentColor", strokeWidth = 2 }: IconProps) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconServer: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
    <circle cx="7" cy="7" r="0.9" fill={p.color ?? "currentColor"} />
    <circle cx="7" cy="17" r="0.9" fill={p.color ?? "currentColor"} />
  </svg>
);

export const IconGamepad: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M6 9h12a4 4 0 0 1 4 4v1.5a3.5 3.5 0 0 1-6.3 2.1L15 15H9l-.7 1.6A3.5 3.5 0 0 1 2 14.5V13a4 4 0 0 1 4-4Z" />
    <path d="M7 12v2M6 13h2M16.5 12.5h.01M18.5 14h.01" />
  </svg>
);

export const IconMonitor: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

export const IconCar: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z" />
    <circle cx="7.5" cy="13.5" r="1" fill={p.color ?? "currentColor"} />
    <circle cx="16.5" cy="13.5" r="1" fill={p.color ?? "currentColor"} />
  </svg>
);

export const IconChip: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill={p.color ?? "currentColor"} />
    <path d="M9 2v4M12 2v4M15 2v4M9 18v4M12 18v4M15 18v4M2 9h4M2 12h4M2 15h4M18 9h4M18 12h4M18 15h4" />
  </svg>
);

export const IconFactory: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M3 20V9l5 3V9l5 3V9l5 3v8H3Z" />
    <path d="M17 12V5h3v7" />
    <path d="M7 16h2M11 16h2M15 16h2" />
  </svg>
);

export const IconGlobe: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
  </svg>
);

export const IconBan: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.5 5.5l13 13" />
  </svg>
);

export const IconWarning: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M12 3 2.5 19.5h19L12 3Z" />
    <path d="M12 9v5" />
    <circle cx="12" cy="17" r="0.9" fill={p.color ?? "currentColor"} />
  </svg>
);

export const IconRobot: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <rect x="5" y="8" width="14" height="11" rx="2" />
    <path d="M12 4v4M9 4h6" />
    <circle cx="9.5" cy="13" r="1" fill={p.color ?? "currentColor"} />
    <circle cx="14.5" cy="13" r="1" fill={p.color ?? "currentColor"} />
    <path d="M9 16.5h6M2 12v4M22 12v4" />
  </svg>
);

export const IconUser: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const IconCoin: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.5h3.5a1.75 1.75 0 0 1 0 3.5h-2a1.75 1.75 0 0 0 0 3.5H15" />
  </svg>
);

export const IconTrendUp: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

export const IconTrendDown: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M14 17h7v-7" />
  </svg>
);

export const IconCloud: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.2 4.5 4.5 0 0 0 7 18Z" />
  </svg>
);

export const IconBrain: React.FC<IconProps> = (p) => (
  <svg {...base(p)}>
    <path d="M9.5 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2 3 3 0 0 0 1 5.3A3 3 0 0 0 9.5 21c1 0 2-.5 2.5-1.3V4.3A3 3 0 0 0 9.5 3Z" />
    <path d="M14.5 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2 3 3 0 0 1-1 5.3A3 3 0 0 1 14.5 21c-1 0-2-.5-2.5-1.3V4.3A3 3 0 0 1 14.5 3Z" />
  </svg>
);
