// app-svg.js
// v6: ПОЛНАЯ ПЕРЕРАБОТКА С ГРАДИЕНТАМИ, СКЛАДКАМИ И РЕАЛИСТИЧНЫМИ РУКАВАМИ
// Использованы SVG linearGradient/radialGradient для объёма ткани.
// Каждый предмет одежды — минимум 5 слоёв: база + тень + блик + складки + детали.

const SKIN = "#e8b48a", SKIN_D = "#c99b6f", SKIN_S = "#a87a4f", SKIN_L = "#f8d4b0";

const CUSTOM_IMAGES = {
    "lh_tyanka":  { url: "/assets/hands/lh_tyanka.png",  side: "left",  y: 0,   w: 230, h: 400 },
    "lh_tyanka2": { url: "/assets/hands/lh_tyanka2.png", side: "left",  y: 160, w: 160, h: 240 },
    "rh_miku":    { url: "/assets/hands/rh_miku.png",    side: "right", y: 0,   w: 230, h: 400 },
    "rh_tyanka3": { url: "/assets/hands/rh_tyanka3.png", side: "right", y: 0,   w: 230, h: 400 }
};
// ═══════════════════════════════════════════════════════════
//  СЛИВЫ (пути для рукавов)
//  SL = Sleeve Long (длинный, до запястья)
//  SS = Sleeve Short (короткий, до бицепса)
//  L/R = Left/Right
// ═══════════════════════════════════════════════════════════

// Короткие рукава (майки-футболки, гавайка, худи-футболка)
const SS_L = "M66 96 Q54 102 52 128 L64 130 Q64 112 72 102 Z";
const SS_R = "M134 96 Q146 102 148 128 L136 130 Q136 112 128 102 Z";

// Длинные рукава (пиджаки, куртки, пуховики, худи, рубашки)
const SL_L = "M66 96 Q54 106 52 140 L48 188 Q48 195 54 197 L62 196 Q66 190 64 175 L66 145 L74 118 L74 100 Z";
const SL_R = "M134 96 Q146 106 148 140 L152 188 Q152 195 146 197 L138 196 Q134 190 136 175 L134 145 L126 118 L126 100 Z";
// ==================================================================
// SVG DEFS: градиенты для объёма ткани.
// Используются через url(#id) внутри ITEMS_SVG.
// ==================================================================
function renderDefs() {
  return `<defs>
    <linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5f5f5"/>
      <stop offset="50%" stop-color="#e8e8e8"/>
      <stop offset="100%" stop-color="#d8d8d8"/>
    </linearGradient>
    <linearGradient id="gBlack" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="50%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d94436"/>
      <stop offset="50%" stop-color="#b02a1d"/>
      <stop offset="100%" stop-color="#8b1a0d"/>
    </linearGradient>
    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ab3f3"/>
      <stop offset="50%" stop-color="#4a90d9"/>
      <stop offset="100%" stop-color="#2c6ba0"/>
    </linearGradient>
    <linearGradient id="gBrown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a06030"/>
      <stop offset="50%" stop-color="#7a4520"/>
      <stop offset="100%" stop-color="#5a2e0a"/>
    </linearGradient>
    <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe66d"/>
      <stop offset="50%" stop-color="#d4ac0d"/>
      <stop offset="100%" stop-color="#b8860b"/>
    </linearGradient>
    <linearGradient id="gPink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f06292"/>
      <stop offset="50%" stop-color="#e91e63"/>
      <stop offset="100%" stop-color="#c2185b"/>
    </linearGradient>
    <linearGradient id="gNavy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3d5060"/>
      <stop offset="50%" stop-color="#2c3e50"/>
      <stop offset="100%" stop-color="#1a252f"/>
    </linearGradient>
    <linearGradient id="gGray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#95a5a6"/>
      <stop offset="50%" stop-color="#7f8c8d"/>
      <stop offset="100%" stop-color="#5a6a6a"/>
    </linearGradient>
    <radialGradient id="shadowUnder" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.35)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <pattern id="plaid" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#b02a1d"/>
      <path d="M0,0 L20,0 M0,10 L20,10 M0,0 L0,20 M10,0 L10,20" stroke="#5a0f08" stroke-width="1.2" opacity="0.6"/>
    </pattern>
    <pattern id="camo" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#5a6b3a"/>
      <ellipse cx="5" cy="5" rx="4" ry="3" fill="#3a4a2a"/>
      <ellipse cx="15" cy="12" rx="5" ry="4" fill="#6b7b4a"/>
      <ellipse cx="8" cy="17" rx="3" ry="2.5" fill="#3a4a2a"/>
    </pattern>
  </defs>`;
}

