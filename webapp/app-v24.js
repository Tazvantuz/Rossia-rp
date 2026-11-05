// app-v24.js
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor?.('#17212b'); tg.setBackgroundColor?.('#17212b'); }
const initData = tg?.initData || "";
let state = {
  player: null, location: null, shopItems: [], invItems: [],
  shopFilter: "head", appearanceMode: "shop", casinoGame: "coin",
  casinoLocked: false, casinoLockTime: 0, openPMs: [],
};

// ══════════════════════════════════════════════════════════════
//  ХЕЛПЕРЫ: НИК С ТЕГОМ БАНДЫ, LAST SEEN
// ══════════════════════════════════════════════════════════════
function formatNickWithTag(name, tag) {
  const safeName = escapeHtml(name || "");
  if (!tag) return safeName;
  return `<span class="gang-tag">[${escapeHtml(tag)}]</span> ${safeName}`;
}

function formatLastSeen(ts) {
  if (!ts || Number(ts) === 0) return "давно";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(ts);
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff / 60) + " мин назад";
  if (diff < 86400) return Math.floor(diff / 3600) + " ч назад";
  if (diff < 604800) return Math.floor(diff / 86400) + " дн назад";
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("ru-RU", {day:"numeric", month:"short"});
}

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
  // ═══ ГОЛОВА ═══
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

  // ═══ КЕЙСОВЫЕ ═══
  h_case_bandit: `<path d="M72 42 Q100 15 128 42 L128 48 L72 48 Z" fill="#1a1a1a"/><path d="M128 42 L158 48 L155 54 L128 48 Z" fill="#0a0a0a"/><path d="M72 42 Q100 15 128 42 L128 48 L72 48 Z" fill="#1a1a1a" opacity="0.9"/><ellipse cx="100" cy="48" rx="30" ry="8" fill="#000" opacity="0.5"/>`,
  b_case_tracksuit: `<path d="M68 100 L68 205 L132 205 L132 100 Q120 95 100 95 Q80 95 68 100 Z" fill="#1a1a1a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><path d="M75 115 L125 115 M75 125 L125 125" stroke="#fff" stroke-width="2"/><path d="M75 140 L75 205 M85 140 L85 205 M95 140 L95 205 M105 140 L105 205 M115 140 L115 205 M125 140 L125 205" stroke="#fff" stroke-width="1" opacity="0.4"/>`,
  h_case_rooster: `<ellipse cx="100" cy="55" rx="30" ry="35" fill="#ffd700"/><path d="M88 22 L95 5 L100 22 L105 5 L112 22 Z" fill="#e74c3c"/><circle cx="87" cy="48" r="6" fill="#fff"/><circle cx="87" cy="48" r="3" fill="#1a1a1a"/><circle cx="113" cy="48" r="6" fill="#fff"/><circle cx="113" cy="48" r="3" fill="#1a1a1a"/><path d="M90 65 L100 78 L110 65 L100 85 Z" fill="#e67e22" stroke="#8b0000" stroke-width="1.5"/><circle cx="75" cy="40" r="2" fill="#fff" opacity="0.7"/>`,
  b_case_chains: `<path d="M70 95 L70 205 L130 205 L130 95 Z" fill="#1a1a1a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#1a1a1a"/><g stroke="#d4d4d4" stroke-width="2" fill="none"><circle cx="82" cy="125" r="4"/><circle cx="82" cy="135" r="4"/><circle cx="82" cy="145" r="4"/><circle cx="82" cy="155" r="4"/><circle cx="82" cy="165" r="4"/><circle cx="118" cy="125" r="4"/><circle cx="118" cy="135" r="4"/><circle cx="118" cy="145" r="4"/><circle cx="118" cy="155" r="4"/><circle cx="118" cy="165" r="4"/></g><text x="100" y="185" text-anchor="middle" font-size="10" fill="#fff" font-weight="900">CHAIN</text>`,
  h_case_gold_uzi: `<path d="M70 32 L74 6 L84 20 L100 2 L116 20 L126 6 L130 32 Z" fill="#ffd700" stroke="#b8860b" stroke-width="2"/><circle cx="100" cy="18" r="4" fill="#e74c3c"/><circle cx="84" cy="20" r="3" fill="#3498db"/><circle cx="116" cy="20" r="3" fill="#3498db"/><path d="M130 32 L155 50" stroke="#ffd700" stroke-width="4" stroke-linecap="round"/><circle cx="130" cy="32" r="2" fill="#b8860b"/>`,
  h_case_crypto: `<circle cx="100" cy="55" r="32" fill="#f39c12"/><circle cx="100" cy="55" r="26" fill="#d68910"/><text x="100" y="65" text-anchor="middle" font-size="30" fill="#fff" font-weight="900">₿</text><circle cx="90" cy="50" r="2" fill="#1a1a1a"/><circle cx="110" cy="50" r="2" fill="#1a1a1a"/>`,
  b_case_armani_real: `<path d="M70 100 L70 205 L90 205 L100 175 L110 205 L130 205 L130 100 Q120 95 100 95 Q80 95 70 100 Z" fill="#0a0a0a"/><rect x="52" y="100" width="20" height="95" rx="8" fill="#0a0a0a"/><rect x="128" y="100" width="20" height="95" rx="8" fill="#0a0a0a"/><path d="M100 175 L88 100 M100 175 L112 100" stroke="#2c3e50" stroke-width="1.5" fill="none"/><circle cx="100" cy="160" r="2.5" fill="#f39c12"/><path d="M88 95 L100 110 L112 95" stroke="#2c3e50" stroke-width="1" fill="none"/><path d="M84 120 L116 120" stroke="#f39c12" stroke-width="1"/>`,
  h_case_helmet_alpha: `<ellipse cx="100" cy="55" rx="34" ry="36" fill="#0a0a0a"/><path d="M66 50 Q100 40 134 50 L134 55 Q100 65 66 55 Z" fill="#1a1a1a"/><ellipse cx="88" cy="52" rx="9" ry="5" fill="#3498db" opacity="0.4"/><ellipse cx="112" cy="52" rx="9" ry="5" fill="#3498db" opacity="0.4"/><path d="M78 70 L122 70" stroke="#333" stroke-width="2"/><rect x="94" y="20" width="12" height="6" fill="#f39c12" rx="2"/><circle cx="88" cy="52" r="3" fill="#2ecc71"/><circle cx="112" cy="52" r="3" fill="#2ecc71"/>`,
  rh_case_uzi_gold: `<g transform="translate(140,197)"><rect x="-6" y="0" width="22" height="8" rx="1" fill="#ffd700"/><rect x="-4" y="8" width="8" height="14" fill="#d4ac0d"/><rect x="10" y="-4" width="4" height="10" fill="#d4ac0d"/><circle cx="16" cy="4" r="2" fill="#b8860b"/><rect x="-8" y="-4" width="18" height="3" fill="#ffd700"/></g>`,
  lh_case_brilliant: `<g transform="translate(45,190)"><rect x="0" y="0" width="30" height="22" rx="3" fill="#3498db"/><rect x="0" y="6" width="30" height="2" fill="#2874a6"/><circle cx="15" cy="-2" r="4" fill="none" stroke="#3498db" stroke-width="2"/><path d="M8 10 L12 16 L18 16 L22 10 Z" fill="#e74c3c"/><path d="M10 12 L14 14 L20 14 L22 12" stroke="#fff" stroke-width="0.5" fill="none"/><circle cx="15" cy="13" r="1" fill="#fff" opacity="0.9"/><circle cx="6" cy="18" r="1" fill="#f39c12"/><circle cx="24" cy="18" r="1" fill="#f39c12"/></g>`,
  rh_case_knife: `<g transform="translate(140,197)"><rect x="-5" y="-3" width="10" height="20" rx="2" fill="#1a1a1a"/><path d="M-5 -3 L5 -3 L4 -25 L-4 -25 Z" fill="#d4d4d4"/><path d="M-4 -25 L4 -25 L4 -22 L-4 -22 Z" fill="#9a9a9a"/><circle cx="0" cy="-8" r="2" fill="#1a1a1a"/><rect x="-6" y="17" width="12" height="3" rx="1" fill="#333"/></g>`,
  l_case_adidas: `<rect x="75" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><rect x="101" y="205" width="24" height="160" rx="4" fill="#1a1a1a"/><path d="M80 215 L80 355 M84 215 L84 355 M88 215 L88 355" stroke="#fff" stroke-width="1.5"/><path d="M106 215 L106 355 M110 215 L110 355 M114 215 L114 355" stroke="#fff" stroke-width="1.5"/><path d="M75 355 L99 355 M101 355 L125 355" stroke="#fff" stroke-width="2"/><circle cx="87" cy="240" r="2" fill="#f39c12"/><circle cx="87" cy="280" r="2" fill="#f39c12"/><circle cx="113" cy="240" r="2" fill="#f39c12"/><circle cx="113" cy="280" r="2" fill="#f39c12"/>`,
  l_case_gold_shorts: `<path d="M72 200 L72 260 L100 260 L100 200 Z" fill="#ffd700"/><path d="M100 200 L100 260 L128 260 L128 200 Z" fill="#ffd700"/><path d="M72 200 L128 200 L128 215 L72 215 Z" fill="#d4ac0d"/><path d="M80 240 L92 240 M108 240 L120 240 M80 250 L92 250 M108 250 L120 250" stroke="#fff" stroke-width="1.5" opacity="0.7"/><circle cx="85" cy="225" r="2" fill="#fff"/><circle cx="115" cy="225" r="2" fill="#fff"/><circle cx="100" cy="235" r="2" fill="#fff"/>`,
  h_case_dragon: `<path d="M68 42 Q100 15 132 42 L132 52 Q100 62 68 52 Z" fill="#2c3e50"/><path d="M78 32 Q82 18 88 28 L88 35 Z" fill="#1a252f"/><path d="M112 32 Q118 18 122 28 L122 35 Z" fill="#1a252f"/><ellipse cx="88" cy="50" rx="8" ry="5" fill="#e74c3c"/><ellipse cx="112" cy="50" rx="8" ry="5" fill="#e74c3c"/><circle cx="88" cy="50" r="2" fill="#000"/><circle cx="112" cy="50" r="2" fill="#000"/><path d="M95 60 Q100 62 105 60" stroke="#e74c3c" stroke-width="2" fill="none"/><path d="M98 52 L96 62 L100 60 Z" fill="#f39c12"/>`,
  b_case_dragon_armor: `<path d="M70 95 L130 95 L130 205 L70 205 Z" fill="#2c3e50"/><path d="M70 95 L75 105 L75 205 L70 205 Z" fill="#1a252f"/><path d="M130 95 L125 105 L125 205 L130 205 Z" fill="#1a252f"/><rect x="85" y="125" width="30" height="60" fill="#1a252f"/><path d="M85 130 L100 120 L115 130" stroke="#e74c3c" stroke-width="2" fill="none"/><path d="M85 180 L100 190 L115 180" stroke="#e74c3c" stroke-width="2" fill="none"/><path d="M75 120 Q100 115 125 120" stroke="#f39c12" stroke-width="1.5" fill="none"/><path d="M75 190 Q100 195 125 190" stroke="#f39c12" stroke-width="1.5" fill="none"/><ellipse cx="100" cy="155" rx="8" ry="12" fill="#e74c3c"/>`,
  rh_case_dragon_sword: `<g transform="translate(140,197)"><rect x="-6" y="-3" width="12" height="20" rx="2" fill="#2c3e50"/><rect x="-6" y="-3" width="12" height="3" fill="#f39c12"/><path d="M-5 -3 L5 -3 L4 -65 L-4 -65 Z" fill="#d4d4d4"/><path d="M-4 -65 L4 -65 L3 -60 L-3 -60 Z" fill="#9a9a9a"/><path d="M-2 -55 L2 -55 M-2 -45 L2 -45 M-2 -35 L2 -35 M-2 -25 L2 -25 M-2 -15 L2 -15" stroke="#f39c12" stroke-width="1.2"/><circle cx="0" cy="-65" r="2" fill="#e74c3c"/><path d="M-8 17 L8 17" stroke="#f39c12" stroke-width="2"/></g>`,
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
async function api(method, body = {}, retry = true) {
  let res;
  try {
    res = await fetch(`/api/${method}`, {
      method: "POST",
      headers: {"Content-Type":"application/json", "X-Init-Data": initData},
      body: JSON.stringify(body),
    });
  } catch(e) { throw new Error("Нет связи"); }
  if (res.status === 511) throw new Error("Туннель требует пароль");
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    const errMsg = err.error || `HTTP ${res.status}`;
    if (retry && method === "register" && errMsg.toLowerCase().includes("already registered")) {
      console.log("Найден битый персонаж — авто-reset");
      try {
        await fetch(`/api/reset`, {
          method: "POST",
          headers: {"Content-Type":"application/json", "X-Init-Data": initData},
          body: JSON.stringify({}),
        });
        return await api(method, body, false);
      } catch(e) { console.warn("Reset failed:", e); }
    }
    throw new Error(errMsg);
  }
  return res.json();
}

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function show(id) { $$(".screen").forEach(x=>x.classList.remove("active")); $(`#${id}`).classList.add("active"); window.scrollTo(0,0); }
function showTab(tab) {
  if (tab === "home" && state.player) {
    setTimeout(() => renderCharacterInto("#character-view"), 0);
  }
  $$(".tab-content").forEach(c=>c.classList.remove("active"));
  $(`.tab-content[data-tab="${tab}"]`).classList.add("active");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.nav===tab));
  if (typeof stopChatPolling === "function") stopChatPolling();
  if (tab==="appearance") loadAppearance();
  if (tab==="work") loadWork();
  if (tab==="business") loadBusinesses();
  if (tab==="casino") renderCasino();
  if (tab==="people") loadPeople();
  if (tab==="ghetto" && typeof renderGhetto === "function") renderGhetto();
  if (tab==="referral") renderReferral();
  if (tab==="chat") startChatPolling();
  if (tab==="more") { updateMoreBadges(); checkAdminAccess(); }
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
function closeModal() {
  $("#modal").classList.add("hidden");
  if (pvpTimerInterval && !pvpCurrentBattle) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
}
$("#modal-close").addEventListener("click", closeModal);
$("#modal").addEventListener("click", e=>{if(e.target.id==="modal")closeModal();});
function _onlineHtml(isOnline) {
  const cls = isOnline ? 'on' : 'off';
  const label = isOnline ? 'Онлайн' : 'Оффлайн';
  return `<span class="online-status ${cls}"><span class="online-dot ${cls}"></span>${label}</span>`;
}

