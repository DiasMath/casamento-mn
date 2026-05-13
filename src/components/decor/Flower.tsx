import type { CSSProperties } from "react";

type Variant = "yellow" | "blue" | "mixed";

interface FlowerProps {
  className?: string;
  style?: CSSProperties;
  size?: number;
  variant?: Variant;
  rotate?: number;
  opacity?: number;
}

/**
 * Flor minimalista decorativa (SVG inline) — usada como ornamento
 * espalhado pelo site nas cores primárias amarelo/azul pastel.
 */
export function Flower({
  className,
  style,
  size = 64,
  variant = "yellow",
  rotate = 0,
  opacity = 0.7,
}: FlowerProps) {
  const petal =
    variant === "blue"
      ? "var(--primary)"
      : variant === "mixed"
        ? "var(--primary)"
        : "var(--accent)";
  const petal2 =
    variant === "mixed" ? "var(--accent)" : petal;
  const center = variant === "blue" ? "var(--accent)" : "var(--primary)";

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <g transform="translate(50 50)">
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-22"
            rx="11"
            ry="20"
            transform={`rotate(${deg})`}
            fill={i % 2 === 0 ? petal : petal2}
          />
        ))}
        <circle cx="0" cy="0" r="8" fill={center} />
        <circle cx="0" cy="0" r="3" fill="var(--background)" opacity="0.6" />
      </g>
    </svg>
  );
}

/** Pequeno galho com 2 folhas verde-pastel — ornamento sutil */
export function Sprig({
  className,
  style,
  size = 80,
  rotate = 0,
  opacity = 0.5,
}: Omit<FlowerProps, "variant">) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <path
        d="M50 90 Q50 50 50 10"
        stroke="oklch(0.75 0.06 145)"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse cx="35" cy="50" rx="14" ry="6" fill="oklch(0.82 0.08 145)" transform="rotate(-30 35 50)" />
      <ellipse cx="65" cy="35" rx="14" ry="6" fill="oklch(0.82 0.08 145)" transform="rotate(30 65 35)" />
    </svg>
  );
}
