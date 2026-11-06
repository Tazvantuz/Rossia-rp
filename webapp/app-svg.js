// app-svg.js
const SKIN = "#e8b48a", SKIN_DARK = "#d4a17a", SKIN_LIGHT = "#f0c4a0";

// ═══ КАСТОМНЫЕ КАРТИНКИ (ТЯНКИ) ═══
// w: ширина рамки (viewBox units), h: высота, y: верх рамки (0 = макушка, 400 = пятки)
// side: "left" — стоит слева от персонажа, "right" — справа
const CUSTOM_IMAGES = {
    "lh_tyanka":  { url: "/assets/hands/lh_tyanka.png",  side: "left",  y: 0,   w: 230, h: 400 },
    "lh_tyanka2": { url: "/assets/hands/lh_tyanka2.png", side: "left",  y: 160, w: 160, h: 240 },
    "rh_miku":    { url: "/assets/hands/rh_miku.png",    side: "right", y: 0,   w: 230, h: 400 },
    "rh_tyanka3": { url: "/assets/hands/rh_tyanka3.png", side: "right", y: 0,   w: 230, h: 400 }
};

function renderBaseBody() {
  return `
    <!-- НОГИ -->
    <path d="M75 205 L74 365 Q74 376 84 377 L98 377 L99 205 Z"
          fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.5" stroke-linejoin="round"/>
    <path d="M101 205 L101 377 L116 377 Q126 376 126 365 L125 205 Z"
          fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.5" stroke-linejoin="round"/>
    <!-- СТУПНИ базовые (видны если нет обуви) -->
    <ellipse cx="86" cy="380" rx="15" ry="6" fill="${SKIN_DARK}"/>
    <ellipse cx="114" cy="380" rx="15" ry="6" fill="${SKIN_DARK}"/>
    <!-- ТОРС -->
    <path d="M72 100 Q68 100 68 110 L70 205 L130 205 L132 110 Q132 100 128 100 Z"
          fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.5" stroke-linejoin="round"/>
    <!-- ключицы -->
    <path d="M84 108 Q100 112 116 108" stroke="${SKIN_DARK}" stroke-width="0.6" fill="none" opacity="0.5"/>
    <!-- ШЕЯ -->
    <rect x="90" y="78" width="20" height="24" fill="${SKIN}"/>
    <!-- ПЛЕЧИ -->
    <ellipse cx="70" cy="106" rx="13" ry="11" fill="${SKIN}"/>
    <ellipse cx="130" cy="106" rx="13" ry="11" fill="${SKIN}"/>
    <!-- ЛЕВАЯ РУКА (визуально на экране слева) -->
    <path d="M68 105 Q56 115 52 145 L48 185 Q46 195 54 197 L62 196 Q66 190 64 175 L66 140 L74 118 Z"
          fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.5" stroke-linejoin="round"/>
    <!-- левый кулак -->
    <ellipse cx="56" cy="197" rx="10" ry="9" fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.4"/>
    <path d="M49 195 Q49 200 56 202 Q63 200 63 195" stroke="${SKIN_DARK}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <!-- ПРАВАЯ РУКА (визуально справа) -->
    <path d="M132 105 Q144 115 148 145 L152 185 Q154 195 146 197 L138 196 Q134 190 136 175 L134 140 L126 118 Z"
          fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.5" stroke-linejoin="round"/>
    <!-- правый кулак -->
    <ellipse cx="144" cy="197" rx="10" ry="9" fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.4"/>
    <path d="M137 195 Q137 200 144 202 Q151 200 151 195" stroke="${SKIN_DARK}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <!-- ГОЛОВА -->
    <ellipse cx="100" cy="55" rx="28" ry="32" fill="${SKIN}"/>
    <!-- уши -->
    <ellipse cx="72" cy="55" rx="3" ry="6" fill="${SKIN_DARK}"/>
    <ellipse cx="128" cy="55" rx="3" ry="6" fill="${SKIN_DARK}"/>
    <!-- БАЗОВЫЕ ВОЛОСЫ (под причёской и шапкой) -->
    <path d="M72 46 Q72 22 100 20 Q128 22 128 46 Q126 34 100 32 Q74 34 72 46 Z" fill="#3d2818" opacity="0.9"/>
    <!-- ГЛАЗА -->
    <ellipse cx="90" cy="50" rx="3" ry="4" fill="#1a1a1a"/>
    <ellipse cx="110" cy="50" rx="3" ry="4" fill="#1a1a1a"/>
    <circle cx="91" cy="49" r="1" fill="#fff"/>
    <circle cx="111" cy="49" r="1" fill="#fff"/>
    <!-- НОС -->
    <path d="M100 55 L98 63 L102 63 Z" fill="${SKIN_DARK}" opacity="0.6"/>
    <!-- РОТ -->
    <path d="M92 72 Q100 76 108 72" stroke="#a0663c" stroke-width="2" fill="none" stroke-linecap="round"/>
  `;
}

// ═══════════════════════════════════════════════════════════════
//  ПРЕДМЕТЫ
// ═══════════════════════════════════════════════════════════════

