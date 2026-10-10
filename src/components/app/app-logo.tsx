import type { SVGProps } from "react";

/** Appens logo: en gryde med damp. Farves via currentColor (fx text-primary). */
export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={22} opacity={0.55}>
        <path d="M206 92c-14 18-14 36 0 54s14 36 0 54" />
        <path d="M306 92c-14 18-14 36 0 54s14 36 0 54" />
      </g>
      <rect x="96" y="232" width="320" height="34" rx="17" />
      <rect x="232" y="206" width="48" height="30" rx="12" />
      <path d="M124 284h264v62c0 50-40 82-90 82h-84c-50 0-90-32-90-82z" />
      <rect x="60" y="300" width="64" height="28" rx="14" />
      <rect x="388" y="300" width="64" height="28" rx="14" />
    </svg>
  );
}
