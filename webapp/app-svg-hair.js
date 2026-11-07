// app-svg-hair.js
// v1.0 — 5 новых детализированных причёсок. Расширяет ITEMS_SVG из app-svg.js.

const NEW_HAIRS_SVG = {
  // 1. Длинные каштановые волосы (Anime/Realistic)
  hair_long_brown: `
    <path d="M72 48 Q72 16 100 14 Q128 16 128 48 Q128 75 135 130 Q120 130 115 100 Q115 75 118 50 Q118 40 100 38 Q82 40 82 50 Q85 75 85 100 Q80 130 65 130 Q72 75 72 48 Z" fill="#4a2e1b" stroke="#2b180b" stroke-width="0.6"/>
    <path d="M70 50 Q66 80 64 115 Q72 120 78 110 Q74 80 76 55 Z" fill="#3a2010" stroke="#2b180b" stroke-width="0.4"/>
    <path d="M130 50 Q134 80 136 115 Q128 120 122 110 Q126 80 124 55 Z" fill="#3a2010" stroke="#2b180b" stroke-width="0.4"/>
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48" fill="#5c3a22" opacity="0.6"/>
    <path d="M75 35 Q85 25 100 23 Q115 25 125 35" stroke="#7a5230" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M78 42 Q90 38 100 40 Q110 38 122 42" stroke="#7a5230" stroke-width="1" fill="none" opacity="0.4" stroke-linecap="round"/>
    <path d="M74 60 Q68 90 66 120" stroke="#2b180b" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M126 60 Q132 90 134 120" stroke="#2b180b" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M82 80 Q78 110 80 125" stroke="#3a2010" stroke-width="0.6" fill="none" opacity="0.5"/>
    <path d="M118 80 Q122 110 120 125" stroke="#3a2010" stroke-width="0.6" fill="none" opacity="0.5"/>
  `,

  // 2. Гоп-стрижка (Короткая, небрежная, выбритые виски)
  hair_gopnik: `
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="0.4"/>
    <path d="M72 48 Q72 35 80 30 L72 52 Z" fill="#111111"/>
    <path d="M128 48 Q128 35 120 30 L128 52 Z" fill="#111111"/>
    <path d="M76 30 Q85 24 95 25 Q100 22 105 25 Q115 24 124 30 L122 45 Q110 36 100 38 Q90 36 78 45 Z" fill="#2a2a2a" opacity="0.9"/>
    <path d="M74 40 Q80 32 90 32 M126 40 Q120 32 110 32" stroke="#333" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M78 28 L82 35 M86 24 L88 32 M94 22 L95 30 M106 22 L105 30 M114 24 L112 32 M122 28 L118 35" stroke="#111" stroke-width="1.2" fill="none" opacity="0.8" stroke-linecap="round"/>
    <path d="M82 42 Q90 38 100 40 Q110 38 118 42" stroke="#0a0a0a" stroke-width="0.8" fill="none" opacity="0.5"/>
    <path d="M78 45 Q85 40 100 42 Q115 40 122 45" stroke="#333" stroke-width="0.5" fill="none" opacity="0.4"/>
  `,

  // 3. Зачес назад (Mafia / Офисный стиль)
  hair_slick_back: `
    <path d="M72 50 Q72 14 100 12 Q128 14 128 50 Q126 38 100 36 Q74 38 72 50 Z" fill="#1c1814" stroke="#0a0806" stroke-width="0.5"/>
    <path d="M72 48 Q72 22 100 18 Q128 22 128 48 Q124 42 100 40 Q76 42 72 48 Z" fill="#2b241d"/>
    <path d="M74 40 Q85 30 100 28 Q115 30 126 40" stroke="#4a3d30" stroke-width="1.5" fill="none" opacity="0.7" stroke-linecap="round"/>
    <path d="M76 44 Q88 36 100 34 Q112 36 124 44" stroke="#4a3d30" stroke-width="1" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M78 48 Q90 42 100 40 Q110 42 122 48" stroke="#4a3d30" stroke-width="0.8" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M80 28 Q90 22 100 22 Q110 22 120 28" stroke="#6b5a4a" stroke-width="1.2" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M72 50 L68 60 Q72 55 74 52 Z" fill="#1c1814"/>
    <path d="M128 50 L132 60 Q128 55 126 52 Z" fill="#1c1814"/>
  `,

  // 4. Блонд с ободком (K-pop / Аниме стиль)
  hair_blonde_headband: `
    <path d="M70 50 Q70 12 100 10 Q130 12 130 50 Q132 80 138 140 Q125 145 120 110 Q118 80 120 50 Q120 38 100 36 Q80 38 80 50 Q82 80 80 110 Q75 145 62 140 Q68 80 70 50 Z" fill="#f9e079" stroke="#d4ac0d" stroke-width="0.6"/>
    <path d="M68 52 Q64 80 62 120 Q70 125 76 115 Q72 80 74 55 Z" fill="#e6c85c" stroke="#d4ac0d" stroke-width="0.4"/>
    <path d="M132 52 Q136 80 138 120 Q130 125 124 115 Q128 80 126 55 Z" fill="#e6c85c" stroke="#d4ac0d" stroke-width="0.4"/>
    <path d="M70 50 Q70 16 100 14 Q130 16 130 50" fill="#ffeaa7" opacity="0.5"/>
    <path d="M74 30 Q85 20 100 18 Q115 20 126 30" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M78 40 Q90 32 100 34 Q110 32 122 40" stroke="#fff" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
    <!-- Ободок -->
    <path d="M72 42 Q100 32 128 42 L128 46 Q100 36 72 46 Z" fill="#00bcd4" stroke="#00838f" stroke-width="0.5"/>
    <path d="M72 44 Q100 34 128 44" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M73 45 Q100 35 127 45" stroke="#00838f" stroke-width="0.4" fill="none" opacity="0.6"/>
    <path d="M75 60 Q70 90 68 125" stroke="#d4ac0d" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M125 60 Q130 90 132 125" stroke="#d4ac0d" stroke-width="0.8" fill="none" opacity="0.6"/>
  `,

  // 5. Панк-ирокез (Розовый/Красный, рваный)
  hair_punk_pink: `
    <path d="M85 25 Q80 10 100 0 Q120 10 115 25 Z" fill="#e91e63" stroke="#ad1457" stroke-width="0.6"/>
    <path d="M80 30 Q75 18 90 8 Q100 -5 110 8 Q125 18 120 30 Z" fill="#f06292" opacity="0.7"/>
    <path d="M72 48 Q72 20 100 18 Q128 20 128 48 Q126 36 100 34 Q74 36 72 48 Z" fill="#880e4f"/>
    <path d="M72 48 Q72 35 80 30 L72 52 Z" fill="#880e4f"/>
    <path d="M128 48 Q128 35 120 30 L128 52 Z" fill="#880e4f"/>
    <path d="M75 40 L85 20 L90 35 L95 10 L100 30 L105 10 L110 35 L115 20 L125 40" stroke="#e91e63" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M78 30 Q85 15 95 12 M122 30 Q115 15 105 12" stroke="#f06292" stroke-width="1.2" fill="none" opacity="0.8"/>
    <path d="M82 42 Q90 38 100 40 Q110 38 118 42" stroke="#4a0024" stroke-width="0.8" fill="none" opacity="0.6"/>
  `
};

// Автоматически добавляем новые причёски в основной объект ITEMS_SVG
if (typeof ITEMS_SVG !== 'undefined') {
  Object.assign(ITEMS_SVG, NEW_HAIRS_SVG);
}