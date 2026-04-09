interface BrandMarkProps {
  size?: number
}

export function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="6"
        width="60"
        height="60"
        rx="24"
        fill="url(#cw-shell)"
        stroke="rgba(124, 146, 188, 0.22)"
      />
      <circle cx="50" cy="20" r="10" fill="url(#cw-ambient)" />
      <path
        d="M21 25.8C21 20.3876 25.3876 16 30.8 16H42.2"
        stroke="#152236"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M42.4 16C48.2542 16 53 20.7458 53 26.6V31.2"
        stroke="#152236"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M53 31.4C53 37.2542 48.2542 42 42.4 42H35.6"
        stroke="#152236"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M33.9 44.8C31.9056 42.8056 28.6723 42.8056 26.6779 44.8L21.2 50.2779C19.2056 52.2723 19.2056 55.5056 21.2 57.5C23.1944 59.4944 26.4277 59.4944 28.4221 57.5L33.9 52.0221C35.8944 50.0277 35.8944 46.7944 33.9 44.8Z"
        fill="url(#cw-accent)"
      />
      <path d="M36.1 42.8L30 48.9" stroke="#F17A3D" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M36 41.8L40.7 37.1" stroke="#152236" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <linearGradient id="cw-shell" x1="12" y1="8" x2="60" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCFEFF" />
          <stop offset="0.58" stopColor="#ECF3FF" />
          <stop offset="1" stopColor="#DFE9FB" />
        </linearGradient>
        <radialGradient
          id="cw-ambient"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(50 20) rotate(90) scale(10)"
        >
          <stop stopColor="#8EB1FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8EB1FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cw-accent" x1="21" y1="43.3" x2="33.4" y2="58.3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB770" />
          <stop offset="1" stopColor="#FF8555" />
        </linearGradient>
      </defs>
    </svg>
  )
}
