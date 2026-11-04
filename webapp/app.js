const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor?.('#17212b'); tg.setBackgroundColor?.('#17212b'); }
const initData = tg?.initData || "";
let state = {
  player: null, location: null, shopItems: [], invItems: [],
  shopFilter: "head", appearanceMode: "shop", casinoGame: "coin",
  casinoLocked: false, casinoLockTime: 0,
};

// ══════════════════════════════════════════════════════════════
//  SVG ПЕРСОНАЖ
// ══════════════════════════════════════════════════════════════
const SKIN = "#e8b48a", SKIN_DARK = "#d4a17a", SKIN_LIGHT = "#f0c4a0";

function renderBaseBody() {
  return `
    <rect x="75" y="200" width="24" height="165" rx="10" fill="${SKIN}"/>
    <rect x="101" y="200" width="24" height="165" rx="10" fill="${SKIN}"/>
    <ellipse cx="87" cy="370" rx="16" ry="8" fill="${SKIN_DARK}"/>
    <ellipse cx="113" cy="370" rx="16" ry="8" fill="${SKIN_DARK}"/>
    <rect x="52" y="100" width="20" height="95" rx="9" fill="${SKIN}"/>
    <rect x="128" y="100" width="20" height="95" rx="9" fill="${SKIN}"/>
    <circle cx="62" cy="197" r="10" fill="${SKIN}"/>
    <circle cx="138" cy="197" r="10" fill="${SKIN}"/>
    <path d="M72 95 L128 95 L130 205 L70 205 Z" fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="0.5"/>
    <path d="M85 130 Q100 135 115 130" stroke="${SKIN_DARK}" stroke-width="0.5" fill="none" opacity="0.6"/>
    <rect x="88" y="78" width="24" height="22" fill="${SKIN}"/>
    <ellipse cx="100" cy="55" rx="28" ry="32" fill="${SKIN}"/>
    <ellipse cx="72" cy="55" rx="3" ry="6" fill="${SKIN_DARK}"/>
    <ellipse cx="128" cy="55" rx="3" ry="6" fill="${SKIN_DARK}"/>
    <ellipse cx="90" cy="50" rx="3" ry="4" fill="#1a1a1a"/>
    <ellipse cx="110" cy="50" rx="3" ry="4" fill="#1a1a1a"/>
    <circle cx="91" cy="49" r="1" fill="#fff"/>
    <circle cx="111" cy="49" r="1" fill="#fff"/>
    <path d="M100 55 L98 63 L102 63 Z" fill="${SKIN_DARK}" opacity="0.6"/>
    <path d="M92 72 Q100 76 108 72" stroke="#a0663c" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="95" cy="35" rx="10" ry="6" fill="${SKIN_LIGHT}" opacity="0.35"/>
  `;
}

