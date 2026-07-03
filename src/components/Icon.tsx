// Themed line-art icon set. All icons use `currentColor` so they inherit the
// neon color + glow from their surrounding element. No emoji anywhere in the UI.

export type IconName =
  | 'rocket'
  | 'saturn'
  | 'ufo'
  | 'telescope'
  | 'tornado'
  | 'radar'
  | 'rewind'
  | 'impact'
  | 'clock'
  | 'speaker'
  | 'orbit'
  | 'alert';

const PATHS: Record<IconName, JSX.Element> = {
  rocket: (
    <>
      <path d="M12 3c3 2.4 4.5 5.7 4.5 9.2 0 1.2-.2 2.4-.5 3.5L12 18.4l-4-2.7c-.3-1.1-.5-2.3-.5-3.5C7.5 8.7 9 5.4 12 3z" />
      <circle cx="12" cy="10.2" r="1.7" />
      <path d="M8 15.2l-2.6 2 .9 3.1 3.1-1.6M16 15.2l2.6 2-.9 3.1-3.1-1.6" />
    </>
  ),
  saturn: (
    <>
      <circle cx="12" cy="12" r="5" />
      <ellipse cx="12" cy="12" rx="9.3" ry="3.2" transform="rotate(-20 12 12)" />
    </>
  ),
  ufo: (
    <>
      <path d="M7 12a5 5 0 0 1 10 0" />
      <ellipse cx="12" cy="13" rx="8.5" ry="3" />
      <path d="M7.5 16.2l-1.5 3M12 16.7v3M16.5 16.2l1.5 3" />
    </>
  ),
  telescope: (
    <>
      <path d="M3.5 14.6l9.3-5.4 2 3.5-9.3 5.4z" />
      <path d="M12.8 9.2l3-1.8 2 3.5-3 1.8" />
      <path d="M6.5 17.8l-1.8 3M9.5 16.2l1.4 3.6" />
    </>
  ),
  tornado: (
    <>
      <path d="M4 6c3 1.5 13 1.5 16 0" />
      <path d="M6 10c2.4 1.2 9.6 1.2 12 0" />
      <path d="M8 14c1.7.9 6.3.9 8 0" />
      <path d="M10.5 18c.9.5 2.1.5 3 0" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="17" r="2" />
      <path d="M8.8 13.6a4.5 4.5 0 0 1 6.4 0" />
      <path d="M6 11a8.5 8.5 0 0 1 12 0" />
    </>
  ),
  rewind: (
    <>
      <path d="M11 6.5 5 12l6 5.5z" fill="currentColor" stroke="none" />
      <path d="M19 6.5 13 12l6 5.5z" fill="currentColor" stroke="none" />
    </>
  ),
  impact: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M6 6l2.4 2.4M15.6 15.6 18 18M18 6l-2.4 2.4M8.4 15.6 6 18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  speaker: (
    <>
      <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5z" />
      <path d="M16 9.2a4 4 0 0 1 0 5.6M18.5 7a7 7 0 0 1 0 10" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)" />
      <circle cx="19.4" cy="9.3" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 21 19H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
};

interface Props {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 22, className }: Props) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
