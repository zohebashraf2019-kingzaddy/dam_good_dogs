/* Dam Good Dogs — site interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TZ = 'America/Los_Angeles';

  /* ---------- Year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Logo → back to top ---------- */
  $$('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
    toggle?.setAttribute('aria-expanded', 'false');
    mnav?.classList.remove('is-open');
  }));

  /* ---------- Mobile nav ---------- */
  const toggle = $('.nav__toggle');
  const mnav = $('#mobile-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    mnav.classList.toggle('is-open', !open);
  });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    mnav.classList.remove('is-open');
  }));

  /* ---------- Reno-time helpers ---------- */
  const renoParts = () => {
    const p = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', hour12: false
    }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t)?.value;
    return { weekday: g('weekday'), iso: `${g('year')}-${g('month')}-${g('day')}`, hour: parseInt(g('hour'), 10) % 24 };
  };

  /* ---------- Weekly schedule + today status ---------- */
  const SCHEDULE = {
    Mon: null,
    Tue: { spot: 'The Courthouse · S Virginia & Court', time: 'from 10 AM' },
    Wed: { spot: 'The Courthouse · S Virginia & Court', time: 'from 10 AM' },
    Thu: { spot: 'Buzzed Coffee, the Courthouse or Midtown', time: 'check Stories for today\'s spot' },
    Fri: null, Sat: null, Sun: null
  };
  // Dated pop-ups (override the weekly default on that day)
  const POPUPS = {
    '2026-11-18': { spot: 'Next to the Courthouse', time: '10 AM – 2 PM' },
    '2026-11-19': { spot: 'Buzzed Coffee · 941 N. Virginia St., Suite B', time: '12 PM – 4 PM' }
  };

  const now = renoParts();
  $$('.day').forEach(d => d.classList.toggle('is-today', d.dataset.day === now.weekday));
  const todayCard = $('.day.is-today');
  if (todayCard && window.innerWidth < 960) {
    const week = $('#week');
    week.scrollLeft = todayCard.offsetLeft - week.clientWidth / 2 + todayCard.clientWidth / 2;
  }

  const status = $('#today-status');
  const today = POPUPS[now.iso] || SCHEDULE[now.weekday];
  if (status) {
    const txt = $('.status__text', status);
    if (today) {
      const afterSundown = now.hour >= 19;
      if (afterSundown) {
        txt.textContent = `Wrapped for today — see you tomorrow. Spots posted in Stories.`;
      } else {
        status.classList.add('is-live');
        txt.textContent = `Today: ${today.spot} · ${today.time}`;
      }
    } else {
      txt.textContent = 'Off the street today — pop-ups & catering. Check our Stories!';
    }
  }

  // Hide past pop-ups
  const popups = $$('.popup[data-date]');
  let visiblePopups = 0;
  popups.forEach(p => {
    if (p.dataset.date < now.iso) p.remove(); else visiblePopups++;
  });
  if (popups.length && !visiblePopups) {
    $('.popups__grid')?.remove();
    const e = $('.popups__empty'); if (e) e.hidden = false;
  }

  /* ---------- Active nav link on scroll ---------- */
  const links = $$('.nav__links a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navIO.observe(s));

    /* ---------- Reveal on scroll ---------- */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Hero video: pause when off-screen / reduced motion ---------- */
  const heroVid = $('.hero__video');
  if (heroVid) {
    if (reduceMotion) { heroVid.removeAttribute('autoplay'); heroVid.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { e.isIntersecting ? heroVid.play().catch(() => {}) : heroVid.pause(); }).observe(heroVid);
    }
  }

  /* ---------- Video cards ---------- */
  const vcards = $$('.vcard');
  vcards.forEach(card => {
    const v = $('video', card);
    const btn = $('.vcard__play', card);
    btn.addEventListener('click', () => {
      vcards.forEach(o => { if (o !== card) { $('video', o).pause(); } });
      v.controls = true;
      v.play().catch(() => {});
    });
    v.addEventListener('play', () => {
      card.classList.add('is-playing');
      vcards.forEach(o => { if (o !== card) $('video', o).pause(); });
      heroVid?.pause();
    });
    v.addEventListener('pause', () => { if (v.ended || v.paused) card.classList.toggle('is-playing', !v.paused); });
    v.addEventListener('ended', () => { card.classList.remove('is-playing'); v.controls = false; v.currentTime = 0; });
  });

  /* ---------- Slot machine ---------- */
  const SYMBOLS = [
    { e: '🧀', t: 'Cheddar' },
    { e: '🍅', t: 'Diced tomatoes' },
    { e: '🧅', t: 'Onions' },
    { e: '🌶️', t: 'Jalapeños' },
    { e: '🥒', t: 'Relish' },
    { e: '🔥', t: "Flamin' Hot Cheetos" },
    { e: '🌭', t: 'Mustard & ketchup' },
    { e: '🍲', t: 'Chili (+$1)', chili: true },
    { e: '7', t: 'Lucky 7', seven: true }
  ];
  const reels = $$('.machine__reel ul');
  const result = $('#slot-result');
  const spinBtn = $('#spin-btn');
  const lever = $('#spin-lever');
  const machine = $('.machine');
  let reelH = 132;
  let spinning = false;

  const li = s => `<li><b class="${s.seven ? 'seven' : ''}">${s.e}</b><small>${s.t}</small></li>`;
  const pick = () => {
    // Lucky 7 shows up a bit more often than pure chance so jackpots actually happen
    const r = Math.random();
    if (r < 0.2) return SYMBOLS[SYMBOLS.length - 1];
    return SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))];
  };
  const measure = () => { const first = $('.machine__reel'); if (first) reelH = first.clientHeight; };
  reels.forEach((ul, i) => { ul.innerHTML = li(SYMBOLS[[8, 0, 5][i]]); });

  const spin = () => {
    if (spinning) return;
    spinning = true; measure();
    spinBtn.disabled = true;
    machine.classList.remove('is-jackpot');
    lever.classList.add('is-pulled');
    setTimeout(() => lever.classList.remove('is-pulled'), 350);
    result.textContent = 'Spinning…';

    const finals = [pick(), pick(), pick()];
    const done = reels.map((ul, i) => new Promise(res => {
      const count = 18 + i * 7;
      const current = ul.lastElementChild ? ul.lastElementChild.outerHTML : '';
      let html = current;
      for (let k = 0; k < count; k++) html += li(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      html += li(finals[i]);
      ul.style.transition = 'none';
      ul.style.transform = 'translateY(0)';
      ul.innerHTML = html;
      const dist = (ul.children.length - 1) * reelH;
      const dur = reduceMotion ? 1 : 1400 + i * 450;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ul.style.transition = `transform ${dur}ms cubic-bezier(.12,.75,.25,1.03)`;
        ul.style.transform = `translateY(-${dist}px)`;
      }));
      setTimeout(() => {
        ul.style.transition = 'none';
        ul.innerHTML = li(finals[i]);
        ul.style.transform = 'translateY(0)';
        res();
      }, dur + 60);
    }));

    Promise.all(done).then(() => {
      spinning = false; spinBtn.disabled = false;
      const sevens = finals.filter(f => f.seven).length;
      if (sevens === 3) {
        machine.classList.add('is-jackpot');
        result.innerHTML = '<strong>7 · 7 · 7 — JACKPOT!</strong> Screenshot it and tag @dam_good_dogs 🎉';
        return;
      }
      const tops = [...new Set(finals.filter(f => !f.seven).map(f => f.t))];
      const hasChili = finals.some(f => f.chili);
      const list = tops.length ? tops.join(' + ') : 'Everything on the cart';
      const extra = sevens ? ` (+${sevens === 1 ? 'a' : 'two'} lucky 7${sevens > 1 ? 's' : ''} 🍀)` : '';
      result.innerHTML = `Your Jackpot Dog: <strong>${list}</strong>${extra}<br>${hasChili ? '$7.77 + $1 for chili.' : 'All included for $7.77.'}`;
    });
  };
  spinBtn?.addEventListener('click', spin);
  lever?.addEventListener('click', spin);
  window.addEventListener('resize', measure);

  /* ---------- Gallery lightbox ---------- */
  const shots = $$('.shot');
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  let idx = 0, lastFocus = null;
  const show = i => {
    idx = (i + shots.length) % shots.length;
    const img = $('img', shots[idx]);
    lbImg.src = shots[idx].dataset.full;
    lbImg.alt = img.alt;
  };
  const openLB = i => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lightbox__close', lb).focus(); };
  const closeLB = () => { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); };
  shots.forEach((s, i) => s.addEventListener('click', () => openLB(i)));
  $('.lightbox__close', lb).addEventListener('click', closeLB);
  $('.lightbox__prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lightbox__next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });

  /* ---------- Toast + copy hashtag ---------- */
  const toast = $('#toast');
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('.copy-tag').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); say(`${b.dataset.copy} copied!`); }
    catch { say(b.dataset.copy); }
  }));

  /* ---------- Catering form → email ---------- */
  const form = $('#catering-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get('name') || '').toString().trim();
    const nameInput = form.elements.name;
    if (!name) { nameInput.classList.add('invalid'); nameInput.focus(); say('Please add your name'); return; }
    nameInput.classList.remove('invalid');
    const lines = [
      `Name: ${name}`,
      `Phone: ${f.get('phone') || '-'}`,
      `Event date: ${f.get('date') || '-'}`,
      `Guests: ${f.get('guests') || '-'}`,
      `Location: ${f.get('location') || '-'}`,
      '',
      (f.get('details') || '').toString()
    ];
    const subject = `Catering request – ${name}${f.get('date') ? ' – ' + f.get('date') : ''}`;
    window.location.href = `mailto:damgooddogs@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    say('Opening your email app…');
  });
})();