const ITEMS_SVG = {
  // ═══ ГОЛОВА — ИСПРАВЛЕНО ПОЗИЦИОНИРОВАНИЕ ═══
  h_cig: `<line x1="115" y1="72" x2="144" y2="68" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="144" cy="68" r="3" fill="#ff6600"/><circle cx="144" cy="68" r="1.5" fill="#ffcc00"/>`,
  h_cap: `<path d="M72 42 Q100 15 128 42 L128 48 L72 48 Z" fill="#1a1a1a"/><path d="M128 42 L158 48 L155 54 L128 48 Z" fill="#0a0a0a"/><circle cx="100" cy="15" r="2" fill="#333"/>`,
  h_ushanka: `<path d="M70 35 Q100 5 130 35 L130 42 Q125 38 120 42 Q110 38 100 42 Q90 38 80 42 Q75 38 70 42 Z" fill="#6b4a2a"/><path d="M70 35 L62 52 Q58 72 64 82 L74 82 Q70 68 72 52 L74 40 Z" fill="#5a3d20"/><path d="M130 35 L138 52 Q142 72 136 82 L126 82 Q130 68 128 52 L126 40 Z" fill="#5a3d20"/><circle cx="100" cy="12" r="3" fill="#5a3d20"/>`,
  h_balaclava: `<ellipse cx="100" cy="55" rx="30" ry="34" fill="#0a0a0a"/><ellipse cx="90" cy="50" rx="5" ry="6" fill="${SKIN}"/><ellipse cx="110" cy="50" rx="5" ry="6" fill="${SKIN}"/><circle cx="90" cy="50" r="2" fill="#000"/><circle cx="110" cy="50" r="2" fill="#000"/>`,
  h_rooster: `<ellipse cx="100" cy="55" rx="30" ry="35" fill="#f5e8c8"/><path d="M90 22 L95 8 L100 22 L105 8 L110 22 Z" fill="#c0392b"/><circle cx="87" cy="48" r="5" fill="#fff"/><circle cx="87" cy="48" r="2.5" fill="#1a1a1a"/><circle cx="113" cy="48" r="5" fill="#fff"/><circle cx="113" cy="48" r="2.5" fill="#1a1a1a"/><path d="M92 65 L100 72 L108 65 L100 78 Z" fill="#e67e22"/>`,
  h_bandana: `<path d="M68 40 Q100 18 132 40 L132 48 L68 48 Z" fill="#c0392b"/><path d="M68 42 L54 58 L62 56 L72 46 Z" fill="#a93226"/><circle cx="88" cy="42" r="1.5" fill="#fff" opacity="0.5"/><circle cx="105" cy="38" r="1.5" fill="#fff" opacity="0.5"/><circle cx="120" cy="42" r="1.5" fill="#fff" opacity="0.5"/>`,
  h_wig: `<path d="M72 40 Q75 15 100 12 Q125 15 128 40 L128 45 L72 45 Z" fill="#c8c8c8"/><ellipse cx="70" cy="55" rx="5" ry="14" fill="#c8c8c8"/><ellipse cx="130" cy="55" rx="5" ry="14" fill="#c8c8c8"/><ellipse cx="100" cy="25" rx="22" ry="6" fill="#a8a8a8" opacity="0.5"/>`,
  h_crown: `<path d="M72 38 L75 15 L85 28 L100 8 L115 28 L125 15 L128 38 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="1.5"/><circle cx="100" cy="22" r="3" fill="#c0392b"/><circle cx="86" cy="27" r="2" fill="#3498db"/><circle cx="114" cy="27" r="2" fill="#3498db"/><path d="M72 38 L128 38" stroke="#b8860b" stroke-width="2"/>`,
  h_guy: `<path d="M70 45 Q70 22 100 20 Q130 22 130 45 Q132 62 118 76 L110 82 L100 86 L90 82 L82 76 Q68 62 70 45 Z" fill="#f5f5f5" stroke="#d0d0d0" stroke-width="1"/><path d="M82 46 L94 50" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/><path d="M118 46 L106 50" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/><path d="M88 70 Q100 80 112 70" stroke="#1a1a1a" stroke-width="1.5" fill="none"/><path d="M100 66 L103 74" stroke="#c0392b" stroke-width="1.5"/>`,
  h_horns: `<path d="M76 35 Q70 20 65 8 Q72 15 80 30 Z" fill="#8b0000" stroke="#4a0000" stroke-width="1"/><path d="M124 35 Q130 20 135 8 Q128 15 120 30 Z" fill="#8b0000" stroke="#4a0000" stroke-width="1"/>`,
  h_moto: `<ellipse cx="100" cy="50" rx="33" ry="38" fill="#1a1a1a"/><ellipse cx="100" cy="42" rx="26" ry="10" fill="#0a0a0a" opacity="0.6"/><path d="M68 60 Q100 72 132 60" stroke="#333" stroke-width="1.5" fill="none"/><ellipse cx="88" cy="52" rx="7" ry="4" fill="#3498db" opacity="0.3"/><ellipse cx="112" cy="52" rx="7" ry="4" fill="#3498db" opacity="0.3"/>`,
  h_gold_crown: `<path d="M68 35 L72 10 L84 24 L100 4 L116 24 L128 10 L132 35 Z" fill="#ffd700" stroke="#b8860b" stroke-width="2"/><path d="M68 35 L132 35" stroke="#b8860b" stroke-width="2"/><circle cx="100" cy="20" r="3.5" fill="#e74c3c"/><circle cx="84" cy="20" r="2.5" fill="#3498db"/><circle cx="116" cy="20" r="2.5" fill="#3498db"/><circle cx="76" cy="28" r="1.5" fill="#fff"/><circle cx="124" cy="28" r="1.5" fill="#fff"/>`,
  // NEW
  h_cheburashka: `<circle cx="76" cy="25" r="17" fill="#8b6914"/><circle cx="124" cy="25" r="17" fill="#8b6914"/><circle cx="76" cy="25" r="11" fill="#a07020"/><circle cx="124" cy="25" r="11" fill="#a07020"/><path d="M70 42 Q100 32 130 42 L130 48 L70 48 Z" fill="#6b4a2a"/>`,
  h_bandit: `<ellipse cx="100" cy="55" rx="30" ry="34" fill="#0a0a0a"/><ellipse cx="90" cy="50" rx="6" ry="5" fill="${SKIN}"/><ellipse cx="110" cy="50" rx="6" ry="5" fill="${SKIN}"/><circle cx="90" cy="50" r="2" fill="#000"/><circle cx="110" cy="50" r="2" fill="#000"/>`,
  h_pirate: `<path d="M68 42 Q100 20 132 42 L132 48 L68 48 Z" fill="#c0392b"/><path d="M68 45 L55 58 L62 56 L72 48 Z" fill="#a93226"/><circle cx="110" cy="52" r="7" fill="#000"/><line x1="103" y1="52" x2="70" y2="45" stroke="#000" stroke-width="1.5"/>`,
  h_fedora: `<ellipse cx="100" cy="42" rx="42" ry="6" fill="#3d2818"/><path d="M72 42 L72 22 Q100 14 128 22 L128 42 Z" fill="#5c3a20"/><path d="M72 38 L128 38" stroke="#3d2818" stroke-width="2"/>`,
  h_beret: `<ellipse cx="100" cy="32" rx="32" ry="15" fill="#1a1a1a"/><circle cx="100" cy="18" r="2.5" fill="#1a1a1a"/>`,
  h_vr: `<path d="M65 42 Q100 32 135 42 L135 62 Q100 72 65 62 Z" fill="#1a1a1a"/><rect x="75" y="48" width="20" height="12" rx="2" fill="#3498db"/><rect x="105" y="48" width="20" height="12" rx="2" fill="#3498db"/><path d="M65 52 L55 48" stroke="#1a1a1a" stroke-width="3"/><path d="M135 52 L145 48" stroke="#1a1a1a" stroke-width="3"/>`,
  h_halo: `<ellipse cx="100" cy="10" rx="25" ry="5" fill="none" stroke="#f1c40f" stroke-width="3"/><ellipse cx="100" cy="10" rx="25" ry="5" fill="#f1c40f" opacity="0.25"/>`,
  h_cap_red: `<path d="M72 42 Q100 15 128 42 L128 48 L72 48 Z" fill="#c0392b"/><path d="M128 42 L158 48 L155 54 L128 48 Z" fill="#a93226"/><circle cx="100" cy="15" r="2" fill="#7f1d13"/>`,
  h_flower: `<circle cx="118" cy="38" r="6" fill="#e91e63"/><circle cx="113" cy="34" r="3.5" fill="#f06292"/><circle cx="123" cy="34" r="3.5" fill="#f06292"/><circle cx="113" cy="42" r="3.5" fill="#f06292"/><circle cx="123" cy="42" r="3.5" fill="#f06292"/><circle cx="118" cy="38" r="2" fill="#ffeb3b"/>`,
  h_mask_money: `<ellipse cx="100" cy="50" rx="30" ry="14" fill="#1a1a1a"/><circle cx="88" cy="50" r="6" fill="${SKIN}"/><circle cx="112" cy="50" r="6" fill="${SKIN}"/><circle cx="88" cy="50" r="2.5" fill="#000"/><circle cx="112" cy="50" r="2.5" fill="#000"/><text x="100" y="56" text-anchor="middle" font-size="11" fill="#4CAF50" font-weight="900">$</text>`,

  // ═══ ТЕЛО ═══
  b_alco: `<rect x="78" y="110" width="44" height="95" fill="#f5f5f5"/><rect x="84" y="95" width="5" height="20" fill="#f5f5f5"/><rect x="111" y="95" width="5" height="20" fill="#f5f5f5"/><ellipse cx="90" cy="150" rx="2" ry="3" fill="#e0e0e0" opacity="0.6"/>`,
  b_aura: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#1a1a1a"/><path d="M70 100 L62 105 L62 130 L72 130 L72 100 Z" fill="#1a1a1a"/><path d="M130 100 L138 105 L138 130 L128 130 L128 100 Z" fill="#1a1a1a"/><text x="100" y="162" text-anchor="middle" font-size="11" fill="#f39c12" font-weight="900">AURA</text>`,
  b_iambog: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#f5f5f5"/><path d="M70 100 L62 105 L62 130 L72 130 L72 100 Z" fill="#f5f5f5"/><path d="M130 100 L138 105 L138 130 L128 130 L128 100 Z" fill="#f5f5f5"/><text x="100" y="162" text-anchor="middle" font-size="14" fill="#c0392b" font-weight="900">Я БОГ</text>`,
  b_cage: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#c0392b"/><path d="M70 100 L62 105 L62 175 L72 175 L72 100 Z" fill="#c0392b"/><path d="M130 100 L138 105 L138 175 L128 175 L128 100 Z" fill="#c0392b"/><path d="M70 120 L130 120 M70 145 L130 145 M70 170 L130 170" stroke="#1a1a1a" stroke-width="1.5" opacity="0.4"/><path d="M85 100 L85 205 M100 100 L100 205 M115 100 L115 205" stroke="#1a1a1a" stroke-width="1.5" opacity="0.4"/>`,
  b_supreme: `<path d="M68 100 Q68 95 72 95 L128 95 Q132 95 132 100 L132 205 L68 205 Z" fill="#c0392b"/><path d="M75 95 Q100 78 125 95 L125 100 L75 100 Z" fill="#a93226"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#c0392b"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#c0392b"/><rect x="80" y="160" width="40" height="30" fill="#a93226"/><rect x="88" y="135" width="24" height="10" fill="#fff"/><text x="100" y="143" text-anchor="middle" font-size="6" fill="#c0392b" font-weight="900">SUP</text>`,
  b_armani: `<path d="M70 100 L70 205 L90 205 L100 175 L110 205 L130 205 L130 100 Q120 95 100 95 Q80 95 70 100 Z" fill="#1a1a1a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><path d="M100 175 L88 100 M100 175 L112 100" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="100" cy="160" r="2" fill="#888"/>`,
  b_nf: `<path d="M68 100 Q68 95 72 95 L128 95 Q132 95 132 100 L132 205 L68 205 Z" fill="#1a1a1a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><path d="M70 120 L130 120 M70 140 L130 140 M70 160 L130 160 M70 180 L130 180 M70 200 L130 200" stroke="#333" stroke-width="1.5"/><path d="M55 120 L70 120 M55 140 L70 140 M55 160 L70 160 M55 180 L70 180" stroke="#333" stroke-width="1.5"/><path d="M130 120 L145 120 M130 140 L145 140 M130 160 L145 160 M130 180 L145 180" stroke="#333" stroke-width="1.5"/>`,
  b_leather: `<path d="M70 100 L70 205 L85 205 L100 175 L115 205 L130 205 L130 100 Q120 95 100 95 Q80 95 70 100 Z" fill="#1a1a1a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><path d="M100 175 L84 100 M100 175 L116 100" stroke="#000" stroke-width="2" fill="none"/><circle cx="100" cy="190" r="2" fill="#888"/>`,
  b_wedding: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L120 95 Q115 108 100 108 Q85 108 80 95 Z" fill="#f8f8f8"/><path d="M70 205 L60 250 L140 250 L130 205 Z" fill="#f8f8f8"/><path d="M85 210 L80 250 M100 210 L100 250 M115 210 L120 250" stroke="#e0e0e0" stroke-width="1.5" fill="none"/><path d="M70 200 L130 200" stroke="#e8e8e8" stroke-width="2"/>`,
  b_vest: `<rect x="72" y="105" width="56" height="90" rx="6" fill="#2c3e50"/><rect x="80" y="120" width="40" height="25" rx="2" fill="#1a252f"/><path d="M80 155 L120 155 M80 170 L120 170" stroke="#1a252f" stroke-width="1.5"/><rect x="90" y="108" width="20" height="6" rx="2" fill="#34495e"/>`,
  b_tuxedo: `<path d="M70 100 L70 205 L85 205 L100 175 L115 205 L130 205 L130 100 Q120 95 100 95 Q80 95 70 100 Z" fill="#000"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#000"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#000"/><path d="M88 95 L100 170 L112 95 Z" fill="#fff"/><path d="M90 100 L100 105 L110 100 L108 108 L100 105 L92 108 Z" fill="#000"/><circle cx="100" cy="155" r="1.5" fill="#fff"/><circle cx="100" cy="168" r="1.5" fill="#fff"/>`,
  b_santa: `<path d="M70 100 Q68 95 72 95 L128 95 Q132 95 130 100 L130 205 L70 205 Z" fill="#c0392b"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#c0392b"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#c0392b"/><path d="M70 100 Q100 90 130 100" stroke="#fff" stroke-width="4" fill="none"/><rect x="70" y="195" width="60" height="10" fill="#fff"/><circle cx="90" cy="130" r="2" fill="#fff"/><circle cx="110" cy="130" r="2" fill="#fff"/><circle cx="90" cy="160" r="2" fill="#fff"/><circle cx="110" cy="160" r="2" fill="#fff"/>`,
  // NEW
  b_tank_usa: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#f5f5f5"/><path d="M70 100 L62 105 L62 130 L72 130 L72 100 Z" fill="#f5f5f5"/><path d="M130 100 L138 105 L138 130 L128 130 L128 100 Z" fill="#f5f5f5"/><rect x="75" y="140" width="50" height="30" fill="#c0392b"/><rect x="75" y="140" width="25" height="15" fill="#1c3a7a"/><line x1="75" y1="145" x2="100" y2="145" stroke="#fff" stroke-width="1.5"/><line x1="75" y1="150" x2="100" y2="150" stroke="#fff" stroke-width="1.5"/>`,
  b_hoodie: `<path d="M66 98 Q66 92 72 92 L128 92 Q134 92 134 98 L134 205 L66 205 Z" fill="#1a1a1a"/><path d="M75 92 Q100 75 125 92 L125 98 L75 98 Z" fill="#0a0a0a"/><rect x="52" y="98" width="20" height="100" rx="8" fill="#1a1a1a"/><rect x="128" y="98" width="20" height="100" rx="8" fill="#1a1a1a"/><line x1="94" y1="105" x2="94" y2="130" stroke="#fff" stroke-width="1"/><line x1="106" y1="105" x2="106" y2="130" stroke="#fff" stroke-width="1"/><rect x="85" y="155" width="30" height="20" rx="3" fill="#0a0a0a"/>`,
  b_hawaii: `<path d="M70 95 Q68 95 68 100 L68 205 L132 205 L132 100 Q132 95 130 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#fff9e6"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#fff9e6"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#fff9e6"/><circle cx="82" cy="135" r="4" fill="#2ecc71"/><circle cx="120" cy="155" r="4" fill="#e91e63"/><circle cx="90" cy="185" r="4" fill="#f39c12"/><line x1="82" y1="139" x2="80" y2="147" stroke="#2ecc71" stroke-width="1.5"/><line x1="120" y1="159" x2="118" y2="167" stroke="#e91e63" stroke-width="1.5"/><line x1="90" y1="189" x2="88" y2="197" stroke="#f39c12" stroke-width="1.5"/>`,
  b_armor: `<path d="M70 95 L130 95 L130 205 L70 205 Z" fill="#7f8c8d"/><path d="M70 95 L75 105 L75 205 L70 205 Z" fill="#5a6a6a"/><path d="M130 95 L125 105 L125 205 L130 205 Z" fill="#5a6a6a"/><rect x="85" y="125" width="30" height="60" fill="#5a6a6a"/><circle cx="100" cy="145" r="8" fill="#e74c3c"/><rect x="93" y="105" width="14" height="10" fill="#5a6a6a"/>`,
  b_bomber: `<path d="M68 100 L68 205 L132 205 L132 100 Q120 95 100 95 Q80 95 68 100 Z" fill="#1a1a1a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><path d="M70 115 L130 115" stroke="#444" stroke-width="2"/><path d="M80 105 L80 205 M100 105 L100 205 M120 105 L120 205" stroke="#333" stroke-width="1" opacity="0.6"/><rect x="90" y="140" width="20" height="10" fill="#0a0a0a"/>`,
  b_poncho: `<path d="M60 100 Q60 95 70 95 L130 95 Q140 95 140 100 L145 220 L55 220 Z" fill="#8b4513"/><path d="M60 130 L140 130 M60 160 L140 160 M60 190 L140 190" stroke="#a0522d" stroke-width="2"/><path d="M60 130 L60 220 M80 130 L80 220 M100 130 L100 220 M120 130 L120 220 M140 130 L140 220" stroke="#a0522d" stroke-width="2"/>`,
  b_kimono: `<path d="M70 95 L70 205 L100 205 L100 95 Z" fill="#e91e63"/><path d="M100 95 L100 205 L130 205 L130 95 Z" fill="#e91e63"/><path d="M85 95 L100 130 L115 95" stroke="#f06292" stroke-width="3" fill="none"/><path d="M60 100 L62 140 L68 140 L68 100 Z" fill="#e91e63"/><path d="M132 100 L132 140 L138 140 L138 100 Z" fill="#e91e63"/><path d="M92 130 L108 130" stroke="#fff" stroke-width="2"/><circle cx="100" cy="155" r="4" fill="#f06292"/>`,
  b_jersey: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#1a1a1a"/><path d="M70 100 L62 105 L62 130 L72 130 L72 100 Z" fill="#1a1a1a"/><path d="M130 100 L138 105 L138 130 L128 130 L128 100 Z" fill="#1a1a1a"/><text x="100" y="160" text-anchor="middle" font-size="20" fill="#f1c40f" font-weight="900">10</text>`,
  b_dress_red: `<path d="M70 95 Q70 95 70 105 L85 130 L60 240 L140 240 L115 130 L130 105 Q130 95 130 95 L120 95 Q115 108 100 108 Q85 108 80 95 Z" fill="#c0392b"/><path d="M70 200 L130 200" stroke="#a93226" stroke-width="2"/><ellipse cx="85" cy="150" rx="3" ry="4" fill="#f8f8f8" opacity="0.5"/>`,
  b_shirt_tie: `<path d="M72 95 Q70 95 70 100 L70 205 L130 205 L130 100 Q130 95 128 95 L118 95 Q115 108 100 108 Q85 108 82 95 Z" fill="#fff"/><path d="M70 100 L62 105 L62 175 L72 175 L72 100 Z" fill="#fff"/><path d="M130 100 L138 105 L138 175 L128 175 L128 100 Z" fill="#fff"/><rect x="98" y="105" width="4" height="95" fill="#c0392b"/><path d="M100 105 L95 115 L100 122 L105 115 Z" fill="#c0392b"/><path d="M96 122 L104 122 L107 200 L93 200 Z" fill="#c0392b"/>`,

  // ═══ НОГИ ═══
  l_family: `<path d="M75 200 L75 250 L100 250 L100 200 Z" fill="#3498db"/><path d="M100 200 L100 250 L125 250 L125 200 Z" fill="#3498db"/><path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#2980b9"/>`,
  l_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><path d="M80 210 L80 355 M84 210 L84 355 M88 210 L88 355" stroke="#fff" stroke-width="1.5"/><path d="M106 210 L106 355 M110 210 L110 355 M114 210 L114 355" stroke="#fff" stroke-width="1.5"/>`,
  l_ripped: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80"/><ellipse cx="88" cy="255" rx="4" ry="3" fill="${SKIN}"/><ellipse cx="112" cy="290" rx="5" ry="4" fill="${SKIN}"/><ellipse cx="85" cy="320" rx="4" ry="3" fill="${SKIN}"/><ellipse cx="115" cy="340" rx="4" ry="3" fill="${SKIN}"/>`,
  l_shorts: `<path d="M75 200 L75 260 L100 260 L100 200 Z" fill="#f39c12"/><path d="M100 200 L100 260 L125 260 L125 200 Z" fill="#f39c12"/><path d="M75 200 L125 200 L125 215 L75 215 Z" fill="#e67e22"/>`,
  l_levis: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80"/><path d="M75 205 L125 205" stroke="#2c4566" stroke-width="3"/><circle cx="88" cy="208" r="1.5" fill="#b8860b"/><circle cx="112" cy="208" r="1.5" fill="#b8860b"/>`,
  l_lampasy: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><path d="M96 210 L96 355 M104 210 L104 355" stroke="#e74c3c" stroke-width="2.5"/>`,
  l_camo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#5a6b3a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#5a6b3a"/><circle cx="85" cy="230" r="5" fill="#3a4a2a"/><circle cx="90" cy="260" r="6" fill="#6b7b4a"/><circle cx="80" cy="290" r="5" fill="#3a4a2a"/><circle cx="88" cy="330" r="6" fill="#6b7b4a"/><circle cx="110" cy="240" r="5" fill="#3a4a2a"/><circle cx="115" cy="280" r="6" fill="#6b7b4a"/><circle cx="105" cy="310" r="5" fill="#3a4a2a"/><circle cx="112" cy="345" r="6" fill="#6b7b4a"/>`,
  l_classic: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#2c3e50"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#2c3e50"/><path d="M75 205 L125 205" stroke="#1a252f" stroke-width="2"/><path d="M87 215 L87 355 M113 215 L113 355" stroke="#1a252f" stroke-width="1"/>`,
  l_leather: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#0a0a0a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#0a0a0a"/><path d="M80 230 L80 340" stroke="#333" stroke-width="1"/><path d="M106 230 L106 340" stroke="#333" stroke-width="1"/><path d="M87 215 L87 355 M113 215 L113 355" stroke="#555" stroke-width="1" stroke-dasharray="2,2"/>`,
  l_gold: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#ffd700"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#ffd700"/><path d="M80 220 L80 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/><path d="M106 220 L106 350" stroke="#fff" stroke-width="1.5" opacity="0.5"/><path d="M75 205 L125 205" stroke="#b8860b" stroke-width="3"/><circle cx="100" cy="210" r="3" fill="#fff"/>`,
  // NEW
  l_joggers: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#34495e"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#34495e"/><ellipse cx="87" cy="360" rx="12" ry="3" fill="#2c3e50"/><ellipse cx="113" cy="360" rx="12" ry="3" fill="#2c3e50"/>`,
  l_chinos: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#d4a97a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#d4a97a"/><path d="M87 215 L87 355 M113 215 L113 355" stroke="#b8916a" stroke-width="1"/>`,
  l_skinny: `<rect x="75" y="205" width="22" height="160" rx="4" fill="#1a1a2e"/><rect x="103" y="205" width="22" height="160" rx="4" fill="#1a1a2e"/><path d="M86 220 L86 350 M113 220 L113 350" stroke="#2c3e50" stroke-width="0.8"/>`,
  l_baggy: `<path d="M72 205 Q70 210 72 220 L72 365 L100 365 L100 205 Z" fill="#5a5a5a"/><path d="M128 205 Q130 210 128 220 L128 365 L100 365 L100 205 Z" fill="#5a5a5a"/><path d="M72 220 Q100 225 128 220" stroke="#3d3d3d" stroke-width="1" fill="none"/>`,
  l_overalls: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#3d5a80"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#3d5a80"/><rect x="70" y="180" width="60" height="30" fill="#3d5a80"/><rect x="75" y="95" width="8" height="90" fill="#3d5a80"/><rect x="117" y="95" width="8" height="90" fill="#3d5a80"/><rect x="80" y="95" width="6" height="6" fill="#f1c40f"/><rect x="114" y="95" width="6" height="6" fill="#f1c40f"/>`,
  l_kilt: `<path d="M70 195 L130 195 L135 290 L65 290 Z" fill="#1a5c1a"/><path d="M80 195 L80 290 M100 195 L100 290 M120 195 L120 290" stroke="#0f3d0f" stroke-width="1.5"/><path d="M65 290 L135 290 L140 305 L60 305 Z" fill="#0f3d0f"/>`,
  l_harem: `<path d="M70 205 L70 260 Q60 290 70 320 L100 320 L100 205 Z" fill="#9b7d5a"/><path d="M130 205 L130 260 Q140 290 130 320 L100 320 L100 205 Z" fill="#9b7d5a"/><ellipse cx="100" cy="220" rx="30" ry="6" fill="#7d6044"/>`,
  l_track: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#fff" stroke-width="1"/><path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#fff" stroke-width="1"/><path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/>`,
  l_cargo: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#5a6b3a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#5a6b3a"/><rect x="76" y="250" width="12" height="14" fill="#4a5b2a"/><rect x="76" y="290" width="12" height="14" fill="#4a5b2a"/><rect x="112" y="250" width="12" height="14" fill="#4a5b2a"/><rect x="112" y="290" width="12" height="14" fill="#4a5b2a"/>`,
  l_chains: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><circle cx="80" cy="240" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/><circle cx="80" cy="250" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/><circle cx="80" cy="260" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/><circle cx="120" cy="280" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/><circle cx="120" cy="290" r="3" fill="none" stroke="#c0c0c0" stroke-width="1.5"/>`,

  // ═══ ПРАВАЯ РУКА ═══
  rh_cig: `<line x1="142" y1="195" x2="168" y2="188" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="168" cy="188" r="2" fill="#ff6600"/>`,
  rh_beer: `<rect x="132" y="175" width="14" height="32" rx="2" fill="#8b6914"/><rect x="136" y="167" width="6" height="10" fill="#8b6914"/><rect x="136" y="162" width="6" height="6" fill="#d4ac0d"/><rect x="132" y="185" width="14" height="7" fill="#c0392b"/>`,
  rh_baltica: `<rect x="131" y="175" width="14" height="32" rx="2" fill="#1a1a1a"/><rect x="135" y="167" width="6" height="10" fill="#1a1a1a"/><rect x="135" y="162" width="6" height="6" fill="#f39c12"/><text x="138" y="197" text-anchor="middle" font-size="6" fill="#fff" font-weight="900">9</text>`,
  rh_shaverma: `<ellipse cx="155" cy="185" rx="8" ry="20" fill="#f5e6c8" transform="rotate(-15 155 185)"/><path d="M150 175 Q155 180 160 175 M149 185 Q155 190 161 185 M150 195 Q155 200 160 195" stroke="#c0392b" stroke-width="1.5" fill="none"/><circle cx="153" cy="178" r="1.5" fill="#2ecc71"/><circle cx="157" cy="190" r="1.5" fill="#2ecc71"/>`,
  rh_rose: `<line x1="142" y1="200" x2="155" y2="155" stroke="#2ecc71" stroke-width="2.5"/><ellipse cx="157" cy="150" rx="9" ry="11" fill="#c0392b"/><ellipse cx="157" cy="150" rx="5" ry="6" fill="#e74c3c"/><circle cx="157" cy="150" r="2" fill="#8b0000"/><ellipse cx="148" cy="175" rx="5" ry="3" fill="#2ecc71" transform="rotate(-30 148 175)"/>`,
  rh_rod: `<line x1="142" y1="200" x2="185" y2="95" stroke="#8b6914" stroke-width="2.5"/><line x1="185" y1="95" x2="190" y2="170" stroke="#888" stroke-width="0.6"/><circle cx="190" cy="170" r="3" fill="#c0392b"/>`,
  rh_bat: `<g transform="translate(138, 197) rotate(30)"><rect x="-6" y="-5" width="12" height="12" fill="#8b6914"/><rect x="-4" y="-70" width="8" height="65" fill="#8b6914" rx="4"/><rect x="-6" y="-80" width="12" height="15" fill="#a07020" rx="4"/><rect x="-8" y="-8" width="16" height="4" fill="#5a3a1e"/></g>`,
  rh_nerf: `<rect x="138" y="185" width="26" height="9" rx="2" fill="#f39c12"/><rect x="138" y="194" width="9" height="12" fill="#e67e22"/><circle cx="158" cy="189" r="3" fill="#c0392b"/><rect x="156" y="181" width="7" height="5" fill="#e67e22"/>`,
  rh_flag_rus: `<line x1="148" y1="205" x2="148" y2="110" stroke="#888" stroke-width="2.5"/><rect x="148" y="110" width="42" height="10" fill="#fff"/><rect x="148" y="120" width="42" height="10" fill="#3498db"/><rect x="148" y="130" width="42" height="10" fill="#e74c3c"/>`,
  rh_case: `<rect x="130" y="172" width="32" height="28" rx="3" fill="#8b6914"/><rect x="130" y="182" width="32" height="3" fill="#b8860b"/><circle cx="146" cy="170" r="4" fill="none" stroke="#8b6914" stroke-width="2.5"/><text x="146" y="193" text-anchor="middle" font-size="9" fill="#ffd700" font-weight="900">$</text>`,
  // NEW
  rh_knife: `<rect x="140" y="180" width="4" height="10" fill="#5a3a1e"/><path d="M140 180 L140 145 L144 145 L144 180 Z" fill="#c0c0c0"/><rect x="140" y="180" width="4" height="3" fill="#8b6914"/>`,
  rh_book: `<rect x="138" y="180" width="26" height="30" rx="2" fill="#c0392b"/><rect x="138" y="180" width="5" height="30" fill="#8b1a1a"/><line x1="146" y1="185" x2="160" y2="185" stroke="#fff" stroke-width="0.5" opacity="0.5"/><line x1="146" y1="195" x2="160" y2="195" stroke="#fff" stroke-width="0.5" opacity="0.5"/>`,
  rh_donut: `<circle cx="152" cy="195" r="13" fill="#e67e22"/><circle cx="152" cy="195" r="5" fill="#8b4513"/><path d="M145 190 Q147 185 152 185 Q157 185 159 190 Q157 188 152 188 Q147 188 145 190 Z" fill="#e74c3c"/><path d="M144 196 Q146 200 152 200 Q158 200 160 196" stroke="#f39c12" stroke-width="1.5" fill="none"/>`,
  rh_icecream: `<path d="M148 165 L156 165 L154 190 L150 190 Z" fill="#f5deb3"/><circle cx="152" cy="160" r="8" fill="#f06292"/><circle cx="148" cy="157" r="5" fill="#fce4ec"/><circle cx="156" cy="157" r="5" fill="#fce4ec"/><circle cx="152" cy="153" r="4" fill="#e91e63"/>`,
  rh_glove: `<ellipse cx="152" cy="188" rx="14" ry="16" fill="#c0392b"/><ellipse cx="152" cy="175" rx="7" ry="5" fill="#a93226"/><rect x="146" y="203" width="12" height="6" fill="#a93226"/>`,
  rh_bag: `<path d="M135 175 L168 175 L165 210 L138 210 Z" fill="#f5f5f5"/><path d="M142 175 Q142 168 152 168 Q162 168 162 175" stroke="#888" stroke-width="1.5" fill="none"/><circle cx="150" cy="188" r="2" fill="#c0392b"/>`,
  rh_brass: `<ellipse cx="152" cy="190" rx="12" ry="10" fill="#888"/><circle cx="144" cy="185" r="3" fill="#666"/><circle cx="150" cy="183" r="3" fill="#666"/><circle cx="156" cy="183" r="3" fill="#666"/><circle cx="162" cy="185" r="3" fill="#666"/>`,
  rh_watermelon: `<ellipse cx="152" cy="195" rx="16" ry="14" fill="#2ecc71"/><path d="M140 195 Q152 185 164 195" fill="#fff"/><circle cx="148" cy="190" r="1.5" fill="#000"/><circle cx="155" cy="188" r="1.5" fill="#000"/><circle cx="158" cy="192" r="1.5" fill="#000"/>`,
  rh_fish: `<ellipse cx="155" cy="195" rx="16" ry="9" fill="#4aa3df"/><path d="M170 195 L178 187 L178 203 Z" fill="#2e86c1"/><circle cx="145" cy="192" r="2" fill="#1a1a1a"/><path d="M148 200 Q155 203 162 200" stroke="#2c3e50" stroke-width="0.8" fill="none"/>`,
  rh_burger: `<rect x="138" y="180" width="30" height="6" rx="3" fill="#f39c12"/><rect x="137" y="186" width="32" height="4" fill="#2ecc71"/><rect x="138" y="190" width="30" height="6" fill="#8b4513"/><rect x="137" y="196" width="32" height="4" fill="#e74c3c"/><rect x="138" y="200" width="30" height="5" rx="2" fill="#f39c12"/>`,

  // ═══ ЛЕВАЯ РУКА ═══
  lh_phone: `<rect x="46" y="180" width="14" height="24" rx="2" fill="#1a1a1a"/><rect x="48" y="183" width="10" height="18" fill="#3498db"/><circle cx="53" cy="200" r="1" fill="#555"/>`,
  lh_wallet: `<rect x="44" y="188" width="24" height="16" rx="2" fill="#8b4513"/><path d="M44 194 L68 194" stroke="#5a2e0a" stroke-width="1"/><circle cx="63" cy="198" r="2" fill="#f1c40f"/>`,
  lh_cola: `<rect x="48" y="178" width="12" height="26" rx="1" fill="#c0392b"/><rect x="48" y="178" width="12" height="4" fill="#888"/><text x="54" y="196" text-anchor="middle" font-size="7" fill="#fff" font-weight="900">C</text>`,
  lh_ext: `<rect x="44" y="168" width="16" height="32" rx="3" fill="#c0392b"/><rect x="44" y="170" width="16" height="4" fill="#fff"/><rect x="50" y="162" width="4" height="7" fill="#333"/><path d="M50 162 Q45 155 40 152" stroke="#333" stroke-width="2" fill="none"/>`,
  lh_guitar: `<g><ellipse cx="42" cy="240" rx="24" ry="30" fill="#8b4513"/><ellipse cx="44" cy="205" rx="20" ry="24" fill="#8b4513"/><circle cx="42" cy="220" r="7" fill="#1a1a1a"/><circle cx="42" cy="220" r="3" fill="#3d1a05"/><path d="M55 195 L85 130 L92 135 L62 200 Z" fill="#5a2e0a"/><ellipse cx="90" cy="128" rx="8" ry="7" fill="#3d1a05" transform="rotate(20 90 128)"/><rect x="30" y="258" width="24" height="5" fill="#3d1a05"/><line x1="53" y1="200" x2="88" y2="133" stroke="#f5deb3" stroke-width="0.6" opacity="0.7"/><line x1="56" y1="203" x2="91" y2="136" stroke="#f5deb3" stroke-width="0.6" opacity="0.7"/></g>`,
  lh_shield: `<path d="M36 172 L76 172 L76 198 Q56 222 36 198 Z" fill="#7f8c8d"/><path d="M36 172 L76 172" stroke="#e74c3c" stroke-width="2"/><path d="M47 185 L65 185 M56 178 L56 198" stroke="#fff" stroke-width="2"/>`,
  lh_sword: `<line x1="48" y1="208" x2="62" y2="120" stroke="#bdc3c7" stroke-width="4.5"/><path d="M62 120 L57 132 L62 138 L67 132 Z" fill="#bdc3c7"/><rect x="40" y="202" width="17" height="4" fill="#8b6914"/><circle cx="48" cy="213" r="3.5" fill="#c0392b"/>`,
  lh_flag_ussr: `<line x1="48" y1="208" x2="48" y2="120" stroke="#888" stroke-width="2.5"/><rect x="48" y="120" width="36" height="22" fill="#c0392b"/><text x="66" y="137" text-anchor="middle" font-size="12" fill="#f1c40f">☭</text>`,
  lh_briefcase: `<rect x="40" y="175" width="34" height="28" rx="3" fill="#2c3e50"/><rect x="40" y="183" width="34" height="3" fill="#34495e"/><circle cx="57" cy="172" r="4" fill="none" stroke="#2c3e50" stroke-width="2.5"/><text x="57" y="196" text-anchor="middle" font-size="10" fill="#fff" font-weight="900">❄</text>`,
  lh_cat: `<ellipse cx="55" cy="188" rx="14" ry="16" fill="#f39c12"/><path d="M44 178 L43 168 L50 175 Z" fill="#f39c12"/><path d="M66 178 L67 168 L60 175 Z" fill="#f39c12"/><circle cx="50" cy="184" r="2" fill="#222"/><circle cx="60" cy="184" r="2" fill="#222"/><path d="M52 194 Q55 197 58 194" stroke="#222" stroke-width="1" fill="none"/><line x1="50" y1="194" x2="44" y2="194" stroke="#222" stroke-width="0.5"/><line x1="60" y1="194" x2="66" y2="194" stroke="#222" stroke-width="0.5"/>`,
  // NEW
  lh_coffee: `<path d="M46 178 L64 178 L62 202 L48 202 Z" fill="#fff"/><path d="M46 178 L64 178" stroke="#8b4513" stroke-width="2"/><ellipse cx="55" cy="180" rx="9" ry="2" fill="#3d1a05"/><path d="M64 185 Q70 185 70 192 Q70 199 64 199" stroke="#fff" stroke-width="2" fill="none"/>`,
  lh_hammer: `<g transform="translate(60, 190) rotate(-20)"><rect x="-3" y="-40" width="6" height="50" fill="#8b6914"/><rect x="-13" y="-45" width="26" height="12" rx="2" fill="#7f8c8d"/></g>`,
  lh_book2: `<rect x="36" y="175" width="32" height="38" rx="2" fill="#2c3e50"/><rect x="36" y="175" width="6" height="38" fill="#1a252f"/><line x1="46" y1="182" x2="62" y2="182" stroke="#fff" stroke-width="0.5" opacity="0.5"/><line x1="46" y1="192" x2="62" y2="192" stroke="#fff" stroke-width="0.5" opacity="0.5"/><line x1="46" y1="202" x2="62" y2="202" stroke="#fff" stroke-width="0.5" opacity="0.5"/><rect x="56" y="175" width="4" height="10" fill="#e74c3c"/>`,
  lh_ball: `<circle cx="55" cy="195" r="14" fill="#fff"/><path d="M55 181 Q65 188 55 209 Q45 188 55 181 Z" fill="#1a1a1a"/><path d="M44 195 Q48 190 55 190 Q62 190 66 195" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>`,
  lh_umbrella: `<line x1="55" y1="130" x2="55" y2="215" stroke="#333" stroke-width="2"/><path d="M30 165 Q30 130 55 130 Q80 130 80 165 L80 168 L30 168 Z" fill="#1a1a1a"/><path d="M30 165 Q40 160 45 168 Q50 160 55 168 Q60 160 65 168 Q70 160 80 165" stroke="#333" stroke-width="1" fill="none"/><circle cx="55" cy="130" r="2" fill="#333"/><path d="M55 215 Q50 220 45 215" stroke="#333" stroke-width="2" fill="none"/>`,
  lh_laptop: `<rect x="36" y="172" width="36" height="24" rx="2" fill="#2c3e50"/><rect x="38" y="174" width="32" height="20" fill="#3498db"/><rect x="32" y="196" width="46" height="4" fill="#1a252f"/><path d="M44 174 L44 194 M52 174 L52 194 M60 174 L60 194 M66 174 L66 194" stroke="#2c3e50" stroke-width="0.5" opacity="0.5"/>`,
  lh_champagne: `<rect x="42" y="180" width="16" height="34" rx="2" fill="#1a4a1a"/><rect x="46" y="165" width="8" height="18" fill="#1a4a1a"/><rect x="46" y="160" width="8" height="6" fill="#d4ac0d"/><circle cx="50" cy="155" r="2" fill="#f1c40f" opacity="0.7"/><rect x="44" y="195" width="12" height="8" fill="#f1c40f"/><text x="50" y="201" text-anchor="middle" font-size="5" fill="#1a1a1a" font-weight="900">CH</text>`,
  lh_sushi: `<rect x="40" y="185" width="32" height="16" rx="2" fill="#1a1a1a"/><circle cx="48" cy="193" r="7" fill="#f5f5f5"/><circle cx="48" cy="193" r="4" fill="#e74c3c"/><circle cx="60" cy="193" r="7" fill="#f5f5f5"/><circle cx="60" cy="193" r="4" fill="#f39c12"/><circle cx="68" cy="193" r="4" fill="#2ecc71"/>`,
  lh_pizza: `<path d="M40 195 L70 195 L70 200 L40 200 Z" fill="#f39c12"/><path d="M40 195 L55 165 L70 195 Z" fill="#f39c12"/><circle cx="50" cy="188" r="3" fill="#c0392b"/><circle cx="60" cy="188" r="3" fill="#c0392b"/><circle cx="55" cy="178" r="2.5" fill="#c0392b"/><circle cx="48" cy="192" r="1.5" fill="#2ecc71"/>`,
  lh_teddy: `<ellipse cx="55" cy="195" rx="16" ry="18" fill="#8b6914"/><circle cx="55" cy="178" r="12" fill="#8b6914"/><circle cx="46" cy="170" r="5" fill="#8b6914"/><circle cx="64" cy="170" r="5" fill="#8b6914"/><circle cx="46" cy="170" r="2" fill="#5a3a1e"/><circle cx="64" cy="170" r="2" fill="#5a3a1e"/><circle cx="50" cy="176" r="2" fill="#1a1a1a"/><circle cx="60" cy="176" r="2" fill="#1a1a1a"/><ellipse cx="55" cy="184" rx="4" ry="3" fill="#5a3a1e"/><ellipse cx="55" cy="184" rx="2" ry="1" fill="#1a1a1a"/>`,
};

function renderCharacterSVG(outfit, opts = {}) {
  const w = opts.width || 140;
  const h = opts.height || 280;
  const head = outfit?.head_id?.item_id;
  const body = outfit?.body_id?.item_id;
  const legs = outfit?.legs_id?.item_id;
  const rh = outfit?.right_hand_id?.item_id;
  const lh = outfit?.left_hand_id?.item_id;
  return `<svg viewBox="0 0 200 400" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    ${renderBaseBody()}
    ${legs && ITEMS_SVG[legs] ? ITEMS_SVG[legs] : ''}
    ${body && ITEMS_SVG[body] ? ITEMS_SVG[body] : ''}
    ${rh && ITEMS_SVG[rh] ? ITEMS_SVG[rh] : ''}
    ${lh && ITEMS_SVG[lh] ? ITEMS_SVG[lh] : ''}
    ${head && ITEMS_SVG[head] ? ITEMS_SVG[head] : ''}
  </svg>`;
}

// ══════════════════════════════════════════════════════════════
async function api(method, body = {}) {
  let res;
  try {
    res = await fetch(`/api/${method}`, {
      method: "POST",
      headers: {"Content-Type":"application/json", "X-Init-Data": initData},
      body: JSON.stringify(body),
    });
  } catch(e) { throw new Error("Нет связи"); }
  if (res.status === 511) throw new Error("Туннель требует пароль");
  if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error||`HTTP ${res.status}`); }
  return res.json();
}

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function show(id) { $$(".screen").forEach(x=>x.classList.remove("active")); $(`#${id}`).classList.add("active"); window.scrollTo(0,0); }
function showTab(tab) {
  $$(".tab-content").forEach(c=>c.classList.remove("active"));
  $(`.tab-content[data-tab="${tab}"]`).classList.add("active");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.nav===tab));
  if (typeof stopChatPolling === "function") stopChatPolling();
  if (tab==="appearance") loadAppearance();
  if (tab==="work") loadWork();
  if (tab==="casino") renderCasino();
  if (tab==="people") loadPeople();
  if (tab==="chat") startChatPolling();
  if (tab==="more") updateMoreBadges();
  window.scrollTo(0,0);
}
function toast(msg, type="") {
  const el = $("#toast");
  el.textContent = msg; el.className = `toast ${type}`;
  el.classList.remove("hidden");
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.add("hidden"), 2500);
}
function openModal(html) { $("#modal-body").innerHTML=html; $("#modal").classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
$("#modal-close").addEventListener("click", closeModal);
$("#modal").addEventListener("click", e=>{if(e.target.id==="modal")closeModal();});
function fmtMoney(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toLocaleString("ru-RU");
}

async function boot() {
  if (!initData) { document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#fff;">Открой через Telegram</div>'; return; }
  try {
    const d = await api("me");
    if (!d.registered) { show("register"); setupRegister(); }
    else {
      state.player = d.player;
      renderPlayer(); renderCharacterInto("#character-view");
      show("main"); showTab("home");
      if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    }
  } catch(e) {
    console.error(e);
    if (e.message.includes("511") || e.message.includes("Туннель")) {
      document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#fff;">Туннель требует пароль. Смени на localhost.run</div>';
    } else { show("register"); setupRegister(); }
  }
}

function setupRegister() {
  const nick = $("#nickname"), btn = $("#btn-register");
  nick.addEventListener("input", ()=>btn.disabled = nick.value.trim().length < 2);
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      const d = await api("register", {nickname: nick.value.trim()});
      state.player = d.player;
      renderPlayer(); renderCharacterInto("#character-view");
      show("main"); showTab("home");
      if (tg) tg.HapticFeedback?.notificationOccurred("success");
      toast("🎉 Добро пожаловать! Ты голый — загляни в Шмот", "success");
    } catch(e) { toast(e.message, "error"); btn.disabled = false; }
  });
}

