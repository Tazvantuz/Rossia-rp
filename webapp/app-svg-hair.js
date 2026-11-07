// app-svg-hair.js
// v4.0 — МАКСИМАЛЬНАЯ ДЕТАЛИЗАЦИЯ. Все 10 причёсок переработаны с нуля.
// Использовано многослойное наложение, тени, блики и текстура для создания объема.

const ALL_HAIRS_SVG = {
  // 1. Короткая черная (Стильный полубокс, выбритые виски, четкая линия челки)
  hair_short_black: `
    <!-- Фон (объем) -->
    <path d="M70 48 Q70 15 100 12 Q130 15 130 48 L126 60 L74 60 Z" fill="#0f0f0f"/>
    
    <!-- Основной купол -->
    <path d="M74 48 Q74 18 100 16 Q126 18 126 48 Q124 36 100 34 Q76 36 74 48 Z" fill="#1c1c1c" stroke="#0a0a0a" stroke-width="0.5"/>
    
    <!-- Выбритые виски (градиент) -->
    <path d="M72 48 Q72 32 78 26 L70 52 Z" fill="#2a2a2a"/>
    <path d="M128 48 Q128 32 122 26 L130 52 Z" fill="#2a2a2a"/>
    <path d="M72 42 Q74 34 78 30" stroke="#111" stroke-width="0.8" fill="none" stroke-dasharray="1,1" opacity="0.6"/>
    <path d="M128 42 Q126 34 122 30" stroke="#111" stroke-width="0.8" fill="none" stroke-dasharray="1,1" opacity="0.6"/>

    <!-- Верхний текстурированный слой -->
    <path d="M78 32 Q85 22 95 24 Q100 21 105 24 Q115 22 122 32 L120 45 Q110 36 100 38 Q90 36 80 45 Z" fill="#2d2d2d" opacity="0.9"/>
    
    <!-- Тонкие пряди (торчат) -->
    <path d="M80 28 L84 34 M86 24 L88 32 M92 22 L94 30 M108 22 L106 30 M114 24 L112 32 M120 28 L116 34" stroke="#0a0a0a" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    
    <!-- Челка (четкая линия надо лбом, глаза открыты) -->
    <path d="M78 40 Q88 38 100 40 Q112 38 122 40" stroke="#1c1c1c" stroke-width="2" fill="none"/>
    <path d="M76 44 Q88 42 100 44 Q112 42 124 44" stroke="#333" stroke-width="1" fill="none" opacity="0.6"/>

    <!-- Блики (сияние на макушке) -->
    <path d="M82 26 Q92 20 108 22" stroke="#5a5a5a" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M86 28 Q95 23 104 25" stroke="#7a7a7a" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
  `,

  // 2. Кудри каштановые (Объемные завитки, глубокие тени, реалистичная текстура)
  hair_curly_brown: `
    <!-- Задний план (глубина) -->
    <path d="M66 50 Q64 15 100 10 Q136 15 134 50 Q138 75 128 90 Q110 80 100 80 Q90 80 72 90 Q62 75 66 50 Z" fill="#2b180b"/>
    
    <!-- Темные локоны (основа) -->
    <circle cx="74" cy="36" r="10" fill="#3a2010"/>
    <circle cx="84" cy="24" r="11" fill="#3a2010"/>
    <circle cx="100" cy="18" r="12" fill="#3a2010"/>
    <circle cx="116" cy="24" r="11" fill="#3a2010"/>
    <circle cx="126" cy="36" r="10" fill="#3a2010"/>
    
    <!-- Средние локоны (объем) -->
    <circle cx="76" cy="40" r="8" fill="#4a2e1b"/>
    <circle cx="88" cy="28" r="9" fill="#4a2e1b"/>
    <circle cx="100" cy="24" r="9" fill="#4a2e1b"/>
    <circle cx="112" cy="28" r="9" fill="#4a2e1b"/>
    <circle cx="124" cy="40" r="8" fill="#4a2e1b"/>
    
    <!-- Передние мелкие локоны (детализация) -->
    <circle cx="82" cy="36" r="7" fill="#5c3a22"/>
    <circle cx="94" cy="24" r="7" fill="#5c3a22"/>
    <circle cx="106" cy="24" r="7" fill="#5c3a22"/>
    <circle cx="118" cy="36" r="7" fill="#5c3a22"/>
    
    <!-- Спускающиеся локоны (обрамляют лицо, не лезут на глаза) -->
    <path d="M66 50 Q62 70 68 85 Q72 90 76 80 Q74 65 76 50 Z" fill="#4a2e1b"/>
    <path d="M134 50 Q138 70 132 85 Q128 90 124 80 Q126 65 124 50 Z" fill="#4a2e1b"/>
    
    <!-- Тени между кудрями -->
    <path d="M78 45 Q90 38 100 38 Q110 38 122 45" stroke="#1a0e05" stroke-width="2" fill="none" opacity="0.6"/>
    
    <!-- Блики (свет на кудрях) -->
    <path d="M76 30 Q80 26 84 30" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M88 18 Q92 14 96 18" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M104 18 Q108 14 112 18" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M116 30 Q120 26 124 30" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M94 32 Q96 28 100 32" stroke="#6b4a2a" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M106 32 Q104 28 100 32" stroke="#6b4a2a" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <!-- Тонкие волоски (для реализма) -->
    <path d="M80 25 Q85 20 90 22" stroke="#7a5a3a" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M110 22 Q115 20 120 25" stroke="#7a5a3a" stroke-width="0.8" fill="none" opacity="0.5"/>
  `,

  // 3. Длинные рыжие (Плавные волны, естественное падение на грудь, без эффекта прилипания)
  hair_long_red: `
    <!-- Задний фон (объем сзади) -->
    <path d="M68 50 Q55 90 58 150 Q68 160 78 150 Q74 90 76 55 Z" fill="#6b0000"/>
    <path d="M132 50 Q145 90 142 150 Q132 160 122 150 Q126 90 124 55 Z" fill="#6b0000"/>

    <!-- Основная масса (верх) -->
    <path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    
    <!-- Боковые волны (перекрывают плечи, создают воздух) -->
    <path d="M70 50 Q62 80 58 120 Q68 125 74 110 Q72 80 76 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q138 80 142 120 Q132 125 126 110 Q128 80 124 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    
    <!-- Внутренние передние пряди (спадают на грудь) -->
    <path d="M74 55 Q70 90 72 130 Q78 140 84 130 Q82 90 80 60 Z" fill="#e74c3c" opacity="0.8"/>
    <path d="M126 55 Q130 90 128 130 Q122 140 116 130 Q118 90 120 60 Z" fill="#e74c3c" opacity="0.8"/>
    
    <!-- Текстура (линии волос) -->
    <path d="M72 60 Q66 100 68 135 M128 60 Q134 100 132 135" stroke="#8b0000" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M64 80 Q60 110 62 140 M136 80 Q140 110 138 140" stroke="#8b0000" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M76 65 Q72 100 74 135 M124 65 Q128 100 126 135" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.5"/>
    
    <!-- Блики (светлые полосы) -->
    <path d="M78 30 Q86 22 94 26 M122 30 Q114 22 106 26" stroke="#e74c3c" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M76 45 Q85 36 100 36 Q115 36 124 45" stroke="#e74c3c" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M66 85 Q62 105 64 130" stroke="#f1948a" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M134 85 Q138 105 136 130" stroke="#f1948a" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M74 95 Q72 110 74 125" stroke="#f1948a" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M126 95 Q128 110 126 125" stroke="#f1948a" stroke-width="1" fill="none" opacity="0.4"/>
    
    <!-- Лицо (челка не закрывает глаза) -->
    <path d="M76 40 Q88 36 100 38 Q112 36 124 40" stroke="#8b0000" stroke-width="1.5" fill="none" opacity="0.5"/>
  `,

  // 4. Ирокез синий (Агрессивный 3D-ирокез, выбритые виски с текстурой)
  hair_mohawk_blue: `
    <!-- Выбритые виски (ежик) -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#111" stroke="#000" stroke-width="0.4"/>
    <path d="M72 48 Q72 32 78 26 L70 52 Z" fill="#1a1a1a"/>
    <path d="M128 48 Q128 32 122 26 L130 52 Z" fill="#1a1a1a"/>
    <path d="M72 42 Q74 34 78 30 M128 42 Q126 34 122 30" stroke="#333" stroke-width="1" fill="none" stroke-dasharray="1.5,1.5" opacity="0.6"/>

    <!-- Основа ирокеза (тень) -->
    <path d="M78 30 Q72 10 100 -8 Q128 10 122 30 Z" fill="#0d3b5c"/>
    
    <!-- Шипы (задний слой, темнее) -->
    <path d="M78 30 L70 15 L82 22 L75 0 L88 18 L95 -10 L100 15 L105 -10 L112 18 L125 0 L118 22 L130 15 L122 30 Z" fill="#1a5276"/>
    
    <!-- Шипы (передний слой, ярче) -->
    <path d="M80 30 L74 18 L84 24 L78 5 L88 20 L95 -5 L100 18 L105 -5 L112 20 L122 5 L116 24 L126 18 L120 30 Z" fill="#3498db" stroke="#1a5276" stroke-width="1" stroke-linejoin="round"/>
    
    <!-- Тени на шипах (объем) -->
    <path d="M100 18 L105 -5 L112 20 L122 5 L116 24 L126 18 L120 30 L100 30 Z" fill="#2874a6" opacity="0.6"/>
    
    <!-- Блики (кончики) -->
    <path d="M95 -5 L100 18" stroke="#5dade2" stroke-width="2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M78 5 L88 20" stroke="#5dade2" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M105 -5 L100 18" stroke="#85c1e9" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M122 5 L112 20" stroke="#85c1e9" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <!-- Тень у основания -->
    <path d="M82 25 Q100 12 118 25" stroke="#0a192f" stroke-width="3" fill="none" opacity="0.8"/>
  `,

  // 5. Золотые локоны (Роскошные, шелковистые, струящиеся волны)
  hair_flowing_gold: `
    <!-- Задний фон (объемная грива) -->
    <path d="M64 52 Q50 100 54 160 Q54 185 68 190 Q82 185 78 160 Q76 100 80 58 Z" fill="#8b6914"/>
    <path d="M136 52 Q150 100 146 160 Q146 185 132 190 Q118 185 122 160 Q124 100 120 58 Z" fill="#8b6914"/>

    <!-- Основная масса (верх) -->
    <path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    
    <!-- Передние струящиеся пряди -->
    <path d="M68 52 Q58 85 60 130 Q72 135 78 120 Q74 85 76 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M132 52 Q142 85 140 130 Q128 135 122 120 Q126 85 124 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    
    <!-- Внутренние пряди (на грудь) -->
    <path d="M74 58 Q68 100 70 140 Q76 150 82 140 Q80 100 80 65 Z" fill="#f9e079" opacity="0.7"/>
    <path d="M126 58 Q132 100 130 140 Q124 150 118 140 Q120 100 120 65 Z" fill="#f9e079" opacity="0.7"/>

    <!-- Текстура (множество тонких линий) -->
    <path d="M72 70 Q64 110 66 155 M128 70 Q136 110 134 155" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M68 80 Q60 120 62 165 M132 80 Q140 120 138 165" stroke="#b8860b" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M76 60 Q72 90 74 140 M124 60 Q128 90 126 140" stroke="#d4ac0d" stroke-width="1.2" fill="none" opacity="0.5"/>
    
    <!-- Блики (эффект шелка) -->
    <path d="M76 30 Q86 22 96 26 M124 30 Q114 22 104 26" stroke="#f9e079" stroke-width="2.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <ellipse cx="80" cy="40" rx="7" ry="3" fill="#f9e079" opacity="0.8"/>
    <ellipse cx="120" cy="40" rx="7" ry="3" fill="#f9e079" opacity="0.8"/>
    <path d="M72 90 Q66 120 70 160" stroke="#f9e079" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M128 90 Q134 120 130 160" stroke="#f9e079" stroke-width="2" fill="none" opacity="0.7"/>
    
    <!-- Лицо (аккуратная челка, не закрывает глаза) -->
    <path d="M76 42 Q88 36 100 38 Q112 36 124 42" stroke="#d4ac0d" stroke-width="1.5" fill="none" opacity="0.6"/>
  `,

  // 6. Длинные каштановые (Элегантный прямой пробор, волосы уходят за плечи)
  hair_long_brown: `
    <!-- Задний план (глубина) -->
    <path d="M72 48 Q72 16 100 14 Q128 16 128 48 Q135 80 140 150 Q120 160 115 120 Q115 75 118 50 Q118 40 100 38 Q82 40 82 50 Q85 75 85 120 Q80 160 60 150 Q65 80 72 48 Z" fill="#1a0e05"/>
    
    <!-- Боковые пряди (обрамляют лицо) -->
    <path d="M70 50 Q62 80 64 130 Q74 140 78 120 Q74 80 76 55 Z" fill="#2b180b" stroke="#1a0e05" stroke-width="0.4"/>
    <path d="M130 50 Q138 80 136 130 Q126 140 122 120 Q126 80 124 55 Z" fill="#2b180b" stroke="#1a0e05" stroke-width="0.4"/>
    
    <!-- Основной верх -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48" fill="#3a2010"/>
    
    <!-- Прямой пробор -->
    <path d="M100 18 L100 38" stroke="#1a0e05" stroke-width="1.5" fill="none" opacity="0.9"/>
    <path d="M75 35 Q85 25 100 23" stroke="#4a2e1b" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M125 35 Q115 25 100 23" stroke="#4a2e1b" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    
    <!-- Текстура (волны вниз) -->
    <path d="M74 60 Q66 90 68 135" stroke="#1a0e05" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M126 60 Q134 90 132 135" stroke="#1a0e05" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M82 80 Q76 110 80 140" stroke="#2b180b" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M118 80 Q124 110 120 140" stroke="#2b180b" stroke-width="1.2" fill="none" opacity="0.6"/>
    
    <!-- Блики (гладкость) -->
    <path d="M82 30 Q92 22 100 24" stroke="#5c3a22" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M118 30 Q108 22 100 24" stroke="#5c3a22" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M72 70 Q66 100 70 130" stroke="#5c3a22" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M128 70 Q134 100 130 130" stroke="#5c3a22" stroke-width="1.5" fill="none" opacity="0.5"/>
  `,

  // 7. Гоп-стрижка (Короткая, небрежная челка, выбритые виски)
  hair_gopnik: `
    <!-- База (темная) -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#111" stroke="#000" stroke-width="0.4"/>
    
    <!-- Выбритые виски -->
    <path d="M72 48 Q72 32 80 26 L70 52 Z" fill="#1a1a1a"/>
    <path d="M128 48 Q128 32 120 26 L130 52 Z" fill="#1a1a1a"/>
    
    <!-- Основной слой (рваные пряди) -->
    <path d="M76 30 Q85 24 95 25 Q100 22 105 25 Q115 24 124 30 L122 45 Q110 36 100 38 Q90 36 78 45 Z" fill="#2a2a2a" opacity="0.9"/>
    
    <!-- Челка на лоб (гоп-стиль, до бровей) -->
    <path d="M80 38 Q90 40 95 44 Q85 46 75 40 Z" fill="#1c1c1c"/>
    <path d="M120 38 Q110 40 105 44 Q115 46 125 40 Z" fill="#1c1c1c"/>
    <path d="M85 42 L88 46 M95 43 L95 47 M105 43 L105 47 M115 42 L112 46" stroke="#111" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <!-- Текстура (торчащие волоски) -->
    <path d="M78 28 L82 35 M86 24 L88 32 M94 22 L95 30 M106 22 L105 30 M114 24 L112 32 M122 28 L118 35" stroke="#0a0a0a" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M82 42 Q90 38 100 40 Q110 38 118 42" stroke="#0a0a0a" stroke-width="1.2" fill="none" opacity="0.7"/>
    
    <!-- Блик на макушке -->
    <path d="M85 26 Q95 23 105 26" stroke="#444" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
  `,

  // 8. Зачес назад (Мафия, влажный блеск, линии расчески)
  hair_slick_back: `
    <!-- Основа -->
    <path d="M72 50 Q72 14 100 12 Q128 14 128 50 Q126 38 100 36 Q74 38 72 50 Z" fill="#1c1814" stroke="#0a0806" stroke-width="0.5"/>
    <path d="M72 48 Q72 20 100 16 Q128 20 128 48 Q124 40 100 38 Q76 40 72 48 Z" fill="#2b241d"/>
    
    <!-- Затылок (V-образный вырез) -->
    <path d="M74 50 Q74 60 76 70 Q80 65 82 55 Z" fill="#1c1814"/>
    <path d="M126 50 Q126 60 124 70 Q120 65 118 55 Z" fill="#1c1814"/>
    
    <!-- Линии расчески (текстура) -->
    <path d="M74 38 Q85 28 100 26 Q115 28 126 38" stroke="#4a3d30" stroke-width="2.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M76 42 Q88 34 100 32 Q112 34 124 42" stroke="#4a3d30" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M78 46 Q90 40 100 38 Q110 40 122 46" stroke="#4a3d30" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M80 50 Q90 44 100 42 Q110 44 120 50" stroke="#4a3d30" stroke-width="1.2" fill="none" opacity="0.5" stroke-linecap="round"/>
    
    <!-- Яркий блеск (гель) -->
    <path d="M78 24 Q90 16 110 20" stroke="#8a7a6a" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M82 22 Q92 18 102 20" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <ellipse cx="85" cy="30" rx="6" ry="2.5" fill="#fff" opacity="0.7" transform="rotate(-15 85 30)"/>
    <ellipse cx="115" cy="30" rx="6" ry="2.5" fill="#fff" opacity="0.7" transform="rotate(15 115 30)"/>
  `,

  // 9. Блонд с ободком (K-pop, мягкие объемные волны, стильный ободок)
  hair_blonde_headband: `
    <!-- Задний план (объем) -->
    <path d="M66 50 Q66 12 100 10 Q134 12 134 50 Q138 85 145 150 Q125 155 120 110 Q118 80 120 50 Q120 38 100 36 Q80 38 80 50 Q82 80 80 110 Q75 155 55 150 Q62 85 66 50 Z" fill="#b8860b"/>
    
    <!-- Боковые локоны -->
    <path d="M64 52 Q58 85 56 130 Q68 135 74 120 Q70 85 72 55 Z" fill="#d4ac0d"/>
    <path d="M136 52 Q142 85 144 130 Q132 135 126 120 Q130 85 128 55 Z" fill="#d4ac0d"/>
    
    <!-- Основная масса -->
    <path d="M70 50 Q70 16 100 14 Q130 16 130 50" fill="#f9e079"/>
    
    <!-- Мягкие волны (текстура) -->
    <path d="M74 30 Q85 18 100 16 Q115 18 126 30" stroke="#fff" stroke-width="3" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M78 40 Q90 30 100 32 Q110 30 122 40" stroke="#fff" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M72 60 Q66 90 68 135" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M128 60 Q134 90 132 135" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M68 75 Q64 105 66 140" stroke="#d4ac0d" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M132 75 Q136 105 134 140" stroke="#d4ac0d" stroke-width="1.2" fill="none" opacity="0.5"/>
    
    <!-- Ободок (сидит поверх волос) -->
    <path d="M72 42 Q100 30 128 42 L128 48 Q100 36 72 48 Z" fill="#00bcd4" stroke="#00838f" stroke-width="1"/>
    <path d="M72 44 Q100 32 128 44" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.9"/>
    <path d="M73 46 Q100 34 127 46" stroke="#00838f" stroke-width="0.5" fill="none" opacity="0.8"/>
    
    <!-- Прядь, выбившаяся из-под ободка -->
    <path d="M78 46 Q74 55 78 68 Q84 58 84 46 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.5"/>
    <path d="M122 46 Q126 55 122 68 Q116 58 116 46 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.5"/>
    
    <!-- Блики (эффект дорогих волос) -->
    <path d="M82 22 Q92 16 102 18" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M118 22 Q108 16 98 18" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M66 85 Q62 110 64 135" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M134 85 Q138 110 136 135" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6"/>
  `,

  // 10. Розовый панк (Рваный ирокез, агрессивные шипы, 3D-эффект)
  hair_punk_pink: `
    <!-- Выбритые виски -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#3a001a"/>
    <path d="M72 48 Q72 32 80 26 L70 52 Z" fill="#2a0010"/>
    <path d="M128 48 Q128 32 120 26 L130 52 Z" fill="#2a0010"/>
    <path d="M74 40 L78 34 M76 46 L82 38 M122 34 L126 40 M118 38 L124 46" stroke="#880e4f" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <!-- Основа ирокеза (глубокая тень) -->
    <path d="M82 25 Q72 0 100 -15 Q128 0 118 25 Z" fill="#4a0024"/>
    
    <!-- Задние рваные шипы -->
    <path d="M75 30 L85 10 L90 25 L98 -15 L102 20 L110 -15 L115 25 L120 10 L125 30 L115 42 L85 42 Z" fill="#ad1457"/>
    
    <!-- Передние яркие шипы -->
    <path d="M78 30 L84 15 L88 28 L95 -5 L100 22 L105 -5 L112 28 L116 15 L122 30 L116 42 L84 42 Z" fill="#e91e63" stroke="#880e4f" stroke-width="1.5" stroke-linejoin="round"/>
    
    <!-- Тени на шипах (правая сторона) -->
    <path d="M100 22 L105 -5 L112 28 L116 15 L122 30 L116 42 L100 42 Z" fill="#c2185b" opacity="0.7"/>
    
    <!-- Блики (неоновый свет) -->
    <path d="M95 -5 L100 22" stroke="#f06292" stroke-width="2.5" fill="none" opacity="1" stroke-linecap="round"/>
    <path d="M105 -5 L100 22" stroke="#f06292" stroke-width="2" fill="none" opacity="0.8"/>
    <path d="M84 15 L88 28" stroke="#f06292" stroke-width="2" fill="none" opacity="0.9"/>
    <path d="M116 15 L112 28" stroke="#f06292" stroke-width="2" fill="none" opacity="0.9"/>
    <path d="M78 30 Q85 20 92 28" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M122 30 Q115 20 108 28" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.7"/>
    
    <!-- Контур низа (переход в виски) -->
    <path d="M84 42 Q100 32 116 42" stroke="#880e4f" stroke-width="2.5" fill="none"/>
  `
};

// Автоматически добавляем все причёски в основной объект ITEMS_SVG
if (typeof ITEMS_SVG !== 'undefined') {
  Object.assign(ITEMS_SVG, ALL_HAIRS_SVG);
}