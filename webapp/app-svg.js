// app-svg.js
// v4.0 — детальная одежда: разные рукава, швы, складки, манжеты, градиентные тени.
// Предметы в руках увеличены ×1.8 (большие ×2.2), повёрнуты ОТ тела.
// v3: базовая геометрия тела сохранена.

const SKIN = "#e8b48a";
const SKIN_D = "#c99b6f";
const SKIN_S = "#a87a4f";
const SKIN_L = "#f8d4b0";

const CUSTOM_IMAGES = {
    "lh_tyanka":  { url: "/assets/hands/lh_tyanka.png",  side: "left",  y: 0,   w: 230, h: 400 },
    "lh_tyanka2": { url: "/assets/hands/lh_tyanka2.png", side: "left",  y: 160, w: 160, h: 240 },
    "rh_miku":    { url: "/assets/hands/rh_miku.png",    side: "right", y: 0,   w: 230, h: 400 },
    "rh_tyanka3": { url: "/assets/hands/rh_tyanka3.png", side: "right", y: 0,   w: 230, h: 400 }
};

// ═══ БАЗОВОЕ ТЕЛО (без изменений) ═══
function renderBaseBody() {
  return `
    <ellipse cx="100" cy="389" rx="58" ry="7" fill="rgba(0,0,0,0.42)"/>
    <ellipse cx="100" cy="389" rx="44" ry="4" fill="rgba(0,0,0,0.28)"/>

    <path d="M75 200 L74 355 Q74 372 82 374 L98 374 L99 200 Z"
          fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M97 210 L97 374 L99 374 L99 210 Z" fill="${SKIN_S}" opacity="0.28"/>
    <path d="M77 235 L77 275" stroke="${SKIN_L}" stroke-width="2" opacity="0.32" stroke-linecap="round"/>
    <ellipse cx="87" cy="285" rx="4" ry="2.5" fill="${SKIN_L}" opacity="0.32"/>

    <path d="M101 200 L101 374 L118 374 Q126 372 126 355 L125 200 Z"
          fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
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

    <path d="M72 100 Q68 100 68 110 L70 205 L130 205 L132 110 Q132 100 128 100 Z"
          fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M105 102 L105 205 L130 205 L132 110 Q132 103 128 102 Z" fill="${SKIN_S}" opacity="0.14"/>
    <path d="M78 118 Q90 124 100 122 Q110 124 122 118"
          stroke="${SKIN_D}" stroke-width="0.7" fill="none" opacity="0.55"/>
    <path d="M100 125 L100 142" stroke="${SKIN_D}" stroke-width="0.5" opacity="0.42"/>
    <path d="M90 152 L110 152 M90 165 L110 165" stroke="${SKIN_D}" stroke-width="0.4" opacity="0.35"/>
    <path d="M100 148 L100 180" stroke="${SKIN_D}" stroke-width="0.3" opacity="0.28"/>
    <circle cx="100" cy="191" r="1.1" fill="${SKIN_S}" opacity="0.55"/>
    <path d="M84 108 Q92 111 100 109 Q108 111 116 108" stroke="${SKIN_D}" stroke-width="0.4" fill="none" opacity="0.42"/>

    <path d="M90 78 L90 102 Q100 106 110 102 L110 78 Z" fill="${SKIN}"/>
    <path d="M90 94 Q100 100 110 94 L110 102 Q100 106 90 102 Z" fill="${SKIN_S}" opacity="0.35"/>

    <ellipse cx="70" cy="108" rx="14" ry="12" fill="${SKIN}"/>
    <ellipse cx="130" cy="108" rx="14" ry="12" fill="${SKIN}"/>
    <ellipse cx="70" cy="107" rx="9" ry="7" fill="${SKIN_L}" opacity="0.28"/>
    <ellipse cx="130" cy="107" rx="9" ry="7" fill="${SKIN_L}" opacity="0.28"/>

    <path d="M68 105 Q56 115 52 145 L48 185 Q46 195 54 197 L62 196 Q66 190 64 175 L66 140 L74 118 Z"
          fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M67 110 Q60 125 57 148 L53 178" stroke="${SKIN_L}" stroke-width="1.8" fill="none" opacity="0.33" stroke-linecap="round"/>
    <ellipse cx="55" cy="197" rx="11" ry="10" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="55" cy="194" rx="7" ry="4" fill="${SKIN_L}" opacity="0.28"/>
    <path d="M46 195 Q46 200 55 202 Q64 200 64 195" stroke="${SKIN_D}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M47 197 L47 201 M50 198 L50 202 M53 198 L53 202 M56 198 L56 202 M59 198 L59 202 M62 197 L62 201"
          stroke="${SKIN_S}" stroke-width="0.35" opacity="0.55"/>
    <ellipse cx="62" cy="191" rx="3.5" ry="4.5" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.4"/>

    <path d="M132 105 Q144 115 148 145 L152 185 Q154 195 146 197 L138 196 Q134 190 136 175 L134 140 L126 118 Z"
          fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.6" stroke-linejoin="round"/>
    <path d="M133 110 Q140 125 143 148 L147 178" stroke="${SKIN_L}" stroke-width="1.8" fill="none" opacity="0.33" stroke-linecap="round"/>
    <ellipse cx="145" cy="197" rx="11" ry="10" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="0.5"/>
    <ellipse cx="145" cy="194" rx="7" ry="4" fill="${SKIN_L}" opacity="0.28"/>
    <path d="M136 195 Q136 200 145 202 Q154 200 154 195" stroke="${SKIN_D}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M137 197 L137 201 M140 198 L140 202 M143 198 L143 202 M146 198 L146 202 M149 198 L149 202 M152 197 L152 201"
          stroke="${SKIN_S}" stroke-width="0.35" opacity="0.55"/>
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

// ═══ ХЕЛПЕРЫ РУКАВОВ ═══
// Длинный рукав — весь рукав (худи, пиджак, куртка)
const SL_LONG_L = (fill, shade) => `
  <path d="M73 96 L70 108 Q58 118 52 145 L47 183 Q45 194 53 198 L63 197 Q68 191 66 178 L68 145 L74 116 Z" fill="${fill}"/>
  <path d="M73 96 L70 108 Q58 118 52 145 L47 183 Q45 194 53 198 L57 198 Q54 192 55 183 L60 145 Q62 118 73 108 Z" fill="${shade}" opacity="0.35"/>
  <path d="M49 186 Q49 194 54 198" stroke="${shade}" stroke-width="1.2" fill="none" opacity="0.7"/>
  <path d="M50 194 Q56 198 62 197" stroke="${shade}" stroke-width="0.8" fill="none" opacity="0.5"/>
  <path d="M56 130 Q58 150 57 170" stroke="${shade}" stroke-width="0.5" fill="none" opacity="0.3"/>`;

const SL_LONG_R = (fill, shade) => `
  <path d="M127 96 L130 108 Q142 118 148 145 L153 183 Q155 194 147 198 L137 197 Q132 191 134 178 L132 145 L126 116 Z" fill="${fill}"/>
  <path d="M127 96 L130 108 Q142 118 148 145 L153 183 Q155 194 147 198 L143 198 Q146 192 145 183 L140 145 Q138 118 127 108 Z" fill="${shade}" opacity="0.35"/>
  <path d="M151 186 Q151 194 146 198" stroke="${shade}" stroke-width="1.2" fill="none" opacity="0.7"/>
  <path d="M150 194 Q144 198 138 197" stroke="${shade}" stroke-width="0.8" fill="none" opacity="0.5"/>
  <path d="M144 130 Q142 150 143 170" stroke="${shade}" stroke-width="0.5" fill="none" opacity="0.3"/>`;

// Короткий рукав — до середины плеча (футболка)
const SL_SHORT_L = (fill, shade) => `
  <path d="M73 96 L70 108 Q62 115 57 129 L64 136 Q70 131 73 120 L74 110 Z" fill="${fill}"/>
  <path d="M70 108 Q62 115 57 129 L60 131 Q64 121 71 114 Z" fill="${shade}" opacity="0.35"/>
  <path d="M57 129 L64 136" stroke="${shade}" stroke-width="1" fill="none" opacity="0.6"/>
  <path d="M58 128 Q61 126 63 127" stroke="${shade}" stroke-width="0.5" fill="none" opacity="0.4"/>`;

const SL_SHORT_R = (fill, shade) => `
  <path d="M127 96 L130 108 Q138 115 143 129 L136 136 Q130 131 127 120 L126 110 Z" fill="${fill}"/>
  <path d="M130 108 Q138 115 143 129 L140 131 Q136 121 129 114 Z" fill="${shade}" opacity="0.35"/>
  <path d="M143 129 L136 136" stroke="${shade}" stroke-width="1" fill="none" opacity="0.6"/>
  <path d="M142 128 Q139 126 137 127" stroke="${shade}" stroke-width="0.5" fill="none" opacity="0.4"/>`;

// Широкая накидка (кимоно, пончо) — цельный верх
const SL_FULL_L = (fill, shade, accent) => `
  <path d="M73 96 L66 104 Q52 130 48 168 L44 195 L78 198 L78 96 Z" fill="${fill}"/>
  <path d="M73 96 L66 104 Q52 130 48 168 L44 195 L50 196 L54 168 Q58 130 70 104 Z" fill="${shade}" opacity="0.28"/>
  <path d="M46 190 Q52 196 78 197" stroke="${accent || shade}" stroke-width="1.5" fill="none" opacity="0.6"/>
  <path d="M50 165 Q56 175 62 185" stroke="${shade}" stroke-width="0.5" fill="none" opacity="0.3"/>`;

const SL_FULL_R = (fill, shade, accent) => `
  <path d="M127 96 L134 104 Q148 130 152 168 L156 195 L122 198 L122 96 Z" fill="${fill}"/>
  <path d="M127 96 L134 104 Q148 130 152 168 L156 195 L150 196 L146 168 Q142 130 130 104 Z" fill="${shade}" opacity="0.28"/>
  <path d="M154 190 Q148 196 122 197" stroke="${accent || shade}" stroke-width="1.5" fill="none" opacity="0.6"/>
  <path d="M150 165 Q144 175 138 185" stroke="${shade}" stroke-width="0.5" fill="none" opacity="0.3"/>`;

// ═══ ВСЕ ПРЕДМЕТЫ ═══
const ITEMS_SVG = {

  // ═══════════════════════════════════════════════════════════
  //  ГОЛОВА
  // ═══════════════════════════════════════════════════════════

  h_cig: `<g transform="translate(115, 70) rotate(-15)">
    <rect x="0" y="-2" width="34" height="4" rx="1.5" fill="#f5f5f5" stroke="#c0c0c0" stroke-width="0.4"/>
    <rect x="4" y="-2" width="13" height="4" fill="#d4a97a"/>
    <rect x="4" y="-2" width="13" height="1" fill="#e8c898" opacity="0.6"/>
    <rect x="0" y="-2" width="34" height="1" fill="#fff" opacity="0.5"/>
    <line x1="6" y1="-1" x2="15" y2="-1" stroke="#c09060" stroke-width="0.3" opacity="0.6"/>
    <circle cx="34" cy="0" r="3" fill="#ff6600" opacity="0.9"/>
    <circle cx="34" cy="0" r="1.5" fill="#ffcc00"/>
    <circle cx="37" cy="-4" r="2" fill="#bbb" opacity="0.4"/>
    <circle cx="39" cy="-7" r="1.5" fill="#ccc" opacity="0.25"/>
    <circle cx="41" cy="-10" r="1" fill="#ddd" opacity="0.15"/>
  </g>`,

  h_cap: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M74 36 Q100 12 126 36" stroke="#333" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M80 30 Q100 20 120 30" stroke="#2a2a2a" stroke-width="0.6" fill="none" opacity="0.4"/>
    <path d="M84 32 Q100 24 116 32" stroke="#222" stroke-width="0.5" fill="none" opacity="0.3"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#0a0a0a"/>
    <path d="M132 40 Q150 40 158 43" stroke="#222" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M132 42 Q148 42 157 44" stroke="#0a0a0a" stroke-width="0.4" fill="none"/>
    <path d="M133 44 Q148 44 156 45" stroke="#222" stroke-width="0.3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="10" r="2.8" fill="#3a3a3a"/>
    <circle cx="100" cy="10" r="1.3" fill="#555"/>
    <circle cx="99" cy="9" r="0.6" fill="#888" opacity="0.6"/>
    <path d="M72 42 Q100 40 128 42" stroke="#333" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M74 40 Q100 38 126 40" stroke="#2a2a2a" stroke-width="0.3" fill="none" opacity="0.4"/>`,

  h_cap_red: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#c0392b" stroke="#8b1a0d" stroke-width="0.6"/>
    <path d="M74 36 Q100 12 126 36" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M80 30 Q100 20 120 30" stroke="#a93226" stroke-width="0.6" fill="none" opacity="0.4"/>
    <path d="M84 32 Q100 24 116 32" stroke="#8b1a0d" stroke-width="0.5" fill="none" opacity="0.3"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#a93226"/>
    <path d="M132 40 Q150 40 158 43" stroke="#c0392b" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M133 44 Q148 44 156 45" stroke="#8b1a0d" stroke-width="0.3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="10" r="2.8" fill="#7f1d13"/>
    <circle cx="100" cy="10" r="1.3" fill="#a93226"/>
    <path d="M72 42 Q100 40 128 42" stroke="#a93226" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M86 16 L86 20 M114 16 L114 20" stroke="#7f1d13" stroke-width="0.4" opacity="0.5"/>`,

  h_ushanka: `<path d="M68 38 Q100 6 132 38 L132 44 Q100 42 68 44 Z" fill="#6b4a2a" stroke="#4a3018" stroke-width="0.5"/>
    <path d="M74 36 Q100 10 126 36" stroke="#8a6440" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M68 38 L60 52 Q56 68 62 78 L74 76 Q68 64 70 52 L72 44 Z" fill="#5a3d20" stroke="#3d2810" stroke-width="0.4"/>
    <path d="M61 52 Q58 64 63 74" stroke="#7a5028" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M66 58 Q62 68 66 74" stroke="#4a3018" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M132 38 L140 52 Q144 68 138 78 L126 76 Q132 64 130 52 L128 44 Z" fill="#5a3d20" stroke="#3d2810" stroke-width="0.4"/>
    <path d="M139 52 Q142 64 137 74" stroke="#7a5028" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M134 58 Q138 68 134 74" stroke="#4a3018" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M74 40 Q100 30 126 40" stroke="#8b6034" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M66 72 Q70 76 74 74" stroke="#a89070" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M134 72 Q130 76 126 74" stroke="#a89070" stroke-width="0.6" fill="none" opacity="0.5"/>
    <circle cx="100" cy="8" r="4" fill="#5a3d20" stroke="#3d2810" stroke-width="0.4"/>
    <circle cx="100" cy="8" r="2" fill="#7a5028"/>`,

  h_balaclava: `<path d="M68 50 Q68 20 100 20 Q132 20 132 50 Q132 68 125 82 L75 82 Q68 68 68 50 Z" fill="#0a0a0a"/>
    <path d="M70 45 Q100 30 130 45" stroke="#222" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M72 52 Q100 38 128 52" stroke="#151515" stroke-width="0.8" fill="none" opacity="0.4"/>
    <ellipse cx="90" cy="52" rx="6.5" ry="6" fill="${SKIN}"/>
    <ellipse cx="110" cy="52" rx="6.5" ry="6" fill="${SKIN}"/>
    <ellipse cx="90" cy="52" rx="4" ry="3.5" fill="${SKIN_L}" opacity="0.3"/>
    <ellipse cx="110" cy="52" rx="4" ry="3.5" fill="${SKIN_L}" opacity="0.3"/>
    <circle cx="90" cy="52" r="2.5" fill="#000"/>
    <circle cx="110" cy="52" r="2.5" fill="#000"/>
    <circle cx="91" cy="51" r="0.8" fill="#fff"/>
    <circle cx="111" cy="51" r="0.8" fill="#fff"/>
    <path d="M70 44 Q100 34 130 44" stroke="#333" stroke-width="1.2" fill="none"/>
    <path d="M78 78 Q100 82 122 78" stroke="#222" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M85 75 Q100 78 115 75" stroke="#111" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M88 82 Q100 85 112 82" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.4"/>`,

  h_rooster: `<ellipse cx="100" cy="52" rx="31" ry="35" fill="#f5e8c8" stroke="#d4c8a8" stroke-width="0.6"/>
    <ellipse cx="108" cy="55" rx="20" ry="28" fill="#e8d8b8" opacity="0.4"/>
    <path d="M88 20 L92 6 L100 20 L108 6 L112 20 Z" fill="#c0392b" stroke="#8b1a0d" stroke-width="0.4"/>
    <path d="M92 18 L94 10" stroke="#e74c3c" stroke-width="0.6" opacity="0.6"/>
    <path d="M108 18 L106 10" stroke="#e74c3c" stroke-width="0.6" opacity="0.6"/>
    <circle cx="86" cy="48" r="6" fill="#fff" stroke="#333" stroke-width="0.5"/>
    <circle cx="86" cy="48" r="3" fill="#1a1a1a"/>
    <circle cx="87" cy="47" r="1" fill="#fff"/>
    <circle cx="114" cy="48" r="6" fill="#fff" stroke="#333" stroke-width="0.5"/>
    <circle cx="114" cy="48" r="3" fill="#1a1a1a"/>
    <circle cx="115" cy="47" r="1" fill="#fff"/>
    <path d="M90 68 L100 78 L110 68 L100 82 Z" fill="#e67e22" stroke="#a0522d" stroke-width="0.6"/>
    <path d="M92 70 L100 76 L108 70" stroke="#f39c12" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M73 60 Q70 64 74 66" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M127 60 Q130 64 126 66" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M78 28 Q92 22 108 28" stroke="#d4c8a8" stroke-width="0.4" fill="none" opacity="0.5"/>`,

  h_bandana: `<path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#c0392b" stroke="#8b1a0d" stroke-width="0.5"/>
    <path d="M72 35 Q100 18 128 35" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M68 38 L54 56 L60 54 L72 42 Z" fill="#a93226" stroke="#7a1f1a" stroke-width="0.4"/>
    <path d="M56 52 L63 48" stroke="#e74c3c" stroke-width="0.5" fill="none" opacity="0.5"/>
    <circle cx="84" cy="38" r="1.5" fill="#fff" opacity="0.65"/>
    <circle cx="100" cy="34" r="1.5" fill="#fff" opacity="0.65"/>
    <circle cx="116" cy="38" r="1.5" fill="#fff" opacity="0.65"/>
    <circle cx="92" cy="40" r="1.2" fill="#fff" opacity="0.45"/>
    <circle cx="108" cy="40" r="1.2" fill="#fff" opacity="0.45"/>
    <circle cx="76" cy="40" r="1.2" fill="#fff" opacity="0.45"/>
    <circle cx="124" cy="40" r="1.2" fill="#fff" opacity="0.45"/>`,

  h_wig: `<path d="M70 42 Q72 14 100 12 Q128 14 130 42 L130 50 Q100 48 70 50 Z" fill="#c8c8c8"/>
    <path d="M74 40 Q78 20 100 18 Q122 20 126 40" stroke="#a8a8a8" stroke-width="0.8" fill="none" opacity="0.5"/>
    <ellipse cx="68" cy="58" rx="6" ry="18" fill="#c8c8c8"/>
    <ellipse cx="68" cy="58" rx="4" ry="14" fill="#b8b8b8" opacity="0.5"/>
    <ellipse cx="132" cy="58" rx="6" ry="18" fill="#c8c8c8"/>
    <ellipse cx="132" cy="58" rx="4" ry="14" fill="#b8b8b8" opacity="0.5"/>
    <ellipse cx="100" cy="24" rx="24" ry="6" fill="#a8a8a8" opacity="0.5"/>
    <path d="M78 38 Q88 32 100 34 M122 38 Q112 32 100 34" stroke="#a8a8a8" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M82 28 Q90 24 98 26 M118 28 Q110 24 102 26" stroke="#888" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M74 44 Q76 50 74 56" stroke="#a8a8a8" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M126 44 Q124 50 126 56" stroke="#a8a8a8" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  h_crown: `<path d="M72 36 L76 12 L87 26 L100 4 L113 26 L124 12 L128 36 Z"
            fill="#f1c40f" stroke="#b8860b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M76 12 L80 30 L87 26" fill="#f9e079" opacity="0.5"/>
    <path d="M100 4 L103 28 L97 28 Z" fill="#f9e079" opacity="0.5"/>
    <path d="M72 36 L128 36" stroke="#b8860b" stroke-width="2"/>
    <path d="M74 34 L126 34" stroke="#f9e079" stroke-width="0.6" opacity="0.5"/>
    <circle cx="100" cy="19" r="3" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <circle cx="100" cy="19" r="1.2" fill="#e74c3c"/>
    <circle cx="100" cy="19" r="0.5" fill="#fff" opacity="0.7"/>
    <circle cx="86" cy="25" r="2" fill="#3498db"/>
    <circle cx="86" cy="25" r="0.8" fill="#5dade2"/>
    <circle cx="114" cy="25" r="2" fill="#3498db"/>
    <circle cx="114" cy="25" r="0.8" fill="#5dade2"/>
    <path d="M76 34 L124 34" stroke="#fff" stroke-width="0.6" opacity="0.4"/>
    <path d="M76 12 L78 14 M100 4 L101 7 M124 12 L122 14" stroke="#fff" stroke-width="0.5" opacity="0.5"/>`,

  h_gold_crown: `<path d="M66 34 L72 4 L84 20 L100 -2 L116 20 L128 4 L134 34 Z"
                  fill="#ffd700" stroke="#b8860b" stroke-width="2" stroke-linejoin="round"/>
    <path d="M72 4 L76 28 L84 20" fill="#ffe66d" opacity="0.6"/>
    <path d="M100 -2 L102 26 L98 26 Z" fill="#ffe66d" opacity="0.6"/>
    <path d="M128 4 L124 28 L116 20" fill="#ffe66d" opacity="0.6"/>
    <path d="M66 34 L134 34" stroke="#b8860b" stroke-width="2.5"/>
    <path d="M68 32 L132 32" stroke="#ffe66d" stroke-width="0.8" opacity="0.6"/>
    <circle cx="100" cy="16" r="4" fill="#e74c3c" stroke="#8b0000" stroke-width="0.7"/>
    <circle cx="100" cy="16" r="1.5" fill="#ff6b6b"/>
    <circle cx="100" cy="16" r="0.6" fill="#fff" opacity="0.8"/>
    <circle cx="84" cy="18" r="2.8" fill="#3498db" stroke="#21618c" stroke-width="0.5"/>
    <circle cx="84" cy="18" r="1.2" fill="#5dade2"/>
    <circle cx="116" cy="18" r="2.8" fill="#3498db" stroke="#21618c" stroke-width="0.5"/>
    <circle cx="116" cy="18" r="1.2" fill="#5dade2"/>
    <circle cx="76" cy="26" r="1.5" fill="#fff"/>
    <circle cx="124" cy="26" r="1.5" fill="#fff"/>
    <circle cx="92" cy="28" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="108" cy="28" r="1" fill="#fff" opacity="0.7"/>
    <path d="M70 30 L130 30" stroke="#fff" stroke-width="0.8" opacity="0.5"/>
    <path d="M72 4 L74 6 M100 -2 L101 0 M128 4 L126 6" stroke="#fff" stroke-width="0.5" opacity="0.5"/>`,

  h_cheburashka: `<circle cx="76" cy="22" r="18" fill="#8b6914" stroke="#5a3a0a" stroke-width="1"/>
    <circle cx="76" cy="22" r="13" fill="#a07020"/>
    <circle cx="76" cy="22" r="8" fill="#b88030" opacity="0.6"/>
    <circle cx="76" cy="22" r="4" fill="#8b6914" opacity="0.5"/>
    <circle cx="124" cy="22" r="18" fill="#8b6914" stroke="#5a3a0a" stroke-width="1"/>
    <circle cx="124" cy="22" r="13" fill="#a07020"/>
    <circle cx="124" cy="22" r="8" fill="#b88030" opacity="0.6"/>
    <circle cx="124" cy="22" r="4" fill="#8b6914" opacity="0.5"/>
    <path d="M70 38 Q100 28 130 38 L130 44 Q100 42 70 44 Z" fill="#6b4a2a" stroke="#4a3018" stroke-width="0.4"/>
    <path d="M74 38 Q100 30 126 38" stroke="#8a6440" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M82 40 Q100 34 118 40" stroke="#5a3a0a" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  h_bandit: `<ellipse cx="100" cy="50" rx="30" ry="32" fill="#0a0a0a"/>
    <path d="M74 40 Q100 30 126 40" stroke="#222" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M76 46 Q100 36 124 46" stroke="#151515" stroke-width="0.6" fill="none" opacity="0.3"/>
    <ellipse cx="90" cy="48" rx="6" ry="5" fill="${SKIN}"/>
    <ellipse cx="110" cy="48" rx="6" ry="5" fill="${SKIN}"/>
    <circle cx="90" cy="48" r="2.5" fill="#000"/>
    <circle cx="110" cy="48" r="2.5" fill="#000"/>
    <circle cx="91" cy="47" r="0.8" fill="#fff"/>
    <circle cx="111" cy="47" r="0.8" fill="#fff"/>
    <path d="M86 64 L114 64" stroke="#222" stroke-width="1" opacity="0.6"/>
    <path d="M80 70 Q100 76 120 70" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.4"/>
    <path d="M76 78 Q100 82 124 78" stroke="#151515" stroke-width="0.5" fill="none" opacity="0.3"/>`,

  h_pirate: `<path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#c0392b"/>
    <path d="M72 35 Q100 18 128 35" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M68 38 L55 54 L62 52 L72 42 Z" fill="#a93226"/>
    <circle cx="110" cy="50" r="7" fill="#000" stroke="#333" stroke-width="0.5"/>
    <circle cx="110" cy="50" r="3" fill="#1a1a1a"/>
    <line x1="103" y1="50" x2="68" y2="42" stroke="#000" stroke-width="1.5"/>
    <line x1="103" y1="50" x2="68" y2="42" stroke="#333" stroke-width="0.5" opacity="0.6"/>
    <circle cx="110" cy="48" r="1" fill="#fff" opacity="0.6"/>
    <path d="M72 38 Q100 22 128 38" stroke="#8b1a0d" stroke-width="0.4" fill="none" opacity="0.3"/>`,

  h_fedora: `<ellipse cx="100" cy="36" rx="44" ry="7" fill="#3d2818"/>
    <ellipse cx="100" cy="36" rx="44" ry="7" fill="#5c3a20" opacity="0.6"/>
    <ellipse cx="100" cy="36" rx="40" ry="5" fill="#4a3018" opacity="0.3"/>
    <path d="M72 36 L72 14 Q100 4 128 14 L128 36 Z" fill="#5c3a20" stroke="#3d2818" stroke-width="0.6"/>
    <path d="M74 16 Q100 8 126 16" stroke="#7a5230" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M76 20 Q100 12 124 20" stroke="#6b4520" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M72 32 L128 32" stroke="#3d2818" stroke-width="2.5"/>
    <path d="M72 30 L128 30" stroke="#7a5230" stroke-width="0.6" opacity="0.5"/>
    <path d="M76 34 L124 34" stroke="#3d2818" stroke-width="0.8" opacity="0.5"/>
    <path d="M80 30 L120 30" stroke="#2a1a08" stroke-width="0.4" opacity="0.4"/>`,

  h_beret: `<ellipse cx="100" cy="26" rx="33" ry="15" fill="#1a1a1a"/>
    <ellipse cx="100" cy="22" rx="28" ry="11" fill="#2a2a2a"/>
    <ellipse cx="92" cy="20" rx="14" ry="6" fill="#3a3a3a" opacity="0.5"/>
    <ellipse cx="108" cy="24" rx="12" ry="4" fill="#0a0a0a" opacity="0.3"/>
    <circle cx="100" cy="9" r="3" fill="#1a1a1a"/>
    <circle cx="100" cy="9" r="1.5" fill="#333"/>
    <ellipse cx="100" cy="38" rx="32" ry="4" fill="#0a0a0a" opacity="0.5"/>
    <path d="M72 24 Q100 16 128 24" stroke="#3a3a3a" stroke-width="0.5" fill="none" opacity="0.4"/>`,

  h_vr: `<path d="M65 38 Q100 28 135 38 L135 58 Q100 70 65 58 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.8"/>
    <path d="M70 36 Q100 30 130 36" stroke="#333" stroke-width="0.8" fill="none" opacity="0.5"/>
    <rect x="75" y="44" width="22" height="13" rx="2" fill="#3498db" stroke="#2874a6" stroke-width="0.5"/>
    <rect x="103" y="44" width="22" height="13" rx="2" fill="#3498db" stroke="#2874a6" stroke-width="0.5"/>
    <rect x="77" y="46" width="8" height="3" fill="#5dade2" opacity="0.5"/>
    <rect x="105" y="46" width="8" height="3" fill="#5dade2" opacity="0.5"/>
    <rect x="77" y="51" width="5" height="2" fill="#fff" opacity="0.3"/>
    <rect x="105" y="51" width="5" height="2" fill="#fff" opacity="0.3"/>
    <path d="M65 48 L55 44 M135 48 L145 44" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
    <path d="M65 48 L55 44 M135 48 L145 44" stroke="#333" stroke-width="1" stroke-linecap="round"/>
    <circle cx="86" cy="50" r="1" fill="#fff" opacity="0.6"/>
    <circle cx="114" cy="50" r="1" fill="#fff" opacity="0.6"/>`,

  h_halo: `<ellipse cx="100" cy="4" rx="26" ry="5" fill="none" stroke="#f1c40f" stroke-width="3"/>
    <ellipse cx="100" cy="4" rx="26" ry="5" fill="#f1c40f" opacity="0.25"/>
    <ellipse cx="100" cy="4" rx="20" ry="3" fill="#fff" opacity="0.3"/>
    <ellipse cx="100" cy="4" rx="26" ry="5" fill="none" stroke="#f9e079" stroke-width="0.8" opacity="0.6"/>
    <ellipse cx="100" cy="4" rx="22" ry="4" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.4"/>`,

  h_flower: `<circle cx="118" cy="32" r="6" fill="#e91e63"/>
    <circle cx="112" cy="28" r="4" fill="#f06292"/>
    <circle cx="124" cy="28" r="4" fill="#f06292"/>
    <circle cx="112" cy="36" r="4" fill="#f06292"/>
    <circle cx="124" cy="36" r="4" fill="#f06292"/>
    <circle cx="118" cy="32" r="2.5" fill="#ffeb3b"/>
    <circle cx="118" cy="32" r="1.2" fill="#f39c12"/>
    <ellipse cx="112" cy="30" rx="1.2" ry="0.6" fill="#fff" opacity="0.6"/>
    <ellipse cx="122" cy="32" rx="0.8" ry="1" fill="#fff" opacity="0.4"/>
    <circle cx="118" cy="40" r="1.5" fill="#2ecc71" opacity="0.6"/>`,

  h_mask_money: `<ellipse cx="100" cy="50" rx="30" ry="15" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.7"/>
    <ellipse cx="92" cy="46" rx="20" ry="6" fill="#2a2a2a" opacity="0.5"/>
    <circle cx="86" cy="50" r="7" fill="${SKIN}"/>
    <circle cx="114" cy="50" r="7" fill="${SKIN}"/>
    <circle cx="86" cy="50" r="2.8" fill="#000"/>
    <circle cx="114" cy="50" r="2.8" fill="#000"/>
    <circle cx="87" cy="49" r="0.8" fill="#fff"/>
    <circle cx="115" cy="49" r="0.8" fill="#fff"/>
    <text x="100" y="57" text-anchor="middle" font-size="13" fill="#4CAF50" font-weight="900">$</text>
    <path d="M72 42 Q100 38 128 42" stroke="#333" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  h_gang_bandana: `<path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M68 38 L54 56 L60 54 L72 42 Z" fill="#0a0a0a"/>
    <text x="100" y="38" text-anchor="middle" font-size="8" fill="#f39c12" font-weight="900">CLAN</text>
    <path d="M72 35 Q100 18 128 35" stroke="#333" stroke-width="0.5" fill="none" opacity="0.4"/>`,

  h_gang_mask: `<path d="M70 26 Q100 11 130 26 L130 51 Q100 68 70 51 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M74 22 Q100 14 126 22" stroke="#333" stroke-width="0.6" fill="none" opacity="0.4"/>
    <ellipse cx="88" cy="41" rx="10" ry="6" fill="#c0392b"/>
    <ellipse cx="112" cy="41" rx="10" ry="6" fill="#c0392b"/>
    <circle cx="88" cy="41" r="3.5" fill="#000"/>
    <circle cx="112" cy="41" r="3.5" fill="#000"/>
    <circle cx="89" cy="40" r="1" fill="#fff"/>
    <circle cx="113" cy="40" r="1" fill="#fff"/>
    <path d="M85 56 Q100 62 115 56" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <path d="M78 60 Q100 66 122 60" stroke="#333" stroke-width="0.5" fill="none" opacity="0.4"/>`,

  h_gang_helmet: `<path d="M62 42 Q62 10 100 4 Q138 10 138 42 L134 68 Q100 78 66 68 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2"/>
    <path d="M70 40 Q100 24 130 40" stroke="#1a252f" stroke-width="0.8" fill="none" opacity="0.5"/>
    <ellipse cx="84" cy="42" rx="9" ry="5" fill="#c0392b"/>
    <ellipse cx="116" cy="42" rx="9" ry="5" fill="#c0392b"/>
    <circle cx="84" cy="42" r="2.5" fill="#000"/>
    <circle cx="116" cy="42" r="2.5" fill="#000"/>
    <path d="M100 8 L94 26 L106 26 Z" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <circle cx="100" cy="6" r="3.5" fill="#e74c3c"/>
    <path d="M70 56 Q100 62 130 56" stroke="#f39c12" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M72 62 L128 62" stroke="#1a252f" stroke-width="1" opacity="0.5"/>
    <path d="M64 46 L64 64 M136 46 L136 64" stroke="#1a252f" stroke-width="1.5" opacity="0.6"/>`,

  h_case_bandit: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#0a0a0a"/>
    <ellipse cx="100" cy="42" rx="28" ry="4" fill="#000" opacity="0.4"/>
    <circle cx="100" cy="10" r="2.5" fill="#444"/>
    <path d="M74 36 Q100 12 126 36" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  h_case_rooster: `<path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#a93226"/>
    <path d="M74 40 Q100 36 126 40" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.8"/>
    <circle cx="100" cy="10" r="2.5" fill="#7f1d13"/>`,

  h_case_helmet_alpha: `<ellipse cx="100" cy="50" rx="35" ry="37" fill="#0a0a0a" stroke="#000" stroke-width="1"/>
    <path d="M65 44 Q100 34 135 44 L135 50 Q100 60 65 50 Z" fill="#1a1a1a"/>
    <path d="M70 40 Q100 32 130 40" stroke="#333" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M70 72 Q100 80 130 72" stroke="#1a1a1a" stroke-width="1" fill="none"/>
    <ellipse cx="86" cy="48" rx="9" ry="5" fill="#3498db" opacity="0.5"/>
    <ellipse cx="114" cy="48" rx="9" ry="5" fill="#3498db" opacity="0.5"/>
    <circle cx="86" cy="48" r="3.5" fill="#2ecc71"/>
    <circle cx="114" cy="48" r="3.5" fill="#2ecc71"/>
    <circle cx="86" cy="47" r="1" fill="#fff" opacity="0.6"/>
    <circle cx="114" cy="47" r="1" fill="#fff" opacity="0.6"/>
    <rect x="92" y="14" width="16" height="8" rx="2" fill="#f39c12" stroke="#b87500" stroke-width="0.4"/>
    <path d="M100 22 L100 32" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M78 70 Q100 74 122 70" stroke="#333" stroke-width="1" fill="none"/>`,

  h_case_top1_head: `<path d="M58 24 Q100 -4 142 24 L142 51 Q100 68 58 51 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="2.5"/>
    <path d="M64 22 Q100 4 136 22" stroke="#b8860b" stroke-width="0.8" fill="none" opacity="0.5"/>
    <ellipse cx="100" cy="42" rx="36" ry="20" fill="#2c1810"/>
    <circle cx="80" cy="40" r="5.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="120" cy="40" r="5.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="80" cy="40" r="2.2" fill="#1a1a1a"/>
    <circle cx="120" cy="40" r="2.2" fill="#1a1a1a"/>
    <circle cx="81" cy="39" r="0.7" fill="#fff"/>
    <circle cx="121" cy="39" r="0.7" fill="#fff"/>
    <path d="M100 12 L94 28 L106 28 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="100" cy="10" r="3.5" fill="#e74c3c"/>
    <path d="M60 26 L140 26" stroke="#b8860b" stroke-width="1" opacity="0.5"/>
    <circle cx="70" cy="34" r="2" fill="#f39c12"/>
    <circle cx="130" cy="34" r="2" fill="#f39c12"/>`,

  h_case_top2_head: `<path d="M64 32 L64 20 Q100 14 136 20 L136 32 Q100 38 64 32 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M64 20 L56 2 L76 16 L88 -2 L100 12 L112 -2 L124 16 L144 2 L136 20" fill="none" stroke="#ffd700" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="100" cy="6" r="3.5" fill="#e74c3c" stroke="#8b0000" stroke-width="0.7"/>
    <circle cx="76" cy="12" r="2.5" fill="#3498db"/>
    <circle cx="124" cy="12" r="2.5" fill="#3498db"/>
    <circle cx="56" cy="4" r="1.8" fill="#fff"/>
    <circle cx="144" cy="4" r="1.8" fill="#fff"/>
    <path d="M70 28 Q100 34 130 28" stroke="#ffd700" stroke-width="1.8" fill="none"/>`,

  h_case_crypto: `<circle cx="100" cy="50" r="33" fill="#f39c12" stroke="#b8860b" stroke-width="1.5"/>
    <circle cx="100" cy="50" r="26" fill="#d68910"/>
    <circle cx="100" cy="50" r="24" fill="none" stroke="#f9e079" stroke-width="0.5" opacity="0.5"/>
    <text x="100" y="62" text-anchor="middle" font-size="34" fill="#fff" font-weight="900">₿</text>
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

  // ═══════════════════════════════════════════════════════════
  //  ТЕЛО — детальные рукава + складки + швы
  // ═══════════════════════════════════════════════════════════

  // ─── МАЙКА-АЛКОГОЛИЧКА (без рукавов, тонкие лямки) ───
  b_alco: `
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#f5f5f5" stroke="#d8d8d8" stroke-width="0.5"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#e8e8e8" opacity="0.5"/>
    <path d="M75 96 L73 104 Q73 112 76 116 L80 114 L80 100 Z" fill="#f0f0f0" stroke="#d8d8d8" stroke-width="0.4"/>
    <path d="M125 96 L127 104 Q127 112 124 116 L120 114 L120 100 Z" fill="#f0f0f0" stroke="#d8d8d8" stroke-width="0.4"/>
    <path d="M80 100 Q80 96 84 96 M120 100 Q120 96 116 96" stroke="#d8d8d8" stroke-width="0.5" fill="none"/>
    <path d="M73 96 Q82 100 90 102 Q100 104 110 102 Q118 100 127 96" stroke="#d8d8d8" stroke-width="0.6" fill="none"/>
    <path d="M78 108 L78 205 M82 108 L82 205 M86 108 L86 205 M90 108 L90 205 M94 108 L94 205 M98 108 L98 205
             M102 108 L102 205 M106 108 L106 205 M110 108 L110 205 M114 108 L114 205 M118 108 L118 205 M122 108 L122 205"
          stroke="#e0e0e0" stroke-width="0.4" opacity="0.6"/>
    <path d="M73 203 L127 203" stroke="#c8c8c8" stroke-width="1.2"/>
    <path d="M73 201 L127 201" stroke="#fff" stroke-width="0.4" opacity="0.6"/>
    <path d="M76 130 Q78 145 76 160" stroke="#dcdcdc" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M108 140 Q110 155 108 170" stroke="#dcdcdc" stroke-width="0.5" fill="none" opacity="0.4"/>
    <ellipse cx="86" cy="180" rx="3" ry="1.5" fill="#d8d8d8" opacity="0.4"/>`,

  // ─── ФУТБОЛКА "АУРА ФАРМИНГ" (короткие рукава) ───
  b_aura: `
    ${SL_SHORT_L("#1a1a1a", "#0a0a0a")}
    ${SL_SHORT_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0f0f0f" opacity="0.6"/>
    <path d="M76 96 Q86 90 100 90 Q114 90 124 96" stroke="#333" stroke-width="0.8" fill="none"/>
    <path d="M82 96 Q100 84 118 96 L116 100 Q100 89 84 100 Z" fill="#0a0a0a"/>
    <path d="M82 96 Q100 86 118 96" stroke="#444" stroke-width="0.5" fill="none" opacity="0.6"/>
    <text x="100" y="140" text-anchor="middle" font-size="11" fill="#f39c12" font-weight="900" letter-spacing="1">AURA</text>
    <text x="100" y="156" text-anchor="middle" font-size="6" fill="#f39c12" font-weight="700" letter-spacing="0.8" opacity="0.8">FARMING</text>
    <path d="M80 175 Q100 182 120 175" stroke="#f39c12" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M76 130 Q78 145 76 160" stroke="#252525" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M124 140 Q122 155 124 170" stroke="#0a0a0a" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M73 203 L127 203" stroke="#0a0a0a" stroke-width="1.2"/>
    <path d="M73 201 L127 201" stroke="#333" stroke-width="0.4" opacity="0.4"/>
    <circle cx="78" cy="98" r="1" fill="#444" opacity="0.6"/>
    <circle cx="122" cy="98" r="1" fill="#444" opacity="0.6"/>`,

  // ─── ФУТБОЛКА "Я БОГ" ───
  b_iambog: `
    ${SL_SHORT_L("#f5f5f5", "#e0e0e0")}
    ${SL_SHORT_R("#f5f5f5", "#e0e0e0")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#f5f5f5"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#e8e8e8" opacity="0.5"/>
    <path d="M82 96 Q100 86 118 96 L116 100 Q100 90 84 100 Z" fill="#e8e8e8"/>
    <path d="M82 96 Q100 87 118 96" stroke="#d0d0d0" stroke-width="0.5" fill="none"/>
    <text x="100" y="145" text-anchor="middle" font-size="15" fill="#c0392b" font-weight="900">Я БОГ</text>
    <path d="M78 162 Q100 170 122 162" stroke="#c0392b" stroke-width="1.2" fill="none" opacity="0.7"/>
    <path d="M76 130 Q78 145 76 160" stroke="#dcdcdc" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M73 203 L127 203" stroke="#d0d0d0" stroke-width="1.2"/>
    <path d="M73 201 L127 201" stroke="#fff" stroke-width="0.4" opacity="0.6"/>`,

  // ─── РУБАШКА В КЛЕТКУ (длинные рукава) ───
  b_cage: `
    ${SL_LONG_L("#c0392b", "#8b0000")}
    ${SL_LONG_R("#c0392b", "#8b0000")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#c0392b"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#a93226" opacity="0.5"/>
    <path d="M82 96 Q100 88 118 96 L116 102 Q100 92 84 102 Z" fill="#a93226"/>
    <path d="M100 96 L100 205" stroke="#8b0000" stroke-width="0.8"/>
    <path d="M88 96 L92 205" stroke="#a93226" stroke-width="0.4" opacity="0.5"/>
    <path d="M112 96 L108 205" stroke="#a93226" stroke-width="0.4" opacity="0.5"/>
    <path d="M76 120 L124 120 M76 145 L124 145 M76 170 L124 170 M76 195 L124 195" stroke="#8b0000" stroke-width="1" opacity="0.5"/>
    <path d="M76 121 L124 121 M76 146 L124 146 M76 171 L124 171" stroke="#e74c3c" stroke-width="0.3" opacity="0.3"/>
    <circle cx="100" cy="130" r="1.8" fill="#fff" stroke="#8b0000" stroke-width="0.3"/>
    <circle cx="100" cy="155" r="1.8" fill="#fff" stroke="#8b0000" stroke-width="0.3"/>
    <circle cx="100" cy="180" r="1.8" fill="#fff" stroke="#8b0000" stroke-width="0.3"/>
    <path d="M84 96 L82 108 L84 112 L86 108 Z" fill="#e74c3c" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M116 96 L118 108 L116 112 L114 108 Z" fill="#e74c3c" stroke="#8b0000" stroke-width="0.4"/>
    <rect x="80" y="120" width="12" height="10" rx="1" fill="none" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M73 203 L127 203" stroke="#8b0000" stroke-width="1.2"/>
    <path d="M76 130 Q78 145 76 160" stroke="#a93226" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  // ─── ХУДИ SUPREME (длинные рукава + капюшон) ───
  b_supreme: `
    ${SL_LONG_L("#c0392b", "#8b0000")}
    ${SL_LONG_R("#c0392b", "#8b0000")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#c0392b"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#a93226" opacity="0.5"/>
    <path d="M72 96 Q68 84 80 78 Q92 74 100 78 Q108 74 120 78 Q132 84 128 96 Z" fill="#a93226"/>
    <path d="M76 90 Q80 80 90 78 Q100 76 110 78 Q120 80 124 90" stroke="#8b0000" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M76 90 Q80 80 90 78 Q100 76 110 78 Q120 80 124 90" stroke="#e74c3c" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M82 96 Q100 90 118 96" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <path d="M94 100 L94 118 M106 100 L106 118" stroke="#fff" stroke-width="1.5"/>
    <circle cx="94" cy="118" r="1.5" fill="#fff"/>
    <circle cx="106" cy="118" r="1.5" fill="#fff"/>
    <rect x="82" y="148" width="36" height="22" rx="4" fill="#a93226" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M82 156 L118 156" stroke="#8b0000" stroke-width="0.5" opacity="0.5"/>
    <rect x="88" y="155" width="24" height="12" fill="#a93226" opacity="0.8"/>
    <path d="M100 96 L100 205" stroke="#8b0000" stroke-width="0.4" opacity="0.3"/>
    <path d="M76 130 Q78 145 76 160" stroke="#a93226" stroke-width="0.5" fill="none" opacity="0.5"/>
    <rect x="70" y="196" width="60" height="9" fill="#8b0000" opacity="0.7"/>
    <path d="M70 198 L130 198 M70 202 L130 202" stroke="#5a0000" stroke-width="0.4" opacity="0.5"/>
    <circle cx="90" cy="115" r="1.2" fill="#5a0000" opacity="0.6"/>
    <circle cx="110" cy="115" r="1.2" fill="#5a0000" opacity="0.6"/>`,

  // ─── ПИДЖАК ARMANI ФЕЙК (длинные рукава, открытый) ───
  b_armani: `
    ${SL_LONG_L("#1a1a1a", "#0a0a0a")}
    ${SL_LONG_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L90 96 L88 205 L73 205 Z" fill="#1a1a1a"/>
    <path d="M127 96 L110 96 L112 205 L127 205 Z" fill="#1a1a1a"/>
    <path d="M90 96 L100 160 L88 205 L73 205 L73 96 Z" fill="#1a1a1a" opacity="0.95"/>
    <path d="M110 96 L100 160 L112 205 L127 205 L127 96 Z" fill="#0a0a0a" opacity="0.9"/>
    <path d="M90 96 L100 160 L110 96 L105 96 L100 140 L95 96 Z" fill="#2a2a2a" opacity="0.9"/>
    <path d="M90 96 L82 130 L74 96" fill="#1a1a1a"/>
    <path d="M110 96 L118 130 L126 96" fill="#0a0a0a"/>
    <path d="M82 96 L100 145 L118 96" stroke="#000" stroke-width="1.5" fill="none"/>
    <path d="M84 96 L100 140 L116 96" stroke="#333" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M84 96 L82 130 L82 205" stroke="#2a2a2a" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M116 96 L118 130 L118 205" stroke="#2a2a2a" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M100 160 L100 205" stroke="#000" stroke-width="0.8" opacity="0.5"/>
    <circle cx="100" cy="172" r="1.5" fill="#666"/>
    <circle cx="100" cy="188" r="1.5" fill="#666"/>
    <rect x="76" y="130" width="6" height="50" fill="#0a0a0a" opacity="0.4"/>
    <rect x="118" y="130" width="6" height="50" fill="#0a0a0a" opacity="0.4"/>
    <path d="M82 96 L82 105 L84 105 L84 96 Z" fill="#2a2a2a" opacity="0.5"/>
    <path d="M118 96 L118 105 L116 105 L116 96 Z" fill="#2a2a2a" opacity="0.5"/>
    <path d="M78 96 L80 130" stroke="#333" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  // ─── ПУХОВИК NORTH FACE (длинные рукава, стёганый) ───
  b_nf: `
    ${SL_LONG_L("#1a1a1a", "#0a0a0a")}
    ${SL_LONG_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M76 96 Q100 84 124 96 L122 102 Q100 90 78 102 Z" fill="#0a0a0a"/>
    <path d="M76 96 Q100 86 124 96" stroke="#444" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M73 108 L127 108 M73 130 L127 130 M73 152 L127 152 M73 174 L127 174 M73 196 L127 196" stroke="#0a0a0a" stroke-width="1.2" opacity="0.7"/>
    <path d="M73 110 L127 110 M73 132 L127 132 M73 154 L127 154 M73 176 L127 176" stroke="#333" stroke-width="0.3" opacity="0.5"/>
    <path d="M73 96 L73 205" stroke="#333" stroke-width="0.5" opacity="0.4"/>
    <path d="M127 96 L127 205" stroke="#0a0a0a" stroke-width="0.5" opacity="0.4"/>
    <path d="M100 96 L100 205" stroke="#0a0a0a" stroke-width="0.5" opacity="0.4"/>
    <rect x="70" y="192" width="60" height="13" fill="#0a0a0a"/>
    <path d="M70 194 L130 194 M70 200 L130 200" stroke="#333" stroke-width="0.4" opacity="0.5"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>`,

  // ─── КОЖАНАЯ КУРТКА (длинные рукава, молния) ───
  b_leather: `
    ${SL_LONG_L("#1a1a1a", "#000")}
    ${SL_LONG_R("#1a1a1a", "#000")}
    <path d="M73 96 L88 96 L88 205 L73 205 Z" fill="#1a1a1a"/>
    <path d="M127 96 L112 96 L112 205 L127 205 Z" fill="#1a1a1a"/>
    <path d="M88 96 L100 160 L88 205 L73 205 L73 96 Z" fill="#1a1a1a"/>
    <path d="M112 96 L100 160 L112 205 L127 205 L127 96 Z" fill="#0d0d0d"/>
    <path d="M88 96 L100 160 L112 96 L107 96 L100 148 L93 96 Z" fill="#2a2a2a" opacity="0.9"/>
    <path d="M88 96 L80 130 L74 96" fill="#1a1a1a"/>
    <path d="M112 96 L120 130 L126 96" fill="#0d0d0d"/>
    <path d="M80 96 L100 150 L120 96" stroke="#000" stroke-width="1.8" fill="none"/>
    <path d="M82 96 L100 146 L118 96" stroke="#333" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M86 96 L84 110 L88 108 Z" fill="#2a2a2a"/>
    <path d="M114 96 L116 110 L112 108 Z" fill="#2a2a2a"/>
    <path d="M100 160 L100 205" stroke="#000" stroke-width="1" opacity="0.6"/>
    <path d="M80 130 L80 140 M120 130 L120 140" stroke="#333" stroke-width="1" opacity="0.6"/>
    <path d="M78 155 L78 162 M122 155 L122 162" stroke="#333" stroke-width="0.8" opacity="0.5"/>
    <circle cx="100" cy="175" r="2.5" fill="#444"/>
    <circle cx="100" cy="175" r="1.2" fill="#666"/>
    <circle cx="100" cy="192" r="1.8" fill="#444"/>
    <path d="M76 96 L76 105" stroke="#2a2a2a" stroke-width="0.6"/>
    <path d="M124 96 L124 105" stroke="#2a2a2a" stroke-width="0.6"/>
    <path d="M76 130 Q78 145 76 160" stroke="#000" stroke-width="0.5" fill="none" opacity="0.4"/>`,

  // ─── СВАДЕБНОЕ ПЛАТЬЕ (цельный верх, струящееся) ───
  b_wedding: `
    <path d="M76 100 L76 205 L60 260 L140 260 L124 205 L124 100 Q100 94 76 100 Z" fill="#f8f8f8" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M103 96 L103 205 L124 205 L140 260 L118 260 L103 205 Z" fill="#f0f0f0" opacity="0.5"/>
    <path d="M78 100 L76 96 Q100 88 124 96 L122 100 Q100 92 78 100 Z" fill="#fff"/>
    <path d="M78 100 Q100 94 122 100" stroke="#e0e0e0" stroke-width="0.6" fill="none"/>
    <path d="M80 205 L76 230 L74 250 M120 205 L124 230 L126 250" stroke="#e8e8e8" stroke-width="1.5" fill="none"/>
    <path d="M88 210 L84 250 M112 210 L116 250 M100 210 L100 250" stroke="#e8e8e8" stroke-width="1.2" fill="none" opacity="0.7"/>
    <path d="M62 255 L138 255" stroke="#e0e0e0" stroke-width="0.8"/>
    <path d="M64 258 Q100 262 136 258" stroke="#e8e8e8" stroke-width="0.5" fill="none" opacity="0.6"/>
    <ellipse cx="100" cy="118" rx="6" ry="4" fill="#fce4ec" opacity="0.8"/>
    <circle cx="100" cy="118" r="2" fill="#fff"/>
    <path d="M78 96 Q100 88 122 96" stroke="#fce4ec" stroke-width="0.4" fill="none" opacity="0.5"/>
    <circle cx="90" cy="150" r="2" fill="#fff" opacity="0.7"/>
    <circle cx="110" cy="170" r="2" fill="#fff" opacity="0.7"/>
    <circle cx="100" cy="185" r="2" fill="#fff" opacity="0.7"/>
    <path d="M76 200 L124 200" stroke="#e8e8e8" stroke-width="1"/>`,

  // ─── БРОНЕЖИЛЕТ (без рукавов, тактический) ───
  b_vest: `
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#1a252f" opacity="0.5"/>
    <path d="M73 96 L73 130 L80 130 L80 96 Z" fill="#34495e"/>
    <path d="M127 96 L127 130 L120 130 L120 96 Z" fill="#1a252f"/>
    <path d="M80 96 L80 130" stroke="#3d5060" stroke-width="0.6"/>
    <path d="M120 96 L120 130" stroke="#3d5060" stroke-width="0.6"/>
    <rect x="78" y="118" width="44" height="30" rx="3" fill="#1a252f" stroke="#0f1519" stroke-width="0.6"/>
    <path d="M80 130 L120 130" stroke="#2c3e50" stroke-width="0.6" opacity="0.6"/>
    <path d="M80 138 L120 138" stroke="#2c3e50" stroke-width="0.4" opacity="0.4"/>
    <path d="M80 155 L120 155 M80 172 L120 172" stroke="#1a252f" stroke-width="1.5"/>
    <rect x="90" y="104" width="20" height="7" rx="2" fill="#34495e" stroke="#1a252f" stroke-width="0.4"/>
    <path d="M82 96 Q90 108 100 108 Q110 108 118 96" stroke="#34495e" stroke-width="1" fill="none"/>
    <circle cx="94" cy="132" r="1.5" fill="#556"/>
    <circle cx="106" cy="132" r="1.5" fill="#556"/>
    <path d="M92 155 L108 155" stroke="#34495e" stroke-width="0.5" opacity="0.5"/>
    <path d="M92 172 L108 172" stroke="#34495e" stroke-width="0.5" opacity="0.5"/>
    <rect x="86" y="180" width="28" height="15" rx="2" fill="#0f1519" opacity="0.6"/>
    <path d="M76 96 L76 108" stroke="#3d5060" stroke-width="0.6"/>
    <path d="M124 96 L124 108" stroke="#3d5060" stroke-width="0.6"/>
    <path d="M73 203 L127 203" stroke="#1a252f" stroke-width="1.2"/>`,

  // ─── СМОКИНГ (длинные рукава, формальный) ───
  b_tuxedo: `
    ${SL_LONG_L("#000", "#000")}
    ${SL_LONG_R("#000", "#000")}
    <path d="M73 96 L88 96 L88 205 L73 205 Z" fill="#000"/>
    <path d="M127 96 L112 96 L112 205 L127 205 Z" fill="#000"/>
    <path d="M88 96 L100 160 L88 205 L73 205 L73 96 Z" fill="#000"/>
    <path d="M112 96 L100 160 L112 205 L127 205 L127 96 Z" fill="#0a0a0a"/>
    <path d="M88 96 L100 160 L112 96 L106 96 L100 148 L94 96 Z" fill="#fff"/>
    <path d="M88 96 L100 160 L112 96 L106 96 L100 148 L94 96 Z" fill="#f0f0f0" opacity="0.4"/>
    <path d="M88 96 L80 130 L74 96" fill="#000"/>
    <path d="M112 96 L120 130 L126 96" fill="#0a0a0a"/>
    <path d="M80 96 L100 150 L120 96" stroke="#1a1a1a" stroke-width="1.8" fill="none"/>
    <path d="M88 96 L100 160 L112 96" stroke="#1a1a1a" stroke-width="1.5" fill="none" opacity="0.4"/>
    <path d="M96 96 L100 108 L104 96 L102 96 L100 100 L98 96 Z" fill="#000"/>
    <path d="M96 96 L100 108 L104 96" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M100 160 L100 205" stroke="#0a0a0a" stroke-width="1" opacity="0.8"/>
    <circle cx="100" cy="172" r="2" fill="#fff"/>
    <circle cx="100" cy="190" r="2" fill="#fff"/>
    <path d="M84 96 L84 110 L86 110 L86 96 Z" fill="#1a1a1a" opacity="0.6"/>
    <path d="M116 96 L116 110 L114 110 L114 96 Z" fill="#1a1a1a" opacity="0.6"/>
    <path d="M80 130 L80 145 M120 130 L120 145" stroke="#1a1a1a" stroke-width="0.8" opacity="0.5"/>
    <path d="M76 96 L76 108" stroke="#333" stroke-width="0.5"/>
    <path d="M124 96 L124 108" stroke="#333" stroke-width="0.5"/>
    <path d="M78 96 L80 130" stroke="#1a1a1a" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  // ─── КОСТЮМ САНТЫ (длинные рукава, мех) ───
  b_santa: `
    ${SL_LONG_L("#c0392b", "#8b0000")}
    ${SL_LONG_R("#c0392b", "#8b0000")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#c0392b"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#a93226" opacity="0.5"/>
    <path d="M73 96 Q100 82 127 96" stroke="#fff" stroke-width="5" fill="none"/>
    <path d="M73 96 Q100 84 127 96" stroke="#f0f0f0" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M73 96 Q100 82 127 96" stroke="#e0e0e0" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M73 100 Q80 104 88 102 Q100 100 112 102 Q120 104 127 100" stroke="#8b0000" stroke-width="0.6" fill="none" opacity="0.4"/>
    <rect x="70" y="196" width="60" height="9" fill="#fff"/>
    <path d="M70 198 L130 198" stroke="#e0e0e0" stroke-width="0.6" opacity="0.5"/>
    <path d="M70 202 L130 202" stroke="#f0f0f0" stroke-width="0.4" opacity="0.4"/>
    <path d="M76 130 Q78 145 76 160" stroke="#a93226" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M124 140 Q122 155 124 170" stroke="#a93226" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M78 118 Q88 114 98 118" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M102 118 Q112 114 122 118" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6"/>
    <circle cx="86" cy="135" r="2.5" fill="#fff" opacity="0.7"/>
    <circle cx="114" cy="135" r="2.5" fill="#fff" opacity="0.7"/>
    <circle cx="86" cy="165" r="2.5" fill="#fff" opacity="0.7"/>
    <circle cx="114" cy="165" r="2.5" fill="#fff" opacity="0.7"/>
    <circle cx="100" cy="150" r="2" fill="#fff" opacity="0.6"/>`,

  // ─── МАЙКА USA (без рукавов) ───
  b_tank_usa: `
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#f5f5f5"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#e8e8e8" opacity="0.5"/>
    <path d="M75 96 L73 104 Q73 112 76 116 L80 114 L80 100 Z" fill="#f0f0f0" stroke="#d8d8d8" stroke-width="0.4"/>
    <path d="M125 96 L127 104 Q127 112 124 116 L120 114 L120 100 Z" fill="#f0f0f0" stroke="#d8d8d8" stroke-width="0.4"/>
    <path d="M73 96 Q82 100 90 102 Q100 104 110 102 Q118 100 127 96" stroke="#d8d8d8" stroke-width="0.6" fill="none"/>
    <rect x="76" y="140" width="48" height="30" fill="#c0392b"/>
    <rect x="76" y="140" width="24" height="15" fill="#1c3a7a"/>
    <line x1="76" y1="145" x2="100" y2="145" stroke="#fff" stroke-width="1.5"/>
    <line x1="76" y1="150" x2="100" y2="150" stroke="#fff" stroke-width="1.5"/>
    <path d="M100 140 L100 170" stroke="#fff" stroke-width="0.8"/>
    <circle cx="88" cy="145" r="0.8" fill="#fff" opacity="0.9"/>
    <circle cx="94" cy="145" r="0.8" fill="#fff" opacity="0.9"/>
    <circle cx="88" cy="155" r="0.8" fill="#fff" opacity="0.9"/>
    <circle cx="94" cy="155" r="0.8" fill="#fff" opacity="0.9"/>
    <path d="M78 108 L78 205 M82 108 L82 205 M86 108 L86 205 M90 108 L90 205 M94 108 L94 205 M98 108 L98 205
             M102 108 L102 205 M106 108 L106 205 M110 108 L110 205 M114 108 L114 205 M118 108 L118 205 M122 108 L122 205"
          stroke="#e0e0e0" stroke-width="0.4" opacity="0.5"/>
    <path d="M73 203 L127 203" stroke="#c8c8c8" stroke-width="1.2"/>
    <path d="M76 130 Q78 145 76 160" stroke="#dcdcdc" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  // ─── ЧЁРНОЕ ХУДИ (длинные рукава + капюшон + карман) ───
  b_hoodie: `
    ${SL_LONG_L("#1a1a1a", "#0a0a0a")}
    ${SL_LONG_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.6"/>
    <path d="M72 96 Q68 84 80 76 Q92 72 100 76 Q108 72 120 76 Q132 84 128 96 Z" fill="#0a0a0a"/>
    <path d="M76 90 Q80 78 90 76 Q100 74 110 76 Q120 78 124 90" stroke="#333" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M76 90 Q80 78 90 76 Q100 74 110 76 Q120 78 124 90" stroke="#444" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M82 96 Q100 88 118 96" stroke="#0a0a0a" stroke-width="0.8" fill="none"/>
    <path d="M94 100 L94 118 M106 100 L106 118" stroke="#fff" stroke-width="1.2"/>
    <rect x="94" y="115" width="3" height="6" rx="1" fill="#fff"/>
    <rect x="103" y="115" width="3" height="6" rx="1" fill="#fff"/>
    <path d="M84 145 L84 185 Q84 192 90 192 L110 192 Q116 192 116 185 L116 145" fill="#0a0a0a" stroke="#333" stroke-width="0.6"/>
    <path d="M84 152 L116 152" stroke="#333" stroke-width="0.4" opacity="0.5"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M124 140 Q122 155 124 170" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <rect x="70" y="196" width="60" height="9" fill="#0a0a0a" opacity="0.8"/>
    <path d="M70 198 L130 198 M70 202 L130 202" stroke="#333" stroke-width="0.3" opacity="0.4"/>
    <circle cx="90" cy="112" r="1.2" fill="#555" opacity="0.6"/>
    <circle cx="110" cy="112" r="1.2" fill="#555" opacity="0.6"/>`,

  // ─── ГАВАЙКА (короткие рукава, узор) ───
  b_hawaii: `
    ${SL_SHORT_L("#fff9e6", "#f0e6c0")}
    ${SL_SHORT_R("#fff9e6", "#f0e6c0")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#fff9e6"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#f0e6c0" opacity="0.5"/>
    <path d="M76 96 Q86 90 100 90 Q114 90 124 96" stroke="#f0e6c0" stroke-width="0.8" fill="none"/>
    <path d="M82 96 Q100 84 118 96 L116 100 Q100 89 84 100 Z" fill="#f0e6c0"/>
    <path d="M100 96 L100 205" stroke="#f0e6c0" stroke-width="0.6" opacity="0.6"/>
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
    <circle cx="108" cy="130" r="3" fill="#3498db"/>
    <circle cx="108" cy="130" r="1.2" fill="#2980b9"/>
    <circle cx="94" cy="160" r="3.5" fill="#f06292"/>
    <circle cx="94" cy="160" r="1.5" fill="#c2185b"/>
    <path d="M76 130 Q78 145 76 160" stroke="#e8dcc0" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M73 203 L127 203" stroke="#e0d0a0" stroke-width="1"/>`,

  // ─── РЫЦАРСКИЙ ДОСПЕХ (длинные рукава, латы) ───
  b_armor: `
    ${SL_LONG_L("#7f8c8d", "#5a6a6a")}
    ${SL_LONG_R("#7f8c8d", "#5a6a6a")}
    <path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#7f8c8d" stroke="#5a6a6a" stroke-width="1"/>
    <path d="M105 96 L105 205 L130 205 L130 96 Z" fill="#5a6a6a" opacity="0.5"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#5a6a6a"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#5a6a6a"/>
    <path d="M70 96 L76 108" stroke="#a8b8b8" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M130 96 L124 108" stroke="#a8b8b8" stroke-width="0.6" fill="none" opacity="0.5"/>
    <rect x="84" y="124" width="32" height="60" fill="#5a6a6a" stroke="#4a5a5a" stroke-width="0.6"/>
    <circle cx="100" cy="150" r="9" fill="#e74c3c" stroke="#8b0000" stroke-width="1"/>
    <path d="M96 148 L104 148 M100 144 L100 152" stroke="#8b0000" stroke-width="1"/>
    <circle cx="100" cy="150" r="3" fill="#c0392b"/>
    <circle cx="100" cy="150" r="1.5" fill="#8b0000"/>
    <rect x="92" y="104" width="16" height="12" fill="#5a6a6a" stroke="#4a5a5a" stroke-width="0.5"/>
    <path d="M82 96 L100 108 L118 96" stroke="#4a5a5a" stroke-width="1" fill="none"/>
    <path d="M84 116 L116 116" stroke="#a8b8b8" stroke-width="0.5" opacity="0.5"/>
    <path d="M84 190 L116 190 M84 198 L116 198" stroke="#4a5a5a" stroke-width="0.6" opacity="0.6"/>
    <path d="M76 96 L76 110" stroke="#a8b8b8" stroke-width="0.5" opacity="0.5"/>
    <path d="M124 96 L124 110" stroke="#a8b8b8" stroke-width="0.5" opacity="0.5"/>
    <circle cx="88" cy="138" r="1.5" fill="#a8b8b8" opacity="0.6"/>
    <circle cx="112" cy="138" r="1.5" fill="#a8b8b8" opacity="0.6"/>`,

  // ─── БОМБЕР (длинные рукава, оранжевая подкладка) ───
  b_bomber: `
    ${SL_LONG_L("#1a1a1a", "#0a0a0a")}
    ${SL_LONG_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M76 96 Q100 84 124 96 L122 102 Q100 90 78 102 Z" fill="#0a0a0a"/>
    <path d="M76 96 Q100 86 124 96" stroke="#333" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M70 118 L130 118" stroke="#444" stroke-width="2"/>
    <path d="M70 120 L130 120" stroke="#333" stroke-width="0.5" opacity="0.5"/>
    <path d="M82 96 L82 205 M100 96 L100 205 M118 96 L118 205" stroke="#333" stroke-width="0.6" opacity="0.5"/>
    <path d="M73 96 Q70 94 70 100 L72 118 L76 118 L76 100 Z" fill="#d35400" opacity="0.7"/>
    <path d="M127 96 Q130 94 130 100 L128 118 L124 118 L124 100 Z" fill="#d35400" opacity="0.7"/>
    <path d="M82 96 L78 108 L70 100 L70 96 Z" fill="#d35400" opacity="0.5"/>
    <path d="M118 96 L122 108 L130 100 L130 96 Z" fill="#d35400" opacity="0.5"/>
    <rect x="88" y="148" width="24" height="14" fill="#0a0a0a" stroke="#333" stroke-width="0.5"/>
    <path d="M88 155 L112 155" stroke="#333" stroke-width="0.4" opacity="0.5"/>
    <circle cx="100" cy="155" r="2" fill="#444"/>
    <path d="M100 96 L100 118" stroke="#0a0a0a" stroke-width="0.6" opacity="0.4"/>
    <rect x="70" y="196" width="60" height="9" fill="#0a0a0a"/>
    <path d="M70 198 L130 198 M70 202 L130 202" stroke="#333" stroke-width="0.3" opacity="0.4"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M124 140 Q122 155 124 170" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>`,

  // ─── ПОНЧО (цельный верх, широкое) ───
  b_poncho: `
    ${SL_FULL_L("#8b4513", "#5a2e0a", "#a0522d")}
    ${SL_FULL_R("#8b4513", "#5a2e0a", "#a0522d")}
    <path d="M58 100 Q58 94 68 94 L132 94 Q142 94 142 100 L148 225 L52 225 Z" fill="#8b4513"/>
    <path d="M105 94 L105 225 L148 225 L142 100 Q142 97 138 94 Z" fill="#5a2e0a" opacity="0.35"/>
    <path d="M68 94 Q100 82 132 94" fill="#8b4513"/>
    <path d="M70 94 Q100 84 130 94" stroke="#5a2e0a" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M58 128 L142 128 M58 158 L142 158 M58 188 L142 188" stroke="#a0522d" stroke-width="2"/>
    <path d="M60 128 L60 225 M80 128 L80 225 M100 128 L100 225 M120 128 L120 225 M140 128 L140 225" stroke="#a0522d" stroke-width="2"/>
    <path d="M62 128 L62 225" stroke="#6b3a1a" stroke-width="0.4" opacity="0.5"/>
    <path d="M70 220 L70 232 M80 220 L80 232 M90 220 L90 232 M100 220 L100 232 M110 220 L110 232 M120 220 L120 232 M130 220 L130 232" stroke="#5a2e0a" stroke-width="1" opacity="0.8"/>
    <path d="M58 108 Q100 104 142 108" stroke="#6b3a1a" stroke-width="0.6" fill="none" opacity="0.4"/>
    <path d="M68 210 L68 225" stroke="#a0522d" stroke-width="1" opacity="0.6"/>
    <path d="M132 210 L132 225" stroke="#a0522d" stroke-width="1" opacity="0.6"/>`,

  // ─── КИМОНО (цельный верх, широкие рукава, оби) ───
  b_kimono: `
    ${SL_FULL_L("#e91e63", "#c2185b", "#f06292")}
    ${SL_FULL_R("#e91e63", "#c2185b", "#f06292")}
    <path d="M73 96 L73 205 L100 205 L100 96 Z" fill="#e91e63"/>
    <path d="M100 96 L100 205 L127 205 L127 96 Z" fill="#e91e63"/>
    <path d="M105 96 L105 205 L127 205 L127 96 Z" fill="#c2185b" opacity="0.4"/>
    <path d="M73 96 L100 145 L127 96" stroke="#c2185b" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <path d="M77 96 L100 138 L123 96" stroke="#f06292" stroke-width="1.5" fill="none"/>
    <path d="M82 96 L100 128 L118 96" stroke="#f8bbd0" stroke-width="0.6" fill="none" opacity="0.5"/>
    <rect x="70" y="170" width="60" height="18" fill="#c2185b"/>
    <path d="M70 172 L130 172 M70 186 L130 186" stroke="#8b0000" stroke-width="1" opacity="0.6"/>
    <path d="M70 179 L130 179" stroke="#f06292" stroke-width="0.5" opacity="0.5"/>
    <circle cx="100" cy="179" r="3" fill="#f39c12"/>
    <circle cx="100" cy="179" r="1.5" fill="#fff"/>
    <path d="M73 96 L73 205" stroke="#c2185b" stroke-width="0.4" opacity="0.3"/>
    <path d="M127 96 L127 205" stroke="#c2185b" stroke-width="0.4" opacity="0.3"/>
    <path d="M76 130 Q78 145 76 160" stroke="#c2185b" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M124 140 Q122 155 124 170" stroke="#c2185b" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M76 96 Q88 92 100 92 Q112 92 124 96" stroke="#c2185b" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  // ─── СПОРТИВНАЯ МАЙКА (короткие рукава, номер) ───
  b_jersey: `
    ${SL_SHORT_L("#1a1a1a", "#0a0a0a")}
    ${SL_SHORT_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.6"/>
    <path d="M80 96 Q100 82 120 96" fill="#1a1a1a"/>
    <path d="M82 96 Q100 86 118 96" stroke="#333" stroke-width="0.5" fill="none"/>
    <text x="100" y="165" text-anchor="middle" font-size="26" fill="#f1c40f" font-weight="900">10</text>
    <path d="M76 100 L76 125 M124 100 L124 125" stroke="#f1c40f" stroke-width="1.2" opacity="0.4"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M73 203 L127 203" stroke="#0a0a0a" stroke-width="1.2"/>
    <path d="M73 201 L127 201" stroke="#333" stroke-width="0.4" opacity="0.4"/>
    <circle cx="100" cy="120" r="2" fill="#f1c40f" opacity="0.6"/>`,

  // ─── КРАСНОЕ ПЛАТЬЕ (цельный верх, струящееся) ───
  b_dress_red: `
    <path d="M76 96 Q74 96 74 105 L84 130 L62 240 L138 240 L116 130 L126 105 Q126 96 124 96 L114 96 Q110 108 100 108 Q90 108 86 96 Z" fill="#c0392b"/>
    <path d="M105 96 L105 108 Q113 108 116 130 L138 240 L110 240 L100 178 Z" fill="#a93226" opacity="0.5"/>
    <path d="M76 96 Q86 100 100 100 Q114 100 124 96" stroke="#8b0000" stroke-width="0.6" fill="none"/>
    <path d="M84 130 L100 108 L116 130" stroke="#8b0000" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M74 200 L126 200" stroke="#a93226" stroke-width="2"/>
    <path d="M74 202 L126 202" stroke="#e74c3c" stroke-width="0.4" opacity="0.5"/>
    <ellipse cx="86" cy="155" rx="3" ry="4" fill="#f8f8f8" opacity="0.4"/>
    <ellipse cx="114" cy="170" rx="3" ry="4" fill="#f8f8f8" opacity="0.4"/>
    <ellipse cx="96" cy="195" rx="3" ry="4" fill="#f8f8f8" opacity="0.4"/>
    <path d="M78 200 Q76 220 70 238 M122 200 Q124 220 130 238" stroke="#8b0000" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M90 210 Q88 225 86 238 M110 210 Q112 225 114 238" stroke="#8b0000" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M62 238 L138 238" stroke="#8b0000" stroke-width="0.8"/>`,

  // ─── РУБАШКА С ГАЛСТУКОМ (длинные рукава) ───
  b_shirt_tie: `
    ${SL_LONG_L("#fff", "#e8e8e8")}
    ${SL_LONG_R("#fff", "#e8e8e8")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#fff"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#e8e8e8" opacity="0.5"/>
    <path d="M76 96 Q86 90 100 90 Q114 90 124 96" stroke="#e0e0e0" stroke-width="0.8" fill="none"/>
    <path d="M82 96 Q100 84 118 96 L116 100 Q100 89 84 100 Z" fill="#fff"/>
    <path d="M82 96 Q100 86 118 96" stroke="#e0e0e0" stroke-width="0.5" fill="none"/>
    <path d="M96 96 L100 108 L104 96" fill="#e0e0e0" opacity="0.4"/>
    <path d="M100 108 L95 118 L100 126 L105 118 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M96 126 L104 126 L108 200 L92 200 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M98 126 L100 200 L102 126" stroke="#e74c3c" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M78 96 L82 130 M122 96 L118 130" stroke="#d0d0d0" stroke-width="0.8" fill="none"/>
    <path d="M100 96 L100 108" stroke="#d0d0d0" stroke-width="0.4" opacity="0.5"/>
    <circle cx="100" cy="135" r="1" fill="#fff" stroke="#8b0000" stroke-width="0.3"/>
    <circle cx="100" cy="155" r="1" fill="#fff" stroke="#8b0000" stroke-width="0.3"/>
    <circle cx="100" cy="175" r="1" fill="#fff" stroke="#8b0000" stroke-width="0.3"/>
    <path d="M76 130 Q78 145 76 160" stroke="#e0e0e0" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M73 203 L127 203" stroke="#e0e0e0" stroke-width="1.2"/>
    <path d="M73 201 L127 201" stroke="#fff" stroke-width="0.4" opacity="0.5"/>`,

  // ─── ФУТБОЛКА КЛАНА (короткие рукава) ───
  b_gang_shirt: `
    ${SL_SHORT_L("#c0392b", "#8b0000")}
    ${SL_SHORT_R("#c0392b", "#8b0000")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#c0392b"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#a93226" opacity="0.5"/>
    <path d="M76 96 Q86 90 100 90 Q114 90 124 96" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <path d="M82 96 Q100 84 118 96 L116 100 Q100 89 84 100 Z" fill="#a93226"/>
    <text x="100" y="155" text-anchor="middle" font-size="15" fill="#f39c12" font-weight="900">ГАНГ</text>
    <path d="M74 130 L126 130 M74 170 L126 170" stroke="#8b0000" stroke-width="1.2" opacity="0.5"/>
    <circle cx="100" cy="185" r="3" fill="#f39c12"/>
    <circle cx="100" cy="185" r="1.2" fill="#fff" opacity="0.6"/>
    <path d="M76 130 Q78 145 76 160" stroke="#a93226" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M73 203 L127 203" stroke="#8b0000" stroke-width="1.2"/>`,

  // ─── КУРТКА КЛАНА (длинные рукава, патчи) ───
  b_gang_jacket: `
    ${SL_LONG_L("#1a1a1a", "#0a0a0a")}
    ${SL_LONG_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M76 96 Q100 82 124 96 L122 102 Q100 88 78 102 Z" fill="#0a0a0a"/>
    <path d="M76 96 Q100 84 124 96" stroke="#333" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M73 96 L100 132 L127 96" stroke="#f39c12" stroke-width="2" fill="none"/>
    <path d="M75 96 L100 128 L125 96" stroke="#b87500" stroke-width="0.5" fill="none" opacity="0.5"/>
    <text x="100" y="170" text-anchor="middle" font-size="13" fill="#f39c12" font-weight="900">CLAN</text>
    <circle cx="100" cy="150" r="5" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <circle cx="100" cy="150" r="2" fill="#f39c12"/>
    <path d="M82 96 L82 205 M118 96 L118 205" stroke="#333" stroke-width="0.6" opacity="0.5"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M124 140 Q122 155 124 170" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <rect x="70" y="196" width="60" height="9" fill="#0a0a0a" opacity="0.8"/>
    <path d="M70 198 L130 198 M70 202 L130 202" stroke="#333" stroke-width="0.3" opacity="0.4"/>
    <rect x="78" y="115" width="10" height="8" fill="#8b0000" opacity="0.6"/>
    <rect x="112" y="115" width="10" height="8" fill="#8b0000" opacity="0.6"/>`,

  // ─── БРОНЯ КЛАНА (длинные рукава, латы) ───
  b_gang_armor: `
    ${SL_LONG_L("#2c3e50", "#1a252f")}
    ${SL_LONG_R("#2c3e50", "#1a252f")}
    <path d="M64 90 L136 90 L142 215 L58 215 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2.2"/>
    <path d="M105 90 L105 215 L142 215 L136 90 Z" fill="#1a252f" opacity="0.6"/>
    <path d="M64 90 L70 102 L70 215 L64 215 Z" fill="#1a252f"/>
    <path d="M136 90 L130 102 L130 215 L136 215 Z" fill="#1a252f"/>
    <path d="M74 112 L126 112 M74 142 L126 142 M74 172 L126 172" stroke="#f39c12" stroke-width="1.5"/>
    <ellipse cx="100" cy="155" rx="13" ry="15" fill="#c0392b" stroke="#8b0000" stroke-width="1"/>
    <text x="100" y="162" text-anchor="middle" font-size="14" fill="#f39c12" font-weight="900">☭</text>
    <path d="M64 90 L100 105 L136 90" stroke="#f39c12" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M64 90 L70 102" stroke="#f39c12" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M136 90 L130 102" stroke="#f39c12" stroke-width="0.8" fill="none" opacity="0.5"/>
    <circle cx="82" cy="120" r="2" fill="#f39c12" opacity="0.6"/>
    <circle cx="118" cy="120" r="2" fill="#f39c12" opacity="0.6"/>
    <path d="M74 208 L126 208" stroke="#f39c12" stroke-width="1" opacity="0.5"/>`,

  // ─── СПОРТИВКА КЕЙС (длинные рукава, полоски) ───
  b_case_tracksuit: `
    ${SL_LONG_L("#1a1a1a", "#0a0a0a")}
    ${SL_LONG_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M76 96 Q100 82 124 96 L122 102 Q100 88 78 102 Z" fill="#0a0a0a"/>
    <path d="M70 116 L130 116" stroke="#fff" stroke-width="2"/>
    <path d="M70 118 L130 118" stroke="#fff" stroke-width="0.8" opacity="0.6"/>
    <path d="M70 126 L130 126" stroke="#fff" stroke-width="0.8" opacity="0.6"/>
    <path d="M82 140 L82 205 M100 140 L100 205 M118 140 L118 205" stroke="#fff" stroke-width="0.8" opacity="0.4"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M124 140 Q122 155 124 170" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <rect x="70" y="196" width="60" height="9" fill="#0a0a0a" opacity="0.8"/>
    <path d="M70 198 L130 198 M70 202 L130 202" stroke="#fff" stroke-width="0.3" opacity="0.4"/>
    <circle cx="82" cy="134" r="2" fill="#fff" opacity="0.6"/>
    <circle cx="118" cy="134" r="2" fill="#fff" opacity="0.6"/>`,

  // ─── ARMANI НАСТОЯЩИЙ (длинные рукава, формальный) ───
  b_case_armani_real: `
    ${SL_LONG_L("#0a0a0a", "#000")}
    ${SL_LONG_R("#0a0a0a", "#000")}
    <path d="M73 96 L88 96 L88 205 L73 205 Z" fill="#0a0a0a"/>
    <path d="M127 96 L112 96 L112 205 L127 205 Z" fill="#0a0a0a"/>
    <path d="M88 96 L100 160 L88 205 L73 205 L73 96 Z" fill="#0a0a0a"/>
    <path d="M112 96 L100 160 L112 205 L127 205 L127 96 Z" fill="#000"/>
    <path d="M88 96 L100 160 L112 96 L106 96 L100 148 L94 96 Z" fill="#1a1a1a"/>
    <path d="M88 96 L80 130 L74 96" fill="#0a0a0a"/>
    <path d="M112 96 L120 130 L126 96" fill="#000"/>
    <path d="M80 96 L100 150 L120 96" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M88 96 L100 160 L112 96" stroke="#f39c12" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M88 96 L100 160 L112 96" stroke="#000" stroke-width="1.5" fill="none" opacity="0.3"/>
    <path d="M100 160 L100 205" stroke="#000" stroke-width="1" opacity="0.6"/>
    <circle cx="100" cy="172" r="2.5" fill="#f39c12"/>
    <circle cx="100" cy="188" r="2.5" fill="#f39c12"/>
    <path d="M82 96 L82 108 L84 108 L84 96 Z" fill="#1a1a1a" opacity="0.6"/>
    <path d="M118 96 L118 108 L116 108 L116 96 Z" fill="#1a1a1a" opacity="0.6"/>
    <path d="M80 130 L80 145 M120 130 L120 145" stroke="#1a1a1a" stroke-width="0.8" opacity="0.5"/>
    <path d="M76 96 L76 108" stroke="#333" stroke-width="0.5"/>
    <path d="M124 96 L124 108" stroke="#333" stroke-width="0.5"/>
    <path d="M78 96 L80 130" stroke="#1a1a1a" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  // ─── ДОСПЕХ ДРАКОНА (длинные рукава, латы) ───
  b_case_dragon_armor: `
    ${SL_LONG_L("#2c3e50", "#1a252f")}
    ${SL_LONG_R("#2c3e50", "#1a252f")}
    <path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="1"/>
    <path d="M105 96 L105 205 L130 205 L130 96 Z" fill="#1a252f" opacity="0.6"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#1a252f"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#1a252f"/>
    <rect x="84" y="124" width="32" height="60" fill="#1a252f"/>
    <path d="M84 130 L100 120 L116 130" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M84 180 L100 190 L116 180" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M76 120 Q100 112 124 120" stroke="#f39c12" stroke-width="1.5" fill="none"/>
    <ellipse cx="100" cy="155" rx="9" ry="13" fill="#e74c3c" stroke="#8b0000" stroke-width="1"/>
    <path d="M94 152 L106 152" stroke="#8b0000" stroke-width="0.8"/>
    <path d="M92 108 L100 118 L108 108" stroke="#34495e" stroke-width="0.8" fill="none"/>
    <path d="M84 96 L84 110" stroke="#34495e" stroke-width="0.5" opacity="0.6"/>
    <path d="M116 96 L116 110" stroke="#34495e" stroke-width="0.5" opacity="0.6"/>
    <circle cx="88" cy="138" r="1.5" fill="#f39c12" opacity="0.6"/>
    <circle cx="112" cy="138" r="1.5" fill="#f39c12" opacity="0.6"/>
    <circle cx="88" cy="172" r="1.5" fill="#f39c12" opacity="0.6"/>
    <circle cx="112" cy="172" r="1.5" fill="#f39c12" opacity="0.6"/>`,

  // ─── БРОНЯ МАКСИМУСА (длинные рукава, палдроны) ───
  b_case_top1_body: `
    ${SL_LONG_L("#1a0f2e", "#0f0819")}
    ${SL_LONG_R("#1a0f2e", "#0f0819")}
    <path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.8"/>
    <path d="M105 96 L105 205 L130 205 L130 96 Z" fill="#0f0819" opacity="0.6"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#0f0819"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#0f0819"/>
    <path d="M85 125 L100 108 L115 125 L115 172 L100 188 L85 172 Z" fill="#2c1810" stroke="#ffd700" stroke-width="1.2"/>
    <ellipse cx="100" cy="148" rx="9" ry="11" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="100" cy="148" r="4.5" fill="#e74c3c"/>
    <circle cx="100" cy="148" r="1.8" fill="#fff" opacity="0.8"/>
    <path d="M76 100 Q100 90 124 100" stroke="#f39c12" stroke-width="2" fill="none"/>
    <path d="M76 200 Q100 208 124 200" stroke="#f39c12" stroke-width="2" fill="none"/>
    <circle cx="82" cy="115" r="3" fill="#ffd700" stroke="#b8860b" stroke-width="0.5"/>
    <circle cx="118" cy="115" r="3" fill="#ffd700" stroke="#b8860b" stroke-width="0.5"/>
    <circle cx="82" cy="115" r="1.2" fill="#e74c3c"/>
    <circle cx="118" cy="115" r="1.2" fill="#e74c3c"/>
    <path d="M84 125 L84 180 M116 125 L116 180" stroke="#ffd700" stroke-width="0.6" opacity="0.5"/>
    <path d="M70 96 L70 108" stroke="#ffd700" stroke-width="0.8" opacity="0.6"/>
    <path d="M130 96 L130 108" stroke="#ffd700" stroke-width="0.8" opacity="0.6"/>`,

  // ─── МАНТИЯ ИМПЕРАТОРА (длинные рукава, золото) ───
  b_case_top2_body: `
    ${SL_LONG_L("#8b0000", "#5a0000", "#ffd700")}
    ${SL_LONG_R("#8b0000", "#5a0000", "#ffd700")}
    <path d="M64 90 L136 90 L142 215 L58 215 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2.2"/>
    <path d="M105 90 L105 215 L142 215 L136 90 Z" fill="#5a0000" opacity="0.6"/>
    <path d="M64 90 L70 102 L70 215 L64 215 Z" fill="#5a0000"/>
    <path d="M136 90 L130 102 L130 215 L136 215 Z" fill="#5a0000"/>
    <path d="M64 90 L84 106 L100 90 L116 106 L136 90" stroke="#ffd700" stroke-width="2" fill="none"/>
    <path d="M74 132 L126 132 M74 162 L126 162 M74 192 L126 192" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="100" cy="146" rx="13" ry="11" fill="#ffd700" stroke="#1a0f2e" stroke-width="1.5"/>
    <text x="100" y="152" text-anchor="middle" font-size="16" fill="#8b0000" font-weight="900">☭</text>
    <circle cx="84" cy="110" r="2.5" fill="#fff"/>
    <circle cx="116" cy="110" r="2.5" fill="#fff"/>
    <circle cx="80" cy="205" r="2" fill="#f39c12"/>
    <circle cx="120" cy="205" r="2" fill="#f39c12"/>
    <path d="M64 90 L70 102" stroke="#ffd700" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M136 90 L130 102" stroke="#ffd700" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M64 210 L136 210" stroke="#ffd700" stroke-width="1.5" opacity="0.6"/>`,

  // ─── ФУТБОЛКА С ЦЕПЯМИ (короткие рукава) ───
  b_case_chains: `
    ${SL_SHORT_L("#1a1a1a", "#0a0a0a")}
    ${SL_SHORT_R("#1a1a1a", "#0a0a0a")}
    <path d="M73 96 L73 205 L127 205 L127 96 Q100 92 73 96 Z" fill="#1a1a1a"/>
    <path d="M103 96 L103 205 L127 205 L127 96 Q117 94 103 96 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M76 96 Q86 90 100 90 Q114 90 124 96" stroke="#333" stroke-width="0.8" fill="none"/>
    <path d="M82 96 Q100 84 118 96 L116 100 Q100 89 84 100 Z" fill="#0a0a0a"/>
    <g stroke="#d4d4d4" stroke-width="2" fill="none">
      <circle cx="82" cy="126" r="4"/><circle cx="82" cy="136" r="4"/><circle cx="82" cy="146" r="4"/><circle cx="82" cy="156" r="4"/>
      <circle cx="118" cy="126" r="4"/><circle cx="118" cy="136" r="4"/><circle cx="118" cy="146" r="4"/><circle cx="118" cy="156" r="4"/>
    </g>
    <circle cx="100" cy="120" r="3" fill="#c0c0c0" stroke="#888" stroke-width="0.5"/>
    <circle cx="100" cy="120" r="1" fill="#fff" opacity="0.6"/>
    <path d="M100 123 L100 170" stroke="#c0c0c0" stroke-width="1.2"/>
    <path d="M100 145 L100 148" stroke="#888" stroke-width="0.4" opacity="0.4"/>
    <path d="M76 130 Q78 145 76 160" stroke="#0a0a0a" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M73 203 L127 203" stroke="#0a0a0a" stroke-width="1.2"/>`,

  // ═══════════════════════════════════════════════════════════
  //  НОГИ
  // ═══════════════════════════════════════════════════════════

  l_family: `<path d="M75 200 L75 250 L100 250 L100 200 Z" fill="#3498db"/>
    <path d="M100 200 L100 250 L125 250 L125 200 Z" fill="#3498db"/>
    <path d="M105 200 L105 250 L125 250 L125 200 Z" fill="#2980b9" opacity="0.5"/>
    <path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#2980b9"/>
    <path d="M75 210 L125 210" stroke="#1a6690" stroke-width="1" opacity="0.5"/>
    <path d="M85 225 L85 250 M115 225 L115 250" stroke="#2980b9" stroke-width="0.5" opacity="0.5"/>
    <path d="M75 218 L125 218" stroke="#1a6690" stroke-width="0.4" opacity="0.4"/>
    <circle cx="88" cy="208" r="1.5" fill="#f1c40f" opacity="0.7"/>
    <circle cx="112" cy="208" r="1.5" fill="#f1c40f" opacity="0.7"/>`,

  l_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#0a0a0a" opacity="0.5"/>
    <path d="M80 210 L80 358 M84 210 L84 358 M88 210 L88 358" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 210 L106 358 M110 210 L110 358 M114 210 L114 358" stroke="#fff" stroke-width="1.5"/>
    <path d="M75 205 L99 205 M101 205 L125 205" stroke="#333" stroke-width="1"/>
    <path d="M80 355 L80 365 M84 355 L84 365 M88 355 L88 365" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 355 L106 365 M110 355 L110 365 M114 355 L114 365" stroke="#fff" stroke-width="1.5"/>
    <path d="M82 220 L82 240 M82 260 L82 280 M82 300 L82 320" stroke="#444" stroke-width="0.4" opacity="0.4"/>`,

  l_ripped: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#2c4566" opacity="0.4"/>
    <ellipse cx="87" cy="255" rx="5" ry="4" fill="${SKIN}"/>
    <ellipse cx="112" cy="290" rx="6" ry="5" fill="${SKIN}"/>
    <ellipse cx="85" cy="320" rx="5" ry="4" fill="${SKIN}"/>
    <ellipse cx="115" cy="340" rx="5" ry="4" fill="${SKIN}"/>
    <ellipse cx="87" cy="255" rx="3" ry="2" fill="${SKIN_D}" opacity="0.4"/>
    <ellipse cx="112" cy="290" rx="3" ry="2.5" fill="${SKIN_D}" opacity="0.4"/>
    <path d="M75 205 L125 205" stroke="#2c4566" stroke-width="1.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#b8860b"/>
    <circle cx="112" cy="208" r="1.5" fill="#b8860b"/>
    <path d="M84 215 L86 230 M110 220 L112 235" stroke="#2c4566" stroke-width="0.5" opacity="0.5"/>`,

  l_shorts: `<path d="M75 200 L75 265 L100 265 L100 200 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M100 200 L100 265 L125 265 L125 200 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M105 200 L105 265 L125 265 L125 200 Z" fill="#d68910" opacity="0.4"/>
    <path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#e67e22"/>
    <path d="M82 230 L82 265 M118 230 L118 265" stroke="#d68910" stroke-width="0.6" opacity="0.6"/>
    <path d="M75 213 L125 213" stroke="#c06900" stroke-width="0.6"/>
    <path d="M90 225 Q95 230 90 235" stroke="#d68910" stroke-width="0.5" fill="none" opacity="0.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#fff" opacity="0.7"/>
    <circle cx="112" cy="208" r="1.5" fill="#fff" opacity="0.7"/>`,

  l_levis: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#2c4566" opacity="0.4"/>
    <path d="M75 205 L125 205" stroke="#2c4566" stroke-width="3"/>
    <circle cx="88" cy="208" r="1.5" fill="#b8860b"/>
    <circle cx="112" cy="208" r="1.5" fill="#b8860b"/>
    <path d="M88 214 L88 300 M112 214 L112 300" stroke="#2c4566" stroke-width="0.8" opacity="0.6"/>
    <path d="M78 220 L78 360 M122 220 L122 360" stroke="#2c4566" stroke-width="0.4" opacity="0.4"/>
    <path d="M82 240 L94 240 M106 240 L118 240" stroke="#2c4566" stroke-width="0.6" opacity="0.5"/>
    <path d="M78 355 L122 355" stroke="#2c4566" stroke-width="0.5" opacity="0.5"/>`,

  l_lampasy: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M96 205 L96 365 M104 205 L104 365" stroke="#e74c3c" stroke-width="2.5"/>
    <path d="M80 205 L80 365 M120 205 L120 365" stroke="#fff" stroke-width="1" opacity="0.5"/>
    <path d="M75 205 L125 205" stroke="#333" stroke-width="1"/>
    <path d="M96 205 L96 210 M104 205 L104 210" stroke="#8b0000" stroke-width="0.6" opacity="0.5"/>
    <circle cx="88" cy="230" r="1" fill="#fff" opacity="0.4"/>
    <circle cx="112" cy="260" r="1" fill="#fff" opacity="0.4"/>`,

  l_camo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#3a4a2a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#3a4a2a" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#3a4a2a" opacity="0.4"/>
    <circle cx="85" cy="230" r="5" fill="#3a4a2a"/>
    <circle cx="90" cy="260" r="6" fill="#6b7b4a"/>
    <circle cx="80" cy="290" r="5" fill="#3a4a2a"/>
    <circle cx="88" cy="330" r="6" fill="#6b7b4a"/>
    <circle cx="110" cy="240" r="5" fill="#3a4a2a"/>
    <circle cx="115" cy="280" r="6" fill="#6b7b4a"/>
    <circle cx="105" cy="310" r="5" fill="#3a4a2a"/>
    <circle cx="112" cy="345" r="6" fill="#6b7b4a"/>
    <circle cx="82" cy="220" r="3" fill="#4a5a2a" opacity="0.7"/>`,

  l_classic: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#1a252f" opacity="0.4"/>
    <path d="M75 205 L125 205" stroke="#1a252f" stroke-width="2"/>
    <path d="M87 214 L87 358 M113 214 L113 358" stroke="#1a252f" stroke-width="1"/>
    <path d="M78 220 L78 355 M122 220 L122 355" stroke="#1a252f" stroke-width="0.4" opacity="0.5"/>
    <path d="M75 218 L125 218" stroke="#3d5060" stroke-width="0.4" opacity="0.4"/>`,

  l_leather: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#000" opacity="0.4"/>
    <path d="M80 230 L80 340 M106 230 L106 340" stroke="#333" stroke-width="1"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#444" stroke-width="0.8" stroke-dasharray="2,2"/>
    <path d="M75 205 L125 205" stroke="#333" stroke-width="1.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#666"/>
    <circle cx="112" cy="208" r="1.5" fill="#666"/>
    <path d="M82 300 L94 300 M106 300 L118 300" stroke="#333" stroke-width="0.6" opacity="0.5"/>`,

  l_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#d4ac0d" opacity="0.4"/>
    <path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M75 205 L125 205" stroke="#b8860b" stroke-width="3"/>
    <circle cx="100" cy="210" r="3" fill="#fff"/>
    <circle cx="85" cy="240" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="115" cy="280" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="85" cy="320" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="115" cy="350" r="1" fill="#fff" opacity="0.7"/>`,

  l_joggers: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#34495e" stroke="#2c3e50" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#34495e" stroke="#2c3e50" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#2c3e50" opacity="0.4"/>
    <ellipse cx="87" cy="362" rx="12" ry="3" fill="#2c3e50"/>
    <ellipse cx="113" cy="362" rx="12" ry="3" fill="#2c3e50"/>
    <path d="M80 220 L80 340 M120 220 L120 340" stroke="#2c3e50" stroke-width="0.8" opacity="0.6"/>
    <path d="M75 205 L125 205" stroke="#2c3e50" stroke-width="1.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#3d5060"/>
    <circle cx="112" cy="208" r="1.5" fill="#3d5060"/>`,

  l_chinos: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#d4a97a" stroke="#b8916a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#d4a97a" stroke="#b8916a" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#b8916a" opacity="0.4"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#b8916a" stroke-width="0.8"/>
    <path d="M75 205 L125 205" stroke="#a07a5a" stroke-width="1"/>
    <path d="M78 220 L78 355 M122 220 L122 355" stroke="#b8916a" stroke-width="0.4" opacity="0.4"/>`,

  l_skinny: `<rect x="78" y="205" width="20" height="160" rx="3" fill="#1a1a2e" stroke="#0a0a1e" stroke-width="0.4"/>
    <rect x="102" y="205" width="20" height="160" rx="3" fill="#1a1a2e" stroke="#0a0a1e" stroke-width="0.4"/>
    <path d="M102 205 L102 365 L122 365 L122 205 Z" fill="#0a0a1e" opacity="0.4"/>
    <path d="M88 220 L88 358 M112 220 L112 358" stroke="#2c3e50" stroke-width="0.6"/>
    <path d="M78 205 L122 205" stroke="#0a0a1e" stroke-width="1"/>
    <path d="M78 208 L122 208" stroke="#333" stroke-width="0.4" opacity="0.4"/>`,

  l_baggy: `<path d="M70 205 Q68 210 70 220 L70 365 L98 365 L98 205 Z" fill="#5a5a5a" stroke="#3d3d3d" stroke-width="0.5"/>
    <path d="M130 205 Q132 210 130 220 L130 365 L102 365 L102 205 Z" fill="#5a5a5a" stroke="#3d3d3d" stroke-width="0.5"/>
    <path d="M102 205 L102 365 L130 365 L130 205 Z" fill="#3d3d3d" opacity="0.4"/>
    <path d="M70 220 Q100 226 130 220" stroke="#3d3d3d" stroke-width="1" fill="none"/>
    <path d="M75 250 Q75 320 75 360 M125 250 Q125 320 125 360" stroke="#3d3d3d" stroke-width="0.6" fill="none" opacity="0.5"/>
    <circle cx="84" cy="215" r="1.5" fill="#888"/>
    <circle cx="116" cy="215" r="1.5" fill="#888"/>`,

  l_overalls: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#2c4566" opacity="0.4"/>
    <rect x="70" y="180" width="60" height="30" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="76" y="96" width="8" height="90" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="116" y="96" width="8" height="90" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="78" y="94" width="8" height="8" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <rect x="114" y="94" width="8" height="8" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M70 190 L130 190" stroke="#2c4566" stroke-width="1"/>
    <path d="M78 96 L78 185 M122 96 L122 185" stroke="#2c4566" stroke-width="0.4" opacity="0.5"/>
    <rect x="82" y="196" width="10" height="8" rx="1" fill="#2c4566" stroke="#1a252f" stroke-width="0.4"/>
    <rect x="108" y="196" width="10" height="8" rx="1" fill="#2c4566" stroke="#1a252f" stroke-width="0.4"/>`,

  l_kilt: `<path d="M70 195 L130 195 L138 295 L62 295 Z" fill="#1a5c1a" stroke="#0f3d0f" stroke-width="0.6"/>
    <path d="M105 195 L105 295 L138 295 L130 195 Z" fill="#0f3d0f" opacity="0.4"/>
    <path d="M78 195 L78 295 M92 195 L92 295 M108 195 L108 295 M122 195 L122 295" stroke="#0f3d0f" stroke-width="1.2"/>
    <path d="M62 295 L138 295 L144 310 L56 310 Z" fill="#0f3d0f"/>
    <path d="M62 295 L138 295" stroke="#0a2a0a" stroke-width="1.2"/>
    <path d="M70 200 L74 200 M126 200 L130 200" stroke="#0a2a0a" stroke-width="0.6"/>
    <rect x="78" y="188" width="44" height="8" rx="2" fill="#3d2a10" stroke="#1a0f05" stroke-width="0.5"/>
    <circle cx="100" cy="192" r="2" fill="#f1c40f"/>
    <circle cx="100" cy="192" r="0.8" fill="#8b6914"/>`,

  l_harem: `<path d="M70 205 L70 265 Q58 295 70 325 L100 325 L100 205 Z" fill="#9b7d5a" stroke="#7d6044" stroke-width="0.5"/>
    <path d="M130 205 L130 265 Q142 295 130 325 L100 325 L100 205 Z" fill="#9b7d5a" stroke="#7d6044" stroke-width="0.5"/>
    <ellipse cx="100" cy="220" rx="32" ry="6" fill="#7d6044"/>
    <path d="M60 305 Q100 315 140 305" stroke="#7d6044" stroke-width="1" fill="none"/>
    <path d="M70 250 Q65 280 68 310" stroke="#7d6044" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M130 250 Q135 280 132 310" stroke="#7d6044" stroke-width="0.5" fill="none" opacity="0.5"/>
    <circle cx="100" cy="220" r="2" fill="#f1c40f" opacity="0.7"/>`,

  l_track: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M80 215 L80 358 M84 215 L84 358 M88 215 L88 358" stroke="#fff" stroke-width="1"/>
    <path d="M106 215 L106 358 M110 215 L110 358 M114 215 L114 358" stroke="#fff" stroke-width="1"/>
    <path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/>
    <path d="M75 205 L125 205" stroke="#333" stroke-width="1"/>`,

  l_cargo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#4a5b2a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#4a5b2a" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#4a5b2a" opacity="0.4"/>
    <rect x="76" y="252" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <rect x="76" y="295" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <rect x="112" y="252" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <rect x="112" y="295" width="12" height="16" fill="#4a5b2a" stroke="#3a4a1a" stroke-width="0.4"/>
    <path d="M77 258 L87 258 M77 301 L87 301 M113 258 L123 258 M113 301 L123 301" stroke="#3a4a1a" stroke-width="0.4" opacity="0.6"/>
    <path d="M75 205 L125 205" stroke="#4a5b2a" stroke-width="1.5"/>`,

  l_chains: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#0a0a0a" opacity="0.4"/>
    <circle cx="80" cy="240" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="80" cy="250" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="80" cy="260" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="120" cy="280" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="120" cy="290" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <circle cx="120" cy="300" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>
    <path d="M75 205 L125 205" stroke="#333" stroke-width="1.5"/>`,

  l_case_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#fff" stroke-width="1.5"/>
    <path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/>
    <circle cx="87" cy="240" r="2" fill="#f39c12"/>
    <circle cx="87" cy="280" r="2" fill="#f39c12"/>
    <circle cx="113" cy="240" r="2" fill="#f39c12"/>
    <circle cx="113" cy="280" r="2" fill="#f39c12"/>`,

  l_case_gold_shorts: `<path d="M72 200 L72 265 L100 265 L100 200 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M100 200 L100 265 L128 265 L128 200 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M72 200 L128 200 L128 215 L72 215 Z" fill="#d4ac0d"/>
    <path d="M80 240 L92 240 M108 240 L120 240 M80 250 L92 250 M108 250 L120 250" stroke="#fff" stroke-width="1.2" opacity="0.7"/>
    <circle cx="85" cy="225" r="2" fill="#fff"/>
    <circle cx="115" cy="225" r="2" fill="#fff"/>
    <circle cx="100" cy="235" r="2" fill="#fff"/>`,

  l_case_dragon_pants: `<path d="M74 205 L74 365 L100 365 L100 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.7"/>
    <path d="M100 205 L100 365 L126 365 L126 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.7"/>
    <path d="M100 205 L100 365 L126 365 L126 205 Z" fill="#1a252f" opacity="0.4"/>
    <path d="M75 205 L125 205" stroke="#e74c3c" stroke-width="2"/>
    <path d="M85 215 L85 360 M115 215 L115 360" stroke="#e74c3c" stroke-width="1" opacity="0.6"/>
    <path d="M80 240 Q92 245 80 260" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <path d="M120 240 Q108 245 120 260" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <circle cx="85" cy="300" r="2" fill="#f39c12"/>
    <circle cx="115" cy="300" r="2" fill="#f39c12"/>`,

  l_case_top1_legs: `<rect x="72" y="200" width="28" height="170" rx="4" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.5"/>
    <rect x="100" y="200" width="28" height="170" rx="4" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M100 200 L100 370 L128 370 L128 200 Z" fill="#0f0819" opacity="0.5"/>
    <path d="M84 214 L84 360 M92 214 L92 360 M108 214 L108 360 M116 214 L116 360" stroke="#ffd700" stroke-width="1.5"/>
    <circle cx="86" cy="240" r="3.5" fill="#e74c3c"/>
    <circle cx="114" cy="240" r="3.5" fill="#e74c3c"/>
    <circle cx="86" cy="310" r="3.5" fill="#e74c3c"/>
    <circle cx="114" cy="310" r="3.5" fill="#e74c3c"/>
    <path d="M72 200 L100 200 M100 200 L128 200" stroke="#f39c12" stroke-width="1.5"/>`,

  l_case_top2_legs: `<rect x="68" y="195" width="32" height="175" rx="4" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <rect x="100" y="195" width="32" height="175" rx="4" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M100 195 L100 370 L132 370 L132 195 Z" fill="#5a0000" opacity="0.5"/>
    <path d="M80 210 L80 365 M84 210 L84 365 M88 210 L88 365 M96 210 L96 365" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M104 210 L104 365 M112 210 L112 365 M116 210 L116 365 M120 210 L120 365" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="84" cy="250" rx="6" ry="8" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <ellipse cx="116" cy="250" rx="6" ry="8" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="84" cy="250" r="3" fill="#e74c3c"/>
    <circle cx="116" cy="250" r="3" fill="#e74c3c"/>
    <path d="M68 195 L132 195" stroke="#f39c12" stroke-width="1.5"/>`,

  l_gang_pants: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#a93226" opacity="0.4"/>
    <path d="M75 205 L125 205" stroke="#f39c12" stroke-width="2"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#f39c12" stroke-width="1" opacity="0.6"/>
    <circle cx="87" cy="250" r="2" fill="#f39c12"/>
    <circle cx="113" cy="250" r="2" fill="#f39c12"/>`,

  l_gang_tracksuit: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#0a0a0a" opacity="0.4"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M75 205 L125 205" stroke="#f39c12" stroke-width="1.5"/>`,

  l_gang_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#d4ac0d" opacity="0.4"/>
    <path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <circle cx="87" cy="250" r="3.5" fill="#8b0000"/>
    <circle cx="113" cy="250" r="3.5" fill="#8b0000"/>
    <circle cx="87" cy="310" r="3.5" fill="#8b0000"/>
    <circle cx="113" cy="310" r="3.5" fill="#8b0000"/>`,

  // ═══════════════════════════════════════════════════════════
  //  ПРАВАЯ РУКА — scale 1.8 (большие 2.2), rotate(+) = ОТ тела (вправо)
  // ═══════════════════════════════════════════════════════════

  rh_cig: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="0" y="-2" width="32" height="4" rx="1.5" fill="#f5f5f5" stroke="#c0c0c0" stroke-width="0.4"/>
    <rect x="4" y="-2" width="12" height="4" fill="#d4a97a"/>
    <rect x="4" y="-2" width="12" height="1" fill="#e8c898" opacity="0.6"/>
    <rect x="0" y="-2" width="32" height="1" fill="#fff" opacity="0.5"/>
    <circle cx="32" cy="0" r="3" fill="#ff6600"/>
    <circle cx="32" cy="0" r="1.5" fill="#ffcc00"/>
    <circle cx="35" cy="-3" r="2" fill="#bbb" opacity="0.4"/>
  </g>`,

  rh_beer: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-8" y="-42" width="16" height="38" rx="3" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <rect x="-8" y="-42" width="4" height="38" fill="#a88828" opacity="0.4"/>
    <rect x="-5" y="-52" width="10" height="14" rx="1" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.4"/>
    <rect x="-5" y="-58" width="10" height="8" rx="1" fill="#d4ac0d"/>
    <rect x="-8" y="-30" width="16" height="10" fill="#c0392b"/>
    <rect x="-8" y="-30" width="16" height="2" fill="#e74c3c" opacity="0.5"/>
    <ellipse cx="0" cy="-8" rx="8" ry="3" fill="#6b4a14"/>
    <ellipse cx="-3" cy="-38" rx="2" ry="6" fill="#a88828" opacity="0.5"/>
    <rect x="-8" y="-24" width="16" height="1" fill="#fff" opacity="0.4"/>
    <rect x="-8" y="-14" width="16" height="1" fill="#fff" opacity="0.4"/>
  </g>`,

  rh_baltica: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-7" y="-44" width="14" height="40" rx="2" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="-7" y="-44" width="3" height="40" fill="#333" opacity="0.5"/>
    <rect x="-4" y="-54" width="8" height="14" rx="1" fill="#1a1a1a"/>
    <rect x="-4" y="-60" width="8" height="8" rx="1" fill="#f39c12"/>
    <circle cx="0" cy="-25" r="6" fill="#f39c12" opacity="0.9"/>
    <circle cx="0" cy="-25" r="5" fill="#d68910"/>
    <text x="0" y="-22" text-anchor="middle" font-size="7" fill="#1a1a1a" font-weight="900">9</text>
    <circle cx="-4" cy="-40" r="1" fill="#555" opacity="0.5"/>
    <rect x="-7" y="-18" width="14" height="1" fill="#fff" opacity="0.4"/>
  </g>`,

  rh_shaverma: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <path d="M-10 0 Q-14 -12 -10 -35 Q0 -45 10 -35 Q14 -12 10 0 Z" fill="#f5e6c8" stroke="#d4c8a8" stroke-width="0.6"/>
    <path d="M-10 0 Q-14 -12 -10 -35 Q-5 -40 -2 -32 L-3 0 Z" fill="#f8eed8" opacity="0.5"/>
    <path d="M-6 -18 Q0 -14 6 -18 M-8 -28 Q0 -24 8 -28 M-5 -8 Q0 -5 5 -8" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <circle cx="-2" cy="-22" r="1.5" fill="#2ecc71"/>
    <circle cx="3" cy="-30" r="1.5" fill="#c0392b"/>
    <circle cx="-4" cy="-34" r="1.2" fill="#2ecc71"/>
    <ellipse cx="0" cy="-38" rx="8" ry="3" fill="#f5e6c8" opacity="0.7"/>
  </g>`,

  rh_rose: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <line x1="0" y1="0" x2="0" y2="-55" stroke="#2ecc71" stroke-width="2.5"/>
    <line x1="-1" y1="-5" x2="-1" y2="-50" stroke="#4ade80" stroke-width="0.8" opacity="0.5"/>
    <ellipse cx="0" cy="-60" rx="10" ry="12" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <ellipse cx="0" cy="-60" rx="6" ry="7" fill="#e74c3c"/>
    <ellipse cx="0" cy="-60" rx="3" ry="3.5" fill="#c0392b"/>
    <circle cx="0" cy="-60" r="1.5" fill="#8b0000"/>
    <ellipse cx="-8" cy="-30" rx="5" ry="3" fill="#2ecc71" transform="rotate(-30 -8 -30)"/>
    <ellipse cx="8" cy="-40" rx="5" ry="3" fill="#2ecc71" transform="rotate(30 8 -40)"/>
    <ellipse cx="-6" cy="-46" rx="4" ry="2" fill="#27ae60" transform="rotate(-20 -6 -46)"/>
  </g>`,

  rh_rod: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <line x1="0" y1="0" x2="0" y2="-95" stroke="#8b6914" stroke-width="3"/>
    <line x1="0" y1="-95" x2="0" y2="-5" stroke="#a07828" stroke-width="1" opacity="0.6"/>
    <line x1="1" y1="-95" x2="1" y2="-5" stroke="#c09040" stroke-width="0.4" opacity="0.5"/>
    <line x1="0" y1="-95" x2="-5" y2="-70" stroke="#888" stroke-width="0.6"/>
    <circle cx="-5" cy="-70" r="3" fill="#c0392b"/>
    <circle cx="-5" cy="-70" r="1" fill="#fff" opacity="0.5"/>
    <circle cx="0" cy="-95" r="3" fill="#5a3a0a"/>
    <circle cx="0" cy="-95" r="1.5" fill="#8b6914"/>
    <line x1="-8" y1="-5" x2="8" y2="-5" stroke="#5a3a0a" stroke-width="2.5"/>
    <path d="M-3 -90 L-3 -10" stroke="#fff" stroke-width="0.3" opacity="0.4"/>
  </g>`,

  rh_bat: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-4" y="-85" width="8" height="85" rx="3" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <rect x="-4" y="-85" width="3" height="85" fill="#a07828" opacity="0.5"/>
    <rect x="-7" y="-105" width="14" height="25" rx="5" fill="#a07020" stroke="#6b4a14" stroke-width="0.6"/>
    <rect x="-7" y="-105" width="4" height="25" fill="#b8842c" opacity="0.5"/>
    <rect x="-10" y="-6" width="20" height="6" rx="2" fill="#5a3a0a"/>
    <path d="M-3 -85 L3 -85 M-5 -75 L5 -75 M-6 -60 L6 -60 M-6 -45 L6 -45" stroke="#5a3a0a" stroke-width="0.5" opacity="0.4"/>
    <path d="M-3 -100 L3 -100" stroke="#fff" stroke-width="0.5" opacity="0.3"/>
  </g>`,

  rh_nerf: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-4" y="-12" width="20" height="8" rx="1.5" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <rect x="16" y="-14" width="14" height="12" rx="2" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <rect x="-6" y="-10" width="6" height="18" rx="2" fill="#e67e22"/>
    <circle cx="4" cy="-4" r="2" fill="#c0392b"/>
    <rect x="-3" y="-18" width="8" height="6" fill="#e67e22"/>
    <rect x="24" y="-12" width="4" height="4" fill="#c0392b"/>
    <path d="M18 -8 L28 -8" stroke="#b87500" stroke-width="0.6"/>
    <rect x="-4" y="-12" width="20" height="2" fill="#fdd835" opacity="0.5"/>
  </g>`,

  rh_flag_rus: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <line x1="0" y1="0" x2="0" y2="-85" stroke="#888" stroke-width="2.5"/>
    <line x1="0" y1="-85" x2="0" y2="-5" stroke="#aaa" stroke-width="0.8" opacity="0.5"/>
    <rect x="0" y="-85" width="45" height="11" fill="#fff"/>
    <rect x="0" y="-74" width="45" height="11" fill="#3498db"/>
    <rect x="0" y="-63" width="45" height="11" fill="#e74c3c"/>
    <path d="M0 -85 L45 -85" stroke="#e0e0e0" stroke-width="0.4"/>
    <path d="M0 -63 L45 -63" stroke="#c0392b" stroke-width="0.4"/>
    <circle cx="0" cy="-85" r="2.5" fill="#666"/>
    <path d="M0 -74 L45 -74" stroke="#2980b9" stroke-width="0.3" opacity="0.4"/>
  </g>`,

  rh_case: `<g transform="translate(145, 197) rotate(22) scale(2.2)">
    <rect x="-16" y="-42" width="32" height="32" rx="3" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.6"/>
    <rect x="-16" y="-32" width="32" height="4" fill="#b8860b"/>
    <rect x="-16" y="-42" width="6" height="32" fill="#a88c2c" opacity="0.4"/>
    <circle cx="0" cy="-46" r="5" fill="none" stroke="#8b6914" stroke-width="2.5"/>
    <text x="0" y="-20" text-anchor="middle" font-size="10" fill="#ffd700" font-weight="900">$</text>
    <rect x="-2" y="-28" width="4" height="4" fill="#5a3a0a"/>
    <path d="M-14 -38 L14 -38" stroke="#5a3a0a" stroke-width="0.4" opacity="0.4"/>
    <circle cx="0" cy="-46" r="2" fill="#5a3a0a"/>
  </g>`,

  rh_knife: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-5" y="-15" width="10" height="15" rx="2" fill="#1a1a1a"/>
    <rect x="-3" y="-13" width="2" height="12" fill="#333" opacity="0.6"/>
    <path d="M-5 -15 L5 -15 L4 -48 L0 -55 L-4 -48 Z" fill="#d4d4d4" stroke="#888" stroke-width="0.5"/>
    <path d="M-4 -48 L4 -48 L4 -45 L-4 -45 Z" fill="#9a9a9a"/>
    <path d="M-2 -48 L0 -53 L0 -15 L-2 -15 Z" fill="#fff" opacity="0.5"/>
    <path d="M-2 -30 L2 -30 M-3 -22 L3 -22" stroke="#aaa" stroke-width="0.5" opacity="0.6"/>
    <rect x="-7" y="-2" width="14" height="3" rx="1" fill="#333"/>
    <circle cx="0" cy="-8" r="1.5" fill="#c0392b"/>
  </g>`,

  rh_book: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-14" y="-42" width="28" height="42" rx="2" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-14" y="-42" width="5" height="42" fill="#8b1a1a"/>
    <rect x="-12" y="-40" width="2" height="38" fill="#e74c3c" opacity="0.4"/>
    <line x1="-4" y1="-35" x2="10" y2="-35" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <line x1="-4" y1="-22" x2="10" y2="-22" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <text x="0" y="-10" text-anchor="middle" font-size="6" fill="#fff" font-weight="900" opacity="0.7">BOOK</text>
    <rect x="8" y="-42" width="4" height="10" fill="#a93226" opacity="0.6"/>
  </g>`,

  rh_donut: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <circle cx="0" cy="-22" r="16" fill="#e67e22" stroke="#b85400" stroke-width="0.6"/>
    <circle cx="0" cy="-22" r="10" fill="#f39c12" opacity="0.5"/>
    <circle cx="0" cy="-22" r="7" fill="#8b4513"/>
    <path d="M-9 -28 Q-6 -33 0 -33 Q6 -33 9 -28 Q6 -31 0 -31 Q-6 -31 -9 -28 Z" fill="#e74c3c"/>
    <path d="M-11 -16 Q-9 -12 0 -12 Q9 -12 11 -16" stroke="#f39c12" stroke-width="1.5" fill="none"/>
    <circle cx="-6" cy="-25" r="0.8" fill="#fff"/>
    <circle cx="5" cy="-22" r="0.8" fill="#fff"/>
    <ellipse cx="-8" cy="-30" rx="2" ry="1" fill="#fff" opacity="0.4"/>
  </g>`,

  rh_icecream: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <path d="M-5 -40 L5 -40 L3 -8 L-3 -8 Z" fill="#f5deb3" stroke="#d4b888" stroke-width="0.5"/>
    <path d="M-5 -40 L-3 -8" stroke="#e8c898" stroke-width="0.4" opacity="0.6"/>
    <circle cx="0" cy="-48" r="9" fill="#f06292" stroke="#c2185b" stroke-width="0.4"/>
    <circle cx="-6" cy="-52" r="6" fill="#fce4ec"/>
    <circle cx="6" cy="-52" r="6" fill="#fce4ec"/>
    <circle cx="0" cy="-58" r="5" fill="#e91e63"/>
    <path d="M-3 -40 L3 -40" stroke="#d4b888" stroke-width="0.5"/>
    <circle cx="-3" cy="-54" r="1" fill="#fff" opacity="0.6"/>
  </g>`,

  rh_glove: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <ellipse cx="0" cy="-15" rx="16" ry="18" fill="#c0392b" stroke="#8b1a1a" stroke-width="0.6"/>
    <ellipse cx="0" cy="-15" rx="12" ry="14" fill="#e74c3c" opacity="0.3"/>
    <ellipse cx="0" cy="-30" rx="8" ry="6" fill="#a93226" stroke="#8b1a1a" stroke-width="0.4"/>
    <rect x="-7" y="-2" width="14" height="8" rx="2" fill="#a93226"/>
    <path d="M-10 -20 Q-12 -15 -8 -8" stroke="#8b1a1a" stroke-width="0.8" fill="none"/>
    <path d="M10 -20 Q12 -15 8 -8" stroke="#8b1a1a" stroke-width="0.8" fill="none"/>
    <ellipse cx="-5" cy="-18" rx="3" ry="5" fill="#e74c3c" opacity="0.5"/>
    <path d="M-8 -10 L-6 -8" stroke="#fff" stroke-width="0.4" opacity="0.4"/>
  </g>`,

  rh_bag: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <path d="M-12 -35 L12 -35 L15 5 L-15 5 Z" fill="#f5f5f5" stroke="#ccc" stroke-width="0.5"/>
    <path d="M-12 -35 L-15 5 L-10 5 L-8 -35 Z" fill="#e0e0e0" opacity="0.5"/>
    <path d="M-8 -35 Q-8 -44 0 -44 Q8 -44 8 -35" stroke="#888" stroke-width="1.8" fill="none"/>
    <circle cx="-4" cy="-20" r="2" fill="#c0392b"/>
    <circle cx="4" cy="-15" r="2" fill="#e74c3c"/>
    <circle cx="0" cy="-8" r="2" fill="#2ecc71"/>
    <path d="M-10 -30 L10 -30" stroke="#999" stroke-width="0.4" opacity="0.4"/>
    <path d="M-12 -25 L-8 -22" stroke="#ccc" stroke-width="0.3" opacity="0.5"/>
  </g>`,

  rh_brass: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <ellipse cx="0" cy="-18" rx="12" ry="10" fill="#888" stroke="#444" stroke-width="0.5"/>
    <ellipse cx="0" cy="-18" rx="9" ry="7" fill="#999" opacity="0.3"/>
    <circle cx="-7" cy="-24" r="3.5" fill="#666" stroke="#333" stroke-width="0.4"/>
    <circle cx="-1" cy="-26" r="3.5" fill="#666" stroke="#333" stroke-width="0.4"/>
    <circle cx="6" cy="-24" r="3.5" fill="#666" stroke="#333" stroke-width="0.4"/>
    <circle cx="10" cy="-18" r="3" fill="#666" stroke="#333" stroke-width="0.4"/>
    <ellipse cx="-3" cy="-15" rx="4" ry="2" fill="#555" opacity="0.6"/>
    <circle cx="-7" cy="-25" r="1" fill="#aaa" opacity="0.5"/>
  </g>`,

  rh_watermelon: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <ellipse cx="0" cy="-18" rx="20" ry="17" fill="#2ecc71" stroke="#1a8b4a" stroke-width="0.6"/>
    <ellipse cx="0" cy="-20" rx="18" ry="14" fill="#27ae60" opacity="0.5"/>
    <path d="M-16 -18 Q0 -28 16 -18" stroke="#1a8b4a" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M-15 -20 Q-8 -22 0 -20 Q8 -22 15 -20" stroke="#1a8b4a" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M-15 -25 Q0 -32 15 -25" fill="#a93226" opacity="0.9"/>
    <path d="M-15 -25 Q0 -30 15 -25" fill="#e74c3c" opacity="0.6"/>
    <circle cx="-5" cy="-27" r="1" fill="#000"/>
    <circle cx="4" cy="-28" r="1" fill="#000"/>
    <circle cx="10" cy="-25" r="1" fill="#000"/>
    <ellipse cx="-10" cy="-22" rx="3" ry="1" fill="#fff" opacity="0.3"/>
  </g>`,

  rh_fish: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <ellipse cx="0" cy="-20" rx="20" ry="10" fill="#4aa3df" stroke="#2874a6" stroke-width="0.6"/>
    <ellipse cx="0" cy="-22" rx="16" ry="6" fill="#6dc0e8" opacity="0.4"/>
    <path d="M18 -20 L28 -28 L28 -12 Z" fill="#2e86c1"/>
    <path d="M18 -20 L26 -24 L26 -16 Z" fill="#4aa3df" opacity="0.6"/>
    <circle cx="-12" cy="-22" r="2" fill="#1a1a1a"/>
    <circle cx="-12" cy="-22" r="0.7" fill="#fff"/>
    <path d="M-8 -14 Q0 -11 8 -14" stroke="#2c3e50" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M-16 -20 L-10 -14 M-16 -20 L-10 -26" stroke="#2874a6" stroke-width="0.6" fill="none" opacity="0.5"/>
  </g>`,

  rh_burger: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <path d="M-18 -34 Q0 -42 18 -34 Q20 -32 20 -30 L-20 -30 Q-20 -32 -18 -34 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M-18 -34 Q0 -40 18 -34" stroke="#fdd835" stroke-width="0.5" fill="none" opacity="0.6"/>
    <rect x="-20" y="-30" width="40" height="4" fill="#2ecc71"/>
    <rect x="-19" y="-26" width="38" height="7" fill="#8b4513"/>
    <rect x="-19" y="-26" width="38" height="2" fill="#5a3a0a" opacity="0.6"/>
    <rect x="-20" y="-19" width="40" height="4" fill="#e74c3c"/>
    <path d="M-18 -15 L18 -15 Q20 -13 20 -10 L-20 -10 Q-20 -13 -18 -15 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <circle cx="-8" cy="-32" r="1" fill="#fff" opacity="0.6"/>
    <circle cx="6" cy="-33" r="1" fill="#fff" opacity="0.6"/>
    <circle cx="-14" cy="-33" r="1" fill="#fff" opacity="0.6"/>
  </g>`,

  rh_case_knife: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-6" y="-15" width="12" height="15" rx="2" fill="#1a1a1a" stroke="#000" stroke-width="0.4"/>
    <path d="M-6 -15 L6 -15 L5 -52 L0 -60 L-5 -52 Z" fill="#d4d4d4" stroke="#888" stroke-width="0.5"/>
    <path d="M-5 -52 L5 -52 L5 -48 L-5 -48 Z" fill="#9a9a9a"/>
    <path d="M-3 -40 L3 -40 M-3 -30 L3 -30 M-2 -20 L2 -20" stroke="#aaa" stroke-width="0.4" opacity="0.5"/>
    <rect x="-8" y="-2" width="16" height="3" rx="1" fill="#333"/>
    <circle cx="0" cy="-8" r="2" fill="#1a1a1a"/>
  </g>`,

  rh_case_uzi_gold: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-6" y="-2" width="26" height="10" rx="1.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <rect x="-6" y="-2" width="26" height="3" fill="#ffe66d" opacity="0.5"/>
    <rect x="-6" y="8" width="8" height="16" fill="#d4ac0d" stroke="#b8860b" stroke-width="0.4"/>
    <rect x="12" y="-8" width="5" height="12" fill="#d4ac0d"/>
    <circle cx="18" cy="3" r="2" fill="#b8860b"/>
    <rect x="-10" y="-8" width="22" height="4" rx="1" fill="#ffd700"/>
    <path d="M0 0 L20 0 M0 4 L20 4" stroke="#b8860b" stroke-width="0.4" opacity="0.5"/>
    <rect x="-2" y="14" width="4" height="4" fill="#8b6914"/>
  </g>`,

  rh_case_dragon_sword: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-6" y="-2" width="12" height="18" rx="2" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <rect x="-8" y="-4" width="16" height="4" rx="1" fill="#f39c12"/>
    <path d="M-5 -4 L5 -4 L4 -85 L0 -95 L-4 -85 Z" fill="#d4d4d4" stroke="#888" stroke-width="0.6"/>
    <path d="M-4 -85 L4 -85 L4 -78 L-4 -78 Z" fill="#9a9a9a"/>
    <path d="M0 -95 L3 -85 L0 -78 L-3 -85 Z" fill="#f39c12"/>
    <path d="M-2 -72 L2 -72 M-2 -60 L2 -60 M-2 -48 L2 -48 M-2 -36 L2 -36 M-2 -24 L2 -24" stroke="#f39c12" stroke-width="1.2"/>
    <circle cx="0" cy="-42" r="2.5" fill="#e74c3c"/>
    <path d="M-10 16 L10 16" stroke="#f39c12" stroke-width="2.5"/>
  </g>`,

  rh_case_top1_weapon: `<g transform="translate(145, 197) rotate(22) scale(2.2)">
    <rect x="-7" y="-6" width="14" height="24" rx="2" fill="#1a0f2e" stroke="#ffd700" stroke-width="0.8"/>
    <path d="M-6 -6 L6 -6 L5 -88 L0 -100 L-5 -88 Z" fill="#c0c0c0" stroke="#ffd700" stroke-width="1"/>
    <path d="M0 -100 L4 -88 L0 -82 L-4 -88 Z" fill="#ffd700"/>
    <path d="M-2 -72 L2 -72 M-2 -55 L2 -55 M-2 -38 L2 -38 M-2 -22 L2 -22" stroke="#ffd700" stroke-width="1.2"/>
    <circle cx="0" cy="-45" r="2.5" fill="#e74c3c"/>
    <circle cx="0" cy="-45" r="1" fill="#fff" opacity="0.8"/>
    <path d="M-12 20 L12 20" stroke="#ffd700" stroke-width="2.5"/>
    <path d="M-3 -85 L3 -85" stroke="#fff" stroke-width="0.4" opacity="0.4"/>
  </g>`,

  rh_case_top2_weapon: `<g transform="translate(145, 197) rotate(22) scale(2.2)">
    <rect x="-9" y="-2" width="18" height="24" rx="3" fill="#8b0000" stroke="#ffd700" stroke-width="0.8"/>
    <path d="M-5 -4 L-5 -38 Q0 -60 5 -38 L5 -4 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M-4 -8 L-4 -36 Q-2 -42 0 -42 Q2 -42 4 -36 L4 -8 Z" fill="#ffe66d" opacity="0.5"/>
    <circle cx="0" cy="-44" r="6" fill="#e74c3c" stroke="#1a0f2e" stroke-width="1.2"/>
    <circle cx="0" cy="-44" r="2.5" fill="#fff"/>
    <path d="M-11 20 L11 20" stroke="#ffd700" stroke-width="3"/>
    <path d="M-7 -60 L0 -72 L7 -60" stroke="#ffd700" stroke-width="2" fill="none"/>
    <circle cx="0" cy="-72" r="2.5" fill="#e74c3c"/>
  </g>`,

  rh_gang_bat: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-4" y="-78" width="8" height="78" rx="3" fill="#3d2a10" stroke="#1a0f05" stroke-width="0.5"/>
    <rect x="-4" y="-78" width="3" height="78" fill="#5a3a1e" opacity="0.5"/>
    <rect x="-7" y="-98" width="14" height="22" rx="5" fill="#5a3a1e" stroke="#3d2a10" stroke-width="0.6"/>
    <rect x="-7" y="-98" width="4" height="22" fill="#7a5028" opacity="0.5"/>
    <path d="M-3 -80 L3 -80 M-4 -70 L4 -70 M-4 -55 L4 -55" stroke="#f39c12" stroke-width="1.5"/>
    <rect x="-10" y="-6" width="20" height="6" rx="2" fill="#1a1a1a"/>
    <path d="M-3 -95 L3 -95" stroke="#f39c12" stroke-width="1.5"/>
  </g>`,

  rh_gang_mace: `<g transform="translate(145, 197) rotate(22) scale(1.8)">
    <rect x="-4" y="-14" width="8" height="30" fill="#5a3a1e" stroke="#3d2a10" stroke-width="0.5"/>
    <rect x="-4" y="-14" width="3" height="30" fill="#7a5028" opacity="0.5"/>
    <circle cx="0" cy="-32" r="16" fill="#7f8c8d" stroke="#f39c12" stroke-width="1.5"/>
    <circle cx="0" cy="-32" r="10" fill="#95a5a6" opacity="0.4"/>
    <circle cx="0" cy="-32" r="5" fill="#c0392b"/>
    <path d="M-14 -44 L-9 -38 M14 -44 L9 -38 M-16 -32 L-10 -32 M16 -32 L10 -32 M-14 -20 L-9 -26 M14 -20 L9 -26" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M-7 -40 L-4 -37 M7 -40 L4 -37" stroke="#a8b8b8" stroke-width="0.8" opacity="0.6"/>
  </g>`,

  rh_gang_halberd: `<g transform="translate(145, 197) rotate(22) scale(2.2)">
    <rect x="-3" y="-85" width="6" height="110" fill="#5a3a1e" stroke="#3d2a10" stroke-width="0.5"/>
    <rect x="-3" y="-85" width="2" height="110" fill="#7a5028" opacity="0.5"/>
    <path d="M-9 -85 L0 -105 L9 -85 L5 -72 L-5 -72 Z" fill="#c0c0c0" stroke="#8b0000" stroke-width="1"/>
    <path d="M0 -105 L3 -72 L-3 -72 Z" fill="#e74c3c"/>
    <path d="M9 -85 L24 -78 L9 -68" stroke="#c0c0c0" stroke-width="2" fill="none"/>
    <path d="M-11 22 L11 22" stroke="#f39c12" stroke-width="2"/>
    <circle cx="0" cy="-88" r="2" fill="#fff" opacity="0.6"/>
  </g>`,

  // ═══════════════════════════════════════════════════════════
  //  ЛЕВАЯ РУКА — scale 1.8 (большие 2.2), rotate(-) = ОТ тела (влево)
  // ═══════════════════════════════════════════════════════════

  lh_phone: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-8" y="-40" width="16" height="30" rx="2" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="-6" y="-37" width="12" height="24" fill="#3498db"/>
    <rect x="-6" y="-37" width="12" height="6" fill="#2980b9" opacity="0.5"/>
    <path d="M-4 -30 L4 -30 M-4 -25 L4 -25 M-4 -20 L4 -20" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <circle cx="0" cy="-12" r="1.5" fill="#555"/>
    <rect x="-8" y="-40" width="16" height="30" rx="2" fill="none" stroke="#333" stroke-width="0.3"/>
  </g>`,

  lh_wallet: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-14" y="-22" width="28" height="20" rx="2" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.5"/>
    <rect x="-14" y="-22" width="28" height="4" fill="#a06030" opacity="0.6"/>
    <path d="M-14 -16 L14 -16" stroke="#5a2e0a" stroke-width="1"/>
    <circle cx="8" cy="-12" r="2.5" fill="#f1c40f" stroke="#b8860b" stroke-width="0.3"/>
    <circle cx="8" cy="-12" r="1" fill="#fff" opacity="0.5"/>
    <path d="M-10 -20 L10 -20" stroke="#a06030" stroke-width="0.5" opacity="0.6"/>
    <path d="M-12 -10 L12 -10" stroke="#6b3a10" stroke-width="0.4" opacity="0.4"/>
  </g>`,

  lh_cola: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-7" y="-34" width="14" height="32" rx="2" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-7" y="-34" width="4" height="32" fill="#e74c3c" opacity="0.5"/>
    <rect x="-7" y="-34" width="14" height="5" fill="#888"/>
    <rect x="-4" y="-32" width="4" height="4" fill="#a93226" opacity="0.5"/>
    <text x="0" y="-15" text-anchor="middle" font-size="9" fill="#fff" font-weight="900">C</text>
    <path d="M-5 -8 L5 -8" stroke="#8b0000" stroke-width="0.5" opacity="0.5"/>
  </g>`,

  lh_ext: `<g transform="translate(55, 197) rotate(-20) scale(1.8)">
    <rect x="-10" y="-45" width="20" height="48" rx="4" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-10" y="-45" width="5" height="48" fill="#e74c3c" opacity="0.5"/>
    <rect x="-10" y="-42" width="20" height="4" fill="#fff"/>
    <rect x="-3" y="-52" width="6" height="8" fill="#333"/>
    <path d="M-3 -52 Q-10 -60 -14 -62" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M3 -52 Q10 -60 14 -62" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <text x="0" y="-20" text-anchor="middle" font-size="8" fill="#fff" font-weight="900">ОГН</text>
  </g>`,

  lh_guitar: `<g transform="translate(55, 197) rotate(-20) scale(2.2)">
    <ellipse cx="0" cy="-8" rx="20" ry="18" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.6"/>
    <ellipse cx="0" cy="-8" rx="15" ry="13" fill="#a06030" opacity="0.4"/>
    <ellipse cx="-2" cy="-28" rx="17" ry="14" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.6"/>
    <ellipse cx="-2" cy="-28" rx="12" ry="9" fill="#a06030" opacity="0.4"/>
    <circle cx="0" cy="-20" r="7" fill="#1a1a1a"/>
    <circle cx="0" cy="-20" r="3" fill="#3d1a05"/>
    <rect x="-4" y="-70" width="8" height="42" fill="#5a2e0a"/>
    <rect x="-4" y="-70" width="3" height="42" fill="#7a5028" opacity="0.5"/>
    <rect x="-6" y="-80" width="12" height="14" rx="2" fill="#3d1a05" transform="rotate(-10 0 -80)"/>
    <line x1="-3" y1="-70" x2="-3" y2="-10" stroke="#f5deb3" stroke-width="0.5" opacity="0.6"/>
    <line x1="0" y1="-70" x2="0" y2="-10" stroke="#f5deb3" stroke-width="0.5" opacity="0.6"/>
    <line x1="3" y1="-70" x2="3" y2="-10" stroke="#f5deb3" stroke-width="0.5" opacity="0.6"/>
    <rect x="-12" y="6" width="24" height="5" rx="1" fill="#3d1a05"/>
    <circle cx="-6" cy="8" r="1.2" fill="#b8860b"/>
    <circle cx="0" cy="8" r="1.2" fill="#b8860b"/>
    <circle cx="6" cy="8" r="1.2" fill="#b8860b"/>
  </g>`,

  lh_shield: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <path d="M-20 -30 L20 -30 L20 -10 Q0 15 -20 -10 Z" fill="#7f8c8d" stroke="#5a6a6a" stroke-width="1"/>
    <path d="M-20 -30 L0 -30 L0 15 Q-10 0 -20 -10 Z" fill="#95a5a6" opacity="0.4"/>
    <path d="M-20 -30 L20 -30" stroke="#e74c3c" stroke-width="2.5"/>
    <path d="M-14 -22 L14 -22 M-8 -14 L8 -14" stroke="#fff" stroke-width="1.5"/>
    <path d="M0 -28 L0 -14" stroke="#fff" stroke-width="1.5"/>
    <path d="M-16 -30 L-16 -22 L-12 -22" stroke="#5a6a6a" stroke-width="0.6" fill="none"/>
    <path d="M16 -30 L16 -22 L12 -22" stroke="#5a6a6a" stroke-width="0.6" fill="none"/>
  </g>`,

  lh_sword: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <line x1="0" y1="-8" x2="0" y2="-90" stroke="#bdc3c7" stroke-width="4.5"/>
    <line x1="-1.5" y1="-8" x2="-1.5" y2="-88" stroke="#fff" stroke-width="1" opacity="0.5"/>
    <path d="M0 -90 L-4 -80 L0 -75 L4 -80 Z" fill="#bdc3c7" stroke="#888" stroke-width="0.4"/>
    <path d="M-2 -88 L0 -82 L2 -88" stroke="#fff" stroke-width="0.5" fill="none" opacity="0.6"/>
    <rect x="-10" y="-6" width="20" height="5" rx="1" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.4"/>
    <circle cx="0" cy="6" r="3.5" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <circle cx="0" cy="6" r="1" fill="#fff" opacity="0.6"/>
  </g>`,

  lh_flag_ussr: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <line x1="0" y1="0" x2="0" y2="-85" stroke="#888" stroke-width="2.5"/>
    <line x1="0" y1="-85" x2="0" y2="-5" stroke="#aaa" stroke-width="0.8" opacity="0.5"/>
    <rect x="-42" y="-85" width="42" height="26" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-42" y="-85" width="42" height="3" fill="#e74c3c" opacity="0.5"/>
    <text x="-21" y="-65" text-anchor="middle" font-size="14" fill="#f1c40f">☭</text>
    <circle cx="0" cy="-85" r="2.5" fill="#666"/>
  </g>`,

  lh_briefcase: `<g transform="translate(55, 197) rotate(-22) scale(2.2)">
    <rect x="-22" y="-32" width="44" height="32" rx="3" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="-22" y="-32" width="44" height="4" fill="#3d5060" opacity="0.6"/>
    <rect x="-22" y="-22" width="44" height="3" fill="#34495e"/>
    <circle cx="0" cy="-36" r="5" fill="none" stroke="#2c3e50" stroke-width="2.5"/>
    <text x="0" y="-8" text-anchor="middle" font-size="14" fill="#fff" font-weight="900">❄</text>
    <rect x="-3" y="-30" width="6" height="4" fill="#1a252f"/>
    <rect x="-18" y="-30" width="4" height="26" fill="#3d5060" opacity="0.5"/>
  </g>`,

  lh_cat: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <ellipse cx="0" cy="-12" rx="16" ry="18" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <ellipse cx="0" cy="-12" rx="11" ry="14" fill="#f5b041" opacity="0.4"/>
    <path d="M-13 -25 L-15 -38 L-6 -30 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.4"/>
    <path d="M13 -25 L15 -38 L6 -30 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.4"/>
    <circle cx="-5" cy="-16" r="2.5" fill="#222"/>
    <circle cx="5" cy="-16" r="2.5" fill="#222"/>
    <circle cx="-4" cy="-17" r="0.8" fill="#fff"/>
    <circle cx="6" cy="-17" r="0.8" fill="#fff"/>
    <path d="M-3 -8 Q0 -6 3 -8" stroke="#222" stroke-width="0.8" fill="none"/>
    <line x1="-3" y1="-8" x2="-8" y2="-8" stroke="#222" stroke-width="0.4"/>
    <line x1="3" y1="-8" x2="8" y2="-8" stroke="#222" stroke-width="0.4"/>
    <ellipse cx="-4" cy="-11" rx="1.5" ry="1" fill="#d68910" opacity="0.6"/>
    <ellipse cx="4" cy="-11" rx="1.5" ry="1" fill="#d68910" opacity="0.6"/>
  </g>`,

  lh_coffee: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <path d="M-10 -30 L10 -30 L8 -4 L-8 -4 Z" fill="#fff" stroke="#ccc" stroke-width="0.5"/>
    <path d="M-10 -30 L10 -30" stroke="#8b4513" stroke-width="2"/>
    <ellipse cx="0" cy="-28" rx="9" ry="2" fill="#3d1a05"/>
    <ellipse cx="0" cy="-28" rx="6" ry="1.2" fill="#6b3a10" opacity="0.5"/>
    <path d="M10 -22 Q16 -22 16 -16 Q16 -10 10 -10" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M-6 -25 Q0 -22 6 -25" stroke="#c0392b" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M-9 -28 L-8 -6" stroke="#e0e0e0" stroke-width="0.6" opacity="0.5"/>
  </g>`,

  lh_hammer: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-4" y="-50" width="8" height="50" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <rect x="-4" y="-50" width="3" height="50" fill="#a07828" opacity="0.5"/>
    <rect x="-16" y="-56" width="32" height="14" rx="2" fill="#7f8c8d" stroke="#5a6a6a" stroke-width="0.5"/>
    <rect x="-16" y="-56" width="32" height="3" fill="#a8b8b8" opacity="0.5"/>
    <path d="M-14 -54 L14 -54" stroke="#a8b8b8" stroke-width="0.5" opacity="0.6"/>
    <path d="M-14 -44 L14 -44" stroke="#5a6a6a" stroke-width="0.5" opacity="0.6"/>
  </g>`,

  lh_book2: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-18" y="-40" width="36" height="42" rx="2" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="-18" y="-40" width="7" height="42" fill="#1a252f"/>
    <rect x="-16" y="-38" width="2" height="38" fill="#3d5060" opacity="0.4"/>
    <line x1="-6" y1="-32" x2="12" y2="-32" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <line x1="-6" y1="-22" x2="12" y2="-22" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <line x1="-6" y1="-12" x2="12" y2="-12" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <rect x="10" y="-40" width="6" height="12" fill="#e74c3c"/>
  </g>`,

  lh_ball: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <circle cx="0" cy="-20" r="16" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
    <path d="M0 -36 Q12 -26 0 -4 Q-12 -26 0 -36 Z" fill="#1a1a1a"/>
    <path d="M-16 -20 Q-10 -16 0 -20 Q10 -16 16 -20" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M-16 -20 Q-12 -28 -4 -28" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M16 -20 Q12 -28 4 -28" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.5"/>
    <ellipse cx="-6" cy="-28" rx="3" ry="2" fill="#fff" opacity="0.5"/>
  </g>`,

  lh_umbrella: `<g transform="translate(55, 197) rotate(-20) scale(2.2)">
    <line x1="0" y1="0" x2="0" y2="-80" stroke="#333" stroke-width="2"/>
    <path d="M-30 -55 Q-30 -85 0 -85 Q30 -85 30 -55 L30 -52 L-30 -52 Z" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
    <path d="M-30 -55 Q-20 -50 -15 -55 Q-10 -50 0 -55 Q10 -50 15 -55 Q20 -50 30 -55" stroke="#333" stroke-width="0.8" fill="none"/>
    <path d="M-15 -80 Q-20 -70 -30 -55" stroke="#2a2a2a" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M15 -80 Q20 -70 30 -55" stroke="#2a2a2a" stroke-width="0.4" fill="none" opacity="0.5"/>
    <circle cx="0" cy="-85" r="2.5" fill="#333"/>
    <path d="M0 0 Q-6 5 -6 -2" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`,

  lh_laptop: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-22" y="-34" width="44" height="30" rx="2" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="-19" y="-31" width="38" height="24" fill="#3498db"/>
    <rect x="-19" y="-31" width="38" height="8" fill="#2980b9" opacity="0.5"/>
    <path d="M-16 -28 L-12 -28 L-8 -14 M-10 -20 L-4 -20" stroke="#fff" stroke-width="0.6" opacity="0.5" fill="none"/>
    <rect x="-24" y="-4" width="48" height="4" fill="#1a252f"/>
    <path d="M-22 -4 L22 -4" stroke="#34495e" stroke-width="0.5" opacity="0.6"/>
    <circle cx="-18" cy="-30" r="0.8" fill="#fff" opacity="0.5"/>
  </g>`,

  lh_champagne: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-8" y="-40" width="16" height="38" rx="2" fill="#1a4a1a" stroke="#0a2a0a" stroke-width="0.5"/>
    <rect x="-8" y="-40" width="5" height="38" fill="#2e6e2e" opacity="0.5"/>
    <rect x="-5" y="-58" width="10" height="20" fill="#1a4a1a"/>
    <rect x="-5" y="-64" width="10" height="6" fill="#d4ac0d"/>
    <circle cx="0" cy="-70" r="2" fill="#f1c40f" opacity="0.7"/>
    <rect x="-8" y="-18" width="16" height="8" fill="#f1c40f"/>
    <text x="0" y="-12" text-anchor="middle" font-size="5" fill="#1a1a1a" font-weight="900">CH</text>
    <circle cx="-6" cy="-45" r="0.8" fill="#fff" opacity="0.5"/>
    <circle cx="6" cy="-30" r="0.8" fill="#fff" opacity="0.5"/>
  </g>`,

  lh_sushi: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-22" y="-16" width="44" height="14" rx="2" fill="#1a1a1a" stroke="#000" stroke-width="0.4"/>
    <rect x="-22" y="-16" width="44" height="2" fill="#2a2a2a"/>
    <circle cx="-12" cy="-10" r="8" fill="#f5f5f5" stroke="#ddd" stroke-width="0.4"/>
    <circle cx="-12" cy="-10" r="4.5" fill="#e74c3c"/>
    <circle cx="-12" cy="-11" r="1" fill="#fff" opacity="0.5"/>
    <circle cx="2" cy="-10" r="8" fill="#f5f5f5" stroke="#ddd" stroke-width="0.4"/>
    <circle cx="2" cy="-10" r="4.5" fill="#f39c12"/>
    <circle cx="14" cy="-10" r="6" fill="#2ecc71"/>
    <circle cx="14" cy="-10" r="2" fill="#27ae60"/>
    <path d="M-20 -15 L20 -15" stroke="#333" stroke-width="0.4" opacity="0.4"/>
  </g>`,

  lh_pizza: `<g transform="translate(55, 197) rotate(-20) scale(1.8)">
    <path d="M-20 -5 L20 -5 L22 0 L-22 0 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M-20 -5 L0 -45 L20 -5 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M-18 -3 L0 -40 L18 -3" stroke="#d68910" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M-20 -5 L-10 -5 L-4 -25 Z" fill="#f5b041" opacity="0.4"/>
    <circle cx="-8" cy="-22" r="3.5" fill="#c0392b"/>
    <circle cx="8" cy="-22" r="3.5" fill="#c0392b"/>
    <circle cx="0" cy="-32" r="3" fill="#c0392b"/>
    <circle cx="-4" cy="-15" r="2" fill="#c0392b"/>
    <circle cx="4" cy="-12" r="2" fill="#2ecc71"/>
    <circle cx="-10" cy="-10" r="1.5" fill="#2ecc71"/>
    <path d="M-20 -5 L20 -5" stroke="#a0620a" stroke-width="1" opacity="0.5"/>
  </g>`,

  lh_teddy: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <ellipse cx="0" cy="-16" rx="18" ry="20" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <ellipse cx="0" cy="-16" rx="12" ry="14" fill="#a07020" opacity="0.4"/>
    <circle cx="0" cy="-32" r="13" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <circle cx="-9" cy="-42" r="5.5" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.4"/>
    <circle cx="9" cy="-42" r="5.5" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.4"/>
    <circle cx="-9" cy="-42" r="2.5" fill="#5a3a0e"/>
    <circle cx="9" cy="-42" r="2.5" fill="#5a3a0e"/>
    <circle cx="-5" cy="-34" r="2" fill="#1a1a1a"/>
    <circle cx="5" cy="-34" r="2" fill="#1a1a1a"/>
    <circle cx="-4" cy="-35" r="0.6" fill="#fff"/>
    <circle cx="6" cy="-35" r="0.6" fill="#fff"/>
    <ellipse cx="0" cy="-26" rx="4" ry="3" fill="#5a3a0a"/>
    <ellipse cx="0" cy="-26" rx="2" ry="1" fill="#1a1a1a"/>
    <ellipse cx="-6" cy="-25" rx="3" ry="2" fill="#a07020" opacity="0.4"/>
  </g>`,

  lh_case_lucky: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <circle cx="0" cy="-22" r="14" fill="#f1c40f" stroke="#b8860b" stroke-width="1"/>
    <circle cx="0" cy="-22" r="10" fill="#d4ac0d"/>
    <circle cx="0" cy="-22" r="8" fill="#f1c40f" opacity="0.6"/>
    <text x="0" y="-18" text-anchor="middle" font-size="10" fill="#fff" font-weight="900">₽</text>
    <path d="M-8 -26 Q-4 -30 0 -28" stroke="#fff" stroke-width="0.6" fill="none" opacity="0.5"/>
  </g>`,

  lh_case_pepper: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <path d="M-6 -45 Q-2 -50 4 -48 L6 -45 Q8 -20 2 -5 L-2 -5 Q-8 -20 -6 -45 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M-6 -45 L-2 -5 L-2 -45 Z" fill="#e74c3c" opacity="0.5"/>
    <path d="M-3 -40 L-3 -15" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M-3 -47 Q0 -52 3 -48 Q5 -50 7 -47" fill="#2ecc71"/>
  </g>`,

  lh_case_brilliant: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <rect x="-18" y="-22" width="36" height="24" rx="3" fill="#3498db" stroke="#21618c" stroke-width="0.6"/>
    <rect x="-18" y="-22" width="36" height="4" fill="#5dade2" opacity="0.5"/>
    <rect x="-18" y="-14" width="36" height="3" fill="#2874a6"/>
    <circle cx="0" cy="-26" r="5" fill="none" stroke="#3498db" stroke-width="2.5"/>
    <path d="M-10 -10 L-6 -4 L6 -4 L10 -10 Z" fill="#e74c3c" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M-8 -8 L-6 -6 L6 -6 L8 -8" stroke="#fff" stroke-width="0.6" fill="none"/>
    <circle cx="0" cy="-7" r="1.2" fill="#fff" opacity="0.9"/>
  </g>`,

  lh_case_top1_artifact: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <circle cx="0" cy="-25" r="20" fill="#1a0f2e" stroke="#ffd700" stroke-width="2"/>
    <circle cx="0" cy="-25" r="14" fill="#2c1810"/>
    <path d="M0 -38 L4 -30 L13 -30 L6 -24 L9 -15 L0 -20 L-9 -15 L-6 -24 L-13 -30 L-4 -30 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="0" cy="-25" r="3.5" fill="#e74c3c"/>
    <circle cx="0" cy="-25" r="1.2" fill="#fff"/>
  </g>`,

  lh_case_top2_artifact: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <ellipse cx="0" cy="-25" rx="22" ry="20" fill="#ffd700" stroke="#8b0000" stroke-width="2.5"/>
    <ellipse cx="0" cy="-25" rx="16" ry="14" fill="#1a0f2e"/>
    <path d="M0 -40 L5 -30 L16 -28 L8 -21 L10 -10 L0 -16 L-10 -10 L-8 -21 L-16 -28 L-5 -30 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="0" cy="-25" r="3.5" fill="#e74c3c"/>
    <circle cx="-10" cy="-32" r="2" fill="#3498db"/>
    <circle cx="10" cy="-32" r="2" fill="#3498db"/>
    <circle cx="0" cy="-3" r="1.8" fill="#fff"/>
  </g>`,

  lh_gang_banner: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <line x1="0" y1="0" x2="0" y2="-75" stroke="#5a3a1e" stroke-width="2.5"/>
    <path d="M0 -75 L38 -70 L33 -60 L38 -50 L0 -55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <text x="19" y="-60" text-anchor="middle" font-size="9" fill="#f39c12" font-weight="900">ГАНГ</text>
    <circle cx="0" cy="-75" r="2" fill="#3d2a10"/>
  </g>`,

  lh_gang_shield: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <path d="M-20 -30 L20 -30 L20 -8 Q0 16 -20 -8 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2"/>
    <path d="M-20 -30 L0 -30 L0 16 Q-10 0 -20 -8 Z" fill="#34495e" opacity="0.4"/>
    <path d="M-20 -30 L20 -30" stroke="#c0392b" stroke-width="3"/>
    <path d="M-14 -22 L14 -22 M-8 -14 L8 -14" stroke="#f39c12" stroke-width="2"/>
    <path d="M0 -28 L0 -14" stroke="#f39c12" stroke-width="2"/>
    <circle cx="0" cy="-14" r="3" fill="#c0392b"/>
  </g>`,

  lh_gang_trophy: `<g transform="translate(55, 197) rotate(-22) scale(1.8)">
    <path d="M-14 -38 L14 -38 L12 -20 Q0 -14 -12 -20 Z" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>
    <path d="M-14 -38 L-16 -32 Q-16 -25 -10 -22 M14 -38 L16 -32 Q16 -25 10 -22" stroke="#b8860b" stroke-width="1.2" fill="none"/>
    <path d="M-12 -38 L-12 -22 Q0 -18 0 -22 Z" fill="#ffe66d" opacity="0.5"/>
    <rect x="-3" y="-16" width="6" height="10" fill="#b8860b"/>
    <rect x="-8" y="-6" width="16" height="6" rx="1" fill="#8b0000"/>
    <text x="0" y="-25" text-anchor="middle" font-size="10" fill="#8b0000" font-weight="900">🏆</text>
    <path d="M-8 -28 L-4 -28" stroke="#fff" stroke-width="0.6" opacity="0.6"/>
  </g>`,

  // ═══════════════════════════════════════════════════════════
  //  ПРИЧЁСКИ
  // ═══════════════════════════════════════════════════════════

  hair_short_black: `<path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z"
                       fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.4"/>
    <path d="M75 36 Q82 30 92 30" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M108 30 Q118 30 125 36" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M78 42 Q82 40 86 42 M114 42 Q118 40 122 42" stroke="#0a0a0a" stroke-width="0.4" fill="none" opacity="0.4"/>
    <path d="M84 26 Q92 22 100 24" stroke="#2a2a2a" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  hair_curly_brown: `<path d="M70 50 Q68 18 100 14 Q132 18 130 50 Q128 40 100 38 Q72 40 70 50 Z"
                        fill="#5a3a1e" stroke="#3d2810" stroke-width="0.5"/>
    <circle cx="74" cy="36" r="6" fill="#6b4a2a" opacity="0.9"/>
    <circle cx="82" cy="28" r="7" fill="#6b4a2a" opacity="0.9"/>
    <circle cx="94" cy="24" r="7" fill="#6b4a2a" opacity="0.9"/>
    <circle cx="106" cy="24" r="7" fill="#6b4a2a" opacity="0.9"/>
    <circle cx="118" cy="28" r="7" fill="#6b4a2a" opacity="0.9"/>
    <circle cx="126" cy="36" r="6" fill="#6b4a2a" opacity="0.9"/>
    <circle cx="80" cy="42" r="5" fill="#7a5a3a" opacity="0.6"/>
    <circle cx="120" cy="42" r="5" fill="#7a5a3a" opacity="0.6"/>
    <path d="M78 38 Q82 34 86 38" stroke="#3d2810" stroke-width="0.6" fill="none" opacity="0.5"/>
    <circle cx="94" cy="22" r="2" fill="#7a5a3a" opacity="0.4"/>
    <circle cx="106" cy="22" r="2" fill="#7a5a3a" opacity="0.4"/>`,

  hair_long_red: `<path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z"
                     fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M70 50 Q62 90 64 135 Q72 140 78 135 Q74 90 76 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q138 90 136 135 Q128 140 122 135 Q126 90 124 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M74 60 Q68 100 70 130 M126 60 Q132 100 130 130" stroke="#8b0000" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M78 30 Q86 24 94 28 M122 30 Q114 24 106 28" stroke="#e74c3c" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M68 80 Q66 100 68 120" stroke="#8b0000" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  hair_mohawk_blue: `<path d="M88 8 Q92 -2 100 -4 Q108 -2 112 8 L112 20 Q100 16 88 20 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <path d="M84 22 Q90 18 100 18 Q110 18 116 22 L114 48 Q100 44 86 48 Z" fill="#3498db" stroke="#2874a6" stroke-width="0.6"/>
    <path d="M94 10 L100 0 L106 10 M92 16 L100 4 L108 16" stroke="#2c3e50" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M78 42 Q88 40 96 42" stroke="#2980b9" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M104 42 Q112 40 122 42" stroke="#2980b9" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M90 14 L100 2 L110 14" stroke="#5dade2" stroke-width="0.6" fill="none" opacity="0.4"/>`,

  hair_flowing_gold: `<path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z"
                         fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M68 52 Q58 100 60 155 Q60 175 68 180 Q76 175 72 155 Q72 100 76 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M132 52 Q142 100 140 155 Q140 175 132 180 Q124 175 128 155 Q128 100 124 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M72 70 Q65 110 66 150 M128 70 Q135 110 134 150" stroke="#b8860b" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M76 30 Q86 24 96 28 M124 30 Q114 24 104 28" stroke="#f9e079" stroke-width="0.7" fill="none" opacity="0.7"/>
    <ellipse cx="80" cy="40" rx="4" ry="2" fill="#f9e079" opacity="0.5"/>
    <ellipse cx="120" cy="40" rx="4" ry="2" fill="#f9e079" opacity="0.5"/>
    <path d="M62 100 Q60 130 62 160" stroke="#b8860b" stroke-width="0.4" fill="none" opacity="0.4"/>`,

  // ═══════════════════════════════════════════════════════════
  //  ОБУВЬ
  // ═══════════════════════════════════════════════════════════

  shoes_worn: `<ellipse cx="86" cy="378" rx="17" ry="8" fill="#888" stroke="#444" stroke-width="0.6"/>
    <ellipse cx="114" cy="378" rx="17" ry="8" fill="#888" stroke="#444" stroke-width="0.6"/>
    <ellipse cx="86" cy="376" rx="12" ry="5" fill="#a0a0a0" opacity="0.4"/>
    <ellipse cx="114" cy="376" rx="12" ry="5" fill="#a0a0a0" opacity="0.4"/>
    <path d="M73 373 Q86 370 99 373" stroke="#666" stroke-width="0.8" fill="none"/>
    <path d="M101 373 Q114 370 127 373" stroke="#666" stroke-width="0.8" fill="none"/>
    <path d="M80 382 Q86 384 92 382 M108 382 Q114 384 120 382" stroke="#444" stroke-width="0.6" fill="none" opacity="0.6"/>
    <circle cx="82" cy="376" r="1" fill="#555" opacity="0.5"/>
    <circle cx="118" cy="376" r="1" fill="#555" opacity="0.5"/>`,

  shoes_sneakers: `<path d="M69 372 Q69 365 74 362 L98 362 L98 380 Q98 386 92 387 L74 387 Q69 387 69 380 Z" fill="#888" stroke="#555" stroke-width="0.5"/>
    <path d="M102 362 L126 362 Q131 365 131 372 L131 380 Q131 387 126 387 L108 387 Q102 386 102 380 Z" fill="#888" stroke="#555" stroke-width="0.5"/>
    <path d="M69 380 L98 380 M102 380 L131 380" stroke="#fff" stroke-width="1.5"/>
    <path d="M74 368 L92 368 M108 368 L126 368" stroke="#fff" stroke-width="0.8" opacity="0.7"/>
    <circle cx="82" cy="374" r="1.2" fill="#555"/>
    <circle cx="118" cy="374" r="1.2" fill="#555"/>
    <path d="M73 366 Q78 363 83 366" stroke="#aaa" stroke-width="0.6" fill="none"/>
    <path d="M107 366 Q112 363 117 366" stroke="#aaa" stroke-width="0.6" fill="none"/>`,

  shoes_nike: `<path d="M68 372 Q68 363 74 360 L98 360 L98 380 Q98 387 92 388 L72 388 Q68 388 68 380 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/>
    <path d="M102 360 L126 360 Q132 363 132 372 L132 380 Q132 388 126 388 L108 388 Q102 387 102 380 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/>
    <path d="M68 380 L98 380 M102 380 L132 380" stroke="#fff" stroke-width="1.8"/>
    <path d="M70 372 Q80 368 96 372" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M104 372 Q120 368 130 372" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M82 375 L86 378 M118 375 L114 378" stroke="#fff" stroke-width="0.6"/>
    <path d="M73 366 Q78 364 84 366" stroke="#444" stroke-width="0.5" fill="none" opacity="0.6"/>
    <path d="M107 366 Q112 364 118 366" stroke="#444" stroke-width="0.5" fill="none" opacity="0.6"/>`,

  shoes_jordan: `<path d="M66 371 Q66 358 72 355 L98 355 L98 380 Q98 389 90 390 L70 390 Q66 390 66 380 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M102 355 L128 355 Q134 358 134 371 L134 380 Q134 390 130 390 L110 390 Q102 389 102 380 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M66 380 L98 380 M102 380 L134 380" stroke="#1a1a1a" stroke-width="2.2"/>
    <path d="M68 366 L96 366 M104 366 L132 366" stroke="#1a1a1a" stroke-width="1.2"/>
    <path d="M78 355 Q86 348 94 355" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <path d="M106 355 Q114 348 122 355" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <path d="M80 372 L84 375 M116 372 L112 375" stroke="#fff" stroke-width="0.7"/>
    <circle cx="82" cy="373" r="0.8" fill="#fff"/>
    <circle cx="118" cy="373" r="0.8" fill="#fff"/>`,

  shoes_gold: `<path d="M68 372 Q68 363 74 360 L98 360 L98 380 Q98 387 92 388 L72 388 Q68 388 68 380 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M102 360 L126 360 Q132 363 132 372 L132 380 Q132 388 126 388 L108 388 Q102 387 102 380 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M68 380 L98 380 M102 380 L132 380" stroke="#b8860b" stroke-width="2"/>
    <path d="M70 370 L96 370 M104 370 L130 370" stroke="#fff" stroke-width="1" opacity="0.6"/>
    <circle cx="82" cy="374" r="1.5" fill="#fff"/>
    <circle cx="118" cy="374" r="1.5" fill="#fff"/>
    <ellipse cx="80" cy="366" rx="3" ry="1" fill="#fff" opacity="0.7"/>
    <ellipse cx="120" cy="366" rx="3" ry="1" fill="#fff" opacity="0.7"/>`,

  // ═══════════════════════════════════════════════════════════
  //  ТЯНКИ — заглушки для CUSTOM_IMAGES
  // ═══════════════════════════════════════════════════════════

  lh_tyanka: null,
  lh_tyanka2: null,
  rh_miku: null,
  rh_tyanka3: null,
};

// ═══════════════════════════════════════════════════════════
//  ГЛАВНЫЙ РЕНДЕР
// ═══════════════════════════════════════════════════════════
function renderCharacterSVG(outfit, opts = {}) {
  const baseH = opts.height || 300;
  const head = outfit?.head_id?.item_id;
  const body = outfit?.body_id?.item_id;
  const legs = outfit?.legs_id?.item_id;
  const rh = outfit?.right_hand_id?.item_id;
  const lh = outfit?.left_hand_id?.item_id;
  const hair = outfit?.hair_id?.item_id;
  const shoes = outfit?.shoes_id?.item_id;

  const leftCfg = lh ? CUSTOM_IMAGES[lh] : null;
  const rightCfg = rh ? CUSTOM_IMAGES[rh] : null;

  const leftW = leftCfg ? leftCfg.w : 0;
  const rightW = rightCfg ? rightCfg.w : 0;

  let vx = 0, vy = -15, vw = 200, vh = 415;
  if (leftW) { vx = -leftW; vw += leftW; }
  if (rightW) { vw += rightW; }
  const viewBox = `${vx} ${vy} ${vw} ${vh}`;

  let outW, outH;
  if (leftCfg || rightCfg) {
    outH = baseH;
    outW = baseH * (vw / vh);
  } else {
    outW = opts.width || 140;
    outH = opts.height || 280;
  }

  const renderGirl = (cfg) => {
    if (!cfg) return "";
    const x = cfg.side === "left" ? -cfg.w : 200;
    return `<foreignObject x="${x}" y="${cfg.y}" width="${cfg.w}" height="${cfg.h}">
      <img xmlns="http://www.w3.org/1999/xhtml" src="${cfg.url}" style="width:100%;height:100%;object-fit:contain;object-position:center bottom;display:block;" alt="" />
    </foreignObject>`;
  };

  return `<svg viewBox="${viewBox}" width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
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