function renderPlayer() {
  const p = state.player; if (!p) return;
  $("#nick").textContent = p.nickname;
  const hasClothes = p.outfit.head_id.item_id || p.outfit.body_id.item_id || p.outfit.legs_id.item_id;
  $("#subtitle").textContent = `Ур. ${p.level} · ${hasClothes ? "модник" : "голый бомж"}`;
  $("#money").textContent = fmtMoney(p.balance);
  $("#char-name").textContent = p.nickname;
  $("#char-level").textContent = p.level;
  const pct = p.xp_next > 0 ? Math.min(100, p.xp/p.xp_next*100) : 0;
  $("#xp-fill").style.width = pct+"%";
  $("#xp-text").textContent = `${p.xp}/${p.xp_next} XP`;
  const daily = p.last_daily ? 86400 - (Math.floor(Date.now()/1000) - p.last_daily) : 0;
  const badge = $("#daily-badge");
  if (daily <= 0) badge.classList.remove("hidden"); else badge.classList.add("hidden");
  $("#avatar").textContent = p.outfit.head_id.item_id ? p.outfit.head_id.emoji : "👤";
}

function renderCharacterInto(selector) {
  const el = $(selector);
  if (!el || !state.player) return;
  el.innerHTML = renderCharacterSVG(state.player.outfit, {width: 150, height: 300});
}
function flashCharacter() {
  const el = $("#character-view");
  el.classList.add("equip-flash");
  setTimeout(()=>el.classList.remove("equip-flash"), 600);
}
function notifyAchievements(list) {
  const names = list.map(id=>({first_job:"Работяга",first_business:"Бизнесмен",millionaire:"Миллионер",billionaire:"Миллиардер",gambler:"Азартный",big_winner:"Джекпот",criminal:"Авторитет",in_debt:"Должник",fashion:"Модник",level10:"Опытный",rich_king:"Император",trader:"Барыга"}[id]||id));
  toast("🏆 Достижение: "+names.join(", "), "success");
}

