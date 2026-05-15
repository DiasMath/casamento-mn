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
  const petal2 = variant === "mixed" ? "var(--accent)" : petal;
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
      <ellipse
        cx="35"
        cy="50"
        rx="14"
        ry="6"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(-30 35 50)"
      />
      <ellipse
        cx="65"
        cy="35"
        rx="14"
        ry="6"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(30 65 35)"
      />
    </svg>
  );
}

export function Branch({
  className,
  style,
  size = 120,
  rotate = 0,
  opacity = 0.45,
}: Omit<FlowerProps, "variant">) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 120 200"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <path
        d="M60 180 Q55 140 60 100 Q65 60 60 20"
        stroke="oklch(0.75 0.06 145)"
        strokeWidth="2"
        fill="none"
      />
      <ellipse
        cx="40"
        cy="150"
        rx="18"
        ry="8"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(-25 40 150)"
      />
      <ellipse
        cx="80"
        cy="130"
        rx="16"
        ry="7"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(25 80 130)"
      />
      <ellipse
        cx="35"
        cy="110"
        rx="15"
        ry="6"
        fill="oklch(0.78 0.10 145)"
        transform="rotate(-20 35 110)"
      />
      <ellipse
        cx="85"
        cy="90"
        rx="17"
        ry="7"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(30 85 90)"
      />
      <ellipse
        cx="45"
        cy="70"
        rx="14"
        ry="6"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(-35 45 70)"
      />
      <ellipse
        cx="75"
        cy="50"
        rx="13"
        ry="5"
        fill="oklch(0.78 0.10 145)"
        transform="rotate(20 75 50)"
      />
      <ellipse
        cx="55"
        cy="30"
        rx="10"
        ry="4"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(-10 55 30)"
      />
    </svg>
  );
}

export function Vine({
  className,
  style,
  size = 100,
  rotate = 0,
  opacity = 0.4,
}: Omit<FlowerProps, "variant">) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 80 150"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <path
        d="M40 140 Q30 100 40 60 Q50 20 40 -5"
        stroke="oklch(0.75 0.06 145)"
        strokeWidth="1.2"
        fill="none"
      />
      <ellipse
        cx="25"
        cy="120"
        rx="8"
        ry="4"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(-40 25 120)"
      />
      <ellipse
        cx="55"
        cy="105"
        rx="7"
        ry="3"
        fill="oklch(0.78 0.10 145)"
        transform="rotate(35 55 105)"
      />
      <ellipse
        cx="22"
        cy="85"
        rx="7"
        ry="3"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(-30 22 85)"
      />
      <ellipse
        cx="58"
        cy="70"
        rx="8"
        ry="4"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(40 58 70)"
      />
      <ellipse
        cx="28"
        cy="50"
        rx="6"
        ry="3"
        fill="oklch(0.78 0.10 145)"
        transform="rotate(-25 28 50)"
      />
      <ellipse
        cx="52"
        cy="35"
        rx="7"
        ry="3"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(30 52 35)"
      />
      <ellipse
        cx="38"
        cy="15"
        rx="5"
        ry="2"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(-15 38 15)"
      />
    </svg>
  );
}

export function Garland({
  className,
  style,
  size = 200,
  rotate = 0,
  opacity = 0.35,
}: Omit<FlowerProps, "variant">) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 200 60"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <path
        d="M10 30 Q50 10 100 30 Q150 50 190 30"
        stroke="oklch(0.75 0.06 145)"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse
        cx="30"
        cy="22"
        rx="8"
        ry="4"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(-20 30 22)"
      />
      <ellipse
        cx="55"
        cy="16"
        rx="7"
        ry="3"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(15 55 16)"
      />
      <ellipse
        cx="80"
        cy="18"
        rx="8"
        ry="4"
        fill="oklch(0.78 0.10 145)"
        transform="rotate(-25 80 18)"
      />
      <ellipse
        cx="105"
        cy="22"
        rx="7"
        ry="3"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(20 105 22)"
      />
      <ellipse
        cx="125"
        cy="18"
        rx="8"
        ry="4"
        fill="oklch(0.80 0.09 145)"
        transform="rotate(-15 125 18)"
      />
      <ellipse
        cx="150"
        cy="16"
        rx="7"
        ry="3"
        fill="oklch(0.78 0.10 145)"
        transform="rotate(25 150 16)"
      />
      <ellipse
        cx="175"
        cy="22"
        rx="8"
        ry="4"
        fill="oklch(0.82 0.08 145)"
        transform="rotate(-20 175 22)"
      />
    </svg>
  );
}
