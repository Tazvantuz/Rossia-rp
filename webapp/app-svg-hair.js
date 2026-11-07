// app-svg-hair.js
// v3.0 — Максимальная детализация всех 10 причёсок. Многослойность, тени, блики, текстура.

const ALL_HAIRS_SVG = {
  // 1. Короткая черная (Стильный полубокс с выбритыми висками и текстурой)
  hair_short_black: `
    <!-- Задний фон для объема -->
    <path d="M72 48 Q72 18 100 16 Q128 18 128 48 L126 55 L74 55 Z" fill="#0f0f0f"/>
    <!-- Основная масса -->
    <path d="M74 50 Q74 20 100 18 Q126 20 126 50 Q124 38 100 36 Q76 38 74 50 Z" fill="#1c1c1c" stroke="#0a0a0a" stroke-width="0.5"/>
    <!-- Выбритые виски -->
    <path d="M72 50 Q72 35 78 30 L70 55 Z" fill="#2a2a2a" opacity="0.9"/>
    <path d="M128 50 Q128 35 122 30 L130 55 Z" fill="#2a2a2a" opacity="0.9"/>
    <!-- Верхний слой (пряди) -->
    <path d="M78 32 Q85 25 95 26 Q100 24 105 26 Q115 25 122 32 L120 45 Q110 36 100 38 Q90 36 80 45 Z" fill="#2d2d2d" opacity="0.8"/>
    <!-- Текстура (волоски) -->
    <path d="M80 28 L84 34 M88 24 L90 32 M96 22 L97 30 M104 22 L103 30 M112 24 L110 32 M120 28 L116 34" stroke="#0a0a0a" stroke-width="1.2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M76 40 Q85 32 100 34 Q115 32 124 40" stroke="#333" stroke-width="1" fill="none" opacity="0.6"/>
    <!-- Блик (сияние на макушке) -->
    <path d="M82 26 Q92 22 108 24" stroke="#5a5a5a" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M86 28 Q95 25 104 27" stroke="#7a7a7a" stroke-width="1" fill="none" opacity="0.4" stroke-linecap="round"/>
  `,

  // 2. Кудри каштановые (Объемные завитки, глубокие тени, игра света)
  hair_curly_brown: `
    <!-- Задний план (объем) -->
    <path d="M68 50 Q66 15 100 12 Q134 15 132 50 Q135 70 128 85 Q110 75 100 75 Q90 75 72 85 Q65 70 68 50 Z" fill="#2b180b"/>
    <!-- Основные крупные локоны (темные) -->
    <circle cx="74" cy="38" r="9" fill="#3a2010" stroke="#2b180b" stroke-width="0.5"/>
    <circle cx="84" cy="26" r="10" fill="#3a2010" stroke="#2b180b" stroke-width="0.5"/>
    <circle cx="100" cy="20" r="11" fill="#3a2010" stroke="#2b180b" stroke-width="0.5"/>
    <circle cx="116" cy="26" r="10" fill="#3a2010" stroke="#2b180b" stroke-width="0.5"/>
    <circle cx="126" cy="38" r="9" fill="#3a2010" stroke="#2b180b" stroke-width="0.5"/>
    <!-- Средние локоны (светлее) -->
    <circle cx="76" cy="42" r="7" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <circle cx="88" cy="30" r="8" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <circle cx="100" cy="26" r="8" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <circle cx="112" cy="30" r="8" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <circle cx="124" cy="42" r="7" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <!-- Передние мелкие локоны -->
    <circle cx="82" cy="38" r="6" fill="#5c3a22" stroke="#2b180b" stroke-width="0.3"/>
    <circle cx="94" cy="26" r="6" fill="#5c3a22" stroke="#2b180b" stroke-width="0.3"/>
    <circle cx="106" cy="26" r="6" fill="#5c3a22" stroke="#2b180b" stroke-width="0.3"/>
    <circle cx="118" cy="38" r="6" fill="#5c3a22" stroke="#2b180b" stroke-width="0.3"/>
    <!-- Спускающиеся локоны на плечи -->
    <path d="M68 50 Q65 65 70 80 Q75 85 78 75 Q76 65 76 55 Z" fill="#4a2e1b"/>
    <path d="M132 50 Q135 65 130 80 Q125 85 122 75 Q124 65 124 55 Z" fill="#4a2e1b"/>
    <!-- Блики (свет на кудрях) -->
    <path d="M76 32 Q80 28 84 32" stroke="#7a5a3a" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M88 20 Q92 16 96 20" stroke="#7a5a3a" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M104 20 Q108 16 112 20" stroke="#7a5a3a" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M116 32 Q120 28 124 32" stroke="#7a5a3a" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M94 34 Q96 30 100 34" stroke="#6b4a2a" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M106 34 Q104 30 100 34" stroke="#6b4a2a" stroke-width="1" fill="none" opacity="0.5"/>
  `,

  // 3. Длинные рыжие (Плавные волны, обрамление, струящиеся пряди)
  hair_long_red: `
    <!-- Задний фон (глубина) -->
    <path d="M70 50 Q60 90 62 145 Q70 150 78 145 Q74 90 76 55 Z" fill="#6b0000"/>
    <path d="M130 50 Q140 90 138 145 Q130 150 122 145 Q126 90 124 55 Z" fill="#6b0000"/>
    <!-- Основная масса верх -->
    <path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <!-- Боковые волны (перекрывают одежду) -->
    <path d="M70 50 Q64 75 62 105 Q70 110 74 100 Q74 75 76 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q136 75 138 105 Q130 110 126 100 Q126 75 124 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <!-- Дополнительные пряди спереди -->
    <path d="M74 55 Q72 80 74 115 Q78 120 82 110 Q80 80 80 60 Z" fill="#e74c3c" opacity="0.6"/>
    <path d="M126 55 Q128 80 126 115 Q122 120 118 110 Q120 80 120 60 Z" fill="#e74c3c" opacity="0.6"/>
    <!-- Текстура (линии волос) -->
    <path d="M72 60 Q68 100 70 130 M128 60 Q132 100 130 130" stroke="#8b0000" stroke-width="1.2" fill="none" opacity="0.7"/>
    <path d="M66 80 Q64 110 66 135 M134 80 Q136 110 134 135" stroke="#8b0000" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M76 65 Q74 100 76 125 M124 65 Q126 100 124 125" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <!-- Блики (светлые полосы) -->
    <path d="M78 30 Q86 24 94 28 M122 30 Q114 24 106 28" stroke="#e74c3c" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M76 45 Q85 38 100 38 Q115 38 124 45" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M68 85 Q66 105 68 125" stroke="#f1948a" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M132 85 Q134 105 132 125" stroke="#f1948a" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M74 95 Q72 110 74 120" stroke="#f1948a" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M126 95 Q128 110 126 120" stroke="#f1948a" stroke-width="0.8" fill="none" opacity="0.4"/>
  `,

  // 4. Ирокез синий (Агрессивные 3D-шипы, выбритые виски)
  hair_mohawk_blue: `
    <!-- Выбритые виски (ежик) -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#111" stroke="#000" stroke-width="0.4"/>
    <path d="M72 48 Q72 35 78 30 L70 55 Z" fill="#1a1a1a"/>
    <path d="M128 48 Q128 35 122 30 L130 55 Z" fill="#1a1a1a"/>
    <!-- Основа ирокеза (тень) -->
    <path d="M80 30 Q75 10 100 -5 Q125 10 120 30 Z" fill="#1a5276"/>
    <!-- Шипы (светлая сторона) -->
    <path d="M80 30 L72 18 L84 24 L78 5 L88 20 L95 -5 L100 18 L105 -5 L112 20 L122 5 L116 24 L128 18 L120 30 Z" fill="#3498db" stroke="#1a5276" stroke-width="1" stroke-linejoin="round"/>
    <!-- Шипы (теневая сторона для 3D) -->
    <path d="M100 18 L105 -5 L112 20 L122 5 L116 24 L128 18 L120 30 L100 30 Z" fill="#2874a6" opacity="0.6"/>
    <!-- Блики на шипах -->
    <path d="M95 -5 L100 18" stroke="#5dade2" stroke-width="1.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M78 5 L88 20" stroke="#5dade2" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M105 -5 L100 18" stroke="#85c1e9" stroke-width="1" fill="none" opacity="0.6"/>
    <!-- Внутренние тени у основания -->
    <path d="M82 25 Q100 15 118 25" stroke="#1a5276" stroke-width="2" fill="none" opacity="0.8"/>
  `,

  // 5. Золотые локоны (Роскошные, гладкие, сияющие)
  hair_flowing_gold: `
    <!-- Задний фон -->
    <path d="M66 52 Q56 100 58 160 Q58 180 68 185 Q78 180 74 160 Q74 100 78 58 Z" fill="#b8860b"/>
    <path d="M134 52 Q144 100 142 160 Q142 180 132 185 Q122 180 126 160 Q126 100 122 58 Z" fill="#b8860b"/>
    <!-- Основная масса -->
    <path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <!-- Передние струящиеся пряди -->
    <path d="M68 52 Q60 85 62 125 Q72 130 76 120 Q74 85 76 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M132 52 Q140 85 138 125 Q128 130 124 120 Q126 85 124 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <!-- Текстура (множество тонких линий) -->
    <path d="M72 70 Q65 110 66 150 M128 70 Q135 110 134 150" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M70 80 Q66 120 68 165 M130 80 Q134 120 132 165" stroke="#b8860b" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M76 60 Q74 90 76 135 M124 60 Q126 90 124 135" stroke="#d4ac0d" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M64 90 Q62 120 64 150 M136 90 Q138 120 136 150" stroke="#d4ac0d" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Блики (эффект шелка) -->
    <path d="M76 30 Q86 24 96 28 M124 30 Q114 24 104 28" stroke="#f9e079" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <ellipse cx="80" cy="40" rx="6" ry="3" fill="#f9e079" opacity="0.7"/>
    <ellipse cx="120" cy="40" rx="6" ry="3" fill="#f9e079" opacity="0.7"/>
    <path d="M72 90 Q70 120 72 155" stroke="#f9e079" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M128 90 Q130 120 128 155" stroke="#f9e079" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M68 75 Q66 100 68 125" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M132 75 Q134 100 132 125" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.5"/>
  `,

  // 6. Длинные каштановые (Элегантные, прямой пробор, глубокие тени)
  hair_long_brown: `
    <!-- Задний план -->
    <path d="M72 48 Q72 16 100 14 Q128 16 128 48 Q128 75 135 140 Q120 145 115 110 Q115 75 118 50 Q118 40 100 38 Q82 40 82 50 Q85 75 85 110 Q80 145 65 140 Q72 75 72 48 Z" fill="#2b180b"/>
    <!-- Боковые пряди (перекрывают тело) -->
    <path d="M70 50 Q64 80 62 120 Q72 125 78 115 Q74 80 76 55 Z" fill="#3a2010" stroke="#2b180b" stroke-width="0.4"/>
    <path d="M130 50 Q136 80 138 120 Q128 125 122 115 Q126 80 124 55 Z" fill="#3a2010" stroke="#2b180b" stroke-width="0.4"/>
    <!-- Основной верх -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48" fill="#4a2e1b"/>
    <!-- Прямой пробор и текстура -->
    <path d="M100 18 L100 38" stroke="#2b180b" stroke-width="1" fill="none" opacity="0.8"/>
    <path d="M75 35 Q85 25 100 23" stroke="#5c3a22" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M125 35 Q115 25 100 23" stroke="#5c3a22" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M78 42 Q90 38 100 40 Q110 38 122 42" stroke="#5c3a22" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
    <!-- Волны вниз -->
    <path d="M74 60 Q68 90 66 125" stroke="#2b180b" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M126 60 Q132 90 134 125" stroke="#2b180b" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M82 80 Q78 110 80 135" stroke="#3a2010" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M118 80 Q122 110 120 135" stroke="#3a2010" stroke-width="1" fill="none" opacity="0.5"/>
    <!-- Блики -->
    <path d="M82 30 Q92 24 100 26" stroke="#7a5230" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M118 30 Q108 24 100 26" stroke="#7a5230" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M72 70 Q70 100 72 125" stroke="#7a5230" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M128 70 Q130 100 128 125" stroke="#7a5230" stroke-width="1" fill="none" opacity="0.5"/>
  `,

  // 7. Гоп-стрижка (Спереди челка, сзади полубокс, небрежность)
  hair_gopnik: `
    <!-- База (темная) -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#111" stroke="#000" stroke-width="0.4"/>
    <!-- Выбритые виски -->
    <path d="M72 48 Q72 35 80 30 L70 52 Z" fill="#1a1a1a"/>
    <path d="M128 48 Q128 35 120 30 L130 52 Z" fill="#1a1a1a"/>
    <!-- Основной слой (рваные пряди) -->
    <path d="M76 30 Q85 24 95 25 Q100 22 105 25 Q115 24 124 30 L122 45 Q110 36 100 38 Q90 36 78 45 Z" fill="#2a2a2a" opacity="0.9"/>
    <!-- Челка на лоб (гоп-стиль) -->
    <path d="M80 40 Q90 42 95 45 Q85 48 75 42 Z" fill="#1c1c1c"/>
    <path d="M120 40 Q110 42 105 45 Q115 48 125 42 Z" fill="#1c1c1c"/>
    <!-- Текстура (торчащие волоски) -->
    <path d="M78 28 L82 35 M86 24 L88 32 M94 22 L95 30 M106 22 L105 30 M114 24 L112 32 M122 28 L118 35" stroke="#0a0a0a" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M82 42 Q90 38 100 40 Q110 38 118 42" stroke="#0a0a0a" stroke-width="1.2" fill="none" opacity="0.7"/>
    <!-- Блик на макушке -->
    <path d="M85 26 Q95 23 105 26" stroke="#444" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
  `,

  // 8. Зачес назад (Мафия, влажный блеск, линии расчески)
  hair_slick_back: `
    <!-- Основа -->
    <path d="M72 50 Q72 14 100 12 Q128 14 128 50 Q126 38 100 36 Q74 38 72 50 Z" fill="#1c1814" stroke="#0a0806" stroke-width="0.5"/>
    <path d="M72 48 Q72 22 100 18 Q128 22 128 48 Q124 42 100 40 Q76 42 72 48 Z" fill="#2b241d"/>
    <!-- Затылок -->
    <path d="M74 50 Q74 60 76 70 Q80 65 82 55 Z" fill="#1c1814"/>
    <path d="M126 50 Q126 60 124 70 Q120 65 118 55 Z" fill="#1c1814"/>
    <!-- Линии расчески (текстура) -->
    <path d="M74 40 Q85 30 100 28 Q115 30 126 40" stroke="#4a3d30" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M76 44 Q88 36 100 34 Q112 36 124 44" stroke="#4a3d30" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M78 48 Q90 42 100 40 Q110 42 122 48" stroke="#4a3d30" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M80 52 Q90 46 100 44 Q110 46 120 52" stroke="#4a3d30" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
    <!-- Яркий блеск (гель) -->
    <path d="M78 26 Q90 18 110 22" stroke="#8a7a6a" stroke-width="2.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M82 24 Q92 20 102 22" stroke="#fff" stroke-width="1" fill="none" opacity="0.8" stroke-linecap="round"/>
    <ellipse cx="85" cy="32" rx="5" ry="2" fill="#fff" opacity="0.6" transform="rotate(-15 85 32)"/>
    <ellipse cx="115" cy="32" rx="5" ry="2" fill="#fff" opacity="0.6" transform="rotate(15 115 32)"/>
  `,

  // 9. Блонд с ободком (K-pop, мягкие объемные волны)
  hair_blonde_headband: `
    <!-- Задний план -->
    <path d="M68 50 Q68 12 100 10 Q132 12 132 50 Q135 80 142 140 Q125 145 120 110 Q118 80 120 50 Q120 38 100 36 Q80 38 80 50 Q82 80 80 110 Q75 145 58 140 Q65 80 68 50 Z" fill="#d4ac0d"/>
    <path d="M66 52 Q62 80 60 120 Q70 125 76 115 Q72 80 74 55 Z" fill="#e6c85c"/>
    <path d="M134 52 Q138 80 140 120 Q130 125 124 115 Q128 80 126 55 Z" fill="#e6c85c"/>
    <!-- Основная масса -->
    <path d="M70 50 Q70 16 100 14 Q130 16 130 50" fill="#f9e079"/>
    <!-- Текстура и волны -->
    <path d="M74 30 Q85 20 100 18 Q115 20 126 30" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M78 40 Q90 32 100 34 Q110 32 122 40" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M75 60 Q70 90 68 130" stroke="#d4ac0d" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M125 60 Q130 90 132 130" stroke="#d4ac0d" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M72 70 Q68 100 70 125" stroke="#e6c85c" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M128 70 Q132 100 130 125" stroke="#e6c85c" stroke-width="1" fill="none" opacity="0.5"/>
    <!-- Ободок (сидит поверх волос) -->
    <path d="M72 42 Q100 32 128 42 L128 47 Q100 37 72 47 Z" fill="#00bcd4" stroke="#00838f" stroke-width="0.8"/>
    <path d="M72 44 Q100 34 128 44" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.8"/>
    <path d="M73 45 Q100 35 127 45" stroke="#00838f" stroke-width="0.5" fill="none" opacity="0.8"/>
    <!-- Прядь, выбившаяся из-под ободка -->
    <path d="M80 46 Q78 55 82 65 Q86 55 85 46 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.5"/>
    <!-- Блики -->
    <path d="M82 24 Q92 20 102 22" stroke="#fff" stroke-width="2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M118 24 Q108 20 98 22" stroke="#fff" stroke-width="2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M68 85 Q66 105 68 130" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M132 85 Q134 105 132 130" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6"/>
  `,

  // 10. Розовый панк (Рваный ирокез, агрессивные шипы, 3D)
  hair_punk_pink: `
    <!-- Выбритые виски -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#3a001a"/>
    <path d="M72 48 Q72 35 80 30 L70 52 Z" fill="#2a0010"/>
    <path d="M128 48 Q128 35 120 30 L130 52 Z" fill="#2a0010"/>
    <!-- Основа ирокеза (тень) -->
    <path d="M82 25 Q75 5 100 -10 Q125 5 118 25 Z" fill="#880e4f"/>
    <!-- Рваные шипы -->
    <path d="M75 30 L88 12 L92 28 L98 -5 L102 25 L108 -5 L112 28 L118 12 L125 30 L118 42 L82 42 Z" fill="#e91e63" stroke="#880e4f" stroke-width="1" stroke-linejoin="round"/>
    <!-- Тени для объема (правая сторона) -->
    <path d="M100 25 L108 -5 L112 28 L118 12 L125 30 L118 42 L100 42 Z" fill="#ad1457" opacity="0.7"/>
    <!-- Блики (яркие кончики) -->
    <path d="M98 -5 L102 25" stroke="#f06292" stroke-width="2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M108 -5 L102 25" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M88 12 L92 28" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.8"/>
    <path d="M118 12 L112 28" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.8"/>
    <path d="M78 32 Q85 22 92 28" stroke="#f06292" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M122 32 Q115 22 108 28" stroke="#f06292" stroke-width="1" fill="none" opacity="0.7"/>
    <!-- Контур низа -->
    <path d="M82 42 Q100 32 118 42" stroke="#880e4f" stroke-width="2" fill="none"/>
  `
};

// Автоматически добавляем все причёски в основной объект ITEMS_SVG
if (typeof ITEMS_SVG !== 'undefined') {
  Object.assign(ITEMS_SVG, ALL_HAIRS_SVG);
}