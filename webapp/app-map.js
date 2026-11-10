// app-map.js
// Интерактивная карта: города / улицы / дома / игроки / перемещение с задержкой.

let mapState = {
  loaded: false,
  data: null,
  selectedCity: 0,
  view: 'city',
  streetId: null,
  movingTimer: null,
  movingData: null,
};

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

// ─── API ───
async function loadMap() {
  try {
    const d = await api("map/get");
    mapState.data = d;
    mapState.loaded = true;
    mapState.selectedCity = d.current.city_id;

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
    const d = await api("map/get");
    mapState.data = d;
    if (d.moving) {
      startMovingScreen(d.moving);
    }
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch (e) {
    toast(e.message, "error");
  }
}

async function mapRentHouse(houseId) {
  try {
    const d = await api("house/rent", { house_id: houseId });
    if (d.player) { state.player = d.player; renderPlayer(); }
    toast(`🏠 Арендовано: ${d.house_name} на 48ч!`, "success");
    closeModal();
    loadMap();
    if (tg) tg.HapticFeedback?.notificationOccurred("success");
  } catch (e) {
    toast(e.message, "error");
  }
}

async function mapCancelRent(houseId) {
  if (!confirm("Отменить аренду? Дом станет свободным, деньги не возвращаются.")) return;
  try {
    const d = await api("house/cancel", {});
    toast(`🏚 Аренда отменена (${d.cancelled_house_name})`, "success");
    closeModal();
    loadMap();
  } catch (e) {
    toast(e.message, "error");
  }
}

// ─── экран перемещения ───
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
    if (left <= 0) {
      stopMovingTimer();
      await loadMap();
    }
  }, 500);
}

function stopMovingTimer() {
  if (mapState.movingTimer) {
    clearInterval(mapState.movingTimer);
    mapState.movingTimer = null;
  }
}

// ─── рендер ───
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
  el.innerHTML = renderCityHeader() + renderMyHouseBadge() +
                 renderCityTabs() +
                 (mapState.view === 'street' ? renderStreetView() : renderCityView());
}

function renderCityHeader() {
  const d = mapState.data;
  const cur = d.current;
  const city = _cityById(cur.city_id);
  const street = _streetById(cur.city_id, cur.street_id);
  const cityName = city ? `${city.emoji} ${_mapEscape(city.name)}` : "?";
  const streetName = street ? _mapEscape(street.name) : "?";
  return `
    <div class="map-loc-badge">
      <span class="map-loc-dot"></span>
      <span>${cityName} · ${streetName}</span>
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

// ─── город (улицы) ───
function renderCityView() {
  const city = _cityById(mapState.selectedCity);
  if (!city) return '';
  const d = mapState.data;
  const cur = d.current;
  const isHere = cur.city_id === city.id;
  const inAnotherCity = cur.city_id !== city.id;

  const playersByStreet = {};
  (d.city_players || []).forEach(p => {
    playersByStreet[p.street_id] = (playersByStreet[p.street_id] || 0) + 1;
  });
  if (isHere) {
    playersByStreet[cur.street_id] = (playersByStreet[cur.street_id] || 0) + 1;
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
        return `
          <div class="map-street-card ${here ? 'here' : ''}" onclick="mapOpenStreet(${city.id}, ${s.id})">
            <div class="map-street-card-head">
              <span class="map-street-card-emoji">${s.emoji}</span>
              <span class="map-street-card-name">${_mapEscape(s.name)}</span>
            </div>
            <div class="map-street-card-meta">
              ${here ? '📍 Ты здесь' : (cnt > 0 ? `👤 ${cnt} игрок(ов)` : '👤 никого')}
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
  renderMapScreen();
}

