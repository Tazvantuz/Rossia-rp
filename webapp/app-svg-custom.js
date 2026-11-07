// app-svg-custom.js
// Кастомные SVG-объекты и картинки-оверлеи.
// app-svg.js НЕ ТРОГАЕМ — только дополняем через Object.assign.
// Все новые одежды/тянки/картинки добавляй сюда.

Object.assign(CUSTOM_IMAGES, {
  // Босс «Опасный Поцык» — картинка в правую руку (как тянки)
  "rh_pocyk": { url: "/assets/pocyk.png", side: "right", y: 50, w: 200, h: 320 },

  // ── Сюда добавляй новые картинки-оверлеи по образцу:
  // "lh_newgirl": { url: "/assets/hands/lh_newgirl.png", side: "left", y: 0, w: 230, h: 400 },
});

Object.assign(ITEMS_SVG, {
  // Заглушка: rh_pocyk рисуется через CUSTOM_IMAGES (foreignObject),
  // в ITEMS_SVG его быть не должно, иначе он перекроет картинку.
  rh_pocyk: null,

  // ── Сюда добавляй новые SVG-шмотки по образцу:
  // h_newhat: `<path ... />`,
});