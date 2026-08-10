// Toyism SVG 符号库 — 全站视觉字母表
// "先创造一套自己的点、线、角色、符号规则"

export function Symbols() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 纹理 Pattern */}
        <pattern id="dot-texture" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </pattern>
        <pattern id="dot-sparse" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="2.5" fill="currentColor" />
        </pattern>

        {/* 符号字典 */}
        <symbol id="sym-eye" viewBox="0 0 40 40">
          <ellipse cx="20" cy="20" rx="18" ry="14" fill="#F4ECD8" stroke="currentColor" strokeWidth="3" />
          <circle cx="20" cy="20" r="8" fill="currentColor" />
          <circle cx="23" cy="17" r="2.5" fill="#F4ECD8" />
        </symbol>
        <symbol id="sym-star" viewBox="0 0 40 40">
          <path
            d="M20 2 L24 14 L37 14 L27 22 L31 35 L20 27 L9 35 L13 22 L3 14 L16 14 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="sym-dot" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </symbol>
        <symbol id="sym-fish" viewBox="0 0 60 30">
          <path
            d="M5 15 Q15 5 35 10 Q50 12 55 15 Q50 18 35 20 Q15 25 5 15 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M55 15 L58 8 L52 12 L52 18 L58 22 Z" fill="currentColor" />
          <circle cx="40" cy="13" r="2" fill="#F4ECD8" />
        </symbol>
        <symbol id="sym-leaf" viewBox="0 0 40 50">
          <path
            d="M20 50 Q5 35 10 15 Q15 5 20 0 Q25 5 30 15 Q35 35 20 50 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M20 5 L20 45" stroke="#F4ECD8" strokeWidth="2" fill="none" />
        </symbol>
        <symbol id="sym-key" viewBox="0 0 50 20">
          <circle cx="8" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="8" cy="10" r="2" fill="currentColor" />
          <rect x="14" y="8" width="30" height="4" fill="currentColor" />
          <rect x="38" y="8" width="3" height="9" fill="currentColor" />
          <rect x="32" y="8" width="3" height="7" fill="currentColor" />
        </symbol>
        <symbol id="sym-cloud" viewBox="0 0 60 30">
          <path
            d="M10 25 Q5 25 5 18 Q5 12 12 12 Q14 5 22 7 Q28 3 34 8 Q42 5 48 12 Q55 12 55 18 Q55 25 50 25 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
        </symbol>
        <symbol id="sym-spiral" viewBox="0 0 40 40">
          <path
            d="M20 20 m0 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0 a12 12 0 1 1 -24 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="sym-moon" viewBox="0 0 40 40">
          <path
            d="M25 5 A15 15 0 1 0 25 35 A12 12 0 1 1 25 5 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
        </symbol>
        <symbol id="sym-tree" viewBox="0 0 40 50">
          <circle cx="20" cy="14" r="12" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="26" r="8" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="26" r="8" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <rect x="17" y="30" width="6" height="20" fill="currentColor" />
        </symbol>
        <symbol id="sym-book" viewBox="0 0 40 40">
          <path d="M5 8 L20 5 L35 8 L35 35 L20 32 L5 35 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <path d="M20 5 L20 32" stroke="#F4ECD8" strokeWidth="2" />
        </symbol>
        <symbol id="sym-folder" viewBox="0 0 40 36">
          <path d="M4 8 Q4 4 8 4 L16 4 L20 8 L32 8 Q36 8 36 12 L36 30 Q36 34 32 34 L8 34 Q4 34 4 30 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="sym-link" viewBox="0 0 40 40">
          <path d="M15 25 L25 15" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M10 20 Q5 20 5 15 Q5 8 12 8 L18 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M30 20 Q35 20 35 25 Q35 32 28 32 L22 32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="sym-tag" viewBox="0 0 40 28">
          <path d="M4 14 L14 4 L34 4 L34 24 L14 24 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="14" r="2" fill="#F4ECD8" />
        </symbol>
        <symbol id="sym-lock" viewBox="0 0 40 44">
          <rect x="6" y="20" width="28" height="20" rx="3" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <path d="M12 20 L12 12 Q12 5 20 5 Q28 5 28 12 L28 20" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="20" cy="28" r="3" fill="#F4ECD8" />
          <rect x="18.5" y="28" width="3" height="7" fill="#F4ECD8" />
        </symbol>
        <symbol id="sym-upload" viewBox="0 0 40 44">
          <path d="M20 30 L20 8 M10 18 L20 8 L30 18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 30 L5 38 Q5 42 9 42 L31 42 Q35 42 35 38 L35 30" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </symbol>
        <symbol id="sym-file" viewBox="0 0 40 48">
          <path d="M6 4 L26 4 L34 12 L34 44 L6 44 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M26 4 L26 12 L34 12" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M12 22 L28 22 M12 28 L28 28 M12 34 L22 34" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="sym-tentacle" viewBox="0 0 30 60">
          <path
            d="M15 0 Q20 15 12 25 Q5 35 15 45 Q22 52 15 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="22" cy="52" r="4" fill="currentColor" />
          <circle cx="5" cy="35" r="3" fill="currentColor" />
        </symbol>
        <symbol id="sym-bead-row" viewBox="0 0 200 12">
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={6 + i * 16} cy="6" r="4" fill="currentColor" />
          ))}
        </symbol>
      </defs>
    </svg>
  );
}