// ══════════════════════════════════════════════════════════════
//  МАГАЗИН / ИНВЕНТАРЬ
// ══════════════════════════════════════════════════════════════
const SLOT_FILTERS = [
  {id:"head", name:"Голова", emoji:"🧢"},
  {id:"body", name:"Тело", emoji:"👕"},
  {id:"legs", name:"Ноги", emoji:"👖"},
  {id:"right_hand", name:"Пр.рука", emoji:"🤚"},
  {id:"left_hand", name:"Лев.рука", emoji:"🖐"},
];
const SLOT_KEY = {head:"head_id", body:"body_id", legs:"legs_id", right_hand:"right_hand_id", left_hand:"left_hand_id"};

function emptyOutfit() {
  return {head_id:{item_id:null}, body_id:{item_id:null}, legs_id:{item_id:null},
          right_hand_id:{item_id:null}, left_hand_id:{item_id:null}};
}

async function loadAppearance() {
  try {
    const [shop, inv] = await Promise.all([api("shop"), api("inventory")]);
    state.shopItems = shop.items;
    state.invItems = inv.items;
    renderAppearance();
  } catch(e) { toast(e.message, "error"); }
}

function renderAppearance() {
  const container = $("#appearance-list");
  const filterEl = $("#appearance-filter");

  // Mode switch
  let modeHtml = `<div class="mode-switch">
    <button class="mode-btn ${state.appearanceMode==='shop'?'active':''}" onclick="setAppearanceMode('shop')">🛒 Магазин</button>
    <button class="mode-btn ${state.appearanceMode==='inventory'?'active':''}" onclick="setAppearanceMode('inventory')">🎒 Инвентарь</button>
  </div>`;

  // Filters
  let filterHtml = SLOT_FILTERS.map(f=>`<button class="filter-btn ${state.shopFilter===f.id?'active':''}" onclick="setShopFilter('${f.id}')">${f.emoji} ${f.name}</button>`).join("");

  filterEl.innerHTML = modeHtml + filterHtml;

  const p = state.player;
  let listHtml = "";

  if (state.appearanceMode === "shop") {
    const items = state.shopItems.filter(i=>i.slot===state.shopFilter);
    if (items.length === 0) listHtml = '<p style="color:var(--hint);text-align:center;padding:20px">Пусто</p>';
    else listHtml = items.map(it => {
      const canAfford = p.balance >= it.price;
      return `<div class="item-card" style="border-left-color:${it.rarity_color}" onclick="showShopItem('${it.item_id}')">
        <div class="item-preview-mini">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY[it.slot]]: {item_id: it.item_id}}, {width: 40, height: 80})}</div>
        <div class="item-info">
          <div class="item-name" style="color:${it.rarity_color}">${it.name}</div>
          <div class="item-meta">${it.desc}</div>
        </div>
        <div class="item-price ${canAfford?'':'disabled'}">${fmtMoney(it.price)}₽</div>
      </div>`;
    }).join("");
  } else {
    // Inventory mode
    const equipped = [];
    for (const [slot, item] of Object.entries(p.outfit)) {
      if (item.item_id) equipped.push({slot, item});
    }
    const slotEquipped = equipped.filter(e => SLOT_KEY[e.slot.replace("_id","")] === undefined ? true : SLOT_FILTERS.find(f=>f.id===SLOT_KEY[e.slot] === undefined || true));
    const inv = state.invItems.filter(it => it.slot === state.shopFilter);
    const equippedInSlot = equipped.filter(e => SLOT_KEY[state.shopFilter] === e.slot);

    if (equippedInSlot.length > 0) {
      listHtml += '<div style="font-size:11px;color:var(--hint);margin-bottom:6px;text-transform:uppercase;font-weight:700">Надето</div>';
      listHtml += equippedInSlot.map(e=>`
        <div class="item-card" style="border-left-color:var(--success)" onclick="showEquipped('${e.slot}')">
          <div class="item-preview-mini">${renderCharacterSVG({...emptyOutfit(), [e.slot]: {item_id: e.item.item_id}}, {width: 40, height: 80})}</div>
          <div class="item-info"><div class="item-name">${e.item.name}</div><div class="item-meta">✓ надето</div></div>
          <div style="color:var(--success);font-weight:700">✓</div>
        </div>`).join("");
      listHtml += '<div style="font-size:11px;color:var(--hint);margin:12px 0 6px;text-transform:uppercase;font-weight:700">Сумка</div>';
    }
    if (inv.length === 0) {
      listHtml += '<p style="color:var(--hint);text-align:center;padding:20px">Нет предметов в этом разделе</p>';
    } else {
      listHtml += inv.map(it=>`<div class="item-card" style="border-left-color:${it.rarity_color}" onclick="showInvItem('${it.item_id}')">
        <div class="item-preview-mini">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY[it.slot]]: {item_id: it.item_id}}, {width: 40, height: 80})}</div>
        <div class="item-info"><div class="item-name" style="color:${it.rarity_color}">${it.name}</div><div class="item-meta">${it.desc}</div></div>
        <div class="item-price">×${it.quantity}</div>
      </div>`).join("");
    }
  }
  container.innerHTML = listHtml;
}

