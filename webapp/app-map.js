// app-map.js
// Интерактивная карта: города / улицы / дома / игроки / перемещение с задержкой.
// Соглашение: inside_house_id === -1 значит "на улице"; >= 0 значит "внутри дома".

let mapState = {
  loaded: false,
  data: null,
  selectedCity: 0,
  view: 'city',
  streetId: null,
  movingTimer: null,
  movingData: null,
  forceStreet: false,
};

// Кэш позиций игроков на текущей улице (чтобы не «прыгали» при каждом рендере)
let _streetPlayerPositions = {};
let _streetPlayerPositionsKey = '';

// Guard от многократного нажатия «Войти»
let _enteringHouse = false;

// Вспомогательная функция: считаем игрока "на улице"
function _isOnStreet(insideId) {
  return typeof insideId === 'number' && insideId < 0;
}

// ─── утилиты ───
function _mapEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _fmtTimeLeft(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

function _cityById(cid) {
  if (!mapState.data) return null;
  return mapState.data.cities.find(c => c.id === cid) || null;
}

function _streetById(cid, sid) {
  const c = _cityById(cid);
  if (!c) return null;
  return c.streets.find(s => s.id === sid) || null;
}

function _housesOnStreet(cid, sid) {
  if (!mapState.data || !mapState.data.street) return [];
  if (mapState.data.street.city_id === cid && mapState.data.street.street_id === sid) {
    return mapState.data.street.houses;
  }
  return [];
}

async function openMapTab() {
  mapState.forceStreet = true;
  await loadMap();
}

async function loadMap() {
  try {
    const d = await api("map/get");
    mapState.data = d;
    mapState.loaded = true;

    if (mapState.forceStreet) {
      mapState.view = 'street';
      mapState.selectedCity = d.current.city_id;
      mapState.streetId = d.current.street_id;
      mapState.forceStreet = false;
    } else if (mapState.view === 'street' && mapState.streetId === null) {
      mapState.selectedCity = d.current.city_id;
      mapState.streetId = d.current.street_id;
    }

    // ── ДЕБАГ: логируем, что пришло про дом ──
    if (d.house_inside) {
      api("debug_log", {
        text: `CLIENT map/get: house_inside=YES name=${d.house_inside.house?.name} inside_id=${d.current.inside_house_id}`
      }).catch(() => {});
    } else if (typeof d.current.inside_house_id === 'number' && d.current.inside_house_id >= 0) {
      api("debug_log", {
        text: `CLIENT map/get: inside_id=${d.current.inside_house_id} BUT house_inside=null`
      }).catch(() => {});
    }

    if (d.moving) {
      startMovingScreen(d.moving);
    } else {
      stopMovingTimer();
      mapState.movingData = null;
      if (mapState.view === 'street' &&
          (d.street.city_id !== mapState.selectedCity || mapState.streetId === null)) {
        mapState.view = 'city';
      }
      renderMapScreen();
    }
  } catch (e) {
    toast("Карта: " + e.message, "error");
  }
}

async function mapMoveTo(toCity, toStreet) {
  try {
    const res = await api("map/move", { to_city: toCity, to_street: toStreet });
    toast(`🚶 В путь! ${res.duration} сек`, "success");
    _streetPlayerPositions = {};
    _streetPlayerPositionsKey = '';

    const d = await api("map/get");
    mapState.data = d;
    if (d.moving) startMovingScreen(d.moving);
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch (e) { toast(e.message, "error"); }
}

async function mapRentHouse(houseId) {
  try {
    const d = await api("house/rent", { house_id: houseId });
    if (d.player) { state.player = d.player; renderPlayer(); }
    toast(`🏠 Арендовано: ${d.house_name} на 48ч!`, "success");

    await api("house/enter", { house_id: houseId });
    closeModal();
    await loadMap();

    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch (e) { toast(e.message, "error"); }
}

async function mapCancelRent(houseId) {
  if (!confirm("Отменить аренду? Дом станет свободным, деньги не возвращаются.")) return;
  try {
    const d = await api("house/cancel", {});
    toast(`🏚 Аренда отменена (${d.cancelled_house_name})`, "success");
    closeModal();
    await loadMap();
  } catch (e) { toast(e.message, "error"); }
}

async function mapToggleHouseOpen() {
  try {
    const d = await api("house/toggle_open");
    toast(d.is_open ? "🚪 Дверь открыта. Вас могут навестить." : "🚪 Дверь закрыта.", "success");
    closeModal();
    await loadMap();
  } catch (e) { toast(e.message, "error"); }
}

async function mapEnterHouse(houseId) {
  if (_enteringHouse) return;
  _enteringHouse = true;
  closeModal();
  try {
    await api("debug_log", { text: `CLIENT enter start house_id=${houseId}` }).catch(() => {});
    const resp = await api("house/enter", { house_id: houseId });
    await api("debug_log", { text: `CLIENT enter ok resp=${JSON.stringify(resp)}` }).catch(() => {});
    await loadMap();
  } catch (e) {
    await api("debug_log", { text: `CLIENT enter error: ${e.message}` }).catch(() => {});
    toast(e.message, "error");
  } finally {
    _enteringHouse = false;
  }
}

async function mapExitHouse() {
  try {
    await api("house/exit");
    await loadMap();
  } catch (e) { toast(e.message, "error"); }
}

async function showOnlinePlayers(cityId = null) {
  try {
    const d = await api("map/online_players", { city_id: cityId });
    const players = d.players || [];
    const cityName = cityId !== null ? (_cityById(cityId)?.name || "городе") : null;

    let html = `<h2>👥 ${cityName ? 'Игроки в ' + cityName : 'Все игроки'}</h2>`;

    if (players.length === 0) {
      html += '<p style="color:var(--hint);text-align:center;padding:20px;">Никого нет</p>';
    } else {
      html += players.map(p => `
        <div class="player-card" onclick="closeModal(); viewPlayer(${p.user_id})" style="cursor:pointer;">
          <div class="player-avatar">👤</div>
          <div class="player-info">
            <div class="player-name">${formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color, p.role)}</div>
            <div class="player-meta">
              Ур. ${p.level} · ${_onlineHtml(p.is_online)}
              ${cityId === null && p.city_name ? ` · 🏙 ${p.city_name}` : ''}
            </div>
          </div>
        </div>
      `).join("");
    }

    openModal(html);
  } catch (e) {
    toast(e.message, "error");
  }
}

function startMovingScreen(moving) {
  mapState.movingData = moving;
  renderMapScreen();
  stopMovingTimer();
  mapState.movingTimer = setInterval(async () => {
    if (!mapState.movingData) { stopMovingTimer(); return; }
    const left = mapState.movingData.until - Math.floor(Date.now() / 1000);
    const progressEl = document.getElementById("map-moving-progress");
    const timerEl = document.getElementById("map-moving-timer");
    if (timerEl) timerEl.textContent = _fmtTimeLeft(Math.max(0, left));
    if (progressEl) {
      const total = mapState.movingData.duration || mapState.movingData.seconds_left || 1;
      const done = Math.max(0, Math.min(100, ((total - left) / total) * 100));
      progressEl.style.width = done + "%";
    }
    if (left <= 0) { stopMovingTimer(); await loadMap(); }
  }, 500);
}

function stopMovingTimer() {
  if (mapState.movingTimer) {
    clearInterval(mapState.movingTimer);
    mapState.movingTimer = null;
  }
}

function renderMapScreen() {
  const el = document.getElementById("map-content");
  if (!el) return;
  if (!mapState.data) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--hint);">Загрузка карты...</div>';
    return;
  }
  if (mapState.movingData) {
    el.innerHTML = renderMovingScreen();
    return;
  }

  if (mapState.data.house_inside) {
    try {
      const html = renderHouseInside();
      if (html) {
        el.innerHTML = html;
        return;
      }
    } catch(e) {
      console.error("renderHouseInside error:", e);
      mapState.data.house_inside = null;
      toast("Ошибка отрисовки дома", "error");
    }
  }

  el.innerHTML = renderCityHeader() + renderMyHouseBadge() +
                 renderCityTabs() +
                 (mapState.view === 'street' ? renderStreetView() : renderCityView());
}

function renderCityHeader() {
  const d = mapState.data;
  const cur = d.current;
  const city = _cityById(cur.city_id);
  const street = _streetById(cur.city_id, cur.street_id);

  let onlineCount = 0;
  if (d.street && d.street.players) {
    onlineCount = d.street.players.filter(p => p.is_online).length;
    if (_isOnStreet(cur.inside_house_id)) onlineCount += 1;
  }

  const cityName = city ? `${city.emoji} ${_mapEscape(city.name)}` : "?";
  const streetName = street ? _mapEscape(street.name) : "?";
  return `
    <div class="map-loc-badge" style="justify-content: space-between;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="map-loc-dot"></span>
        <span>${cityName} · ${streetName}</span>
      </div>
      <div style="font-size:12px; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:12px; color:#2ecc71; cursor:pointer;" onclick="showOnlinePlayers(${cur.city_id})">
        👤 Онлайн: ${onlineCount}
      </div>
    </div>
  `;
}

function renderMyHouseBadge() {
  const mh = mapState.data.my_house;
  if (!mh) return '';
  return `
    <div class="map-my-house-badge">
      <div class="map-my-house-emoji">${mh.emoji}</div>
      <div class="map-my-house-info">
        <div class="map-my-house-title">🏠 Твой дом: ${_mapEscape(mh.name)}</div>
        <div class="map-my-house-sub">Осталось ${_fmtTimeLeft(mh.seconds_left)} · ${_mapEscape(mh.type)}</div>
      </div>
      <button class="map-my-house-btn" onclick="mapCancelRent(${mh.id})">Отменить</button>
    </div>
  `;
}

function renderCityTabs() {
  const d = mapState.data;
  return `
    <div class="map-city-tabs">
      ${d.cities.map(c => {
        const active = c.id === mapState.selectedCity ? 'active' : '';
        return `<button class="map-city-tab ${active}" onclick="mapSelectCity(${c.id})">
          <span class="map-city-tab-emoji">${c.emoji}</span>
          <span class="map-city-tab-name">${_mapEscape(c.name)}</span>
        </button>`;
      }).join("")}
    </div>
  `;
}

function mapSelectCity(cid) {
  mapState.selectedCity = cid;
  mapState.view = 'city';
  mapState.streetId = null;
  renderMapScreen();
}

function renderCityView() {
  const city = _cityById(mapState.selectedCity);
  if (!city) return '';
  const d = mapState.data;
  const cur = d.current;
  const isHere = cur.city_id === city.id;
  const inAnotherCity = cur.city_id !== city.id;

  const playersByStreet = {};
  const onlineByStreet = {};

  (d.city_players || []).forEach(p => {
    playersByStreet[p.street_id] = (playersByStreet[p.street_id] || 0) + 1;
    if (p.is_online) {
      onlineByStreet[p.street_id] = (onlineByStreet[p.street_id] || 0) + 1;
    }
  });

  if (isHere && _isOnStreet(cur.inside_house_id)) {
    playersByStreet[cur.street_id] = (playersByStreet[cur.street_id] || 0) + 1;
    onlineByStreet[cur.street_id] = (onlineByStreet[cur.street_id] || 0) + 1;
  }

  return `
    <div class="map-city-hero" style="--sky1:${city.theme.sky1};--sky2:${city.theme.sky2};--ground:${city.theme.ground};--accent:${city.theme.accent};">
      <div class="map-city-hero-bg">
        ${_renderCitySkySVG(city)}
      </div>
      <div class="map-city-hero-info">
        <div class="map-city-hero-emoji">${city.emoji}</div>
        <div class="map-city-hero-name">${_mapEscape(city.name)}</div>
        <div class="map-city-hero-desc">${_mapEscape(city.desc)}</div>
      </div>
    </div>

    <div class="map-streets-title">Улицы</div>
    <div class="map-streets-grid">
      ${city.streets.map(s => {
        const here = isHere && cur.street_id === s.id;
        const cnt = playersByStreet[s.id] || 0;
        const onl = onlineByStreet[s.id] || 0;

        const leftPart = here ? '📍 Ты здесь' : (cnt > 0 ? `👤 ${cnt} игрок(ов)` : '👤 никого');
        const rightPart = onl > 0 ? `<span style="color:#2ecc71; font-weight:800;">🟢 ${onl} онлайн</span>` : '';

        return `
          <div class="map-street-card ${here ? 'here' : ''}" onclick="mapOpenStreet(${city.id}, ${s.id})">
            <div class="map-street-card-head">
              <span class="map-street-card-emoji">${s.emoji}</span>
              <span class="map-street-card-name">${_mapEscape(s.name)}</span>
            </div>
            <div class="map-street-card-meta">
              <span>${leftPart}</span>
              ${rightPart}
            </div>
          </div>
        `;
      }).join("")}
    </div>

    ${isHere ? '' : `
      <div class="map-move-hint">
        ${inAnotherCity ? '🚶 Переезд в другой город займёт ~30 сек' : '🚶 Переход на другую улицу ~10 сек'}
      </div>
    `}
  `;
}

function mapOpenStreet(cid, sid) {
  mapState.selectedCity = cid;
  mapState.view = 'street';
  mapState.streetId = sid;
  _streetPlayerPositions = {};
  _streetPlayerPositionsKey = '';
  renderMapScreen();
}

function renderStreetView() {
  const cid = mapState.selectedCity;
  const sid = mapState.streetId;
  const city = _cityById(cid);
  const street = _streetById(cid, sid);
  if (!city || !street) return '';
  const d = mapState.data;
  const cur = d.current;
  const isCur = cur.city_id === cid && cur.street_id === sid;
  const houses = _housesOnStreet(cid, sid);
  let players = (isCur && d.street && d.street.players) ? d.street.players : [];
  const myHouse = d.my_house;

  players.sort((a, b) => (a.pos_y || 0) - (b.pos_y || 0));

  const cacheKey = `${cid}-${sid}`;
  if (_streetPlayerPositionsKey !== cacheKey) {
    _streetPlayerPositions = {};
    _streetPlayerPositionsKey = cacheKey;
  }

  const activeIds = new Set(players.map(p => p.user_id));
  Object.keys(_streetPlayerPositions).forEach(uidStr => {
    if (!activeIds.has(Number(uidStr))) {
      delete _streetPlayerPositions[uidStr];
    }
  });

  players.forEach(p => {
    if (_streetPlayerPositions[p.user_id]) {
      p.render_x = _streetPlayerPositions[p.user_id].x;
      p.render_y = _streetPlayerPositions[p.user_id].y;
      return;
    }
    let px = p.pos_x || (200 + Math.random() * 200);
    let py = p.pos_y || (300 + Math.random() * 60);
    let tries = 0;
    const placed = Object.values(_streetPlayerPositions);
    while (tries < 12) {
      let overlap = false;
      for (const pt of placed) {
        if (Math.abs(pt.x - px) < 44 && Math.abs(pt.y - py) < 44) {
          overlap = true;
          px += 32;
          break;
        }
      }
      if (!overlap) break;
      tries++;
    }
    p.render_x = Math.max(24, Math.min(576, px));
    p.render_y = Math.max(260, Math.min(378, py));
    _streetPlayerPositions[p.user_id] = { x: p.render_x, y: p.render_y };
  });

  const W = 600, H = 400;
  const GROUND_Y = 200;
  const HOUSE_X = [30, 170, 310, 450];
  const HOUSE_W = 120;

  let housesSvg = '';
  houses.forEach((h, i) => {
    const x = HOUSE_X[i];
    if (x === undefined) return;
    const slug = getHouseSlug(h.type);
    const hHeight = getHouseHeight(h.type);
    const y = GROUND_Y - hHeight;
    const isMine = myHouse && myHouse.id === h.id;
    const rented = h.rented_by;
    const svgContent = HOUSE_SVGS[slug] || HOUSE_SVGS.obshaga;

    const haloColor = isMine ? 'rgba(243,156,18,0.4)' :
                      (rented ? 'rgba(46,204,113,0.35)' : 'rgba(82,136,193,0.15)');

    housesSvg += `
      <g class="map-house" onclick="mapHouseClick(${h.id})" style="cursor:pointer;">
        <ellipse cx="${x + HOUSE_W/2}" cy="${GROUND_Y - 2}" rx="${HOUSE_W/2 + 6}" ry="6" fill="${haloColor}"/>
        <svg x="${x}" y="${y}" width="${HOUSE_W}" height="${hHeight}" viewBox="0 0 120 ${hHeight}" preserveAspectRatio="xMidYMax meet">
          ${svgContent}
        </svg>
        <rect x="${x + 10}" y="${GROUND_Y + 2}" width="${HOUSE_W - 20}" height="15" rx="4" fill="rgba(0,0,0,0.75)" stroke="${isMine ? '#f39c12' : (rented ? '#2ecc71' : '#5288c1')}" stroke-width="0.8"/>
        <text x="${x + HOUSE_W/2}" y="${GROUND_Y + 12}" text-anchor="middle" font-size="8"
              font-weight="800" fill="#fff">${_mapEscape(h.name.replace(/^[^ ]+ /, ''))}</text>
        <text x="${x + HOUSE_W/2}" y="${GROUND_Y + 25}" text-anchor="middle" font-size="8"
              font-weight="700" fill="${isMine ? '#f39c12' : (rented ? '#2ecc71' : '#f1c40f')}">
          ${isMine ? '🏠 твой' : (rented ? '🔒 ' + _mapEscape((rented.nickname || '').slice(0, 10)) : 'свободен')}
        </text>
      </g>
    `;
  });

  const playersSvg = players.map(p => {
    const outfit = p.outfit || {};
    const miniSvg = renderCharacterSVG(outfit, { height: 72 });
    const nick = _mapEscape(p.nickname);
    const tag = p.gang_tag ? `[${_mapEscape(p.gang_tag)}] ` : '';
    const nickColor = p.is_online ? '#2ecc71' : '#ffffff';
    return `
      <g class="map-player" transform="translate(${p.render_x}, ${p.render_y})" onclick="event.stopPropagation();viewPlayer(${p.user_id})" style="cursor:pointer;">
        <text x="0" y="-82" text-anchor="middle" font-size="11" font-weight="800"
              fill="${nickColor}" stroke="#000" stroke-width="3" paint-order="stroke fill" style="letter-spacing:0.5px;">${tag}${nick}</text>
        <foreignObject x="-60" y="-72" width="120" height="80">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:120px;height:80px;display:flex;align-items:flex-end;justify-content:center;">
            ${miniSvg}
          </div>
        </foreignObject>
      </g>
    `;
  }).join("");

  const moveBtn = isCur ? '' : `
    <button class="btn btn-primary map-go-btn" onclick="mapMoveTo(${cid}, ${sid})">
      ${cur.city_id === cid ? '🚶 Перейти на эту улицу (~10 сек)' : `🚌 Ехать в ${city.name} (~30 сек)`}
    </button>
  `;

  const backBtn = `<button class="btn btn-secondary map-back-btn" onclick="mapBackToCity()">← Назад к городу</button>`;

  return `
    <div class="map-street-hero" style="--sky1:${city.theme.sky1};--sky2:${city.theme.sky2};--ground:${city.theme.ground};--accent:${city.theme.accent};">
      <div class="map-street-hero-head">
        <div>
          <div class="map-street-hero-title">${street.emoji} ${_mapEscape(street.name)}</div>
          <div class="map-street-hero-sub">${city.emoji} ${_mapEscape(city.name)} · ${houses.length} домов · ${players.length + (isCur && _isOnStreet(cur.inside_house_id) ?1:0)} игроков</div>
        </div>
      </div>
      <div class="map-street-scene">
        <svg viewBox="0 0 ${W} ${H}" class="map-street-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="stsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${city.theme.sky1}"/>
              <stop offset="100%" stop-color="${city.theme.sky2}"/>
            </linearGradient>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(245,232,200,0.6)"/>
              <stop offset="100%" stop-color="rgba(245,232,200,0)"/>
            </radialGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${city.theme.ground}"/>
              <stop offset="100%" stop-color="${city.theme.sky2}"/>
            </linearGradient>
          </defs>

          <rect width="${W}" height="${H}" fill="url(#stsky)"/>

          <circle cx="535" cy="50" r="22" fill="url(#moonGlow)"/>
          <circle cx="535" cy="50" r="18" fill="#f5e8c8"/>
          <circle cx="529" cy="46" r="3.5" fill="#d8cbb0" opacity="0.6"/>
          <circle cx="541" cy="56" r="2.5" fill="#d8cbb0" opacity="0.5"/>

          ${[...Array(22)].map((_, i) => {
            const sx = (i * 73 + 17) % W;
            const sy = (i * 41 + 13) % 190 + 20;
            const r = ((i * 7) % 3) * 0.5 + 0.5;
            const dur = 2 + (i % 4);
            return `<circle cx="${sx}" cy="${sy}" r="${r}" fill="#fff" opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.9;0.2" dur="${dur}s" repeatCount="indefinite"/>
            </circle>`;
          }).join("")}

          <rect y="200" width="${W}" height="${H - 200}" fill="url(#groundGrad)"/>
          <path d="M0 200 Q ${W/2} 185 ${W} 200 L ${W} 210 L 0 210 Z" fill="${city.theme.ground}" opacity="0.7"/>

          <rect y="280" width="${W}" height="8" fill="rgba(255,255,255,0.08)"/>
          <rect y="360" width="${W}" height="4" fill="rgba(255,255,255,0.05)"/>

          ${[130, 330, 530].map(x => `
            <rect x="${x-2}" y="200" width="4" height="80" fill="#222"/>
            <circle cx="${x}" cy="200" r="6" fill="#f39c12" opacity="0.85">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="${x}" cy="200" r="20" fill="url(#moonGlow)" opacity="0.3"/>
          `).join("")}

          ${housesSvg || '<text x="300" y="160" text-anchor="middle" fill="#888">Дома появятся...</text>'}

          ${playersSvg}
        </svg>
      </div>
    </div>

    <div class="map-street-actions">
      ${moveBtn}
      ${backBtn}
    </div>

    ${players.length === 0 && !isCur ? `<div class="map-empty-hint">На этой улице пока никого нет</div>` : ''}
  `;
}

function mapBackToCity() {
  mapState.view = 'city';
  mapState.streetId = null;
  renderMapScreen();
}

function _renderCitySkySVG(city) {
  const W = 600, H = 140;
  return `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="map-city-sky">
      <defs>
        <linearGradient id="csky_${city.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${city.theme.sky1}"/>
          <stop offset="100%" stop-color="${city.theme.sky2}"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#csky_${city.id})"/>
      ${[...Array(16)].map((_, i) => {
        const sx = (i * 53 + 11) % W;
        const sy = (i * 17 + 9) % (H - 30) + 10;
        const r = ((i * 5) % 3) * 0.4 + 0.5;
        return `<circle cx="${sx}" cy="${sy}" r="${r}" fill="#fff" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="${2 + (i%3)}s" repeatCount="indefinite"/>
        </circle>`;
      }).join("")}
      <circle cx="${W-80}" cy="40" r="22" fill="#f5e8c8" opacity="0.85"/>
      <circle cx="${W-80}" cy="40" r="32" fill="${city.theme.accent}" opacity="0.15"/>
      <path d="M0 ${H-20} Q ${W/2} ${H-35} ${W} ${H-20} L ${W} ${H} L 0 ${H} Z" fill="${city.theme.ground}"/>
      ${[60, 140, 240, 340, 440, 520].map((x, i) => {
        const hh = 30 + (i * 13) % 40;
        return `<rect x="${x}" y="${H-20-hh}" width="40" height="${hh}" fill="${city.theme.sky2}" opacity="0.85"/>`;
      }).join("")}
    </svg>
  `;
}

function renderMovingScreen() {
  const m = mapState.movingData;
  if (!m) return '';
  const city = _cityById(m.to_city);
  const street = _streetById(m.to_city, m.to_street);
  const cityName = city ? `${city.emoji} ${_mapEscape(city.name)}` : '?';
  const streetName = street ? _mapEscape(street.name) : '?';
  return `
    <div class="map-moving">
      <div class="map-moving-emoji">
        <span class="map-walker">🚶</span>
      </div>
      <div class="map-moving-title">Ты в пути...</div>
      <div class="map-moving-sub">${cityName} · ${streetName}</div>
      <div class="map-moving-bar">
        <div class="map-moving-bar-fill" id="map-moving-progress" style="width:0%;"></div>
      </div>
      <div class="map-moving-timer" id="map-moving-timer">${_fmtTimeLeft(m.seconds_left || 0)}</div>
      <div class="map-moving-hint">Скорость перемещения можно будет ускорить машинами</div>
    </div>
  `;
}

function renderHouseInside() {
  const hData = mapState.data.house_inside;
  if (!hData || !hData.house) {
    mapState.data.house_inside = null;
    return "";
  }

  const h = hData.house;
  const isMine = mapState.data.my_house && mapState.data.my_house.id === h.id;

  const imgName = getHouseSlug(h.type);
  const bgStyle = `background: url('/assets/houses/${imgName}.png') center/cover no-repeat;`;

  // Расставляем игроков по горизонтали в нижней части сцены
  const players = hData.players || [];
  const playersHtml = players.map((p, i) => {
    const total = players.length;
    // Равномерно от 20% до 80% ширины
    const pct = total === 1 ? 50 : 20 + (i * 60 / (total - 1));
    // Небольшой разброс по высоте (чтобы не стояли в линии)
    const bottomPct = 20 + ((p.user_id % 5) * 3); // 20% - 32% от низа
    const nickColor = p.is_online ? '#2ecc71' : '#fff';

    return `
      <div class="house-player" style="left: ${pct}%; bottom: ${bottomPct}%;" onclick="viewPlayer(${p.user_id})">
        <div class="house-player-nick" style="color: ${nickColor}">${formatNickWithTag(p.nickname, p.gang_tag, p.gang_tag_color, p.role)}</div>
        <div class="house-player-svg">
          ${renderCharacterSVG(p.outfit, { height: 80 })}
        </div>
        <div class="house-player-lvl">Ур. ${p.level}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="house-interior" style="${bgStyle}">
      <div class="house-interior-header">
        <h2>${h.emoji} ${_mapEscape(h.name)}</h2>
        <div class="house-interior-sub">
          ${isMine ? 'Твой дом' : 'В гостях'} · ${hData.is_open ? '🚪 Открыт' : '🔒 Закрыт'}
        </div>
      </div>

      <div class="house-interior-scene">
        ${playersHtml || '<div style="color:var(--hint); text-align:center; margin-top:60px;">Тут пусто</div>'}
      </div>

      <div class="house-interior-actions">
        ${isMine ? `<button class="btn btn-secondary" onclick="mapToggleHouseOpen()">${hData.is_open ? '🔒 Закрыть дверь' : '🔓 Открыть дверь'}</button>` : ''}
        <button class="btn btn-primary" onclick="mapExitHouse()">🚪 Выйти на улицу</button>
      </div>
    </div>
  `;
}

function mapHouseClick(houseId) {
  const houses = _housesOnStreet(mapState.selectedCity, mapState.streetId);
  const h = houses.find(x => x.id === houseId);
  if (!h) return;
  const d = mapState.data;
  const cur = d.current;
  const myHouse = d.my_house;
  const onThisStreet = cur.city_id === mapState.selectedCity && cur.street_id === mapState.streetId;
  const rented = h.rented_by;
  const isMyHouse = myHouse && myHouse.id === h.id;
  const iOwnAnotherHouse = !!myHouse && !isMyHouse;
  const canRent = !rented && onThisStreet && !iOwnAnotherHouse && state.player.balance >= h.price;
  const canEnter = onThisStreet && rented && (isMyHouse || rented.is_open);
  const rentHours = d.house_rent_hours || 48;

  let rentedInfo = '';
  if (isMyHouse) {
    rentedInfo = `<div class="map-house-rented map-house-mine">
        <div>🏠 Это <b>твой дом</b></div>
        <div>Осталось: <b>${_fmtTimeLeft(myHouse.seconds_left)}</b></div>
        <div>Дверь: <b>${myHouse.is_open ? 'Открыта' : 'Закрыта'}</b></div>
      </div>`;
  } else if (rented) {
    rentedInfo = `<div class="map-house-rented">
        <div>🔒 Арендован: <b>${_mapEscape(rented.nickname)}</b></div>
        <div>Осталось: <b>${_fmtTimeLeft(rented.seconds_left)}</b></div>
        <div>Дверь: <b>${rented.is_open ? 'Открыта' : 'Закрыта'}</b></div>
      </div>`;
  } else {
    rentedInfo = `<div class="map-house-free">✅ Свободен</div>`;
  }

  let warning = '';
  if (!onThisStreet) {
    warning = `<div class="map-house-warn">Чтобы арендовать или зайти, нужно быть на этой улице</div>`;
  } else if (iOwnAnotherHouse) {
    warning = `<div class="map-house-warn">
        У тебя уже есть дом: <b>${_mapEscape(myHouse.name)}</b>.<br>
        Сначала отмени его аренду на карте.
      </div>`;
  } else if (!rented && state.player.balance < h.price) {
    warning = `<div class="map-house-warn">Не хватает денег</div>`;
  }

  let actionBtn = '';
  if (isMyHouse) {
    actionBtn = `<button class="btn btn-primary" onclick="mapEnterHouse(${h.id})" style="margin-top:16px; background:linear-gradient(135deg,#2ecc71,#27ae60);">🚪 Войти в свой дом</button>`;
  } else if (canEnter) {
    actionBtn = `<button class="btn btn-primary" onclick="mapEnterHouse(${h.id})" style="margin-top:16px; background:linear-gradient(135deg,#2ecc71,#27ae60);">🚪 Зайти в гости</button>`;
  } else if (canRent) {
    actionBtn = `<button class="btn btn-primary" onclick="mapRentHouse(${h.id})" style="margin-top:16px;">🏠 Арендовать на ${rentHours} часов</button>`;
  }

  openModal(`
    <div class="map-house-modal">
      <div class="map-house-modal-emoji">${h.emoji}</div>
      <h2 style="text-align:center;margin-bottom:4px;">${_mapEscape(h.name)}</h2>
      <div style="text-align:center;color:var(--hint);font-size:13px;margin-bottom:16px;">
        ${h.type} · ${_mapEscape(h.desc)}
      </div>

      <div class="map-house-modal-price">
        <div style="font-size:11px;color:var(--hint);text-transform:uppercase;letter-spacing:0.5px;">Аренда на ${rentHours} часов</div>
        <div style="font-size:26px;font-weight:900;color:var(--money);margin-top:4px;">${fmtMoney(h.price)}₽</div>
      </div>

      ${rentedInfo}
      ${warning}
      ${actionBtn}
      <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:8px;">Закрыть</button>
    </div>
  `);
}