async function updateChatBadge() {
  try {
    const d = await api("chat/pm/unread_count", {});
    let badge = document.getElementById("chat-nav-badge");
    const navBtn = document.querySelector('.nav-btn[data-nav="chat"]');
    if (!navBtn) return;
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "chat-nav-badge";
      badge.className = "nav-badge";
      navBtn.style.position = "relative";
      navBtn.appendChild(badge);
    }
    if (d.count > 0) {
      badge.textContent = d.count > 99 ? "99+" : d.count;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  } catch(_) {}
}

async function loadConversations() {
  try {
    const d = await api("chat/pm/conversations", {});
    if (!state.openPMs) state.openPMs = [];
    for (const c of (d.conversations || [])) {
      if (!state.openPMs.find(x => Number(x.uid) === Number(c.user_id))) {
        state.openPMs.push({uid: c.user_id, name: c.nickname, tag: c.gang_tag, unread: c.unread});
      } else {
        const existing = state.openPMs.find(x => Number(x.uid) === Number(c.user_id));
        existing.unread = c.unread;
        existing.tag = c.gang_tag;
      }
    }
    renderChatTabs();
  } catch(_) {}
}

async function loadOnlineCount() {
  try {
    const d = await api("online_count", {});
    const el = document.getElementById("online-count");
    if (el) el.textContent = d.count;
  } catch(_) {}
}

function fmtMoney(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toLocaleString("ru-RU");
}

function _itemStatsHtml(it, mode) {
  const hp = (it && it.hp) || 0;
  const dmg = (it && it.damage) || 0;
  if (!hp && !dmg) return '';
  const parts = [];
  if (hp) parts.push(`<span class="s-hp">❤️ +${hp} HP</span>`);
  if (dmg) parts.push(`<span class="s-dmg">⚔️ +${dmg} DMG</span>`);
  const cls = 'item-stats' + (mode && mode !== 'inline' ? ' ' + mode : '');
  return `<div class="${cls}">${parts.join(' · ')}</div>`;
}

async function refreshPlayer() {
  try {
    const d = await api("me");
    if (d.registered) {
      state.player = d.player;
      renderPlayer();
      renderCharacterInto("#character-view");
      if (typeof loadWork === 'function') loadWork();
      if (typeof loadBusinesses === 'function') loadBusinesses();
    }
  } catch(e) { console.error("refreshPlayer error:", e); }
}

async function boot() {
  if (!initData) {
    document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#fff;">Открой через Telegram-бота</div>';
    return;
  }
  try {
    const d = await api("me");
    if (!d.registered) { show("register"); renderRegister(); }
    else {
      state.player = d.player;
      state.classInfo = d.class || { name: d.player.class_name, emoji: d.player.class_emoji };
      show("main"); renderPlayer();
      showTab("home"); checkAdminAccess();
      updateChatBadge();
      loadOnlineCount();
      if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
      if (d.credit_paid) setTimeout(() => toast(`💸 Банк списал ${fmtMoney(d.credit_paid)}₽`, "error"), 800);
    }
  } catch(e) {
    console.error("boot error:", e);
    toast("Ошибка загрузки: " + e.message, "error");
    show("register"); renderRegister();
  }
}

let registerSetup = false;
function renderRegister() {
  const nick = $("#nickname"), btn = $("#btn-register");
  if (!nick || !btn) return;

  btn.disabled = nick.value.trim().length < 2;

  if (!registerSetup) {
    nick.addEventListener("input", () => btn.disabled = nick.value.trim().length < 2);
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const startParam = tg?.initDataUnsafe?.start_param;
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');
        let referrer_id = startParam || refFromUrl;
        if (referrer_id && String(referrer_id).startsWith("ref_")) {
            referrer_id = String(referrer_id).slice(4);
        }
        const d = await api("register", { nickname: nick.value.trim(), referrer_id });
        state.player = d.player;
        renderPlayer(); renderCharacterInto("#character-view");
        show("main"); showTab("home");
        if (tg) tg.HapticFeedback?.notificationOccurred("success");
        toast("🎉 Добро пожаловать! Ты голый — загляни в Шмот", "success");
      } catch (e) {
        toast(e.message, "error");
        btn.disabled = false;
      }
    });
    registerSetup = true;
  }
}

function renderPlayer() {
  const p = state.player; if (!p) return;
  $("#nick").innerHTML = p.gang_tag
    ? `<span class="gang-tag">[${escapeHtml(p.gang_tag)}]</span> ${escapeHtml(p.nickname)}`
    : escapeHtml(p.nickname);
  const hasClothes = p.outfit.head_id.item_id || p.outfit.body_id.item_id || p.outfit.legs_id.item_id;
  $("#subtitle").textContent = `Ур. ${p.level} · ${hasClothes ? "модник" : "голый бомж"}`;
  $("#money").textContent = fmtMoney(p.balance);
  $("#char-name").innerHTML = p.gang_tag
    ? `<span class="gang-tag">[${escapeHtml(p.gang_tag)}]</span> ${escapeHtml(p.nickname)}`
    : escapeHtml(p.nickname);
  $("#char-level").textContent = p.level;
  (function(){
    const cs = p.combat_stats || {};
    const parts = [];
    if (cs.hp) parts.push(`<span class="s-hp">\u2764\ufe0f ${cs.hp} HP</span>`);
    if (cs.damage) parts.push(`<span class="s-dmg">\u2694\ufe0f ${cs.damage} DMG</span>`);
    const csEl = document.getElementById("char-stats");
    if (csEl) csEl.innerHTML = parts.join(" \u00b7 ");
  })();
  const pct = p.xp_next > 0 ? Math.min(100, p.xp/p.xp_next*100) : 0;
  $("#xp-fill").style.width = pct+"%";
  $("#xp-text").textContent = `${p.xp}/${p.xp_next} XP`;
  $("#avatar").textContent = p.outfit.head_id.item_id ? p.outfit.head_id.emoji : "👤";
  startTimers();
  renderCreditBanner();
}

let timerInterval = null;
function startTimers() {
  if (timerInterval) clearInterval(timerInterval);
  updateTimers();
  timerInterval = setInterval(updateTimers, 1000);
}

function updateTimers() {
  if (state.jobsCache && document.querySelector('.tab-content[data-tab="work"]') && document.querySelector('.tab-content[data-tab="work"]').classList.contains('active')) {
    renderJobs(state.jobsCache);
  }
  const p = state.player;
  if (!p) return;
  const dailyBtn = $("#daily-btn");
  const dailyTimer = $("#daily-timer");
  if (dailyBtn && dailyTimer) {
    const now = Math.floor(Date.now()/1000);
    const cd = p.last_daily ? (p.last_daily + 86400) - now : 0;
    if (cd <= 0) {
      dailyBtn.style.opacity = "1";
      dailyBtn.style.cursor = "pointer";
      dailyTimer.textContent = "✅";
      dailyTimer.classList.remove("hidden");
    } else {
      dailyBtn.style.opacity = "0.6";
      dailyTimer.textContent = formatTime(cd);
      dailyTimer.classList.remove("hidden");
    }
  }
  const rouletteTimer = $("#roulette-timer");
  if (rouletteTimer && p.last_roulette !== undefined) {
    const nowR = Math.floor(Date.now()/1000);
    const cdR = p.last_roulette ? (p.last_roulette + 21600) - nowR : 0;
    if (cdR <= 0) {
      rouletteTimer.textContent = "✅";
      rouletteTimer.classList.add("ready");
    } else {
      rouletteTimer.textContent = formatTime(cdR);
      rouletteTimer.classList.remove("ready");
    }
  }
  renderCreditBanner();
}

function formatTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}д ${h}ч`;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

function renderCreditBanner() {
  const p = state.player;
  const banner = $("#credit-banner");
  if (!banner || !p) return;
  const debt = p.credit_amount || 0;
  if (debt <= 0) {
    banner.classList.add("hidden");
    return;
  }
  banner.classList.remove("hidden");
  const now = Math.floor(Date.now()/1000);
  const due = p.credit_due || 0;
  const left = due - now;
  $("#cb-amount").textContent = fmtMoney(debt) + "₽";
  if (left <= 0) {
    banner.classList.add("overdue");
    $("#cb-timer").textContent = "🔴 ПРОСРОЧЕН · списывается автоматически";
  } else {
    banner.classList.remove("overdue");
    $("#cb-timer").textContent = `⏳ Вернуть через ${formatTime(left)}`;
  }
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
function checkCreditPaid(d) {
  if (d && d.credit_paid && d.credit_paid > 0) {
    setTimeout(() => toast(`💸 Банк списал ${fmtMoney(d.credit_paid)}₽ в счёт долга`, "error"), 600);
  }
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

  let modeHtml = `<div class="mode-switch">
    <button class="mode-btn ${state.appearanceMode==='shop'?'active':''}" onclick="setAppearanceMode('shop')">🛒 Магазин</button>
    <button class="mode-btn ${state.appearanceMode==='inventory'?'active':''}" onclick="setAppearanceMode('inventory')">🎒 Инвентарь</button>
  </div>`;

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
          <div class="item-meta">${it.desc}</div>${_itemStatsHtml(it)}
        </div>
        <div class="item-price ${canAfford?'':'disabled'}">${fmtMoney(it.price)}₽</div>
      </div>`;
    }).join("");
  } else {
    const equipped = [];
    for (const [slot, item] of Object.entries(p.outfit)) {
      if (item.item_id) equipped.push({slot, item});
    }
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
        <div class="item-info"><div class="item-name" style="color:${it.rarity_color}">${it.name}</div><div class="item-meta">${it.desc}</div>${_itemStatsHtml(it)}</div>
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
    <p style="color:var(--hint);text-align:center;margin-bottom:16px">${it.desc}</p>${_itemStatsHtml(it, 'block')}
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
    const d = await api("jobs", {});
    state.jobsCache = d;
    renderJobs(d);
  } catch(e) { toast(e.message, "error"); }
}

async function loadBusinesses() {
  try {
    const d = await api("businesses", {});
    state.businessesCache = d;
    renderBusinesses(d);
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
    checkCreditPaid(d);
    toast(`💼 +${d.earned}₽ · +${d.xp} XP`, "success");
    if (d.levels) toast(`🎉 Уровень ${d.player.level}!`, "success");
    if (d.new_achievements?.length) notifyAchievements(d.new_achievements);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); loadWork(); }
}
function renderBusinesses(data) {
  const list = document.getElementById("businesses-list");
  if (!list) return;

  const arr = Array.isArray(data) ? data : (data.businesses || []);
  let totalPending = 0;
  list.innerHTML = "";

  if (arr.length === 0) {
    list.innerHTML = '<div style="color:var(--hint);text-align:center;padding:20px;">Нет доступных бизнесов</div>';
    const totalEl = document.getElementById("business-total-pending");
    if (totalEl) totalEl.textContent = "0₽";
    return;
  }

  arr.forEach(b => {
    const pending = b.pending || 0;
    totalPending += pending;
    const income = b.income || 0;
    const name = b.name || 'Бизнес';
    const emoji = b.emoji || '🏢';
    const level = b.level || 1;

    let actionHtml = "";
    if (!b.owned) {
      actionHtml = `<button class="btn btn-primary" style="width:100%;margin-top:10px;" onclick="buyBusiness('${b.id}')">Купить за ${fmtMoney(b.price)}₽</button>`;
    } else {
      let upgradeHtml = "";
      if (level < 3) {
        const cost = Math.floor(b.price * (level === 1 ? 1.3 : 1.7));
        upgradeHtml = `<button class="btn btn-secondary" style="flex:1;margin-right:8px;font-size:12px;padding:8px;" onclick="upgradeBusiness('${b.id}')">⭐ Улучшить (${fmtMoney(cost)}₽)</button>`;
      } else {
        upgradeHtml = `<button class="btn btn-secondary" style="flex:1;margin-right:8px;font-size:12px;padding:8px;" disabled>⭐ Макс. уровень</button>`;
      }

      actionHtml = `
        <div style="display:flex;margin-top:10px;">
          ${upgradeHtml}
          <button class="btn btn-primary" style="flex:1;font-size:12px;padding:8px;" onclick="collectBusiness()">💰 Забрать</button>
        </div>
      `;
    }

    list.innerHTML += `
      <div class="business-card" style="background:var(--bg-2);border-radius:16px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.05);box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="font-weight:900;font-size:16px;color:#fff;">${emoji} ${name}</div>
            ${b.owned ? `<div style="background:rgba(243,156,18,0.15);color:#f39c12;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:bold;">Ур. ${level}</div>` : ''}
         </div>
         <div style="font-size:12px;color:var(--hint);margin-top:4px;">Доход: ${fmtMoney(income)}₽/ч</div>
         ${b.owned ? `
         <div style="margin-top:12px;background:#111;padding:12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid #222;">
            <div>
              <div style="font-size:10px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">Накоплено</div>
              <div style="font-size:18px;font-weight:900;color:#2ecc71;">${fmtMoney(pending)}₽</div>
            </div>
         </div>` : ''}
         ${actionHtml}
      </div>
    `;
  });

  const totalEl = document.getElementById("business-total-pending");
  if (totalEl) totalEl.textContent = fmtMoney(totalPending) + "₽";
}