function setAppearanceMode(m) { state.appearanceMode = m; renderAppearance(); }
function setShopFilter(f) { state.shopFilter = f; renderAppearance(); }

function showShopItem(iid) {
  const it = state.shopItems.find(x=>x.item_id===iid);
  if (!it) return;
  const p = state.player;
  const canAfford = p.balance >= it.price;
  const preview = {...p.outfit};
  preview[SLOT_KEY[it.slot]] = {item_id: iid, emoji: it.emoji, name: it.name};
  openModal(`
    <div class="shop-preview">${renderCharacterSVG(preview, {width: 190, height: 380})}</div>
    <h2 style="color:${it.rarity_color};text-align:center;margin-bottom:4px">${it.name}</h2>
    <div style="color:${it.rarity_color};font-size:12px;font-weight:700;text-align:center;margin-bottom:12px">${it.rarity_name} · ${SLOT_FILTERS.find(f=>f.id===it.slot)?.name || ''}</div>
    <p style="color:var(--hint);text-align:center;margin-bottom:16px">${it.desc}</p>
    <div style="text-align:center;font-size:20px;font-weight:800;margin-bottom:16px">💰 ${fmtMoney(it.price)}₽</div>
    ${canAfford ? `<button class="btn btn-primary" onclick="buyItem('${iid}')">✅ Купить</button>` : `<button class="btn btn-secondary" disabled>❌ Не хватает денег</button>`}
  `);
}

