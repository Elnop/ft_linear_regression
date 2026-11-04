export function NorminetteArt() {
  return (
    <>
      <rect width="180" height="82" rx="8" fill="#f6f2e8" />
      <rect x="7" y="7" width="166" height="68" rx="4" fill="none" stroke="#1f9d55" strokeWidth="3" />
      <rect x="12" y="12" width="156" height="58" rx="2" fill="none" stroke="#1f9d55" strokeWidth="1.5" />
      <text x="90" y="44" textAnchor="middle" fontFamily="var(--anton)" fontSize="26" fill="#1f9d55" letterSpacing="2">
        NORMINETTE
      </text>
      <path d="M44 56 l4 4 l8 -9" fill="none" stroke="#1f9d55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="62" y="62" fontFamily="var(--monospace)" fontWeight="800" fontSize="12" fill="#1f9d55">
        OK · 0 ERROR
      </text>
    </>
  );
}
