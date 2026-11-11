// app-svg-custom.js
// Кастомные SVG-объекты и картинки-оверлеи.
// app-svg.js НЕ ТРОГАЕМ — только дополняем через Object.assign.

Object.assign(CUSTOM_IMAGES, {
  // Боссы (картинки в руку)
  "rh_pocyk": { url: "/assets/pocyk.png", side: "right", y: 50, w: 200, h: 320 },
  "rh_zelya": { url: "/assets/zelya.png", side: "right", y: 50, w: 200, h: 320 },

  // Новые тянки (Вайфу-кейс)
  "lh_babijon": { url: "/assets/hands/lh_babijon.png", side: "left",  y: 0, w: 230, h: 400 },
  "rh_esdes":   { url: "/assets/hands/rh_esdes.png",   side: "right", y: 0, w: 230, h: 400 },
  "lh_rias":    { url: "/assets/hands/lh_rias.png",    side: "left",  y: 0, w: 230, h: 400 },
  "rh_albedo":  { url: "/assets/hands/rh_albedo.png",  side: "right", y: 0, w: 230, h: 400 },
});

Object.assign(ITEMS_SVG, {
  // Заглушки для всего, что рисуется через CUSTOM_IMAGES (foreignObject)
  rh_pocyk: null,
  rh_zelya: null,
  lh_babijon: null,
  rh_esdes: null,
  lh_rias: null,
  rh_albedo: null,

  // ═══════════════════════════════════════════════════
  //  КЕЙС ЛОХА (5 000₽)
  // ═══════════════════════════════════════════════════
  h_case_loh_kepka: `
    <path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#4a2a1a" stroke="#2a1a08" stroke-width="0.6"/>
    <path d="M74 36 Q100 12 126 36" stroke="#7a4a2a" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#2a1a08"/>
    <text x="100" y="26" text-anchor="middle" font-size="7" fill="#e74c3c" font-weight="900">АЛК</text>
    <path d="M72 42 Q100 40 128 42" stroke="#2a1a08" stroke-width="0.5" fill="none" opacity="0.5"/>
  `,
  b_case_loh_kofta: `
    <path d="M66 90 L134 90 L134 205 L66 205 Z" fill="#8b6a3a" stroke="#5a4020" stroke-width="0.5"/>
    <path d="M104 90 L104 205 L134 205 L134 90 Z" fill="#7a5a2a" opacity="0.5"/>
    <path d="M66 90 Q100 82 134 90" stroke="#5a4020" stroke-width="1" fill="none"/>
    <path d="M82 120 L100 130 L118 120" stroke="#5a4020" stroke-width="1.2" fill="none"/>
    <path d="M82 145 L100 155 L118 145" stroke="#5a4020" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M82 170 L100 180 L118 170" stroke="#5a4020" stroke-width="0.8" fill="none" opacity="0.5"/>
    <circle cx="100" cy="190" r="2" fill="#c0392b"/>
  `,
  l_case_loh_treniki: `
    <rect x="75" y="205" width="24" height="160" rx="4" fill="#2a4a2a" stroke="#1a2a1a" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#2a4a2a" stroke="#1a2a1a" stroke-width="0.5"/>
    <path d="M101 205 L101 365 L125 365 L125 205 Z" fill="#1a2a1a" opacity="0.4"/>
    <path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#e74c3c" stroke-width="1.5"/>
    <path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#e74c3c" stroke-width="1.5"/>
    <path d="M75 205 L125 205" stroke="#1a2a1a" stroke-width="1.5"/>
  `,
  rh_case_loh_shaurma: `
    <g transform="translate(145, 197) rotate(22) scale(2.2)">
      <path d="M-12 0 Q-16 -14 -12 -42 Q0 -52 12 -42 Q16 -14 12 0 Z" fill="#f5e6c8" stroke="#d4c8a8" stroke-width="0.6"/>
      <path d="M-6 -20 Q0 -16 6 -20 M-8 -30 Q0 -26 8 -30" stroke="#c0392b" stroke-width="1.5" fill="none"/>
      <circle cx="-2" cy="-24" r="1.8" fill="#2ecc71"/>
      <circle cx="3" cy="-34" r="1.8" fill="#c0392b"/>
      <circle cx="-4" cy="-34" r="1.4" fill="#2ecc71"/>
    </g>
  `,
  lh_case_loh_kolbasa: `
    <g transform="translate(55, 197) rotate(-22) scale(1.8)">
      <rect x="-14" y="-40" width="28" height="42" rx="10" fill="#c0392b" stroke="#8b0000" stroke-width="0.6"/>
      <rect x="-14" y="-40" width="28" height="5" rx="2" fill="#7a0000"/>
      <rect x="-14" y="-3" width="28" height="5" rx="2" fill="#7a0000"/>
      <path d="M-8 -30 L8 -30 M-8 -22 L8 -22 M-8 -14 L8 -14" stroke="#8b0000" stroke-width="0.4" opacity="0.4"/>
      <text x="0" y="-15" text-anchor="middle" font-size="5" fill="#fff" font-weight="900">ДОК</text>
    </g>
  `,

  // ═══════════════════════════════════════════════════
  //  КЕЙС ДВОРА (50 000₽)
  // ═══════════════════════════════════════════════════
  h_case_dvor_bandana: `
    <path d="M68 36 Q100 12 132 36 L132 42 Q100 40 68 42 Z" fill="#8b1a1a" stroke="#5a0a0a" stroke-width="0.5"/>
    <path d="M68 38 L54 56 L60 54 L72 42 Z" fill="#5a0a0a"/>
    <text x="100" y="38" text-anchor="middle" font-size="7" fill="#f1c40f" font-weight="900">СВОЙ</text>
    <path d="M72 35 Q100 18 128 35" stroke="#a93226" stroke-width="0.5" fill="none" opacity="0.5"/>
  `,
  b_case_dvor_olimp: `
    <path d="M66 90 L134 90 L134 205 L66 205 Z" fill="#1a2a4a" stroke="#0a1a2a" stroke-width="0.5"/>
    <path d="M104 90 L104 205 L134 205 L134 90 Z" fill="#0a1a2a" opacity="0.5"/>
    <path d="M66 90 Q100 82 134 90" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.9"/>
    <path d="M70 110 L130 110 M70 118 L130 118 M70 126 L130 126" stroke="#fff" stroke-width="2"/>
    <path d="M100 110 L100 205" stroke="#fff" stroke-width="0.8" opacity="0.5"/>
  `,
  l_case_dvor_semyorki: `
    <rect x="75" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <rect x="101" y="205" width="24" height="160" rx="4" fill="#0a0a0a" stroke="#000" stroke-width="0.5"/>
    <path d="M75 205 L75 265 L100 265 L100 205 Z" fill="#1a1a1a"/>
    <path d="M75 205 L125 205" stroke="#333" stroke-width="1.5"/>
    <circle cx="88" cy="208" r="1.5" fill="#666"/>
    <circle cx="112" cy="208" r="1.5" fill="#666"/>
    <path d="M78 220 L78 360 M122 220 L122 360" stroke="#333" stroke-width="0.4" opacity="0.4"/>
  `,
  rh_case_dvor_balalaika: `
    <g transform="translate(145, 197) rotate(22) scale(2.0)">
      <path d="M-4 0 L-4 -60 L4 -60 L4 0 Z" fill="#5a3a1e" stroke="#3a2010" stroke-width="0.5"/>
      <path d="M-18 -60 L18 -60 L14 -85 Q0 -90 -14 -85 Z" fill="#d4a97a" stroke="#8b6914" stroke-width="0.6"/>
      <line x1="-12" y1="-85" x2="-4" y2="0" stroke="#f5deb3" stroke-width="0.5"/>
      <line x1="0" y1="-88" x2="0" y2="0" stroke="#f5deb3" stroke-width="0.5"/>
      <line x1="12" y1="-85" x2="4" y2="0" stroke="#f5deb3" stroke-width="0.5"/>
      <circle cx="0" cy="-62" r="2" fill="#3a2010"/>
    </g>
  `,
  lh_case_dvor_avoska: `
    <g transform="translate(55, 197) rotate(-22) scale(1.8)">
      <path d="M-16 -35 L16 -35 L18 5 L-18 5 Z" fill="none" stroke="#3a6a3a" stroke-width="1.5"/>
      <path d="M-16 -35 Q-14 -25 -12 -35 M-8 -35 Q-6 -25 -4 -35 M0 -35 Q2 -25 4 -35 M8 -35 Q10 -25 12 -35" stroke="#3a6a3a" stroke-width="0.8" fill="none" opacity="0.6"/>
      <path d="M-8 -35 Q-8 -44 0 -44 Q8 -44 8 -35" stroke="#3a6a3a" stroke-width="1.5" fill="none"/>
      <circle cx="-8" cy="-15" r="3" fill="#f1c40f"/>
      <circle cx="4" cy="-18" r="3" fill="#f1c40f"/>
      <circle cx="-2" cy="-8" r="3" fill="#f1c40f"/>
      <circle cx="10" cy="-6" r="2.5" fill="#f1c40f"/>
    </g>
  `,

  // ═══════════════════════════════════════════════════
  //  КЕЙС БРИГАДИРА (500 000₽)
  // ═══════════════════════════════════════════════════
  h_case_brig_kepka: `
    <path d="M70 38 Q100 6 130 38 L130 44 Q100 42 70 44 Z" fill="#1a1a1a" stroke="#000" stroke-width="0.6"/>
    <path d="M130 38 Q150 38 160 42 L160 48 Q145 46 130 44 Z" fill="#000"/>
    <path d="M72 42 Q100 40 128 42" stroke="#c0392b" stroke-width="2"/>
    <path d="M74 36 Q100 12 126 36" stroke="#333" stroke-width="0.8" fill="none" opacity="0.5"/>
    <text x="100" y="26" text-anchor="middle" font-size="7" fill="#f39c12" font-weight="900">БРИГ</text>
  `,
  b_case_brig_kosuha: `
    ${SL_LONG_L("#0a0a0a", "#000")}
    ${SL_LONG_R("#0a0a0a", "#000")}
    <path d="M66 90 L88 90 L88 205 L66 205 Z" fill="#0a0a0a"/>
    <path d="M134 90 L112 90 L112 205 L134 205 Z" fill="#0a0a0a"/>
    <path d="M88 90 L100 155 L88 205 L66 205 L66 90 Z" fill="#0a0a0a"/>
    <path d="M112 90 L100 155 L112 205 L134 205 L134 90 Z" fill="#000"/>
    <path d="M88 90 L100 155 L112 90" fill="#1a1a1a"/>
    <path d="M88 90 L80 130 L74 90" fill="#0a0a0a"/>
    <path d="M112 90 L120 130 L126 90" fill="#000"/>
    <path d="M80 90 L100 145 L120 90" stroke="#333" stroke-width="1.5" fill="none"/>
    <circle cx="100" cy="175" r="2" fill="#666"/>
    <circle cx="100" cy="192" r="2" fill="#666"/>
    <path d="M86 90 L84 108 L88 106 Z" fill="#333"/>
    <path d="M114 90 L116 108 L112 106 Z" fill="#333"/>
  `,
  l_case_brig_klesh: `
    <path d="M68 205 Q68 210 70 220 L66 365 L98 365 L100 205 Z" fill="#2a1a3a" stroke="#1a0a2a" stroke-width="0.5"/>
    <path d="M132 205 Q132 210 130 220 L134 365 L102 365 L100 205 Z" fill="#2a1a3a" stroke="#1a0a2a" stroke-width="0.5"/>
    <path d="M102 205 L102 365 L134 365 L130 220 Q132 210 132 205 Z" fill="#1a0a2a" opacity="0.4"/>
    <path d="M68 220 Q100 226 132 220" stroke="#1a0a2a" stroke-width="1" fill="none"/>
    <circle cx="84" cy="215" r="1.5" fill="#666"/>
    <circle cx="116" cy="215" r="1.5" fill="#666"/>
    <path d="M72 260 L72 360 M128 260 L128 360" stroke="#1a0a2a" stroke-width="0.4" opacity="0.5"/>
  `,
  rh_case_brig_osa: `
    <g transform="translate(145, 197) rotate(22) scale(1.8)">
      <rect x="-10" y="-20" width="20" height="15" rx="2" fill="#2a2a2a" stroke="#111" stroke-width="0.5"/>
      <rect x="-8" y="-18" width="16" height="4" fill="#444"/>
      <rect x="-6" y="-5" width="12" height="12" fill="#1a1a1a"/>
      <rect x="-4" y="7" width="8" height="5" rx="1" fill="#c0392b"/>
      <circle cx="0" cy="-8" r="2" fill="#666"/>
      <rect x="8" y="-16" width="10" height="4" fill="#333"/>
    </g>
  `,
  lh_case_brig_chemodan: `
    <g transform="translate(55, 197) rotate(-22) scale(1.8)">
      <rect x="-20" y="-30" width="40" height="32" rx="3" fill="#5a3a1e" stroke="#3a2010" stroke-width="0.6"/>
      <rect x="-20" y="-30" width="40" height="4" fill="#7a5a2a" opacity="0.6"/>
      <rect x="-20" y="-20" width="40" height="3" fill="#7a5a2a"/>
      <circle cx="0" cy="-33" r="4" fill="none" stroke="#5a3a1e" stroke-width="2"/>
      <text x="0" y="-6" text-anchor="middle" font-size="10" fill="#f1c40f" font-weight="900">₽</text>
      <rect x="-3" y="-28" width="6" height="4" fill="#3a2010"/>
    </g>
  `,

  // ═══════════════════════════════════════════════════
  //  КЕЙС СМОТРЯЩЕГО (1 500 000₽)
  // ═══════════════════════════════════════════════════
  h_case_smot_shapka: `
    <path d="M66 34 L72 4 L84 20 L100 -2 L116 20 L128 4 L134 34 Z" fill="#1a0f2e" stroke="#ffd700" stroke-width="2" stroke-linejoin="round"/>
    <path d="M72 4 L76 28 L84 20" fill="#2c1810" opacity="0.6"/>
    <path d="M100 -2 L102 26 L98 26 Z" fill="#2c1810" opacity="0.6"/>
    <path d="M128 4 L124 28 L116 20" fill="#2c1810" opacity="0.6"/>
    <path d="M66 34 L134 34" stroke="#ffd700" stroke-width="2.5"/>
    <circle cx="100" cy="16" r="3.5" fill="#e74c3c" stroke="#8b0000" stroke-width="0.6"/>
    <circle cx="100" cy="16" r="1.5" fill="#ff6b6b"/>
    <circle cx="84" cy="18" r="2.5" fill="#3498db"/>
    <circle cx="116" cy="18" r="2.5" fill="#3498db"/>
    <circle cx="76" cy="26" r="1.2" fill="#fff"/>
    <circle cx="124" cy="26" r="1.2" fill="#fff"/>
  `,
  b_case_smot_shuba: `
    ${SL_FULL_L("#3a1a0a", "#2a0a00", "#5a3a1e")}
    ${SL_FULL_R("#3a1a0a", "#2a0a00", "#5a3a1e")}
    <path d="M56 90 Q56 84 66 84 L134 84 Q144 84 144 90 L150 225 L50 225 Z" fill="#3a1a0a"/>
    <path d="M104 84 L104 225 L150 225 L144 90 Q144 87 140 84 Z" fill="#2a0a00" opacity="0.5"/>
    <path d="M66 84 Q100 72 134 84" fill="#4a2a1a"/>
    <path d="M68 84 Q100 74 132 84" stroke="#5a3a1e" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M60 100 Q100 96 140 100 M58 130 Q100 126 142 130 M58 160 Q100 156 142 160 M60 190 Q100 186 140 190" stroke="#5a3a1e" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M78 90 L78 220 M100 90 L100 220 M122 90 L122 220" stroke="#2a0a00" stroke-width="0.5" opacity="0.4"/>
  `,
  l_case_smot_shtany: `
    <rect x="72" y="200" width="26" height="170" rx="3" fill="#d4ac0d" stroke="#8b6914" stroke-width="0.8"/>
    <rect x="102" y="200" width="26" height="170" rx="3" fill="#d4ac0d" stroke="#8b6914" stroke-width="0.8"/>
    <path d="M102 200 L102 370 L128 370 L128 200 Z" fill="#b8860b" opacity="0.4"/>
    <path d="M72 200 L128 200" stroke="#8b6914" stroke-width="2.5"/>
    <path d="M74 205 L74 360 M126 205 L126 360" stroke="#f9e079" stroke-width="1.5" opacity="0.6"/>
    <circle cx="88" cy="250" r="3" fill="#fff" opacity="0.7"/>
    <circle cx="112" cy="280" r="3" fill="#fff" opacity="0.7"/>
    <circle cx="88" cy="310" r="3" fill="#fff" opacity="0.7"/>
    <circle cx="112" cy="340" r="3" fill="#fff" opacity="0.7"/>
  `,
  rh_case_smot_skipetr: `
    <g transform="translate(145, 197) rotate(22) scale(2.0)">
      <rect x="-4" y="0" width="8" height="60" fill="#d4ac0d" stroke="#8b6914" stroke-width="0.6"/>
      <rect x="-4" y="0" width="3" height="60" fill="#f9e079" opacity="0.5"/>
      <path d="M-12 -8 Q0 -20 12 -8 L8 0 L-8 0 Z" fill="#ffd700" stroke="#8b6914" stroke-width="0.8"/>
      <path d="M-12 -8 Q0 -16 12 -8" stroke="#fff" stroke-width="0.5" fill="none" opacity="0.6"/>
      <circle cx="0" cy="-12" r="4" fill="#e74c3c" stroke="#8b0000" stroke-width="0.5"/>
      <circle cx="0" cy="-12" r="1.5" fill="#ff6b6b"/>
      <path d="M-16 30 L16 30" stroke="#8b6914" stroke-width="2"/>
    </g>
  `,
  lh_case_smot_derzhava: `
    <g transform="translate(55, 197) rotate(-22) scale(1.8)">
      <circle cx="0" cy="-25" r="18" fill="#ffd700" stroke="#8b6914" stroke-width="1"/>
      <circle cx="0" cy="-25" r="14" fill="#d4ac0d" opacity="0.5"/>
      <path d="M0 -43 L4 -35 L12 -35 L6 -29 L8 -21 L0 -25 L-8 -21 L-6 -29 L-12 -35 L-4 -35 Z" fill="#fff" opacity="0.7"/>
      <circle cx="-8" cy="-20" r="2" fill="#3498db"/>
      <circle cx="8" cy="-20" r="2" fill="#3498db"/>
      <circle cx="0" cy="-8" r="2" fill="#3498db"/>
      <path d="M-6 -7 L6 -7" stroke="#8b6914" stroke-width="1"/>
    </g>
  `,
});

console.log("✅ app-svg-custom.js загружен (тянки + 20 кейсовых шмоток + босс зеля)");