// ==================================================================
// БАЗОВОЕ ТЕЛО (без изменений — работает корректно)
// ==================================================================
function renderBaseBody() {
  return `
    <ellipse cx="100" cy="389" rx="58" ry="7" fill="rgba(0,0,0,0.42)"/>
    <ellipse cx="100" cy="389" rx="44" ry="4" fill="rgba(0,0,0,0.28)"/>
    <path d="M75 200 L74 355 Q74 372 82 374 L98 374 L99 200 Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M97 210 L97 374 L99 374 L99 210 Z" fill="${SKIN_S}" opacity="0.28"/>
    <path d="M77 235 L77 275" stroke="${SKIN_L}" stroke-width="2" opacity="0.32" stroke-linecap="round"/>
    <ellipse cx="87" cy="285" rx="4" ry="2.5" fill="${SKIN_L}" opacity="0.32"/>
    <path d="M101 200 L101 374 L118 374 Q126 372 126 355 L125 200 Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M101 210 L101 374 L103 374 L103 210 Z" fill="${SKIN_S}" opacity="0.28"/>
    <path d="M123 235 L123 275" stroke="${SKIN_L}" stroke-width="2" opacity="0.32" stroke-linecap="round"/>
    <ellipse cx="113" cy="285" rx="4" ry="2.5" fill="${SKIN_L}" opacity="0.32"/>
    <ellipse cx="86" cy="377" rx="16" ry="7" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="114" cy="377" rx="16" ry="7" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <circle cx="76" cy="377" r="1.6" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="81" cy="378" r="1.8" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="86" cy="379" r="1.8" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="91" cy="379" r="1.6" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="109" cy="379" r="1.6" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="114" cy="379" r="1.8" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="119" cy="378" r="1.8" fill="${SKIN_S}" opacity="0.42"/>
    <circle cx="124" cy="377" r="1.6" fill="${SKIN_S}" opacity="0.42"/>
    <path d="M72 100 Q68 100 68 110 L70 205 L130 205 L132 110 Q132 100 128 100 Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M105 102 L105 205 L130 205 L132 110 Q132 103 128 102 Z" fill="${SKIN_S}" opacity="0.14"/>
    <path d="M78 118 Q90 124 100 122 Q110 124 122 118" stroke="${SKIN_D}" stroke-width="0.7" fill="none" opacity="0.55"/>
    <path d="M100 125 L100 142" stroke="${SKIN_D}" stroke-width="0.5" opacity="0.42"/>
    <path d="M90 152 L110 152 M90 165 L110 165" stroke="${SKIN_D}" stroke-width="0.4" opacity="0.35"/>
    <path d="M100 148 L100 180" stroke="${SKIN_D}" stroke-width="0.3" opacity="0.28"/>
    <circle cx="100" cy="191" r="1.1" fill="${SKIN_S}" opacity="0.55"/>
    <path d="M90 78 L90 102 Q100 106 110 102 L110 78 Z" fill="${SKIN}"/>
    <path d="M90 94 Q100 100 110 94 L110 102 Q100 106 90 102 Z" fill="${SKIN_S}" opacity="0.35"/>
    <ellipse cx="70" cy="108" rx="14" ry="12" fill="${SKIN}"/>
    <ellipse cx="130" cy="108" rx="14" ry="12" fill="${SKIN}"/>
    <ellipse cx="70" cy="107" rx="9" ry="7" fill="${SKIN_L}" opacity="0.28"/>
    <ellipse cx="130" cy="107" rx="9" ry="7" fill="${SKIN_L}" opacity="0.28"/>
    <path d="M68 105 Q56 115 52 145 L48 185 Q46 195 54 197 L62 196 Q66 190 64 175 L66 140 L74 118 Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M67 110 Q60 125 57 148 L53 178" stroke="${SKIN_L}" stroke-width="1.8" fill="none" opacity="0.33" stroke-linecap="round"/>
    <ellipse cx="55" cy="197" rx="11" ry="10" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="55" cy="194" rx="7" ry="4" fill="${SKIN_L}" opacity="0.28"/>
    <path d="M46 195 Q46 200 55 202 Q64 200 64 195" stroke="${SKIN_D}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M47 197 L47 201 M50 198 L50 202 M53 198 L53 202 M56 198 L56 202 M59 198 L59 202 M62 197 L62 201" stroke="${SKIN_S}" stroke-width="0.35" opacity="0.55"/>
    <ellipse cx="62" cy="191" rx="3.5" ry="4.5" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.4"/>
    <path d="M132 105 Q144 115 148 145 L152 185 Q154 195 146 197 L138 196 Q134 190 136 175 L134 140 L126 118 Z" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M133 110 Q140 125 143 148 L147 178" stroke="${SKIN_L}" stroke-width="1.8" fill="none" opacity="0.33" stroke-linecap="round"/>
    <ellipse cx="145" cy="197" rx="11" ry="10" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="145" cy="194" rx="7" ry="4" fill="${SKIN_L}" opacity="0.28"/>
    <path d="M136 195 Q136 200 145 202 Q154 200 154 195" stroke="${SKIN_D}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M137 197 L137 201 M140 198 L140 202 M143 198 L143 202 M146 198 L146 202 M149 198 L149 202 M152 197 L152 201" stroke="${SKIN_S}" stroke-width="0.35" opacity="0.55"/>
    <ellipse cx="138" cy="191" rx="3.5" ry="4.5" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.4"/>
    <ellipse cx="100" cy="55" rx="29" ry="33" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="110" cy="58" rx="17" ry="27" fill="${SKIN_S}" opacity="0.12"/>
    <ellipse cx="92" cy="40" rx="13" ry="9" fill="${SKIN_L}" opacity="0.42"/>
    <ellipse cx="84" cy="65" rx="5" ry="3" fill="#e8a882" opacity="0.55"/>
    <ellipse cx="116" cy="65" rx="5" ry="3" fill="#e8a882" opacity="0.55"/>
    <ellipse cx="71" cy="55" rx="4.5" ry="7" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="71" cy="55" rx="2" ry="4" fill="${SKIN_S}" opacity="0.5"/>
    <ellipse cx="129" cy="55" rx="4.5" ry="7" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="129" cy="55" rx="2" ry="4" fill="${SKIN_S}" opacity="0.5"/>
    <path d="M71 47 Q70 20 100 17 Q130 20 129 47 Q128 36 100 32 Q72 36 71 47 Z" fill="#3d2818"/>
    <path d="M75 34 Q85 25 95 24" stroke="#6b4a2e" stroke-width="1.2" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M105 24 Q115 26 123 34" stroke="#5a3a24" stroke-width="0.8" fill="none" opacity="0.4" stroke-linecap="round"/>
    <path d="M82 44 Q87 41 94 43" stroke="#2a1e10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M106 43 Q113 41 118 44" stroke="#2a1e10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="88" cy="51" rx="5" ry="4.2" fill="#fff"/>
    <ellipse cx="112" cy="51" rx="5" ry="4.2" fill="#fff"/>
    <circle cx="89" cy="51" r="3" fill="#4a2e18"/>
    <circle cx="111" cy="51" r="3" fill="#4a2e18"/>
    <circle cx="89" cy="51" r="1.6" fill="#000"/>
    <circle cx="111" cy="51" r="1.6" fill="#000"/>
    <circle cx="90" cy="50" r="1" fill="#fff"/>
    <circle cx="112" cy="50" r="1" fill="#fff"/>
    <path d="M83 51 Q88 47 93 51" stroke="#3d2818" stroke-width="0.8" fill="none"/>
    <path d="M107 51 Q112 47 117 51" stroke="#3d2818" stroke-width="0.8" fill="none"/>
    <path d="M100 55 Q98.5 61 97 64 Q100 66 103 64 Q101.5 61 100 55 Z" fill="${SKIN_S}" opacity="0.45"/>
    <ellipse cx="98" cy="64" rx="1" ry="0.7" fill="${SKIN_S}" opacity="0.65"/>
    <ellipse cx="102" cy="64" rx="1" ry="0.7" fill="${SKIN_S}" opacity="0.65"/>
    <path d="M92 73 Q96 71 100 72 Q104 71 108 73 Q104 77 100 77 Q96 77 92 73 Z" fill="#a0663c" opacity="0.75"/>
    <path d="M92 73 Q100 76 108 73" stroke="#7a4420" stroke-width="0.5" fill="none"/>
    <ellipse cx="100" cy="80" rx="6" ry="2" fill="${SKIN_S}" opacity="0.2"/>
  `;
}
const ITEMS_SVG = {

  // ==================================================================
  // ГОЛОВА — все с градиентами, тенями, деталями
  // ==================================================================

  h_cig: `<g transform="translate(115, 70) rotate(-15)">
    <ellipse cx="17" cy="6" rx="20" ry="3" fill="rgba(0,0,0,0.25)"/>
    <rect x="0" y="-2" width="34" height="4" rx="1.5" fill="#fafafa" stroke="#d0d0d0" stroke-width="0.4"/>
    <rect x="0" y="-2" width="34" height="1" fill="#fff" opacity="0.7"/>
    <rect x="0" y="1" width="34" height="1" fill="#c0c0c0" opacity="0.4"/>
    <rect x="4" y="-2" width="13" height="4" fill="#d4a97a"/>
    <rect x="4" y="-2" width="13" height="0.8" fill="#e8c090" opacity="0.6"/>
    <circle cx="34" cy="0" r="3.5" fill="#ff5500" opacity="0.4"/>
    <circle cx="34" cy="0" r="2.5" fill="#ff6600"/>
    <circle cx="34" cy="0" r="1.5" fill="#ffcc00"/>
    <circle cx="34" cy="-1" r="0.6" fill="#fff"/>
    <circle cx="37" cy="-4" r="2" fill="#bbb" opacity="0.4"/>
    <circle cx="39" cy="-7" r="1.5" fill="#ccc" opacity="0.25"/>
    <circle cx="40" cy="-10" r="1" fill="#ddd" opacity="0.15"/>
  </g>`,

  h_cap: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M72 36 Q100 10 128 36" fill="#2a2a2a" opacity="0.5"/>
    <path d="M74 36 Q100 12 126 36" stroke="#444" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M80 30 Q100 20 120 30" stroke="#333" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M74 32 L78 34 M122 34 L126 32" stroke="#1a1a1a" stroke-width="0.4" opacity="0.6"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#0a0a0a"/>
    <path d="M132 40 Q150 40 158 43" stroke="#222" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M132 42 Q148 42 157 44" stroke="#0a0a0a" stroke-width="0.5" fill="none"/>
    <path d="M134 46 Q148 46 156 47" stroke="#000" stroke-width="0.4" fill="none" opacity="0.5"/>
    <circle cx="100" cy="10" r="2.8" fill="#2a2a2a"/>
    <circle cx="100" cy="10" r="1.8" fill="#444"/>
    <circle cx="100" cy="10" r="0.8" fill="#666"/>
    <path d="M72 42 Q100 40 128 42" stroke="#333" stroke-width="0.5" fill="none" opacity="0.7"/>
    <path d="M73 42 L74 44 M126 44 L127 42" stroke="#1a1a1a" stroke-width="0.4"/>
    <path d="M76 40 Q100 38 124 40" stroke="#2a2a2a" stroke-width="0.3" fill="none" opacity="0.5"/>`,

  h_cap_red: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#c0392b" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M72 36 Q100 10 128 36" fill="#d94436" opacity="0.5"/>
    <path d="M74 36 Q100 12 126 36" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M80 30 Q100 20 120 30" stroke="#a93226" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#a93226"/>
    <path d="M132 40 Q150 40 158 43" stroke="#c0392b" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M132 42 Q148 42 157 44" stroke="#7f1d13" stroke-width="0.5" fill="none"/>
    <circle cx="100" cy="10" r="2.8" fill="#7f1d13"/>
    <circle cx="100" cy="10" r="1.8" fill="#a93226"/>
    <circle cx="100" cy="10" r="0.8" fill="#c0392b"/>
    <path d="M72 42 Q100 40 128 42" stroke="#a93226" stroke-width="0.5" fill="none" opacity="0.7"/>`,

  h_ushanka: `<path d="M68 38 Q100 6 132 38 L132 44 Q100 42 68 44 Z" fill="#6b4a2a" stroke="#4a3018" stroke-width="0.5"/>
    <path d="M72 36 Q100 10 128 36" fill="#7a5530" opacity="0.5"/>
    <path d="M74 36 Q100 10 126 36" stroke="#8a6440" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M68 38 L60 52 Q56 68 62 78 L74 76 Q68 64 70 52 L72 44 Z" fill="#5a3d20" stroke="#3d2810" stroke-width="0.4"/>
    <path d="M62 44 Q58 58 62 74" stroke="#7a5028" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M66 50 Q64 62 68 72" stroke="#4a3018" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M132 38 L140 52 Q144 68 138 78 L126 76 Q132 64 130 52 L128 44 Z" fill="#5a3d20" stroke="#3d2810" stroke-width="0.4"/>
    <path d="M138 44 Q142 58 138 74" stroke="#7a5028" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M134 50 Q136 62 132 72" stroke="#4a3018" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M74 40 Q100 30 126 40" stroke="#8b6034" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M66 72 Q70 76 74 74" stroke="#a89070" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M134 72 Q130 76 126 74" stroke="#a89070" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M76 42 Q100 34 124 42" stroke="#a89070" stroke-width="0.4" fill="none" opacity="0.4"/>
    <circle cx="100" cy="8" r="4" fill="#5a3d20" stroke="#3d2810" stroke-width="0.5"/>
    <circle cx="100" cy="8" r="2" fill="#7a5028"/>
    <circle cx="99" cy="7" r="0.8" fill="#a89070" opacity="0.6"/>`,

  h_balaclava: `<path d="M68 50 Q68 20 100 20 Q132 20 132 50 Q132 68 125 82 L75 82 Q68 68 68 50 Z" fill="#0a0a0a"/>
    <path d="M70 45 Q100 30 130 45" stroke="#222" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M72 40 Q100 26 128 40" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M74 55 Q100 60 126 55" stroke="#222" stroke-width="0.8" fill="none" opacity="0.4"/>
    <ellipse cx="90" cy="52" rx="6.5" ry="6" fill="${SKIN}"/>
    <ellipse cx="110" cy="52" rx="6.5" ry="6" fill="${SKIN}"/>
    <ellipse cx="90" cy="52" rx="6.5" ry="6" fill="none" stroke="#333" stroke-width="0.4"/>
    <ellipse cx="110" cy="52" rx="6.5" ry="6" fill="none" stroke="#333" stroke-width="0.4"/>
    <circle cx="90" cy="52" r="2.5" fill="#000"/>
    <circle cx="110" cy="52" r="2.5" fill="#000"/>
    <circle cx="91" cy="51" r="0.8" fill="#fff"/>
    <circle cx="111" cy="51" r="0.8" fill="#fff"/>
    <path d="M70 44 Q100 34 130 44" stroke="#333" stroke-width="1.2" fill="none"/>
    <path d="M78 78 Q100 82 122 78" stroke="#222" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M85 75 Q100 78 115 75" stroke="#111" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M80 60 Q100 65 120 60" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  h_rooster: `<ellipse cx="100" cy="52" rx="31" ry="35" fill="#f5e8c8" stroke="#d4c8a8" stroke-width="0.6"/>
    <ellipse cx="108" cy="55" rx="20" ry="28" fill="#e8d8b8" opacity="0.5"/>
    <ellipse cx="92" cy="42" rx="12" ry="14" fill="#fff8e8" opacity="0.4"/>
    <path d="M88 20 L92 6 L100 20 L108 6 L112 20 Z" fill="#c0392b" stroke="#8b1a0d" stroke-width="0.5"/>
    <path d="M92 18 L94 10" stroke="#e74c3c" stroke-width="0.6" opacity="0.7"/>
    <path d="M108 18 L106 10" stroke="#a93226" stroke-width="0.6" opacity="0.7"/>
    <circle cx="86" cy="48" r="6" fill="#fff" stroke="#333" stroke-width="0.5"/>
    <circle cx="86" cy="48" r="4" fill="#eee"/>
    <circle cx="86" cy="48" r="3" fill="#1a1a1a"/>
    <circle cx="87" cy="47" r="1" fill="#fff"/>
    <circle cx="114" cy="48" r="6" fill="#fff" stroke="#333" stroke-width="0.5"/>
    <circle cx="114" cy="48" r="4" fill="#eee"/>
    <circle cx="114" cy="48" r="3" fill="#1a1a1a"/>
    <circle cx="115" cy="47" r="1" fill="#fff"/>
    <path d="M90 68 L100 78 L110 68 L100 82 Z" fill="#e67e22" stroke="#a0522d" stroke-width="0.6"/>
    <path d="M92 70 L100 76 L108 70" stroke="#f39c12" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M95 72 L100 76 L105 72" stroke="#fff" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M73 60 Q70 64 74 66" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M127 60 Q130 64 126 66" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M78 30 Q82 26 86 30 M114 30 Q118 26 122 30" stroke="#c0392b" stroke-width="0.6" fill="none" opacity="0.4"/>`,

  h_bandana: `<path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#c0392b" stroke="#8b1a0d" stroke-width="0.5"/>
    <path d="M72 35 Q100 18 128 35" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M76 32 Q100 20 124 32" stroke="#f06292" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M68 38 L54 56 L60 54 L72 42 Z" fill="#a93226" stroke="#7a1f1a" stroke-width="0.4"/>
    <path d="M56 52 L63 48" stroke="#e74c3c" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M58 50 L62 47" stroke="#f06292" stroke-width="0.3" fill="none" opacity="0.5"/>
    <circle cx="84" cy="38" r="1.5" fill="#fff" opacity="0.7"/>
    <circle cx="100" cy="34" r="1.5" fill="#fff" opacity="0.7"/>
    <circle cx="116" cy="38" r="1.5" fill="#fff" opacity="0.7"/>
    <circle cx="92" cy="40" r="1.2" fill="#fff" opacity="0.5"/>
    <circle cx="108" cy="40" r="1.2" fill="#fff" opacity="0.5"/>
    <circle cx="76" cy="40" r="1.2" fill="#fff" opacity="0.5"/>
    <circle cx="124" cy="40" r="1.2" fill="#fff" opacity="0.5"/>
    <circle cx="84" cy="36" r="0.6" fill="#fff" opacity="0.4"/>`,

  h_wig: `<path d="M70 42 Q72 14 100 12 Q128 14 130 42 L130 50 Q100 48 70 50 Z" fill="#c8c8c8"/>
    <path d="M74 40 Q78 20 100 18 Q122 20 126 40" stroke="#a8a8a8" stroke-width="0.8" fill="none" opacity="0.6"/>
    <ellipse cx="68" cy="58" rx="6" ry="18" fill="#c8c8c8"/>
    <ellipse cx="68" cy="58" rx="4" ry="14" fill="#b8b8b8" opacity="0.6"/>
    <ellipse cx="68" cy="58" rx="2" ry="8" fill="#a8a8a8" opacity="0.4"/>
    <ellipse cx="132" cy="58" rx="6" ry="18" fill="#c8c8c8"/>
    <ellipse cx="132" cy="58" rx="4" ry="14" fill="#b8b8b8" opacity="0.6"/>
    <ellipse cx="132" cy="58" rx="2" ry="8" fill="#a8a8a8" opacity="0.4"/>
    <ellipse cx="100" cy="24" rx="24" ry="6" fill="#a8a8a8" opacity="0.5"/>
    <path d="M78 38 Q88 32 100 34 M122 38 Q112 32 100 34" stroke="#a8a8a8" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M82 28 Q90 24 98 26 M118 28 Q110 24 102 26" stroke="#888" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M78 45 Q82 42 86 45 M114 45 Q118 42 122 45" stroke="#a8a8a8" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  h_crown: `<path d="M72 36 L76 12 L87 26 L100 4 L113 26 L124 12 L128 36 Z" fill="url(#gGold)" stroke="#8b6914" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M76 12 L80 30 L87 26" fill="#ffe66d" opacity="0.6"/>
    <path d="M100 4 L103 28 L97 28 Z" fill="#ffe66d" opacity="0.6"/>
    <path d="M124 12 L120 30 L113 26" fill="#ffe66d" opacity="0.6"/>
    <path d="M72 36 L128 36" stroke="#8b6914" stroke-width="2"/>
    <path d="M74 34 L126 34" stroke="#f9e079" stroke-width="0.8" opacity="0.6"/>
    <path d="M76 32 L124 32" stroke="#fff" stroke-width="0.4" opacity="0.4"/>
    <circle cx="100" cy="19" r="3.2" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <circle cx="100" cy="19" r="1.5" fill="#e74c3c"/>
    <circle cx="99" cy="18" r="0.6" fill="#fff"/>
    <circle cx="86" cy="25" r="2.2" fill="#3498db" stroke="#21618c" stroke-width="0.4"/>
    <circle cx="86" cy="25" r="1" fill="#5dade2"/>
    <circle cx="114" cy="25" r="2.2" fill="#3498db" stroke="#21618c" stroke-width="0.4"/>
    <circle cx="114" cy="25" r="1" fill="#5dade2"/>`,

  h_gold_crown: `<path d="M66 34 L72 4 L84 20 L100 -2 L116 20 L128 4 L134 34 Z" fill="url(#gGold)" stroke="#8b6914" stroke-width="2" stroke-linejoin="round"/>
    <path d="M72 4 L76 28 L84 20" fill="#fff3a0" opacity="0.7"/>
    <path d="M100 -2 L102 26 L98 26 Z" fill="#fff3a0" opacity="0.7"/>
    <path d="M128 4 L124 28 L116 20" fill="#fff3a0" opacity="0.7"/>
    <path d="M66 34 L134 34" stroke="#8b6914" stroke-width="2.5"/>
    <path d="M68 32 L132 32" stroke="#ffe66d" stroke-width="1" opacity="0.7"/>
    <path d="M70 30 L130 30" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <circle cx="100" cy="16" r="4.5" fill="#e74c3c" stroke="#8b0000" stroke-width="0.8"/>
    <circle cx="100" cy="16" r="2" fill="#ff6b6b"/>
    <circle cx="99" cy="15" r="0.8" fill="#fff"/>
    <circle cx="84" cy="18" r="3" fill="#3498db" stroke="#21618c" stroke-width="0.6"/>
    <circle cx="84" cy="18" r="1.4" fill="#5dade2"/>
    <circle cx="116" cy="18" r="3" fill="#3498db" stroke="#21618c" stroke-width="0.6"/>
    <circle cx="116" cy="18" r="1.4" fill="#5dade2"/>
    <circle cx="76" cy="26" r="1.5" fill="#fff"/>
    <circle cx="124" cy="26" r="1.5" fill="#fff"/>
    <circle cx="92" cy="28" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="108" cy="28" r="1" fill="#fff" opacity="0.7"/>`,

  h_cheburashka: `<circle cx="76" cy="22" r="18" fill="#8b6914" stroke="#5a3a0a" stroke-width="1"/>
    <circle cx="76" cy="22" r="14" fill="#a07020"/>
    <circle cx="76" cy="22" r="9" fill="#b88030" opacity="0.7"/>
    <circle cx="76" cy="22" r="5" fill="#8b6914" opacity="0.5"/>
    <circle cx="70" cy="16" r="3" fill="#c89040" opacity="0.5"/>
    <circle cx="124" cy="22" r="18" fill="#8b6914" stroke="#5a3a0a" stroke-width="1"/>
    <circle cx="124" cy="22" r="14" fill="#a07020"/>
    <circle cx="124" cy="22" r="9" fill="#b88030" opacity="0.7"/>
    <circle cx="124" cy="22" r="5" fill="#8b6914" opacity="0.5"/>
    <circle cx="118" cy="16" r="3" fill="#c89040" opacity="0.5"/>
    <path d="M70 38 Q100 28 130 38 L130 44 Q100 42 70 44 Z" fill="#6b4a2a" stroke="#4a3018" stroke-width="0.4"/>
    <path d="M74 38 Q100 30 126 38" stroke="#8a6440" stroke-width="0.6" fill="none" opacity="0.6"/>`,

  h_bandit: `<ellipse cx="100" cy="50" rx="30" ry="32" fill="#0a0a0a"/>
    <path d="M74 40 Q100 30 126 40" stroke="#222" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M76 45 Q100 36 124 45" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.4"/>
    <ellipse cx="90" cy="48" rx="6" ry="5" fill="${SKIN}"/>
    <ellipse cx="110" cy="48" rx="6" ry="5" fill="${SKIN}"/>
    <circle cx="90" cy="48" r="2.5" fill="#000"/>
    <circle cx="110" cy="48" r="2.5" fill="#000"/>
    <circle cx="91" cy="47" r="0.8" fill="#fff"/>
    <circle cx="111" cy="47" r="0.8" fill="#fff"/>
    <path d="M86 64 L114 64" stroke="#222" stroke-width="1" opacity="0.7"/>
    <path d="M80 70 Q100 76 120 70" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  h_pirate: `<path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#c0392b"/>
    <path d="M72 35 Q100 18 128 35" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M68 38 L55 54 L62 52 L72 42 Z" fill="#a93226"/>
    <circle cx="110" cy="50" r="7" fill="#000" stroke="#333" stroke-width="0.5"/>
    <circle cx="110" cy="50" r="4" fill="#1a1a1a"/>
    <line x1="103" y1="50" x2="68" y2="42" stroke="#000" stroke-width="1.5"/>
    <circle cx="110" cy="48" r="1" fill="#fff" opacity="0.7"/>`,

  h_fedora: `<ellipse cx="100" cy="36" rx="44" ry="7" fill="#3d2818"/>
    <ellipse cx="100" cy="36" rx="44" ry="7" fill="url(#gBrown)" opacity="0.7"/>
    <path d="M72 36 L72 14 Q100 4 128 14 L128 36 Z" fill="url(#gBrown)" stroke="#3d2818" stroke-width="0.6"/>
    <path d="M74 16 Q100 8 126 16" stroke="#a06030" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M72 32 L128 32" stroke="#3d2818" stroke-width="2.5"/>
    <path d="M72 30 L128 30" stroke="#7a5230" stroke-width="0.8" opacity="0.6"/>
    <path d="M76 34 L124 34" stroke="#3d2818" stroke-width="0.8" opacity="0.6"/>
    <path d="M80 28 Q100 24 120 28" stroke="#a06030" stroke-width="0.4" fill="none" opacity="0.5"/>`,

  h_beret: `<ellipse cx="100" cy="26" rx="33" ry="15" fill="#1a1a1a"/>
    <ellipse cx="100" cy="22" rx="28" ry="11" fill="#2a2a2a"/>
    <ellipse cx="92" cy="20" rx="14" ry="6" fill="#3a3a3a" opacity="0.6"/>
    <ellipse cx="108" cy="24" rx="12" ry="4" fill="#0a0a0a" opacity="0.4"/>
    <circle cx="100" cy="9" r="3" fill="#1a1a1a"/>
    <circle cx="100" cy="9" r="1.8" fill="#333"/>
    <circle cx="100" cy="9" r="0.8" fill="#555"/>
    <ellipse cx="100" cy="38" rx="32" ry="4" fill="#0a0a0a" opacity="0.5"/>`,

  h_vr: `<path d="M65 38 Q100 28 135 38 L135 58 Q100 70 65 58 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.8"/>
    <path d="M70 36 Q100 30 130 36" stroke="#333" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M65 46 Q100 40 135 46" stroke="#2a2a2a" stroke-width="0.6" fill="none" opacity="0.5"/>
    <rect x="75" y="44" width="22" height="13" rx="2" fill="#3498db" stroke="#2874a6" stroke-width="0.5"/>
    <rect x="103" y="44" width="22" height="13" rx="2" fill="#3498db" stroke="#2874a6" stroke-width="0.5"/>
    <rect x="77" y="46" width="8" height="3" fill="#5dade2" opacity="0.6"/>
    <rect x="105" y="46" width="8" height="3" fill="#5dade2" opacity="0.6"/>
    <path d="M65 48 L55 44 M135 48 L145 44" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M65 48 L55 44 M135 48 L145 44" stroke="#333" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="86" cy="50" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="114" cy="50" r="1" fill="#fff" opacity="0.7"/>`,

  h_halo: `<ellipse cx="100" cy="4" rx="26" ry="5" fill="none" stroke="#f1c40f" stroke-width="3"/>
    <ellipse cx="100" cy="4" rx="26" ry="5" fill="#f1c40f" opacity="0.3"/>
    <ellipse cx="100" cy="4" rx="20" ry="3" fill="#fff" opacity="0.4"/>
    <ellipse cx="100" cy="4" rx="26" ry="5" fill="none" stroke="#f9e079" stroke-width="0.8" opacity="0.7"/>`,

  h_flower: `<circle cx="118" cy="32" r="6" fill="#e91e63"/>
    <circle cx="112" cy="28" r="4" fill="#f06292"/>
    <circle cx="124" cy="28" r="4" fill="#f06292"/>
    <circle cx="112" cy="36" r="4" fill="#f06292"/>
    <circle cx="124" cy="36" r="4" fill="#f06292"/>
    <circle cx="118" cy="32" r="2.5" fill="#ffeb3b"/>
    <circle cx="118" cy="32" r="1.2" fill="#f39c12"/>
    <ellipse cx="112" cy="30" rx="1.2" ry="0.6" fill="#fff" opacity="0.7"/>
    <circle cx="118" cy="40" r="1.5" fill="#2ecc71" opacity="0.7"/>`,

  h_mask_money: `<ellipse cx="100" cy="50" rx="30" ry="15" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.7"/>
    <ellipse cx="92" cy="46" rx="20" ry="6" fill="#2a2a2a" opacity="0.6"/>
    <circle cx="86" cy="50" r="7" fill="${SKIN}"/>
    <circle cx="114" cy="50" r="7" fill="${SKIN}"/>
    <circle cx="86" cy="50" r="2.8" fill="#000"/>
    <circle cx="114" cy="50" r="2.8" fill="#000"/>
    <circle cx="87" cy="49" r="0.8" fill="#fff"/>
    <circle cx="115" cy="49" r="0.8" fill="#fff"/>
    <text x="100" y="57" text-anchor="middle" font-size="13" fill="#4CAF50" font-weight="900">$</text>
    <path d="M72 42 Q100 38 128 42" stroke="#333" stroke-width="0.6" fill="none" opacity="0.6"/>`,

  h_gang_bandana: `<path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M68 38 L54 56 L60 54 L72 42 Z" fill="#0a0a0a"/>
    <text x="100" y="38" text-anchor="middle" font-size="8" fill="#f39c12" font-weight="900">CLAN</text>
    <path d="M72 35 Q100 18 128 35" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  h_gang_mask: `<path d="M70 26 Q100 11 130 26 L130 51 Q100 68 70 51 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M74 22 Q100 14 126 22" stroke="#333" stroke-width="0.6" fill="none" opacity="0.5"/>
    <ellipse cx="88" cy="41" rx="10" ry="6" fill="#c0392b"/>
    <ellipse cx="112" cy="41" rx="10" ry="6" fill="#c0392b"/>
    <circle cx="88" cy="41" r="3.5" fill="#000"/>
    <circle cx="112" cy="41" r="3.5" fill="#000"/>
    <circle cx="89" cy="40" r="1" fill="#fff"/>
    <circle cx="113" cy="40" r="1" fill="#fff"/>
    <path d="M85 56 Q100 62 115 56" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M78 60 Q100 66 122 60" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  h_gang_helmet: `<path d="M62 42 Q62 10 100 4 Q138 10 138 42 L134 68 Q100 78 66 68 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2"/>
    <path d="M70 40 Q100 24 130 40" stroke="#1a252f" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M68 44 Q100 30 132 44" stroke="#3d5060" stroke-width="0.5" fill="none" opacity="0.4"/>
    <ellipse cx="84" cy="42" rx="9" ry="5" fill="#c0392b"/>
    <ellipse cx="116" cy="42" rx="9" ry="5" fill="#c0392b"/>
    <circle cx="84" cy="42" r="2.5" fill="#000"/>
    <circle cx="116" cy="42" r="2.5" fill="#000"/>
    <path d="M100 8 L94 26 L106 26 Z" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <circle cx="100" cy="6" r="3.5" fill="#e74c3c"/>
    <circle cx="99" cy="5" r="1.2" fill="#ff6b6b"/>
    <path d="M70 56 Q100 62 130 56" stroke="#f39c12" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M72 62 L128 62" stroke="#1a252f" stroke-width="1" opacity="0.6"/>
    <path d="M64 46 L64 64 M136 46 L136 64" stroke="#1a252f" stroke-width="1.5" opacity="0.7"/>`,

  h_case_bandit: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#0a0a0a"/>
    <ellipse cx="100" cy="42" rx="28" ry="4" fill="#000" opacity="0.5"/>
    <circle cx="100" cy="10" r="2.5" fill="#444"/>
    <path d="M74 36 Q100 12 126 36" stroke="#333" stroke-width="0.5" fill="none" opacity="0.6"/>`,

  h_case_rooster: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#a93226"/>
    <path d="M74 40 Q100 36 126 40" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.9"/>
    <path d="M76 42 Q100 38 124 42" stroke="#e74c3c" stroke-width="0.5" fill="none" opacity="0.6"/>
    <circle cx="100" cy="10" r="2.5" fill="#7f1d13"/>`,

  h_case_helmet_alpha: `<ellipse cx="100" cy="50" rx="35" ry="37" fill="#0a0a0a" stroke="#000" stroke-width="1"/>
    <path d="M65 44 Q100 34 135 44 L135 50 Q100 60 65 50 Z" fill="#1a1a1a"/>
    <path d="M70 40 Q100 32 130 40" stroke="#333" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M70 72 Q100 80 130 72" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <ellipse cx="86" cy="48" rx="9" ry="5" fill="#3498db" opacity="0.6"/>
    <ellipse cx="114" cy="48" rx="9" ry="5" fill="#3498db" opacity="0.6"/>
    <circle cx="86" cy="48" r="3.5" fill="#2ecc71"/>
    <circle cx="114" cy="48" r="3.5" fill="#2ecc71"/>
    <circle cx="86" cy="47" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="114" cy="47" r="1" fill="#fff" opacity="0.7"/>
    <rect x="92" y="14" width="16" height="8" rx="2" fill="#f39c12" stroke="#b87500" stroke-width="0.4"/>
    <path d="M100 22 L100 32" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M78 70 Q100 74 122 70" stroke="#333" stroke-width="1" fill="none"/>`,

  h_case_top1_head: `<path d="M58 24 Q100 -4 142 24 L142 51 Q100 68 58 51 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="2.5"/>
    <path d="M64 22 Q100 4 136 22" stroke="#b8860b" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M62 26 Q100 8 138 26" stroke="#ffd700" stroke-width="0.4" fill="none" opacity="0.4"/>
    <ellipse cx="100" cy="42" rx="36" ry="20" fill="#2c1810"/>
    <circle cx="80" cy="40" r="5.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="120" cy="40" r="5.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="80" cy="40" r="2.2" fill="#1a1a1a"/>
    <circle cx="120" cy="40" r="2.2" fill="#1a1a1a"/>
    <circle cx="81" cy="39" r="0.7" fill="#fff"/>
    <circle cx="121" cy="39" r="0.7" fill="#fff"/>
    <path d="M100 12 L94 28 L106 28 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="100" cy="10" r="3.5" fill="#e74c3c"/>
    <circle cx="99" cy="9" r="1.2" fill="#ff6b6b"/>
    <path d="M60 26 L140 26" stroke="#b8860b" stroke-width="1" opacity="0.6"/>
    <circle cx="70" cy="34" r="2" fill="#f39c12"/>
    <circle cx="130" cy="34" r="2" fill="#f39c12"/>`,

  h_case_top2_head: `<path d="M64 32 L64 20 Q100 14 136 20 L136 32 Q100 38 64 32 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M64 20 L56 2 L76 16 L88 -2 L100 12 L112 -2 L124 16 L144 2 L136 20" fill="none" stroke="#ffd700" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M64 20 L56 2 L76 16 L88 -2 L100 12 L112 -2 L124 16 L144 2 L136 20" fill="none" stroke="#fff3a0" stroke-width="0.5" stroke-linejoin="round" opacity="0.5"/>
    <circle cx="100" cy="6" r="3.5" fill="#e74c3c" stroke="#8b0000" stroke-width="0.7"/>
    <circle cx="76" cy="12" r="2.5" fill="#3498db"/>
    <circle cx="124" cy="12" r="2.5" fill="#3498db"/>
    <circle cx="56" cy="4" r="1.8" fill="#fff"/>
    <circle cx="144" cy="4" r="1.8" fill="#fff"/>
    <path d="M70 28 Q100 34 130 28" stroke="#ffd700" stroke-width="1.8" fill="none"/>`,

  h_case_crypto: `<circle cx="100" cy="50" r="33" fill="url(#gGold)" stroke="#b8860b" stroke-width="1.5"/>
    <circle cx="100" cy="50" r="26" fill="#d68910"/>
    <circle cx="100" cy="50" r="24" fill="none" stroke="#f9e079" stroke-width="0.6" opacity="0.6"/>
    <text x="100" y="62" text-anchor="middle" font-size="34" fill="#fff" font-weight="900">₿</text>
    <text x="100" y="62" text-anchor="middle" font-size="34" fill="#fff3a0" font-weight="900" opacity="0.4" transform="translate(-1,-1)">₿</text>
    <circle cx="89" cy="44" r="2" fill="#1a1a1a"/>
    <circle cx="111" cy="44" r="2" fill="#1a1a1a"/>
    <path d="M92 66 Q100 70 108 66" stroke="#8b6914" stroke-width="1.5" fill="none"/>`,

  h_case_dragon: `<path d="M68 38 Q100 11 132 38 L132 48 Q100 58 68 48 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="1.2"/>
    <path d="M78 28 Q82 12 88 24 L88 31 Z" fill="#1a252f" stroke="#0a1525" stroke-width="0.5"/>
    <path d="M112 28 Q118 12 122 24 L122 31 Z" fill="#1a252f" stroke="#0a1525" stroke-width="0.5"/>
    <ellipse cx="88" cy="46" rx="9" ry="5" fill="#e74c3c"/>
    <ellipse cx="112" cy="46" rx="9" ry="5" fill="#e74c3c"/>
    <circle cx="88" cy="46" r="2.5" fill="#000"/>
    <circle cx="112" cy="46" r="2.5" fill="#000"/>
    <circle cx="89" cy="45" r="0.8" fill="#fff"/>
    <circle cx="113" cy="45" r="0.8" fill="#fff"/>
    <path d="M94 56 Q100 58 106 56" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M98 48 L96 58 L100 56 Z" fill="#f39c12"/>`,
      // ==================================================================
  // ТЕЛО — все с градиентами, складками и настоящими рукавами
  // ==================================================================

  // МАЙКА-АЛКОГОЛИЧКА (без рукавов)
  b_alco: `<path d="M72 100 Q72 96 76 96 L124 96 Q128 96 128 102 L128 205 L72 205 Z" fill="url(#gWhite)" stroke="#c8c8c8" stroke-width="0.5"/>
    <path d="M104 98 L104 205 L128 205 L128 102 Q128 100 126 99 Z" fill="#d0d0d0" opacity="0.4"/>
    <ellipse cx="100" cy="180" rx="30" ry="12" fill="rgba(255,255,255,0.3)"/>
    <path d="M76 100 L80 130 M124 100 L120 130" stroke="#d0d0d0" stroke-width="0.8" fill="none"/>
    <path d="M84 100 Q84 108 76 112 M116 100 Q116 108 124 112" stroke="#d0d0d0" stroke-width="0.6" fill="none"/>
    <path d="M86 96 Q100 108 114 96" stroke="#d0d0d0" stroke-width="1.2" fill="none"/>
    <path d="M86 96 Q100 104 114 96" stroke="#fff" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M88 140 L92 145 M112 140 L108 145" stroke="#e8e8e8" stroke-width="0.4" fill="none"/>
    <path d="M90 165 Q100 170 110 165" stroke="#e0e0e0" stroke-width="0.4" fill="none" opacity="0.5"/>
    <ellipse cx="90" cy="155" rx="2" ry="3" fill="#e0e0e0" opacity="0.6"/>
    <ellipse cx="105" cy="170" rx="1.5" ry="2" fill="#e0e0e0" opacity="0.5"/>`,

  // ФУТБОЛКА AURA (короткий рукав)
  b_aura: `<path d="${SS_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="${SS_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M70 100 Q68 96 72 96 L128 96 Q132 96 130 100 L130 205 L70 205 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M105 96 L105 205 L130 205 L130 100 Q130 97 128 96 Z" fill="#1a1a1a" opacity="0.5"/>
    <path d="M78 96 Q100 84 122 96" fill="#1a1a1a"/>
    <path d="M80 96 Q100 88 120 96" stroke="#333" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M56 120 Q60 124 64 122" stroke="#333" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M136 120 Q140 124 144 122" stroke="#333" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M66 96 L68 108" stroke="#333" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M134 96 L132 108" stroke="#333" stroke-width="0.4" fill="none" opacity="0.4"/>
    <text x="100" y="158" text-anchor="middle" font-size="14" fill="#f39c12" font-weight="900" letter-spacing="1">AURA</text>
    <text x="100" y="174" text-anchor="middle" font-size="7" fill="#f39c12" font-weight="600" opacity="0.8">FARMING</text>
    <path d="M82 120 Q90 124 96 122" stroke="#2a2a2a" stroke-width="0.5" fill="none"/>
    <path d="M104 122 Q110 124 118 120" stroke="#2a2a2a" stroke-width="0.5" fill="none"/>
    <ellipse cx="100" cy="195" rx="20" ry="4" fill="#1a1a1a" opacity="0.5"/>`,

  // ФУТБОЛКА Я БОГ (короткий рукав)
  b_iambog: `<path d="${SS_L}" fill="url(#gWhite)" stroke="#c8c8c8" stroke-width="0.5"/>
    <path d="${SS_R}" fill="url(#gWhite)" stroke="#c8c8c8" stroke-width="0.5"/>
    <path d="M72 100 Q70 96 74 96 L126 96 Q130 96 128 102 L128 205 L72 205 Z" fill="url(#gWhite)" stroke="#c8c8c8" stroke-width="0.5"/>
    <path d="M105 96 L105 205 L128 205 L128 102 Q128 98 126 96 Z" fill="#e0e0e0" opacity="0.4"/>
    <path d="M78 96 Q100 84 122 96" fill="url(#gWhite)"/>
    <path d="M80 96 Q100 88 120 96" stroke="#d0d0d0" stroke-width="0.5" fill="none"/>
    <path d="M56 120 Q60 124 64 122" stroke="#d0d0d0" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M136 120 Q140 124 144 122" stroke="#d0d0d0" stroke-width="0.4" fill="none" opacity="0.5"/>
    <text x="100" y="155" text-anchor="middle" font-size="16" fill="#c0392b" font-weight="900">Я БОГ</text>
    <path d="M82 170 Q100 178 118 170" stroke="#c0392b" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M85 135 L95 140" stroke="#e8e8e8" stroke-width="0.4" fill="none" opacity="0.5"/>`,

  // ХУДИ SUPREME (длинный рукав, фейк)
  b_supreme: `<path d="${SL_L}" fill="url(#gRed)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gRed)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M66 100 Q66 96 72 96 L128 96 Q134 96 134 100 L134 205 L66 205 Z" fill="url(#gRed)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M105 96 L105 205 L134 205 L134 100 Q134 98 132 96 Z" fill="#8b1a0d" opacity="0.5"/>
    <path d="M74 96 Q100 82 126 96 L126 100 L74 100 Z" fill="#a93226"/>
    <path d="M76 96 Q100 84 124 96" stroke="#5a0f08" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M70 100 Q100 90 130 100" stroke="#8b1a0d" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M56 130 L66 130 M136 130 L144 128" stroke="#8b1a0d" stroke-width="1" opacity="0.5"/>
    <path d="M54 175 L64 175 M136 175 L146 175" stroke="#8b1a0d" stroke-width="1.2" opacity="0.6"/>
    <rect x="82" y="150" width="36" height="20" fill="#a93226" stroke="#5a0f08" stroke-width="0.6"/>
    <text x="100" y="164" text-anchor="middle" font-size="7" fill="#fff" font-weight="900">SUP</text>
    <path d="M94 105 L94 130" stroke="#fff" stroke-width="1" opacity="0.4"/>
    <path d="M106 105 L106 130" stroke="#fff" stroke-width="1" opacity="0.4"/>
    <ellipse cx="86" cy="132" rx="1.5" ry="1.5" fill="#666"/>
    <ellipse cx="114" cy="132" rx="1.5" ry="1.5" fill="#666"/>
    <path d="M78 185 Q100 195 122 185" stroke="#8b1a0d" stroke-width="0.6" fill="none" opacity="0.4"/>`,

  // РУБАШКА В КЛЕТКУ (длинный рукав)
  b_cage: `<path d="${SL_L}" fill="url(#plaid)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#plaid)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M68 100 L68 205 L132 205 L132 100 Q120 94 100 94 Q80 94 68 100 Z" fill="url(#plaid)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M105 96 L105 205 L132 205 L132 100 Q126 96 118 95 Z" fill="#5a0f08" opacity="0.3"/>
    <path d="M72 96 Q100 80 128 96" fill="#b02a1d"/>
    <path d="M72 96 Q100 84 128 96" stroke="#5a0f08" stroke-width="0.6" fill="none" opacity="0.6"/>
    <rect x="72" y="94" width="8" height="14" fill="#c0392b" stroke="#7f1d13" stroke-width="0.4"/>
    <rect x="120" y="94" width="8" height="14" fill="#c0392b" stroke="#7f1d13" stroke-width="0.4"/>
    <path d="M56 145 L62 145 M136 145 L142 145" stroke="#5a0f08" stroke-width="1" opacity="0.5"/>
    <path d="M56 175 L64 176 M136 176 L144 175" stroke="#5a0f08" stroke-width="1" opacity="0.5"/>
    <path d="M54 192 L64 193 M136 193 L146 192" stroke="#5a0f08" stroke-width="1.2" opacity="0.7"/>
    <path d="M64 193 L64 188 M146 193 L146 188" stroke="#5a0f08" stroke-width="0.8"/>
    <ellipse cx="100" cy="115" rx="1.5" ry="1.5" fill="#fff" opacity="0.7"/>
    <ellipse cx="100" cy="140" rx="1.5" ry="1.5" fill="#fff" opacity="0.7"/>
    <ellipse cx="100" cy="165" rx="1.5" ry="1.5" fill="#fff" opacity="0.7"/>
    <ellipse cx="100" cy="190" rx="1.5" ry="1.5" fill="#fff" opacity="0.7"/>`,

  // ПИДЖАК ARMANI (длинный рукав, с воротником рубашки)
  b_armani: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M105 96 L105 205 L130 205 L130 100 Q126 96 118 95 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M88 96 L100 170 L112 96 Z" fill="url(#gWhite)"/>
    <path d="M92 100 L100 165 L108 100" stroke="#d0d0d0" stroke-width="0.5" fill="none" opacity="0.7"/>
    <path d="M88 96 L92 108 L108 108 L112 96 Z" fill="url(#gWhite)"/>
    <path d="M86 96 L84 110" stroke="#333" stroke-width="0.4" fill="none" opacity="0.6"/>
    <path d="M114 96 L116 110" stroke="#333" stroke-width="0.4" fill="none" opacity="0.6"/>
    <path d="M70 100 L86 96 L100 178" stroke="#000" stroke-width="1.5" fill="none"/>
    <path d="M130 100 L114 96 L100 178" stroke="#000" stroke-width="1.5" fill="none"/>
    <path d="M76 110 L86 100" stroke="#333" stroke-width="0.4" fill="none"/>
    <path d="M124 110 L114 100" stroke="#333" stroke-width="0.4" fill="none"/>
    <path d="M74 120 L82 124 M126 120 L118 124" stroke="#2a2a2a" stroke-width="0.6" fill="none"/>
    <rect x="76" y="140" width="14" height="20" fill="#0a0a0a" opacity="0.5"/>
    <path d="M76 140 L90 140" stroke="#333" stroke-width="0.4" opacity="0.7"/>
    <rect x="110" y="140" width="14" height="20" fill="#0a0a0a" opacity="0.5"/>
    <path d="M110 140 L124 140" stroke="#333" stroke-width="0.4" opacity="0.7"/>
    <circle cx="100" cy="160" r="1.5" fill="#666"/>
    <circle cx="100" cy="175" r="1.5" fill="#666"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#000" stroke-width="2"/>
    <path d="M86 100 L100 170 L114 100" stroke="#1a1a1a" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  // ПУХОВИК NORTH FACE (длинный рукав, объемный)
  b_nf: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M68 100 L68 205 L132 205 L132 100 Q120 94 100 94 Q80 94 68 100 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M105 96 L105 205 L132 205 L132 100 Q126 96 118 95 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M76 96 Q100 82 124 96" fill="#0a0a0a"/>
    <path d="M76 96 Q100 88 124 96" stroke="#444" stroke-width="0.8" fill="none" opacity="0.7"/>
    <ellipse cx="100" cy="108" rx="22" ry="4" fill="#2a2a2a" opacity="0.5"/>
    <path d="M70 118 L130 118 M70 143 L130 143 M70 168 L130 168 M70 193 L130 193" stroke="#333" stroke-width="1.5"/>
    <path d="M70 116 L130 116 M70 141 L130 141 M70 166 L130 166" stroke="#444" stroke-width="0.4" opacity="0.7"/>
    <path d="M70 120 L130 120 M70 145 L130 145 M70 170 L130 170" stroke="#000" stroke-width="0.4" opacity="0.5"/>
    <path d="M56 122 L66 122 M136 122 L144 122" stroke="#333" stroke-width="1.2" opacity="0.6"/>
    <path d="M54 152 L64 152 M136 152 L146 152" stroke="#333" stroke-width="1.2" opacity="0.6"/>
    <path d="M54 180 L64 180 M136 180 L146 180" stroke="#333" stroke-width="1.2" opacity="0.6"/>
    <circle cx="100" cy="132" r="1.5" fill="#666"/>
    <rect x="88" y="110" width="24" height="8" fill="#0a0a0a" stroke="#333" stroke-width="0.4"/>
    <path d="M92 113 L108 113" stroke="#555" stroke-width="0.4"/>
    <path d="M70 200 L130 200" stroke="#333" stroke-width="0.6" opacity="0.7"/>`,

  // КОЖАНАЯ КУРТКА (длинный рукав, с молнией)
  b_leather: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.7"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.7"/>
    <path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.7"/>
    <path d="M105 96 L105 205 L130 205 L130 100 Q126 96 118 95 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M100 178 L84 100 M100 178 L116 100" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M88 100 L92 108 L108 108 L112 100 Z" fill="#2a2a2a"/>
    <path d="M88 102 L92 108" stroke="#666" stroke-width="0.4" fill="none"/>
    <path d="M112 102 L108 108" stroke="#666" stroke-width="0.4" fill="none"/>
    <path d="M80 120 L88 130 M120 120 L112 130" stroke="#333" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M78 155 L86 162 M122 155 L114 162" stroke="#333" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M76 175 L84 182 M124 175 L116 182" stroke="#333" stroke-width="0.6" fill="none" opacity="0.5"/>
    <circle cx="100" cy="190" r="2" fill="#888"/>
    <circle cx="100" cy="190" r="1" fill="#aaa"/>
    <path d="M100 108 L100 178" stroke="#000" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M54 192 L64 193 M136 193 L146 192" stroke="#0a0a0a" stroke-width="2"/>
    <path d="M62 190 L64 193 M146 192 L138 190" stroke="#333" stroke-width="0.5" fill="none"/>`,

  // СВАДЕБНОЕ ПЛАТЬЕ (без рукавов, платье)
  b_wedding: `<path d="M72 96 Q70 96 70 100 L70 205 L130 205 L130 100 Q130 96 128 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="url(#gWhite)" stroke="#d0d0d0" stroke-width="0.5"/>
    <path d="M105 96 L105 205 L130 205 L130 100 Q130 98 128 96 Z" fill="#e0e0e0" opacity="0.4"/>
    <path d="M70 205 L58 255 L142 255 L130 205 Z" fill="url(#gWhite)" stroke="#d0d0d0" stroke-width="0.5"/>
    <path d="M80 210 L75 250 M100 210 L100 250 M120 210 L125 250" stroke="#d0d0d0" stroke-width="1" fill="none"/>
    <path d="M84 96 L84 108 M116 96 L116 108" stroke="#d0d0d0" stroke-width="0.5" opacity="0.6"/>
    <ellipse cx="100" cy="118" rx="6" ry="4" fill="#fce4ec" opacity="0.8"/>
    <circle cx="100" cy="118" r="2" fill="#fff"/>
    <circle cx="100" cy="118" r="1" fill="#f8bbd0"/>
    <path d="M82 96 Q100 90 118 96" stroke="#d0d0d0" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M70 200 L130 200" stroke="#e0e0e0" stroke-width="1.5"/>
    <path d="M62 250 L138 250" stroke="#d0d0d0" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M62 253 L138 253" stroke="#e8e8e8" stroke-width="0.4" fill="none" opacity="0.5"/>
    <ellipse cx="90" cy="160" rx="3" ry="4" fill="#fce4ec" opacity="0.7"/>
    <ellipse cx="110" cy="180" rx="3" ry="4" fill="#fce4ec" opacity="0.7"/>
    <ellipse cx="100" cy="225" rx="3" ry="4" fill="#fce4ec" opacity="0.6"/>`,

  // БРОНЕЖИЛЕТ (без рукавов)
  b_vest: `<path d="M72 100 Q72 96 76 96 L124 96 Q128 96 128 100 L128 205 L72 205 Z" fill="url(#gNavy)" stroke="#0a1525" stroke-width="0.6"/>
    <path d="M104 96 L104 205 L128 205 L128 100 Q128 98 126 96 Z" fill="#1a252f" opacity="0.4"/>
    <rect x="78" y="118" width="44" height="30" rx="3" fill="#1a252f" stroke="#0f1519" stroke-width="0.6"/>
    <path d="M80 130 L120 130" stroke="#2c3e50" stroke-width="0.6" opacity="0.6"/>
    <path d="M80 155 L120 155 M80 172 L120 172" stroke="#1a252f" stroke-width="1.5"/>
    <rect x="90" y="104" width="20" height="7" rx="2" fill="#34495e" stroke="#1a252f" stroke-width="0.4"/>
    <path d="M82 100 Q90 108 100 108 Q110 108 118 100" stroke="#34495e" stroke-width="1" fill="none"/>
    <circle cx="94" cy="132" r="1.5" fill="#556"/>
    <circle cx="106" cy="132" r="1.5" fill="#556"/>
    <path d="M92 155 L108 155" stroke="#34495e" stroke-width="0.5" opacity="0.6"/>
    <path d="M76 108 L76 130" stroke="#3d5060" stroke-width="0.6" opacity="0.6"/>
    <path d="M124 108 L124 130" stroke="#3d5060" stroke-width="0.6" opacity="0.6"/>
    <rect x="82" y="178" width="36" height="12" rx="2" fill="#1a252f" stroke="#0f1519" stroke-width="0.5"/>
    <path d="M84 184 L116 184" stroke="#34495e" stroke-width="0.4" opacity="0.5"/>`,

  // СМОКИНГ (длинный рукав, официальный)
  b_tuxedo: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#000" stroke-width="0.5"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#000" stroke-width="0.5"/>
    <path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="url(#gBlack)" stroke="#000" stroke-width="0.5"/>
    <path d="M105 96 L105 205 L130 205 L130 100 Q126 96 118 95 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M100 178 L86 100 M100 178 L114 100" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M88 96 L100 170 L112 96 Z" fill="url(#gWhite)"/>
    <path d="M92 100 L100 165 L108 100" stroke="#e0e0e0" stroke-width="0.5" fill="none" opacity="0.7"/>
    <path d="M90 100 L100 106 L110 100 L108 108 L100 106 L92 108 Z" fill="#000"/>
    <circle cx="100" cy="150" r="1.8" fill="#fff"/>
    <circle cx="100" cy="165" r="1.8" fill="#fff"/>
    <circle cx="100" cy="180" r="1.8" fill="#fff"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#000" stroke-width="2"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#333" stroke-width="0.5" opacity="0.5"/>
    <path d="M88 108 L112 108" stroke="#1a1a1a" stroke-width="0.4" opacity="0.6"/>`,

  // КОСТЮМ САНТЫ (длинный рукав)
  b_santa: `<path d="${SL_L}" fill="url(#gRed)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gRed)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M70 100 Q68 96 72 96 L128 96 Q132 96 130 100 L130 205 L70 205 Z" fill="url(#gRed)" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M104 96 L104 205 L130 205 L130 100 Q130 98 128 96 Z" fill="#8b1a0d" opacity="0.4"/>
    <path d="M70 96 Q100 82 130 96" stroke="#fff" stroke-width="5" fill="none"/>
    <path d="M70 96 Q100 84 130 96" stroke="#f0f0f0" stroke-width="2" fill="none" opacity="0.8"/>
    <path d="M70 98 Q100 86 130 98" stroke="#e0e0e0" stroke-width="0.5" fill="none" opacity="0.5"/>
    <rect x="70" y="195" width="60" height="10" fill="#fff"/>
    <path d="M70 198 L130 198" stroke="#e0e0e0" stroke-width="0.6" opacity="0.7"/>
    <path d="M70 202 L130 202" stroke="#d0d0d0" stroke-width="0.4" opacity="0.5"/>
    <path d="M75 120 Q85 116 95 120 M105 120 Q115 116 125 120" stroke="#fff" stroke-width="1" fill="none" opacity="0.6"/>
    <circle cx="86" cy="140" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="114" cy="140" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="86" cy="170" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="114" cy="170" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="100" cy="155" r="2" fill="#fff" opacity="0.8"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#8b1a0d" stroke-width="2"/>`,

  // МАЙКА USA (без рукавов)
  b_tank_usa: `<path d="M72 100 Q70 96 74 96 L126 96 Q130 96 128 102 L128 205 L72 205 Z" fill="url(#gWhite)" stroke="#c8c8c8" stroke-width="0.5"/>
    <path d="M104 96 L104 205 L128 205 L128 102 Q128 98 126 96 Z" fill="#e0e0e0" opacity="0.4"/>
    <path d="M80 100 Q100 90 120 100" fill="url(#gWhite)"/>
    <path d="M82 100 Q100 92 118 100" stroke="#d0d0d0" stroke-width="0.5" fill="none"/>
    <rect x="76" y="140" width="48" height="30" fill="#c0392b"/>
    <rect x="76" y="140" width="24" height="15" fill="#1c3a7a"/>
    <line x1="76" y1="145" x2="100" y2="145" stroke="#fff" stroke-width="1.5"/>
    <line x1="76" y1="150" x2="100" y2="150" stroke="#fff" stroke-width="1.5"/>
    <path d="M100 140 L100 170" stroke="#fff" stroke-width="0.8"/>
    <circle cx="88" cy="145" r="0.8" fill="#fff"/>
    <circle cx="94" cy="145" r="0.8" fill="#fff"/>
    <circle cx="88" cy="155" r="0.8" fill="#fff"/>
    <circle cx="94" cy="155" r="0.8" fill="#fff"/>
    <path d="M84 100 Q84 108 76 112 M116 100 Q116 108 124 112" stroke="#d0d0d0" stroke-width="0.5" fill="none"/>
    <path d="M82 135 L118 135" stroke="#a93226" stroke-width="0.4" opacity="0.5"/>`,

  // ХУДИ (длинный рукав, с капюшоном)
  b_hoodie: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M66 100 Q66 94 72 94 L128 94 Q134 94 134 100 L134 205 L66 205 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M105 94 L105 205 L134 205 L134 100 Q134 97 132 94 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M74 94 Q100 76 126 94 L126 100 L74 100 Z" fill="#0a0a0a"/>
    <path d="M76 94 Q100 80 124 94" stroke="#333" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M78 88 Q100 76 122 88" stroke="#222" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M94 105 L94 135 M106 105 L106 135" stroke="#fff" stroke-width="1.2"/>
    <rect x="82" y="150" width="36" height="24" rx="4" fill="#0a0a0a" stroke="#333" stroke-width="0.6"/>
    <path d="M82 158 L118 158" stroke="#333" stroke-width="0.5" opacity="0.6"/>
    <circle cx="94" cy="132" r="1.5" fill="#888"/>
    <circle cx="106" cy="132" r="1.5" fill="#888"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#0a0a0a" stroke-width="2"/>
    <path d="M78 94 L82 110 M122 94 L118 110" stroke="#333" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M76 170 Q100 178 124 170" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.6"/>
    <ellipse cx="100" cy="195" rx="22" ry="4" fill="#000" opacity="0.4"/>`,

  // ГАВАЙКА (короткий рукав)
  b_hawaii: `<path d="${SS_L}" fill="url(#gWhite)" stroke="#e0d8b8" stroke-width="0.5"/>
    <path d="${SS_R}" fill="url(#gWhite)" stroke="#e0d8b8" stroke-width="0.5"/>
    <path d="M70 96 Q68 96 68 100 L68 205 L132 205 L132 100 Q132 96 130 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="url(#gWhite)" stroke="#e0d8b8" stroke-width="0.5"/>
    <path d="M104 96 L104 205 L132 205 L132 100 Q132 98 130 96 Z" fill="#e8e0c8" opacity="0.4"/>
    <path d="M78 96 Q100 82 122 96" fill="url(#gWhite)"/>
    <path d="M78 96 Q100 86 122 96" stroke="#e0d8b8" stroke-width="0.5" fill="none"/>
    <circle cx="82" cy="132" r="5" fill="#2ecc71"/>
    <circle cx="82" cy="132" r="2" fill="#27ae60"/>
    <line x1="82" y1="137" x2="80" y2="148" stroke="#2ecc71" stroke-width="1.5"/>
    <circle cx="120" cy="152" r="5" fill="#e91e63"/>
    <circle cx="120" cy="152" r="2" fill="#ad1457"/>
    <line x1="120" y1="157" x2="118" y2="168" stroke="#e91e63" stroke-width="1.5"/>
    <circle cx="90" cy="182" r="5" fill="#f39c12"/>
    <circle cx="90" cy="182" r="2" fill="#d68910"/>
    <line x1="90" y1="187" x2="88" y2="198" stroke="#f39c12" stroke-width="1.5"/>
    <circle cx="118" cy="192" r="4" fill="#9b59b6"/>
    <circle cx="118" cy="192" r="1.8" fill="#7d3c98"/>
    <line x1="118" y1="196" x2="116" y2="205" stroke="#9b59b6" stroke-width="1.5"/>
    <circle cx="76" cy="170" r="3" fill="#3498db"/>
    <circle cx="124" cy="120" r="3" fill="#f1c40f"/>
    <path d="M56 130 L66 132 M136 130 L144 128" stroke="#e0d8b8" stroke-width="0.6" fill="none"/>`,

  // РЫЦАРСКИЙ ДОСПЕХ (без рукавов, металл с тенями)
  b_armor: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="url(#gGray)" stroke="#4a5a5a" stroke-width="1"/>
    <path d="M105 96 L105 205 L130 205 L130 96 Z" fill="#5a6a6a" opacity="0.5"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#5a6a6a"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#5a6a6a"/>
    <path d="M70 96 Q56 100 50 122 L46 178 Q45 186 50 188 L56 186 Q53 180 55 165 L58 135 L64 118 L70 98 Z" fill="url(#gGray)" stroke="#4a5a5a" stroke-width="1"/>
    <path d="M130 96 Q144 100 150 122 L154 178 Q155 186 150 188 L144 186 Q147 180 145 165 L142 135 L136 118 L130 98 Z" fill="url(#gGray)" stroke="#4a5a5a" stroke-width="1"/>
    <path d="M52 130 L58 130 M48 160 L54 160" stroke="#a8b8b8" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M148 130 L142 130 M152 160 L146 160" stroke="#a8b8b8" stroke-width="0.6" fill="none" opacity="0.6"/>
    <rect x="84" y="124" width="32" height="60" fill="#5a6a6a" stroke="#4a5a5a" stroke-width="0.6"/>
    <path d="M88 128 L88 180" stroke="#7a8a8a" stroke-width="0.5" fill="none" opacity="0.5"/>
    <circle cx="100" cy="150" r="9" fill="#e74c3c" stroke="#8b0000" stroke-width="1"/>
    <path d="M96 148 L104 148 M100 144 L100 152" stroke="#8b0000" stroke-width="1"/>
    <circle cx="100" cy="150" r="3" fill="#c0392b"/>
    <rect x="92" y="104" width="16" height="12" fill="#5a6a6a" stroke="#4a5a5a" stroke-width="0.5"/>
    <path d="M82 96 L100 108 L118 96" stroke="#4a5a5a" stroke-width="1" fill="none"/>
    <path d="M84 96 L100 106 L116 96" stroke="#a8b8b8" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M72 110 L72 200 M128 110 L128 200" stroke="#7a8a8a" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  // БОМБЕР (длинный рукав)
  b_bomber: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M68 100 L68 205 L132 205 L132 100 Q120 94 100 94 Q80 94 68 100 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M105 94 L105 205 L132 205 L132 100 Q126 96 118 95 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M76 94 Q100 82 124 94" fill="#1a1a1a"/>
    <path d="M76 94 Q100 84 124 94" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M70 118 L130 118" stroke="#444" stroke-width="2"/>
    <path d="M70 116 L130 116" stroke="#222" stroke-width="0.4" opacity="0.6"/>
    <path d="M82 94 L82 205 M100 94 L100 205 M118 94 L118 205" stroke="#333" stroke-width="0.8" opacity="0.6"/>
    <rect x="88" y="145" width="24" height="12" fill="#0a0a0a" stroke="#333" stroke-width="0.4"/>
    <path d="M70 100 L62 118 L70 122 L74 108 Z" fill="#0a0a0a"/>
    <path d="M130 100 L138 118 L130 122 L126 108 Z" fill="#0a0a0a"/>
    <circle cx="100" cy="151" r="1" fill="#444"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#0a0a0a" stroke-width="2"/>
    <path d="M70 200 L130 200" stroke="#333" stroke-width="0.6" opacity="0.6"/>`,

  // ПОНЧО (широкое, с бахромой)
  b_poncho: `<path d="M100 90 Q80 88 60 100 Q40 130 38 200 L40 240 L160 240 L162 200 Q160 130 140 100 Q120 88 100 90 Z" fill="url(#gBrown)" stroke="#3d1a05" stroke-width="0.8"/>
    <path d="M100 90 Q120 88 140 100 Q160 130 162 200 L160 240 L100 240 Z" fill="#5a2e0a" opacity="0.35"/>
    <path d="M60 130 L140 130 M58 160 L142 160 M56 190 L144 190" stroke="#a0522d" stroke-width="2"/>
    <path d="M70 100 L70 240 M85 95 L85 240 M100 90 L100 240 M115 95 L115 240 M130 100 L130 240" stroke="#a0522d" stroke-width="1.5" opacity="0.8"/>
    <path d="M60 100 Q80 88 100 90 Q120 88 140 100" stroke="#3d1a05" stroke-width="2" fill="none"/>
    <path d="M48 105 Q58 98 68 100" stroke="#5a2e0a" stroke-width="1.5" fill="none"/>
    <path d="M132 100 Q142 98 152 105" stroke="#5a2e0a" stroke-width="1.5" fill="none"/>
    <path d="M42 235 L44 240 M52 235 L54 240 M62 235 L64 240 M72 235 L74 240 M82 235 L84 240 M92 235 L94 240 M102 235 L104 240 M112 235 L114 240 M122 235 L124 240 M132 235 L134 240 M142 235 L144 240 M152 235 L154 240" stroke="#3d1a05" stroke-width="1.2"/>
    <path d="M40 240 L160 240" stroke="#3d1a05" stroke-width="1.5"/>
    <path d="M56 130 L56 160 M76 130 L76 160 M96 130 L96 160 M116 130 L116 160 M136 130 L136 160" stroke="#5a2e0a" stroke-width="0.8" opacity="0.5"/>
    <ellipse cx="100" cy="115" rx="16" ry="3" fill="#3d1a05" opacity="0.4"/>`,

  // КИМОНО (широкие рукава, японский стиль)
  b_kimono: `<path d="M70 96 L70 205 L100 205 L100 96 Z" fill="url(#gPink)"/>
    <path d="M100 96 L100 205 L130 205 L130 96 Z" fill="url(#gPink)"/>
    <path d="M105 96 L105 205 L130 205 L130 96 Z" fill="#c2185b" opacity="0.5"/>
    <path d="M70 96 Q54 100 46 140 L44 175 L58 177 L62 140 L72 112 Z" fill="url(#gPink)" stroke="#c2185b" stroke-width="0.8"/>
    <path d="M130 96 Q146 100 154 140 L156 175 L142 177 L138 140 L128 112 Z" fill="url(#gPink)" stroke="#c2185b" stroke-width="0.8"/>
    <path d="M50 130 L58 130 M46 155 L54 155 M44 170 L52 170" stroke="#f8bbd0" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M150 130 L142 130 M154 155 L146 155 M156 170 L148 170" stroke="#f8bbd0" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M44 175 L58 177" stroke="#c2185b" stroke-width="1.5" opacity="0.8"/>
    <path d="M156 175 L142 177" stroke="#c2185b" stroke-width="1.5" opacity="0.8"/>
    <path d="M56 140 Q58 155 56 175" stroke="#f06292" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M144 140 Q142 155 144 175" stroke="#f06292" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M70 96 L100 140 L130 96" stroke="#8b0000" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M70 96 L100 140 L130 96" stroke="#c2185b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M74 96 L100 134 L126 96" stroke="#f06292" stroke-width="1.5" fill="none"/>
    <path d="M82 96 L100 128 L118 96" stroke="#f8bbd0" stroke-width="0.6" fill="none" opacity="0.7"/>
    <rect x="70" y="170" width="60" height="18" fill="url(#gPink)"/>
    <path d="M70 172 L130 172 M70 186 L130 186" stroke="#8b0000" stroke-width="1" opacity="0.7"/>
    <path d="M70 179 L130 179" stroke="#f06292" stroke-width="0.5" opacity="0.6"/>
    <circle cx="100" cy="179" r="3" fill="#f39c12"/>
    <circle cx="100" cy="179" r="1.5" fill="#fff"/>
    <path d="M100 179 L100 188" stroke="#f39c12" stroke-width="0.8" fill="none"/>`,

  // СПОРТИВНАЯ МАЙКА (без рукавов)
  b_jersey: `<path d="M72 100 Q70 96 74 96 L126 96 Q130 96 128 102 L128 205 L72 205 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M104 96 L104 205 L128 205 L128 102 Q128 98 126 96 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M80 96 Q100 82 120 96" fill="#1a1a1a"/>
    <path d="M84 100 Q84 108 76 112 M116 100 Q116 108 124 112" stroke="#0a0a0a" stroke-width="0.8" fill="none"/>
    <text x="100" y="165" text-anchor="middle" font-size="26" fill="#f1c40f" font-weight="900">10</text>
    <path d="M76 100 L76 125 M124 100 L124 125" stroke="#f1c40f" stroke-width="1.2" opacity="0.5"/>
    <path d="M82 96 Q100 86 118 96" stroke="#333" stroke-width="0.5" fill="none"/>`,

  // КРАСНОЕ ПЛАТЬЕ (без рукавов, платье)
  b_dress_red: `<path d="M72 96 Q70 96 70 105 L84 130 L62 240 L138 240 L116 130 L130 105 Q130 96 128 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="url(#gRed)" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M105 96 L105 108 Q113 108 116 130 L138 240 L110 240 L100 178 Z" fill="#8b1a0d" opacity="0.4"/>
    <path d="M70 200 L130 200" stroke="#8b1a0d" stroke-width="2"/>
    <ellipse cx="84" cy="155" rx="3" ry="4" fill="#f8f8f8" opacity="0.6"/>
    <ellipse cx="116" cy="170" rx="3" ry="4" fill="#f8f8f8" opacity="0.6"/>
    <ellipse cx="96" cy="195" rx="3" ry="4" fill="#f8f8f8" opacity="0.6"/>
    <path d="M84 130 Q100 145 116 130" stroke="#8b0000" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M82 96 L82 108 M118 96 L118 108" stroke="#e74c3c" stroke-width="0.5" opacity="0.6"/>`,

  // РУБАШКА С ГАЛСТУКОМ (длинный рукав)
  b_shirt_tie: `<path d="${SL_L}" fill="url(#gWhite)" stroke="#d0d0d0" stroke-width="0.5"/>
    <path d="${SL_R}" fill="url(#gWhite)" stroke="#d0d0d0" stroke-width="0.5"/>
    <path d="M72 96 Q70 96 70 100 L70 205 L130 205 L130 100 Q130 96 128 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="url(#gWhite)" stroke="#d0d0d0" stroke-width="0.5"/>
    <path d="M104 96 L104 205 L130 205 L130 100 Q130 98 128 96 Z" fill="#e0e0e0" opacity="0.4"/>
    <path d="M80 96 Q100 82 120 96" fill="url(#gWhite)"/>
    <path d="M96 96 L100 108 L104 96" fill="#d0d0d0" opacity="0.5"/>
    <path d="M100 108 L95 118 L100 126 L105 118 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M96 126 L104 126 L108 200 L92 200 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M98 126 L100 200 L102 126" stroke="#e74c3c" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M78 96 L82 130 M122 96 L118 130" stroke="#d0d0d0" stroke-width="0.8" fill="none"/>
    <path d="M54 192 L64 193 M136 193 L146 192" stroke="#e0e0e0" stroke-width="1.5"/>
    <circle cx="100" cy="145" r="1.2" fill="#c0392b"/>
    <circle cx="100" cy="160" r="1.2" fill="#c0392b"/>
    <circle cx="100" cy="175" r="1.2" fill="#c0392b"/>`,

  // МАЙКА ГАНГА (без рукавов)
  b_gang_shirt: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="url(#gRed)" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M105 96 L105 205 L130 205 L130 96 Z" fill="#8b1a0d" opacity="0.4"/>
    <path d="M76 96 Q100 82 124 96" fill="#a93226"/>
    <path d="M84 100 Q84 108 74 112 M116 100 Q116 108 126 112" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <text x="100" y="155" text-anchor="middle" font-size="15" fill="#f39c12" font-weight="900">ГАНГ</text>
    <path d="M70 130 L130 130 M70 170 L130 170" stroke="#8b0000" stroke-width="1.2" opacity="0.6"/>
    <circle cx="100" cy="185" r="3" fill="#f39c12"/>
    <path d="M76 96 Q100 84 124 96" stroke="#5a0f08" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  // КУРТКА ГАНГА (длинный рукав)
  b_gang_jacket: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M70 96 L130 96 L130 205 L70 205 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 96 Q100 82 124 96" fill="#0a0a0a"/>
    <path d="M70 96 L100 132 L130 96" stroke="#f39c12" stroke-width="2" fill="none"/>
    <text x="100" y="170" text-anchor="middle" font-size="13" fill="#f39c12" font-weight="900">CLAN</text>
    <circle cx="100" cy="150" r="5" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <circle cx="100" cy="150" r="2" fill="#e74c3c" opacity="0.6"/>
    <path d="M82 96 L82 205 M118 96 L118 205" stroke="#333" stroke-width="0.8" opacity="0.6"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#0a0a0a" stroke-width="2"/>`,

  // БРОНЯ ГАНГА (без рукавов, gang armor)
  b_gang_armor: `<path d="M64 90 L136 90 L142 215 L58 215 Z" fill="url(#gNavy)" stroke="#f39c12" stroke-width="2.2"/>
    <path d="M64 90 Q52 96 46 120 L42 178 Q41 186 46 188 L52 186 Q49 180 51 165 L54 135 L60 118 L66 96 Z" fill="url(#gNavy)" stroke="#f39c12" stroke-width="2"/>
    <path d="M136 90 Q148 96 154 120 L158 178 Q159 186 154 188 L148 186 Q151 180 149 165 L146 135 L140 118 L134 96 Z" fill="url(#gNavy)" stroke="#f39c12" stroke-width="2"/>
    <path d="M74 112 L126 112 M74 142 L126 142 M74 172 L126 172" stroke="#f39c12" stroke-width="1.5"/>
    <ellipse cx="100" cy="155" rx="13" ry="15" fill="#c0392b" stroke="#8b0000" stroke-width="1"/>
    <text x="100" y="162" text-anchor="middle" font-size="14" fill="#f39c12" font-weight="900">☭</text>
    <path d="M64 90 L100 105 L136 90" stroke="#f39c12" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M48 140 L54 140 M44 165 L50 165" stroke="#f39c12" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M152 140 L146 140 M156 165 L150 165" stroke="#f39c12" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  // СПОРТИВКА ADIDAS (case, длинный рукав)
  b_case_tracksuit: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M68 100 L68 205 L132 205 L132 100 Q120 94 100 94 Q80 94 68 100 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 94 Q100 82 124 94" fill="#1a1a1a"/>
    <path d="M70 116 L130 116" stroke="#fff" stroke-width="2"/>
    <path d="M70 126 L130 126" stroke="#fff" stroke-width="0.8" opacity="0.7"/>
    <path d="M82 140 L82 205 M100 140 L100 205 M118 140 L118 205" stroke="#fff" stroke-width="0.8" opacity="0.5"/>
    <path d="M56 130 L66 128 M136 130 L144 128" stroke="#fff" stroke-width="0.8" opacity="0.6"/>
    <path d="M54 175 L64 175 M136 175 L146 175" stroke="#fff" stroke-width="0.8" opacity="0.6"/>`,

  // ПИДЖАК ARMANI (REAL) (case, длинный рукав)
  b_case_armani_real: `<path d="${SL_L}" fill="url(#gBlack)" stroke="#000" stroke-width="0.6"/>
    <path d="${SL_R}" fill="url(#gBlack)" stroke="#000" stroke-width="0.6"/>
    <path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="url(#gBlack)" stroke="#000" stroke-width="0.6"/>
    <path d="M100 178 L86 100 M100 178 L114 100" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M88 96 L100 170 L112 96 Z" fill="#1a1a1a"/>
    <path d="M88 100 L92 108 L108 108 L112 100" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <circle cx="100" cy="155" r="2.5" fill="#f39c12"/>
    <circle cx="100" cy="172" r="2.5" fill="#f39c12"/>
    <path d="M84 120 L116 120" stroke="#f39c12" stroke-width="0.8" opacity="0.7"/>
    <path d="M54 192 L64 192 M136 192 L146 192" stroke="#000" stroke-width="2"/>`,

  // ДОСПЕХ ДРАКОНА (case, без рукавов)
  b_case_dragon_armor: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="url(#gNavy)" stroke="#1a252f" stroke-width="1"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#1a252f"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#1a252f"/>
    <path d="M70 96 Q56 100 50 122 L46 178 Q45 186 50 188 L56 186 Q53 180 55 165 L58 135 L64 118 L70 98 Z" fill="url(#gNavy)" stroke="#1a252f" stroke-width="1"/>
    <path d="M130 96 Q144 100 150 122 L154 178 Q155 186 150 188 L144 186 Q147 180 145 165 L142 135 L136 118 L130 98 Z" fill="url(#gNavy)" stroke="#1a252f" stroke-width="1"/>
    <rect x="84" y="124" width="32" height="60" fill="#1a252f"/>
    <path d="M84 130 L100 120 L116 130" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M84 180 L100 190 L116 180" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M76 120 Q100 112 124 120" stroke="#f39c12" stroke-width="1.5" fill="none"/>
    <ellipse cx="100" cy="155" rx="9" ry="13" fill="#e74c3c" stroke="#8b0000" stroke-width="1"/>
    <path d="M94 152 L106 152" stroke="#8b0000" stroke-width="0.8"/>
    <path d="M92 108 L100 118 L108 108" stroke="#34495e" stroke-width="0.8" fill="none"/>`,

  // БРОНЯ МАКСИМУСА (case, TOP1)
  b_case_top1_body: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.8"/>
    <path d="M70 96 Q56 100 50 122 L46 178 Q45 186 50 188 L56 186 Q53 180 55 165 L58 135 L64 118 L70 98 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.8"/>
    <path d="M130 96 Q144 100 150 122 L154 178 Q155 186 150 188 L144 186 Q147 180 145 165 L142 135 L136 118 L130 98 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.8"/>
    <path d="M85 125 L100 108 L115 125 L115 172 L100 188 L85 172 Z" fill="#2c1810" stroke="#ffd700" stroke-width="1.2"/>
    <ellipse cx="100" cy="148" rx="9" ry="11" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="100" cy="148" r="4.5" fill="#e74c3c"/>
    <circle cx="100" cy="148" r="1.8" fill="#fff" opacity="0.9"/>
    <path d="M76 100 Q100 90 124 100" stroke="#f39c12" stroke-width="2" fill="none"/>
    <path d="M76 200 Q100 208 124 200" stroke="#f39c12" stroke-width="2" fill="none"/>
    <path d="M52 140 L58 138 M46 165 L52 163" stroke="#f39c12" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M148 140 L142 138 M154 165 L148 163" stroke="#f39c12" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  // МАНТИЯ ИМПЕРАТОРА (case, TOP2)
  b_case_top2_body: `<path d="M64 90 L136 90 L142 215 L58 215 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2.2"/>
    <path d="M64 90 Q50 96 44 120 L40 178 Q39 186 44 188 L50 186 Q47 180 49 165 L52 135 L58 118 L64 96 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M136 90 Q150 96 156 120 L160 178 Q161 186 156 188 L150 186 Q153 180 151 165 L148 135 L142 118 L136 96 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M64 90 L84 106 L100 90 L116 106 L136 90" stroke="#ffd700" stroke-width="2" fill="none"/>
    <path d="M74 132 L126 132 M74 162 L126 162 M74 192 L126 192" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="100" cy="146" rx="13" ry="11" fill="#ffd700" stroke="#1a0f2e" stroke-width="1.5"/>
    <text x="100" y="152" text-anchor="middle" font-size="16" fill="#8b0000" font-weight="900">☭</text>
    <circle cx="84" cy="110" r="2.5" fill="#fff"/>
    <circle cx="116" cy="110" r="2.5" fill="#fff"/>`,

  // ФУТБОЛКА С ЦЕПЯМИ (case, без рукавов)
  b_case_chains: `<path d="M70 96 L70 205 L130 205 L130 96 Z" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 96 Q100 82 124 96" fill="#1a1a1a"/>
    <path d="M84 100 Q84 108 74 112 M116 100 Q116 108 126 112" stroke="#0a0a0a" stroke-width="0.8" fill="none"/>
    <g stroke="#d4d4d4" stroke-width="2" fill="none">
      <circle cx="82" cy="126" r="4"/><circle cx="82" cy="136" r="4"/><circle cx="82" cy="146" r="4"/><circle cx="82" cy="156" r="4"/>
      <circle cx="118" cy="126" r="4"/><circle cx="118" cy="136" r="4"/><circle cx="118" cy="146" r="4"/><circle cx="118" cy="156" r="4"/>
    </g>
    <circle cx="100" cy="120" r="3" fill="#c0c0c0" stroke="#888" stroke-width="0.5"/>
    <path d="M100 123 L100 170" stroke="#c0c0c0" stroke-width="1.2"/>`
      // ===================== НОГИ (l_*) =====================
  l_family: `<path d="M75 200 L75 250 L100 250 L100 200 Z" fill="url(#gBlue)"/>
    <path d="M100 200 L100 250 L125 250 L125 200 Z" fill="url(#gBlue)"/>
    <path d="M105 200 L105 250 L125 250 L125 200 Z" fill="#2980b9" opacity="0.4"/>
    <path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#2980b9"/>
    <path d="M75 210 L125 210" stroke="#1a6690" stroke-width="1" opacity="0.5"/>
    <path d="M85 225 L85 250 M115 225 L115 250" stroke="#2980b9" stroke-width="0.5" opacity="0.5"/>`,
  l_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gBlack)" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M80 210 L80 358 M84 210 L84 358 M88 210 L88 358" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 210 L106 358 M110 210 L110 358 M114 210 L114 358" stroke="#fff" stroke-width="1.5"/>
    <path d="M75 205 L99 205 M101 205 L125 205" stroke="#333" stroke-width="1"/>
    <path d="M80 355 L80 365 M84 355 L84 365 M88 355 L88 365" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 355 L106 365 M110 355 L110 365 M114 355 L114 365" stroke="#fff" stroke-width="1.5"/>`,
  l_ripped: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#2c4566" opacity="0.3"/>
    <ellipse cx="87" cy="255" rx="5" ry="4" fill="${SKIN}"/><ellipse cx="112" cy="290" rx="6" ry="5" fill="${SKIN}"/>
    <ellipse cx="85" cy="320" rx="5" ry="4" fill="${SKIN}"/><ellipse cx="115" cy="340" rx="5" ry="4" fill="${SKIN}"/>
    <path d="M75 205 L125 205" stroke="#2c4566" stroke-width="1.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#b8860b"/><circle cx="112" cy="208" r="1.5" fill="#b8860b"/>`,
  l_shorts: `<path d="M75 200 L75 265 L100 265 L100 200 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M100 200 L100 265 L125 265 L125 200 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M105 200 L105 265 L125 265 L125 200 Z" fill="#d68910" opacity="0.35"/>
    <path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#e67e22"/>
    <path d="M82 230 L82 265 M118 230 L118 265" stroke="#d68910" stroke-width="0.6" opacity="0.6"/>`,
  l_levis: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#2c4566" opacity="0.35"/>
    <path d="M75 205 L125 205" stroke="#2c4566" stroke-width="3"/>
    <circle cx="88" cy="208" r="1.5" fill="#b8860b"/><circle cx="112" cy="208" r="1.5" fill="#b8860b"/>
    <path d="M88 214 L88 300 M112 214 L112 300" stroke="#2c4566" stroke-width="0.8" opacity="0.6"/>`,
  l_lampasy: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gBlack)"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gBlack)"/>
    <path d="M96 205 L96 365 M104 205 L104 365" stroke="#e74c3c" stroke-width="2.5"/>
    <path d="M80 205 L80 365 M120 205 L120 365" stroke="#fff" stroke-width="1" opacity="0.5"/>
    <path d="M75 205 L125 205" stroke="#333" stroke-width="1"/>`,
  l_camo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#camo)" stroke="#3a4a2a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#camo)" stroke="#3a4a2a" stroke-width="0.5"/>`,
  l_classic: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gNavy)" stroke="#1a252f" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gNavy)" stroke="#1a252f" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#1a252f" opacity="0.35"/>
    <path d="M75 205 L125 205" stroke="#1a252f" stroke-width="2"/>
    <path d="M87 214 L87 358 M113 214 L113 358" stroke="#1a252f" stroke-width="1"/>`,
  l_leather: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <path d="M80 230 L80 340 M106 230 L106 340" stroke="#333" stroke-width="1"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#444" stroke-width="0.8" stroke-dasharray="2,2"/>`,
  l_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.8"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#d4ac0d" opacity="0.4"/>
    <path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M75 205 L125 205" stroke="#b8860b" stroke-width="3"/>
    <circle cx="100" cy="210" r="3" fill="#fff"/>
    <circle cx="85" cy="240" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="115" cy="280" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="85" cy="320" r="1" fill="#fff" opacity="0.7"/>`,
  l_joggers: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gNavy)" stroke="#2c3e50" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gNavy)" stroke="#2c3e50" stroke-width="0.5"/>
    <ellipse cx="87" cy="362" rx="12" ry="3" fill="#2c3e50"/><ellipse cx="113" cy="362" rx="12" ry="3" fill="#2c3e50"/>
    <path d="M80 220 L80 340 M120 220 L120 340" stroke="#2c3e50" stroke-width="0.8" opacity="0.6"/>`,
  l_chinos: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#d4a97a" stroke="#b8916a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#d4a97a" stroke="#b8916a" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#b8916a" opacity="0.3"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#b8916a" stroke-width="0.8"/>
    <path d="M75 205 L125 205" stroke="#a07a5a" stroke-width="1"/>`,
  l_skinny: `<rect x="78" y="205" width="20" height="160" rx="3" fill="#1a1a2e" stroke="#0a0a1e" stroke-width="0.4"/>
    <rect x="102" y="205" width="20" height="160" rx="3" fill="#1a1a2e" stroke="#0a0a1e" stroke-width="0.4"/>
    <path d="M102 205 L102 365 L122 365 L122 205 Z" fill="#0a0a1e" opacity="0.35"/>
    <path d="M88 220 L88 358 M112 220 L112 358" stroke="#2c3e50" stroke-width="0.6"/>`,
  l_baggy: `<path d="M70 205 Q68 210 70 220 L70 365 L98 365 L98 205 Z" fill="#5a5a5a" stroke="#3d3d3d" stroke-width="0.5"/>
    <path d="M130 205 Q132 210 130 220 L130 365 L102 365 L102 205 Z" fill="#5a5a5a" stroke="#3d3d3d" stroke-width="0.5"/>
    <path d="M102 205 L102 365 L130 365 L130 205 Z" fill="#3d3d3d" opacity="0.3"/>
    <path d="M70 220 Q100 226 130 220" stroke="#3d3d3d" stroke-width="1" fill="none"/>
    <path d="M75 250 Q75 320 75 360 M125 250 Q125 320 125 360" stroke="#3d3d3d" stroke-width="0.6" fill="none" opacity="0.5"/>`,
  l_overalls: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="70" y="180" width="60" height="30" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="76" y="96" width="8" height="90" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="116" y="96" width="8" height="90" fill="url(#gBlue)" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="78" y="94" width="8" height="8" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <rect x="114" y="94" width="8" height="8" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M70 190 L130 190" stroke="#2c4566" stroke-width="1"/>`,
  l_kilt: `<path d="M70 195 L130 195 L138 295 L62 295 Z" fill="#1a5c1a" stroke="#0f3d0f" stroke-width="0.6"/>
    <path d="M105 195 L105 295 L138 295 L130 195 Z" fill="#0f3d0f" opacity="0.4"/>
    <path d="M78 195 L78 295 M92 195 L92 295 M108 195 L108 295 M122 195 L122 295" stroke="#0f3d0f" stroke-width="1.2"/>
    <path d="M62 295 L138 295 L144 310 L56 310 Z" fill="#0f3d0f"/>
    <path d="M62 295 L138 295" stroke="#0a2a0a" stroke-width="1.2"/>`,
  l_harem: `<path d="M70 205 L70 265 Q58 295 70 325 L100 325 L100 205 Z" fill="#9b7d5a" stroke="#7d6044" stroke-width="0.5"/>
    <path d="M130 205 L130 265 Q142 295 130 325 L100 325 L100 205 Z" fill="#9b7d5a" stroke="#7d6044" stroke-width="0.5"/>
    <ellipse cx="100" cy="220" rx="32" ry="6" fill="#7d6044"/>
    <path d="M60 305 Q100 315 140 305" stroke="#7d6044" stroke-width="1" fill="none"/>`,
  l_track: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M80 215 L80 358 M84 215 L84 358 M88 215 L88 358" stroke="#fff" stroke-width="1"/>
    <path d="M106 215 L106 358 M110 215 L110 358 M114 215 L114 358" stroke="#fff" stroke-width="1"/>
    <path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/>`,
  l_cargo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#camo)" stroke="#4a5b2a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#camo)" stroke="#4a5b2a" stroke-width="0.5"/>
    <rect x="76" y="252" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <rect x="76" y="295" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <rect x="112" y="252" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <rect x="112" y="295" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>`,
  l_chains: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <circle cx="80" cy="240" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="80" cy="250" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="80" cy="260" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="120" cy="280" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="120" cy="290" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>`,
  l_case_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#fff" stroke-width="1.5"/>
    <path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/>
    <circle cx="87" cy="240" r="2" fill="#f39c12"/><circle cx="87" cy="280" r="2" fill="#f39c12"/>
    <circle cx="113" cy="240" r="2" fill="#f39c12"/><circle cx="113" cy="280" r="2" fill="#f39c12"/>`,
  l_case_gold_shorts: `<path d="M72 200 L72 265 L100 265 L100 200 Z" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M100 200 L100 265 L128 265 L128 200 Z" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M72 200 L128 200 L128 215 L72 215 Z" fill="#d4ac0d"/>
    <path d="M80 240 L92 240 M108 240 L120 240 M80 250 L92 250 M108 250 L120 250" stroke="#fff" stroke-width="1.2" opacity="0.7"/>
    <circle cx="85" cy="225" r="2" fill="#fff"/><circle cx="115" cy="225" r="2" fill="#fff"/><circle cx="100" cy="235" r="2" fill="#fff"/>`,
  l_case_dragon_pants: `<path d="M74 205 L74 365 L100 365 L100 205 Z" fill="url(#gNavy)" stroke="#1a252f" stroke-width="0.7"/>
    <path d="M100 205 L100 365 L126 365 L126 205 Z" fill="url(#gNavy)" stroke="#1a252f" stroke-width="0.7"/>
    <path d="M75 205 L125 205" stroke="#e74c3c" stroke-width="2"/>
    <path d="M85 215 L85 360 M115 215 L115 360" stroke="#e74c3c" stroke-width="1" opacity="0.6"/>
    <path d="M80 240 Q92 245 80 260" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <path d="M120 240 Q108 245 120 260" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <circle cx="85" cy="300" r="2" fill="#f39c12"/><circle cx="115" cy="300" r="2" fill="#f39c12"/>`,
  l_case_top1_legs: `<rect x="72" y="200" width="28" height="170" rx="4" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.5"/>
    <rect x="100" y="200" width="28" height="170" rx="4" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M84 214 L84 360 M92 214 L92 360 M108 214 L108 360 M116 214 L116 360" stroke="#ffd700" stroke-width="1.5"/>
    <circle cx="86" cy="240" r="3.5" fill="#e74c3c"/><circle cx="114" cy="240" r="3.5" fill="#e74c3c"/>
    <circle cx="86" cy="310" r="3.5" fill="#e74c3c"/><circle cx="114" cy="310" r="3.5" fill="#e74c3c"/>
    <path d="M72 200 L100 200 M100 200 L128 200" stroke="#f39c12" stroke-width="1.5"/>`,
  l_case_top2_legs: `<rect x="68" y="195" width="32" height="175" rx="4" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <rect x="100" y="195" width="32" height="175" rx="4" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M80 210 L80 365 M84 210 L84 365 M88 210 L88 365 M96 210 L96 365" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M104 210 L104 365 M112 210 L112 365 M116 210 L116 365 M120 210 L120 365" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="84" cy="250" rx="6" ry="8" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <ellipse cx="116" cy="250" rx="6" ry="8" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="84" cy="250" r="3" fill="#e74c3c"/><circle cx="116" cy="250" r="3" fill="#e74c3c"/>
    <path d="M68 195 L132 195" stroke="#f39c12" stroke-width="1.5"/>`,
  l_gang_pants: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gRed)" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gRed)" stroke="#8b0000" stroke-width="0.5"/>
    <path d="M75 205 L125 205" stroke="#f39c12" stroke-width="2"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#f39c12" stroke-width="1" opacity="0.6"/>
    <circle cx="87" cy="250" r="2" fill="#f39c12"/><circle cx="113" cy="250" r="2" fill="#f39c12"/>`,
  l_gang_tracksuit: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M75 205 L125 205" stroke="#f39c12" stroke-width="1.5"/>`,
  l_gang_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.8"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <circle cx="87" cy="250" r="3.5" fill="#8b0000"/><circle cx="113" cy="250" r="3.5" fill="#8b0000"/>
    <circle cx="87" cy="310" r="3.5" fill="#8b0000"/><circle cx="113" cy="310" r="3.5" fill="#8b0000"/>`,

  // ===================== ПРАВАЯ РУКА (rh_*) =====================
  rh_cig: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="0" y="-2" width="32" height="4" rx="1.5" fill="#f5f5f5"/><rect x="4" y="-2" width="12" height="4" fill="#d4a97a"/><circle cx="32" cy="0" r="3" fill="#ff6600"/><circle cx="32" cy="0" r="1.5" fill="#ffcc00"/></g>`,
  rh_beer: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-8" y="-42" width="16" height="38" rx="3" fill="#8b6914"/><rect x="-5" y="-52" width="10" height="14" fill="#8b6914"/><rect x="-5" y="-58" width="10" height="8" fill="#d4ac0d"/><rect x="-8" y="-30" width="16" height="10" fill="#c0392b"/></g>`,
  rh_baltica: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-7" y="-44" width="14" height="40" rx="2" fill="#1a1a1a"/><rect x="-4" y="-54" width="8" height="14" fill="#1a1a1a"/><rect x="-4" y="-60" width="8" height="8" fill="#f39c12"/><circle cx="0" cy="-25" r="6" fill="#f39c12"/><text x="0" y="-22" text-anchor="middle" font-size="7" fill="#1a1a1a" font-weight="900">9</text></g>`,
  rh_shaverma: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><path d="M-10 0 Q-14 -12 -10 -35 Q0 -45 10 -35 Q14 -12 10 0 Z" fill="#f5e6c8" stroke="#d4c8a8"/><path d="M-6 -18 Q0 -14 6 -18 M-8 -28 Q0 -24 8 -28" stroke="#c0392b" stroke-width="1.5" fill="none"/></g>`,
  rh_rose: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><line x1="0" y1="0" x2="0" y2="-55" stroke="#2ecc71" stroke-width="2.5"/><ellipse cx="0" cy="-60" rx="10" ry="12" fill="#c0392b"/><ellipse cx="0" cy="-60" rx="6" ry="7" fill="#e74c3c"/><circle cx="0" cy="-60" r="2.5" fill="#8b0000"/></g>`,
  rh_rod: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><line x1="0" y1="0" x2="0" y2="-95" stroke="#8b6914" stroke-width="3"/><line x1="0" y1="-95" x2="-5" y2="-70" stroke="#888" stroke-width="0.6"/><circle cx="-5" cy="-70" r="3" fill="#c0392b"/><circle cx="0" cy="-95" r="3" fill="#5a3a0a"/></g>`,
  rh_bat: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-4" y="-85" width="8" height="85" rx="3" fill="#8b6914"/><rect x="-7" y="-105" width="14" height="25" rx="5" fill="#a07020"/><rect x="-10" y="-6" width="20" height="6" rx="2" fill="#5a3a0a"/></g>`,
  rh_nerf: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-4" y="-12" width="20" height="8" rx="1.5" fill="#f39c12"/><rect x="16" y="-14" width="14" height="12" rx="2" fill="#f39c12"/><rect x="-6" y="-10" width="6" height="18" rx="2" fill="#e67e22"/><circle cx="4" cy="-4" r="2" fill="#c0392b"/></g>`,
  rh_flag_rus: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><line x1="0" y1="0" x2="0" y2="-85" stroke="#888" stroke-width="2.5"/><rect x="0" y="-85" width="45" height="11" fill="#fff"/><rect x="0" y="-74" width="45" height="11" fill="#3498db"/><rect x="0" y="-63" width="45" height="11" fill="#e74c3c"/></g>`,
  rh_case: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-16" y="-42" width="32" height="32" rx="3" fill="#8b6914"/><rect x="-16" y="-32" width="32" height="4" fill="#b8860b"/><circle cx="0" cy="-46" r="5" fill="none" stroke="#8b6914" stroke-width="2.5"/><text x="0" y="-20" text-anchor="middle" font-size="10" fill="#ffd700" font-weight="900">$</text></g>`,
  rh_knife: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-5" y="-15" width="10" height="15" rx="2" fill="#1a1a1a"/><path d="M-5 -15 L5 -15 L4 -48 L0 -55 L-4 -48 Z" fill="#d4d4d4" stroke="#888"/><rect x="-7" y="-2" width="14" height="3" rx="1" fill="#333"/></g>`,
  rh_book: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-14" y="-42" width="28" height="42" rx="2" fill="#c0392b"/><rect x="-14" y="-42" width="5" height="42" fill="#8b1a1a"/><text x="0" y="-10" text-anchor="middle" font-size="6" fill="#fff" font-weight="900">BOOK</text></g>`,
  rh_donut: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><circle cx="0" cy="-22" r="16" fill="#e67e22"/><circle cx="0" cy="-22" r="7" fill="#8b4513"/><path d="M-9 -28 Q-6 -33 0 -33 Q6 -33 9 -28" stroke="#e74c3c" stroke-width="2" fill="none"/></g>`,
  rh_icecream: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><path d="M-5 -40 L5 -40 L3 -8 L-3 -8 Z" fill="#f5deb3"/><circle cx="0" cy="-48" r="9" fill="#f06292"/><circle cx="0" cy="-58" r="5" fill="#e91e63"/></g>`,
  rh_glove: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><ellipse cx="0" cy="-15" rx="16" ry="18" fill="#c0392b"/><ellipse cx="0" cy="-30" rx="8" ry="6" fill="#a93226"/><rect x="-7" y="-2" width="14" height="8" rx="2" fill="#a93226"/></g>`,
  rh_bag: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><path d="M-12 -35 L12 -35 L15 5 L-15 5 Z" fill="#f5f5f5"/><path d="M-8 -35 Q-8 -44 0 -44 Q8 -44 8 -35" stroke="#888" stroke-width="1.8" fill="none"/></g>`,
  rh_brass: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><ellipse cx="0" cy="-18" rx="12" ry="10" fill="#888"/><circle cx="-7" cy="-24" r="3.5" fill="#666"/><circle cx="-1" cy="-26" r="3.5" fill="#666"/><circle cx="6" cy="-24" r="3.5" fill="#666"/></g>`,
  rh_watermelon: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><ellipse cx="0" cy="-18" rx="20" ry="17" fill="#2ecc71"/><path d="M-15 -25 Q0 -32 15 -25" fill="#a93226"/><circle cx="-5" cy="-27" r="1" fill="#000"/><circle cx="5" cy="-27" r="1" fill="#000"/></g>`,
  rh_fish: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><ellipse cx="0" cy="-20" rx="20" ry="10" fill="#4aa3df"/><path d="M18 -20 L28 -28 L28 -12 Z" fill="#2e86c1"/><circle cx="-12" cy="-22" r="2" fill="#1a1a1a"/></g>`,
  rh_burger: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><path d="M-18 -34 Q0 -42 18 -34 L18 -30 L-18 -30 Z" fill="#f39c12"/><rect x="-20" y="-30" width="40" height="4" fill="#2ecc71"/><rect x="-19" y="-26" width="38" height="7" fill="#8b4513"/><rect x="-20" y="-19" width="40" height="4" fill="#e74c3c"/><path d="M-18 -15 L18 -15 L20 -10 L-20 -10 Z" fill="#f39c12"/></g>`,
  rh_case_knife: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-6" y="-15" width="12" height="15" rx="2" fill="#1a1a1a"/><path d="M-6 -15 L6 -15 L5 -52 L0 -60 L-5 -52 Z" fill="#d4d4d4"/></g>`,
  rh_case_uzi_gold: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-6" y="-2" width="26" height="10" rx="1.5" fill="#ffd700"/><rect x="-6" y="8" width="8" height="16" fill="#d4ac0d"/><rect x="12" y="-8" width="5" height="12" fill="#d4ac0d"/></g>`,
  rh_case_dragon_sword: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-6" y="-2" width="12" height="18" rx="2" fill="#2c3e50"/><path d="M-5 -4 L5 -4 L4 -85 L0 -95 L-4 -85 Z" fill="#d4d4d4"/><path d="M0 -95 L3 -85 L0 -78 L-3 -85 Z" fill="#f39c12"/></g>`,
  rh_case_top1_weapon: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-7" y="-6" width="14" height="24" rx="2" fill="#1a0f2e"/><path d="M-6 -6 L6 -6 L5 -88 L0 -100 L-5 -88 Z" fill="#c0c0c0"/><path d="M0 -100 L4 -88 L0 -82 L-4 -88 Z" fill="#ffd700"/></g>`,
  rh_case_top2_weapon: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-9" y="-2" width="18" height="24" rx="3" fill="#8b0000"/><path d="M-5 -4 L-5 -38 Q0 -60 5 -38 L5 -4 Z" fill="#ffd700"/><circle cx="0" cy="-44" r="6" fill="#e74c3c"/></g>`,
  rh_gang_bat: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-4" y="-78" width="8" height="78" rx="3" fill="#3d2a10"/><rect x="-7" y="-98" width="14" height="22" rx="5" fill="#5a3a1e"/><path d="M-3 -80 L3 -80 M-4 -70 L4 -70" stroke="#f39c12" stroke-width="1.5"/></g>`,
  rh_gang_mace: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-4" y="-14" width="8" height="30" fill="#5a3a1e"/><circle cx="0" cy="-32" r="16" fill="#7f8c8d" stroke="#f39c12" stroke-width="1.5"/><circle cx="0" cy="-32" r="5" fill="#c0392b"/></g>`,
  rh_gang_halberd: `<g transform="translate(145, 197) rotate(20) scale(1.5)"><rect x="-3" y="-85" width="6" height="110" fill="#5a3a1e"/><path d="M-9 -85 L0 -105 L9 -85 L5 -72 L-5 -72 Z" fill="#c0c0c0"/><path d="M0 -105 L3 -72 L-3 -72 Z" fill="#e74c3c"/></g>`,

  // ===================== ЛЕВАЯ РУКА (lh_*) =====================
  lh_phone: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-8" y="-40" width="16" height="30" rx="2" fill="#1a1a1a"/><rect x="-6" y="-37" width="12" height="24" fill="#3498db"/><circle cx="0" cy="-12" r="1.5" fill="#555"/></g>`,
  lh_wallet: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-14" y="-22" width="28" height="20" rx="2" fill="#8b4513"/><path d="M-14 -16 L14 -16" stroke="#5a2e0a"/><circle cx="8" cy="-12" r="2.5" fill="#f1c40f"/></g>`,
  lh_cola: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-7" y="-34" width="14" height="32" rx="2" fill="#c0392b"/><rect x="-7" y="-34" width="14" height="5" fill="#888"/><text x="0" y="-15" text-anchor="middle" font-size="9" fill="#fff" font-weight="900">C</text></g>`,
  lh_ext: `<g transform="translate(55, 197) rotate(-15) scale(1.5)"><rect x="-10" y="-45" width="20" height="48" rx="4" fill="#c0392b"/><rect x="-10" y="-42" width="20" height="4" fill="#fff"/><path d="M-3 -52 Q-10 -60 -14 -62" stroke="#333" stroke-width="2.5" fill="none"/><path d="M3 -52 Q10 -60 14 -62" stroke="#333" stroke-width="2.5" fill="none"/></g>`,
  lh_guitar: `<g transform="translate(55, 197) rotate(-15) scale(1.5)"><ellipse cx="0" cy="-8" rx="20" ry="18" fill="#8b4513"/><ellipse cx="-2" cy="-28" rx="17" ry="14" fill="#8b4513"/><circle cx="0" cy="-20" r="7" fill="#1a1a1a"/><rect x="-4" y="-70" width="8" height="42" fill="#5a2e0a"/></g>`,
  lh_shield: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><path d="M-20 -30 L20 -30 L20 -10 Q0 15 -20 -10 Z" fill="#7f8c8d"/><path d="M-20 -30 L20 -30" stroke="#e74c3c" stroke-width="2.5"/><path d="M-14 -22 L14 -22 M-8 -14 L8 -14" stroke="#fff" stroke-width="1.5"/><path d="M0 -28 L0 -14" stroke="#fff" stroke-width="1.5"/></g>`,
  lh_sword: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><line x1="0" y1="-8" x2="0" y2="-90" stroke="#bdc3c7" stroke-width="4.5"/><path d="M0 -90 L-4 -80 L0 -75 L4 -80 Z" fill="#bdc3c7"/><rect x="-10" y="-6" width="20" height="5" rx="1" fill="#8b6914"/><circle cx="0" cy="6" r="3.5" fill="#c0392b"/></g>`,
  lh_flag_ussr: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><line x1="0" y1="0" x2="0" y2="-85" stroke="#888" stroke-width="2.5"/><rect x="-42" y="-85" width="42" height="26" fill="#c0392b"/><text x="-21" y="-65" text-anchor="middle" font-size="14" fill="#f1c40f">☭</text></g>`,
  lh_briefcase: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-22" y="-32" width="44" height="32" rx="3" fill="#2c3e50"/><rect x="-22" y="-22" width="44" height="3" fill="#34495e"/><circle cx="0" cy="-36" r="5" fill="none" stroke="#2c3e50" stroke-width="2.5"/><text x="0" y="-8" text-anchor="middle" font-size="14" fill="#fff" font-weight="900">❄</text></g>`,
  lh_cat: `<g transform="translate(55, 197) rotate(-15) scale(1.5)"><ellipse cx="0" cy="-12" rx="16" ry="18" fill="#f39c12"/><path d="M-13 -25 L-15 -38 L-6 -30 Z" fill="#f39c12"/><path d="M13 -25 L15 -38 L6 -30 Z" fill="#f39c12"/><circle cx="-5" cy="-16" r="2.5" fill="#222"/><circle cx="5" cy="-16" r="2.5" fill="#222"/></g>`,
  lh_coffee: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><path d="M-10 -30 L10 -30 L8 -4 L-8 -4 Z" fill="#fff"/><path d="M-10 -30 L10 -30" stroke="#8b4513" stroke-width="2"/><path d="M10 -22 Q16 -22 16 -16 Q16 -10 10 -10" stroke="#fff" stroke-width="2" fill="none"/></g>`,
  lh_hammer: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-4" y="-50" width="8" height="50" fill="#8b6914"/><rect x="-16" y="-56" width="32" height="14" rx="2" fill="#7f8c8d"/></g>`,
  lh_book2: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-18" y="-40" width="36" height="42" rx="2" fill="#2c3e50"/><rect x="-18" y="-40" width="7" height="42" fill="#1a252f"/><line x1="-6" y1="-32" x2="12" y2="-32" stroke="#fff" opacity="0.5"/><line x1="-6" y1="-22" x2="12" y2="-22" stroke="#fff" opacity="0.5"/></g>`,
  lh_ball: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><circle cx="0" cy="-20" r="16" fill="#fff"/><path d="M0 -36 Q12 -26 0 -4 Q-12 -26 0 -36 Z" fill="#1a1a1a"/><path d="M-16 -20 Q-10 -16 0 -20 Q10 -16 16 -20" stroke="#1a1a1a" stroke-width="1.5" fill="none"/></g>`,
  lh_umbrella: `<g transform="translate(55, 197) rotate(-15) scale(1.5)"><line x1="0" y1="0" x2="0" y2="-80" stroke="#333" stroke-width="2"/><path d="M-30 -55 Q-30 -85 0 -85 Q30 -85 30 -55 L30 -52 L-30 -52 Z" fill="#1a1a1a"/><path d="M0 0 Q-6 5 -6 -2" stroke="#333" stroke-width="2" fill="none"/></g>`,
  lh_laptop: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-22" y="-34" width="44" height="30" rx="2" fill="#2c3e50"/><rect x="-19" y="-31" width="38" height="24" fill="#3498db"/><rect x="-24" y="-4" width="48" height="4" fill="#1a252f"/></g>`,
  lh_champagne: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-8" y="-40" width="16" height="38" rx="2" fill="#1a4a1a"/><rect x="-5" y="-58" width="10" height="20" fill="#1a4a1a"/><rect x="-5" y="-64" width="10" height="6" fill="#d4ac0d"/><rect x="-8" y="-18" width="16" height="8" fill="#f1c40f"/></g>`,
  lh_sushi: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-22" y="-16" width="44" height="14" rx="2" fill="#1a1a1a"/><circle cx="-12" cy="-10" r="8" fill="#f5f5f5"/><circle cx="-12" cy="-10" r="4.5" fill="#e74c3c"/><circle cx="2" cy="-10" r="8" fill="#f5f5f5"/><circle cx="2" cy="-10" r="4.5" fill="#f39c12"/><circle cx="14" cy="-10" r="6" fill="#2ecc71"/></g>`,
  lh_pizza: `<g transform="translate(55, 197) rotate(-15) scale(1.5)"><path d="M-20 -5 L20 -5 L22 0 L-22 0 Z" fill="#f39c12"/><path d="M-20 -5 L0 -45 L20 -5 Z" fill="#f39c12"/><circle cx="-8" cy="-22" r="3.5" fill="#c0392b"/><circle cx="8" cy="-22" r="3.5" fill="#c0392b"/><circle cx="0" cy="-32" r="3" fill="#c0392b"/></g>`,
  lh_teddy: `<g transform="translate(55, 197) rotate(-15) scale(1.5)"><ellipse cx="0" cy="-16" rx="18" ry="20" fill="#8b6914"/><circle cx="0" cy="-32" r="13" fill="#8b6914"/><circle cx="-9" cy="-42" r="5.5" fill="#8b6914"/><circle cx="9" cy="-42" r="5.5" fill="#8b6914"/><circle cx="-5" cy="-34" r="2" fill="#1a1a1a"/><circle cx="5" cy="-34" r="2" fill="#1a1a1a"/></g>`,
  lh_case_lucky: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><circle cx="0" cy="-22" r="14" fill="#f1c40f"/><circle cx="0" cy="-22" r="10" fill="#d4ac0d"/><text x="0" y="-18" text-anchor="middle" font-size="10" fill="#fff" font-weight="900">₽</text></g>`,
  lh_case_pepper: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><path d="M-6 -45 Q-2 -50 4 -48 L6 -45 Q8 -20 2 -5 L-2 -5 Q-8 -20 -6 -45 Z" fill="#c0392b"/><path d="M-3 -47 Q0 -52 3 -48 Q5 -50 7 -47" fill="#2ecc71"/></g>`,
  lh_case_brilliant: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><rect x="-18" y="-22" width="36" height="24" rx="3" fill="#3498db"/><rect x="-18" y="-14" width="36" height="3" fill="#2874a6"/><circle cx="0" cy="-26" r="5" fill="none" stroke="#3498db" stroke-width="2.5"/><path d="M-10 -10 L-6 -4 L6 -4 L10 -10 Z" fill="#e74c3c"/></g>`,
  lh_case_top1_artifact: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><circle cx="0" cy="-25" r="20" fill="#1a0f2e" stroke="#ffd700" stroke-width="2"/><circle cx="0" cy="-25" r="14" fill="#2c1810"/><path d="M0 -38 L4 -30 L13 -30 L6 -24 L9 -15 L0 -20 L-9 -15 L-6 -24 L-13 -30 L-4 -30 Z" fill="#ffd700"/><circle cx="0" cy="-25" r="3.5" fill="#e74c3c"/></g>`,
  lh_case_top2_artifact: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><ellipse cx="0" cy="-25" rx="22" ry="20" fill="#ffd700" stroke="#8b0000" stroke-width="2.5"/><ellipse cx="0" cy="-25" rx="16" ry="14" fill="#1a0f2e"/><path d="M0 -40 L5 -30 L16 -28 L8 -21 L10 -10 L0 -16 L-10 -10 L-8 -21 L-16 -28 L-5 -30 Z" fill="#ffd700"/><circle cx="0" cy="-25" r="3.5" fill="#e74c3c"/></g>`,
  lh_gang_banner: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><line x1="0" y1="0" x2="0" y2="-75" stroke="#5a3a1e" stroke-width="2.5"/><path d="M0 -75 L38 -70 L33 -60 L38 -50 L0 -55 Z" fill="#c0392b"/><text x="19" y="-60" text-anchor="middle" font-size="9" fill="#f39c12" font-weight="900">ГАНГ</text></g>`,
  lh_gang_shield: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><path d="M-20 -30 L20 -30 L20 -8 Q0 16 -20 -8 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2"/><path d="M-20 -30 L20 -30" stroke="#c0392b" stroke-width="3"/><path d="M-14 -22 L14 -22 M-8 -14 L8 -14" stroke="#f39c12" stroke-width="2"/></g>`,
  lh_gang_trophy: `<g transform="translate(55, 197) rotate(-20) scale(1.5)"><path d="M-14 -38 L14 -38 L12 -20 Q0 -14 -12 -20 Z" fill="#ffd700"/><path d="M-14 -38 L-16 -32 Q-16 -25 -10 -22 M14 -38 L16 -32 Q16 -25 10 -22" stroke="#b8860b" stroke-width="1.2" fill="none"/><rect x="-3" y="-16" width="6" height="10" fill="#b8860b"/><rect x="-8" y="-6" width="16" height="6" rx="1" fill="#8b0000"/></g>`,

  // ===================== ПРИЧЁСКИ =====================
  hair_short_black: `<path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#1a1a1a"/><path d="M75 36 Q82 30 92 30" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/><path d="M108 30 Q118 30 125 36" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>`,
  hair_curly_brown: `<path d="M70 50 Q68 18 100 14 Q132 18 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#5a3a1e"/><circle cx="74" cy="36" r="6" fill="#6b4a2a"/><circle cx="82" cy="28" r="7" fill="#6b4a2a"/><circle cx="94" cy="24" r="7" fill="#6b4a2a"/><circle cx="106" cy="24" r="7" fill="#6b4a2a"/><circle cx="118" cy="28" r="7" fill="#6b4a2a"/><circle cx="126" cy="36" r="6" fill="#6b4a2a"/>`,
  hair_long_red: `<path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#c0392b"/><path d="M70 50 Q62 90 64 135 Q72 140 78 135 Q74 90 76 55 Z" fill="#c0392b"/><path d="M130 50 Q138 90 136 135 Q128 140 122 135 Q126 90 124 55 Z" fill="#c0392b"/>`,
  hair_mohawk_blue: `<path d="M88 8 Q92 -2 100 -4 Q108 -2 112 8 L112 20 Q100 16 88 20 Z" fill="#2c3e50"/><path d="M84 22 Q90 18 100 18 Q110 18 116 22 L114 48 Q100 44 86 48 Z" fill="#3498db"/><path d="M94 10 L100 0 L106 10 M92 16 L100 4 L108 16" stroke="#2c3e50" stroke-width="0.6" fill="none" opacity="0.7"/>`,
  hair_flowing_gold: `<path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z" fill="#f1c40f"/><path d="M68 52 Q58 100 60 155 Q60 175 68 180 Q76 175 72 155 Q72 100 76 58 Z" fill="#f1c40f"/><path d="M132 52 Q142 100 140 155 Q140 175 132 180 Q124 175 128 155 Q128 100 124 58 Z" fill="#f1c40f"/>`,

  // ===================== ОБУВЬ =====================
  shoes_worn: `<ellipse cx="86" cy="378" rx="17" ry="8" fill="#888" stroke="#444" stroke-width="0.6"/><ellipse cx="114" cy="378" rx="17" ry="8" fill="#888" stroke="#444" stroke-width="0.6"/><path d="M73 373 Q86 370 99 373" stroke="#666" stroke-width="0.8" fill="none"/><path d="M101 373 Q114 370 127 373" stroke="#666" stroke-width="0.8" fill="none"/><path d="M80 382 Q86 384 92 382 M108 382 Q114 384 120 382" stroke="#444" stroke-width="0.6" fill="none" opacity="0.6"/>`,
  shoes_sneakers: `<path d="M69 372 Q69 365 74 362 L98 362 L98 380 Q98 386 92 387 L74 387 Q69 387 69 380 Z" fill="#888" stroke="#555" stroke-width="0.5"/><path d="M102 362 L126 362 Q131 365 131 372 L131 380 Q131 387 126 387 L108 387 Q102 386 102 380 Z" fill="#888" stroke="#555" stroke-width="0.5"/><path d="M69 380 L98 380 M102 380 L131 380" stroke="#fff" stroke-width="1.5"/>`,
  shoes_nike: `<path d="M68 372 Q68 363 74 360 L98 360 L98 380 Q98 387 92 388 L72 388 Q68 388 68 380 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/><path d="M102 360 L126 360 Q132 363 132 372 L132 380 Q132 388 126 388 L108 388 Q102 387 102 380 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/><path d="M68 380 L98 380 M102 380 L132 380" stroke="#fff" stroke-width="1.8"/><path d="M70 372 Q80 368 96 372" stroke="#fff" stroke-width="2" fill="none"/><path d="M104 372 Q120 368 130 372" stroke="#fff" stroke-width="2" fill="none"/>`,
  shoes_jordan: `<path d="M66 371 Q66 358 72 355 L98 355 L98 380 Q98 389 90 390 L70 390 Q66 390 66 380 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/><path d="M102 355 L128 355 Q134 358 134 371 L134 380 Q134 390 130 390 L110 390 Q102 389 102 380 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/><path d="M66 380 L98 380 M102 380 L134 380" stroke="#1a1a1a" stroke-width="2.2"/>`,
  shoes_gold: `<path d="M68 372 Q68 363 74 360 L98 360 L98 380 Q98 387 92 388 L72 388 Q68 388 68 380 Z" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.8"/><path d="M102 360 L126 360 Q132 363 132 372 L132 380 Q132 388 126 388 L108 388 Q102 387 102 380 Z" fill="url(#gGold)" stroke="#b8860b" stroke-width="0.8"/><path d="M68 380 L98 380 M102 380 L132 380" stroke="#b8860b" stroke-width="2"/>`
};

