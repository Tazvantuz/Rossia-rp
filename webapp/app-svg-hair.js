// app-svg-hair.js
// v4.2 — Убраны задние слои у коротких причесок, которые перекрывали лицо. Лицо полностью открыто.

const ALL_HAIRS_SVG = {
  // 1. Короткая черная (Чистый полубокс, линия волос на лбу поднята)
  hair_short_black: `
    <!-- Основная шапка волос (сидит строго на макушке) -->
    <path d="M72 45 Q72 10 100 10 Q128 10 128 45 Q120 32 100 32 Q80 32 72 45 Z" fill="#1c1c1c" stroke="#0a0a0a" stroke-width="0.5"/>
    
    <!-- Выбритые виски (переход) -->
    <path d="M72 45 Q72 32 76 26 L70 50 Z" fill="#1a1a1a"/>
    <path d="M128 45 Q128 32 124 26 L130 50 Z" fill="#1a1a1a"/>
    <path d="M72 40 Q74 32 76 30" stroke="#111" stroke-width="1" fill="none" stroke-dasharray="1.5,1.5" opacity="0.6"/>
    <path d="M128 40 Q126 32 124 30" stroke="#111" stroke-width="1" fill="none" stroke-dasharray="1.5,1.5" opacity="0.6"/>

    <!-- Верхний слой текстуры -->
    <path d="M78 30 Q85 20 95 22 Q100 19 105 22 Q115 20 122 30 L120 40 Q110 30 100 32 Q90 30 80 40 Z" fill="#2a2a2a" opacity="0.8"/>
    
    <!-- Пряди (волоски) -->
    <path d="M80 26 L84 32 M86 22 L88 30 M92 20 L94 28 M108 20 L106 28 M114 22 L112 30 M120 26 L116 32" stroke="#0a0a0a" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    
    <!-- Блик (объем) -->
    <path d="M82 24 Q92 18 108 20" stroke="#5a5a5a" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>
  `,

  // 2. Кудри каштановые (Локоны собраны на макушке, лицо не перекрывают)
  hair_curly_brown: `
    <!-- Базовая форма под кудри (закрывает макушку) -->
    <path d="M70 45 Q70 15 100 15 Q130 15 130 45 Q120 35 100 35 Q80 35 70 45 Z" fill="#3a2010"/>
    
    <!-- Темные локоны (основа, только сверху) -->
    <circle cx="74" cy="30" r="9" fill="#3a2010"/>
    <circle cx="84" cy="20" r="10" fill="#3a2010"/>
    <circle cx="100" cy="14" r="11" fill="#3a2010"/>
    <circle cx="116" cy="20" r="10" fill="#3a2010"/>
    <circle cx="126" cy="30" r="9" fill="#3a2010"/>
    
    <!-- Средние локоны (объем) -->
    <circle cx="76" cy="34" r="7" fill="#4a2e1b"/>
    <circle cx="88" cy="24" r="8" fill="#4a2e1b"/>
    <circle cx="100" cy="20" r="8" fill="#4a2e1b"/>
    <circle cx="112" cy="24" r="8" fill="#4a2e1b"/>
    <circle cx="124" cy="34" r="7" fill="#4a2e1b"/>
    
    <!-- Передние мелкие локоны (детализация) -->
    <circle cx="82" cy="30" r="6" fill="#5c3a22"/>
    <circle cx="94" cy="22" r="6" fill="#5c3a22"/>
    <circle cx="106" cy="22" r="6" fill="#5c3a22"/>
    <circle cx="118" cy="30" r="6" fill="#5c3a22"/>
    
    <!-- Бакенбарды / переход на виски (аккуратно по бокам) -->
    <path d="M70 45 Q68 55 72 65 Q76 60 74 50 Z" fill="#3a2010"/>
    <path d="M130 45 Q132 55 128 65 Q124 60 126 50 Z" fill="#3a2010"/>

    <!-- Тень под волосами -->
    <path d="M78 40 Q90 32 100 32 Q110 32 122 40" stroke="#1a0e05" stroke-width="2" fill="none" opacity="0.6"/>
    
    <!-- Блики (свет на кудрях) -->
    <path d="M76 24 Q80 20 84 24" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M88 12 Q92 8 96 12" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M104 12 Q108 8 112 12" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M116 24 Q120 20 124 24" stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M94 26 Q96 22 100 26" stroke="#6b4a2a" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M106 26 Q104 22 100 26" stroke="#6b4a2a" stroke-width="1.5" fill="none" opacity="0.6"/>
  `,

  // 3. Длинные рыжие (Волны по бокам, лицо открыто)
  hair_long_red: `
    <!-- Задний фон (сзади за плечами) -->
    <path d="M68 50 Q55 90 58 150 Q68 160 78 150 Q74 90 76 55 Z" fill="#6b0000"/>
    <path d="M132 50 Q145 90 142 150 Q132 160 122 150 Q126 90 124 55 Z" fill="#6b0000"/>

    <!-- Основной верх -->
    <path d="M70 50 Q68 16 100 14 Q132 16 130 50 Q128 40 100 38 Q72 40 70 50 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.5"/>
    
    <!-- Боковые волны -->
    <path d="M70 50 Q62 80 58 120 Q68 125 74 110 Q72 80 76 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    <path d="M130 50 Q138 80 142 120 Q132 125 126 110 Q128 80 124 55 Z" fill="#c0392b" stroke="#8b0000" stroke-width="0.4"/>
    
    <!-- Внутренние пряди -->
    <path d="M74 55 Q70 90 72 130 Q78 140 84 130 Q82 90 80 60 Z" fill="#e74c3c" opacity="0.8"/>
    <path d="M126 55 Q130 90 128 130 Q122 140 116 130 Q118 90 120 60 Z" fill="#e74c3c" opacity="0.8"/>
    
    <!-- Текстура -->
    <path d="M72 60 Q66 100 68 135 M128 60 Q134 100 132 135" stroke="#8b0000" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M64 80 Q60 110 62 140 M136 80 Q140 110 138 140" stroke="#8b0000" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M76 65 Q72 100 74 135 M124 65 Q128 100 126 135" stroke="#e74c3c" stroke-width="1" fill="none" opacity="0.5"/>
    
    <!-- Блики -->
    <path d="M78 30 Q86 22 94 26 M122 30 Q114 22 106 26" stroke="#e74c3c" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M76 45 Q85 36 100 36 Q115 36 124 45" stroke="#e74c3c" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M66 85 Q62 105 64 130" stroke="#f1948a" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M134 85 Q138 105 136 130" stroke="#f1948a" stroke-width="1.5" fill="none" opacity="0.5"/>
  `,

  // 4. Ирокез синий
  hair_mohawk_blue: `
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#111" stroke="#000" stroke-width="0.4"/>
    <path d="M72 48 Q72 32 78 26 L70 52 Z" fill="#1a1a1a"/>
    <path d="M128 48 Q128 32 122 26 L130 52 Z" fill="#1a1a1a"/>
    <path d="M72 42 Q74 34 78 30 M128 42 Q126 34 122 30" stroke="#333" stroke-width="1" fill="none" stroke-dasharray="1.5,1.5" opacity="0.6"/>

    <path d="M78 30 Q72 10 100 -8 Q128 10 122 30 Z" fill="#0d3b5c"/>
    <path d="M78 30 L70 15 L82 22 L75 0 L88 18 L95 -10 L100 15 L105 -10 L112 18 L125 0 L118 22 L130 15 L122 30 Z" fill="#1a5276"/>
    <path d="M80 30 L74 18 L84 24 L78 5 L88 20 L95 -5 L100 18 L105 -5 L112 20 L122 5 L116 24 L126 18 L120 30 Z" fill="#3498db" stroke="#1a5276" stroke-width="1" stroke-linejoin="round"/>
    <path d="M100 18 L105 -5 L112 20 L122 5 L116 24 L126 18 L120 30 L100 30 Z" fill="#2874a6" opacity="0.6"/>
    
    <path d="M95 -5 L100 18" stroke="#5dade2" stroke-width="2" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M78 5 L88 20" stroke="#5dade2" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M105 -5 L100 18" stroke="#85c1e9" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M122 5 L112 20" stroke="#85c1e9" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <path d="M82 25 Q100 12 118 25" stroke="#0a192f" stroke-width="3" fill="none" opacity="0.8"/>
  `,

  // 5. Золотые локоны
  hair_flowing_gold: `
    <path d="M64 52 Q50 100 54 160 Q54 185 68 190 Q82 185 78 160 Q76 100 80 58 Z" fill="#8b6914"/>
    <path d="M136 52 Q150 100 146 160 Q146 185 132 190 Q118 185 122 160 Q124 100 120 58 Z" fill="#8b6914"/>

    <path d="M68 52 Q66 14 100 12 Q134 14 132 52 Q130 40 100 38 Q70 40 68 52 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    
    <path d="M68 52 Q58 85 60 130 Q72 135 78 120 Q74 85 76 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    <path d="M132 52 Q142 85 140 130 Q128 135 122 120 Q126 85 124 58 Z" fill="#f1c40f" stroke="#b8860b" stroke-width="0.5"/>
    
    <path d="M74 58 Q68 100 70 140 Q76 150 82 140 Q80 100 80 65 Z" fill="#f9e079" opacity="0.7"/>
    <path d="M126 58 Q132 100 130 140 Q124 150 118 140 Q120 100 120 65 Z" fill="#f9e079" opacity="0.7"/>

    <path d="M72 70 Q64 110 66 155 M128 70 Q136 110 134 155" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M68 80 Q60 120 62 165 M132 80 Q140 120 138 165" stroke="#b8860b" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M76 60 Q72 90 74 140 M124 60 Q128 90 126 140" stroke="#d4ac0d" stroke-width="1.2" fill="none" opacity="0.5"/>
    
    <path d="M76 30 Q86 22 96 26 M124 30 Q114 22 104 26" stroke="#f9e079" stroke-width="2.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <ellipse cx="80" cy="40" rx="7" ry="3" fill="#f9e079" opacity="0.8"/>
    <ellipse cx="120" cy="40" rx="7" ry="3" fill="#f9e079" opacity="0.8"/>
    <path d="M72 90 Q66 120 70 160" stroke="#f9e079" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M128 90 Q134 120 130 160" stroke="#f9e079" stroke-width="2" fill="none" opacity="0.7"/>
  `,

  // 6. Длинные каштановые
  hair_long_brown: `
    <path d="M72 48 Q72 16 100 14 Q128 16 128 48 Q135 80 140 150 Q120 160 115 120 Q115 75 118 50 Q118 40 100 38 Q82 40 82 50 Q85 75 85 120 Q80 160 60 150 Q65 80 72 48 Z" fill="#1a0e05"/>
    
    <path d="M70 50 Q62 80 64 130 Q74 140 78 120 Q74 80 76 55 Z" fill="#2b180b" stroke="#1a0e05" stroke-width="0.4"/>
    <path d="M130 50 Q138 80 136 130 Q126 140 122 120 Q126 80 124 55 Z" fill="#2b180b" stroke="#1a0e05" stroke-width="0.4"/>
    
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48" fill="#3a2010"/>
    
    <path d="M100 18 L100 38" stroke="#1a0e05" stroke-width="1.5" fill="none" opacity="0.9"/>
    <path d="M75 35 Q85 25 100 23" stroke="#4a2e1b" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M125 35 Q115 25 100 23" stroke="#4a2e1b" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    
    <path d="M74 60 Q66 90 68 135" stroke="#1a0e05" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M126 60 Q134 90 132 135" stroke="#1a0e05" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M82 80 Q76 110 80 140" stroke="#2b180b" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M118 80 Q124 110 120 140" stroke="#2b180b" stroke-width="1.2" fill="none" opacity="0.6"/>
    
    <path d="M82 30 Q92 22 100 24" stroke="#5c3a22" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M118 30 Q108 22 100 24" stroke="#5c3a22" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M72 70 Q66 100 70 130" stroke="#5c3a22" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M128 70 Q134 100 130 130" stroke="#5c3a22" stroke-width="1.5" fill="none" opacity="0.5"/>
  `,

  // 7. Гоп-стрижка
  hair_gopnik: `
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#111" stroke="#000" stroke-width="0.4"/>
    
    <path d="M72 48 Q72 32 80 26 L70 52 Z" fill="#1a1a1a"/>
    <path d="M128 48 Q128 32 120 26 L130 52 Z" fill="#1a1a1a"/>
    
    <path d="M76 30 Q85 24 95 25 Q100 22 105 25 Q115 24 124 30 L122 45 Q110 36 100 38 Q90 36 78 45 Z" fill="#2a2a2a" opacity="0.9"/>
    
    <!-- Челка -->
    <path d="M80 38 Q90 40 95 44 Q85 46 75 40 Z" fill="#1c1c1c"/>
    <path d="M120 38 Q110 40 105 44 Q115 46 125 40 Z" fill="#1c1c1c"/>
    <path d="M85 42 L88 46 M95 43 L95 47 M105 43 L105 47 M115 42 L112 46" stroke="#111" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <path d="M78 28 L82 35 M86 24 L88 32 M94 22 L95 30 M106 22 L105 30 M114 24 L112 32 M122 28 L118 35" stroke="#0a0a0a" stroke-width="1.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M82 42 Q90 38 100 40 Q110 38 118 42" stroke="#0a0a0a" stroke-width="1.2" fill="none" opacity="0.7"/>
    
    <path d="M85 26 Q95 23 105 26" stroke="#444" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
  `,

  // 8. Зачес назад
  hair_slick_back: `
    <path d="M72 48 Q72 12 100 10 Q128 12 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#1c1814" stroke="#0a0806" stroke-width="0.5"/>
    <path d="M72 46 Q72 18 100 14 Q128 18 128 46 Q124 38 100 36 Q76 38 72 46 Z" fill="#2b241d"/>
    
    <path d="M74 36 Q85 26 100 24 Q115 26 126 36" stroke="#4a3d30" stroke-width="2.5" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M76 40 Q88 32 100 30 Q112 32 124 40" stroke="#4a3d30" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M78 44 Q90 38 100 36 Q110 38 122 44" stroke="#4a3d30" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M80 48 Q90 42 100 40 Q110 42 120 48" stroke="#4a3d30" stroke-width="1.2" fill="none" opacity="0.5" stroke-linecap="round"/>
    
    <path d="M78 22 Q90 14 110 18" stroke="#8a7a6a" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M82 20 Q92 16 102 18" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <ellipse cx="85" cy="28" rx="6" ry="2.5" fill="#fff" opacity="0.7" transform="rotate(-15 85 28)"/>
    <ellipse cx="115" cy="28" rx="6" ry="2.5" fill="#fff" opacity="0.7" transform="rotate(15 115 28)"/>
  `,

  // 9. Блонд с ободком
  hair_blonde_headband: `
    <path d="M66 50 Q66 12 100 10 Q134 12 134 50 Q138 85 145 150 Q125 155 120 110 Q118 80 120 50 Q120 38 100 36 Q80 38 80 50 Q82 80 80 110 Q75 155 55 150 Q62 85 66 50 Z" fill="#b8860b"/>
    
    <path d="M64 52 Q58 85 56 130 Q68 135 74 120 Q70 85 72 55 Z" fill="#d4ac0d"/>
    <path d="M136 52 Q142 85 144 130 Q132 135 126 120 Q130 85 128 55 Z" fill="#d4ac0d"/>
    
    <path d="M70 50 Q70 16 100 14 Q130 16 130 50" fill="#f9e079"/>
    
    <path d="M74 30 Q85 18 100 16 Q115 18 126 30" stroke="#fff" stroke-width="3" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M78 40 Q90 30 100 32 Q110 30 122 40" stroke="#fff" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M72 60 Q66 90 68 135" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M128 60 Q134 90 132 135" stroke="#b8860b" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M68 75 Q64 105 66 140" stroke="#d4ac0d" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M132 75 Q136 105 134 140" stroke="#d4ac0d" stroke-width="1.2" fill="none" opacity="0.5"/>
    
    <path d="M72 36 Q100 24 128 36 L128 42 Q100 30 72 42 Z" fill="#00bcd4" stroke="#00838f" stroke-width="1"/>
    <path d="M72 38 Q100 26 128 38" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.9"/>
    <path d="M73 40 Q100 28 127 40" stroke="#00838f" stroke-width="0.5" fill="none" opacity="0.8"/>
    
    <path d="M78 42 Q74 50 78 62 Q84 52 84 42 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.5"/>
    <path d="M122 42 Q126 50 122 62 Q116 52 116 42 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.5"/>
    
    <path d="M82 22 Q92 16 102 18" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M118 22 Q108 16 98 18" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.9" stroke-linecap="round"/>
    <path d="M66 85 Q62 110 64 135" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M134 85 Q138 110 136 135" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6"/>
  `,

  // 10. Розовый панк
  hair_punk_pink: `
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#3a001a"/>
    <path d="M72 48 Q72 32 80 26 L70 52 Z" fill="#2a0010"/>
    <path d="M128 48 Q128 32 120 26 L130 52 Z" fill="#2a0010"/>
    <path d="M74 40 L78 34 M76 46 L82 38 M122 34 L126 40 M118 38 L124 46" stroke="#880e4f" stroke-width="1.5" fill="none" opacity="0.6"/>
    
    <path d="M82 25 Q72 0 100 -15 Q128 0 118 25 Z" fill="#4a0024"/>
    
    <path d="M75 30 L85 10 L90 25 L98 -15 L102 20 L110 -15 L115 25 L120 10 L125 30 L115 42 L85 42 Z" fill="#ad1457"/>
    
    <path d="M78 30 L84 15 L88 28 L95 -5 L100 22 L105 -5 L112 28 L116 15 L122 30 L116 42 L84 42 Z" fill="#e91e63" stroke="#880e4f" stroke-width="1.5" stroke-linejoin="round"/>
    
    <path d="M100 22 L105 -5 L112 28 L116 15 L122 30 L116 42 L100 42 Z" fill="#c2185b" opacity="0.7"/>
    
    <path d="M95 -5 L100 22" stroke="#f06292" stroke-width="2.5" fill="none" opacity="1" stroke-linecap="round"/>
    <path d="M105 -5 L100 22" stroke="#f06292" stroke-width="2" fill="none" opacity="0.8"/>
    <path d="M84 15 L88 28" stroke="#f06292" stroke-width="2" fill="none" opacity="0.9"/>
    <path d="M116 15 L112 28" stroke="#f06292" stroke-width="2" fill="none" opacity="0.9"/>
    <path d="M78 30 Q85 20 92 28" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M122 30 Q115 20 108 28" stroke="#f06292" stroke-width="1.5" fill="none" opacity="0.7"/>
    
    <path d="M84 42 Q100 32 116 42" stroke="#880e4f" stroke-width="2.5" fill="none"/>
  `
};

if (typeof ITEMS_SVG !== 'undefined') {
  Object.assign(ITEMS_SVG, ALL_HAIRS_SVG);
}