// ─── улица ───
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
  const players = (isCur && d.street && d.street.players) ? d.street.players : [];
  const myHouse = d.my_house;

  const W = 600, H = 400;
  const houseX = [70, 210, 350, 490];
  const houseY = 120;

  const housesSvg = houses.map((h, i) => {
    const x = houseX[i] ?? (70 + i * 140);
    const rented = h.rented_by;
    const isMine = myHouse && myHouse.id === h.id;
    const color = isMine ? '#f39c12' : (rented ? '#2ecc71' : (h.price > 100000 ? '#f1c40f' : '#5288c1'));
    const glow = isMine ? 'rgba(243,156,18,0.7)' : (rented ? 'rgba(46,204,113,0.6)' : 'rgba(82,136,193,0.4)');
    return `
      <g class="map-house" onclick="mapHouseClick(${h.id})" style="cursor:pointer;">
        <rect x="${x}" y="${houseY}" width="100" height="80" rx="10" fill="${color}" fill-opacity="0.28"
              stroke="${color}" stroke-width="2"/>
        <text x="${x + 50}" y="${houseY + 40}" text-anchor="middle" font-size="30"
              dominant-baseline="central">${h.emoji}</text>
        <text x="${x + 50}" y="${houseY + 66}" text-anchor="middle" font-size="10"
              fill="#fff" font-weight="700">${_mapEscape(h.name.replace(/^[^ ]+ /, ''))}</text>
        <text x="${x + 50}" y="${houseY + 78}" text-anchor="middle" font-size="9"
              fill="${isMine ? '#f39c12' : (rented ? '#2ecc71' : '#f1c40f')}" font-weight="700">
          ${isMine ? '🏠 твой' : (rented ? '🔒 арендован' : 'свободен')}
        </text>
        <rect x="${x}" y="${houseY}" width="100" height="80" rx="10" fill="none"
              stroke="${color}" stroke-width="2" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite"/>
        </rect>
      </g>
    `;
  }).join("");

  const playersSvg = players.map(p => {
    const px = (p.pos_x || 0) || (80 + Math.random() * 440);
    const py = (p.pos_y || 0) || 320;
    const outfit = p.outfit || {};
    const miniSvg = renderCharacterSVG(outfit, { width: 36, height: 72 });
    const nick = _mapEscape(p.nickname);
    const tag = p.gang_tag ? `[${_mapEscape(p.gang_tag)}] ` : '';
    return `
      <g class="map-player" transform="translate(${px}, ${py})" onclick="viewPlayer(${p.user_id})" style="cursor:pointer;">
        <text x="0" y="-82" text-anchor="middle" font-size="10" font-weight="800"
              fill="#fff" stroke="#000" stroke-width="2.5" paint-order="stroke fill">${tag}${nick}</text>
        <foreignObject x="-20" y="-72" width="40" height="80">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:40px;height:80px;display:flex;align-items:flex-end;justify-content:center;">
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
          <div class="map-street-hero-sub">${city.emoji} ${_mapEscape(city.name)} · ${houses.length} домов · ${players.length + (isCur?1:0)} игроков</div>
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

          <circle cx="520" cy="60" r="26" fill="url(#moonGlow)"/>
          <circle cx="520" cy="60" r="22" fill="#f5e8c8"/>
          <circle cx="512" cy="55" r="4" fill="#d8cbb0" opacity="0.6"/>
          <circle cx="527" cy="65" r="3" fill="#d8cbb0" opacity="0.5"/>

          ${[...Array(20)].map((_, i) => {
            const sx = (i * 73 + 17) % W;
            const sy = (i * 41 + 13) % 200 + 20;
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

// ─── SVG-фон города ───
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

// ─── модалка дома ───
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
  const rentHours = d.house_rent_hours || 48;

  let rentedInfo = '';
  if (isMyHouse) {
    rentedInfo = `<div class="map-house-rented map-house-mine">
        <div>🏠 Это <b>твой дом</b></div>
        <div>Осталось: <b>${_fmtTimeLeft(myHouse.seconds_left)}</b></div>
      </div>`;
  } else if (rented) {
    rentedInfo = `<div class="map-house-rented">
        <div>🔒 Арендован: <b>${_mapEscape(rented.nickname)}</b></div>
        <div>Осталось: <b>${_fmtTimeLeft(rented.seconds_left)}</b></div>
      </div>`;
  } else {
    rentedInfo = `<div class="map-house-free">✅ Свободен</div>`;
  }

  let warning = '';
  if (!onThisStreet) {
    warning = `<div class="map-house-warn">Чтобы арендовать, нужно быть на этой улице</div>`;
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
    actionBtn = `<button class="btn btn-secondary" onclick="mapCancelRent(${h.id})" style="background:rgba(231,76,60,.15);color:var(--danger);border:1px solid rgba(231,76,60,.4);margin-top:16px;font-weight:800;">🏚 Отменить аренду</button>`;
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

// ─── экран перемещения ───
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