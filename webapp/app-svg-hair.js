// app-svg-hair.js
// v2.0 — Полностью переработанные 10 причёсок с высокой детализацией, слоями, тенями и бликами.

const ALL_HAIRS_SVG = {
  // 1. Короткая черная (Стильный полубокс)
  hair_short_black: `
    <!-- Базовая шапка волос -->
    <path d="M72 48 Q72 18 100 16 Q128 18 128 48 Q126 38 100 36 Q74 38 72 48 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.5"/>
    <!-- Выбритые виски (переход) -->
    <path d="M72 48 Q72 35 78 30 L72 55 Z" fill="#2a2a2a" opacity="0.8"/>
    <path d="M128 48 Q128 35 122 30 L128 55 Z" fill="#2a2a2a" opacity="0.8"/>
    <!-- Текстура верхней части (пряди) -->
    <path d="M78 32 Q85 25 95 26 Q100 24 105 26 Q115 25 122 32 L120 42 Q110 34 100 36 Q90 34 80 42 Z" fill="#252525" opacity="0.6"/>
    <path d="M80 28 L84 34 M88 24 L90 32 M96 22 L97 30 M104 22 L103 30 M112 24 L110 32 M120 28 L116 34" stroke="#0a0a0a" stroke-width="1.2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M76 40 Q85 32 100 34 Q115 32 124 40" stroke="#333" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M74 46 Q85 38 100 40 Q115 38 126 46" stroke="#111" stroke-width="0.6" fill="none" opacity="0.6"/>
    <!-- Блик -->
    <path d="M85 26 Q95 22 105 24" stroke="#4a4a4a" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round"/>
  `,

  // 2. Кудри каштановые (Объемные, реалистичные завитки)
  hair_curly_brown: `
    <!-- Базовый слой -->
    <path d="M70 50 Q68 18 100 14 Q132 18 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.5"/>
    <!-- Задний план волос -->
    <path d="M70 50 Q66 65 68 75 Q75 70 76 58 Z" fill="#3a2010"/>
    <path d="M130 50 Q134 65 132 75 Q125 70 124 58 Z" fill="#3a2010"/>
    <!-- Крупные локоны -->
    <circle cx="74" cy="38" r="7" fill="#5c3a22" stroke="#3a2010" stroke-width="0.5"/>
    <circle cx="82" cy="28" r="8" fill="#5c3a22" stroke="#3a2010" stroke-width="0.5"/>
    <circle cx="94" cy="23" r="8" fill="#5c3a22" stroke="#3a2010" stroke-width="0.5"/>
    <circle cx="106" cy="23" r="8" fill="#5c3a22" stroke="#3a2010" stroke-width="0.5"/>
    <circle cx="118" cy="28" r="8" fill="#5c3a22" stroke="#3a2010" stroke-width="0.5"/>
    <circle cx="126" cy="38" r="7" fill="#5c3a22" stroke="#3a2010" stroke-width="0.5"/>
    <!-- Мелкие локоны (детализация) -->
    <circle cx="78" cy="42" r="5" fill="#6b4a2a" stroke="#3a2010" stroke-width="0.4"/>
    <circle cx="90" cy="30" r="5" fill="#6b4a2a" stroke="#3a2010" stroke-width="0.4"/>
    <circle cx="100" cy="26" r="5" fill="#6b4a2a" stroke="#3a2010" stroke-width="0.4"/>
    <circle cx="110" cy="30" r="5" fill="#6b4a2a" stroke="#3a2010" stroke-width="0.4"/>
    <circle cx="122" cy="42" r="5" fill="#6b4a2a" stroke="#3a2010" stroke-width="0.4"/>
    <!-- Блики на кудрях -->
    <path d="M78 34 Q82 30 86 34" stroke="#7a5a3a" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M90 20 Q94 18 98 20" stroke="#7a5a3a" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M102 20 Q106 18 110 20" stroke="#7a5a3a" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M114 30 Q118 28 122 32" stroke="#7a5a3a" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <!-- Тени в глубине -->
    <path d="M76 44 Q90 36 100 36 Q110 36 124 44" stroke="#2b180b" stroke-width="1.5" fill="none" opacity="0.5"/>
  `,

  // 3. Длинные рыжие (Плавные волны, обрамление лица)
  hair_long_red: `
    <!-- Задний слой (длинные пряди за спиной) -->
    <path d="M70 50 Q60 90 62 140 Q70 145 78 140 Q74 90 76 55 Z" fill="#a93226" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q140 90 138 140 Q130 145 122 140 Q126 90 124 55 Z" fill="#a93226" stroke="#8b0000" stroke-width="0.4"/>
    <!-- Базовый верх -->
    <path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    <!-- Пряди спереди (обрамление) -->
    <path d="M70 50 Q66 70 64 100 Q72 105 74 95 Q74 70 76 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q134 70 136 100 Q128 105 126 95 Q126 70 124 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <!-- Текстура и волны -->
    <path d="M72 60 Q68 100 70 130 M128 60 Q132 100 130 130" stroke="#8b0000" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M66 80 Q64 110 66 130 M134 80 Q136 110 134 130" stroke="#8b0000" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M74 55 Q72 80 72 110" stroke="#e74c3c" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M126 55 Q128 80 128 110" stroke="#e74c3c" stroke-width="0.6" fill="none" opacity="0.5"/>
    <!-- Блики -->
    <path d="M78 30 Q86 24 94 28 M122 30 Q114 24 106 28" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M76 45 Q85 38 100 38 Q115 38 124 45" stroke="#e74c3c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M74 85 Q72 105 74 125" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M126 85 Q128 105 126 125" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.4"/>
  `,

  // 4. Ирокез синий (Агрессивные шипы, выбритые виски)
  hair_mohawk_blue: `
    <!-- Выбритые виски (короткий ежик) -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.4"/>
    <path d="M72 48 Q72 35 78 30 L72 55 Z" fill="#111"/>
    <path d="M128 48 Q128 35 122 30 L128 55 Z" fill="#111"/>
    <!-- Основа ирокеза -->
    <path d="M82 30 Q80 15 100 5 Q120 15 118 30 Z" fill="#2874a6"/>
    <!-- Шипы (снизу вверх) -->
    <path d="M82 30 L75 20 L85 25 L80 10 L90 22 L95 0 L100 20 L105 0 L110 22 L120 10 L115 25 L125 20 L118 30 Z" fill="#3498db" stroke="#1a5276" stroke-width="0.8" stroke-linejoin="round"/>
    <!-- Внутренние тени шипов -->
    <path d="M85 25 L80 10 L90 22 L95 0 L100 20" stroke="#1a5276" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M115 25 L120 10 L110 22 L105 0 L100 20" stroke="#1a5276" stroke-width="1.5" fill="none" opacity="0.6"/>
    <!-- Блики на шипах -->
    <path d="M95 0 L100 20" stroke="#5dade2" stroke-width="1" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M105 0 L100 20" stroke="#5dade2" stroke-width="1" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M80 10 L90 22" stroke="#5dade2" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M120 10 L110 22" stroke="#5dade2" stroke-width="0.8" fill="none" opacity="0.6"/>
    <!-- Контур основания -->
    <path d="M82 30 Q100 20 118 30" stroke="#1a5276" stroke-width="1.5" fill="none"/>
  `,

  // 5. Золотые локоны (Роскошные, гладкие, струящиеся)
  hair_flowing_gold: `
    <!-- Задний фон (объем) -->
    <path d="M68 52 Q58 100 60 155 Q60 175 68 180 Q76 175 72 155 Q72 100 76 58 Z" fill="#d4ac0d" stroke="#b8860b" stroke-width="0.4"/>
    <path d="M132 52 Q142 100 140 155 Q140 175 132 180 Q124 175 128 155 Q128 100 124 58 Z" fill="#d4ac0d" stroke="#b8860b" stroke-width="0.4"/>
    <!-- Основная масса -->
    <path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <!-- Передние пряди (волны) -->
    <path d="M68 52 Q62 80 64 120 Q72 125 76 115 Q74 80 76 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M132 52 Q138 80 136 120 Q128 125 124 115 Q126 80 124 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <!-- Линии прядей (текстура) -->
    <path d="M72 70 Q65 110 66 150 M128 70 Q135 110 134 150" stroke="#b8860b" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M70 80 Q66 120 68 160 M130 80 Q134 120 132 160" stroke="#b8860b" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M76 60 Q74 90 76 130 M124 60 Q126 90 124 130" stroke="#d4ac0d" stroke-width="0.8" fill="none" opacity="0.5"/>
    <!-- Блики (эффект шелковистости) -->
    <path d="M76 30 Q86 24 96 28 M124 30 Q114 24 104 28" stroke="#f9e079" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <ellipse cx="80" cy="40" rx="5" ry="3" fill="#f9e079" opacity="0.6"/>
    <ellipse cx="120" cy="40" rx="5" ry="3" fill="#f9e079" opacity="0.6"/>
    <path d="M72 90 Q70 120 72 150" stroke="#f9e079" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M128 90 Q130 120 128 150" stroke="#f9e079" stroke-width="1" fill="none" opacity="0.5"/>
  `,

  // 6. Длинные каштановые (Элегантные, глубокие тени)
  hair_long_brown: `
    <!-- Задний план -->
    <path d="M72 48 Q72 16 100 14 Q128 16 128 48 Q128 75 135 130 Q120 130 115 100 Q115 75 118 50 Q118 40 100 38 Q82 40 82 50 Q85 75 85 100 Q80 130 65 130 Q72 75 72 48 Z" fill="#3a2010" stroke="#2b180b" stroke-width="0.5"/>
    <!-- Боковые пряди -->
    <path d="M70 50 Q66 80 64 115 Q72 120 78 110 Q74 80 76 55 Z" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <path d="M130 50 Q134 80 136 115 Q128 120 122 110 Q126 80 124 55 Z" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.4"/>
    <!-- Основной верх -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48" fill="#5c3a22"/>
    <!-- Текстура (пряди) -->
    <path d="M75 35 Q85 25 100 23 Q115 25 125 35" stroke="#7a5230" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M78 42 Q90 38 100 40 Q110 38 122 42" stroke="#7a5230" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M74 60 Q68 90 66 120" stroke="#2b180b" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M126 60 Q132 90 134 120" stroke="#2b180b" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M82 80 Q78 110 80 125" stroke="#3a2010" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M118 80 Q122 110 120 125" stroke="#3a2010" stroke-width="0.8" fill="none" opacity="0.5"/>
    <!-- Блики -->
    <path d="M80 30 Q90 24 100 26" stroke="#7a5230" stroke-width="1.2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M120 30 Q110 24 100 26" stroke="#7a5230" stroke-width="1.2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M72 70 Q70 100 72 120" stroke="#7a5230" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M128 70 Q130 100 128 120" stroke="#7a5230" stroke-width="0.8" fill="none" opacity="0.4"/>
  `,

  // 7. Гоп-стрижка (Полубокс, небрежная текстура)
  hair_gopnik: `
    <!-- База -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.4"/>
    <!-- Выбритые виски -->
    <path d="M72 48 Q72 35 80 30 L72 52 Z" fill="#111"/>
    <path d="M128 48 Q128 35 120 30 L128 52 Z" fill="#111"/>
    <!-- Верхний слой (рваные пряди) -->
    <path d="M76 30 Q85 24 95 25 Q100 22 105 25 Q115 24 124 30 L122 45 Q110 36 100 38 Q90 36 78 45 Z" fill="#2a2a2a" opacity="0.9"/>
    <!-- Текстура (торчащие волоски) -->
    <path d="M78 28 L82 35 M86 24 L88 32 M94 22 L95 30 M106 22 L105 30 M114 24 L112 32 M122 28 L118 35" stroke="#111" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M82 42 Q90 38 100 40 Q110 38 118 42" stroke="#0a0a0a" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M78 45 Q85 40 100 42 Q115 40 122 45" stroke="#333" stroke-width="0.8" fill="none" opacity="0.5"/>
    <!-- Блик -->
    <path d="M85 26 Q95 23 105 26" stroke="#444" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
  `,

  // 8. Зачес назад (Мафия, офисный стиль, блеск)
  hair_slick_back: `
    <!-- Основа -->
    <path d="M72 50 Q72 14 100 12 Q128 14 128 50 Q126 38 100 36 Q74 38 72 50 Z" fill="#1c1814" stroke="#0a0806" stroke-width="0.5"/>
    <path d="M72 48 Q72 22 100 18 Q128 22 128 48 Q124 42 100 40 Q76 42 72 48 Z" fill="#2b241d"/>
    <!-- Боковые залысины -->
    <path d="M72 50 L68 60 Q72 55 74 52 Z" fill="#1c1814"/>
    <path d="M128 50 L132 60 Q128 55 126 52 Z" fill="#1c1814"/>
    <!-- Линии расчески (текстура зачеса) -->
    <path d="M74 40 Q85 30 100 28 Q115 30 126 40" stroke="#4a3d30" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M76 44 Q88 36 100 34 Q112 36 124 44" stroke="#4a3d30" stroke-width="1.2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M78 48 Q90 42 100 40 Q110 42 122 48" stroke="#4a3d30" stroke-width="1" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M80 52 Q90 46 100 44 Q110 46 120 52" stroke="#4a3d30" stroke-width="0.8" fill="none" opacity="0.5" stroke-linecap="round"/>
    <!-- Блеск (гель для волос) -->
    <path d="M80 28 Q90 22 100 22 Q110 22 120 28" stroke="#6b5a4a" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    <ellipse cx="85" cy="32" rx="4" ry="2" fill="#6b5a4a" opacity="0.5" transform="rotate(-15 85 32)"/>
    <ellipse cx="115" cy="32" rx="4" ry="2" fill="#6b5a4a" opacity="0.5" transform="rotate(15 115 32)"/>
  `,

  // 9. Блонд с ободком (K-pop / Аниме, мягкие волны)
  hair_blonde_headband: `
    <!-- Задний план -->
    <path d="M70 50 Q70 12 100 10 Q130 12 130 50 Q132 80 138 140 Q125 145 120 110 Q118 80 120 50 Q120 38 100 36 Q80 38 80 50 Q82 80 80 110 Q75 145 62 140 Q68 80 70 50 Z" fill="#e6c85c" stroke="#d4ac0d" stroke-width="0.5"/>
    <path d="M68 52 Q64 80 62 120 Q70 125 76 115 Q72 80 74 55 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.4"/>
    <path d="M132 52 Q136 80 138 120 Q130 125 124 115 Q128 80 126 55 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.4"/>
    <!-- Основная масса -->
    <path d="M70 50 Q70 16 100 14 Q130 16 130 50" fill="#ffeaa7"/>
    <!-- Текстура и волны -->
    <path d="M74 30 Q85 20 100 18 Q115 20 126 30" stroke="#fff" stroke-width="1.8" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M78 40 Q90 32 100 34 Q110 32 122 40" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M75 60 Q70 90 68 125" stroke="#d4ac0d" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M125 60 Q130 90 132 125" stroke="#d4ac0d" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M72 70 Q68 100 70 120" stroke="#e6c85c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M128 70 Q132 100 130 120" stroke="#e6c85c" stroke-width="0.8" fill="none" opacity="0.5"/>
    <!-- Ободок -->
    <path d="M72 42 Q100 32 128 42 L128 46 Q100 36 72 46 Z" fill="#00bcd4" stroke="#00838f" stroke-width="0.6"/>
    <path d="M72 44 Q100 34 128 44" stroke="#fff" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M73 45 Q100 35 127 45" stroke="#00838f" stroke-width="0.5" fill="none" opacity="0.7"/>
    <!-- Блик на волосах -->
    <path d="M82 24 Q92 20 102 22" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M118 24 Q108 20 98 22" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
  `,

  // 10. Розовый панк (Ирокез, рваный, яркий)
  hair_punk_pink: `
    <!-- Выбритые виски -->
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#4a0024"/>
    <path d="M72 48 Q72 35 80 30 L72 52 Z" fill="#3a001a"/>
    <path d="M128 48 Q128 35 120 30 L128 52 Z" fill="#3a001a"/>
    <!-- Основа ирокеза -->
    <path d="M85 25 Q80 10 100 0 Q120 10 115 25 Z" fill="#ad1457"/>
    <!-- Рваные пряди (шипы) -->
    <path d="M75 30 L85 15 L90 28 L95 5 L100 25 L105 5 L110 28 L115 15 L125 30 L118 40 L82 40 Z" fill="#e91e63" stroke="#880e4f" stroke-width="0.8" stroke-linejoin="round"/>
    <!-- Внутренние тени -->
    <path d="M85 15 L90 28 L95 5 L100 25" stroke="#880e4f" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M115 15 L110 28 L105 5 L100 25" stroke="#880e4f" stroke-width="1.5" fill="none" opacity="0.6"/>
    <!-- Блики (яркий розовый) -->
    <path d="M95 5 L100 25" stroke="#f06292" stroke-width="1.2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M105 5 L100 25" stroke="#f06292" stroke-width="1.2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M85 15 L90 28" stroke="#f06292" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M115 15 L110 28" stroke="#f06292" stroke-width="1" fill="none" opacity="0.7"/>
    <path d="M78 32 Q85 22 92 28" stroke="#f06292" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M122 32 Q115 22 108 28" stroke="#f06292" stroke-width="0.8" fill="none" opacity="0.6"/>
    <!-- Контур низа -->
    <path d="M82 40 Q100 30 118 40" stroke="#880e4f" stroke-width="1.5" fill="none"/>
  `
};

// Автоматически добавляем все причёски в основной объект ITEMS_SVG
if (typeof ITEMS_SVG !== 'undefined') {
  Object.assign(ITEMS_SVG, ALL_HAIRS_SVG);
}