async function buyBusiness(id) {
  try {
    const d = await api("buy_business", { business_id: id });
    if (d.error) {
      if (d.required !== undefined && d.balance !== undefined) {
        throw new Error(`Не хватает денег! Цена: ${fmtMoney(d.required)}₽, у тебя: ${fmtMoney(d.balance)}₽`);
      }
      throw new Error(d.error);
    }
    toast("🏢 Бизнес куплен!", "success");
    if (d.player) { state.player = d.player; renderPlayer(); }
    loadBusinesses();
  } catch(e) {
    toast(e.message, "error");
    try {
      const me = await api("me");
      if (me.player) { state.player = me.player; renderPlayer(); }
    } catch(_) {}
  }
}

async function upgradeBusiness(id) {
  try {
    const d = await api("upgrade_business", { business_id: id });
    if (d.error) {
      if (d.required !== undefined && d.balance !== undefined) {
        throw new Error(`Не хватает денег! Цена: ${fmtMoney(d.required)}₽, у тебя: ${fmtMoney(d.balance)}₽`);
      }
      throw new Error(d.error);
    }
    toast("⭐ Бизнес улучшен!", "success");
    if (d.player) { state.player = d.player; renderPlayer(); }
    loadBusinesses();
  } catch(e) {
    toast(e.message, "error");
    try {
      const me = await api("me");
      if (me.player) { state.player = me.player; renderPlayer(); }
    } catch(_) {}
  }
}