async function buyItem(iid) {
  try {
    const d = await api("buy", {item_id: iid});
    state.player = d.player;
    renderPlayer(); renderCharacterInto("#character-view"); loadAppearance();
    closeModal(); toast(`✅ Куплено: ${d.bought}`, "success");
    flashCharacter();
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); }
}

function showEquipped(slot) {
  const it = state.player.outfit[slot];
  if (!it.item_id) return;
  openModal(`
    <div class="shop-preview">${renderCharacterSVG({...emptyOutfit(), [slot]: {item_id: it.item_id}}, {width: 160, height: 320})}</div>
    <h2 style="text-align:center">${it.name}</h2>
    <p style="color:var(--hint);text-align:center;margin:16px 0">Снять?</p>
    <button class="btn btn-primary" onclick="unequip('${slot}')">🚫 Снять</button>
  `);
}

function showInvItem(iid) {
  const it = state.invItems.find(x=>x.item_id===iid);
  if (!it) return;
  openModal(`
    <div class="shop-preview">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY[it.slot]]: {item_id: iid}}, {width: 160, height: 320})}</div>
    <h2 style="color:${it.rarity_color};text-align:center">${it.name}</h2>
    <div style="color:${it.rarity_color};font-size:12px;margin:8px 0 16px;font-weight:700;text-align:center">${it.rarity_name} · ×${it.quantity}</div>
    <p style="color:var(--hint);margin-bottom:16px;text-align:center">${it.desc}</p>
    <button class="btn btn-primary" onclick="equipItem('${iid}')">⚡ Надеть</button>
    <button class="btn btn-secondary" onclick="sellItem('${iid}')">💰 Продать за ${it.sell_price}₽</button>
  `);
}

