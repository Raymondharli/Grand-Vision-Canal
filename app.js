(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     DOM REFS
  ═══════════════════════════════════════════════════════════ */
  const LOADER        = document.getElementById('loading-screen');
  const APP           = document.getElementById('app');

  // Timeline
  const ERA_PERIOD    = document.getElementById('era-period');
  const ERA_YEAR      = document.getElementById('era-year');
  const MAIN_PHOTO    = document.getElementById('main-photo');
  const PHOTO_FRAME   = document.getElementById('photo-frame');
  const ERA_PH        = document.getElementById('era-placeholder');
  const PH_ZH         = document.getElementById('placeholder-zh');
  const PH_LABEL      = document.getElementById('placeholder-label');
  const INFO_BTN      = document.getElementById('info-trigger');
  const INFO_CARD     = document.getElementById('info-card');
  const INFO_CLOSE    = document.getElementById('info-close');
  const INFO_TITLE    = document.getElementById('info-title');
  const INFO_BODY_EL  = document.getElementById('info-body');
  const INFO_SOURCE   = document.getElementById('info-source');
  const NAV_PREV      = document.getElementById('nav-prev');
  const NAV_NEXT      = document.getElementById('nav-next');
  const TL_TRACK      = document.getElementById('timeline-track');
  const TL_PROGRESS   = document.getElementById('timeline-progress');
  const TL_HANDLE     = document.getElementById('timeline-handle');
  const ERA_DOTS_EL   = document.getElementById('era-dots');
  const DOT_NAV       = document.getElementById('dot-nav');
  const CAPTION_TEXT  = document.getElementById('caption-text');
  const PHOTO_COUNTER = document.getElementById('photo-counter');
  const TL_START      = document.getElementById('tl-start');
  const TL_END        = document.getElementById('tl-end');
  const SWIPE_HINT    = document.getElementById('swipe-hint');

  // Puzzle
  const PUZZLE_WRAP   = document.getElementById('puzzle-wrap');

  // Treasure
  const T_CLUE        = document.getElementById('treasure-clue');
  const T_PHOTO       = document.getElementById('treasure-photo');
  const T_PLACEHOLDER = document.getElementById('treasure-placeholder');
  const T_PH_ZH       = document.getElementById('treasure-ph-zh');
  const T_HIT_ZONE    = document.getElementById('treasure-hit-zone');
  const T_BADGE       = document.getElementById('treasure-badge');
  const T_PROGRESS    = document.getElementById('t-progress');
  const T_ERA_LABEL   = document.getElementById('t-era-label');
  const T_PREV        = document.getElementById('t-prev');
  const T_NEXT        = document.getElementById('t-next');
  const FW_CANVAS     = document.getElementById('fireworks-canvas');

  // Map
  const MAP_SVG_WRAP  = document.getElementById('map-svg-wrap');

  // Chat
  const CHAT_FAB      = document.getElementById('chat-fab');
  const CHAT_PANEL    = document.getElementById('chat-panel');
  const CHAT_CLOSE    = document.getElementById('chat-close');
  const CHAT_BACKDROP = document.getElementById('chat-backdrop');
  const CHAT_MSGS     = document.getElementById('chat-messages');
  const CHAT_INPUT    = document.getElementById('chat-input');
  const CHAT_SEND     = document.getElementById('chat-send');
  const CHAT_CHIPS    = document.getElementById('chat-chips');

  /* ═══════════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════════ */
  const S = {
    // Timeline
    eraIndex:    0,
    isDragging:  false,
    hintShown:   false,
    // Puzzle: array of layer IDs in current slot order (null = empty)
    // Sized from PUZZLE_LAYERS at init time, not hardcoded
    puzzleSlots: [],
    puzzleInited: false,
    // Treasure
    tIndex:      0,
    tFound:      [],
    tInited:     false,
    // Map
    mapLevel:    0,
    mapInited:   false,
    // Chat
    chatOpen:    false,
    chatHistory: []
  };

  const eras = ERAS; // from data.js

  /* ═══════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════ */
  // Preload images
  eras.forEach(e => { const i = new Image(); i.src = e.photo; });

  buildTimeline();
  buildDotNav();
  renderEra(0, 'none');

  LOADER.classList.add('fade-out');
  setTimeout(() => {
    LOADER.classList.add('hidden');
    APP.classList.remove('hidden');
  }, 650);

  /* ═══════════════════════════════════════════════════════════
     TABS
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');

      // Show/hide chat FAB only on timeline
      CHAT_FAB.style.display = (tab === 'timeline') ? '' : 'none';

      // Lazy init
      if (tab === 'puzzle'   && !S.puzzleInited) { S.puzzleInited = true; initPuzzle(); }
      if (tab === 'treasure' && !S.tInited)      { S.tInited = true;      initTreasure(); }
      if (tab === 'map'      && !S.mapInited)    { S.mapInited = true;    initMap(); }
    });
  });

  /* ═══════════════════════════════════════════════════════════
     TIMELINE — navigation
  ═══════════════════════════════════════════════════════════ */
  NAV_PREV.addEventListener('click', () => {
    if (S.eraIndex > 0) { renderEra(S.eraIndex - 1, 'right'); hideHint(); }
  });
  NAV_NEXT.addEventListener('click', () => {
    if (S.eraIndex < eras.length - 1) { renderEra(S.eraIndex + 1, 'left'); hideHint(); }
  });

  // Keyboard support on the timeline handle itself (role="slider")
  TL_HANDLE.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'  && S.eraIndex > 0)              { renderEra(S.eraIndex - 1, 'right'); e.preventDefault(); }
    if (e.key === 'ArrowRight' && S.eraIndex < eras.length - 1) { renderEra(S.eraIndex + 1, 'left');  e.preventDefault(); }
    if (e.key === 'Home') { renderEra(0, 'right'); e.preventDefault(); }
    if (e.key === 'End')  { renderEra(eras.length - 1, 'left'); e.preventDefault(); }
  });

  document.addEventListener('keydown', e => {
    if (S.chatOpen) return;
    const active = document.querySelector('.tab-pane.active');
    if (!active || active.id !== 'tab-timeline') return;
    if (e.key === 'ArrowLeft'  && S.eraIndex > 0)              renderEra(S.eraIndex - 1, 'right');
    if (e.key === 'ArrowRight' && S.eraIndex < eras.length - 1) renderEra(S.eraIndex + 1, 'left');
    if (e.key === 'Escape') closeInfo();
  });

  // Touch swipe
  let touchStartX = 0;
  PHOTO_FRAME.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  PHOTO_FRAME.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && S.eraIndex < eras.length - 1) renderEra(S.eraIndex + 1, 'left');
      if (diff < 0 && S.eraIndex > 0)               renderEra(S.eraIndex - 1, 'right');
      hideHint();
    }
  }, { passive: true });

  // Mouse drag
  let mouseDownX = 0;
  PHOTO_FRAME.addEventListener('mousedown', e => { mouseDownX = e.screenX; });
  PHOTO_FRAME.addEventListener('mouseup', e => {
    const diff = mouseDownX - e.screenX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && S.eraIndex < eras.length - 1) renderEra(S.eraIndex + 1, 'left');
      if (diff < 0 && S.eraIndex > 0)               renderEra(S.eraIndex - 1, 'right');
      hideHint();
    }
  });

  // Info card
  INFO_BTN.addEventListener('click',   () => INFO_CARD.classList.remove('hidden'));
  INFO_CLOSE.addEventListener('click', closeInfo);
  function closeInfo() { INFO_CARD.classList.add('hidden'); }

  // Timeline scrubber click
  TL_TRACK.addEventListener('click', e => {
    if (e.target.closest('.timeline-handle')) return;
    const pct = getPct(e.clientX);
    const idx = idxFromPct(pct);
    renderEra(idx, idx > S.eraIndex ? 'left' : 'right');
    hideHint();
  });

  // Timeline handle drag
  TL_HANDLE.addEventListener('mousedown', startDrag);
  TL_HANDLE.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    S.isDragging = true;
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
  }
  function onDrag(e) {
    if (!S.isDragging) return;
    e.preventDefault();
    setHandlePos(getPct(e.touches ? e.touches[0].clientX : e.clientX));
  }
  function endDrag(e) {
    if (!S.isDragging) return;
    S.isDragging = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
    const cx  = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const idx = idxFromPct(getPct(cx));
    renderEra(idx, idx > S.eraIndex ? 'left' : 'right');
    hideHint();
  }

  /* ── Timeline core render ───────────────────────────────── */
  function renderEra(index, direction) {
    if (index === S.eraIndex && direction !== 'none') return;
    S.eraIndex = index;
    const era = eras[index];

    ERA_PERIOD.textContent = era.period;
    ERA_YEAR.textContent   = era.year;
    ['flash'].forEach(cls => {
      ERA_PERIOD.classList.remove(cls); void ERA_PERIOD.offsetWidth; ERA_PERIOD.classList.add(cls);
      ERA_YEAR.classList.remove(cls);   void ERA_YEAR.offsetWidth;   ERA_YEAR.classList.add(cls);
    });

    PH_ZH.textContent    = era.placeholderZh    || '';
    PH_LABEL.textContent = era.placeholderLabel || '';
    ERA_PH.style.display = 'flex';

    if (direction !== 'none') {
      PHOTO_FRAME.classList.remove('slide-left', 'slide-right');
      void PHOTO_FRAME.offsetWidth;
      PHOTO_FRAME.classList.add('slide-' + direction);
    }

    MAIN_PHOTO.classList.add('transitioning');
    const img = new Image();
    img.onload = () => {
      MAIN_PHOTO.src          = era.photo;
      MAIN_PHOTO.alt          = era.photoAlt || `${era.period} — Chang Gate`;
      MAIN_PHOTO.style.filter = `sepia(${era.sepia}) contrast(1.08) brightness(0.88)`;
      MAIN_PHOTO.classList.remove('transitioning', 'no-image');
      ERA_PH.style.display    = 'none';
    };
    img.onerror = () => {
      MAIN_PHOTO.classList.add('no-image');
      MAIN_PHOTO.classList.remove('transitioning');
    };
    img.src = era.photo;

    CAPTION_TEXT.textContent  = era.caption;
    PHOTO_COUNTER.textContent = `${index + 1} / ${eras.length}`;
    INFO_TITLE.textContent    = era.info.title;
    INFO_BODY_EL.textContent  = era.info.body;
    INFO_SOURCE.textContent   = era.info.source;
    closeInfo();

    setHandlePos(yearPct(era.yearNumeric));

    ERA_DOTS_EL.querySelectorAll('.era-dot-mark').forEach((d, i) =>
      d.classList.toggle('active', i === index)
    );
    DOT_NAV.querySelectorAll('.dot-btn').forEach((b, i) => {
      b.classList.toggle('active', i === index);
      b.setAttribute('aria-selected', String(i === index));
    });
    NAV_PREV.disabled = index === 0;
    NAV_NEXT.disabled = index === eras.length - 1;

    // Slider a11y
    TL_HANDLE.setAttribute('aria-valuemin', '1');
    TL_HANDLE.setAttribute('aria-valuemax', String(eras.length));
    TL_HANDLE.setAttribute('aria-valuenow', String(index + 1));
    TL_HANDLE.setAttribute('aria-valuetext', `${era.period} (${era.year})`);
  }

  /* ── Timeline helpers ───────────────────────────────────── */
  function buildTimeline() {
    TL_START.textContent = eras[0].year;
    TL_END.textContent   = eras[eras.length - 1].year;
    ERA_DOTS_EL.innerHTML = '';
    eras.forEach((era, i) => {
      const dot = document.createElement('div');
      dot.className = 'era-dot-mark';
      dot.style.left = `${yearPct(era.yearNumeric) * 100}%`;
      dot.addEventListener('click', ev => {
        ev.stopPropagation();
        renderEra(i, i > S.eraIndex ? 'left' : 'right');
        hideHint();
      });
      ERA_DOTS_EL.appendChild(dot);
    });
  }

  function buildDotNav() {
    DOT_NAV.innerHTML = '';
    eras.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Era ${i + 1}`);
      btn.addEventListener('click', () => {
        renderEra(i, i > S.eraIndex ? 'left' : 'right');
        hideHint();
      });
      DOT_NAV.appendChild(btn);
    });
  }

  function yearPct(year) {
    const nums = eras.map(e => e.yearNumeric);
    const min  = Math.min(...nums);
    const max  = Math.max(...nums);
    return max === min ? 0 : (year - min) / (max - min);
  }
  function getPct(clientX) {
    const r = TL_TRACK.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  }
  function idxFromPct(pct) {
    const nums   = eras.map(e => e.yearNumeric);
    const min    = Math.min(...nums);
    const max    = Math.max(...nums);
    const target = min + pct * (max - min);
    let closest = 0, minDiff = Infinity;
    eras.forEach((era, i) => {
      const d = Math.abs(era.yearNumeric - target);
      if (d < minDiff) { minDiff = d; closest = i; }
    });
    return closest;
  }
  function setHandlePos(pct) {
    TL_HANDLE.style.left    = `${pct * 100}%`;
    TL_PROGRESS.style.width = `${pct * 100}%`;
  }
  function hideHint() {
    if (S.hintShown) return;
    S.hintShown = true;
    SWIPE_HINT.classList.add('gone');
  }

  /* ═══════════════════════════════════════════════════════════
     PUZZLE — drag-and-drop layer ordering
     Correct order top→bottom: index 0..4 of PUZZLE_LAYERS
  ═══════════════════════════════════════════════════════════ */
  function initPuzzle() {
    S.puzzleSlots = new Array(PUZZLE_LAYERS.length).fill(null);
    renderPuzzleUI();
  }

  // Tiny silhouette of each gate layer — fills the slot when a piece is placed
  function getLayerSvg(layerId) {
    const c = '#c8a96e';
    switch (layerId) {
      case 'roof':
        return `<svg viewBox="0 0 70 32" width="62" height="28" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round">
          <path d="M5,26 Q35,4 65,26"/>
          <line x1="5" y1="26" x2="9" y2="22"/>
          <line x1="65" y1="26" x2="61" y2="22"/>
          <circle cx="35" cy="13" r="1.2" fill="${c}"/>
        </svg>`;
      case 'tower':
        return `<svg viewBox="0 0 70 32" width="62" height="28" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round">
          <rect x="10" y="6" width="50" height="22" rx="1"/>
          <rect x="18" y="12" width="8" height="9" fill="${c}" fill-opacity="0.22"/>
          <rect x="44" y="12" width="8" height="9" fill="${c}" fill-opacity="0.22"/>
        </svg>`;
      case 'arch':
        return `<svg viewBox="0 0 70 32" width="62" height="28" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round">
          <rect x="6" y="4" width="58" height="24" rx="1"/>
          <path d="M28,28 L28,18 Q35,10 42,18 L42,28" fill="${c}" fill-opacity="0.20"/>
        </svg>`;
      case 'wall':
        return `<svg viewBox="0 0 70 32" width="62" height="28" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round">
          <rect x="3" y="8" width="64" height="20" rx="1"/>
          <line x1="3"  y1="17" x2="67" y2="17" opacity="0.5"/>
          <line x1="20" y1="8"  x2="20" y2="17" opacity="0.5"/>
          <line x1="50" y1="8"  x2="50" y2="17" opacity="0.5"/>
          <line x1="12" y1="17" x2="12" y2="28" opacity="0.5"/>
          <line x1="35" y1="17" x2="35" y2="28" opacity="0.5"/>
          <line x1="58" y1="17" x2="58" y2="28" opacity="0.5"/>
        </svg>`;
      case 'canal':
        return `<svg viewBox="0 0 70 32" width="62" height="28" fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round" opacity="0.85">
          <path d="M3,12 Q15,6 27,12 T51,12 T75,12"/>
          <path d="M3,20 Q15,14 27,20 T51,20 T75,20"/>
          <path d="M3,28 Q15,22 27,28 T51,28 T75,28"/>
        </svg>`;
    }
    return '';
  }

  function renderPuzzleUI() {
    PUZZLE_WRAP.innerHTML = `
      <div class="pz-layout">
        <div class="pz-slots-col" id="pz-slots"></div>
        <div class="pz-tray-col">
          <p class="pz-tray-label">Pieces</p>
          <div class="pz-tray" id="pz-tray"></div>
        </div>
      </div>
      <div class="pz-actions">
        <button class="pz-btn pz-check" id="pz-check">Check Order</button>
        <button class="pz-btn pz-shuffle" id="pz-shuffle">Shuffle</button>
      </div>
      <div class="pz-feedback hidden" id="pz-feedback"></div>
      <div class="pz-success hidden" id="pz-success">
        <div class="pz-success-icon">✦</div>
        <p class="pz-success-title">Gate Restored</p>
        <p class="pz-success-sub">You've correctly ordered all five layers of Chang Gate from top to bottom.</p>
      </div>
    `;

    buildPzSlots();
    buildPzTray();

    document.getElementById('pz-check').addEventListener('click', checkPuzzle);
    document.getElementById('pz-shuffle').addEventListener('click', () => {
      S.puzzleSlots = new Array(PUZZLE_LAYERS.length).fill(null);
      S._trayOrder  = PUZZLE_LAYERS.map(l => l.id).sort(() => Math.random() - 0.5);
      S._selectedPiece = null;
      const fb = document.getElementById('pz-feedback');
      fb.classList.add('hidden');
      fb.textContent = '';
      document.getElementById('pz-success').classList.add('hidden');
      buildPzSlots();
      buildPzTray();
    });
  }

  function buildPzSlots() {
    const slotsEl = document.getElementById('pz-slots');
    if (!slotsEl) return;
    slotsEl.innerHTML = '';

    S.puzzleSlots.forEach((layerId, slotIdx) => {
      const slot = document.createElement('div');
      slot.className    = 'pz-slot';
      slot.dataset.slot = slotIdx;

      const numLabel = document.createElement('span');
      numLabel.className   = 'pz-slot-num';
      numLabel.textContent = slotIdx + 1;
      slot.appendChild(numLabel);

      if (layerId !== null) {
        const layer = PUZZLE_LAYERS.find(l => l.id === layerId);

        const glyph = document.createElement('div');
        glyph.className = 'pz-slot-glyph';
        glyph.innerHTML = getLayerSvg(layerId);
        slot.appendChild(glyph);

        const content = document.createElement('div');
        content.className = 'pz-slot-content';
        content.innerHTML = `<span class="pz-slot-name">${layer.name}</span><span class="pz-slot-zh">${layer.nameZh}</span>`;
        slot.appendChild(content);

        const removeBtn = document.createElement('button');
        removeBtn.className   = 'pz-remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', e => {
          e.stopPropagation();
          S.puzzleSlots[slotIdx] = null;
          clearSlotFeedback();
          buildPzSlots();
          buildPzTray();
        });
        slot.appendChild(removeBtn);
      } else {
        const empty = document.createElement('span');
        empty.className   = 'pz-slot-empty';
        empty.textContent = 'Drop here';
        slot.appendChild(empty);

        // Drag-over / drop
        slot.addEventListener('dragover', e => {
          e.preventDefault();
          slot.classList.add('pz-drag-over');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('pz-drag-over'));
        slot.addEventListener('drop', e => {
          e.preventDefault();
          slot.classList.remove('pz-drag-over');
          const layerId = e.dataTransfer.getData('layerId');
          const fromSlot = e.dataTransfer.getData('fromSlot');
          if (!layerId) return;
          // If came from another slot, clear it
          if (fromSlot !== '') {
            S.puzzleSlots[parseInt(fromSlot)] = null;
          }
          S.puzzleSlots[slotIdx] = layerId;
          clearSlotFeedback();
          buildPzSlots();
          buildPzTray();
        });

        // Touch tap-to-place (mobile)
        slot.addEventListener('click', () => {
          if (S._selectedPiece) {
            // Check piece not already in a slot
            const alreadyAt = S.puzzleSlots.indexOf(S._selectedPiece);
            if (alreadyAt !== -1) S.puzzleSlots[alreadyAt] = null;
            S.puzzleSlots[slotIdx] = S._selectedPiece;
            S._selectedPiece = null;
            clearSlotFeedback();
            buildPzSlots();
            buildPzTray();
          }
        });
      }

      // Allow piece in a slot to be dragged out
      if (layerId !== null) {
        slot.setAttribute('draggable', 'true');
        slot.addEventListener('dragstart', e => {
          e.dataTransfer.setData('layerId', layerId);
          e.dataTransfer.setData('fromSlot', String(slotIdx));
        });
      }

      slotsEl.appendChild(slot);
    });
  }

  function buildPzTray() {
    const tray = document.getElementById('pz-tray');
    if (!tray) return;
    tray.innerHTML = '';

    // Shuffle tray order on init only if all empty
    if (!S._trayOrder) {
      S._trayOrder = PUZZLE_LAYERS.map(l => l.id).sort(() => Math.random() - 0.5);
    }

    // Pieces not yet placed
    const placed = new Set(S.puzzleSlots.filter(Boolean));

    S._trayOrder.forEach(layerId => {
      if (placed.has(layerId)) return;
      const layer = PUZZLE_LAYERS.find(l => l.id === layerId);

      const piece = document.createElement('div');
      piece.className       = 'pz-piece';
      piece.draggable       = true;
      piece.dataset.layerId = layerId;

      piece.innerHTML = `
        <div class="pz-piece-inner">
          <span class="pz-piece-name">${layer.name}</span>
          <span class="pz-piece-zh">${layer.nameZh}</span>
        </div>
        <svg class="pz-piece-drag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="1.5" fill="currentColor"/><circle cx="15" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="9" cy="17" r="1.5" fill="currentColor"/><circle cx="15" cy="17" r="1.5" fill="currentColor"/>
        </svg>
      `;

      // Desktop drag
      piece.addEventListener('dragstart', e => {
        e.dataTransfer.setData('layerId', layerId);
        e.dataTransfer.setData('fromSlot', '');
        piece.classList.add('pz-dragging');
      });
      piece.addEventListener('dragend', () => piece.classList.remove('pz-dragging'));

      // Mobile tap-select
      piece.addEventListener('click', () => {
        if (S._selectedPiece === layerId) {
          S._selectedPiece = null;
          piece.classList.remove('pz-selected');
        } else {
          S._selectedPiece = layerId;
          tray.querySelectorAll('.pz-piece').forEach(p => p.classList.remove('pz-selected'));
          piece.classList.add('pz-selected');
        }
      });

      tray.appendChild(piece);
    });

    if (tray.children.length === 0) {
      const done = document.createElement('p');
      done.className   = 'pz-tray-done';
      done.textContent = 'All pieces placed';
      tray.appendChild(done);
    }
  }

  function clearSlotFeedback() {
    document.getElementById('pz-slots')?.querySelectorAll('.pz-slot').forEach(s => {
      s.classList.remove('pz-correct', 'pz-wrong');
    });
    const fb = document.getElementById('pz-feedback');
    if (fb) fb.classList.add('hidden');
    S._selectedPiece = null;
  }

  function checkPuzzle() {
    const fb      = document.getElementById('pz-feedback');
    const success = document.getElementById('pz-success');
    const slots   = document.getElementById('pz-slots');

    // All slots must be filled
    const N = PUZZLE_LAYERS.length;
    if (S.puzzleSlots.some(s => s === null)) {
      fb.classList.remove('hidden');
      fb.textContent = `Fill all ${N} slots before checking. (${S.puzzleSlots.filter(Boolean).length}/${N} placed)`;
      success.classList.add('hidden');
      return;
    }

    let correct = 0;
    S.puzzleSlots.forEach((layerId, i) => {
      const slotEl = slots.children[i];
      slotEl.classList.remove('pz-correct', 'pz-wrong');
      const isCorrect = layerId === PUZZLE_LAYERS[i].id;
      slotEl.classList.add(isCorrect ? 'pz-correct' : 'pz-wrong');
      if (isCorrect) correct++;
    });

    if (correct === PUZZLE_LAYERS.length) {
      fb.classList.add('hidden');
      success.classList.remove('hidden');
    } else {
      success.classList.add('hidden');
      fb.classList.remove('hidden');
      fb.textContent = `${correct} of ${PUZZLE_LAYERS.length} correct. Green = right position, red = wrong position.`;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     TREASURE HUNT
  ═══════════════════════════════════════════════════════════ */
  function initTreasure() {
    S.tFound = new Array(TREASURE_DATA.length).fill(false);
    S.tIndex = 0;
    renderTreasure();

    T_PREV.addEventListener('click', () => {
      if (S.tIndex > 0) { S.tIndex--; renderTreasure(); }
    });
    T_NEXT.addEventListener('click', () => {
      if (S.tIndex < TREASURE_DATA.length - 1) { S.tIndex++; renderTreasure(); }
    });
  }

  function renderTreasure() {
    const item  = TREASURE_DATA[S.tIndex];
    const era   = eras.find(e => e.id === item.eraId) || eras[S.tIndex];
    const found = S.tFound[S.tIndex];

    // Cancel any pending hint from the previous era and clear hint state
    if (S._tHintTimer) { clearTimeout(S._tHintTimer); S._tHintTimer = null; }
    T_HIT_ZONE.classList.remove('hint');

    T_CLUE.textContent      = found ? `✦ Found: ${item.relic}` : item.clue;
    T_ERA_LABEL.textContent = `${era.period} · ${era.year}`;

    // Photo load with placeholder
    T_PH_ZH.textContent         = era.placeholderZh || '';
    T_PLACEHOLDER.style.display = 'flex';
    T_PHOTO.style.opacity       = '0';

    const img   = new Image();
    img.onload  = () => {
      T_PHOTO.src           = era.photo;
      T_PHOTO.style.filter  = `sepia(${era.sepia * 0.6}) contrast(1.05) brightness(0.9)`;
      T_PHOTO.style.opacity = '1';
      T_PLACEHOLDER.style.display = 'none';
    };
    img.onerror = () => {
      T_PLACEHOLDER.style.display = 'flex';
    };
    img.src = era.photo;

    // Badge
    T_BADGE.textContent = `✦ ${item.relic}`;
    T_BADGE.classList.toggle('hidden', !found);

    // Hit zone (always present, just won't fire if already found)
    const z = item.zone;
    T_HIT_ZONE.style.left   = z.x + '%';
    T_HIT_ZONE.style.top    = z.y + '%';
    T_HIT_ZONE.style.width  = z.w + '%';
    T_HIT_ZONE.style.height = z.h + '%';
    T_HIT_ZONE.style.cursor = found ? 'default' : 'crosshair';
    T_HIT_ZONE.onclick      = found ? null : onRelicFound;

    // Nav
    T_PREV.disabled = S.tIndex === 0;
    T_NEXT.disabled = S.tIndex === TREASURE_DATA.length - 1;

    // Progress
    const count = S.tFound.filter(Boolean).length;
    T_PROGRESS.textContent = `${count} / ${TREASURE_DATA.length} found`;

    // After a few seconds of no progress, gently glow the hidden zone
    if (!found) {
      S._tHintTimer = setTimeout(() => {
        if (!S.tFound[S.tIndex]) T_HIT_ZONE.classList.add('hint');
      }, 6000);
    }
  }

  function onRelicFound() {
    S.tFound[S.tIndex] = true;
    const item  = TREASURE_DATA[S.tIndex];
    const count = S.tFound.filter(Boolean).length;

    if (S._tHintTimer) { clearTimeout(S._tHintTimer); S._tHintTimer = null; }
    T_HIT_ZONE.classList.remove('hint');

    T_BADGE.textContent = `✦ ${item.relic}`;
    T_BADGE.classList.remove('hidden');
    T_CLUE.textContent      = `✦ Found: ${item.relic}`;
    T_HIT_ZONE.onclick      = null;
    T_HIT_ZONE.style.cursor = 'default';
    T_PROGRESS.textContent  = `${count} / ${TREASURE_DATA.length} found`;

    launchFireworks();

    if (count === TREASURE_DATA.length) {
      setTimeout(() => {
        T_CLUE.textContent = '✦ All relics recovered! Chang Gate\'s history is complete.';
      }, 1800);
    }
  }

  /* ── Fireworks ──────────────────────────────────────────── */
  function launchFireworks() {
    const ctx  = FW_CANVAS.getContext('2d');
    const rect = FW_CANVAS.parentElement.getBoundingClientRect();
    FW_CANVAS.width  = rect.width;
    FW_CANVAS.height = rect.height;

    const COLORS = ['#c8a96e', '#e8d4a0', '#ffffff', '#f0c060', '#a8d8a8'];
    const bursts = [
      { cx: rect.width * 0.3, cy: rect.height * 0.35 },
      { cx: rect.width * 0.7, cy: rect.height * 0.25 },
      { cx: rect.width * 0.5, cy: rect.height * 0.45 }
    ];

    const particles = [];
    bursts.forEach(({ cx, cy }) => {
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40;
        const speed = 1.5 + Math.random() * 3.5;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          alpha: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 1.5 + Math.random() * 2.5
        });
      }
    });

    let rafId;
    function animate() {
      ctx.clearRect(0, 0, FW_CANVAS.width, FW_CANVAS.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.1;
        p.alpha -= 0.016;
        if (p.alpha > 0) {
          alive = true;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (alive) rafId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, FW_CANVAS.width, FW_CANVAS.height);
    }
    animate();
  }

  /* ═══════════════════════════════════════════════════════════
     MAP — Apple Maps-style with level buttons + smooth pan/zoom
  ═══════════════════════════════════════════════════════════ */
  function initMap() {
    renderMapLevel(S.mapLevel);

    // Level buttons
    document.querySelectorAll('.map-level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.dataset.level);
        setMapLevel(lvl);
      });
    });

    // Zoom controls
    document.getElementById('map-zoom-in').addEventListener('click', () => {
      setMapLevel(Math.min(S.mapLevel + 1, 2));
    });
    document.getElementById('map-zoom-out').addEventListener('click', () => {
      setMapLevel(Math.max(S.mapLevel - 1, 0));
    });

    // Click-to-zoom on pins (delegated, works across re-renders)
    MAP_SVG_WRAP.addEventListener('click', e => {
      const pin = e.target.closest('.map-pin-zoom');
      if (!pin) return;
      const lvl = parseInt(pin.dataset.zoomTo, 10);
      if (!isNaN(lvl)) setMapLevel(lvl);
    });
  }

  function setMapLevel(lvl) {
    S.mapLevel = lvl;

    document.querySelectorAll('.map-level-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.level) === lvl);
    });

    renderMapLevel(lvl);
  }

  function renderMapLevel(lvl) {
    // Animate out then in
    MAP_SVG_WRAP.style.opacity   = '0';
    MAP_SVG_WRAP.style.transform = 'scale(0.96)';
    setTimeout(() => {
      MAP_SVG_WRAP.innerHTML = lvl === 0 ? buildMapChina() :
                               lvl === 1 ? buildMapSuzhou() :
                                           buildMapDistrict();
      MAP_SVG_WRAP.style.opacity   = '1';
      MAP_SVG_WRAP.style.transform = 'scale(1)';
    }, 220);
  }

  function buildMapChina() {
    return `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="400" height="320" fill="#1c2a3a"/>
      <!-- Sea/water areas -->
      <rect width="400" height="320" fill="#1e3448" opacity="0.5"/>
      <!-- Grid -->
      ${Array.from({length:9},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="320" stroke="#ffffff" stroke-width="0.3" opacity="0.06"/>`).join('')}
      ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${i*54}" x2="400" y2="${i*54}" stroke="#ffffff" stroke-width="0.3" opacity="0.06"/>`).join('')}
      <!-- China landmass -->
      <path d="M55,38 L100,28 L165,22 L225,32 L285,26 L335,44 L362,72
               L372,104 L355,134 L338,154 L348,184 L328,214 L296,235
               L265,256 L235,266 L205,260 L175,270 L142,258 L118,242
               L95,222 L72,198 L55,172 L40,145 L36,115 L46,86 L55,60 Z"
            fill="#2d4a3e" stroke="#4a7a6a" stroke-width="1"/>
      <!-- Inner terrain texture -->
      <path d="M120,80 Q160,70 200,85 Q240,100 260,130 Q250,160 220,170 Q180,175 150,155 Q120,135 120,105 Z"
            fill="#2a5040" opacity="0.4"/>
      <!-- Jiangsu province -->
      <path d="M268,128 L302,122 L318,138 L312,168 L296,184 L274,178 L258,162 L260,138 Z"
            fill="#3a6a5a" stroke="#5aaa8a" stroke-width="1.2" stroke-dasharray="5 3"/>
      <text x="280" y="155" text-anchor="middle" fill="#5aaa8a" font-family="DM Sans,sans-serif" font-size="8" opacity="0.8">Jiangsu</text>
      <!-- Yangtze river -->
      <path d="M40,118 Q120,108 200,115 Q270,122 330,110 Q360,105 400,112"
            fill="none" stroke="#4488bb" stroke-width="3" opacity="0.6"/>
      <!-- Beijing dot -->
      <circle cx="268" cy="78" r="3" fill="#8ab4d4" opacity="0.6"/>
      <text x="274" y="81" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7.5" opacity="0.7">Beijing</text>
      <!-- Shanghai dot -->
      <circle cx="306" cy="162" r="3" fill="#8ab4d4" opacity="0.5"/>
      <text x="312" y="165" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7" opacity="0.5">Shanghai</text>
      <!-- Suzhou pin -->
      <g transform="translate(292,150)" class="map-pin-zoom" data-zoom-to="1" style="cursor:pointer">
        <circle r="14" fill="transparent"/>
        <circle r="10" fill="rgba(200,100,80,0.2)"/>
        <circle r="10" fill="none" stroke="#e05050" stroke-width="1" opacity="0.5">
          <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <path d="M0,-14 C-5,-14 -8,-10 -8,-6 C-8,2 0,10 0,10 C0,10 8,2 8,-6 C8,-10 5,-14 0,-14 Z"
              fill="#e05050" stroke="#ff7070" stroke-width="0.8"/>
        <circle cx="0" cy="-6" r="3" fill="white" opacity="0.9"/>
      </g>
      <text x="305" y="147" fill="#ff9090" font-family="DM Sans,sans-serif" font-size="8.5" font-weight="500">Suzhou</text>
      <text x="305" y="157" fill="#cc7070" font-family="DM Sans,sans-serif" font-size="7">苏州</text>
      <!-- Zoom hint box -->
      <rect x="258" y="120" width="70" height="68" rx="3"
            fill="none" stroke="#e05050" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
      <!-- Scale bar -->
      <g transform="translate(20,296)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="#8ab4d4" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#8ab4d4" stroke-width="1" opacity="0.6"/>
        <line x1="80" y1="-4" x2="80" y2="4" stroke="#8ab4d4" stroke-width="1" opacity="0.6"/>
        <text x="40" y="-6" text-anchor="middle" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7" opacity="0.6">500 km</text>
      </g>
    </svg>`;
  }

  function buildMapSuzhou() {
    return `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#1c2a3a"/>
      ${Array.from({length:17},(_,i)=>`<line x1="${i*25}" y1="0" x2="${i*25}" y2="320" stroke="#ffffff" stroke-width="0.3" opacity="0.07"/>`).join('')}
      ${Array.from({length:13},(_,i)=>`<line x1="0" y1="${i*27}" x2="400" y2="${i*27}" stroke="#ffffff" stroke-width="0.3" opacity="0.07"/>`).join('')}
      <!-- Taihu Lake -->
      <ellipse cx="140" cy="230" rx="100" ry="68"
               fill="#1e3448" stroke="#2a5070" stroke-width="1.2"/>
      <text x="140" y="233" text-anchor="middle" fill="#4a88aa" font-family="DM Sans,sans-serif" font-size="9" opacity="0.8">Taihu Lake · 太湖</text>
      <!-- Yangcheng Lake (east) -->
      <ellipse cx="310" cy="160" rx="35" ry="25"
               fill="#1e3448" stroke="#2a5070" stroke-width="0.8" opacity="0.7"/>
      <text x="310" y="163" text-anchor="middle" fill="#4a88aa" font-family="DM Sans,sans-serif" font-size="7" opacity="0.6">Yangcheng Lake</text>
      <!-- Grand Canal -->
      <path d="M220,0 Q224,80 226,160 Q228,240 224,320"
            fill="none" stroke="#2a6090" stroke-width="8" opacity="0.5"/>
      <path d="M220,0 Q224,80 226,160 Q228,240 224,320"
            fill="none" stroke="#4a90c0" stroke-width="1.5" opacity="0.4"/>
      <text x="234" y="80" fill="#4a90c0" font-family="DM Sans,sans-serif" font-size="7.5" opacity="0.7"
            transform="rotate(90,234,80)">Grand Canal · 大运河</text>
      <!-- Roads -->
      <line x1="0" y1="160" x2="400" y2="160" stroke="#2e3e4e" stroke-width="5"/>
      <line x1="200" y1="0" x2="200" y2="320" stroke="#2e3e4e" stroke-width="4"/>
      <line x1="0" y1="160" x2="400" y2="160" stroke="#4a5a6a" stroke-width="0.8" opacity="0.4"/>
      <!-- Suzhou old city wall ring -->
      <ellipse cx="248" cy="155" rx="46" ry="36"
               fill="rgba(50,80,60,0.2)" stroke="#5a9a7a" stroke-width="1.2"
               stroke-dasharray="6 3"/>
      <!-- Tiger Hill -->
      <g transform="translate(210,118)">
        <polygon points="0,-10 10,0 -10,0" fill="#7a6a4a" opacity="0.8"/>
        <circle r="5" fill="#9a8a6a" opacity="0.6"/>
      </g>
      <text x="222" y="113" fill="#9a8a6a" font-family="DM Sans,sans-serif" font-size="7.5" opacity="0.8">Tiger Hill · 虎丘</text>
      <!-- Hanshan Temple -->
      <circle cx="232" cy="178" r="5" fill="#2a5040" stroke="#5a9a7a" stroke-width="1"/>
      <text x="240" y="181" fill="#5a9a7a" font-family="DM Sans,sans-serif" font-size="7.5" opacity="0.8">Hanshan Temple · 寒山寺</text>
      <!-- Chang Gate pin -->
      <g transform="translate(234,152)" class="map-pin-zoom" data-zoom-to="2" style="cursor:pointer">
        <circle r="18" fill="transparent"/>
        <circle r="12" fill="rgba(200,100,80,0.15)"/>
        <circle r="12" fill="none" stroke="#e05050" stroke-width="1" opacity="0.4">
          <animate attributeName="r" from="10" to="20" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <path d="M0,-16 C-6,-16 -10,-11 -10,-7 C-10,2 0,12 0,12 C0,12 10,2 10,-7 C10,-11 6,-16 0,-16 Z"
              fill="#e05050" stroke="#ff7070" stroke-width="0.8"/>
        <circle cx="0" cy="-7" r="3.5" fill="white" opacity="0.9"/>
      </g>
      <text x="248" y="147" fill="#ff9090" font-family="DM Sans,sans-serif" font-size="9" font-weight="500">Chang Gate</text>
      <text x="248" y="158" fill="#cc7070" font-family="DM Sans,sans-serif" font-size="7.5">阊门</text>
      <!-- Zoom box hint -->
      <rect x="210" y="130" width="80" height="55" rx="3"
            fill="none" stroke="#e05050" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5"/>
      <!-- Scale -->
      <g transform="translate(16,298)">
        <line x1="0" y1="0" x2="70" y2="0" stroke="#8ab4d4" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#8ab4d4" stroke-width="1" opacity="0.5"/>
        <line x1="70" y1="-4" x2="70" y2="4" stroke="#8ab4d4" stroke-width="1" opacity="0.5"/>
        <text x="35" y="-6" text-anchor="middle" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7" opacity="0.5">5 km</text>
      </g>
      <!-- North -->
      <g transform="translate(376,22)">
        <circle r="13" fill="rgba(20,40,60,0.85)" stroke="#4a7a9a" stroke-width="0.8"/>
        <polygon points="0,-8 3,0 0,-2 -3,0" fill="#e05050"/>
        <polygon points="0,8 -3,0 0,2 3,0" fill="#8ab4d4" opacity="0.4"/>
        <text x="0" y="4" text-anchor="middle" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7" font-weight="500">N</text>
      </g>
    </svg>`;
  }

  function buildMapDistrict() {
    return `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#1c2a3a"/>
      ${Array.from({length:21},(_,i)=>`<line x1="${i*20}" y1="0" x2="${i*20}" y2="320" stroke="#ffffff" stroke-width="0.3" opacity="0.07"/>`).join('')}
      ${Array.from({length:17},(_,i)=>`<line x1="0" y1="${i*20}" x2="400" y2="${i*20}" stroke="#ffffff" stroke-width="0.3" opacity="0.07"/>`).join('')}
      <!-- Land background (city blocks) -->
      <rect width="400" height="320" fill="#243040" opacity="0.5"/>
      <!-- City blocks (rough grid of dark rectangles for urban feel) -->
      <rect x="110" y="30"  width="70"  height="40"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="200" y="30"  width="90"  height="35"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="310" y="30"  width="80"  height="50"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="110" y="100" width="55"  height="60"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="185" y="100" width="100" height="50"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="305" y="95"  width="90"  height="70"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="110" y="190" width="80"  height="80"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="210" y="195" width="80"  height="70"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <rect x="310" y="185" width="85"  height="80"  rx="2" fill="#1e2d3a" opacity="0.8"/>
      <!-- Western Ring Canal (main) -->
      <path d="M72,0 Q68,60 66,120 Q64,185 68,250 Q72,290 76,320"
            fill="none" stroke="#1e3f5a" stroke-width="14"/>
      <path d="M72,0 Q68,60 66,120 Q64,185 68,250 Q72,290 76,320"
            fill="none" stroke="#3a7aaa" stroke-width="2" opacity="0.5"/>
      <text x="30" y="160" fill="#4a8aba" font-family="DM Sans,sans-serif" font-size="6.5" opacity="0.7"
            transform="rotate(-90,30,160)">Western Ring Canal</text>
      <!-- Shantang Canal (diagonal) -->
      <path d="M76,152 Q130,118 180,96 Q214,80 240,68"
            fill="none" stroke="#1e3f5a" stroke-width="9"/>
      <path d="M76,152 Q130,118 180,96 Q214,80 240,68"
            fill="none" stroke="#3a7aaa" stroke-width="1.5" opacity="0.4"/>
      <!-- Shantang Street (road beside canal) -->
      <path d="M76,162 Q130,128 180,106 Q214,90 240,78"
            fill="none" stroke="#2e4054" stroke-width="5"/>
      <path d="M76,162 Q130,128 180,106 Q214,90 240,78"
            fill="none" stroke="#c8a96e" stroke-width="0.8" opacity="0.4"/>
      <text x="140" y="114" fill="#c8a96e" font-family="DM Sans,sans-serif" font-size="7"
            opacity="0.6" transform="rotate(-28,140,114)">Shantang Street · 山塘街</text>
      <!-- Main road (E-W) -->
      <rect x="0" y="155" width="400" height="10" fill="#263646"/>
      <line x1="0" y1="160" x2="400" y2="160" stroke="#c8a96e" stroke-width="0.6" opacity="0.2"/>
      <text x="340" y="153" fill="#8a9aaa" font-family="DM Sans,sans-serif" font-size="6.5" opacity="0.6">Cangjie Rd</text>
      <!-- City wall remnant -->
      <path d="M68,85 L70,235" stroke="#7a6a4a" stroke-width="4" opacity="0.4" stroke-dasharray="10 5"/>
      <text x="58" y="80" fill="#9a8a6a" font-family="DM Sans,sans-serif" font-size="6.5" opacity="0.5"
            transform="rotate(-90,58,80)">City Wall</text>
      <!-- Hanshan Temple -->
      <g transform="translate(148,208)">
        <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#1e3a2e" stroke="#4a8a6a" stroke-width="1"/>
        <path d="M-8,-8 Q0,-14 8,-8" fill="#2a5040" stroke="#4a8a6a" stroke-width="0.8"/>
      </g>
      <text x="160" y="205" fill="#5a9a7a" font-family="DM Sans,sans-serif" font-size="7" opacity="0.8">Hanshan Temple</text>
      <text x="160" y="214" fill="#4a8a6a" font-family="DM Sans,sans-serif" font-size="6.5" opacity="0.6">寒山寺</text>
      <!-- Tiger Hill -->
      <g transform="translate(240,62)">
        <polygon points="0,-12 12,4 -12,4" fill="#5a5040" opacity="0.8"/>
        <polygon points="0,-8 8,4 -8,4" fill="#7a6a4a" opacity="0.6"/>
      </g>
      <text x="254" y="60" fill="#9a8a6a" font-family="DM Sans,sans-serif" font-size="7" opacity="0.8">Tiger Hill · 虎丘</text>
      <!-- Chang Gate structure -->
      <g transform="translate(72,150)">
        <!-- Gate body -->
        <rect x="-22" y="-24" width="44" height="30" rx="2" fill="#2a3a4a" stroke="#c8a96e" stroke-width="1.5"/>
        <!-- Roof -->
        <path d="M-22,-24 Q0,-36 22,-24" fill="#3a4a5a" stroke="#c8a96e" stroke-width="1.2"/>
        <!-- Arch -->
        <path d="M-8,6 L-8,-4 Q0,-14 8,-4 L8,6 Z" fill="#1a2a3a" stroke="#c8a96e" stroke-width="1"/>
        <!-- Windows -->
        <rect x="-18" y="-18" width="8" height="7" rx="1" fill="#1a2a3a" stroke="#c8a96e" stroke-width="0.7" opacity="0.7"/>
        <rect x="10"  y="-18" width="8" height="7" rx="1" fill="#1a2a3a" stroke="#c8a96e" stroke-width="0.7" opacity="0.7"/>
        <!-- Pulse rings -->
        <circle r="28" fill="none" stroke="#e05050" stroke-width="1" opacity="0.3">
          <animate attributeName="r" from="20" to="36" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Pin dot -->
        <circle cy="-42" r="4" fill="#e05050"/>
        <circle cy="-42" r="2" fill="white" opacity="0.9"/>
        <line x1="0" y1="-38" x2="0" y2="-24" stroke="#e05050" stroke-width="1.2" opacity="0.7"/>
      </g>
      <!-- Chang Gate label callout -->
      <rect x="100" y="126" width="110" height="32" rx="5"
            fill="#111d28" stroke="#c8a96e" stroke-width="1"/>
      <text x="155" y="140" text-anchor="middle" fill="#ffb090" font-family="DM Sans,sans-serif" font-size="9" font-weight="500">Chang Gate · 阊门</text>
      <text x="155" y="152" text-anchor="middle" fill="#c8a96e" font-family="DM Sans,sans-serif" font-size="7" opacity="0.8">514 BCE — Present</text>
      <!-- Callout line -->
      <path d="M100,142 Q86,148 72,146" fill="none" stroke="#c8a96e" stroke-width="0.8" opacity="0.6"/>
      <!-- Scale -->
      <g transform="translate(290,300)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="#8ab4d4" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#8ab4d4" stroke-width="1" opacity="0.5"/>
        <line x1="80" y1="-4" x2="80" y2="4" stroke="#8ab4d4" stroke-width="1" opacity="0.5"/>
        <text x="40" y="-6" text-anchor="middle" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7" opacity="0.5">500 m</text>
      </g>
      <!-- North arrow -->
      <g transform="translate(376,22)">
        <circle r="13" fill="rgba(20,40,60,0.9)" stroke="#4a7a9a" stroke-width="0.8"/>
        <polygon points="0,-8 3,0 0,-2 -3,0" fill="#e05050"/>
        <polygon points="0,8 -3,0 0,2 3,0" fill="#8ab4d4" opacity="0.4"/>
        <text x="0" y="4" text-anchor="middle" fill="#8ab4d4" font-family="DM Sans,sans-serif" font-size="7" font-weight="500">N</text>
      </g>
    </svg>`;
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT
  ═══════════════════════════════════════════════════════════ */
  CHAT_FAB.addEventListener('click', openChat);
  CHAT_CLOSE.addEventListener('click', closeChat);
  CHAT_BACKDROP.addEventListener('click', closeChat);
  CHAT_SEND.addEventListener('click', sendChat);
  CHAT_INPUT.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

  CHAT_CHIPS.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    CHAT_CHIPS.remove();
    sendMessage(chip.getAttribute('data-q'));
  });

  function openChat() {
    S.chatOpen = true;
    CHAT_PANEL.classList.remove('hidden');
    CHAT_BACKDROP.classList.remove('hidden');
    CHAT_FAB.style.display = 'none';
    setTimeout(() => CHAT_INPUT.focus(), 350);
  }
  function closeChat() {
    S.chatOpen = false;
    CHAT_PANEL.classList.add('hidden');
    CHAT_BACKDROP.classList.add('hidden');
    CHAT_FAB.style.display = '';
  }
  async function sendChat() {
    const text = CHAT_INPUT.value.trim();
    if (!text) return;
    CHAT_INPUT.value = '';
    sendMessage(text);
  }
  async function sendMessage(text) {
    appendMsg('user', text);
    const thinking = appendThinking();

    // Brief delay so the response feels considered, not instant
    await new Promise(r => setTimeout(r, 450 + Math.random() * 350));

    const reply = answerLocally(text);
    thinking.remove();
    appendMsg('assistant', reply);
  }

  function answerLocally(text) {
    const q = text.toLowerCase();

    // Score each KB entry by total length of matched keys (longer keys = more specific)
    let best = { score: 0, entry: null };
    for (const entry of CHAT_KB) {
      let score = 0;
      for (const key of entry.keys) {
        if (q.includes(key.toLowerCase())) score += key.length;
      }
      if (score > best.score) best = { score, entry };
    }
    if (best.entry) return best.entry.answer;

    // Fallback: match a dynasty/era keyword and return that era's info
    const eraMatch = eras.find(era => {
      const id    = era.id.toLowerCase();
      const first = era.period.toLowerCase().split(/[ &]/)[0];
      return q.includes(id) || (first.length > 3 && q.includes(first));
    });
    if (eraMatch) {
      return `${eraMatch.info.title}\n\n${eraMatch.info.body}`;
    }

    // Default: suggest topics
    return "I can tell you about Chang Gate's founding by Wu Zixu, the Tang poet Zhang Ji and the Maple Bridge poem, the Song-era Pingjiang Map, Ming fortifications, the Taiping Rebellion, the Grand Canal, Suzhou's silk trade, Hanshan Temple, Shantang Street, the classical gardens, or the gate's modern restoration. What would you like to explore?";
  }

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    text.split('\n\n').forEach(para => {
      if (!para.trim()) return;
      const p = document.createElement('p');
      p.textContent = para.trim();
      div.appendChild(p);
    });
    CHAT_MSGS.appendChild(div);
    CHAT_MSGS.scrollTop = CHAT_MSGS.scrollHeight;
    return div;
  }
  function appendThinking() {
    const div = document.createElement('div');
    div.className = 'chat-msg thinking';
    div.innerHTML = `<span class="thinking-dots"><span>·</span><span>·</span><span>·</span></span>`;
    CHAT_MSGS.appendChild(div);
    CHAT_MSGS.scrollTop = CHAT_MSGS.scrollHeight;
    return div;
  }

})();