async function collectBusiness() {
  try {
    const d = await api("collect_business", {});
    if (d.error) throw new Error(d.error);

    const collected = d.collected || d.pending || 0;
    if (collected > 0) toast(`💰 Собрано: ${fmtMoney(collected)}₽`, "success");
    else toast("Нечего собирать", "error");

    if (d.player) {
      state.player = d.player;
      document.getElementById("money").textContent = fmtMoney(state.player.balance);
    }
    loadBusinesses();
  } catch(e) {
    toast(e.message, "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  КАЗИНО
// ══════════════════════════════════════════════════════════════
const CASINO = {
  coin:     {name:"Монетка", emoji:"🪙", display:"🪙", desc:"Орёл/решка — x2"},
  dice:     {name:"Кости",   emoji:"🎲", display:"🎲", desc:"Больше 3 — x1.8"},
  red:      {name:"Рулетка: красное", emoji:"🔴", display:"🔴", desc:"Красное — x2"},
  black:    {name:"Рулетка: чёрное",  emoji:"⚫", display:"⚫", desc:"Чёрное — x2"},
  zero:     {name:"Рулетка: зеро",    emoji:"🟢", display:"🟢", desc:"Зеро — x35"},
  jackpot:  {name:"Джекпот", emoji:"💎", display:"💎", desc:"8% шанс — x10"},
  slots:    {name:"Слоты",   emoji:"🎰", display:"🎰", desc:"3 в ряд — x5"},
};


function doubleBet() {
  const inp = $("#bet-input");
  if (!inp) return;
  const cur = parseInt(inp.value) || 0;
  inp.value = Math.max(1, cur * 2);
}
function halveBet() {
  const inp = $("#bet-input");
  if (!inp) return;
  const cur = parseInt(inp.value) || 0;
  inp.value = Math.max(1, Math.floor(cur / 2));
}
function setBet(v) {
  const inp = $("#bet-input");
  if (v === "max") inp.value = state.player.balance;
  else inp.value = v;
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
  players = [...players].sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));
  $("#players-list").innerHTML = players.map(p=>`
    <div class="player-card" onclick="viewPlayer(${p.user_id})">
      <div class="player-avatar">👤</div>
      <div class="player-info">
        <div class="player-name">${formatNickWithTag(p.nickname, p.gang_tag)}</div>
        <div class="player-meta">Ур. ${p.level} · ${_onlineHtml(p.is_online)}${!p.is_online && p.last_seen ? ` · <span class="last-seen">${formatLastSeen(p.last_seen)}</span>` : ''}</div>
      </div>
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
    const isMe = uid === state.player.user_id;
    const stats = d.combat_stats || {hp: 100, damage: 5};
    const onlineInfo = d.is_online
      ? _onlineHtml(true)
      : `${_onlineHtml(false)}${d.last_seen ? ` · <span class="last-seen">🕐 Был(а) в сети: ${formatLastSeen(d.last_seen)}</span>` : ''}`;
    openModal(`
      <div class="shop-preview">${renderCharacterSVG(d.outfit, {width: 170, height: 340})}</div>
      <h2 style="text-align:center;margin-bottom:4px">${formatNickWithTag(d.nickname, d.gang_tag)}</h2>
      <div style="text-align:center;margin-bottom:8px;">${onlineInfo}</div>
      <div style="text-align:center;margin:12px 0">
        <div style="font-size:16px;font-weight:700">Ур. ${d.level}</div>
        <div style="color:var(--money);font-weight:700;margin-top:4px">💰 ${fmtMoney(d.balance)}₽</div>
        <div style="color:var(--hint);font-size:13px;margin-top:4px">Бизнесов: ${d.businesses_count}</div>
        <div style="font-size:12px;margin-top:8px;padding:6px 12px;background:var(--bg-3);border-radius:8px;display:inline-block">
          ❤️ ${stats.hp} HP · ⚔️ ${stats.damage} DMG
        </div>
        <div style="font-size:20px;margin-top:8px">${ach}</div>
      </div>
      ${!isMe ? `<button class="btn btn-primary" style="background:linear-gradient(135deg,#c0392b,#e74c3c);margin-bottom:8px" onclick="challengePvP(${uid}, '${d.nickname}')">⚔️ Гоп-стоп</button>` : ''}
      ${!isMe ? `<button class="btn btn-primary" onclick="showTradeOffer(${uid}, '${d.nickname}')">🤝 Трейд</button>` : ''}
      ${!isMe && !d.is_friend && !d.friend_pending ? `<button class="btn btn-secondary" onclick="sendFriendRequest(${uid})">➕ В друзья</button>` : ''}
      ${!isMe && d.friend_pending ? `<button class="btn btn-secondary" disabled>⏳ Заявка отправлена</button>` : ''}
      ${!isMe && d.is_friend ? `<button class="btn btn-secondary" onclick="openPM(${uid}, '${d.nickname}', '${d.gang_tag || ''}')">✉️ Написать ЛС</button>` : ''}
      ${!isMe && d.is_friend ? `<button class="btn btn-secondary" style="background:rgba(231,76,60,.15);color:var(--danger);border:1px solid rgba(231,76,60,.3);" onclick="removeFriend(${uid}, '${d.nickname}')">❌ Удалить из друзей</button>` : ''}
      ${!isMe && d.my_role && ['leader','deputy'].includes(d.my_role) && !d.target_in_gang ? `<button class="btn btn-secondary" onclick="inviteToGang(${uid}, '${d.nickname}')">📨 Пригласить в банду</button>` : ''}
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
      <div class="trade-title">📥 От ${formatNickWithTag(t.other_nickname, t.other_gang_tag)}</div>
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
        <div class="trade-title">К ${formatNickWithTag(t.other_nickname, t.other_gang_tag)}</div>
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
  renderCreditBanner();
}

async function showCrypto() {
  let d;
  try { d = await api("crypto/price", {}); }
  catch(e) { toast("Не удалось загрузить цену", "error"); return; }

  const p = state.player;
  const price = d.price;
  // ═══ Берём последние 8 часов из истории ═══
  const fullHistory = d.history || [];
  const history = fullHistory.length > 8 ? fullHistory.slice(-8) : fullHistory;
  const feePct = d.fee_pct || 5;
  const coins = Number(p.crypto_amount || 0);
  const coinsRub = Math.floor(coins * price);

  const w = 300, h = 120, pad = 16;
  let chartHtml = '<div style="color:var(--hint);text-align:center;padding:20px;">Нет данных</div>';
  if (history.length > 1) {
    const minP = Math.min(...history);
    const maxP = Math.max(...history);
    const range = Math.max(1, maxP - minP);
    const pts = history.map((v, i) => {
      const x = pad + (w - 2*pad) * i / (history.length - 1);
      const y = h - pad - (h - 2*pad) * (v - minP) / range;
      return {x, y, v};
    });
    const poly = pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
    const area = `${pad},${h-pad} ${poly} ${w-pad},${h-pad}`;

    const first = history[0];
    const last = history[history.length - 1];
    const change = last - first;
    const changePct = first ? ((change / first) * 100) : 0;
    const trendColor = change >= 0 ? "#2ecc71" : "#e74c3c";
    const trendArrow = change >= 0 ? "▲" : "▼";
    const trendSign = change >= 0 ? "+" : "";

    // Метки времени: последние 8 часов, правый = текущий
    const nowHour = new Date().getHours();
    const hourLabels = [];
    for (let i = 0; i < history.length; i++) {
      const hour = (nowHour - (history.length - 1) + i + 24) % 24;
      hourLabels.push(hour);
    }

    // Сетка на каждом часе
    const gridLines = hourLabels.map((_, i) => {
      if (i === 0 || i === history.length - 1) return "";
      const x = pad + (w - 2*pad) * i / (history.length - 1);
      return `<line x1="${x}" y1="${pad}" x2="${x}" y2="${h-pad}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="2,2"/>`;
    }).join("");

    // Подписи под графиком — все 8 штук крупные
    const timeLabelsHtml = hourLabels.map((hr, i) => {
      const xPercent = ((pad + (w - 2*pad) * i / (history.length - 1)) / w) * 100;
      const isNow = i === history.length - 1;
      const text = `${String(hr).padStart(2,'0')}:00`;

      let transform = 'translateX(-50%)';
      if (i === 0) transform = 'translateX(0)';
      if (i === history.length - 1) transform = 'translateX(-100%)';

      const style = isNow
        ? `font-weight:900;color:${trendColor};font-size:11px;`
        : `font-weight:700;color:var(--text);font-size:10px;opacity:0.85;`;

      return `<span style="position:absolute;left:${xPercent}%;transform:${transform};${style}white-space:nowrap;top:0;">${text}</span>`;
    }).join("");

    chartHtml = `
      <div style="background:var(--bg-3);border-radius:12px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;color:var(--hint);font-weight:700;">8 ЧАСОВ</span>
          <span style="font-size:13px;font-weight:800;color:${trendColor};">${trendArrow} ${trendSign}${change}₽ (${trendSign}${changePct.toFixed(1)}%)</span>
        </div>
        <svg viewBox="0 0 ${w} ${h}" width="100%" height="120" preserveAspectRatio="none">
          <polygon points="${area}" fill="rgba(82,136,193,0.15)"/>
          ${gridLines}
          <polyline points="${poly}" fill="none" stroke="${trendColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <circle cx="${pts[pts.length-1].x}" cy="${pts[pts.length-1].y}" r="3.5" fill="${trendColor}"/>
        </svg>
        <div style="position:relative;height:16px;margin-top:6px;">
          ${timeLabelsHtml}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--hint);margin-top:4px;">
          <span>Мин: ${minP}₽</span>
          <span>Макс: ${maxP}₽</span>
        </div>
      </div>
    `;
  }

  openModal(`
    <h2>🪙 Крипто-биржа</h2>
    <p style="color:var(--hint);margin:8px 0 12px;text-align:center;font-size:12px;">Цена обновляется раз в час у всех игроков</p>

    <div style="background:var(--bg-3);border-radius:12px;padding:14px;margin-bottom:12px;text-align:center;">
      <div style="font-size:11px;color:var(--hint);text-transform:uppercase;letter-spacing:.5px;">Текущая цена</div>
      <div style="font-size:32px;font-weight:900;color:var(--money);margin-top:4px;">${price}₽</div>
      <div style="font-size:11px;color:var(--hint);margin-top:2px;">за 1 коин</div>
    </div>

    ${chartHtml}

    <div style="background:var(--bg-3);border-radius:12px;padding:14px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:var(--hint);font-size:12px;">У тебя коинов:</span>
        <b>${coins.toFixed(4)}</b>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:var(--hint);font-size:12px;">Стоимость:</span>
        <b style="color:var(--money);">${fmtMoney(coinsRub)}₽</b>
      </div>
    </div>

    <div style="margin-bottom:12px;">
      <label style="font-size:12px;color:var(--hint);">Купить на сумму (₽)</label>
      <input id="crypto-buy-amt" type="number" placeholder="Например 5000" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-top:4px;">
      <button class="btn btn-primary" onclick="buyCrypto()" style="margin-top:6px;">💰 Купить коины</button>
    </div>

    <div style="margin-bottom:8px;">
      <label style="font-size:12px;color:var(--hint);">Продать коины (шт.)</label>
      <input id="crypto-sell-amt" type="number" step="0.0001" placeholder="Например 5" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-top:4px;">
      <button class="btn btn-secondary" onclick="sellCrypto()" style="margin-top:6px;border:1px solid var(--danger);">💸 Продать</button>
    </div>

    <div style="background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.3);border-radius:8px;padding:10px;text-align:center;font-size:12px;color:#e74c3c;font-weight:700;">
      ⚠️ Комиссия на вывод: ${feePct}%
    </div>
  `);

  if (window._cryptoRefresh) clearInterval(window._cryptoRefresh);
  window._cryptoRefresh = setInterval(() => {
    const modal = document.getElementById("modal");
    if (!modal || modal.classList.contains("hidden")) {
      clearInterval(window._cryptoRefresh);
      window._cryptoRefresh = null;
      return;
    }
    api("crypto/price", {}).then(nd => {
      if (nd.price !== price) {
        const el = document.querySelector('#modal-body div[style*="Текущая цена"] + div');
        if (el) el.textContent = nd.price + "₽";
      }
    }).catch(()=>{});
  }, 60000);
}
async function buyCrypto() {
  const amt = parseInt($("#crypto-buy-amt").value) || 0;
  if (amt <= 0) { toast("Введи сумму", "error"); return; }
  try {
    const d = await api("crypto/buy", {amount: amt});
    state.player = d.player;
    renderPlayer();
    closeModal();
    toast(`✅ Куплено ${d.coins.toFixed(4)} коинов по ${d.price}₽`, "success");
  } catch(e) { toast(e.message, "error"); }
}
async function sellCrypto() {
  const amt = parseFloat($("#crypto-sell-amt").value) || 0;
  if (amt <= 0) { toast("Введи количество", "error"); return; }
  try {
    const d = await api("crypto/sell", {amount: amt});
    state.player = d.player;
    renderPlayer();
    closeModal();
    toast(`💰 +${fmtMoney(d.rub)}₽ (комиссия ${fmtMoney(d.fee)}₽)`, "success");
  } catch(e) { toast(e.message, "error"); }
}
function showCredit() {
  const p = state.player;
  if (p.credit_amount > 0) {
    const now = Math.floor(Date.now()/1000);
    const left = (p.credit_due || 0) - now;
    const overdue = left <= 0;
    const timerText = overdue
      ? `🔴 <b style="color:var(--danger)">ПРОСРОЧЕН</b> · банк списывает всё автоматически`
      : `⏳ Осталось: <b>${formatTime(left)}</b>`;
    openModal(`
      <h2>💸 Кредит банку</h2>
      <div style="margin:16px 0;padding:16px;background:var(--bg-3);border-radius:12px;text-align:center">
        <div style="font-size:12px;color:var(--hint);text-transform:uppercase;letter-spacing:.5px">Долг</div>
        <div style="font-size:32px;font-weight:900;color:var(--danger);margin:6px 0">${fmtMoney(p.credit_amount)}₽</div>
        <div style="font-size:13px;margin-top:8px">${timerText}</div>
      </div>
      <button class="btn btn-primary" onclick="payCredit()">💰 Погасить полностью</button>
    `);
    return;
  }
  let termsHtml = "";
  for (const t of [
    {hours:1, pct:5, label:"1 час"},
    {hours:3, pct:8, label:"3 часа"},
    {hours:6, pct:12, label:"6 часов"},
    {hours:12, pct:18, label:"12 часов"},
    {hours:24, pct:25, label:"1 день"},
    {hours:48, pct:35, label:"2 дня"},
  ]) {
    termsHtml += `<div class="credit-term" data-hours="${t.hours}" data-pct="${t.pct}" onclick="selectCreditTerm(this)">
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${t.label}</div>
        <div style="font-size:11px;color:var(--hint);margin-top:2px">процент ${t.pct}%</div>
      </div>
      <div class="credit-term-check" style="color:var(--success);font-weight:900;font-size:20px;display:none">✓</div>
    </div>`;
  }
  openModal(`
    <h2>💸 Взять кредит</h2>
    <p style="color:var(--hint);margin:12px 0;font-size:13px">Лимит: <b style="color:var(--money)">15 000₽</b></p>
    <label style="font-size:12px;color:var(--hint)">Сумма (₽)</label>
    <input id="credit-amt" type="number" min="1" max="15000" placeholder="Например 5000" style="width:100%;padding:12px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;margin-top:4px;font-size:16px" oninput="updateCreditPreview()">
    <label style="font-size:12px;color:var(--hint);display:block;margin-top:16px;margin-bottom:6px">Срок возврата</label>
    <div style="display:flex;flex-direction:column;gap:6px">${termsHtml}</div>
    <div id="credit-preview" style="margin-top:16px;padding:14px;background:var(--bg-3);border-radius:12px;text-align:center;display:none">
      <div style="font-size:12px;color:var(--hint)">К возврату через <span id="cp-term">—</span></div>
      <div style="font-size:24px;font-weight:900;color:var(--danger);margin-top:4px" id="cp-total">0₽</div>
      <div style="font-size:11px;color:var(--hint);margin-top:4px">(проценты: <span id="cp-pct">0₽</span>)</div>
    </div>
    <button class="btn btn-primary" id="credit-take-btn" disabled onclick="takeCredit()" style="margin-top:16px">💸 Взять кредит</button>
  `);
  document.querySelectorAll(".credit-term").forEach(el => {
    el.style.cssText = "display:flex;align-items:center;gap:8px;padding:12px;background:var(--bg-3);border-radius:10px;cursor:pointer;border:2px solid transparent;transition:all .2s";
  });
}

let creditSelectedTerm = null;
function selectCreditTerm(el) {
  document.querySelectorAll(".credit-term").forEach(x => {
    x.style.borderColor = "transparent";
    x.style.background = "var(--bg-3)";
    x.querySelector(".credit-term-check").style.display = "none";
  });
  el.style.borderColor = "var(--success)";
  el.style.background = "rgba(46,204,113,.1)";
  el.querySelector(".credit-term-check").style.display = "block";
  creditSelectedTerm = {hours: parseInt(el.dataset.hours), pct: parseInt(el.dataset.pct)};
  updateCreditPreview();
}

function updateCreditPreview() {
  const amt = parseInt($("#credit-amt")?.value) || 0;
  const preview = $("#credit-preview");
  const btn = $("#credit-take-btn");
  if (!preview || !btn) return;
  if (!creditSelectedTerm || amt < 1 || amt > 15000) {
    preview.style.display = "none";
    btn.disabled = true;
    return;
  }
  preview.style.display = "block";
  const total = Math.floor(amt * (1 + creditSelectedTerm.pct/100));
  const pct = total - amt;
  $("#cp-term").textContent = creditSelectedTerm.hours + (creditSelectedTerm.hours === 1 ? " час" : creditSelectedTerm.hours < 5 ? " часа" : " часов");
  $("#cp-total").textContent = fmtMoney(total) + "₽";
  $("#cp-pct").textContent = fmtMoney(pct) + "₽";
  btn.disabled = false;
}

async function takeCredit() {
  const amt = parseInt($("#credit-amt")?.value) || 0;
  if (!creditSelectedTerm) { toast("Выбери срок", "error"); return; }
  try {
    const d = await api("credit/take", {amount: amt, term_hours: creditSelectedTerm.hours});
    state.player = d.player;
    renderPlayer(); closeModal(); updateMoreBadges();
    toast(`💸 Взято ${amt}₽. Вернуть ${fmtMoney(d.total_debt)}₽ через ${creditSelectedTerm.hours}ч`, "success");
    creditSelectedTerm = null;
  } catch(e) { toast(e.message, "error"); }
}

async function payCredit() {
  try {
    const d = await api("credit/pay");
    state.player = d.player;
    renderPlayer(); closeModal(); updateMoreBadges();
    toast(`✅ Кредит погашен (${fmtMoney(d.paid)}₽)`, "success");
  } catch(e) { toast(e.message, "error"); }
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
let lbCategory = "money";
async function showLeaderboard(category = null) {
  if (category) lbCategory = category;
  try {
    const d = await api("leaderboard", {category: lbCategory});
    const tabsHtml = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px">
        <button class="lb-cat ${lbCategory==='money'?'active':''}" onclick="showLeaderboard('money')">💰 Деньги</button>
        <button class="lb-cat ${lbCategory==='level'?'active':''}" onclick="showLeaderboard('level')">⭐ Уровень</button>
        <button class="lb-cat ${lbCategory==='gang'?'active':''}" onclick="showLeaderboard('gang')">🚬 Банды</button>
      </div>`;
    let listHtml = "";
    if (d.leaders.length === 0) {
      listHtml = '<p style="color:var(--hint);text-align:center;padding:30px">Пусто</p>';
    } else if (lbCategory === "money") {
      listHtml = d.leaders.map(l => `
        <div class="lb-row ${l.rank<=3?'top-'+l.rank:''}">
          <div class="lb-rank">${l.rank===1?'🥇':l.rank===2?'🥈':l.rank===3?'🥉':'#'+l.rank}</div>
          <div class="lb-info"><div class="lb-name">${formatNickWithTag(l.nickname, l.gang_tag)}</div><div class="lb-meta">Ур. ${l.level} · ${l.businesses_count} бизнесов</div></div>
          <div class="lb-level">${fmtMoney(l.balance)}₽</div>
        </div>`).join("");
    } else if (lbCategory === "level") {
      listHtml = d.leaders.map(l => `
        <div class="lb-row ${l.rank<=3?'top-'+l.rank:''}">
          <div class="lb-rank">${l.rank===1?'🥇':l.rank===2?'🥈':l.rank===3?'🥉':'#'+l.rank}</div>
          <div class="lb-info"><div class="lb-name">${formatNickWithTag(l.nickname, l.gang_tag)}</div><div class="lb-meta">${fmtMoney(l.balance)}₽ · ${l.xp} XP</div></div>
          <div class="lb-level">Ур. ${l.level}</div>
        </div>`).join("");
    } else {
      listHtml = d.leaders.map(l => {
        const nameWithTag = l.tag ? `${l.emoji} <span class="gang-tag">[${escapeHtml(l.tag)}]</span> ${escapeHtml(l.name)}` : `${l.emoji} ${escapeHtml(l.name)}`;
        return `
        <div class="lb-row ${l.rank<=3?'top-'+l.rank:''}" style="flex-direction:column;align-items:stretch;gap:6px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="lb-rank">${l.rank===1?'🥇':l.rank===2?'🥈':l.rank===3?'🥉':'#'+l.rank}</div>
            <div class="lb-info">
              <div class="lb-name">${nameWithTag}</div>
              <div class="lb-meta">${l.members_count || 0} чел · ${l.territories_count} территорий</div>
            </div>
            <div class="lb-level">+${fmtMoney(l.income)}₽/ч</div>
          </div>
          <div style="display:flex;gap:8px;padding-left:44px;">
            <div style="flex:1;background:rgba(231,76,60,0.12);border:1px solid rgba(231,76,60,0.3);border-radius:8px;padding:6px 10px;text-align:center;">
              <div style="font-size:9px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">⚔️ Урон</div>
              <div style="font-size:15px;font-weight:900;color:#e74c3c;">${l.total_damage || 0}</div>
            </div>
            <div style="flex:1;background:rgba(243,156,18,0.12);border:1px solid rgba(243,156,18,0.3);border-radius:8px;padding:6px 10px;text-align:center;">
              <div style="font-size:9px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">💰 Казна</div>
              <div style="font-size:14px;font-weight:900;color:#f39c12;">${fmtMoney(l.treasury)}</div>
            </div>
          </div>
        </div>`;
      }).join("");
    }
    openModal(`<h2>📊 Лидерборд</h2>${tabsHtml}<div class="lb-list">${listHtml}</div>`);
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
  const tick = () => {
    if (!state.chatWith || state.chatWith === 'global') loadChat();
    else loadPM();
  };
  tick();
  chatInterval = setInterval(tick, 3000);
  if (window._convPoll) clearInterval(window._convPoll);
  window._convPoll = setInterval(() => {
    if (state.player) loadConversations();
  }, 15000);
}
function stopChatPolling() {
  if (chatInterval) { clearInterval(chatInterval); chatInterval = null; }
  if (window._convPoll) { clearInterval(window._convPoll); window._convPoll = null; }
}
async function loadChat() {
  if (state.chatWith && state.chatWith !== 'global') return;
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
            <span class="chat-nick" onclick="viewPlayer(${m.user_id})">${formatNickWithTag(m.nickname, m.gang_tag)}</span>
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


boot();

// ══════════════════════════════════════════════════════════════
//  PVP
// ══════════════════════════════════════════════════════════════
async function challengePvP(uid, name) {
  if (!confirm(`Вызвать ${name} на гоп-стоп?`)) return;
  try {
    const res = await api("pvp/challenge", {user_id: uid});
    closeModal();
    toast(`⚔️ Вызов отправлен ${name}`, "success");
    if (res && res.battle_id) startPvPUI(res.battle_id);
  } catch(e) {
    if (e.message && (e.message.includes("Уже есть бой") || e.message.includes("Уже в бою"))) {
      if (confirm("У тебя зависший бой. Сбросить и вызвать снова?")) {
        try {
          await api("pvp/force_cancel", {});
          const res = await api("pvp/challenge", {user_id: uid});
          closeModal();
          toast(`⚔️ Вызов отправлен ${name}`, "success");
          if (res && res.battle_id) startPvPUI(res.battle_id);
        } catch(e2) { toast(e2.message, "error"); }
      }
    } else {
      toast(e.message, "error");
    }
  }
}

async function checkPvPChallenges() {
  try {
    const d = await api("pvp/incoming");
    if (d.active && d.active.length > 0) {
      const active = d.active[0];
      if (!pvpCurrentBattle || pvpCurrentBattle !== active.battle_id) {
        startPvPUI(active.battle_id);
        return;
      }
    }
    if (!d.challenges || d.challenges.length === 0) return;
    const c = d.challenges[0];
    if (window._activePvPChallenge === c.battle_id) return;
    window._activePvPChallenge = c.battle_id;

    let secondsLeft = 30;
    try {
      const created = new Date(c.created_at.replace(" ", "T") + "Z");
      secondsLeft = Math.max(0, 30 - Math.floor((Date.now() - created.getTime()) / 1000));
    } catch(_) {}

    if (secondsLeft <= 0) {
      try { await api("pvp/respond", {battle_id: c.battle_id, accept: false}); } catch(_) {}
      window._activePvPChallenge = null;
      return;
    }

    const render = (sl) => {
      openModal(`
        <h2 style="text-align:center">⚔️ Гоп-стоп</h2>
        <p style="margin:16px 0;text-align:center"><b>${formatNickWithTag(c.attacker_name, c.attacker_gang_tag)}</b> хочет напасть на тебя!</p>
        <p style="color:var(--danger);font-size:13px;margin-bottom:8px;text-align:center">При проигрыше отдашь 10% денег</p>
        <p style="text-align:center;font-size:18px;font-weight:800;color:${sl > 10 ? 'var(--success)' : 'var(--danger)'};margin:16px 0;">⏰ Осталось: ${sl} сек</p>
        <button class="btn btn-primary" style="padding:16px;font-size:16px;" onclick="respondPvP(${c.battle_id}, true)">⚔️ Принять бой</button>
        <button class="btn btn-secondary" style="padding:16px;font-size:16px;" onclick="respondPvP(${c.battle_id}, false)">❌ Отказаться</button>
      `);
    };

    render(secondsLeft);
    if (window._pvpChalTimer) clearInterval(window._pvpChalTimer);
    window._pvpChalTimer = setInterval(async () => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(window._pvpChalTimer);
        window._pvpChalTimer = null;
        window._activePvPChallenge = null;
        try {
          await api("pvp/respond", {battle_id: c.battle_id, accept: false});
          closeModal();
          toast("⏰ Время на ответ истекло", "error");
        } catch(_) {}
      } else {
        const timerEl = document.querySelector('#modal-body p[style*="Осталось"]');
        if (timerEl) {
          timerEl.textContent = `⏰ Осталось: ${secondsLeft} сек`;
          timerEl.style.color = secondsLeft > 10 ? 'var(--success)' : 'var(--danger)';
        }
      }
    }, 1000);
  } catch(e) {}
}

async function respondPvP(bid, accept) {
  try {
    await api("pvp/respond", {battle_id: bid, accept});
    if (window._pvpChalTimer) { clearInterval(window._pvpChalTimer); window._pvpChalTimer = null; }
    window._activePvPChallenge = null;
    closeModal();
    if (accept) startPvPUI(bid);
    else toast("Отказался");
  } catch(e) { toast(e.message, "error"); }
}

let pvpCurrentBattle = null;
let pvpTimerInterval = null;
let pvpMyTurnPart = null;
let pvpMyTurnAction = null;

async function startPvPUI(bid) {
  if (pvpTimerInterval) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
  pvpCurrentBattle = bid;
  pvpMyTurnPart = null;
  pvpMyTurnAction = null;
  loadPvPState(bid);
  pvpTimerInterval = setInterval(() => {
    if (pvpCurrentBattle) loadPvPState(pvpCurrentBattle, true);
    else { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
  }, 3000);
}


function pvpChooseAction(action) {
  pvpMyTurnAction = action;
  const label = action === "attack" ? "Куда бить?" : "Что защищать?";
  openModal(`
    <h2>${label}</h2>
    <button class="pvp-part-btn" style="margin-top:16px" onclick="pvpDoAction('head')">🎯 Голова</button>
    <button class="pvp-part-btn" onclick="pvpDoAction('torso')">🎯 Торс</button>
    <button class="pvp-part-btn" onclick="pvpDoAction('legs')">🎯 Ноги</button>
    <button class="btn btn-secondary" style="margin-top:12px" onclick="loadPvPState(${pvpCurrentBattle})">⬅️ Назад</button>
  `);
}


// ══════════════════════════════════════════════════════════════
//  НОВЫЙ ТРЕЙД (визуальный)
// ══════════════════════════════════════════════════════════════
const SLOT_KEY_MAP = {head:"head_id", body:"body_id", legs:"legs_id", right_hand:"right_hand_id", left_hand:"left_hand_id"};
let tradeGiveItems = new Set();
let tradeWantItems = new Set();


// Отслеживание PvP-вызовов
setInterval(checkPvPChallenges, 5000);

// Добавить loadCases/loadGang в showTab
const _oldShowTab2 = showTab;
showTab = function(tab) {
  _oldShowTab2(tab);
  if (tab === "cases") loadCases();
  if (tab === "gang") loadGang();
};

// ══════════════════════════════════════════════════════════════
//  КЕЙСЫ
// ══════════════════════════════════════════════════════════════
async function loadCases() {
  try {
    const d = await api("cases/list");
    const el = $("#cases-list");
    el.innerHTML = d.cases.map(c => `
      <div class="case-preview-card" onclick="showCaseDetail('${c.case_id}')">
        <div class="case-preview-emoji">${c.emoji}</div>
        <div class="case-preview-info">
          <div class="case-preview-name">${c.name}</div>
          <div class="case-preview-sub">5 уникальных предметов</div>
        </div>
        <div class="case-preview-price">${fmtMoney(c.price)}₽</div>
      </div>
    `).join("");
    state.casesData = d;
  } catch(e) { toast(e.message, "error"); }
}

function showCaseDetail(cid) {
  const c = state.casesData.cases.find(x => x.case_id === cid);
  if (!c) return;
  const bal = state.casesData.balance;
  const itemsHtml = c.items.map(it => {
    const preview = {...emptyOutfit()};
    const slotKey = SLOT_KEY[it.slot];
    preview[slotKey] = {item_id: it.item_id};
    const stats = [];
    if (it.hp) stats.push(`❤️ +${it.hp} HP`);
    if (it.damage) stats.push(`⚔️ +${it.damage} DMG`);
    if (!stats.length) stats.push("—");
    return `<div class="case-modal-item" style="border-color:${it.rarity_color}">
      <div class="case-modal-item-svg">${renderCharacterSVG(preview, {width: 80, height: 160})}</div>
      <div class="case-modal-item-name" style="color:${it.rarity_color}">${it.name}</div>
      <div class="case-modal-item-chance">${it.chance}%</div>
      <div class="case-modal-item-stats">${stats.join("<br>")}</div>
    </div>`;
  }).join("");
  openModal(`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:56px">${c.emoji}</div>
      <h2>${c.name}</h2>
      <div style="font-size:20px;font-weight:900;color:var(--money);margin-top:4px">${fmtMoney(c.price)}₽</div>
    </div>
    <div class="case-modal-items">${itemsHtml}</div>
    <button class="btn btn-primary" onclick="openCase('${cid}')" ${bal < c.price ? 'disabled' : ''}>
      ${bal < c.price ? '❌ Не хватает денег' : `🎁 Открыть за ${fmtMoney(c.price)}₽`}
    </button>
  `);
}

async function openCase(cid) {
  try {
    const d = await api("cases/open", {case_id: cid});
    state.player = d.player; renderPlayer();
    openModal(`
      <div style="text-align:center;padding:24px 0">
        <div style="font-size:80px;animation:bounce 1s">${d.won.emoji}</div>
        <h2 style="color:${d.won.rarity_color};margin-top:16px">${d.won.name}</h2>
        <div style="color:${d.won.rarity_color};font-size:13px;font-weight:800;margin-top:4px">${d.won.rarity_name}</div>
        <p style="color:var(--hint);margin-top:12px">${d.won.desc || ''}</p>
        <button class="btn btn-primary" onclick="closeModal();loadCases()" style="margin-top:16px">Забрать</button>
      </div>`);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch(e) { toast(e.message, "error"); }
}


function showCreateGang() {
  openModal(`
    <h2>🚬 Создать банду</h2>
    <input id="gang-name-input" type="text" maxlength="20" placeholder="Название банды" style="width:100%;padding:12px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;margin:12px 0;font-size:16px">
    <p style="font-size:12px;color:var(--hint);margin-bottom:8px">Эмодзи (1 шт):</p>
    <input id="gang-emoji-input" type="text" maxlength="2" value="🚬" style="width:100%;padding:12px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;font-size:24px;text-align:center;margin-bottom:12px">
    <button class="btn btn-primary" onclick="createGang()">Создать за 50 000₽</button>
  `);
}

async function createGang() {
  const name = $("#gang-name-input").value.trim();
  const emoji = $("#gang-emoji-input").value.trim() || "🚬";
  try {
    await api("gang/create", {name, emoji});
    closeModal(); loadGang();
    toast("🚬 Банда создана!", "success");
  } catch(e) { toast(e.message, "error"); }
}

async function joinGang(gid) {
  try {
    await api("gang/join", {gang_id: gid});
    loadGang(); toast("✅ Вступил в банду");
  } catch(e) { toast(e.message, "error"); }
}

async function leaveGang() {
  if (!confirm("Покинуть банду?")) return;
  try {
    await api("gang/leave");
    loadGang(); toast("Покинул банду");
  } catch(e) { toast(e.message, "error"); }
}

function showGangDeposit() {
  const amt = prompt("Сколько вложить в казну? (есть: " + fmtMoney(state.player.balance) + "₽)");
  if (!amt) return;
  api("gang/deposit", {amount: parseInt(amt)}).then(() => {
    refreshPlayer().then(() => loadGang());
    toast("💰 Вложено", "success");
  }).catch(e => toast(e.message, "error"));
}

function showGangWithdraw() {
  const amt = prompt("Сколько вывести из казны?");
  if (!amt) return;
  api("gang/withdraw", {amount: parseInt(amt)}).then(() => {
    refreshPlayer().then(() => loadGang());
    toast("💸 Выведено", "success");
  }).catch(e => toast(e.message, "error"));
}

// ═══ ФОРМАТИРОВАНИЕ ЛОГА ЗАХВАТОВ ═══
function formatTerritoryLog(entry, myGid) {
  const tname = entry.territory_name || "территория";
  const etype = entry.event_type;
  const aIsMe = entry.gang_a_id === myGid;
  const bIsMe = entry.gang_b_id === myGid;

  if (etype === "capture_started") {
    if (aIsMe) return { icon: "⏳", text: `Мы начали захват «${tname}»`, color: "#f39c12" };
    return { icon: "⚠️", text: `${entry.gang_a_name} начали захват «${tname}»`, color: "#e74c3c" };
  }
  if (etype === "defense_started") {
    if (aIsMe) return { icon: "🛡", text: `Мы защищаем «${tname}» от ${entry.gang_b_name || "врага"}`, color: "#3498db" };
    return { icon: "⚠️", text: `${entry.gang_a_name} атакуют нашу «${tname}»`, color: "#e74c3c" };
  }
  if (etype === "battle") {
    const myDmg = aIsMe ? entry.gang_a_dmg : entry.gang_b_dmg;
    const enemyDmg = aIsMe ? entry.gang_b_dmg : entry.gang_a_dmg;
    const enemyName = aIsMe ? entry.gang_b_name : entry.gang_a_name;
    const won = entry.winner_gang_id === myGid;
    const result = won ? "ПОБЕДА" : "поражение";
    const icon = won ? "🏆" : "💀";
    const color = won ? "#2ecc71" : "#e74c3c";
    return { icon, text: `Битва за «${tname}»: мы ${myDmg || 0} урона vs ${enemyName} ${enemyDmg || 0} — ${result}`, color };
  }
  if (etype === "capture_complete") {
    if (aIsMe) return { icon: "✅", text: `Захват «${tname}» завершён без боя (урон: ${entry.gang_a_dmg || 0})`, color: "#2ecc71" };
    return { icon: "⚠️", text: `${entry.gang_a_name} захватили «${tname}» без боя`, color: "#e74c3c" };
  }
  return { icon: "•", text: `${etype}: ${tname}`, color: "#8494a5" };
}

async function showTerritoryCapture(tid) {
  try {
    const d = await api("gang/get");
    if (!d.in_gang) { toast("Ты не в банде", "error"); return; }
    const t = d.territories.find(x => x.id === tid);
    if (!t) { toast("Территория не найдена", "error"); return; }
    const g = d.gang;
    const myGid = g.gang_id;
    const isLeader = d.is_leader_or_deputy;

    let statusText = "Ничейная территория";
    if (t.is_contested) statusText = "🔴 Идёт БИТВА (2 претендента)";
    else if (t.capturing_by_us) statusText = "⏳ Мы захватываем";
    else if (t.has_capture) statusText = `⏳ ${t.captures[0].gang_emoji} ${t.captures[0].gang_name} захватывают`;
    else if (t.is_ours) statusText = "🟢 Наша территория";
    else if (t.gang_id) statusText = "🔴 Чужая территория";

    let buttonsHtml = "";
    if (!isLeader) {
      buttonsHtml = `<p style="color:var(--hint);text-align:center;font-size:12px;margin-top:12px">Захват доступен только лидеру и замам</p>`;
    } else if (t.is_contested) {
      buttonsHtml = `<p style="color:var(--danger);text-align:center;font-weight:700;margin-top:12px">⚔️ Битва уже началась — 2 претендента</p>`;
    } else if (t.capturing_by_us) {
      buttonsHtml = `<p style="color:var(--success);text-align:center;font-weight:700;margin-top:12px">⏳ Вы уже захватываете</p>`;
    } else if (t.has_capture && t.captures[0].gang_id !== myGid) {
      const rival = t.captures[0];
      if (t.is_ours) {
        buttonsHtml = `<button class="btn btn-primary" onclick="captureTerritory(${tid})" style="background:linear-gradient(135deg,#3498db,#2980b9)">🛡 Защитить территорию</button>
          <p style="color:var(--hint);text-align:center;font-size:11px;margin-top:6px">Битва через ${formatTime(t.battle_left)}</p>`;
      } else {
        buttonsHtml = `<button class="btn btn-primary" onclick="captureTerritory(${tid})">⚔️ Помешать захвату</button>
          <p style="color:var(--hint);text-align:center;font-size:11px;margin-top:6px">Битва через ${formatTime(t.battle_left)}</p>`;
      }
    } else if (t.is_ours) {
      buttonsHtml = `<p style="color:var(--success);text-align:center;font-weight:700;margin-top:12px">🟢 Территория под контролем. Никто не атакует.</p>`;
    } else {
      buttonsHtml = `<button class="btn btn-primary" onclick="captureTerritory(${tid})">⚔️ Начать захват (1 час)</button>`;
    }

    openModal(`
      <h2 style="text-align:center">${t.emoji} ${t.name}</h2>
      <p style="margin:16px 0;text-align:center">Доход: <b style="color:var(--money)">+${t.income}₽/ч</b></p>
      <p style="color:var(--hint);margin-bottom:8px;text-align:center">${statusText}</p>
      ${t.has_capture ? `
        <div style="background:rgba(243,156,18,0.1);border:1px solid rgba(243,156,18,0.3);border-radius:10px;padding:10px;margin-bottom:12px;">
          <div style="font-size:11px;color:var(--hint);text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;text-align:center">Активные претенденты</div>
          ${t.captures.map(c => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span>${c.gang_emoji} <b>${escapeHtml(c.gang_name)}</b>${c.gang_id === myGid ? ' (мы)' : ''}</span>
              <span style="color:#f39c12;font-weight:700;">${c.total_damage} урона · ${formatTime(c.left)}</span>
            </div>
          `).join('')}
          ${t.is_contested ? `<div style="text-align:center;font-size:11px;color:#e74c3c;font-weight:700;margin-top:8px;">⚔️ Битва через ${formatTime(t.battle_left)} — победит тот, у кого больше урона (шанс ~${Math.round(100 * Math.pow(Math.max(1,t.captures[0].total_damage),1.2) / (Math.pow(Math.max(1,t.captures[0].total_damage),1.2) + Math.pow(Math.max(1,t.captures[1].total_damage),1.2)))}% у первого)</div>` : ''}
        </div>` : ''}
      ${buttonsHtml}
      <button class="btn btn-secondary" style="margin-top:8px" onclick="closeModal()">Закрыть</button>
    `);
  } catch(e) { toast(e.message, "error"); }
}

async function captureTerritory(tid) {
  try {
    const d = await api("gang/capture", {territory_id: tid});
    closeModal(); loadGang();
    if (d.battle_pending) toast("⚔️ Битва! Твой урон зафиксирован", "success");
    else if (d.is_defense) toast("🛡 Защита начата!", "success");
    else toast("⚔️ Захват начат! Жди 1 час", "success");
  } catch(e) { toast(e.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
//  ТРЕЙД (визуальный)
// ══════════════════════════════════════════════════════════════
async function showTradeOffer(uid, name) {
  try {
    const [myInv, theirInv] = await Promise.all([api("inventory"), api("player_items", {user_id: uid})]);
    tradeGiveItems = new Set();
    tradeWantItems = new Set();
    const myItemsHtml = myInv.items.map(i => `
      <div class="trade-item" data-iid="${i.item_id}" onclick="toggleTradeItem(this, 'give')">
        <div class="trade-item-emoji">${i.emoji}</div>
        <div class="trade-item-name">${i.name}</div>${_itemStatsHtml(i, 'mini')}
      </div>`).join("");
    const theirItemsHtml = theirInv.items.length > 0 ? theirInv.items.map(i => `
      <div class="trade-item" data-iid="${i.item_id}" onclick="toggleTradeItem(this, 'want')">
        <div class="trade-item-emoji">${i.emoji}</div>
        <div class="trade-item-name">${i.name}</div>${_itemStatsHtml(i, 'mini')}
      </div>`).join("") : '<p style="color:var(--hint);padding:20px;text-align:center">У них пусто</p>';
    openModal(`
      <h2 style="text-align:center;margin-bottom:16px">🤝 Трейд с ${name}</h2>
      <p style="font-weight:700;margin-bottom:6px">📤 Я даю</p>
      <input id="give-money" type="number" placeholder="Деньги ₽" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-bottom:6px" value="0">
      <div class="trade-inventory" id="give-inv">${myItemsHtml || '<p style="color:var(--hint);text-align:center;padding:10px">Твой инвентарь пуст</p>'}</div>
      <p style="font-weight:700;margin:12px 0 6px">📥 Я хочу</p>
      <input id="want-money" type="number" placeholder="Деньги ₽" style="width:100%;padding:10px;background:var(--bg-3);border:none;border-radius:8px;color:#fff;margin-bottom:6px" value="0">
      <div class="trade-inventory" id="want-inv">${theirItemsHtml}</div>
      <div class="trade-summary" id="trade-summary">Выбери предметы</div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="sendTradeOffer(${uid})">🤝 Отправить предложение</button>
    `);
  } catch(e) { toast(e.message, "error"); }
}

function toggleTradeItem(el, kind) {
  const iid = el.dataset.iid;
  el.classList.toggle("selected");
  if (kind === "give") {
    if (el.classList.contains("selected")) tradeGiveItems.add(iid);
    else tradeGiveItems.delete(iid);
  } else {
    if (el.classList.contains("selected")) tradeWantItems.add(iid);
    else tradeWantItems.delete(iid);
  }
  const giveMoney = parseInt($("#give-money")?.value) || 0;
  const wantMoney = parseInt($("#want-money")?.value) || 0;
  $("#trade-summary").innerHTML = `
    <b>Ты даёшь:</b> ${giveMoney > 0 ? fmtMoney(giveMoney)+"₽ " : ""}${tradeGiveItems.size > 0 ? tradeGiveItems.size+" предмет(ов)" : "ничего"}<br>
    <b>Ты хочешь:</b> ${wantMoney > 0 ? fmtMoney(wantMoney)+"₽ " : ""}${tradeWantItems.size > 0 ? tradeWantItems.size+" предмет(ов)" : "ничего"}
  `;
}

async function sendTradeOffer(uid) {
  const give_money = parseInt($("#give-money").value) || 0;
  const want_money = parseInt($("#want-money").value) || 0;
  if (!give_money && !want_money && !tradeGiveItems.size && !tradeWantItems.size) {
    toast("Пустой трейд", "error"); return;
  }
  try {
    await api("trade/send", {
      to_user: uid, give_money,
      give_items: [...tradeGiveItems],
      want_money,
      want_items: [...tradeWantItems]
    });
    closeModal();
    toast("✅ Предложение отправлено", "success");
  } catch(e) { toast(e.message, "error"); }
}

async function showInvItem(iid) {
  const it = state.invItems.find(x=>x.item_id===iid);
  if (!it) return;
  openModal(`
    <div class="shop-preview">${renderCharacterSVG({...emptyOutfit(), [SLOT_KEY_MAP[it.slot]]: {item_id: iid}}, {width: 160, height: 320})}</div>
    <h2 style="color:${it.rarity_color};text-align:center">${it.name}</h2>
    <div style="color:${it.rarity_color};font-size:12px;margin:8px 0 16px;font-weight:700;text-align:center">${it.rarity_name} · ×${it.quantity}</div>
    <p style="color:var(--hint);margin-bottom:16px;text-align:center">${it.desc}</p>${_itemStatsHtml(it, 'block')}
    <button class="btn btn-primary" onclick="equipItem('${iid}')">⚡ Надеть</button>
    <button class="btn btn-secondary" onclick="confirmSellItem('${iid}')">💰 Продать</button>
  `);
}

function confirmSellItem(iid) {
  const it = state.invItems.find(x=>x.item_id===iid);
  if (!it) return;
  openModal(`
    <h2 style="text-align:center">💰 Продать?</h2>
    <div style="text-align:center;margin:24px 0;padding:20px;background:var(--bg-3);border-radius:12px">
      <div style="font-size:48px">${it.emoji}</div>
      <div style="font-weight:800;margin-top:8px;color:${it.rarity_color}">${it.name}</div>
      <div style="color:var(--hint);font-size:12px;margin-top:4px">${it.desc}</div>
      <div style="margin-top:16px;padding:12px;background:rgba(243,156,18,.15);border-radius:8px">
        <div style="font-size:12px;color:var(--hint)">Цена продажи (50% от магазина)</div>
        <div style="font-size:24px;font-weight:900;color:var(--money);margin-top:4px">${fmtMoney(it.sell_price)}₽</div>
      </div>
    </div>
    <button class="btn btn-primary" onclick="sellItem('${iid}')">✅ Да, продать</button>
    <button class="btn btn-secondary" onclick="showInvItem('${iid}')">❌ Нет, назад</button>
  `);
}


async function renderGhetto() {
  // Переопределяется в gang.js
}


// ═══════════ РЕФЕРАЛЫ ═══════════

async function renderReferral() {
  const countEl = document.getElementById("ref-count");
  const earnedEl = document.getElementById("ref-earned");
  const linkEl = document.getElementById("ref-link-input");
  const milestonesContainer = document.getElementById("ref-milestones");

  if (!countEl) return;

  try {
    const d = await api("referral/info", {});

    if (!d || d.error) throw new Error(d?.error || "Пустой ответ сервера");

    countEl.textContent = d.count;
    earnedEl.textContent = fmtMoney(d.earned);
    linkEl.value = d.link;

    const milestones = [
      { count: 3, reward: 15000, icon: "🎁" },
      { count: 5, reward: 30000, icon: "💰" },
      { count: 10, reward: 100000, icon: "👑" }
    ];

    milestonesContainer.innerHTML = "";

    milestones.forEach(m => {
      const isClaimed = d.claims.includes(m.count);
      const isReady = d.count >= m.count;

      let btnHtml = "";
      if (isClaimed) {
        btnHtml = `<button class="ref-mile-btn" disabled>✅ Получено</button>`;
      } else if (isReady) {
        btnHtml = `<button class="ref-mile-btn" onclick="claimRefReward(${m.count})">🎁 Забрать ${fmtMoney(m.reward)}₽</button>`;
      } else {
        btnHtml = `<button class="ref-mile-btn" disabled>Нужно еще ${m.count - d.count} чел.</button>`;
      }

      milestonesContainer.innerHTML += `
        <div class="ref-mile-card ${isClaimed ? 'claimed' : ''}">
          <div class="ref-mile-icon">${m.icon}</div>
          <div class="ref-mile-info">
            <div class="ref-mile-title">Пригласи ${m.count} друзей</div>
            <div class="ref-mile-desc">Награда: <span class="ref-mile-reward">${fmtMoney(m.reward)}₽</span></div>
            ${btnHtml}
          </div>
        </div>
      `;
    });
  } catch(e) {
    console.error("Referral error:", e);
    linkEl.value = "Ошибка сервера";
    milestonesContainer.innerHTML = `
      <div style="color:#e74c3c;text-align:center;padding:20px;background:rgba(231,76,60,0.1);border-radius:12px;">
        Не удалось загрузить данные: ${e.message}<br>
        <button onclick="renderReferral()" style="margin-top:10px;background:#e74c3c;color:#fff;border:none;padding:8px 16px;border-radius:8px;">Повторить</button>
      </div>`;
  }
}

function copyRefLink() {
  const inp = document.getElementById("ref-link-input");
  inp.select();
  inp.setSelectionRange(0, 99999);
  document.execCommand("copy");
  toast("Ссылка скопирована!", "success");
}

async function claimRefReward(milestone) {
  try {
    const d = await api("referral/claim", { milestone });
    toast(`🎉 Получено ${d.reward}₽!`, "success");
    state.player.balance += d.reward;
    document.getElementById("money").textContent = fmtMoney(state.player.balance);
    renderReferral();
  } catch(e) {
    toast(e.message, "error");
  }
}


// ═══════════ ADMIN PANEL ═══════════
function checkAdminAccess() {
    const user = tg?.initDataUnsafe?.user;
    if (user && user.username === "tazvantuzz") {
        const btn = document.getElementById("btn-admin-panel");
        if (btn) btn.style.display = "block";
    }
}

async function adminSearch() {
    const q = document.getElementById("admin-search-input").value;
    if (!q) return;
    const res = await api("admin/search", { query: q });
    const list = document.getElementById("admin-results");
    list.innerHTML = "";
    document.getElementById("admin-player-details").style.display = "none";

    if (res.players.length === 0) {
        list.innerHTML = "<div style='color:#888; text-align:center;'>Никого не найдено</div>";
        return;
    }

    res.players.forEach(p => {
        list.innerHTML += `
            <div onclick="adminSelectPlayer(${p.user_id})" style="background:#222; padding:12px; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; color:#fff;">${p.nickname}</div>
                <div style="color:#f39c12; font-size:14px;">${fmtMoney(p.balance)}₽</div>
            </div>
        `;
    });
}

async function adminSelectPlayer(id) {
    const res = await api("admin/player_info", { target_id: id });
    if (res.error) return toast(res.error, "error");

    const p = res.player;
    const s = res.stats;
    const details = document.getElementById("admin-player-details");
    details.style.display = "block";

    details.innerHTML = `
        <h4 style="color:#fff; margin-bottom:8px;">${p.nickname} (ID: ${p.user_id})</h4>
        <div style="font-size:13px; color:#aaa; margin-bottom:12px;">
            Ур. ${p.level} | Баланс: <b style="color:#2ecc71;">${fmtMoney(p.balance)}₽</b><br>
            Банда: ${s.gang} | Казино: ${s.casino_plays} игр<br>
            Бизнесы: ${s.businesses}
        </div>

        <div style="margin-bottom:12px;">
            <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Изменить баланс:</div>
            <div style="display:flex; gap:8px;">
                <input type="number" id="admin-amount" value="1000" style="flex:1; background:#111; border:1px solid #333; color:#fff; padding:10px; border-radius:8px;">
                <button class="btn btn-primary" onclick="adminChangeBalance(${p.user_id}, 1)">+</button>
                <button class="btn btn-secondary" onclick="adminChangeBalance(${p.user_id}, -1)">-</button>
            </div>
        </div>

        <div style="margin-bottom:16px;">
            <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Установить уровень (сбросит XP):</div>
            <div style="display:flex; gap:8px;">
                <input type="number" id="admin-level" value="${p.level}" min="1" max="100" style="flex:1; background:#111; border:1px solid #333; color:#fff; padding:10px; border-radius:8px;">
                <button class="btn btn-primary" onclick="adminSetLevel(${p.user_id})">OK</button>
            </div>
        </div>

        <button onclick="adminDeletePlayer(${p.user_id}, '${p.nickname}')" style="width:100%; background:#c0392b; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">
            🗑 УДАЛИТЬ АККАУНТ
        </button>
    `;
}

async function adminChangeBalance(id, sign) {
    const amount = parseInt(document.getElementById("admin-amount").value) * sign;
    await api("admin/change_balance", { target_id: id, amount: amount });
    toast(`Баланс изменен на ${amount > 0 ? '+' : ''}${amount}₽`, "success");
    adminSelectPlayer(id);
}


async function adminSetLevel(id) {
    const lvl = parseInt(document.getElementById("admin-level").value);
    if (!lvl || lvl < 1) return toast("Некорректный уровень", "error");

    try {
        await api("admin/set_level", { target_id: id, level: lvl });
        toast(`Уровень изменен на ${lvl}`, "success");
        adminSelectPlayer(id);
    } catch(e) {
        toast(e.message, "error");
    }
}

async function adminDeletePlayer(id, nick) {
    if (!confirm(`Ты уверен, что хочешь ПОЛНОСТЬЮ УДАЛИТЬ аккаунт "${nick}"?`)) return;
    await api("admin/delete", { target_id: id });
    toast("Аккаунт удален", "success");
    document.getElementById("admin-player-details").style.display = "none";
    adminSearch();
}

// ═══ loadGang ═══
async function loadGang() {
  try {
    const d = await api("gang/get");
    const el = $("#gang-content");
    if (!d.in_gang) {
      let listHtml = d.gangs.length > 0 ? d.gangs.map(g => {
        const tagHtml = g.tag ? ` <span class="gang-tag">[${escapeHtml(g.tag)}]</span>` : '';
        return `
        <div class="member-row">
          <div style="font-size:22px">${g.emoji}</div>
          <div style="flex:1"><div style="font-weight:700">${escapeHtml(g.name)}${tagHtml}</div>
          <div style="font-size:11px;color:var(--hint)">${g.members_count}/10 · казна ${fmtMoney(g.treasury)}₽</div></div>
          <button class="btn btn-secondary" style="width:auto;padding:8px 14px;margin:0" onclick="joinGang(${g.gang_id})">Вступить</button>
        </div>`;
      }).join("") : '<p style="color:var(--hint);text-align:center;padding:20px">Банд пока нет</p>';
      el.innerHTML = `
        <h2 class="section-title">🚬 Банды</h2>
        <div style="background:var(--bg-2);border-radius:16px;padding:16px;margin-bottom:16px">
          <p style="margin-bottom:12px">Создай свою банду за <b style="color:var(--money)">50 000₽</b></p>
          <button class="btn btn-primary" onclick="showCreateGang()">🚬 Создать банду</button>
        </div>
        <h3 class="section-subtitle">Существующие банды</h3>
        ${listHtml}`;
      return;
    }
    const g = d.gang;
    const myGid = g.gang_id;

    const terrHtml = d.territories.map(t => {
      let cls = "neutral", label = "Ничейная", subLine = "";
      if (t.is_contested) {
        cls = "enemy";
        label = "⚔️ БИТВА";
        subLine = `<div style="font-size:9px;color:#f39c12;font-weight:900;margin-top:2px;" class="terr-timer" data-left="${t.battle_left}">${formatTime(t.battle_left)}</div>`;
      } else if (t.capturing_by_us) {
        cls = "capturing";
        const left = t.captures[0].left;
        label = "Наш захват";
        subLine = `<div style="font-size:9px;color:#f39c12;font-weight:900;margin-top:2px;" class="terr-timer" data-left="${left}">${formatTime(left)}</div>`;
      } else if (t.has_capture) {
        cls = "capturing";
        const c = t.captures[0];
        label = `${c.gang_emoji} атакует`;
        subLine = `<div style="font-size:9px;color:#f39c12;font-weight:900;margin-top:2px;" class="terr-timer" data-left="${c.left}">${formatTime(c.left)}</div>`;
      } else if (t.is_ours) {
        cls = "mine"; label = "Наша";
      } else if (t.gang_id) {
        cls = "enemy"; label = "Чужая";
      }
      return `<div class="territory ${cls}" onclick="showTerritoryCapture(${t.id})">
        <div class="territory-emoji">${t.emoji}</div>
        <div class="territory-name">${t.name}</div>
        <div class="territory-income">+${t.income}₽/ч</div>
        <div style="font-size:9px;margin-top:2px;font-weight:700">${label}</div>
        ${subLine}
      </div>`;
    }).join("");

    const membersHtml = d.members.map(m => {
      const roleClass = `role-${m.role}`;
      const roleName = {leader:"Лидер",deputy:"Зам",member:"Боец"}[m.role];
      let actionBtn = "";
      if (d.my_role === "leader" && m.role !== "leader") {
        if (m.role === "member") actionBtn = `<button class="btn btn-secondary" style="width:auto;padding:4px 8px;font-size:10px;margin:0" onclick="setDeputy(${m.user_id}, 'promote')">Назначить замом</button>`;
        else actionBtn = `<button class="btn btn-secondary" style="width:auto;padding:4px 8px;font-size:10px;margin:0" onclick="setDeputy(${m.user_id}, 'demote')">Снять зама</button>`;
      }
      return `<div class="member-row">
        <div style="flex:1"><b>${formatNickWithTag(m.nickname, m.gang_tag)}</b> · ур. ${m.level}</div>
        <span class="member-role ${roleClass}">${roleName}</span>
        ${actionBtn}
      </div>`;
    }).join("");

    const logs = d.territory_log || [];
    let logHtml = "";
    if (logs.length === 0) {
      logHtml = `<div style="background:var(--bg-2);border-radius:12px;padding:16px;text-align:center;color:var(--hint);font-size:12px;">Пока нет событий</div>`;
    } else {
      logHtml = logs.slice(0, 15).map(entry => {
        const f = formatTerritoryLog(entry, myGid);
        let timeStr = "";
        try {
          const iso = entry.created_at.replace(" ", "T") + "Z";
          timeStr = new Date(iso).toLocaleString("ru-RU", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"});
        } catch(_) {}
        return `<div style="display:flex;gap:8px;padding:10px;background:var(--bg-2);border-radius:10px;margin-bottom:6px;border-left:3px solid ${f.color};">
          <div style="font-size:18px;flex-shrink:0;">${f.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;color:#fff;font-weight:600;line-height:1.3;">${f.text}</div>
            <div style="font-size:10px;color:var(--hint);margin-top:3px;">${timeStr}</div>
          </div>
        </div>`;
      }).join("");
    }

    const tagBanner = g.tag
      ? `<div style="text-align:center;color:var(--money);font-weight:900;font-size:18px;margin-top:4px;">[${escapeHtml(g.tag)}]</div>`
      : '';
    const tagEditBtn = d.my_role === "leader"
      ? `<button class="btn btn-secondary" onclick="showSetTag()" style="margin:8px 0">🏷 ${g.tag ? `Изменить тег [${escapeHtml(g.tag)}]` : 'Установить тег банды'}</button>`
      : '';

    el.innerHTML = `
      <div class="gang-banner">
        <div style="font-size:64px">${g.emoji}</div>
        <div class="gang-name">${escapeHtml(g.name)}</div>
        ${tagBanner}
        <div class="gang-treasury">💰 Казна: ${fmtMoney(g.treasury)}₽</div>
      </div>
      ${tagEditBtn}
      ${d.is_leader_or_deputy ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <button class="btn btn-primary" onclick="showGangDeposit()" style="margin:0">💰 Вложить</button>
          <button class="btn btn-secondary" onclick="showGangWithdraw()" style="margin:0">💸 Вывести</button>
        </div>
      ` : ''}

      <h3 class="section-subtitle">🗺 Территории (ГЕТТО)</h3>
      <div class="gang-map">${terrHtml}</div>

      <h3 class="section-subtitle">📜 Лог захватов</h3>
      <div style="margin-bottom:16px;">${logHtml}</div>

      <h3 class="section-subtitle">👥 Участники (${d.members.length}/10)</h3>
      ${membersHtml}
      ${d.my_role !== "leader" ? `<button class="btn btn-secondary" style="margin-top:12px" onclick="leaveGang()">🚪 Покинуть банду</button>` : ''}
    `;

    if (window._gangTimer) clearInterval(window._gangTimer);
    window._gangTimer = setInterval(() => {
      document.querySelectorAll('.terr-timer').forEach(el => {
        let left = parseInt(el.dataset.left) - 1;
        if (left < 0) left = 0;
        el.dataset.left = left;
        el.textContent = formatTime(left);
      });
    }, 1000);

  } catch(e) { toast(e.message, "error"); }
}

function showSetTag() {
  openModal(`
    <h2>🏷 Тег банды</h2>
    <p style="color:var(--hint);font-size:13px;margin:12px 0">Ровно 3 буквы (A-Z или А-Я). Будет отображаться как [XXX] возле ника всех участников.</p>
    <input id="gang-tag-input" type="text" maxlength="3" placeholder="XXX" style="width:100%;padding:14px;background:var(--bg-3);border:none;border-radius:10px;color:#fff;font-size:22px;text-align:center;letter-spacing:8px;text-transform:uppercase;font-weight:900;">
    <button class="btn btn-primary" onclick="setGangTag()" style="margin-top:12px">✅ Сохранить</button>
  `);
}

async function setGangTag() {
  const tag = document.getElementById("gang-tag-input").value.trim().toUpperCase();
  if (!/^[A-ZА-ЯЁ]{3}$/.test(tag)) {
    toast("Ровно 3 буквы (A-Z или А-Я)", "error");
    return;
  }
  try {
    await api("gang/set_tag", { tag });
    closeModal();
    loadGang();
    toast(`🏷 Тег установлен: [${tag}]`, "success");
    refreshPlayer();
  } catch(e) { toast(e.message, "error"); }
}

async function setDeputy(uid, action) {
  try {
    await api("gang/set_deputy", {user_id: uid, action});
    toast(action === "promote" ? "✅ Назначен замом" : "✅ Снят с должности", "success");
    loadGang();
  } catch(e) { toast(e.message, "error"); }
}

// ═══ УВЕДОМЛЕНИЯ ═══
async function loadNotifications() {
  try {
    const d = await api("notifications/get");
    const badge = document.getElementById("bell-badge");
    if (badge) {
      if (d.unread > 0) { badge.textContent = d.unread; badge.classList.remove("hidden"); }
      else { badge.classList.add("hidden"); }
    }
  } catch(e) {}
}
function showNotifications() {
  api("notifications/get").then(d => {
    let html = '<h2>🔔 Уведомления</h2>';
    if (d.notifications.length === 0) {
      html += '<p style="color:var(--hint);text-align:center;padding:20px;">Пусто</p>';
    } else {
      html += d.notifications.map(n => {
        const hideBtn = `<button class="btn btn-secondary" style="width:auto;padding:6px 10px;margin:0;font-size:14px;float:right;color:var(--hint);" onclick="hideNotification(${n.id})">✕</button>`;
        let actions = "";
        if (n.type === 'gang_invite' && !n.is_read) {
          actions = `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            <button class="btn btn-primary" style="margin:0;width:100%;padding:14px;font-size:15px;" onclick="acceptGangInvite(${n.id})">✅ Принять приглашение</button>
            <button class="btn btn-secondary" style="margin:0;width:100%;padding:14px;font-size:15px;" onclick="declineGangInvite(${n.id})">❌ Отклонить</button>
          </div>`;
        }
        if (n.type === 'pvp' && n.seconds_left !== undefined) {
          const sl = n.seconds_left || 0;
          const timerText = sl > 0 ? `<span style="color:var(--danger);font-weight:700;">⏰ ${sl} сек на ответ</span>` : '<span style="color:var(--danger);">⏰ Время истекло</span>';
          const bidFromData = (() => { try { return JSON.parse(n.data || '{}').battle_id; } catch(_) { return null; } })();
          if (bidFromData && sl > 0) {
            actions = `<div style="margin-top:8px;font-size:12px;">${timerText}</div>
              <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                <button class="btn btn-primary" style="margin:0;width:100%;padding:14px;font-size:15px;background:linear-gradient(135deg,#c0392b,#e74c3c);" onclick="respondPvPFromNotif(${bidFromData}, true, ${n.id})">⚔️ Принять бой</button>
                <button class="btn btn-secondary" style="margin:0;width:100%;padding:14px;font-size:15px;" onclick="respondPvPFromNotif(${bidFromData}, false, ${n.id})">❌ Отказаться</button>
              </div>`;
          } else {
            actions = `<div style="margin-top:8px;font-size:12px;">${timerText}</div>`;
          }
        }
        return `<div style="padding:12px; background:var(--bg-3); border-radius:10px; margin-bottom:8px; font-size:13px; ${n.is_read ? 'opacity:0.6' : ''}; overflow:hidden;">
          ${hideBtn}
          <div style="padding-right:40px;">${n.text}</div>
          ${actions}
        </div>`;
      }).join("");
    }
    openModal(html);
    api("notifications/read");
    const badge = document.getElementById("bell-badge");
    if (badge) badge.classList.add("hidden");

    if (window._notifRefresh) clearInterval(window._notifRefresh);
    if (d.notifications.some(n => n.type === 'pvp' && n.seconds_left > 0)) {
      window._notifRefresh = setInterval(() => {
        const modal = document.getElementById("modal");
        if (!modal || modal.classList.contains("hidden")) {
          clearInterval(window._notifRefresh);
          window._notifRefresh = null;
          return;
        }
        showNotificationsSilent();
      }, 3000);
    }
  });
}

async function showNotificationsSilent() {
  try {
    const d = await api("notifications/get");
    if (!d.notifications.some(n => n.type === 'pvp' && n.seconds_left > 0)) {
      if (window._notifRefresh) { clearInterval(window._notifRefresh); window._notifRefresh = null; }
    }
    const modalBody = document.getElementById("modal-body");
    if (!modalBody || !d.notifications) return;
  } catch(_) {}
}

async function respondPvPFromNotif(bid, accept, nid) {
  try {
    await api("pvp/respond", {battle_id: bid, accept});
    await api("notifications/delete", {notification_id: nid});
    closeModal();
    if (accept) startPvPUI(bid);
    else toast("❌ Отказался");
  } catch(e) { toast(e.message, "error"); }
}

async function hideNotification(nid) {
  try {
    await api("notifications/delete", {notification_id: nid});
    showNotifications();
  } catch(e) { toast(e.message, "error"); }
}

async function acceptGangInvite(nid) {
  try {
    await api("gang/invite/accept", {notification_id: nid});
    toast("✅ Вступил в банду!", "success");
    closeModal();
    refreshPlayer();
  } catch(e) { toast(e.message, "error"); }
}

async function declineGangInvite(nid) {
  try {
    await api("gang/invite/decline", {notification_id: nid});
    toast("❌ Приглашение отклонено");
    showNotifications();
  } catch(e) { toast(e.message, "error"); }
}

async function inviteToGang(uid, nickname) {
  try {
    await api("gang/invite", {target_id: uid});
    toast(`✅ Приглашение отправлено ${nickname}`, "success");
    closeModal();
  } catch(e) { toast(e.message, "error"); }
}

// ═══ ДРУЗЬЯ ═══
async function searchFriends() {
  const q = document.getElementById("friend-search-input").value.trim();
  if (q.length < 2) return toast("Минимум 2 символа", "error");
  try {
    const d = await api("friend/search", { query: q });
    const el = document.getElementById("friend-search-results");
    if (d.results.length === 0) el.innerHTML = '<p style="color:var(--hint)">Никого не найдено</p>';
    else {
      el.innerHTML = d.results.map(u => `
        <div class="player-card">
          <div class="player-avatar">👤</div>
          <div class="player-info"><div class="player-name">${formatNickWithTag(u.nickname, u.gang_tag)}</div><div class="player-meta">Ур. ${u.level}</div></div>
          <button class="btn btn-primary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;" onclick="sendFriendRequest(${u.user_id})">Добавить</button>
        </div>
      `).join("");
    }
  } catch(e) { toast(e.message, "error"); }
}
async function sendFriendRequest(uid) {
  try {
    await api("friend/request", { target_id: uid });
    toast("Запрос отправлен", "success");
  } catch(e) { toast(e.message, "error"); }
}
async function loadFriends() {
  try {
    const d = await api("friend/list");
    const reqBox = document.getElementById("friend-requests-box");
    if (d.requests.length > 0) {
      const sortedReqs = [...d.requests].sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));
      reqBox.innerHTML = `<h3 class="section-subtitle" style="color:#f39c12">Запросы (${d.requests.length})</h3>` + sortedReqs.map(r => `
        <div class="player-card">
          <div class="player-info">
            <div class="player-name">${formatNickWithTag(r.nickname, r.gang_tag)}</div>
            <div class="player-meta">${_onlineHtml(r.is_online)}${!r.is_online && r.last_seen ? ` · <span class="last-seen">${formatLastSeen(r.last_seen)}</span>` : ''}</div>
          </div>
          <button class="btn btn-primary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;" onclick="respondFriend(${r.user_id}, true)">✅</button>
          <button class="btn btn-secondary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;margin-left:4px;" onclick="respondFriend(${r.user_id}, false)">❌</button>
        </div>
      `).join("");
    } else reqBox.innerHTML = "";

    const list = document.getElementById("friend-list");
    if (d.friends.length === 0) list.innerHTML = '<p style="color:var(--hint);text-align:center;">Пока нет друзей</p>';
    else {
      const sortedFriends = [...d.friends].sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));
      list.innerHTML = sortedFriends.map(f => `
        <div class="player-card" onclick="viewPlayer(${f.user_id})">
          <div class="player-avatar">👤</div>
          <div class="player-info">
            <div class="player-name">${formatNickWithTag(f.nickname, f.gang_tag)}</div>
            <div class="player-meta">Ур. ${f.level} · ${_onlineHtml(f.is_online)}${!f.is_online && f.last_seen ? ` · <span class="last-seen">${formatLastSeen(f.last_seen)}</span>` : ''}</div>
          </div>
          <button class="btn btn-secondary" style="width:auto;padding:6px 12px;margin:0;font-size:12px;" onclick="event.stopPropagation(); openPM(${f.user_id}, '${f.nickname}', '${f.gang_tag || ''}')">✉️ ЛС</button>
          <button class="btn btn-secondary" style="width:auto;padding:6px 8px;margin:0 0 0 4px;font-size:12px;color:var(--danger);" onclick="event.stopPropagation(); removeFriend(${f.user_id}, '${f.nickname}')">✕</button>
        </div>
      `).join("");
    }
  } catch(e) { toast(e.message, "error"); }
}
async function removeFriend(uid, nickname) {
  if (!confirm(`Удалить ${nickname || 'игрока'} из друзей?`)) return;
  try {
    await api("friend/remove", {target_id: uid});
    toast("❌ Удалён из друзей");
    closeModal();
    const ft = document.querySelector('.tab-content[data-tab="friends"]');
    if (ft && ft.classList.contains('active')) loadFriends();
  } catch(e) { toast(e.message, "error"); }
}

async function respondFriend(uid, accept) {
  try {
    await api("friend/respond", { target_id: uid, accept });
    loadFriends();
  } catch(e) { toast(e.message, "error"); }
}

// ═══ ЛС ЧАТ ═══
state.chatWith = 'global';
function switchChat(mode) {
  if (mode === 'global' || mode === undefined || mode === null) {
    state.chatWith = 'global';
    loadChat();
  } else {
    state.chatWith = Number(mode);
    loadPM();
  }
  renderChatTabs();
}

function openPM(uid, name, tag) {
  uid = Number(uid);
  if (!state.openPMs) state.openPMs = [];
  if (!state.openPMs.find(x => Number(x.uid) === uid)) {
    state.openPMs.push({uid: uid, name: name, tag: tag || null});
  } else {
    const p = state.openPMs.find(x => Number(x.uid) === uid);
    if (tag) p.tag = tag;
  }
  state.chatWith = uid;
  const existing = state.openPMs.find(x => Number(x.uid) === uid);
  if (existing) existing.unread = 0;
  closeModal();
  showTab("chat");
}

function renderChatTabs() {
  const tabs = document.getElementById("chat-tabs");
  if (!tabs) return;
  const isGlobal = !state.chatWith || state.chatWith === 'global';
  let html = `<button class="chat-tab ${isGlobal ? 'active' : ''}" data-chat="global" onclick="switchChat('global')">🌐 Общий</button>`;
  if (Array.isArray(state.openPMs)) {
    for (const p of state.openPMs) {
      const isActive = Number(state.chatWith) === Number(p.uid);
      const unreadDot = (p.unread && p.unread > 0) ? `<span style="background:#e74c3c;color:#fff;border-radius:8px;padding:0 5px;font-size:10px;margin-left:4px;">${p.unread}</span>` : '';
      const tagHtml = p.tag ? `<span class="gang-tag">[${escapeHtml(p.tag)}]</span> ` : '';
      html += `<button class="chat-tab ${isActive ? 'active' : ''}" data-chat="${p.uid}" onclick="switchChat(${p.uid})">👤 ${tagHtml}${escapeHtml(p.name)}${unreadDot}</button>`;
    }
  }
  tabs.innerHTML = html;
}
async function loadPM() {
  if (!state.chatWith || state.chatWith === 'global') return;
  try {
    const d = await api("chat/pm/get", { with_id: state.chatWith });
    const el = document.getElementById("chat-messages");
    el.innerHTML = d.messages.map(m => `
      <div class="chat-msg ${m.from_id === state.player.user_id ? 'my-msg' : ''}">
        <div>${escapeHtml(m.message)}</div>
      </div>
    `).join("");
    el.scrollTop = el.scrollHeight;
  } catch(e) {}
}
async function sendChat() {
  const inp = document.getElementById("chat-input");
  if (!inp) return;
  const msg = inp.value.trim();
  if (!msg) return;
  try {
    if (!state.chatWith || state.chatWith === 'global') {
      await api("chat/send", { message: msg });
      loadChat();
    } else {
      await api("chat/pm/send", { to_id: state.chatWith, message: msg });
      loadPM();
      updateChatBadge();
    }
    inp.value = "";
    if (tg) tg.HapticFeedback?.impactOccurred("light");
  } catch(e) { toast(e.message, "error"); }
}

// ═══ ПЕРЕОПРЕДЕЛЕНИЕ showTab ═══
const _oldShowTab3 = showTab;
showTab = function(tab) {
  _oldShowTab3(tab);
  if (tab === "friends") loadFriends();
  if (tab === "chat") {
    if (!state.chatWith || state.chatWith === 'global') {
      state.chatWith = 'global';
      loadChat();
    } else {
      loadPM();
    }
    loadConversations().then(() => renderChatTabs());
    updateChatBadge();
  }
  if (tab === "home") loadNotifications();
};

// ═══ PVP UI ═══
async function loadPvPState(bid, silent = false) {
  try {
    const d = await api("pvp/state", {battle_id: bid});
    if (d.status === "finished") {
      if (pvpTimerInterval) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
      pvpCurrentBattle = null;
      closeModal();
      toast(d.timeout ? "⏰ Время вышло! Бой окончен." : "⚔️ Бой окончен!", d.timeout ? "error" : "success");
      refreshPlayer();
      return;
    }
    if (d.status === "expired" || d.status === "declined") {
      if (pvpTimerInterval) { clearInterval(pvpTimerInterval); pvpTimerInterval = null; }
      pvpCurrentBattle = null;
      closeModal();
      toast(d.status === "expired" ? "⏰ Вызов истёк" : "❌ Вызов отклонён", "error");
      return;
    }
    if (d.status === "pending") {
      if (!silent) toast("Ждём ответа соперника...");
      return;
    }
    const isMyTurn = Number(d.turn) === Number(state.player.user_id);
    const mustAttack = isMyTurn && !d.pending_attack_part;
    const mustDefend = isMyTurn && d.pending_attack_part;

    const logHtml = (d.log || []).slice(-5).map(l => {
      if (l.type === "hit") return `💥 ${l.attacker} → ${l.part}: -${l.damage}`;
      if (l.type === "block") return `🛡 ${l.attacker}: блок ${l.part}`;
      if (l.type === "defend") return `🛡 ${l.player}: защита ${l.part}`;
      return "";
    }).join("<br>");
    const myPart = d.is_attacker ? "attacker" : "defender";
    const enemyPart = d.is_attacker ? "defender" : "attacker";
    const me = d[myPart]; const enemy = d[enemyPart];
    openModal(`
      <h2 style="text-align:center;margin-bottom:12px">⚔️ Гоп-стоп</h2>
      <div class="pvp-card">
        <div class="pvp-hp-row"><span>${formatNickWithTag(enemy.nickname, enemy.gang_tag)}</span><span>${enemy.hp}/${enemy.max_hp}</span></div>
        <div class="pvp-hp-bar"><div class="pvp-hp-fill" style="width:${enemy.hp/enemy.max_hp*100}%"></div></div>
        <div class="pvp-hp-row" style="margin-top:12px"><span>${formatNickWithTag(me.nickname, me.gang_tag)} (ты)</span><span>${me.hp}/${me.max_hp}</span></div>
        <div class="pvp-hp-bar"><div class="pvp-hp-fill" style="width:${me.hp/me.max_hp*100}%"></div></div>
      </div>
      ${logHtml ? `<div class="pvp-log">${logHtml}</div>` : ''}
      ${isMyTurn ? `
        <p style="font-weight:700;margin:16px 0 8px">${mustAttack ? 'Твой ход — куда бьём?' : 'Твой ход — что защищаем?'}</p>
        <button class="pvp-part-btn" onclick="pvpDoAction('${mustAttack ? 'attack' : 'defend'}', 'head')">🎯 Голова</button>
        <button class="pvp-part-btn" onclick="pvpDoAction('${mustAttack ? 'attack' : 'defend'}', 'torso')">🎯 Торс</button>
        <button class="pvp-part-btn" onclick="pvpDoAction('${mustAttack ? 'attack' : 'defend'}', 'legs')">🎯 Ноги</button>
      ` : `<p style="text-align:center;padding:20px;color:var(--hint)">⏳ Ход противника...</p>`}
    `);
  } catch(e) {
    if (!silent) toast(e.message, "error");
  }
}

async function pvpDoAction(action, part) {
  try {
    const d = await api("pvp/action", {battle_id: pvpCurrentBattle, action, part});
    if (d.finished) {
      openModal(`
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:80px">${d.winner_id === state.player.user_id ? '🏆' : '💀'}</div>
          <h2 style="margin-top:16px">${d.winner_id === state.player.user_id ? 'ПОБЕДА!' : 'Поражение'}</h2>
          <p style="margin-top:12px">${d.winner_id === state.player.user_id ? `Ты отжал ${fmtMoney(d.steal)}₽` : `У тебя отжали ${fmtMoney(d.steal)}₽`}</p>
          <button class="btn btn-primary" onclick="closeModal();refreshPlayer()" style="margin-top:16px">OK</button>
        </div>`);
      refreshPlayer();
      return;
    }
    loadPvPState(pvpCurrentBattle);
  } catch(e) { toast(e.message, "error"); }
}

// Автообновление уведомлений
setInterval(loadNotifications, 15000);
setInterval(loadOnlineCount, 30000);
setInterval(updateChatBadge, 15000);