async function equipItem(iid) {
  try {
    const d = await api("equip", {item_id: iid});
    state.player = d.player;
    renderPlayer(); renderCharacterInto("#character-view"); loadAppearance();
    closeModal(); toast("✅ Надето", "success"); flashCharacter();
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.impactOccurred("light");
  } catch(e) { toast(e.message, "error"); }
}
async function unequip(slot) {
  try {
    const d = await api("unequip", {slot});
    state.player = d.player;
    renderPlayer(); renderCharacterInto("#character-view"); loadAppearance();
    closeModal(); toast("✅ Снято"); flashCharacter();
  } catch(e) { toast(e.message, "error"); }
}
async function sellItem(iid) {
  try {
    const d = await api("sell", {item_id: iid});
    state.player = d.player;
    renderPlayer(); loadAppearance();
    closeModal(); toast(`💰 +${d.gold}₽`, "success");
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  РАБОТА
// ══════════════════════════════════════════════════════════════
async function loadWork() {
  try {
    const [jobs, biz] = await Promise.all([api("jobs"), api("businesses")]);
    renderJobs(jobs); renderBusinesses(biz);
  } catch(e) { toast(e.message, "error"); }
}
const JOBS_DATA = {
  courier:{name:"Курьер",emoji:"🚴",salary:100,xp:5,cooldown:60},
  loader:{name:"Грузчик",emoji:"📦",salary:250,xp:10,cooldown:120},
  taxi:{name:"Таксист",emoji:"🚕",salary:500,xp:20,cooldown:180},
  programmer:{name:"Программист",emoji:"💻",salary:1200,xp:40,cooldown:240},
  blogger:{name:"Блогер",emoji:"📹",salary:3000,xp:80,cooldown:300},
};
function renderJobs(data) {
  const cur = data.current; const now = Math.floor(Date.now()/1000);
  const box = $("#job-current-box");
  if (cur && JOBS_DATA[cur]) {
    const j = JOBS_DATA[cur];
    const cd = Math.max(0, j.cooldown - (now - (data.last_work||0)));
    box.innerHTML = `<div class="current-job-box">
      <div class="label">Текущая работа</div>
      <div class="name">${j.emoji} ${j.name}</div>
      <div style="font-size:13px;opacity:.9;margin-top:6px">${j.salary}₽ · ${j.xp} XP</div>
      ${cd>0 ? `<button class="btn" disabled>⏳ ${cd}с</button>` : `<button class="btn" onclick="doWork()">💼 Работать (+${j.salary}₽)</button>`}
    </div>`;
  } else box.innerHTML = `<div class="current-job-box"><div class="name">💼 Выбери работу</div></div>`;
  $("#jobs-list").innerHTML = data.jobs.map(j=>`
    <div class="job-card ${cur===j.id?'selected':''} ${j.unlocked?'':'locked'}" onclick="selectJob('${j.id}', ${j.unlocked})">
      <div class="job-icon">${j.emoji}</div>
      <div class="job-info"><div class="job-name">${j.name}</div><div class="job-desc">${j.desc} · ур.${j.level}</div></div>
      <div class="job-salary">${j.salary}₽</div>
    </div>`).join("");
}
async function selectJob(jid, unlocked) {
  if (!unlocked) { toast("Низкий уровень", "error"); return; }
  try { await api("set_job", {job_id: jid}); loadWork(); toast(`💼 ${JOBS_DATA[jid].name}`); }
  catch(e) { toast(e.message, "error"); }
}
async function doWork() {
  try {
    const d = await api("work");
    state.player = d.player; renderPlayer(); loadWork();
    toast(`💼 +${d.earned}₽ · +${d.xp} XP`, "success");
    if (d.levels) toast(`🎉 Уровень ${d.player.level}!`, "success");
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); loadWork(); }
}
function renderBusinesses(data) {
  const badge = $("#pending-badge");
  if (data.pending > 0) { badge.textContent = `+${fmtMoney(data.pending)}₽`; badge.classList.remove("hidden"); }
  else badge.classList.add("hidden");
  const p = state.player;
  $("#businesses-list").innerHTML = data.businesses.map(b=>{
    const canAfford = p.balance >= b.price;
    if (b.owned) return `<div class="item-card" style="border-left-color:var(--success)">
      <div class="item-emoji">${b.emoji}</div>
      <div class="item-info"><div class="item-name">${b.name}</div><div class="item-meta">+${b.income}₽/ч · ${fmtMoney(b.pending)}₽</div></div>
      <div style="color:var(--success);font-weight:700">✓</div>
    </div>`;
    return `<div class="item-card" style="border-left-color:var(--money);${canAfford?'':'opacity:.6'}" onclick="buyBusiness('${b.id}', ${canAfford})">
      <div class="item-emoji">${b.emoji}</div>
      <div class="item-info"><div class="item-name">${b.name}</div><div class="item-meta">+${b.income}₽/ч</div></div>
      <div class="item-price ${canAfford?'':'disabled'}">${fmtMoney(b.price)}₽</div>
    </div>`;
  }).join("");
}
async function buyBusiness(bid, canAfford) {
  if (!canAfford) { toast("Не хватает денег", "error"); return; }
  try {
    const d = await api("buy_business", {business_id: bid});
    state.player = d.player; renderPlayer(); loadWork();
    toast("✅ Бизнес куплен!", "success");
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
  } catch(e) { toast(e.message, "error"); }
}
async function collectBusiness() {
  try {
    const d = await api("collect_business");
    state.player = d.player; renderPlayer(); loadWork();
    toast(`💰 +${fmtMoney(d.earned)}₽`, "success");
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  КАЗИНО
// ══════════════════════════════════════════════════════════════
const CASINO = {
  coin:{name:"Монетка",emoji:"🪙",desc:"Орёл/решка — x2"},
  dice:{name:"Кости",emoji:"🎲",desc:"Больше 3 — x1.8"},
  red:{name:"Рулетка: красное",emoji:"🔴",desc:"Красное — x2"},
  black:{name:"Рулетка: чёрное",emoji:"⚫",desc:"Чёрное — x2"},
  zero:{name:"Рулетка: зеро",emoji:"🟢",desc:"Зеро — x35"},
  jackpot:{name:"Джекпот",emoji:"💎",desc:"8% шанс — x10"},
  slots:{name:"Слоты",emoji:"🎰",desc:"3 в ряд — x5"},
};

function renderCasino() {
  const locked = state.casinoLocked && Date.now() - state.casinoLockTime < 5000;
  const remaining = locked ? Math.ceil((state.casinoLockTime + 5000 - Date.now())/1000) : 0;
  $("#casino-games").innerHTML = Object.entries(CASINO).map(([id,g])=>`
    <div class="casino-game ${state.casinoGame===id?'selected':''}" onclick="state.casinoGame='${id}';renderCasino()" style="${state.casinoGame===id?'border:2px solid var(--button)':''}">
      <div class="cg-header"><div class="cg-emoji">${g.emoji}</div><div class="cg-name">${g.name}</div></div>
      <div class="cg-desc">${g.desc}</div>
    </div>
  `).join("") + `<button class="btn btn-primary ${locked?'casino-locked':''}" onclick="playCasino()" style="margin-top:16px" ${locked?'disabled':''}>
    ${locked ? `⏳ Кд ${remaining}с` : '🎰 Играть'}
  </button>`;
}
function setBet(v) {
  const inp = $("#bet-input");
  if (v === "max") inp.value = state.player.balance;
  else inp.value = v;
}
async function playCasino() {
  if (state.casinoLocked && Date.now() - state.casinoLockTime < 5000) {
    toast(`⏳ Кд ${Math.ceil((state.casinoLockTime + 5000 - Date.now())/1000)}с`, "error");
    return;
  }
  const bet = parseInt($("#bet-input").value) || 0;
  if (bet <= 0) { toast("Введи ставку", "error"); return; }
  if (bet > state.player.balance) { toast("Не хватает денег", "error"); return; }
  try {
    const d = await api("casino_play", {game: state.casinoGame, bet});
    state.player = d.player; renderPlayer();
    state.casinoLocked = true; state.casinoLockTime = Date.now();
    renderCasino();
    setTimeout(()=>{ state.casinoLocked = false; renderCasino(); }, 5000);
    const isWin = d.win > 0;
    $("#casino-result").innerHTML = `<div style="padding:16px;background:${isWin?'rgba(46,204,113,.2)':'rgba(231,76,60,.2)'};border-radius:12px;text-align:center;margin-top:16px">
      <div style="font-size:32px">${d.result}</div>
      <div style="font-size:16px;font-weight:800;margin-top:8px;color:${isWin?'var(--success)':'var(--danger)'}">${isWin?`+${fmtMoney(d.win)}₽`:`-${fmtMoney(bet)}₽`}</div>
    </div>`;
    if (isWin) { toast(`🎉 +${fmtMoney(d.net)}₽`, "success"); if (tg) tg.HapticFeedback?.notificationOccurred("success"); }
    else { toast("😢 Проигрыш", "error"); if (tg) tg.HapticFeedback?.notificationOccurred("error"); }
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  ЛЮДИ
// ══════════════════════════════════════════════════════════════
async function loadPeople() {
  try {
    const [loc, trades] = await Promise.all([api("location"), api("trade/list")]);
    state.location = loc;
    renderLocationTabs(loc); renderLocationInfo(loc);
    renderPlayersList(loc.players); renderTrades(trades);
  } catch(e) { toast(e.message, "error"); }
}
function renderLocationTabs(loc) {
  const locations = [
    {id:0, name:"Мухосранск", emoji:"🏚"},
    {id:1, name:"Черёмушки", emoji:"🏢"},
    {id:2, name:"Барвиха", emoji:"🏰"},
  ];
  $("#location-tabs").innerHTML = locations.map(l=>`
    <div class="loc-tab ${state.player.location_id===l.id?'active':''}" onclick="moveTo(${l.id})">
      <div class="loc-emoji">${l.emoji}</div>
      <div class="loc-name">${l.name}</div>
    </div>`).join("");
}
function renderLocationInfo(loc) {
  const l = loc.location;
  const here = state.player.location_id === l.id;
  $("#location-info").innerHTML = `<div class="loc-info-emoji">${l.emoji}</div>
    <div class="loc-info-name">${l.name}</div>
    <div class="loc-info-desc">${l.desc}</div>
    <div style="margin-top:8px;font-size:12px;color:${here?'var(--success)':'var(--hint)'}">${here ? "📍 Ты здесь" : "🚶 Не здесь"}</div>`;
}
function renderPlayersList(players) {
  if (players.length === 0) { $("#players-list").innerHTML = '<p style="color:var(--hint);text-align:center;padding:20px">Никого нет</p>'; return; }
  $("#players-list").innerHTML = players.map(p=>`
    <div class="player-card" onclick="viewPlayer(${p.user_id})">
      <div class="player-avatar">👤</div>
      <div class="player-info"><div class="player-name">${p.nickname}</div><div class="player-meta">Ур. ${p.level}</div></div>
      <div class="player-money">${fmtMoney(p.balance)}₽</div>
    </div>`).join("");
}
async function moveTo(locId) {
  try { await api("move", {location_id: locId}); state.player.location_id = locId; loadPeople(); toast("📍 Перемещён"); }
  catch(e) { toast(e.message, "error"); }
}
async function viewPlayer(uid) {
  try {
    const d = await api("player_view", {user_id: uid});
    const ach = d.achievements.length > 0 ? d.achievements.map(id=>ACH_MAP[id]?.emoji||"🏆").join(" ") : "нет";
    openModal(`
      <div class="shop-preview">${renderCharacterSVG(d.outfit, {width: 170, height: 340})}</div>
      <h2 style="text-align:center;margin-bottom:8px">${d.nickname}</h2>
      <div style="text-align:center;margin:12px 0">
        <div style="font-size:16px;font-weight:700">Ур. ${d.level}</div>
        <div style="color:var(--money);font-weight:700;margin-top:4px">💰 ${fmtMoney(d.balance)}₽</div>
        <div style="color:var(--hint);font-size:13px;margin-top:4px">Бизнесов: ${d.businesses_count}</div>
        <div style="font-size:20px;margin-top:8px">${ach}</div>
      </div>
      <button class="btn btn-primary" onclick="showTradeOffer(${uid}, '${d.nickname}')">🤝 Трейд</button>
    `);
  } catch(e) { toast(e.message, "error"); }
}
const ACH_MAP = {
  first_job:{name:"Работяга",emoji:"💼"}, first_business:{name:"Бизнесмен",emoji:"💼"},
  millionaire:{name:"Миллионер",emoji:"💰"}, billionaire:{name:"Миллиардер",emoji:"💎"},
  gambler:{name:"Азартный",emoji:"🎲"}, big_winner:{name:"Джекпот",emoji:"🎰"},
  criminal:{name:"Авторитет",emoji:"🕶"}, in_debt:{name:"Должник",emoji:"💸"},
  fashion:{name:"Модник",emoji:"👔"}, level10:{name:"Опытный",emoji:"⭐"},
  rich_king:{name:"Император",emoji:"👑"}, trader:{name:"Барыга",emoji:"🤝"},
};
async function showTradeOffer(uid, name) {
  try {
    const [myInv, theirInv] = await Promise.all([api("inventory"), api("player_items", {user_id: uid})]);
    const myHtml = myInv.items.length > 0
      ? myInv.items.map(i=>`<label style="display:flex;gap:8px;padding:6px;background:var(--bg-3);border-radius:8px;margin-bottom:4px;font-size:12px"><input type="checkbox" class="give-item" value="${i.item_id}"> ${i.name} ×${i.quantity}</label>`).join("")
      : '<p style="color:var(--hint)">Пусто</p>';
    const theirHtml = theirInv.items.length > 0
      ? theirInv.items.map(i=>`<label style="display:flex;gap:8px;padding:6px;background:var(--bg-3);border-radius:8px;margin-bottom:4px;font-size:12px"><input type="checkbox" class="want-item" value="${i.item_id}"> ${i.name} ×${i.quantity}</label>`).join("")
      : '<p style="color:var(--hint)">Пусто</p>';
    openModal(`
      <h2 style="margin-bottom:16px">Трейд с ${name}</h2>
      <p style="font-weight:700;margin-bottom:8px">Я даю:</p>
      <input id="give-money" type="number" placeholder="₽" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-bottom:8px">
      <div style="max-height:150px;overflow-y:auto">${myHtml}</div>
      <p style="font-weight:700;margin:16px 0 8px">Я хочу:</p>
      <input id="want-money" type="number" placeholder="₽" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-bottom:8px">
      <div style="max-height:150px;overflow-y:auto">${theirHtml}</div>
      <button class="btn btn-primary" onclick="sendTradeOffer(${uid})" style="margin-top:16px">🤝 Отправить</button>
    `);
  } catch(e) { toast(e.message, "error"); }
}
async function sendTradeOffer(uid) {
  const give_money = parseInt($("#give-money").value) || 0;
  const want_money = parseInt($("#want-money").value) || 0;
  const give_items = [...document.querySelectorAll(".give-item:checked")].map(x=>x.value);
  const want_items = [...document.querySelectorAll(".want-item:checked")].map(x=>x.value);
  if (!give_money && !want_money && !give_items.length && !want_items.length) { toast("Пустой", "error"); return; }
  try {
    await api("trade/send", {to_user: uid, give_money, give_items, want_money, want_items});
    closeModal(); toast("✅ Отправлено", "success");
  } catch(e) { toast(e.message, "error"); }
}
function renderTrades(trades) {
  const incEl = $("#trades-incoming"), outEl = $("#trades-outgoing");
  if (trades.incoming.length === 0 && trades.outgoing.length === 0) {
    incEl.innerHTML = '<p style="color:var(--hint);text-align:center;padding:20px">Нет трейдов</p>';
    outEl.innerHTML = ""; return;
  }
  incEl.innerHTML = trades.incoming.map(t=>{
    const give = `${t.give_money>0?t.give_money+"₽ ":""}${t.give_items.length} шт.`;
    const want = `${t.want_money>0?t.want_money+"₽ ":""}${t.want_items.length} шт.`;
    return `<div class="trade-card">
      <div class="trade-title">📥 От ${t.other_nickname}</div>
      <div class="trade-content">Даёт: ${give}<br>Хочет: ${want}</div>
      <div class="trade-actions">
        <button class="trade-accept" onclick="acceptTrade(${t.trade_id})">✅</button>
        <button class="trade-decline" onclick="declineTrade(${t.trade_id})">❌</button>
      </div>
    </div>`;
  }).join("");
  outEl.innerHTML = trades.outgoing.length > 0
    ? '<div style="font-size:12px;color:var(--hint);margin-top:8px;margin-bottom:4px">📤 Отправленные</div>'
      + trades.outgoing.map(t=>`<div class="trade-card" style="border-left-color:var(--hint)">
        <div class="trade-title">К ${t.other_nickname}</div>
        <div class="trade-actions"><button class="trade-decline" onclick="declineTrade(${t.trade_id})">Отменить</button></div>
      </div>`).join("")
    : "";
}
async function acceptTrade(tid) {
  try { const d = await api("trade/accept", {trade_id: tid}); state.player = d.player; renderPlayer(); loadPeople(); toast("✅ Принят", "success"); }
  catch(e) { toast(e.message, "error"); }
}
async function declineTrade(tid) {
  try { await api("trade/decline", {trade_id: tid}); loadPeople(); toast("❌ Отклонён"); }
  catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  ДЕЙСТВИЯ
// ══════════════════════════════════════════════════════════════
async function claimDaily() {
  try { const d = await api("daily"); state.player = d.player; renderPlayer(); toast(`🎁 +${fmtMoney(d.reward)}₽`, "success"); }
  catch(e) { toast(e.message, "error"); }
}
async function claimRoulette() {
  try { const d = await api("roulette"); state.player = d.player; renderPlayer(); toast(`🎡 ${fmtMoney(d.prize)}₽!`, "success"); }
  catch(e) { toast(e.message, "error"); }
}
async function doCrime() {
  try { const d = await api("crime"); state.player = d.player; renderPlayer(); toast(d.result, d.success?"success":"error"); }
  catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  ЕЩЁ
// ══════════════════════════════════════════════════════════════
function updateMoreBadges() {
  const p = state.player;
  const cb = $("#credit-badge");
  if (p.credit_amount > 0) { cb.textContent = `${fmtMoney(p.credit_amount)}₽`; cb.classList.remove("hidden"); }
  else cb.classList.add("hidden");
  $("#crypto-price-badge").textContent = `${p.crypto_price}₽`;
}
function showCrypto() {
  const p = state.player;
  openModal(`<h2>🪙 Крипто-биржа</h2>
    <p style="color:var(--hint);margin:16px 0">Цена: <b style="color:var(--money)">${p.crypto_price}₽</b></p>
    <p>У тебя: <b>${p.crypto_amount.toFixed(2)}</b> (~${fmtMoney(Math.floor(p.crypto_amount*p.crypto_price))}₽)</p>
    <div style="margin-top:16px"><label style="font-size:12px;color:var(--hint)">Купить на ₽</label>
      <input id="crypto-buy-amt" type="number" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-top:4px">
      <button class="btn btn-primary" onclick="buyCrypto()">Купить</button></div>
    <div style="margin-top:12px"><label style="font-size:12px;color:var(--hint)">Продать</label>
      <input id="crypto-sell-amt" type="number" step="0.01" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-top:4px">
      <button class="btn btn-secondary" onclick="sellCrypto()">Продать</button></div>`);
}
async function buyCrypto() {
  const amt = parseInt($("#crypto-buy-amt").value) || 0;
  try { const d = await api("crypto/buy", {amount: amt}); state.player = d.player; renderPlayer(); closeModal(); toast(`✅ ${d.coins.toFixed(2)} коинов`, "success"); }
  catch(e) { toast(e.message, "error"); }
}
async function sellCrypto() {
  const amt = parseFloat($("#crypto-sell-amt").value) || 0;
  try { const d = await api("crypto/sell", {amount: amt}); state.player = d.player; renderPlayer(); closeModal(); toast(`💰 +${fmtMoney(d.rub)}₽`, "success"); }
  catch(e) { toast(e.message, "error"); }
}
function showCredit() {
  const p = state.player;
  if (p.credit_amount > 0) openModal(`<h2>💸 Кредит</h2><p style="margin:16px 0">Долг: <b style="color:var(--danger)">${fmtMoney(p.credit_amount)}₽</b></p><button class="btn btn-primary" onclick="payCredit()">Погасить</button>`);
  else openModal(`<h2>💸 Кредит</h2><p style="color:var(--hint);margin:16px 0">До 50 000₽ под 15%</p><input id="credit-amt" type="number" placeholder="Сумма" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff"><button class="btn btn-primary" onclick="takeCredit()" style="margin-top:12px">Взять</button>`);
}
async function takeCredit() {
  const amt = parseInt($("#credit-amt").value) || 0;
  try { const d = await api("credit/take", {amount: amt}); state.player = d.player; renderPlayer(); closeModal(); updateMoreBadges(); toast(`💸 ${amt}₽`, "success"); }
  catch(e) { toast(e.message, "error"); }
}
async function payCredit() {
  try { const d = await api("credit/pay"); state.player = d.player; renderPlayer(); closeModal(); updateMoreBadges(); toast(`✅ Погашен`, "success"); }
  catch(e) { toast(e.message, "error"); }
}
function showAchievements() {
  const p = state.player;
  const all = ["first_job","first_business","millionaire","billionaire","gambler","big_winner","criminal","in_debt","fashion","level10","rich_king","trader"];
  openModal(`<h2>🏆 Достижения</h2><div style="margin-top:16px">
    ${all.map(id=>{ const a = ACH_MAP[id]; const owned = p.achievements.includes(id);
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-3);border-radius:8px;margin-bottom:6px;${owned?'':'opacity:.4'}">
        <div style="font-size:24px">${a.emoji}</div>
        <div><div style="font-weight:700;font-size:13px">${a.name}</div><div style="font-size:11px;color:var(--hint)">${owned?'✅':'🔒'}</div></div>
      </div>`; }).join("")}
  </div>`);
}
async function showLeaderboard() {
  try {
    const d = await api("leaderboard");
    openModal(`<h2>📊 Топ-20</h2><div style="margin-top:16px">
      ${d.leaders.map(l=>`<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-3);border-radius:8px;margin-bottom:6px">
        <div style="font-size:18px;font-weight:800;width:36px">#${l.rank}</div>
        <div style="flex:1"><div style="font-weight:700">${l.nickname}</div><div style="font-size:11px;color:var(--hint)">Ур. ${l.level} · Бизнесов: ${l.businesses_count}</div></div>
        <div style="color:var(--money);font-weight:800">${fmtMoney(l.balance)}₽</div>
      </div>`).join("")}
    </div>`);
  } catch(e) { toast(e.message, "error"); }
}

$$(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{ showTab(btn.dataset.nav); if (tg) tg.HapticFeedback?.selectionChanged(); });
});

// ══════════════════════════════════════════════════════════════
//  ЧАТ
// ══════════════════════════════════════════════════════════════
let chatInterval = null;
function startChatPolling() {
  if (chatInterval) clearInterval(chatInterval);
  loadChat();
  chatInterval = setInterval(loadChat, 3000);
}
function stopChatPolling() {
  if (chatInterval) { clearInterval(chatInterval); chatInterval = null; }
}
async function loadChat() {
  try {
    const d = await api("chat/get");
    const el = $("#chat-messages");
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (!d.messages || d.messages.length === 0) {
      el.innerHTML = '<p style="color:var(--hint);text-align:center;padding:40px">Пока нет сообщений. Напиши первым!</p>';
    } else {
      el.innerHTML = d.messages.map(m => {
        let time = "";
        try {
          const iso = m.created_at.replace(" ", "T") + "Z";
          time = new Date(iso).toLocaleTimeString("ru-RU", {hour:"2-digit", minute:"2-digit"});
        } catch(e) {}
        return `<div class="chat-msg">
          <div class="chat-msg-head">
            <span class="chat-nick" onclick="viewPlayer(${m.user_id})">${escapeHtml(m.nickname)}</span>
            <span class="chat-lvl">Ур. ${m.level}</span>
            <span class="chat-time">${time}</span>
          </div>
          <div>${escapeHtml(m.message)}</div>
        </div>`;
      }).join("");
    }
    if (atBottom) el.scrollTop = el.scrollHeight;
  } catch(e) {}
}
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : text;
  return div.innerHTML;
}
async function sendChat() {
  const inp = $("#chat-input");
  if (!inp) return;
  const msg = inp.value.trim();
  if (!msg) return;
  try {
    await api("chat/send", {message: msg});
    inp.value = "";
    loadChat();
    if (tg) tg.HapticFeedback?.impactOccurred("light");
  } catch(e) { toast(e.message, "error"); }
}

boot();