function renderCharacterSVG(outfit, opts = {}) {
  const baseH = opts.height || 300;
  const head = outfit?.head_id?.item_id, body = outfit?.body_id?.item_id,
        legs = outfit?.legs_id?.item_id, rh = outfit?.right_hand_id?.item_id,
        lh = outfit?.left_hand_id?.item_id, hair = outfit?.hair_id?.item_id,
        shoes = outfit?.shoes_id?.item_id;

  const leftCfg = lh ? CUSTOM_IMAGES[lh] : null;
  const rightCfg = rh ? CUSTOM_IMAGES[rh] : null;
  const leftW = leftCfg ? leftCfg.w : 0, rightW = rightCfg ? rightCfg.w : 0;
  let vx = 0, vy = -15, vw = 200, vh = 415;
  if (leftW) { vx = -leftW; vw += leftW; }
  if (rightW) { vw += rightW; }
  const viewBox = `${vx} ${vy} ${vw} ${vh}`;
  let outW, outH;
  if (leftCfg || rightCfg) { outH = baseH; outW = baseH * (vw / vh); }
  else { outW = opts.width || 140; outH = opts.height || 280; }

  const renderGirl = (cfg) => {
    if (!cfg) return "";
    const x = cfg.side === "left" ? -cfg.w : 200;
    return `<foreignObject x="${x}" y="${cfg.y}" width="${cfg.w}" height="${cfg.h}"><img xmlns="http://www.w3.org/1999/xhtml" src="${cfg.url}" style="width:100%;height:100%;object-fit:contain;object-position:center bottom;display:block;" alt="" /></foreignObject>`;
  };

  return `<svg viewBox="${viewBox}" width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    ${renderDefs()}
    ${renderGirl(leftCfg)}
    ${renderBaseBody()}
    ${legs && ITEMS_SVG[legs] ? ITEMS_SVG[legs] : ''}
    ${shoes && ITEMS_SVG[shoes] ? ITEMS_SVG[shoes] : ''}
    ${body && ITEMS_SVG[body] ? ITEMS_SVG[body] : ''}
    ${rh && ITEMS_SVG[rh] ? ITEMS_SVG[rh] : ''}
    ${lh && ITEMS_SVG[lh] ? ITEMS_SVG[lh] : ''}
    ${hair && ITEMS_SVG[hair] ? ITEMS_SVG[hair] : ''}
    ${head && ITEMS_SVG[head] ? ITEMS_SVG[head] : ''}
    ${renderGirl(rightCfg)}
  </svg>`;
}