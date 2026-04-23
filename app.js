(async function() {
  const LOADER = document.getElementById('loading-screen');
  const APP = document.getElementById('app');
  const ERA_PERIOD = document.getElementById('era-period');
  const ERA_YEAR = document.getElementById('era-year');
  const MAIN_PHOTO = document.getElementById('main-photo');
  const PHOTO_FRAME = document.getElementById('photo-frame');
  const INFO_TRIGGER = document.getElementById('info-trigger');
  const INFO_CARD = document.getElementById('info-card');
  const INFO_CLOSE = document.getElementById('info-close');
  const INFO_TITLE = document.getElementById('info-title');
  const INFO_BODY = document.getElementById('info-body');
  const INFO_SOURCE = document.getElementById('info-source');
  const NAV_PREV = document.getElementById('nav-prev');
  const NAV_NEXT = document.getElementById('nav-next');
  const TIMELINE_TRACK = document.getElementById('timeline-track');
  const TIMELINE_PROGRESS = document.getElementById('timeline-progress');
  const TIMELINE_HANDLE = document.getElementById('timeline-handle');
  const ERA_DOTS = document.getElementById('era-dots');
  const DOT_NAV = document.getElementById('dot-nav');
  const DOT_LABELS = document.getElementById('dot-labels'); // maybe not used
  const CAPTION_TEXT = document.getElementById('caption-text');
  const PHOTO_COUNTER = document.getElementById('photo-counter');
  const TL_START = document.getElementById('tl-start');
  const TL_END = document.getElementById('tl-end');
  const SWIPE_HINT = document.getElementById('swipe-hint');

  let data;
  let eras = [];
  let currentIndex = 0;
  let isDragging = false;
  let hintShown = false;

  // Embedded fallback data so the app works when opened locally (file://)
  const FALLBACK_DATA = {
    "landmark": {
      "name": "Chang Gate",
      "chineseName": "阊门",
      "city": "Suzhou",
      "country": "China",
      "coordinates": { "lat": 31.3133, "lng": 120.5736 }
    },
    "eras": [
      {
        "id": "han-dynasty",
        "period": "Western Han Dynasty",
        "year": "c. 202 BCE",
        "yearNumeric": -202,
        "photo": "images/era_han.jpg",
        "photoAlt": "Artistic reconstruction of Chang Gate during Western Han Dynasty",
        "caption": "First constructed as a grand western gate of the ancient city of Gusu.",
        "sepia": 0.9,
        "info": {
          "title": "Origins — The Gate of Wu",
          "body": "Chang Gate traces its origins to the ancient city of Gusu, founded during the Spring and Autumn period. Under the Han Dynasty it served as one of the eight great gates of Suzhou's city wall, guarding the vital waterway route westward toward the Grand Canal. Merchants, soldiers and scholars passed beneath its arch for generations.",
          "source": "Suzhou Municipal Museum, Historical Records"
        }
      },
      {
        "id": "tang-dynasty",
        "period": "Tang Dynasty",
        "year": "c. 618–907 CE",
        "yearNumeric": 700,
        "photo": "images/era_tang.jpg",
        "photoAlt": "Chang Gate area during the Tang Dynasty",
        "caption": "The gate district flourished as a thriving commercial hub along the Grand Canal.",
        "sepia": 0.8,
        "info": {
          "title": "Tang Prosperity — A City of Silk",
          "body": "During the Tang dynasty Suzhou was renowned across the empire for its silk weaving and canal commerce. Chang Gate stood at the city's busiest waterfront quarter. Poet Zhang Ji's famous verse 'Maple Bridge Night Mooring' was written just outside these walls, immortalising the sound of Hanshan Temple's bell drifting across the water at midnight.",
          "source": "Tang Poetry Archive; Zhang Ji, 'Fēng Qiáo Yè Bó' (楓橋夜泊)"
        }
      },
      {
        "id": "song-dynasty",
        "period": "Song Dynasty",
        "year": "c. 960–1279 CE",
        "yearNumeric": 1100,
        "photo": "images/era_song.jpg",
        "photoAlt": "Chang Gate during the prosperous Song Dynasty",
        "caption": "Expanded city walls and a grand double-arched gate tower were constructed.",
        "sepia": 0.75,
        "info": {
          "title": "Song Expansion — The Double Tower",
          "body": "The Song era brought major reconstruction to Chang Gate, adding the distinctive double-tower gatehouse that would define its silhouette for centuries. The canal district outside the gate became one of the wealthiest commercial quarters in all of southern China, with warehouses for silk, ceramics and grain lining the waterfront.",
          "source": "Pingjiang Map (平江圖), 1229 CE — oldest surviving city map of Suzhou"
        }
      },
      {
        "id": "ming-dynasty",
        "period": "Ming Dynasty",
        "year": "c. 1368–1644 CE",
        "yearNumeric": 1500,
        "photo": "images/era_ming.jpg",
        "photoAlt": "Chang Gate's grand Ming Dynasty fortifications",
        "caption": "Massive fortification upgrades transformed Chang Gate into a formidable military bastion.",
        "sepia": 0.65,
        "info": {
          "title": "Ming Fortification — Walls of Stone",
          "body": "The Ming dynasty oversaw ambitious expansions of Suzhou's city walls, reinforcing Chang Gate with thick granite masonry and a deep defensive moat. The gate complex grew to include watchtowers and garrison barracks. Despite its military might, the surrounding neighbourhood remained a centre for commerce and the arts — garden culture flourished just inside the walls.",
          "source": "Ming Shilu (明實錄), Suzhou Gazetteer"
        }
      },
      {
        "id": "qing-dynasty-1800s",
        "period": "Qing Dynasty",
        "year": "c. 1860s–1890s",
        "yearNumeric": 1875,
        "photo": "images/era_qing.jpg",
        "photoAlt": "Historical photograph of Chang Gate circa 1880",
        "caption": "Early photographs capture the gate in its Qing-era form — battered but still standing.",
        "sepia": 0.5,
        "info": {
          "title": "Qing Decline — Cameras Arrive",
          "body": "The Taiping Rebellion (1850–64) left Suzhou in ruins. Chang Gate suffered serious damage during the conflict but was partially restored under the late Qing. Western missionaries and photographers arrived in the 1870s–90s, leaving behind some of the earliest photographs of the gate and its canal environs — remarkable documents of a city caught between its ancient past and an uncertain modern future.",
          "source": "John Thomson photographic archive, c. 1870; Suzhou City Archives"
        }
      },
      {
        "id": "republic-era",
        "period": "Republic of China",
        "year": "1912–1949",
        "yearNumeric": 1930,
        "photo": "images/era_republic.jpg",
        "photoAlt": "Chang Gate area in the Republican era",
        "caption": "Modernisation transformed the canal banks while the ancient gate stood witness.",
        "sepia": 0.35,
        "info": {
          "title": "Republican Suzhou — Old Meets New",
          "body": "The early twentieth century brought roads, trams and electricity to Suzhou. Much of the original city wall was demolished during this period to make way for modern roads, but Chang Gate and its adjacent wall sections were preserved. The canal district outside continued its centuries-old commercial life alongside new factories and Western-style shophouses.",
          "source": "Suzhou Municipal Archives, 1920s–40s survey photographs"
        }
      },
      {
        "id": "modern",
        "period": "Contemporary",
        "year": "Present day",
        "yearNumeric": 2024,
        "photo": "images/era_modern.jpg",
        "photoAlt": "Chang Gate today, restored as a heritage landmark",
        "caption": "Restored and designated a national heritage site, Chang Gate welcomes visitors from around the world.",
        "sepia": 0.0,
        "info": {
          "title": "Heritage Today — 阊门 Restored",
          "body": "Chang Gate was declared a national heritage site and underwent comprehensive restoration in the 1990s and 2000s. Today the gate tower and a section of the original city wall stand as the centrepiece of a public park. The surrounding Shantang Street canal district — running from the gate westward to Tiger Hill — has been restored as a living heritage quarter of traditional shops, teahouses and gardens.",
          "source": "Suzhou Heritage Conservation Bureau, 2010"
        }
      }
    ]
  };

  // Try fetch first (for server environments), fall back to embedded data (for file://)
  try {
    const res = await fetch('photos.json');
    if (!res.ok) throw new Error('Failed to load photos.json');
    data = await res.json();
    eras = data.eras;
  } catch (e) {
    console.warn('Fetch failed (likely CORS on file://). Using embedded fallback data.', e);
    data = FALLBACK_DATA;
    eras = data.eras;
  }

  // Preload images
  const imagePromises = eras.map(era => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // don't block on error
      img.src = era.photo;
    });
  });

  await Promise.all(imagePromises);

  // Initialize UI
  initTimeline();
  initDotNav();
  updateUI(0, 'none');

  // Reveal app
  LOADER.classList.add('fade-out');
  setTimeout(() => {
    LOADER.classList.add('hidden');
    APP.classList.remove('hidden');
  }, 600);

  // Event listeners
  NAV_PREV.addEventListener('click', () => {
    if (currentIndex > 0) updateUI(currentIndex - 1, 'right');
  });
  NAV_NEXT.addEventListener('click', () => {
    if (currentIndex < eras.length - 1) updateUI(currentIndex + 1, 'left');
  });

  INFO_TRIGGER.addEventListener('click', () => {
    INFO_CARD.classList.remove('hidden');
  });
  INFO_CLOSE.addEventListener('click', () => {
    INFO_CARD.classList.add('hidden');
  });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) updateUI(currentIndex - 1, 'right');
    if (e.key === 'ArrowRight' && currentIndex < eras.length - 1) updateUI(currentIndex + 1, 'left');
    if (e.key === 'Escape') INFO_CARD.classList.add('hidden');
  });

  // Swipe detection
  let touchStartX = 0;
  let touchEndX = 0;
  PHOTO_FRAME.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  PHOTO_FRAME.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  // Also mouse drag for desktop swipe feel? Could add mousedown/mouseup.
  let mouseDownX = 0;
  PHOTO_FRAME.addEventListener('mousedown', (e) => {
    mouseDownX = e.screenX;
  });
  PHOTO_FRAME.addEventListener('mouseup', (e) => {
    const diff = mouseDownX - e.screenX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && currentIndex < eras.length - 1) updateUI(currentIndex + 1, 'left');
      if (diff < 0 && currentIndex > 0) updateUI(currentIndex - 1, 'right');
      hideHint();
    }
  });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && currentIndex < eras.length - 1) updateUI(currentIndex + 1, 'left');
      if (diff < 0 && currentIndex > 0) updateUI(currentIndex - 1, 'right');
      hideHint();
    }
  }

  // Timeline interactions
  TIMELINE_TRACK.addEventListener('click', (e) => {
    if (e.target.closest('.timeline-handle')) return;
    const rect = TIMELINE_TRACK.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const targetIndex = getIndexFromPct(pct);
    const dir = targetIndex > currentIndex ? 'left' : 'right';
    updateUI(targetIndex, dir);
    hideHint();
  });

  // Timeline drag
  TIMELINE_HANDLE.addEventListener('mousedown', startDrag);
  TIMELINE_HANDLE.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    isDragging = true;
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = TIMELINE_TRACK.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setHandleAndProgress(pct);
  }

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
    const rect = TIMELINE_TRACK.getBoundingClientRect();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const targetIndex = getIndexFromPct(pct);
    const dir = targetIndex > currentIndex ? 'left' : 'right';
    updateUI(targetIndex, dir);
    hideHint();
  }

  // Helper functions
  function initTimeline() {
    const years = eras.map(e => e.yearNumeric);
    const min = Math.min(...years);
    const max = Math.max(...years);
    TL_START.textContent = eras[0].year;
    TL_END.textContent = eras[eras.length - 1].year;

    // Create era dots
    ERA_DOTS.innerHTML = '';
    eras.forEach((era, i) => {
      const dot = document.createElement('div');
      dot.className = 'era-dot-mark';
      dot.style.left = `${percentForYear(era.yearNumeric)}%`;
      dot.dataset.index = i;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const dir = i > currentIndex ? 'left' : 'right';
        updateUI(i, dir);
        hideHint();
      });
      ERA_DOTS.appendChild(dot);
    });
  }

  function initDotNav() {
    DOT_NAV.innerHTML = '';
    eras.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Era ${i + 1}`);
      btn.addEventListener('click', () => {
        const dir = i > currentIndex ? 'left' : 'right';
        updateUI(i, dir);
        hideHint();
      });
      DOT_NAV.appendChild(btn);
    });
  }

  function percentForYear(year) {
    const years = eras.map(e => e.yearNumeric);
    const min = Math.min(...years);
    const max = Math.max(...years);
    if (max === min) return 0;
    return ((year - min) / (max - min)) * 100;
  }

  function getIndexFromPct(pct) {
    // Find closest era by year position
    const years = eras.map(e => e.yearNumeric);
    const min = Math.min(...years);
    const max = Math.max(...years);
    const targetYear = min + pct * (max - min);
    let closest = 0;
    let minDiff = Infinity;
    eras.forEach((era, i) => {
      const diff = Math.abs(era.yearNumeric - targetYear);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });
    return closest;
  }

  function setHandleAndProgress(pct) {
    TIMELINE_HANDLE.style.left = `${pct * 100}%`;
    TIMELINE_PROGRESS.style.width = `${pct * 100}%`;
  }

  function updateUI(index, direction) {
    if (index === currentIndex && direction !== 'none') return;
    const prevIndex = currentIndex;
    currentIndex = index;

    const era = eras[index];

    // Update text with flash animation
    ERA_PERIOD.textContent = era.period;
    ERA_YEAR.textContent = era.year;
    ERA_PERIOD.classList.remove('flash');
    ERA_YEAR.classList.remove('flash');
    void ERA_PERIOD.offsetWidth; // trigger reflow
    ERA_PERIOD.classList.add('flash');
    ERA_YEAR.classList.add('flash');

    // Update photo
    MAIN_PHOTO.classList.add('transitioning');
    if (direction && direction !== 'none') {
      PHOTO_FRAME.classList.remove('slide-left', 'slide-right');
      void PHOTO_FRAME.offsetWidth;
      PHOTO_FRAME.classList.add(`slide-${direction}`);
    }

    setTimeout(() => {
      MAIN_PHOTO.src = era.photo;
      MAIN_PHOTO.alt = era.photoAlt;
      MAIN_PHOTO.style.filter = `sepia(${era.sepia}) contrast(1.05) brightness(0.92)`;
      MAIN_PHOTO.classList.remove('transitioning');
    }, direction === 'none' ? 0 : 200);

    // Update caption and counter
    CAPTION_TEXT.textContent = era.caption;
    PHOTO_COUNTER.textContent = `${index + 1} / ${eras.length}`;

    // Update info card content
    INFO_TITLE.textContent = era.info.title;
    INFO_BODY.textContent = era.info.body;
    INFO_SOURCE.textContent = era.info.source;

    // Update timeline
    const pct = percentForYear(era.yearNumeric) / 100;
    setHandleAndProgress(pct);

    // Update dots
    const dots = ERA_DOTS.querySelectorAll('.era-dot-mark');
    dots.forEach((d, i) => d.classList.toggle('active', i === index));

    const dotBtns = DOT_NAV.querySelectorAll('.dot-btn');
    dotBtns.forEach((b, i) => {
      b.classList.toggle('active', i === index);
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Update nav buttons
    NAV_PREV.disabled = index === 0;
    NAV_NEXT.disabled = index === eras.length - 1;

    // Hide info card on era change? Optional. Let's keep it open if user wants? But probably close it.
    INFO_CARD.classList.add('hidden');
  }

  function hideHint() {
    if (!hintShown) {
      hintShown = true;
      SWIPE_HINT.classList.add('gone');
    }
  }
})();