const ITEMS_SVG = {

  // ═══════════════════════════════════════════════════════════
  //  ГОЛОВА (h_*)
  // ═══════════════════════════════════════════════════════════
  h_cig: `<g transform="translate(115, 70) rotate(-15)">
    <rect x="0" y="-2" width="32" height="4" rx="1.5" fill="#f5f5f5" stroke="#ccc" stroke-width="0.4"/>
    <rect x="4" y="-2" width="12" height="4" fill="#d4a97a"/>
    <circle cx="32" cy="0" r="3" fill="#ff6600" opacity="0.9"/>
    <circle cx="32" cy="0" r="1.5" fill="#ffcc00"/>
    <circle cx="35" cy="-4" r="2" fill="#bbb" opacity="0.4"/>
  </g>`,

  h_cap: `<path d="M72 44 Q100 18 128 44 L128 50 Q100 48 72 50 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M128 44 L160 50 L158 58 L128 52 Z" fill="#0a0a0a"/>
    <circle cx="100" cy="20" r="2.5" fill="#333"/>
    <path d="M74 47 Q100 44 126 47" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>`,

  h_ushanka: `<path d="M70 40 Q100 18 130 40 L130 48 Q100 46 70 48 Z" fill="#6b4a2a"/>
    <path d="M70 40 L62 56 Q58 74 65 84 L76 82 Q71 70 73 56 L75 48 Z" fill="#5a3d20"/>
    <path d="M130 40 L138 56 Q142 74 135 84 L124 82 Q129 70 127 56 L125 48 Z" fill="#5a3d20"/>
    <path d="M76 42 Q100 32 124 42" stroke="#8b6034" stroke-width="1" fill="none" opacity="0.6"/>
    <circle cx="100" cy="16" r="3.5" fill="#5a3d20"/>`,

  h_balaclava: `<path d="M68 50 Q68 20 100 20 Q132 20 132 50 Q132 68 125 82 L75 82 Q68 68 68 50 Z" fill="#0a0a0a"/>
    <ellipse cx="90" cy="52" rx="6" ry="6" fill="${SKIN}"/>
    <ellipse cx="110" cy="52" rx="6" ry="6" fill="${SKIN}"/>
    <circle cx="90" cy="52" r="2.5" fill="#000"/>
    <circle cx="110" cy="52" r="2.5" fill="#000"/>
    <path d="M70 44 Q100 34 130 44" stroke="#222" stroke-width="1.2" fill="none"/>
    <path d="M78 78 Q100 82 122 78" stroke="#222" stroke-width="1" fill="none" opacity="0.6"/>`,

  h_rooster: `<ellipse cx="100" cy="52" rx="31" ry="35" fill="#f5e8c8" stroke="#d4c8a8" stroke-width="0.6"/>
    <path d="M88 20 L92 6 L100 20 L108 6 L112 20 Z" fill="#c0392b"/>
    <circle cx="86" cy="48" r="6" fill="#fff" stroke="#333" stroke-width="0.5"/>
    <circle cx="86" cy="48" r="3" fill="#1a1a1a"/>
    <circle cx="114" cy="48" r="6" fill="#fff" stroke="#333" stroke-width="0.5"/>
    <circle cx="114" cy="48" r="3" fill="#1a1a1a"/>
    <circle cx="86" cy="46" r="1.2" fill="#fff"/>
    <circle cx="114" cy="46" r="1.2" fill="#fff"/>
    <path d="M90 68 L100 78 L110 68 L100 82 Z" fill="#e67e22" stroke="#a0522d" stroke-width="0.6"/>
    <path d="M73 60 Q70 64 74 66" stroke="#c0392b" stroke-width="1.5" fill="none"/>`,

  h_bandana: `<path d="M68 42 Q100 20 132 42 L132 50 Q100 48 68 50 Z" fill="#c0392b" stroke="#a93226" stroke-width="0.5"/>
    <path d="M68 44 L54 62 L60 60 L72 48 Z" fill="#a93226"/>
    <circle cx="84" cy="44" r="1.5" fill="#fff" opacity="0.6"/>
    <circle cx="100" cy="40" r="1.5" fill="#fff" opacity="0.6"/>
    <circle cx="116" cy="44" r="1.5" fill="#fff" opacity="0.6"/>
    <circle cx="92" cy="46" r="1.2" fill="#fff" opacity="0.4"/>
    <circle cx="108" cy="46" r="1.2" fill="#fff" opacity="0.4"/>`,

  h_wig: `<path d="M70 42 Q72 14 100 12 Q128 14 130 42 L130 50 Q100 48 70 50 Z" fill="#c8c8c8"/>
    <ellipse cx="68" cy="58" rx="6" ry="18" fill="#c8c8c8"/>
    <ellipse cx="132" cy="58" rx="6" ry="18" fill="#c8c8c8"/>
    <ellipse cx="100" cy="24" rx="24" ry="6" fill="#a8a8a8" opacity="0.5"/>
    <path d="M78 38 Q88 32 100 34 M122 38 Q112 32 100 34" stroke="#a8a8a8" stroke-width="0.6" fill="none" opacity="0.6"/>`,

  h_crown: `<path d="M72 38 L76 15 L87 28 L100 8 L113 28 L124 15 L128 38 Z"
            fill="#f1c40f" stroke="#b8860b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M72 38 L128 38" stroke="#b8860b" stroke-width="2"/>
    <circle cx="100" cy="22" r="3" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <circle cx="86" cy="27" r="2" fill="#3498db"/>
    <circle cx="114" cy="27" r="2" fill="#3498db"/>
    <path d="M76 36 L124 36" stroke="#fff" stroke-width="0.6" opacity="0.4"/>`,

  h_guy: `<path d="M70 45 Q70 20 100 18 Q130 20 130 45 Q132 62 120 78 L112 84 L100 88 L88 84 L80 78 Q68 62 70 45 Z"
            fill="#f5f5f5" stroke="#d0d0d0" stroke-width="1"/>
    <path d="M80 46 L96 50 M120 46 L104 50" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
    <path d="M86 68 Q100 80 114 68" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M100 64 L103 74" stroke="#c0392b" stroke-width="1.8"/>
    <ellipse cx="100" cy="55" rx="2" ry="1" fill="#000"/>`,

  h_horns: `<path d="M76 36 Q72 18 66 4 Q76 14 82 30 Z" fill="#8b0000" stroke="#4a0000" stroke-width="1"/>
    <path d="M124 36 Q128 18 134 4 Q124 14 118 30 Z" fill="#8b0000" stroke="#4a0000" stroke-width="1"/>
    <path d="M76 30 Q74 18 70 8" stroke="#ff4444" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M124 30 Q126 18 130 8" stroke="#ff4444" stroke-width="0.8" fill="none" opacity="0.7"/>`,

  h_moto: `<ellipse cx="100" cy="50" rx="34" ry="38" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="1"/>
    <ellipse cx="100" cy="42" rx="27" ry="10" fill="#0a0a0a" opacity="0.6"/>
    <path d="M68 58 Q100 70 132 58" stroke="#333" stroke-width="1.5" fill="none"/>
    <ellipse cx="86" cy="52" rx="8" ry="4" fill="#3498db" opacity="0.35"/>
    <ellipse cx="114" cy="52" rx="8" ry="4" fill="#3498db" opacity="0.35"/>
    <path d="M78 44 Q100 38 122 44" stroke="#444" stroke-width="1" fill="none" opacity="0.5"/>`,

  h_gold_crown: `<path d="M66 36 L72 8 L84 24 L100 2 L116 24 L128 8 L134 36 Z"
                  fill="#ffd700" stroke="#b8860b" stroke-width="2" stroke-linejoin="round"/>
    <path d="M66 36 L134 36" stroke="#b8860b" stroke-width="2.5"/>
    <circle cx="100" cy="18" r="4" fill="#e74c3c" stroke="#8b0000" stroke-width="0.7"/>
    <circle cx="84" cy="20" r="2.8" fill="#3498db" stroke="#21618c" stroke-width="0.5"/>
    <circle cx="116" cy="20" r="2.8" fill="#3498db" stroke="#21618c" stroke-width="0.5"/>
    <circle cx="76" cy="28" r="1.5" fill="#fff"/>
    <circle cx="124" cy="28" r="1.5" fill="#fff"/>
    <path d="M70 32 L130 32" stroke="#fff" stroke-width="0.8" opacity="0.5"/>`,

  h_cheburashka: `<circle cx="76" cy="24" r="18" fill="#8b6914" stroke="#5a3a0a" stroke-width="1"/>
    <circle cx="124" cy="24" r="18" fill="#8b6914" stroke="#5a3a0a" stroke-width="1"/>
    <circle cx="76" cy="24" r="12" fill="#a07020"/>
    <circle cx="124" cy="24" r="12" fill="#a07020"/>
    <path d="M70 42 Q100 32 130 42 L130 50 Q100 48 70 50 Z" fill="#6b4a2a"/>`,

  h_bandit: `<ellipse cx="100" cy="52" rx="30" ry="34" fill="#0a0a0a"/>
    <ellipse cx="90" cy="48" rx="6" ry="5" fill="${SKIN}"/>
    <ellipse cx="110" cy="48" rx="6" ry="5" fill="${SKIN}"/>
    <circle cx="90" cy="48" r="2.5" fill="#000"/>
    <circle cx="110" cy="48" r="2.5" fill="#000"/>
    <path d="M86 68 L114 68" stroke="#222" stroke-width="1" opacity="0.6"/>`,

  h_pirate: `<path d="M68 42 Q100 20 132 42 L132 48 Q100 46 68 48 Z" fill="#c0392b"/>
    <path d="M68 44 L55 60 L62 58 L72 48 Z" fill="#a93226"/>
    <circle cx="110" cy="52" r="7" fill="#000" stroke="#333" stroke-width="0.5"/>
    <line x1="103" y1="52" x2="68" y2="45" stroke="#000" stroke-width="1.5"/>
    <circle cx="110" cy="50" r="1" fill="#fff" opacity="0.6"/>`,

  h_fedora: `<ellipse cx="100" cy="42" rx="44" ry="7" fill="#3d2818"/>
    <path d="M72 42 L72 22 Q100 12 128 22 L128 42 Z" fill="#5c3a20"/>
    <path d="M72 38 L128 38" stroke="#3d2818" stroke-width="2.5"/>
    <path d="M74 24 Q100 18 126 24" stroke="#7a5230" stroke-width="0.8" fill="none" opacity="0.6"/>`,

  h_beret: `<ellipse cx="100" cy="32" rx="33" ry="16" fill="#1a1a1a"/>
    <circle cx="100" cy="16" r="3" fill="#1a1a1a"/>
    <ellipse cx="100" cy="30" rx="30" ry="10" fill="#2a2a2a" opacity="0.5"/>`,

  h_vr: `<path d="M65 42 Q100 32 135 42 L135 62 Q100 74 65 62 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.8"/>
    <rect x="75" y="48" width="22" height="13" rx="2" fill="#3498db" stroke="#2874a6" stroke-width="0.5"/>
    <rect x="103" y="48" width="22" height="13" rx="2" fill="#3498db" stroke="#2874a6" stroke-width="0.5"/>
    <path d="M65 52 L55 48 M135 52 L145 48" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="86" cy="54" r="1" fill="#fff" opacity="0.6"/>
    <circle cx="114" cy="54" r="1" fill="#fff" opacity="0.6"/>`,

  h_halo: `<ellipse cx="100" cy="8" rx="26" ry="5" fill="none" stroke="#f1c40f" stroke-width="3"/>
    <ellipse cx="100" cy="8" rx="26" ry="5" fill="#f1c40f" opacity="0.25"/>
    <ellipse cx="100" cy="8" rx="20" ry="3" fill="#fff" opacity="0.3"/>`,

  h_cap_red: `<path d="M72 44 Q100 18 128 44 L128 50 Q100 48 72 50 Z" fill="#c0392b" stroke="#a93226" stroke-width="0.6"/>
    <path d="M128 44 L160 50 L158 58 L128 52 Z" fill="#a93226"/>
    <circle cx="100" cy="20" r="2.5" fill="#7f1d13"/>`,

  h_flower: `<circle cx="118" cy="36" r="6" fill="#e91e63"/>
    <circle cx="112" cy="32" r="4" fill="#f06292"/>
    <circle cx="124" cy="32" r="4" fill="#f06292"/>
    <circle cx="112" cy="40" r="4" fill="#f06292"/>
    <circle cx="124" cy="40" r="4" fill="#f06292"/>
    <circle cx="118" cy="36" r="2.5" fill="#ffeb3b"/>
    <ellipse cx="112" cy="34" rx="1.2" ry="0.6" fill="#fff" opacity="0.6"/>`,

  h_mask_money: `<ellipse cx="100" cy="50" rx="30" ry="15" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.7"/>
    <circle cx="86" cy="50" r="7" fill="${SKIN}"/>
    <circle cx="114" cy="50" r="7" fill="${SKIN}"/>
    <circle cx="86" cy="50" r="2.8" fill="#000"/>
    <circle cx="114" cy="50" r="2.8" fill="#000"/>
    <text x="100" y="57" text-anchor="middle" font-size="13" fill="#4CAF50" font-weight="900">$</text>`,

  // ═══════════════════════════════════════════════════════════
  //  ТЕЛО (b_*)
  // ═══════════════════════════════════════════════════════════
  b_alco: `<path d="M72 102 Q72 98 76 98 L124 98 Q128 98 128 102 L128 205 L72 205 Z" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M76 100 L80 130 M124 100 L120 130" stroke="#e8e8e8" stroke-width="0.8" fill="none"/>
    <path d="M86 98 Q100 108 114 98" stroke="#d0d0d0" stroke-width="1" fill="none"/>
    <ellipse cx="90" cy="155" rx="2" ry="3" fill="#e0e0e0" opacity="0.5"/>`,

  b_aura: `<path d="M70 100 Q68 96 72 96 L128 96 Q132 96 130 100 L130 205 L70 205 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M78 96 Q100 84 122 96" fill="#1a1a1a"/>
    <text x="100" y="160" text-anchor="middle" font-size="14" fill="#f39c12" font-weight="900" letter-spacing="1">AURA</text>
    <text x="100" y="174" text-anchor="middle" font-size="7" fill="#f39c12" font-weight="600" opacity="0.7">FARMING</text>`,

  b_iambog: `<path d="M72 102 Q70 96 74 96 L126 96 Q130 96 128 102 L128 205 L72 205 Z" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M78 96 Q100 84 122 96" fill="#f5f5f5"/>
    <text x="100" y="155" text-anchor="middle" font-size="16" fill="#c0392b" font-weight="900">Я БОГ</text>
    <path d="M82 170 Q100 178 118 170" stroke="#c0392b" stroke-width="1" fill="none" opacity="0.6"/>`,

  b_cage: `<path d="M70 100 Q68 96 72 96 L128 96 Q132 96 130 100 L130 205 L70 205 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M72 96 Q100 82 128 96" fill="#a93226"/>
    <path d="M72 96 Q100 90 128 96" stroke="#8b0000" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M70 120 L130 120 M70 145 L130 145 M70 170 L130 170" stroke="#1a1a1a" stroke-width="1.2" opacity="0.35"/>
    <path d="M85 100 L85 205 M100 100 L100 205 M115 100 L115 205" stroke="#1a1a1a" stroke-width="1.2" opacity="0.35"/>
    <circle cx="96" cy="130" r="1" fill="#fff" opacity="0.5"/>
    <circle cx="108" cy="160" r="1" fill="#fff" opacity="0.5"/>`,

  b_supreme: `<path d="M68 100 Q68 96 72 96 L128 96 Q132 96 132 100 L132 205 L68 205 Z" fill="#c0392b" stroke="#a93226" stroke-width="0.6"/>
    <path d="M76 96 Q100 80 124 96 L124 100 L76 100 Z" fill="#a93226"/>
    <rect x="82" y="150" width="36" height="20" fill="#a93226" stroke="#8b0000" stroke-width="0.5"/>
    <text x="100" y="164" text-anchor="middle" font-size="7" fill="#fff" font-weight="900">SUP</text>
    <path d="M70 100 Q100 90 130 100" stroke="#8b0000" stroke-width="1" fill="none" opacity="0.5"/>`,

  b_armani: `<path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M100 178 L86 100 M100 178 L114 100" stroke="#000" stroke-width="1.5" fill="none"/>
    <path d="M88 100 L92 108 L108 108 L112 100 Z" fill="#fff" opacity="0.9"/>
    <path d="M92 108 L100 145 L108 108" stroke="#fff" stroke-width="0.6" fill="none" opacity="0.5"/>
    <circle cx="100" cy="160" r="1.5" fill="#888"/>
    <circle cx="100" cy="175" r="1.5" fill="#888"/>`,

  b_nf: `<path d="M68 100 Q68 96 72 96 L128 96 Q132 96 132 100 L132 205 L68 205 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 96 Q100 82 124 96" fill="#0a0a0a"/>
    <path d="M70 120 L130 120 M70 145 L130 145 M70 170 L130 170 M70 190 L130 190" stroke="#333" stroke-width="1.2"/>
    <path d="M76 96 Q100 88 124 96" stroke="#444" stroke-width="0.8" fill="none" opacity="0.6"/>`,

  b_leather: `<path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.7"/>
    <path d="M100 178 L84 100 M100 178 L116 100" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M88 100 L92 108 L108 108 L112 100 Z" fill="#2a2a2a"/>
    <path d="M80 120 L88 130 M120 120 L112 130" stroke="#333" stroke-width="1" fill="none" opacity="0.6"/>
    <circle cx="100" cy="190" r="2" fill="#888"/>`,

  b_wedding: `<path d="M72 96 Q70 96 70 100 L70 205 L130 205 L130 100 Q130 96 128 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="#f8f8f8" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M70 205 L58 255 L142 255 L130 205 Z" fill="#f8f8f8" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M80 210 L75 250 M100 210 L100 250 M120 210 L125 250" stroke="#e0e0e0" stroke-width="1" fill="none"/>
    <ellipse cx="100" cy="118" rx="6" ry="4" fill="#fce4ec" opacity="0.7"/>
    <circle cx="100" cy="118" r="2" fill="#fff"/>
    <path d="M70 200 L130 200" stroke="#e8e8e8" stroke-width="1.5"/>`,

  b_vest: `<path d="M72 100 Q72 96 76 96 L124 96 Q128 96 128 100 L128 205 L72 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="78" y="118" width="44" height="30" rx="3" fill="#1a252f" stroke="#0f1519" stroke-width="0.5"/>
    <path d="M80 155 L120 155 M80 172 L120 172" stroke="#1a252f" stroke-width="1.5"/>
    <rect x="90" y="104" width="20" height="7" rx="2" fill="#34495e" stroke="#1a252f" stroke-width="0.4"/>
    <path d="M82 100 Q90 108 100 108 Q110 108 118 100" stroke="#34495e" stroke-width="1" fill="none"/>`,

  b_tuxedo: `<path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="#000"/>
    <path d="M100 178 L86 100 M100 178 L114 100" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M88 96 L100 170 L112 96 Z" fill="#fff"/>
    <path d="M90 100 L100 106 L110 100 L108 108 L100 106 L92 108 Z" fill="#000"/>
    <circle cx="100" cy="150" r="1.8" fill="#fff"/>
    <circle cx="100" cy="165" r="1.8" fill="#fff"/>`,

  b_santa: `<path d="M70 100 Q68 96 72 96 L128 96 Q132 96 130 100 L130 205 L70 205 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M70 96 Q100 82 130 96" stroke="#fff" stroke-width="5" fill="none"/>
    <rect x="70" y="195" width="60" height="10" fill="#fff"/>
    <path d="M75 120 Q85 116 95 120 M105 120 Q115 116 125 120" stroke="#fff" stroke-width="1" fill="none" opacity="0.5"/>
    <circle cx="86" cy="140" r="2" fill="#fff" opacity="0.7"/>
    <circle cx="114" cy="140" r="2" fill="#fff" opacity="0.7"/>
    <circle cx="86" cy="170" r="2" fill="#fff" opacity="0.7"/>
    <circle cx="114" cy="170" r="2" fill="#fff" opacity="0.7"/>`,

  b_tank_usa: `<path d="M72 100 Q70 96 74 96 L126 96 Q130 96 128 100 L128 205 L72 205 Z" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M80 100 Q100 90 120 100" fill="#f5f5f5"/>
    <rect x="76" y="140" width="48" height="30" fill="#c0392b"/>
    <rect x="76" y="140" width="24" height="15" fill="#1c3a7a"/>
    <line x1="76" y1="145" x2="100" y2="145" stroke="#fff" stroke-width="1.5"/>
    <line x1="76" y1="150" x2="100" y2="150" stroke="#fff" stroke-width="1.5"/>
    <circle cx="88" cy="145" r="0.8" fill="#fff" opacity="0.9"/>`,

  b_hoodie: `<path d="M66 100 Q66 94 72 94 L128 94 Q134 94 134 100 L134 205 L66 205 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M74 94 Q100 76 126 94 L126 100 L74 100 Z" fill="#0a0a0a"/>
    <path d="M94 105 L94 135 M106 105 L106 135" stroke="#fff" stroke-width="1.2"/>
    <rect x="82" y="150" width="36" height="24" rx="4" fill="#0a0a0a" stroke="#333" stroke-width="0.6"/>
    <path d="M82 158 L118 158" stroke="#333" stroke-width="0.5" opacity="0.5"/>`,

  b_hawaii: `<path d="M70 96 Q68 96 68 100 L68 205 L132 205 L132 100 Q132 96 130 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="#fff9e6" stroke="#f0e6c0" stroke-width="0.5"/>
    <path d="M78 96 Q100 82 122 96" fill="#fff9e6"/>
    <circle cx="82" cy="132" r="5" fill="#2ecc71"/>
    <circle cx="120" cy="152" r="5" fill="#e91e63"/>
    <circle cx="90" cy="182" r="5" fill="#f39c12"/>
    <circle cx="118" cy="192" r="4" fill="#9b59b6"/>
    <line x1="82" y1="137" x2="80" y2="148" stroke="#2ecc71" stroke-width="1.5"/>
    <line x1="120" y1="157" x2="118" y2="168" stroke="#e91e63" stroke-width="1.5"/>
    <line x1="90" y1="187" x2="88" y2="198" stroke="#f39c12" stroke-width="1.5"/>
    <line x1="118" y1="196" x2="116" y2="205" stroke="#9b59b6" stroke-width="1.5"/>`,

  b_armor: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#7f8c8d" stroke="#5a6a6a" stroke-width="1"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#5a6a6a"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#5a6a6a"/>
    <rect x="84" y="124" width="32" height="60" fill="#5a6a6a" stroke="#4a5a5a" stroke-width="0.6"/>
    <circle cx="100" cy="150" r="9" fill="#e74c3c" stroke="#8b0000" stroke-width="1"/>
    <path d="M96 148 L104 148 M100 144 L100 152" stroke="#8b0000" stroke-width="1"/>
    <rect x="92" y="104" width="16" height="12" fill="#5a6a6a" stroke="#4a5a5a" stroke-width="0.5"/>
    <path d="M82 96 L100 108 L118 96" stroke="#4a5a5a" stroke-width="1" fill="none"/>`,

  b_bomber: `<path d="M68 100 L68 205 L132 205 L132 100 Q120 94 100 94 Q80 94 68 100 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 94 Q100 82 124 94" fill="#1a1a1a"/>
    <path d="M70 118 L130 118" stroke="#444" stroke-width="2"/>
    <path d="M82 94 L82 205 M100 94 L100 205 M118 94 L118 205" stroke="#333" stroke-width="0.8" opacity="0.5"/>
    <rect x="88" y="145" width="24" height="12" fill="#0a0a0a"/>
    <path d="M70 100 L62 118 L70 122 L74 108 Z" fill="#0a0a0a"/>
    <path d="M130 100 L138 118 L130 122 L126 108 Z" fill="#0a0a0a"/>`,

  b_poncho: `<path d="M58 100 Q58 94 68 94 L132 94 Q142 94 142 100 L148 225 L52 225 Z" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.6"/>
    <path d="M58 128 L142 128 M58 158 L142 158 M58 188 L142 188" stroke="#a0522d" stroke-width="2"/>
    <path d="M60 128 L60 225 M80 128 L80 225 M100 128 L100 225 M120 128 L120 225 M140 128 L140 225" stroke="#a0522d" stroke-width="2"/>
    <path d="M68 94 Q100 82 132 94" fill="#8b4513"/>
    <path d="M70 220 L70 228 M80 220 L80 228 M90 220 L90 228 M100 220 L100 228 M110 220 L110 228 M120 220 L120 228 M130 220 L130 228" stroke="#5a2e0a" stroke-width="1" opacity="0.8"/>`,

  b_kimono: `<path d="M70 96 L70 205 L100 205 L100 96 Z" fill="#e91e63"/>
    <path d="M100 96 L100 205 L130 205 L130 96 Z" fill="#e91e63"/>
    <path d="M74 96 L100 128 L126 96" stroke="#f06292" stroke-width="3" fill="none"/>
    <path d="M72 96 L72 96 L58 108 L60 145 L70 145 L72 120 Z" fill="#e91e63" stroke="#c2185b" stroke-width="0.5"/>
    <path d="M128 96 L142 108 L140 145 L130 145 L128 120 Z" fill="#e91e63" stroke="#c2185b" stroke-width="0.5"/>
    <path d="M90 128 L110 128" stroke="#fff" stroke-width="2.5"/>
    <circle cx="100" cy="155" r="5" fill="#f06292"/>
    <circle cx="100" cy="155" r="2.5" fill="#fff"/>`,

  b_jersey: `<path d="M72 100 Q70 96 74 96 L126 96 Q130 96 128 100 L128 205 L72 205 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M80 96 Q100 82 120 96" fill="#1a1a1a"/>
    <text x="100" y="165" text-anchor="middle" font-size="26" fill="#f1c40f" font-weight="900">10</text>
    <path d="M76 100 L76 125 M124 100 L124 125" stroke="#f1c40f" stroke-width="1.2" opacity="0.4"/>`,

  b_dress_red: `<path d="M72 96 Q70 96 70 105 L84 130 L62 240 L138 240 L116 130 L130 105 Q130 96 128 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M70 200 L130 200" stroke="#a93226" stroke-width="2"/>
    <ellipse cx="84" cy="155" rx="3" ry="4" fill="#f8f8f8" opacity="0.5"/>
    <ellipse cx="116" cy="170" rx="3" ry="4" fill="#f8f8f8" opacity="0.5"/>
    <path d="M84 130 Q100 145 116 130" stroke="#8b0000" stroke-width="1" fill="none" opacity="0.6"/>`,

  b_shirt_tie: `<path d="M72 96 Q70 96 70 100 L70 205 L130 205 L130 100 Q130 96 128 96 L118 96 Q115 108 100 108 Q85 108 82 96 Z" fill="#fff" stroke="#e0e0e0" stroke-width="0.5"/>
    <path d="M80 96 Q100 82 120 96" fill="#fff"/>
    <path d="M96 96 L100 108 L104 96" fill="#e0e0e0" opacity="0.4"/>
    <path d="M100 108 L95 118 L100 126 L105 118 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M96 126 L104 126 L108 200 L92 200 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M78 96 L82 130 M122 96 L118 130" stroke="#d0d0d0" stroke-width="0.8" fill="none"/>`,

  // ═══════════════════════════════════════════════════════════
  //  НОГИ (l_*)
  // ═══════════════════════════════════════════════════════════
  l_family: `<path d="M75 200 L75 250 L100 250 L100 200 Z" fill="#3498db"/>
    <path d="M100 200 L100 250 L125 250 L125 200 Z" fill="#3498db"/>
    <path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#2980b9"/>
    <path d="M75 210 L125 210" stroke="#1a6690" stroke-width="1" opacity="0.5"/>`,

  l_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M80 210 L80 358 M84 210 L84 358 M88 210 L88 358" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 210 L106 358 M110 210 L110 358 M114 210 L114 358" stroke="#fff" stroke-width="1.5"/>
    <path d="M75 205 L99 205 M101 205 L125 205" stroke="#333" stroke-width="1"/>`,

  l_ripped: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <ellipse cx="87" cy="255" rx="5" ry="4" fill="${SKIN}"/>
    <ellipse cx="112" cy="290" rx="6" ry="5" fill="${SKIN}"/>
    <ellipse cx="85" cy="320" rx="5" ry="4" fill="${SKIN}"/>
    <ellipse cx="115" cy="340" rx="5" ry="4" fill="${SKIN}"/>
    <path d="M75 205 L125 205" stroke="#2c4566" stroke-width="1.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#b8860b"/>
    <circle cx="112" cy="208" r="1.5" fill="#b8860b"/>`,

  l_shorts: `<path d="M75 200 L75 265 L100 265 L100 200 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M100 200 L100 265 L125 265 L125 200 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#e67e22"/>
    <path d="M82 230 L82 265 M118 230 L118 265" stroke="#d68910" stroke-width="0.6" opacity="0.6"/>`,

  l_levis: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <path d="M75 205 L125 205" stroke="#2c4566" stroke-width="3"/>
    <circle cx="88" cy="208" r="1.5" fill="#b8860b"/>
    <circle cx="112" cy="208" r="1.5" fill="#b8860b"/>
    <path d="M88 214 L88 300 M112 214 L112 300" stroke="#2c4566" stroke-width="0.8" opacity="0.6"/>`,

  l_lampasy: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M96 205 L96 365 M104 205 L104 365" stroke="#e74c3c" stroke-width="2.5"/>
    <path d="M80 205 L80 365 M120 205 L120 365" stroke="#fff" stroke-width="1" opacity="0.5"/>`,

  l_camo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#3a4a2a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#3a4a2a" stroke-width="0.5"/>
    <circle cx="85" cy="230" r="5" fill="#3a4a2a"/>
    <circle cx="90" cy="260" r="6" fill="#6b7b4a"/>
    <circle cx="80" cy="290" r="5" fill="#3a4a2a"/>
    <circle cx="88" cy="330" r="6" fill="#6b7b4a"/>
    <circle cx="110" cy="240" r="5" fill="#3a4a2a"/>
    <circle cx="115" cy="280" r="6" fill="#6b7b4a"/>
    <circle cx="105" cy="310" r="5" fill="#3a4a2a"/>
    <circle cx="112" cy="345" r="6" fill="#6b7b4a"/>`,

  l_classic: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <path d="M75 205 L125 205" stroke="#1a252f" stroke-width="2"/>
    <path d="M87 214 L87 358 M113 214 L113 358" stroke="#1a252f" stroke-width="1"/>`,

  l_leather: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <path d="M80 230 L80 340 M106 230 L106 340" stroke="#333" stroke-width="1"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#444" stroke-width="0.8" stroke-dasharray="2,2"/>`,

  l_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M75 205 L125 205" stroke="#b8860b" stroke-width="3"/>
    <circle cx="100" cy="210" r="3" fill="#fff"/>
    <circle cx="85" cy="240" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="115" cy="280" r="1" fill="#fff" opacity="0.7"/>
    <circle cx="85" cy="320" r="1" fill="#fff" opacity="0.7"/>`,

  l_joggers: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#34495e" stroke="#2c3e50" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#34495e" stroke="#2c3e50" stroke-width="0.5"/>
    <ellipse cx="87" cy="362" rx="12" ry="3" fill="#2c3e50"/>
    <ellipse cx="113" cy="362" rx="12" ry="3" fill="#2c3e50"/>
    <path d="M80 220 L80 340 M120 220 L120 340" stroke="#2c3e50" stroke-width="0.8" opacity="0.6"/>`,

  l_chinos: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#d4a97a" stroke="#b8916a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#d4a97a" stroke="#b8916a" stroke-width="0.5"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#b8916a" stroke-width="0.8"/>
    <path d="M75 205 L125 205" stroke="#a07a5a" stroke-width="1"/>`,

  l_skinny: `<rect x="78" y="205" width="20" height="160" rx="3" fill="#1a1a2e" stroke="#0a0a1e" stroke-width="0.4"/>
    <rect x="102" y="205" width="20" height="160" rx="3" fill="#1a1a2e" stroke="#0a0a1e" stroke-width="0.4"/>
    <path d="M88 220 L88 358 M112 220 L112 358" stroke="#2c3e50" stroke-width="0.6"/>`,

  l_baggy: `<path d="M70 205 Q68 210 70 220 L70 365 L98 365 L98 205 Z" fill="#5a5a5a" stroke="#3d3d3d" stroke-width="0.5"/>
    <path d="M130 205 Q132 210 130 220 L130 365 L102 365 L102 205 Z" fill="#5a5a5a" stroke="#3d3d3d" stroke-width="0.5"/>
    <path d="M70 220 Q100 226 130 220" stroke="#3d3d3d" stroke-width="1" fill="none"/>
    <path d="M75 250 Q75 320 75 360 M125 250 Q125 320 125 360" stroke="#3d3d3d" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  l_overalls: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="70" y="180" width="60" height="30" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="76" y="96" width="8" height="90" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="116" y="96" width="8" height="90" fill="#3d5a80" stroke="#2c4566" stroke-width="0.5"/>
    <rect x="78" y="94" width="8" height="8" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <rect x="114" y="94" width="8" height="8" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M70 190 L130 190" stroke="#2c4566" stroke-width="1"/>`,

  l_kilt: `<path d="M70 195 L130 195 L138 295 L62 295 Z" fill="#1a5c1a" stroke="#0f3d0f" stroke-width="0.6"/>
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

  l_cargo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#4a5b2a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#5a6b3a" stroke="#4a5b2a" stroke-width="0.5"/>
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

  // ═══════════════════════════════════════════════════════════
  //  ПРАВАЯ РУКА (rh_*)
  //  Все предметы крепятся к кисти (145, 197), растут ВПРАВО-ВВЕРХ
  //  через rotate(-30) — предмет рисуется по Y вверх
  // ═══════════════════════════════════════════════════════════
  rh_cig: `<g transform="translate(145, 197) rotate(-20)">
    <rect x="0" y="-2" width="35" height="4" rx="1.5" fill="#f5f5f5" stroke="#ccc" stroke-width="0.4"/>
    <rect x="4" y="-2" width="14" height="4" fill="#d4a97a"/>
    <circle cx="35" cy="0" r="3" fill="#ff6600"/>
    <circle cx="35" cy="0" r="1.5" fill="#ffcc00"/>
    <circle cx="38" cy="-4" r="2" fill="#bbb" opacity="0.4"/>
  </g>`,

  rh_beer: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-8" y="-42" width="16" height="38" rx="3" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <rect x="-5" y="-52" width="10" height="14" rx="1" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.4"/>
    <rect x="-5" y="-58" width="10" height="8" rx="1" fill="#d4ac0d"/>
    <rect x="-8" y="-30" width="16" height="10" fill="#c0392b"/>
    <ellipse cx="0" cy="-8" rx="8" ry="3" fill="#6b4a14"/>
  </g>`,

  rh_baltica: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-7" y="-44" width="14" height="40" rx="2" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="-4" y="-54" width="8" height="14" rx="1" fill="#1a1a1a"/>
    <rect x="-4" y="-60" width="8" height="8" rx="1" fill="#f39c12"/>
    <circle cx="0" cy="-25" r="6" fill="#f39c12" opacity="0.9"/>
    <text x="0" y="-22" text-anchor="middle" font-size="7" fill="#1a1a1a" font-weight="900">9</text>
  </g>`,

  rh_shaverma: `<g transform="translate(145, 197) rotate(-20)">
    <path d="M-10 0 Q-14 -12 -10 -35 Q0 -45 10 -35 Q14 -12 10 0 Z" fill="#f5e6c8" stroke="#d4c8a8" stroke-width="0.6"/>
    <path d="M-6 -18 Q0 -14 6 -18 M-8 -28 Q0 -24 8 -28 M-5 -8 Q0 -5 5 -8" stroke="#c0392b" stroke-width="1.5" fill="none"/>
    <circle cx="-2" cy="-22" r="1.5" fill="#2ecc71"/>
    <circle cx="3" cy="-30" r="1.5" fill="#c0392b"/>
    <circle cx="-4" cy="-34" r="1.2" fill="#2ecc71"/>
    <ellipse cx="0" cy="-38" rx="8" ry="3" fill="#f5e6c8" opacity="0.7"/>
  </g>`,

  rh_rose: `<g transform="translate(145, 197) rotate(-30)">
    <line x1="0" y1="0" x2="0" y2="-55" stroke="#2ecc71" stroke-width="2.5"/>
    <ellipse cx="0" cy="-60" rx="10" ry="12" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <ellipse cx="0" cy="-60" rx="6" ry="7" fill="#e74c3c"/>
    <circle cx="0" cy="-60" r="2.5" fill="#8b0000"/>
    <ellipse cx="-8" cy="-30" rx="5" ry="3" fill="#2ecc71" transform="rotate(-30 -8 -30)"/>
    <ellipse cx="8" cy="-40" rx="5" ry="3" fill="#2ecc71" transform="rotate(30 8 -40)"/>
  </g>`,

  rh_rod: `<g transform="translate(145, 197) rotate(-25)">
    <line x1="0" y1="0" x2="0" y2="-95" stroke="#8b6914" stroke-width="3"/>
    <line x1="0" y1="-95" x2="0" y2="-5" stroke="#a07828" stroke-width="1" opacity="0.6"/>
    <line x1="0" y1="-95" x2="-5" y2="-70" stroke="#888" stroke-width="0.6"/>
    <circle cx="-5" cy="-70" r="3" fill="#c0392b"/>
    <circle cx="0" cy="-95" r="3" fill="#5a3a0a"/>
    <line x1="-8" y1="-5" x2="8" y2="-5" stroke="#5a3a0a" stroke-width="2.5"/>
  </g>`,

  rh_bat: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-4" y="-85" width="8" height="85" rx="3" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <rect x="-7" y="-105" width="14" height="25" rx="5" fill="#a07020" stroke="#6b4a14" stroke-width="0.6"/>
    <rect x="-10" y="-6" width="20" height="6" rx="2" fill="#5a3a0a"/>
    <path d="M-3 -85 L3 -85 M-5 -75 L5 -75 M-6 -60 L6 -60 M-6 -45 L6 -45" stroke="#5a3a0a" stroke-width="0.5" opacity="0.4"/>
    <path d="M-3 -100 L3 -100" stroke="#fff" stroke-width="0.5" opacity="0.3"/>
  </g>`,

  rh_nerf: `<g transform="translate(145, 197) rotate(-15)">
    <rect x="-4" y="-12" width="20" height="8" rx="1.5" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <rect x="16" y="-14" width="14" height="12" rx="2" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <rect x="-6" y="-10" width="6" height="18" rx="2" fill="#e67e22"/>
    <circle cx="4" cy="-4" r="2" fill="#c0392b"/>
    <rect x="-3" y="-18" width="8" height="6" fill="#e67e22"/>
    <rect x="24" y="-12" width="4" height="4" fill="#c0392b"/>
    <path d="M18 -8 L28 -8" stroke="#b87500" stroke-width="0.6"/>
  </g>`,

  rh_flag_rus: `<g transform="translate(145, 197) rotate(-20)">
    <line x1="0" y1="0" x2="0" y2="-85" stroke="#888" stroke-width="2.5"/>
    <rect x="0" y="-85" width="45" height="11" fill="#fff"/>
    <rect x="0" y="-74" width="45" height="11" fill="#3498db"/>
    <rect x="0" y="-63" width="45" height="11" fill="#e74c3c"/>
    <circle cx="0" cy="-85" r="2.5" fill="#666"/>
  </g>`,

  rh_case: `<g transform="translate(145, 197) rotate(-20)">
    <rect x="-16" y="-42" width="32" height="32" rx="3" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.6"/>
    <rect x="-16" y="-32" width="32" height="4" fill="#b8860b"/>
    <circle cx="0" cy="-46" r="5" fill="none" stroke="#8b6914" stroke-width="2.5"/>
    <text x="0" y="-20" text-anchor="middle" font-size="10" fill="#ffd700" font-weight="900">$</text>
    <rect x="-2" y="-28" width="4" height="4" fill="#5a3a0a"/>
  </g>`,

  rh_knife: `<g transform="translate(145, 197) rotate(-20)">
    <rect x="-5" y="-15" width="10" height="15" rx="2" fill="#1a1a1a"/>
    <path d="M-5 -15 L5 -15 L4 -48 L0 -55 L-4 -48 Z" fill="#d4d4d4" stroke="#888" stroke-width="0.5"/>
    <path d="M-4 -48 L4 -48 L4 -45 L-4 -45 Z" fill="#9a9a9a"/>
    <path d="M-2 -30 L2 -30 M-3 -22 L3 -22" stroke="#aaa" stroke-width="0.5" opacity="0.6"/>
    <rect x="-7" y="-2" width="14" height="3" rx="1" fill="#333"/>
  </g>`,

  rh_book: `<g transform="translate(145, 197) rotate(-20)">
    <rect x="-14" y="-42" width="28" height="42" rx="2" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-14" y="-42" width="5" height="42" fill="#8b1a1a"/>
    <line x1="-4" y1="-35" x2="10" y2="-35" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <line x1="-4" y1="-22" x2="10" y2="-22" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <text x="0" y="-10" text-anchor="middle" font-size="6" fill="#fff" font-weight="900" opacity="0.7">BOOK</text>
  </g>`,

  rh_donut: `<g transform="translate(145, 197) rotate(-20)">
    <circle cx="0" cy="-22" r="16" fill="#e67e22" stroke="#b85400" stroke-width="0.6"/>
    <circle cx="0" cy="-22" r="7" fill="#8b4513"/>
    <path d="M-9 -28 Q-6 -33 0 -33 Q6 -33 9 -28 Q6 -31 0 -31 Q-6 -31 -9 -28 Z" fill="#e74c3c"/>
    <path d="M-11 -16 Q-9 -12 0 -12 Q9 -12 11 -16" stroke="#f39c12" stroke-width="1.5" fill="none"/>
    <circle cx="-6" cy="-25" r="0.8" fill="#fff"/>
    <circle cx="5" cy="-22" r="0.8" fill="#fff"/>
  </g>`,

  rh_icecream: `<g transform="translate(145, 197) rotate(-15)">
    <path d="M-5 -40 L5 -40 L3 -8 L-3 -8 Z" fill="#f5deb3" stroke="#d4b888" stroke-width="0.5"/>
    <circle cx="0" cy="-48" r="9" fill="#f06292" stroke="#c2185b" stroke-width="0.4"/>
    <circle cx="-6" cy="-52" r="6" fill="#fce4ec"/>
    <circle cx="6" cy="-52" r="6" fill="#fce4ec"/>
    <circle cx="0" cy="-58" r="5" fill="#e91e63"/>
    <path d="M-3 -40 L3 -40" stroke="#d4b888" stroke-width="0.5"/>
  </g>`,

  rh_glove: `<g transform="translate(145, 197) rotate(-20)">
    <ellipse cx="0" cy="-15" rx="16" ry="18" fill="#c0392b" stroke="#8b1a1a" stroke-width="0.6"/>
    <ellipse cx="0" cy="-30" rx="8" ry="6" fill="#a93226" stroke="#8b1a1a" stroke-width="0.4"/>
    <rect x="-7" y="-2" width="14" height="8" rx="2" fill="#a93226"/>
    <path d="M-10 -20 Q-12 -15 -8 -8" stroke="#8b1a1a" stroke-width="0.8" fill="none"/>
    <path d="M10 -20 Q12 -15 8 -8" stroke="#8b1a1a" stroke-width="0.8" fill="none"/>
  </g>`,

  rh_bag: `<g transform="translate(145, 197) rotate(-20)">
    <path d="M-12 -35 L12 -35 L15 5 L-15 5 Z" fill="#f5f5f5" stroke="#ccc" stroke-width="0.5"/>
    <path d="M-8 -35 Q-8 -44 0 -44 Q8 -44 8 -35" stroke="#888" stroke-width="1.8" fill="none"/>
    <circle cx="-4" cy="-20" r="2" fill="#c0392b"/>
    <circle cx="4" cy="-15" r="2" fill="#e74c3c"/>
    <circle cx="0" cy="-8" r="2" fill="#2ecc71"/>
    <path d="M-10 -30 L10 -30" stroke="#999" stroke-width="0.4" opacity="0.4"/>
  </g>`,

  rh_brass: `<g transform="translate(145, 197) rotate(-20)">
    <ellipse cx="0" cy="-18" rx="12" ry="10" fill="#888" stroke="#444" stroke-width="0.5"/>
    <circle cx="-7" cy="-24" r="3.5" fill="#666" stroke="#333" stroke-width="0.4"/>
    <circle cx="-1" cy="-26" r="3.5" fill="#666" stroke="#333" stroke-width="0.4"/>
    <circle cx="6" cy="-24" r="3.5" fill="#666" stroke="#333" stroke-width="0.4"/>
    <circle cx="10" cy="-18" r="3" fill="#666" stroke="#333" stroke-width="0.4"/>
    <ellipse cx="-3" cy="-15" rx="4" ry="2" fill="#555" opacity="0.6"/>
  </g>`,

  rh_watermelon: `<g transform="translate(145, 197) rotate(-15)">
    <ellipse cx="0" cy="-18" rx="20" ry="17" fill="#2ecc71" stroke="#1a8b4a" stroke-width="0.6"/>
    <path d="M-16 -18 Q0 -28 16 -18" stroke="#1a8b4a" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M-15 -20 Q-8 -22 0 -20 Q8 -22 15 -20" stroke="#1a8b4a" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M-15 -25 Q0 -32 15 -25" fill="#a93226" opacity="0.9"/>
    <circle cx="-5" cy="-27" r="1" fill="#000"/>
    <circle cx="4" cy="-28" r="1" fill="#000"/>
    <circle cx="10" cy="-25" r="1" fill="#000"/>
  </g>`,

  rh_fish: `<g transform="translate(145, 197) rotate(-20)">
    <ellipse cx="0" cy="-20" rx="20" ry="10" fill="#4aa3df" stroke="#2874a6" stroke-width="0.6"/>
    <path d="M18 -20 L28 -28 L28 -12 Z" fill="#2e86c1"/>
    <circle cx="-12" cy="-22" r="2" fill="#1a1a1a"/>
    <path d="M-8 -14 Q0 -11 8 -14" stroke="#2c3e50" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M-16 -20 L-10 -14 M-16 -20 L-10 -26" stroke="#2874a6" stroke-width="0.6" fill="none" opacity="0.5"/>
  </g>`,

  rh_burger: `<g transform="translate(145, 197) rotate(-15)">
    <path d="M-18 -34 Q0 -42 18 -34 Q20 -32 20 -30 L-20 -30 Q-20 -32 -18 -34 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <rect x="-20" y="-30" width="40" height="4" fill="#2ecc71"/>
    <rect x="-19" y="-26" width="38" height="7" fill="#8b4513"/>
    <rect x="-20" y="-19" width="40" height="4" fill="#e74c3c"/>
    <path d="M-18 -15 L18 -15 Q20 -13 20 -10 L-20 -10 Q-20 -13 -18 -15 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <circle cx="-8" cy="-32" r="1" fill="#fff" opacity="0.6"/>
    <circle cx="6" cy="-33" r="1" fill="#fff" opacity="0.6"/>
  </g>`,

  // ═══════════════════════════════════════════════════════════
  //  ЛЕВАЯ РУКА (lh_*)
  //  Все предметы крепятся к кисти (55, 197), растут ВЛЕВО-ВВЕРХ
  //  через rotate(+30)
  // ═══════════════════════════════════════════════════════════
  lh_phone: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-8" y="-40" width="16" height="30" rx="2" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <rect x="-6" y="-37" width="12" height="24" fill="#3498db"/>
    <circle cx="0" cy="-12" r="1.5" fill="#555"/>
    <path d="M-4 -30 L4 -30 M-4 -25 L4 -25 M-4 -20 L4 -20" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
  </g>`,

  lh_wallet: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-14" y="-22" width="28" height="20" rx="2" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.5"/>
    <path d="M-14 -16 L14 -16" stroke="#5a2e0a" stroke-width="1"/>
    <circle cx="8" cy="-12" r="2.5" fill="#f1c40f" stroke="#b8860b" stroke-width="0.3"/>
    <path d="M-10 -20 L10 -20" stroke="#a06030" stroke-width="0.5" opacity="0.6"/>
  </g>`,

  lh_cola: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-7" y="-34" width="14" height="32" rx="2" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-7" y="-34" width="14" height="5" fill="#888"/>
    <text x="0" y="-15" text-anchor="middle" font-size="9" fill="#fff" font-weight="900">C</text>
    <path d="M-5 -8 L5 -8" stroke="#8b0000" stroke-width="0.5" opacity="0.5"/>
  </g>`,

  lh_ext: `<g transform="translate(55, 197) rotate(15)">
    <rect x="-10" y="-45" width="20" height="48" rx="4" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="-10" y="-42" width="20" height="4" fill="#fff"/>
    <rect x="-3" y="-52" width="6" height="8" fill="#333"/>
    <path d="M-3 -52 Q-10 -60 -14 -62" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M3 -52 Q10 -60 14 -62" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <text x="0" y="-20" text-anchor="middle" font-size="8" fill="#fff" font-weight="900">ОГН</text>
  </g>`,

  lh_guitar: `<g transform="translate(55, 197) rotate(15)">
    <ellipse cx="0" cy="-8" rx="20" ry="18" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.6"/>
    <ellipse cx="-2" cy="-28" rx="17" ry="14" fill="#8b4513" stroke="#5a2e0a" stroke-width="0.6"/>
    <circle cx="0" cy="-20" r="7" fill="#1a1a1a"/>
    <circle cx="0" cy="-20" r="3" fill="#3d1a05"/>
    <rect x="-4" y="-70" width="8" height="42" fill="#5a2e0a"/>
    <rect x="-6" y="-80" width="12" height="14" rx="2" fill="#3d1a05" transform="rotate(-10 0 -80)"/>
    <line x1="-3" y1="-70" x2="-3" y2="-10" stroke="#f5deb3" stroke-width="0.5" opacity="0.6"/>
    <line x1="0" y1="-70" x2="0" y2="-10" stroke="#f5deb3" stroke-width="0.5" opacity="0.6"/>
    <line x1="3" y1="-70" x2="3" y2="-10" stroke="#f5deb3" stroke-width="0.5" opacity="0.6"/>
    <rect x="-12" y="6" width="24" height="5" rx="1" fill="#3d1a05"/>
    <circle cx="-6" cy="8" r="1.2" fill="#b8860b"/>
    <circle cx="0" cy="8" r="1.2" fill="#b8860b"/>
    <circle cx="6" cy="8" r="1.2" fill="#b8860b"/>
  </g>`,

  lh_shield: `<g transform="translate(55, 197) rotate(20)">
    <path d="M-20 -30 L20 -30 L20 -10 Q0 15 -20 -10 Z" fill="#7f8c8d" stroke="#5a6a6a" stroke-width="1"/>
    <path d="M-20 -30 L20 -30" stroke="#e74c3c" stroke-width="2.5"/>
    <path d="M-14 -22 L14 -22 M-8 -14 L8 -14" stroke="#fff" stroke-width="1.5"/>
    <path d="M0 -28 L0 -14" stroke="#fff" stroke-width="1.5"/>
    <path d="M-16 -30 L-16 -22 L-12 -22" stroke="#5a6a6a" stroke-width="0.6" fill="none"/>
    <path d="M16 -30 L16 -22 L12 -22" stroke="#5a6a6a" stroke-width="0.6" fill="none"/>
  </g>`,

  lh_sword: `<g transform="translate(55, 197) rotate(25)">
    <line x1="0" y1="-8" x2="0" y2="-90" stroke="#bdc3c7" stroke-width="4.5"/>
    <path d="M0 -90 L-4 -80 L0 -75 L4 -80 Z" fill="#bdc3c7" stroke="#888" stroke-width="0.4"/>
    <path d="M-2 -88 L0 -82 L2 -88" stroke="#fff" stroke-width="0.5" fill="none" opacity="0.6"/>
    <rect x="-10" y="-6" width="20" height="5" rx="1" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.4"/>
    <circle cx="0" cy="6" r="3.5" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <circle cx="0" cy="6" r="1" fill="#fff" opacity="0.6"/>
  </g>`,

  lh_flag_ussr: `<g transform="translate(55, 197) rotate(20)">
    <line x1="0" y1="0" x2="0" y2="-85" stroke="#888" stroke-width="2.5"/>
    <rect x="-42" y="-85" width="42" height="26" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <text x="-21" y="-65" text-anchor="middle" font-size="14" fill="#f1c40f">☭</text>
    <circle cx="0" cy="-85" r="2.5" fill="#666"/>
  </g>`,

  lh_briefcase: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-22" y="-32" width="44" height="32" rx="3" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="-22" y="-22" width="44" height="3" fill="#34495e"/>
    <circle cx="0" cy="-36" r="5" fill="none" stroke="#2c3e50" stroke-width="2.5"/>
    <text x="0" y="-8" text-anchor="middle" font-size="14" fill="#fff" font-weight="900">❄</text>
    <rect x="-3" y="-30" width="6" height="4" fill="#1a252f"/>
  </g>`,

  lh_cat: `<g transform="translate(55, 197) rotate(15)">
    <ellipse cx="0" cy="-12" rx="16" ry="18" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
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

  lh_coffee: `<g transform="translate(55, 197) rotate(20)">
    <path d="M-10 -30 L10 -30 L8 -4 L-8 -4 Z" fill="#fff" stroke="#ccc" stroke-width="0.5"/>
    <path d="M-10 -30 L10 -30" stroke="#8b4513" stroke-width="2"/>
    <ellipse cx="0" cy="-28" rx="9" ry="2" fill="#3d1a05"/>
    <path d="M10 -22 Q16 -22 16 -16 Q16 -10 10 -10" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M-6 -25 Q0 -22 6 -25" stroke="#c0392b" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>`,

  lh_hammer: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-4" y="-50" width="8" height="50" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
    <rect x="-16" y="-56" width="32" height="14" rx="2" fill="#7f8c8d" stroke="#5a6a6a" stroke-width="0.5"/>
    <path d="M-14 -54 L14 -54" stroke="#a8b8b8" stroke-width="0.5" opacity="0.6"/>
  </g>`,

  lh_book2: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-18" y="-40" width="36" height="42" rx="2" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="-18" y="-40" width="7" height="42" fill="#1a252f"/>
    <line x1="-6" y1="-32" x2="12" y2="-32" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <line x1="-6" y1="-22" x2="12" y2="-22" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <line x1="-6" y1="-12" x2="12" y2="-12" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
    <rect x="10" y="-40" width="6" height="12" fill="#e74c3c"/>
  </g>`,

  lh_ball: `<g transform="translate(55, 197) rotate(20)">
    <circle cx="0" cy="-20" r="16" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
    <path d="M0 -36 Q12 -26 0 -4 Q-12 -26 0 -36 Z" fill="#1a1a1a"/>
    <path d="M-16 -20 Q-10 -16 0 -20 Q10 -16 16 -20" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M-16 -20 Q-12 -28 -4 -28" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M16 -20 Q12 -28 4 -28" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.5"/>
  </g>`,

  lh_umbrella: `<g transform="translate(55, 197) rotate(15)">
    <line x1="0" y1="0" x2="0" y2="-80" stroke="#333" stroke-width="2"/>
    <path d="M-30 -55 Q-30 -85 0 -85 Q30 -85 30 -55 L30 -52 L-30 -52 Z" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
    <path d="M-30 -55 Q-20 -50 -15 -55 Q-10 -50 0 -55 Q10 -50 15 -55 Q20 -50 30 -55" stroke="#333" stroke-width="0.8" fill="none"/>
    <circle cx="0" cy="-85" r="2.5" fill="#333"/>
    <path d="M0 0 Q-6 5 -6 -2" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`,

  lh_laptop: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-22" y="-34" width="44" height="30" rx="2" fill="#2c3e50" stroke="#1a252f" stroke-width="0.6"/>
    <rect x="-19" y="-31" width="38" height="24" fill="#3498db"/>
    <path d="M-16 -28 L-12 -28 L-8 -14 M-10 -20 L-4 -20" stroke="#fff" stroke-width="0.6" opacity="0.5" fill="none"/>
    <rect x="-24" y="-4" width="48" height="4" fill="#1a252f"/>
    <path d="M-22 -4 L22 -4" stroke="#34495e" stroke-width="0.5" opacity="0.6"/>
  </g>`,

  lh_champagne: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-8" y="-40" width="16" height="38" rx="2" fill="#1a4a1a" stroke="#0a2a0a" stroke-width="0.5"/>
    <rect x="-5" y="-58" width="10" height="20" fill="#1a4a1a"/>
    <rect x="-5" y="-64" width="10" height="6" fill="#d4ac0d"/>
    <circle cx="0" cy="-70" r="2" fill="#f1c40f" opacity="0.7"/>
    <rect x="-8" y="-18" width="16" height="8" fill="#f1c40f"/>
    <text x="0" y="-12" text-anchor="middle" font-size="5" fill="#1a1a1a" font-weight="900">CH</text>
    <circle cx="-6" cy="-45" r="0.8" fill="#fff" opacity="0.5"/>
    <circle cx="6" cy="-30" r="0.8" fill="#fff" opacity="0.5"/>
  </g>`,

  lh_sushi: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-22" y="-16" width="44" height="14" rx="2" fill="#1a1a1a" stroke="#000" stroke-width="0.4"/>
    <circle cx="-12" cy="-10" r="8" fill="#f5f5f5" stroke="#ddd" stroke-width="0.4"/>
    <circle cx="-12" cy="-10" r="4.5" fill="#e74c3c"/>
    <circle cx="2" cy="-10" r="8" fill="#f5f5f5" stroke="#ddd" stroke-width="0.4"/>
    <circle cx="2" cy="-10" r="4.5" fill="#f39c12"/>
    <circle cx="14" cy="-10" r="6" fill="#2ecc71"/>
    <path d="M-20 -15 L20 -15" stroke="#333" stroke-width="0.4" opacity="0.4"/>
  </g>`,

  lh_pizza: `<g transform="translate(55, 197) rotate(15)">
    <path d="M-20 -5 L20 -5 L22 0 L-22 0 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <path d="M-20 -5 L0 -45 L20 -5 Z" fill="#f39c12" stroke="#d68910" stroke-width="0.5"/>
    <circle cx="-8" cy="-22" r="3.5" fill="#c0392b"/>
    <circle cx="8" cy="-22" r="3.5" fill="#c0392b"/>
    <circle cx="0" cy="-32" r="3" fill="#c0392b"/>
    <circle cx="-4" cy="-15" r="2" fill="#c0392b"/>
    <circle cx="4" cy="-12" r="2" fill="#2ecc71"/>
    <circle cx="-10" cy="-10" r="1.5" fill="#2ecc71"/>
    <path d="M-20 -5 L20 -5" stroke="#a0620a" stroke-width="1" opacity="0.5"/>
  </g>`,

  lh_teddy: `<g transform="translate(55, 197) rotate(15)">
    <ellipse cx="0" cy="-16" rx="18" ry="20" fill="#8b6914" stroke="#5a3a0a" stroke-width="0.5"/>
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
  </g>`,

  // ═══════════════════════════════════════════════════════════
  //  КЕЙСОВЫЕ (h_case_*, b_case_*, l_case_*, rh_case_*, lh_case_*)
  // ═══════════════════════════════════════════════════════════
  h_case_bandit: `<path d="M72 44 Q100 18 128 44 L128 50 Q100 48 72 50 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M128 44 L160 50 L158 58 L128 52 Z" fill="#0a0a0a"/>
    <ellipse cx="100" cy="48" rx="28" ry="6" fill="#000" opacity="0.4"/>
    <circle cx="100" cy="20" r="2.5" fill="#444"/>`,

  b_case_tracksuit: `<path d="M68 100 L68 205 L132 205 L132 100 Q120 94 100 94 Q80 94 68 100 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 94 Q100 82 124 94" fill="#1a1a1a"/>
    <path d="M75 116 L125 116 M75 126 L125 126" stroke="#fff" stroke-width="2"/>
    <path d="M78 140 L78 205 M88 140 L88 205 M98 140 L98 205 M108 140 L108 205 M118 140 L118 205 M128 140 L128 205" stroke="#fff" stroke-width="0.8" opacity="0.4"/>`,

  l_case_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#fff" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#fff" stroke-width="1.5"/>
    <path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/>
    <circle cx="87" cy="240" r="2" fill="#f39c12"/>
    <circle cx="87" cy="280" r="2" fill="#f39c12"/>
    <circle cx="113" cy="240" r="2" fill="#f39c12"/>
    <circle cx="113" cy="280" r="2" fill="#f39c12"/>`,

  rh_case_knife: `<g transform="translate(145, 197) rotate(-20)">
    <rect x="-6" y="-15" width="12" height="15" rx="2" fill="#1a1a1a" stroke="#000" stroke-width="0.4"/>
    <path d="M-6 -15 L6 -15 L5 -52 L0 -60 L-5 -52 Z" fill="#d4d4d4" stroke="#888" stroke-width="0.5"/>
    <path d="M-5 -52 L5 -52 L5 -48 L-5 -48 Z" fill="#9a9a9a"/>
    <path d="M-3 -40 L3 -40 M-3 -30 L3 -30 M-2 -20 L2 -20" stroke="#aaa" stroke-width="0.4" opacity="0.5"/>
    <rect x="-8" y="-2" width="16" height="3" rx="1" fill="#333"/>
    <circle cx="0" cy="-8" r="2" fill="#1a1a1a"/>
  </g>`,

  h_case_rooster: `<path d="M72 44 Q100 18 128 44 L128 50 Q100 48 72 50 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <path d="M128 44 L160 50 L158 58 L128 52 Z" fill="#a93226"/>
    <path d="M75 47 Q100 44 125 47" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.8"/>
    <circle cx="100" cy="20" r="2.5" fill="#7f1d13"/>`,

  b_case_armani_real: `<path d="M70 100 L70 205 L88 205 L100 178 L112 205 L130 205 L130 100 Q120 94 100 94 Q80 94 70 100 Z" fill="#0a0a0a" stroke="#000" stroke-width="0.6"/>
    <path d="M100 178 L86 100 M100 178 L114 100" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>
    <path d="M88 96 L100 170 L112 96 Z" fill="#1a1a1a"/>
    <path d="M88 100 L92 108 L108 108 L112 100" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <circle cx="100" cy="155" r="2.5" fill="#f39c12"/>
    <circle cx="100" cy="172" r="2.5" fill="#f39c12"/>
    <path d="M84 120 L116 120" stroke="#f39c12" stroke-width="0.8" opacity="0.6"/>`,

  l_case_gold_shorts: `<path d="M72 200 L72 265 L100 265 L100 200 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M100 200 L100 265 L128 265 L128 200 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <path d="M72 200 L128 200 L128 215 L72 215 Z" fill="#d4ac0d"/>
    <path d="M80 240 L92 240 M108 240 L120 240 M80 250 L92 250 M108 250 L120 250" stroke="#fff" stroke-width="1.2" opacity="0.7"/>
    <circle cx="85" cy="225" r="2" fill="#fff"/>
    <circle cx="115" cy="225" r="2" fill="#fff"/>
    <circle cx="100" cy="235" r="2" fill="#fff"/>`,

  rh_case_uzi_gold: `<g transform="translate(145, 197) rotate(-15)">
    <rect x="-6" y="-2" width="26" height="10" rx="1.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <rect x="-6" y="8" width="8" height="16" fill="#d4ac0d" stroke="#b8860b" stroke-width="0.4"/>
    <rect x="12" y="-8" width="5" height="12" fill="#d4ac0d"/>
    <circle cx="18" cy="3" r="2" fill="#b8860b"/>
    <rect x="-10" y="-8" width="22" height="4" rx="1" fill="#ffd700"/>
    <path d="M0 0 L20 0 M0 4 L20 4" stroke="#b8860b" stroke-width="0.4" opacity="0.5"/>
    <rect x="-2" y="14" width="4" height="4" fill="#8b6914"/>
  </g>`,

  h_case_helmet_alpha: `<ellipse cx="100" cy="54" rx="35" ry="37" fill="#0a0a0a" stroke="#000" stroke-width="1"/>
    <path d="M65 48 Q100 38 135 48 L135 54 Q100 64 65 54 Z" fill="#1a1a1a"/>
    <ellipse cx="86" cy="52" rx="9" ry="5" fill="#3498db" opacity="0.5"/>
    <ellipse cx="114" cy="52" rx="9" ry="5" fill="#3498db" opacity="0.5"/>
    <rect x="92" y="18" width="16" height="8" rx="2" fill="#f39c12" stroke="#b87500" stroke-width="0.4"/>
    <circle cx="86" cy="52" r="3.5" fill="#2ecc71"/>
    <circle cx="114" cy="52" r="3.5" fill="#2ecc71"/>
    <path d="M78 75 Q100 80 122 75" stroke="#333" stroke-width="1" fill="none"/>`,

  b_case_dragon_armor: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="1"/>
    <path d="M70 96 L76 108 L76 205 L70 205 Z" fill="#1a252f"/>
    <path d="M130 96 L124 108 L124 205 L130 205 Z" fill="#1a252f"/>
    <rect x="84" y="124" width="32" height="60" fill="#1a252f"/>
    <path d="M84 130 L100 120 L116 130" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M84 180 L100 190 L116 180" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M76 120 Q100 112 124 120" stroke="#f39c12" stroke-width="1.5" fill="none"/>
    <ellipse cx="100" cy="155" rx="9" ry="13" fill="#e74c3c" stroke="#8b0000" stroke-width="1"/>
    <path d="M94 152 L106 152" stroke="#8b0000" stroke-width="0.8"/>
    <path d="M92 108 L100 118 L108 108" stroke="#34495e" stroke-width="0.8" fill="none"/>`,

  l_case_dragon_pants: `<path d="M74 205 L74 365 L100 365 L100 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.7"/>
    <path d="M100 205 L100 365 L126 365 L126 205 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.7"/>
    <path d="M75 205 L125 205" stroke="#e74c3c" stroke-width="2"/>
    <path d="M85 215 L85 360 M115 215 L115 360" stroke="#e74c3c" stroke-width="1" opacity="0.6"/>
    <path d="M80 240 Q92 245 80 260" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <path d="M120 240 Q108 245 120 260" stroke="#f39c12" stroke-width="1.2" fill="none"/>
    <circle cx="85" cy="300" r="2" fill="#f39c12"/>
    <circle cx="115" cy="300" r="2" fill="#f39c12"/>`,

  rh_case_dragon_sword: `<g transform="translate(145, 197) rotate(-22)">
    <rect x="-6" y="-2" width="12" height="18" rx="2" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <rect x="-8" y="-4" width="16" height="4" rx="1" fill="#f39c12"/>
    <path d="M-5 -4 L5 -4 L4 -85 L0 -95 L-4 -85 Z" fill="#d4d4d4" stroke="#888" stroke-width="0.6"/>
    <path d="M-4 -85 L4 -85 L4 -78 L-4 -78 Z" fill="#9a9a9a"/>
    <path d="M0 -95 L3 -85 L0 -78 L-3 -85 Z" fill="#f39c12"/>
    <path d="M-2 -72 L2 -72 M-2 -60 L2 -60 M-2 -48 L2 -48 M-2 -36 L2 -36 M-2 -24 L2 -24" stroke="#f39c12" stroke-width="1.2"/>
    <circle cx="0" cy="-42" r="2.5" fill="#e74c3c"/>
    <path d="M-10 16 L10 16" stroke="#f39c12" stroke-width="2.5"/>
  </g>`,

  lh_case_brilliant: `<g transform="translate(55, 197) rotate(20)">
    <rect x="-18" y="-22" width="36" height="24" rx="3" fill="#3498db" stroke="#21618c" stroke-width="0.6"/>
    <rect x="-18" y="-14" width="36" height="3" fill="#2874a6"/>
    <circle cx="0" cy="-26" r="5" fill="none" stroke="#3498db" stroke-width="2.5"/>
    <path d="M-10 -10 L-6 -4 L6 -4 L10 -10 Z" fill="#e74c3c" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M-8 -8 L-6 -6 L6 -6 L8 -8" stroke="#fff" stroke-width="0.6" fill="none"/>
    <circle cx="0" cy="-7" r="1.2" fill="#fff" opacity="0.9"/>
  </g>`,

  // ═══════ TOP-1 ═══════
  h_case_top1_head: `<path d="M58 28 Q100 0 142 28 L142 55 Q100 72 58 55 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="2.5"/>
    <ellipse cx="100" cy="46" rx="36" ry="20" fill="#2c1810"/>
    <circle cx="80" cy="44" r="5.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="120" cy="44" r="5.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="80" cy="44" r="2.2" fill="#1a1a1a"/>
    <circle cx="120" cy="44" r="2.2" fill="#1a1a1a"/>
    <path d="M100 16 L94 32 L106 32 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="100" cy="14" r="3.5" fill="#e74c3c"/>
    <path d="M60 30 L140 30" stroke="#b8860b" stroke-width="1" opacity="0.5"/>
    <circle cx="70" cy="38" r="2" fill="#f39c12"/>
    <circle cx="130" cy="38" r="2" fill="#f39c12"/>`,

  b_case_top1_body: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.8"/>
    <path d="M85 125 L100 108 L115 125 L115 172 L100 188 L85 172 Z" fill="#2c1810" stroke="#ffd700" stroke-width="1.2"/>
    <ellipse cx="100" cy="148" rx="9" ry="11" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="100" cy="148" r="4.5" fill="#e74c3c"/>
    <circle cx="100" cy="148" r="1.8" fill="#fff" opacity="0.8"/>
    <path d="M76 100 Q100 90 124 100" stroke="#f39c12" stroke-width="2" fill="none"/>
    <path d="M76 200 Q100 208 124 200" stroke="#f39c12" stroke-width="2" fill="none"/>`,

  l_case_top1_legs: `<rect x="72" y="200" width="28" height="170" rx="4" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.5"/>
    <rect x="100" y="200" width="28" height="170" rx="4" fill="#1a0f2e" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M84 214 L84 360 M92 214 L92 360 M108 214 L108 360 M116 214 L116 360" stroke="#ffd700" stroke-width="1.5"/>
    <circle cx="86" cy="240" r="3.5" fill="#e74c3c"/>
    <circle cx="114" cy="240" r="3.5" fill="#e74c3c"/>
    <circle cx="86" cy="310" r="3.5" fill="#e74c3c"/>
    <circle cx="114" cy="310" r="3.5" fill="#e74c3c"/>
    <path d="M72 200 L100 200 M100 200 L128 200" stroke="#f39c12" stroke-width="1.5"/>`,

  rh_case_top1_weapon: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-7" y="-6" width="14" height="24" rx="2" fill="#1a0f2e" stroke="#ffd700" stroke-width="0.8"/>
    <path d="M-6 -6 L6 -6 L5 -88 L0 -100 L-5 -88 Z" fill="#c0c0c0" stroke="#ffd700" stroke-width="1"/>
    <path d="M0 -100 L4 -88 L0 -82 L-4 -88 Z" fill="#ffd700"/>
    <path d="M-2 -72 L2 -72 M-2 -55 L2 -55 M-2 -38 L2 -38 M-2 -22 L2 -22" stroke="#ffd700" stroke-width="1.2"/>
    <circle cx="0" cy="-45" r="2.5" fill="#e74c3c"/>
    <circle cx="0" cy="-45" r="1" fill="#fff" opacity="0.8"/>
    <path d="M-12 20 L12 20" stroke="#ffd700" stroke-width="2.5"/>
  </g>`,

  lh_case_top1_artifact: `<g transform="translate(55, 197) rotate(20)">
    <circle cx="0" cy="-25" r="20" fill="#1a0f2e" stroke="#ffd700" stroke-width="2"/>
    <circle cx="0" cy="-25" r="14" fill="#2c1810"/>
    <path d="M0 -38 L4 -30 L13 -30 L6 -24 L9 -15 L0 -20 L-9 -15 L-6 -24 L-13 -30 L-4 -30 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="0" cy="-25" r="3.5" fill="#e74c3c"/>
    <circle cx="0" cy="-25" r="1.2" fill="#fff"/>
  </g>`,

  // ═══════ TOP-2 ═══════
  h_case_top2_head: `<path d="M55 22 L55 55 Q100 76 145 55 L145 22 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2.5"/>
    <path d="M55 22 L48 2 L70 18 L86 -2 L100 16 L114 -2 L130 18 L152 2 L145 22" fill="none" stroke="#ffd700" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="100" cy="8" r="4.5" fill="#e74c3c" stroke="#8b0000" stroke-width="0.8"/>
    <circle cx="70" cy="14" r="3" fill="#3498db"/>
    <circle cx="130" cy="14" r="3" fill="#3498db"/>
    <circle cx="48" cy="8" r="2" fill="#fff"/>
    <circle cx="152" cy="8" r="2" fill="#fff"/>
    <path d="M74 40 Q100 46 126 40" stroke="#ffd700" stroke-width="2" fill="none"/>`,

  b_case_top2_body: `<path d="M64 90 L136 90 L142 215 L58 215 Z" fill="#8b0000" stroke="#ffd700" stroke-width="2.2"/>
    <path d="M64 90 L84 106 L100 90 L116 106 L136 90" stroke="#ffd700" stroke-width="2" fill="none"/>
    <path d="M74 132 L126 132 M74 162 L126 162 M74 192 L126 192" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="100" cy="146" rx="13" ry="11" fill="#ffd700" stroke="#1a0f2e" stroke-width="1.5"/>
    <text x="100" y="152" text-anchor="middle" font-size="16" fill="#8b0000" font-weight="900">☭</text>
    <circle cx="84" cy="110" r="2.5" fill="#fff"/>
    <circle cx="116" cy="110" r="2.5" fill="#fff"/>
    <circle cx="80" cy="205" r="2" fill="#f39c12"/>
    <circle cx="120" cy="205" r="2" fill="#f39c12"/>`,

  l_case_top2_legs: `<rect x="68" y="195" width="32" height="175" rx="4" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <rect x="100" y="195" width="32" height="175" rx="4" fill="#8b0000" stroke="#ffd700" stroke-width="2"/>
    <path d="M80 210 L80 365 M84 210 L84 365 M88 210 L88 365 M96 210 L96 365" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M104 210 L104 365 M112 210 L112 365 M116 210 L116 365 M120 210 L120 365" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="84" cy="250" rx="6" ry="8" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <ellipse cx="116" cy="250" rx="6" ry="8" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="84" cy="250" r="3" fill="#e74c3c"/>
    <circle cx="116" cy="250" r="3" fill="#e74c3c"/>
    <path d="M68 195 L132 195" stroke="#f39c12" stroke-width="1.5"/>`,

  rh_case_top2_weapon: `<g transform="translate(145, 197) rotate(-20)">
    <rect x="-9" y="-2" width="18" height="24" rx="3" fill="#8b0000" stroke="#ffd700" stroke-width="0.8"/>
    <path d="M-5 -4 L-5 -38 Q0 -60 5 -38 L5 -4 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="0" cy="-44" r="6" fill="#e74c3c" stroke="#1a0f2e" stroke-width="1.2"/>
    <circle cx="0" cy="-44" r="2.5" fill="#fff"/>
    <path d="M-11 20 L11 20" stroke="#ffd700" stroke-width="3"/>
    <path d="M-7 -60 L0 -72 L7 -60" stroke="#ffd700" stroke-width="2" fill="none"/>
    <circle cx="0" cy="-72" r="2.5" fill="#e74c3c"/>
  </g>`,

  lh_case_top2_artifact: `<g transform="translate(55, 197) rotate(20)">
    <ellipse cx="0" cy="-25" rx="22" ry="20" fill="#ffd700" stroke="#8b0000" stroke-width="2.5"/>
    <ellipse cx="0" cy="-25" rx="16" ry="14" fill="#1a0f2e"/>
    <path d="M0 -40 L5 -30 L16 -28 L8 -21 L10 -10 L0 -16 L-10 -10 L-8 -21 L-16 -28 L-5 -30 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.6"/>
    <circle cx="0" cy="-25" r="3.5" fill="#e74c3c"/>
    <circle cx="-10" cy="-32" r="2" fill="#3498db"/>
    <circle cx="10" cy="-32" r="2" fill="#3498db"/>
    <circle cx="0" cy="-3" r="1.8" fill="#fff"/>
  </g>`,

  // ═══════ LEGACY КЕЙСОВЫЕ ═══════
  b_case_chains: `<path d="M70 96 L70 205 L130 205 L130 96 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 96 Q100 82 124 96" fill="#1a1a1a"/>
    <g stroke="#d4d4d4" stroke-width="2" fill="none">
      <circle cx="82" cy="126" r="4"/><circle cx="82" cy="136" r="4"/><circle cx="82" cy="146" r="4"/><circle cx="82" cy="156" r="4"/>
      <circle cx="118" cy="126" r="4"/><circle cx="118" cy="136" r="4"/><circle cx="118" cy="146" r="4"/><circle cx="118" cy="156" r="4"/>
    </g>
    <circle cx="100" cy="120" r="3" fill="#c0c0c0" stroke="#888" stroke-width="0.5"/>
    <path d="M100 123 L100 170" stroke="#c0c0c0" stroke-width="1.2"/>`,

  h_case_crypto: `<circle cx="100" cy="54" r="33" fill="#f39c12" stroke="#b8860b" stroke-width="1.5"/>
    <circle cx="100" cy="54" r="26" fill="#d68910"/>
    <text x="100" y="66" text-anchor="middle" font-size="34" fill="#fff" font-weight="900">₿</text>
    <circle cx="89" cy="48" r="2" fill="#1a1a1a"/>
    <circle cx="111" cy="48" r="2" fill="#1a1a1a"/>
    <path d="M92 70 Q100 74 108 70" stroke="#8b6914" stroke-width="1.5" fill="none"/>`,

  h_case_dragon: `<path d="M68 42 Q100 15 132 42 L132 52 Q100 62 68 52 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="1.2"/>
    <path d="M78 32 Q82 16 88 28 L88 35 Z" fill="#1a252f" stroke="#0a1525" stroke-width="0.5"/>
    <path d="M112 32 Q118 16 122 28 L122 35 Z" fill="#1a252f" stroke="#0a1525" stroke-width="0.5"/>
    <ellipse cx="88" cy="50" rx="9" ry="5" fill="#e74c3c"/>
    <ellipse cx="112" cy="50" rx="9" ry="5" fill="#e74c3c"/>
    <circle cx="88" cy="50" r="2.5" fill="#000"/>
    <circle cx="112" cy="50" r="2.5" fill="#000"/>
    <path d="M94 60 Q100 62 106 60" stroke="#e74c3c" stroke-width="2" fill="none"/>
    <path d="M98 52 L96 62 L100 60 Z" fill="#f39c12"/>`,

  // ═══════════════════════════════════════════════════════════
  //  МАГАЗИН БАНДЫ (gang items)
  // ═══════════════════════════════════════════════════════════
  h_gang_bandana: `<path d="M68 42 Q100 20 132 42 L132 50 Q100 48 68 50 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <path d="M68 44 L54 62 L60 60 L72 48 Z" fill="#0a0a0a"/>
    <text x="100" y="46" text-anchor="middle" font-size="8" fill="#f39c12" font-weight="900">CLAN</text>`,

  h_gang_mask: `<path d="M70 30 Q100 15 130 30 L130 55 Q100 72 70 55 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <ellipse cx="88" cy="45" rx="10" ry="6" fill="#c0392b"/>
    <ellipse cx="112" cy="45" rx="10" ry="6" fill="#c0392b"/>
    <circle cx="88" cy="45" r="3.5" fill="#000"/>
    <circle cx="112" cy="45" r="3.5" fill="#000"/>
    <path d="M85 60 Q100 66 115 60" stroke="#c0392b" stroke-width="1.5" fill="none"/>`,

  h_gang_helmet: `<path d="M64 46 Q64 14 100 8 Q136 14 136 46 L132 72 Q100 82 68 72 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2"/>
    <ellipse cx="84" cy="46" rx="9" ry="5" fill="#c0392b"/>
    <ellipse cx="116" cy="46" rx="9" ry="5" fill="#c0392b"/>
    <path d="M100 12 L94 30 L106 30 Z" fill="#f39c12" stroke="#b87500" stroke-width="0.5"/>
    <circle cx="100" cy="10" r="3.5" fill="#e74c3c"/>
    <path d="M70 60 Q100 65 130 60" stroke="#f39c12" stroke-width="1" fill="none" opacity="0.6"/>`,

  b_gang_shirt: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M76 96 Q100 82 124 96" fill="#a93226"/>
    <text x="100" y="155" text-anchor="middle" font-size="15" fill="#f39c12" font-weight="900">ГАНГ</text>
    <path d="M70 130 L130 130 M70 170 L130 170" stroke="#8b0000" stroke-width="1.2" opacity="0.5"/>
    <circle cx="100" cy="185" r="3" fill="#f39c12"/>`,

  b_gang_jacket: `<path d="M70 96 L130 96 L130 205 L70 205 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.6"/>
    <path d="M76 96 Q100 82 124 96" fill="#0a0a0a"/>
    <path d="M70 96 L100 132 L130 96" stroke="#f39c12" stroke-width="2" fill="none"/>
    <text x="100" y="170" text-anchor="middle" font-size="13" fill="#f39c12" font-weight="900">CLAN</text>
    <circle cx="100" cy="150" r="5" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M82 96 L82 205 M118 96 L118 205" stroke="#333" stroke-width="0.8" opacity="0.5"/>`,

  b_gang_armor: `<path d="M64 90 L136 90 L142 215 L58 215 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2.2"/>
    <path d="M74 112 L126 112 M74 142 L126 142 M74 172 L126 172" stroke="#f39c12" stroke-width="1.5"/>
    <ellipse cx="100" cy="155" rx="13" ry="15" fill="#c0392b" stroke="#8b0000" stroke-width="1"/>
    <text x="100" y="162" text-anchor="middle" font-size="14" fill="#f39c12" font-weight="900">☭</text>
    <path d="M64 90 L100 105 L136 90" stroke="#f39c12" stroke-width="1.5" fill="none" opacity="0.6"/>`,

  l_gang_pants: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <path d="M75 205 L125 205" stroke="#f39c12" stroke-width="2"/>
    <path d="M87 215 L87 358 M113 215 L113 358" stroke="#f39c12" stroke-width="1" opacity="0.6"/>
    <circle cx="87" cy="250" r="2" fill="#f39c12"/>
    <circle cx="113" cy="250" r="2" fill="#f39c12"/>`,

  l_gang_tracksuit: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M75 205 L125 205" stroke="#f39c12" stroke-width="1.5"/>`,

  l_gang_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
    <circle cx="87" cy="250" r="3.5" fill="#8b0000"/>
    <circle cx="113" cy="250" r="3.5" fill="#8b0000"/>
    <circle cx="87" cy="310" r="3.5" fill="#8b0000"/>
    <circle cx="113" cy="310" r="3.5" fill="#8b0000"/>`,

  rh_gang_bat: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-4" y="-78" width="8" height="78" rx="3" fill="#3d2a10" stroke="#1a0f05" stroke-width="0.5"/>
    <rect x="-7" y="-98" width="14" height="22" rx="5" fill="#5a3a1e" stroke="#3d2a10" stroke-width="0.6"/>
    <path d="M-3 -80 L3 -80 M-4 -70 L4 -70 M-4 -55 L4 -55" stroke="#f39c12" stroke-width="1.5"/>
    <rect x="-10" y="-6" width="20" height="6" rx="2" fill="#1a1a1a"/>
    <path d="M-3 -95 L3 -95" stroke="#f39c12" stroke-width="1.5"/>
  </g>`,

  rh_gang_mace: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-4" y="-14" width="8" height="30" fill="#5a3a1e" stroke="#3d2a10" stroke-width="0.5"/>
    <circle cx="0" cy="-32" r="16" fill="#7f8c8d" stroke="#f39c12" stroke-width="1.5"/>
    <circle cx="0" cy="-32" r="5" fill="#c0392b"/>
    <path d="M-14 -44 L-9 -38 M14 -44 L9 -38 M-16 -32 L-10 -32 M16 -32 L10 -32 M-14 -20 L-9 -26 M14 -20 L9 -26" stroke="#f39c12" stroke-width="1.5"/>
    <path d="M-7 -40 L-4 -37 M7 -40 L4 -37" stroke="#a8b8b8" stroke-width="0.8" opacity="0.6"/>
  </g>`,

  rh_gang_halberd: `<g transform="translate(145, 197) rotate(-25)">
    <rect x="-3" y="-85" width="6" height="110" fill="#5a3a1e" stroke="#3d2a10" stroke-width="0.5"/>
    <path d="M-9 -85 L0 -105 L9 -85 L5 -72 L-5 -72 Z" fill="#c0c0c0" stroke="#8b0000" stroke-width="1"/>
    <path d="M0 -105 L3 -72 L-3 -72 Z" fill="#e74c3c"/>
    <path d="M9 -85 L24 -78 L9 -68" stroke="#c0c0c0" stroke-width="2" fill="none"/>
    <path d="M-11 22 L11 22" stroke="#f39c12" stroke-width="2"/>
    <circle cx="0" cy="-88" r="2" fill="#fff" opacity="0.6"/>
  </g>`,

  lh_gang_banner: `<g transform="translate(55, 197) rotate(20)">
    <line x1="0" y1="0" x2="0" y2="-75" stroke="#5a3a1e" stroke-width="2.5"/>
    <path d="M0 -75 L38 -70 L33 -60 L38 -50 L0 -55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <text x="19" y="-60" text-anchor="middle" font-size="9" fill="#f39c12" font-weight="900">ГАНГ</text>
    <circle cx="0" cy="-75" r="2" fill="#3d2a10"/>
  </g>`,

  lh_gang_shield: `<g transform="translate(55, 197) rotate(20)">
    <path d="M-20 -30 L20 -30 L20 -8 Q0 16 -20 -8 Z" fill="#2c3e50" stroke="#f39c12" stroke-width="2"/>
    <path d="M-20 -30 L20 -30" stroke="#c0392b" stroke-width="3"/>
    <path d="M-14 -22 L14 -22 M-8 -14 L8 -14" stroke="#f39c12" stroke-width="2"/>
    <path d="M0 -28 L0 -14" stroke="#f39c12" stroke-width="2"/>
    <circle cx="0" cy="-14" r="3" fill="#c0392b"/>
  </g>`,

  lh_gang_trophy: `<g transform="translate(55, 197) rotate(20)">
    <path d="M-14 -38 L14 -38 L12 -20 Q0 -14 -12 -20 Z" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>
    <path d="M-14 -38 L-16 -32 Q-16 -25 -10 -22 M14 -38 L16 -32 Q16 -25 10 -22" stroke="#b8860b" stroke-width="1.2" fill="none"/>
    <rect x="-3" y="-16" width="6" height="10" fill="#b8860b"/>
    <rect x="-8" y="-6" width="16" height="6" rx="1" fill="#8b0000"/>
    <text x="0" y="-25" text-anchor="middle" font-size="10" fill="#8b0000" font-weight="900">🏆</text>
    <path d="M-8 -28 L-4 -28" stroke="#fff" stroke-width="0.6" opacity="0.6"/>
  </g>`,

  // ═══════════════════════════════════════════════════════════
  //  ПРИЧЁСКИ (hair_*)
  //  Рендерятся ПОД шапкой, ПОВЕРХ тела
  // ═══════════════════════════════════════════════════════════
  hair_short_black: `<path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z"
                       fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.4"/>
    <path d="M75 36 Q82 30 92 30" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M108 30 Q118 30 125 36" stroke="#333" stroke-width="0.5" fill="none" opacity="0.5"/>`,

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
    <path d="M78 38 Q82 34 86 38" stroke="#3d2810" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  hair_long_red: `<path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z"
                     fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M70 50 Q62 90 64 135 Q72 140 78 135 Q74 90 76 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q138 90 136 135 Q128 140 122 135 Q126 90 124 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M74 60 Q68 100 70 130 M126 60 Q132 100 130 130" stroke="#8b0000" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M78 30 Q86 24 94 28 M122 30 Q114 24 106 28" stroke="#e74c3c" stroke-width="0.6" fill="none" opacity="0.5"/>`,

  hair_mohawk_blue: `<path d="M88 8 Q92 -2 100 -4 Q108 -2 112 8 L112 20 Q100 16 88 20 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="0.5"/>
    <path d="M84 22 Q90 18 100 18 Q110 18 116 22 L114 48 Q100 44 86 48 Z" fill="#3498db" stroke="#2874a6" stroke-width="0.6"/>
    <path d="M94 10 L100 0 L106 10 M92 16 L100 4 L108 16" stroke="#2c3e50" stroke-width="0.6" fill="none" opacity="0.7"/>
    <path d="M78 42 Q88 40 96 42" stroke="#2980b9" stroke-width="0.6" fill="none" opacity="0.6"/>
    <path d="M104 42 Q112 40 122 42" stroke="#2980b9" stroke-width="0.6" fill="none" opacity="0.6"/>`,

  hair_flowing_gold: `<path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z"
                         fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M68 52 Q58 100 60 155 Q60 175 68 180 Q76 175 72 155 Q72 100 76 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M132 52 Q142 100 140 155 Q140 175 132 180 Q124 175 128 155 Q128 100 124 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M72 70 Q65 110 66 150 M128 70 Q135 110 134 150" stroke="#b8860b" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M76 30 Q86 24 96 28 M124 30 Q114 24 104 28" stroke="#f9e079" stroke-width="0.7" fill="none" opacity="0.7"/>
    <ellipse cx="80" cy="40" rx="4" ry="2" fill="#f9e079" opacity="0.5"/>
    <ellipse cx="120" cy="40" rx="4" ry="2" fill="#f9e079" opacity="0.5"/>`,

  // ═══════════════════════════════════════════════════════════
  //  ОБУВЬ (shoes_*) — поверх ног, поверх штанов
  // ═══════════════════════════════════════════════════════════
  shoes_worn: `<ellipse cx="86" cy="378" rx="17" ry="8" fill="#888" stroke="#444" stroke-width="0.6"/>
    <ellipse cx="114" cy="378" rx="17" ry="8" fill="#888" stroke="#444" stroke-width="0.6"/>
    <path d="M73 373 Q86 370 99 373" stroke="#666" stroke-width="0.8" fill="none"/>
    <path d="M101 373 Q114 370 127 373" stroke="#666" stroke-width="0.8" fill="none"/>
    <path d="M80 382 Q86 384 92 382 M108 382 Q114 384 120 382" stroke="#444" stroke-width="0.6" fill="none" opacity="0.6"/>`,

  shoes_sneakers: `<path d="M69 372 Q69 365 74 362 L98 362 L98 380 Q98 386 92 387 L74 387 Q69 387 69 380 Z" fill="#888" stroke="#555" stroke-width="0.5"/>
    <path d="M102 362 L126 362 Q131 365 131 372 L131 380 Q131 387 126 387 L108 387 Q102 386 102 380 Z" fill="#888" stroke="#555" stroke-width="0.5"/>
    <path d="M69 380 L98 380 M102 380 L131 380" stroke="#fff" stroke-width="1.5"/>
    <path d="M74 368 L92 368 M108 368 L126 368" stroke="#fff" stroke-width="0.8" opacity="0.7"/>
    <circle cx="82" cy="374" r="1.2" fill="#555"/>
    <circle cx="118" cy="374" r="1.2" fill="#555"/>`,

  shoes_nike: `<path d="M68 372 Q68 363 74 360 L98 360 L98 380 Q98 387 92 388 L72 388 Q68 388 68 380 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/>
    <path d="M102 360 L126 360 Q132 363 132 372 L132 380 Q132 388 126 388 L108 388 Q102 387 102 380 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.5"/>
    <path d="M68 380 L98 380 M102 380 L132 380" stroke="#fff" stroke-width="1.8"/>
    <path d="M70 372 Q80 368 96 372" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M104 372 Q120 368 130 372" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M82 375 L86 378 M118 375 L114 378" stroke="#fff" stroke-width="0.6"/>`,

  shoes_jordan: `<path d="M66 371 Q66 358 72 355 L98 355 L98 380 Q98 389 90 390 L70 390 Q66 390 66 380 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M102 355 L128 355 Q134 358 134 371 L134 380 Q134 390 130 390 L110 390 Q102 389 102 380 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
    <path d="M66 380 L98 380 M102 380 L134 380" stroke="#1a1a1a" stroke-width="2.2"/>
    <path d="M68 366 L96 366 M104 366 L132 366" stroke="#1a1a1a" stroke-width="1.2"/>
    <path d="M78 355 Q86 348 94 355" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <path d="M106 355 Q114 348 122 355" stroke="#8b0000" stroke-width="0.8" fill="none"/>
    <path d="M80 372 L84 375 M116 372 L112 375" stroke="#fff" stroke-width="0.7"/>`,

  shoes_gold: `<path d="M68 372 Q68 363 74 360 L98 360 L98 380 Q98 387 92 388 L72 388 Q68 388 68 380 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M102 360 L126 360 Q132 363 132 372 L132 380 Q132 388 126 388 L108 388 Q102 387 102 380 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.8"/>
    <path d="M68 380 L98 380 M102 380 L132 380" stroke="#b8860b" stroke-width="2"/>
    <path d="M70 370 L96 370 M104 370 L130 370" stroke="#fff" stroke-width="1" opacity="0.6"/>
    <circle cx="82" cy="374" r="1.5" fill="#fff"/>
    <circle cx="118" cy="374" r="1.5" fill="#fff"/>
    <ellipse cx="80" cy="366" rx="3" ry="1" fill="#fff" opacity="0.7"/>
    <ellipse cx="120" cy="366" rx="3" ry="1" fill="#fff" opacity="0.7"/>`,
};

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

  let vx = 0, vw = 200;
  if (leftW) { vx = -leftW; vw += leftW; }
  if (rightW) { vw += rightW; }
  const viewBox = `${vx} 0 ${vw} 400`;

  let outW, outH;
  if (leftCfg || rightCfg) {
    outH = baseH;
    outW = baseH * (vw / 400);
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

  return `<svg viewBox="${viewBox}" width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg">
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