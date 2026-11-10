// app-house-svg.js
// SVG-визуал домов снаружи (для карты улицы).
// У каждого типа дома свой уникальный SVG в собственных координатах viewBox "0 0 120 {height}".
// Позиционируется в app-map.js.

const HOUSE_TYPE_MAP = {
  "общага":     "obshaga",
  "хрущёвка":   "hrushchevka",
  "хрущевка":   "hrushchevka",
  "панелька":   "panelka",
  "студия":     "studio",
  "лофт":       "loft",
  "пентхаус":   "penthouse",
  "коттедж":    "cottage",
  "вилла":      "villa",
  "дворец":     "palace",
};

// Высота дома в пикселях улицы (используется для позиционирования)
const HOUSE_HEIGHTS = {
  obshaga:      70,
  hrushchevka:  85,
  panelka:      100,
  studio:       75,
  loft:         85,
  penthouse:    110,
  cottage:      60,
  villa:        80,
  palace:       105,
};

function getHouseSlug(type) {
  return HOUSE_TYPE_MAP[String(type || "").toLowerCase().trim()] || "obshaga";
}

function getHouseHeight(type) {
  return HOUSE_HEIGHTS[getHouseSlug(type)] || 80;
}

// ═════════════════════════════════════════════════════════════
//  SVG-контент каждого дома (внутренности без внешнего <svg>)
//  Внешний <svg viewBox="0 0 120 H" ...> создаётся в app-map.js
// ═════════════════════════════════════════════════════════════
const HOUSE_SVGS = {

  // ── Мухосранск ──

  // Общага: низкая, обшарпанная, красный кирпич, забитые окна
  obshaga: `
    <defs>
      <linearGradient id="obsWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a57c4a"/>
        <stop offset="100%" stop-color="#7a5530"/>
      </linearGradient>
    </defs>
    <!-- Тень -->
    <ellipse cx="60" cy="69" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <!-- Стена -->
    <rect x="6" y="10" width="108" height="60" fill="url(#obsWall)" stroke="#3a2410" stroke-width="0.8"/>
    <!-- Кирпичная основа -->
    <rect x="6" y="55" width="108" height="15" fill="#6b4423"/>
    <line x1="6" y1="60" x2="114" y2="60" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="6" y1="65" x2="114" y2="65" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="20" y1="55" x2="20" y2="60" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="36" y1="60" x2="36" y2="65" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="52" y1="55" x2="52" y2="60" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="68" y1="60" x2="68" y2="65" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="84" y1="55" x2="84" y2="60" stroke="#4a2e15" stroke-width="0.4"/>
    <line x1="100" y1="60" x2="100" y2="65" stroke="#4a2e15" stroke-width="0.4"/>
    <!-- Крыша - плоская облупленная -->
    <rect x="2" y="6" width="116" height="5" fill="#3a2818"/>
    <line x1="2" y1="6" x2="118" y2="6" stroke="#5a4838" stroke-width="0.5" opacity="0.6"/>
    <!-- Пятна/облупившаяся краска -->
    <ellipse cx="28" cy="32" rx="7" ry="4" fill="#4a2e15" opacity="0.4"/>
    <ellipse cx="92" cy="44" rx="8" ry="5" fill="#4a2e15" opacity="0.35"/>
    <ellipse cx="55" cy="22" rx="5" ry="3" fill="#4a2e15" opacity="0.3"/>
    <!-- Окна верхний ряд -->
    <rect x="16" y="16" width="16" height="14" fill="#e8d89a" stroke="#3a2410" stroke-width="0.5"/>
    <line x1="24" y1="16" x2="24" y2="30" stroke="#3a2410" stroke-width="0.4"/>
    <line x1="16" y1="23" x2="32" y2="23" stroke="#3a2410" stroke-width="0.4"/>
    <rect x="52" y="16" width="16" height="14" fill="#3a2410"/>
    <line x1="52" y1="16" x2="68" y2="30" stroke="#8b6f47" stroke-width="1"/>
    <line x1="68" y1="16" x2="52" y2="30" stroke="#8b6f47" stroke-width="1"/>
    <rect x="88" y="16" width="16" height="14" fill="#e8d89a" stroke="#3a2410" stroke-width="0.5"/>
    <line x1="96" y1="16" x2="96" y2="30" stroke="#3a2410" stroke-width="0.4"/>
    <line x1="88" y1="23" x2="104" y2="23" stroke="#3a2410" stroke-width="0.4"/>
    <!-- Окна средний ряд -->
    <rect x="16" y="36" width="16" height="14" fill="#e8d89a" stroke="#3a2410" stroke-width="0.5"/>
    <line x1="24" y1="36" x2="24" y2="50" stroke="#3a2410" stroke-width="0.4"/>
    <line x1="16" y1="43" x2="32" y2="43" stroke="#3a2410" stroke-width="0.4"/>
    <rect x="52" y="36" width="16" height="14" fill="#e8d89a" stroke="#3a2410" stroke-width="0.5"/>
    <line x1="60" y1="36" x2="60" y2="50" stroke="#3a2410" stroke-width="0.4"/>
    <rect x="88" y="36" width="16" height="14" fill="#2a1808" opacity="0.85"/>
    <!-- Вход с навесом и лампой -->
    <rect x="48" y="55" width="24" height="15" fill="#2a1808" stroke="#1a0800" stroke-width="0.4"/>
    <rect x="46" y="53" width="28" height="3" fill="#1a0800"/>
    <circle cx="70" cy="63" r="0.9" fill="#e8d89a"/>
    <circle cx="60" cy="51" r="2" fill="#ffcc00" opacity="0.95"/>
    <circle cx="60" cy="51" r="4.5" fill="#ffcc00" opacity="0.2"/>
  `,

  // Хрущёвка: 5-этажка, бежевая, панельные швы
  hrushchevka: `
    <defs>
      <linearGradient id="hrWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d4c8a8"/>
        <stop offset="100%" stop-color="#a89c7c"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="84" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <rect x="4" y="10" width="112" height="75" fill="url(#hrWall)" stroke="#5a5040" stroke-width="0.8"/>
    <!-- Горизонтальные швы -->
    ${[25, 40, 55, 70].map(y => `<line x1="4" y1="${y}" x2="116" y2="${y}" stroke="#8a8070" stroke-width="0.35"/>`).join("")}
    <!-- Вертикальные швы -->
    ${[34, 64, 94].map(x => `<line x1="${x}" y1="10" x2="${x}" y2="85" stroke="#8a8070" stroke-width="0.35"/>`).join("")}
    <!-- Крыша -->
    <rect x="0" y="5" width="120" height="6" fill="#4a4030"/>
    <rect x="0" y="5" width="120" height="1.2" fill="#6a6050"/>
    <!-- Окна (5 этажей × 4 окна) -->
    ${[
      [16, 15], [46, 15], [76, 15], [106, 15],
      [16, 30], [46, 30], [76, 30], [106, 30],
      [16, 45], [46, 45], [76, 45], [106, 45],
      [16, 60], [46, 60], [76, 60], [106, 60],
      [16, 74], [46, 74], [76, 74], [106, 74],
    ].map(([x, y], i) => `
      <rect x="${x}" y="${y}" width="12" height="9" fill="${i % 3 === 0 ? '#e8e8a0' : '#5a6a7a'}" stroke="#2a3038" stroke-width="0.3"/>
    `).join("")}
    <!-- Балконы -->
    <rect x="44" y="40" width="20" height="2" fill="#3a3020"/>
    <rect x="44" y="40" width="20" height="7" fill="none" stroke="#3a3020" stroke-width="0.4"/>
    <rect x="74" y="55" width="20" height="2" fill="#3a3020"/>
    <rect x="74" y="55" width="20" height="7" fill="none" stroke="#3a3020" stroke-width="0.4"/>
    <rect x="44" y="70" width="20" height="2" fill="#3a3020"/>
    <rect x="44" y="70" width="20" height="7" fill="none" stroke="#3a3020" stroke-width="0.4"/>
    <!-- Вход с козырьком -->
    <rect x="48" y="78" width="24" height="7" fill="#2a2010"/>
    <rect x="44" y="76" width="32" height="2.5" fill="#5a5040"/>
    <rect x="58" y="80" width="4" height="5" fill="#8a8070" opacity="0.7"/>
  `,

  // Панелька: 9-этажка, серо-синяя, кондиционеры
  panelka: `
    <defs>
      <linearGradient id="pnWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9aa8b8"/>
        <stop offset="100%" stop-color="#6a7888"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="99" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <rect x="4" y="10" width="112" height="90" fill="url(#pnWall)" stroke="#3a4858" stroke-width="0.8"/>
    <!-- Горизонтальные швы -->
    ${[20, 30, 40, 50, 60, 70, 80, 90].map(y => `<line x1="4" y1="${y}" x2="116" y2="${y}" stroke="#4a5868" stroke-width="0.3"/>`).join("")}
    <!-- Вертикальные швы -->
    ${[34, 64, 94].map(x => `<line x1="${x}" y1="10" x2="${x}" y2="100" stroke="#4a5868" stroke-width="0.3"/>`).join("")}
    <!-- Крыша -->
    <rect x="0" y="5" width="120" height="6" fill="#3a4858"/>
    <rect x="0" y="5" width="120" height="1.2" fill="#5a6878"/>
    <!-- Окна: 8 этажей × 4 -->
    ${[14, 24, 34, 44, 54, 64, 74, 84].map((y, row) =>
      [14, 44, 74, 104].map((x, col) => {
        const isLit = (row + col) % 4 === 0;
        return `<rect x="${x}" y="${y}" width="14" height="5" fill="${isLit ? '#e8e8a0' : '#4a5868'}" stroke="#3a4858" stroke-width="0.2"/>`;
      }).join("")
    ).join("")}
    <!-- Балконы -->
    ${[44, 74].map((x) => `
      ${[28, 48, 68, 88].map(y => `
        <rect x="${x}" y="${y}" width="20" height="2" fill="#2a3848"/>
        <rect x="${x}" y="${y}" width="20" height="7" fill="none" stroke="#2a3848" stroke-width="0.4"/>
      `).join("")}
    `).join("")}
    <!-- Кондиционеры -->
    <rect x="104" y="32" width="6" height="4" fill="#b0b8c0" stroke="#3a4858" stroke-width="0.2"/>
    <rect x="104" y="62" width="6" height="4" fill="#b0b8c0" stroke="#3a4858" stroke-width="0.2"/>
    <!-- Вход -->
    <rect x="48" y="94" width="24" height="6" fill="#1a2838"/>
    <rect x="44" y="92" width="32" height="2" fill="#3a4858"/>
  `,

  // ── Черёмушки ──

  // Студия: современный минимализм, большие стекла
  studio: `
    <defs>
      <linearGradient id="stWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8e8e8"/>
        <stop offset="100%" stop-color="#c0c0c0"/>
      </linearGradient>
      <linearGradient id="stGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6ba8d8"/>
        <stop offset="100%" stop-color="#3a6898"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="74" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <!-- Основной корпус -->
    <rect x="14" y="10" width="92" height="65" fill="url(#stWall)" stroke="#222" stroke-width="0.8"/>
    <!-- Крыша плоская -->
    <rect x="10" y="6" width="100" height="5" fill="#1a1a1a"/>
    <!-- Большое стекло 1-й этаж -->
    <rect x="20" y="40" width="80" height="28" fill="url(#stGlass)" stroke="#222" stroke-width="0.6"/>
    <line x1="20" y1="48" x2="100" y2="48" stroke="#222" stroke-width="0.4"/>
    <line x1="20" y1="56" x2="100" y2="56" stroke="#222" stroke-width="0.4"/>
    <!-- Отражение на стекле -->
    <path d="M25 44 L 35 40 L 45 40 L 30 44 Z" fill="#fff" opacity="0.25"/>
    <path d="M55 60 L 65 55 L 80 55 L 65 60 Z" fill="#fff" opacity="0.2"/>
    <!-- Окна 2-й этаж -->
    <rect x="20" y="16" width="24" height="20" fill="url(#stGlass)" stroke="#222" stroke-width="0.5"/>
    <rect x="48" y="16" width="24" height="20" fill="url(#stGlass)" stroke="#222" stroke-width="0.5"/>
    <rect x="76" y="16" width="20" height="20" fill="#333" stroke="#222" stroke-width="0.5"/>
    <!-- Вход с навесом -->
    <rect x="52" y="66" width="16" height="9" fill="#1a1a1a"/>
    <rect x="48" y="63" width="24" height="3" fill="#222"/>
    <!-- Акцентная полоса -->
    <rect x="14" y="38" width="92" height="1.5" fill="#e87b1a"/>
  `,

  // Лофт: красный кирпич, промышленные окна, металл
  loft: `
    <defs>
      <linearGradient id="lfWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a86048"/>
        <stop offset="100%" stop-color="#7a4030"/>
      </linearGradient>
      <linearGradient id="lfGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d8b890"/>
        <stop offset="100%" stop-color="#a07850"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="84" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <!-- Кирпичная стена -->
    <rect x="4" y="10" width="112" height="75" fill="url(#lfWall)" stroke="#3a1a10" stroke-width="0.8"/>
    <!-- Кирпичная текстура (горизонтальные швы) -->
    ${[16, 22, 28, 34, 40, 46, 52, 58, 64, 70, 76, 82].map(y => `<line x1="4" y1="${y}" x2="116" y2="${y}" stroke="#3a1a10" stroke-width="0.25" opacity="0.7"/>`).join("")}
    <!-- Крыша плоская с высоким парапетом -->
    <rect x="0" y="4" width="120" height="7" fill="#2a1a10"/>
    <rect x="0" y="4" width="120" height="1.5" fill="#5a3a20"/>
    <!-- Промышленные окна 3 секции -->
    ${[16, 52, 88].map(x => `
      <rect x="${x}" y="18" width="16" height="60" fill="url(#lfGlass)" stroke="#1a0a00" stroke-width="0.8"/>
      <line x1="${x}" y1="30" x2="${x + 16}" y2="30" stroke="#1a0a00" stroke-width="0.6"/>
      <line x1="${x}" y1="42" x2="${x + 16}" y2="42" stroke="#1a0a00" stroke-width="0.6"/>
      <line x1="${x}" y1="54" x2="${x + 16}" y2="54" stroke="#1a0a00" stroke-width="0.6"/>
      <line x1="${x}" y1="66" x2="${x + 16}" y2="66" stroke="#1a0a00" stroke-width="0.6"/>
      <line x1="${x + 8}" y1="18" x2="${x + 8}" y2="78" stroke="#1a0a00" stroke-width="0.6"/>
      <!-- Отражение света -->
      <rect x="${x + 2}" y="20" width="3" height="20" fill="#fff" opacity="0.2"/>
    `).join("")}
    <!-- Балки между окнами (промышленные) -->
    <rect x="32" y="10" width="4" height="75" fill="#3a2a20" stroke="#1a0a00" stroke-width="0.4"/>
    <rect x="68" y="10" width="4" height="75" fill="#3a2a20" stroke="#1a0a00" stroke-width="0.4"/>
    <!-- Металлическая дверь -->
    <rect x="52" y="66" width="16" height="19" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
    <circle cx="64" cy="76" r="1" fill="#888"/>
    <!-- Клёпки на балках -->
    <circle cx="34" cy="20" r="0.6" fill="#888"/>
    <circle cx="34" cy="40" r="0.6" fill="#888"/>
    <circle cx="34" cy="60" r="0.6" fill="#888"/>
    <circle cx="70" cy="20" r="0.6" fill="#888"/>
    <circle cx="70" cy="40" r="0.6" fill="#888"/>
    <circle cx="70" cy="60" r="0.6" fill="#888"/>
  `,

  // Пентхаус: башня, панорамные окна, золото
  penthouse: `
    <defs>
      <linearGradient id="phWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a2a3e"/>
        <stop offset="100%" stop-color="#1a1a2e"/>
      </linearGradient>
      <linearGradient id="phGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7db8e8"/>
        <stop offset="100%" stop-color="#3a6898"/>
      </linearGradient>
      <linearGradient id="phGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe066"/>
        <stop offset="100%" stop-color="#b8860b"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="109" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <!-- Основной корпус -->
    <rect x="10" y="10" width="100" height="100" fill="url(#phWall)" stroke="#0a0a1a" stroke-width="1"/>
    <!-- Верхний уровень - сдвиг вправо, чтобы был интересный силуэт -->
    <rect x="26" y="10" width="68" height="22" fill="#3a3a4e" stroke="#1a1a2e" stroke-width="0.6"/>
    <!-- Золотые полосы -->
    <rect x="10" y="32" width="100" height="1.5" fill="url(#phGold)"/>
    <rect x="10" y="60" width="100" height="1.5" fill="url(#phGold)"/>
    <rect x="10" y="88" width="100" height="1.5" fill="url(#phGold)"/>
    <!-- Панорамные окна: 4 блока -->
    ${[16, 40, 64, 88].map(x => `
      <rect x="${x}" y="38" width="18" height="20" fill="url(#phGlass)" stroke="#1a1a2e" stroke-width="0.5"/>
      <line x1="${x}" y1="48" x2="${x + 18}" y2="48" stroke="#1a1a2e" stroke-width="0.3"/>
      <line x1="${x + 9}" y1="38" x2="${x + 9}" y2="58" stroke="#1a1a2e" stroke-width="0.3"/>
    `).join("")}
    <!-- Ещё один ряд окон -->
    ${[16, 40, 64, 88].map(x => `
      <rect x="${x}" y="66" width="18" height="20" fill="url(#phGlass)" stroke="#1a1a2e" stroke-width="0.5"/>
      <line x1="${x}" y1="76" x2="${x + 18}" y2="76" stroke="#1a1a2e" stroke-width="0.3"/>
    `).join("")}
    <!-- Верхние окна (уже, потому что сдвинуто) -->
    ${[32, 48, 64, 80].map(x => `
      <rect x="${x}" y="14" width="12" height="14" fill="url(#phGlass)" stroke="#1a1a2e" stroke-width="0.4"/>
    `).join("")}
    <!-- Золотая корона/шпиль -->
    <path d="M60 2 L 58 10 L 62 10 Z" fill="url(#phGold)"/>
    <circle cx="60" cy="3" r="1.8" fill="url(#phGold)"/>
    <!-- Главный вход с золотой рамой -->
    <rect x="48" y="94" width="24" height="16" fill="#0a0a1a" stroke="url(#phGold)" stroke-width="1"/>
    <line x1="60" y1="94" x2="60" y2="110" stroke="url(#phGold)" stroke-width="0.4"/>
    <!-- Отражения на стекле -->
    <rect x="18" y="40" width="2" height="14" fill="#fff" opacity="0.3"/>
    <rect x="42" y="68" width="2" height="14" fill="#fff" opacity="0.3"/>
  `,

  // ── Барвиха ──

  // Коттедж: домик с острой крышей, труба, дым, забор
  cottage: `
    <defs>
      <linearGradient id="ctWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d8b088"/>
        <stop offset="100%" stop-color="#a88060"/>
      </linearGradient>
      <linearGradient id="ctRoof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c03020"/>
        <stop offset="100%" stop-color="#801808"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="59" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <!-- Основной корпус -->
    <rect x="16" y="30" width="76" height="28" fill="url(#ctWall)" stroke="#5a3818" stroke-width="0.6"/>
    <!-- Сруб/доски -->
    <line x1="16" y1="36" x2="92" y2="36" stroke="#6a4828" stroke-width="0.3"/>
    <line x1="16" y1="44" x2="92" y2="44" stroke="#6a4828" stroke-width="0.3"/>
    <line x1="16" y1="52" x2="92" y2="52" stroke="#6a4828" stroke-width="0.3"/>
    <!-- Крыша двускатная -->
    <path d="M 8 30 L 60 6 L 112 30 Z" fill="url(#ctRoof)" stroke="#401008" stroke-width="0.8"/>
    <!-- Черепица - штрихи -->
    ${[...Array(6)].map((_, i) => `<line x1="${20 + i * 12}" y1="${28 - i * 3}" x2="${100 - i * 12}" y2="${28 - i * 3}" stroke="#601808" stroke-width="0.3" opacity="0.6"/>`).join("")}
    <!-- Труба с дымом -->
    <rect x="80" y="10" width="8" height="14" fill="#5a3a1a" stroke="#3a2008" stroke-width="0.4"/>
    <rect x="78" y="8" width="12" height="3" fill="#3a2008"/>
    <circle cx="84" cy="4" r="3" fill="#ccc" opacity="0.4"/>
    <circle cx="86" cy="-1" r="2" fill="#ddd" opacity="0.25"/>
    <circle cx="82" cy="-5" r="2.5" fill="#eee" opacity="0.15"/>
    <!-- Окно -->
    <rect x="28" y="38" width="14" height="12" fill="#8ac0e8" stroke="#3a1808" stroke-width="0.5"/>
    <line x1="35" y1="38" x2="35" y2="50" stroke="#3a1808" stroke-width="0.3"/>
    <line x1="28" y1="44" x2="42" y2="44" stroke="#3a1808" stroke-width="0.3"/>
    <!-- Второе окно со ставнями -->
    <rect x="64" y="38" width="14" height="12" fill="#8ac0e8" stroke="#3a1808" stroke-width="0.5"/>
    <rect x="60" y="38" width="4" height="12" fill="#6a3818" stroke="#3a1808" stroke-width="0.3"/>
    <rect x="78" y="38" width="4" height="12" fill="#6a3818" stroke="#3a1808" stroke-width="0.3"/>
    <!-- Дверь -->
    <rect x="50" y="44" width="10" height="14" fill="#3a1808" stroke="#1a0800" stroke-width="0.4"/>
    <circle cx="57" cy="52" r="0.8" fill="#d8b088"/>
    <!-- Забор внизу (живая изгородь) -->
    <rect x="0" y="55" width="120" height="4" fill="#2e5a1a"/>
    ${[...Array(15)].map((_, i) => `<circle cx="${i * 8 + 4}" cy="55" r="2" fill="${i % 2 ? '#3a6a20' : '#2e5a1a'}"/>`).join("")}
  `,

  // Вилла: мрамор, колонны, бассейн
  villa: `
    <defs>
      <linearGradient id="vlWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0e8d8"/>
        <stop offset="100%" stop-color="#d0c8b8"/>
      </linearGradient>
      <linearGradient id="vlPool" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5ad0e8"/>
        <stop offset="100%" stop-color="#2080a8"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="79" rx="56" ry="2" fill="rgba(0,0,0,0.55)"/>
    <!-- Основной корпус -->
    <rect x="6" y="18" width="108" height="46" fill="url(#vlWall)" stroke="#5a4a38" stroke-width="0.7"/>
    <!-- Второй этаж (чуть утоплен) -->
    <rect x="14" y="14" width="92" height="6" fill="#e8e0d0" stroke="#5a4a38" stroke-width="0.5"/>
    <rect x="20" y="8" width="80" height="6" fill="#d8d0c0" stroke="#5a4a38" stroke-width="0.5"/>
    <!-- Крыша плоская, широкий карниз -->
    <rect x="0" y="6" width="120" height="3" fill="#5a4a38"/>
    <!-- Окна: 4 арки на 1-м этаже -->
    ${[16, 42, 68, 94].map((x) => `
      <path d="M ${x} 46 L ${x} 32 Q ${x + 5} 26 ${x + 10} 32 L ${x + 10} 46 Z" fill="#8ac0e8" stroke="#5a4a38" stroke-width="0.4"/>
      <line x1="${x + 5}" y1="28" x2="${x + 5}" y2="46" stroke="#5a4a38" stroke-width="0.3"/>
    `).join("")}
    <!-- Колонны на входе -->
    ${[36, 44, 76, 84].map(x => `
      <rect x="${x}" y="30" width="2" height="22" fill="#c8bca0" stroke="#5a4a38" stroke-width="0.2"/>
      <rect x="${x - 1}" y="28" width="4" height="2" fill="#a89878"/>
      <rect x="${x - 1}" y="52" width="4" height="2" fill="#a89878"/>
    `).join("")}
    <!-- Дверь в центре (арка) -->
    <path d="M 54 46 L 54 34 Q 60 28 66 34 L 66 46 Z" fill="#3a2818" stroke="#1a0800" stroke-width="0.4"/>
    <circle cx="64" cy="40" r="0.8" fill="#e8d89a"/>
    <!-- Бассейн внизу справа -->
    <rect x="60" y="68" width="50" height="10" rx="2" fill="url(#vlPool)" stroke="#105080" stroke-width="0.5"/>
    <!-- Волны в бассейне -->
    <path d="M 62 70 Q 70 68 78 70 T 94 70 T 110 70" stroke="#fff" stroke-width="0.4" fill="none" opacity="0.5"/>
    <path d="M 62 73 Q 70 71 78 73 T 94 73 T 110 73" stroke="#fff" stroke-width="0.3" fill="none" opacity="0.3"/>
    <!-- Шезлонги слева -->
    <rect x="6" y="70" width="14" height="3" fill="#a89878"/>
    <rect x="6" y="70" width="14" height="1" fill="#c8bca0"/>
    <rect x="22" y="70" width="14" height="3" fill="#a89878"/>
    <rect x="22" y="70" width="14" height="1" fill="#c8bca0"/>
    <!-- Зонт -->
    <path d="M 40 64 L 40 74" stroke="#5a4a38" stroke-width="0.8"/>
    <path d="M 30 64 Q 40 58 50 64 Z" fill="#d8a050" stroke="#5a4a38" stroke-width="0.4"/>
  `,

  // Дворец: огромный, колонны, золотые купола, 3 секции
  palace: `
    <defs>
      <linearGradient id="plWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0dcb0"/>
        <stop offset="100%" stop-color="#c0a880"/>
      </linearGradient>
      <linearGradient id="plGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe066"/>
        <stop offset="100%" stop-color="#b8860b"/>
      </linearGradient>
      <linearGradient id="plGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8ac0e8"/>
        <stop offset="100%" stop-color="#3a6898"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="104" rx="58" ry="2.5" fill="rgba(0,0,0,0.55)"/>
    <!-- Центральная башня -->
    <rect x="34" y="24" width="52" height="80" fill="url(#plWall)" stroke="#6a4a20" stroke-width="0.8"/>
    <!-- Боковые крылья -->
    <rect x="6" y="44" width="28" height="60" fill="url(#plWall)" stroke="#6a4a20" stroke-width="0.7"/>
    <rect x="86" y="44" width="28" height="60" fill="url(#plWall)" stroke="#6a4a20" stroke-width="0.7"/>
    <!-- Крыши боковых крыльев (плоские с золотой окантовкой) -->
    <rect x="4" y="42" width="32" height="3" fill="url(#plGold)"/>
    <rect x="84" y="42" width="32" height="3" fill="url(#plGold)"/>
    <!-- Центральный купол -->
    <path d="M 34 24 Q 60 -8 86 24 Z" fill="url(#plGold)" stroke="#5a3a10" stroke-width="0.6"/>
    <line x1="60" y1="-8" x2="60" y2="-14" stroke="url(#plGold)" stroke-width="1.2"/>
    <circle cx="60" cy="-15" r="2" fill="url(#plGold)"/>
    <!-- Малые купола на крыльях -->
    <path d="M 12 44 Q 20 32 28 44 Z" fill="url(#plGold)" stroke="#5a3a10" stroke-width="0.4"/>
    <path d="M 92 44 Q 100 32 108 44 Z" fill="url(#plGold)" stroke="#5a3a10" stroke-width="0.4"/>
    <line x1="20" y1="32" x2="20" y2="28" stroke="url(#plGold)" stroke-width="0.8"/>
    <line x1="100" y1="32" x2="100" y2="28" stroke="url(#plGold)" stroke-width="0.8"/>
    <!-- Окна боковых крыльев -->
    ${[52, 66, 80].map(y => `
      <rect x="10" y="${y}" width="8" height="8" fill="url(#plGlass)" stroke="#5a3a10" stroke-width="0.3"/>
      <rect x="22" y="${y}" width="8" height="8" fill="url(#plGlass)" stroke="#5a3a10" stroke-width="0.3"/>
      <rect x="90" y="${y}" width="8" height="8" fill="url(#plGlass)" stroke="#5a3a10" stroke-width="0.3"/>
      <rect x="102" y="${y}" width="8" height="8" fill="url(#plGlass)" stroke="#5a3a10" stroke-width="0.3"/>
    `).join("")}
    <!-- Колонны центрального портика -->
    ${[40, 48, 56, 64, 72, 80].map(x => `
      <rect x="${x}" y="40" width="1.8" height="60" fill="#d8c8a0" stroke="#6a4a20" stroke-width="0.15"/>
      <rect x="${x - 0.5}" y="38" width="2.8" height="2" fill="#a88858"/>
      <rect x="${x - 0.5}" y="100" width="2.8" height="2" fill="#a88858"/>
    `).join("")}
    <!-- Фронтон центральный (треугольник над портиком) -->
    <path d="M 34 40 L 60 28 L 86 40 Z" fill="url(#plWall)" stroke="#6a4a20" stroke-width="0.6"/>
    <circle cx="60" cy="35" r="1.8" fill="url(#plGold)"/>
    <!-- Большие центральные окна за колоннами -->
    ${[50, 70, 88].map(y => `
      <rect x="38" y="${y}" width="44" height="12" fill="url(#plGlass)" stroke="#5a3a10" stroke-width="0.3" opacity="0.85"/>
      <line x1="60" y1="${y}" x2="60" y2="${y + 12}" stroke="#5a3a10" stroke-width="0.2"/>
    `).join("")}
    <!-- Главные двери -->
    <path d="M 50 104 L 50 90 Q 60 82 70 90 L 70 104 Z" fill="#3a2818" stroke="url(#plGold)" stroke-width="0.8"/>
    <line x1="60" y1="86" x2="60" y2="104" stroke="url(#plGold)" stroke-width="0.4"/>
    <circle cx="66" cy="95" r="0.8" fill="url(#plGold)"/>
    <!-- Мраморная лестница -->
    <rect x="44" y="100" width="32" height="2" fill="#b8a888"/>
    <rect x="40" y="102" width="40" height="2" fill="#a89878"/>
    <!-- Фонтаны по бокам (маленькие) -->
    <rect x="20" y="98" width="8" height="6" fill="#a88858"/>
    <ellipse cx="24" cy="98" rx="5" ry="1.5" fill="#5ad0e8" opacity="0.7"/>
    <rect x="92" y="98" width="8" height="6" fill="#a88858"/>
    <ellipse cx="96" cy="98" rx="5" ry="1.5" fill="#5ad0e8" opacity="0.7"/>
  `,
};