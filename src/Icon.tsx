export type IconName =
  | "whistle"
  | "runner"
  | "chart"
  | "mic"
  | "mic-off"
  | "flame"
  | "trophy";

/**
 * Hand-drawn SVG marks rather than emoji: these inherit currentColor, so one
 * icon works on the green header and the cream card without a second asset,
 * and they stay sharp at the 20px the tab bar renders them at.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  whistle: (
    <>
      <circle cx="8.5" cy="14" r="5.5" />
      <circle cx="8.5" cy="14" r="1.7" />
      <path d="M12.8 10 21 7.9l-.9 3.4" />
    </>
  ),
  runner: (
    <>
      <circle cx="16" cy="4.2" r="2.2" />
      <path d="M9.5 21.5 12.5 16l3.3-2.6L14 8.8l-3.6 2.1L9 14" />
      <path d="m14 8.8 4 2.2 1.2 4" />
      <path d="M3.5 12.5h4M2.5 16.5h3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 3.5v17h16.5" />
      <path d="M8 17.5v-4M13 17.5v-7M18 17.5v-11" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M12 18.5v3" />
    </>
  ),
  "mic-off": (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M12 18.5v3" />
      <path d="M3.5 3.5l17 17" />
    </>
  ),
  flame: (
    <>
      <path d="M12 2.5c3 4 5 6.2 5 9.2a5 5 0 0 1-10 0c0-2 1-3.6 2-4.6 0 1.6.5 2.6 1.5 2.6 1.6 0 2.1-2.1 1.5-7.2Z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3.5h10v5a5 5 0 0 1-10 0Z" />
      <path d="M7 5.5H4v1.5a3 3 0 0 0 3 3M17 5.5h3V7a3 3 0 0 1-3 3" />
      <path d="M12 13.5v4M8.5 20.5h7" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
