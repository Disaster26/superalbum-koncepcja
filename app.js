(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const toast = $('#toast'); let tt;
  const pokazToast = t => { toast.textContent = t; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 3400); };
  $$('[data-pokaz]').forEach(b => b.addEventListener('click', () => pokazToast(b.dataset.pokaz)));

  /* wysokość nagłówka -> pierwszy ekran kończy się równo z ekranem */
  const hdr = () => document.documentElement.style.setProperty('--hdr', $('.top').offsetHeight + 'px');
  hdr(); addEventListener('resize', hdr);

  /* menu mobilne */
  const burger = $('.burger'), menu = $('#menu-mob');
  const zamknij = () => { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); document.body.style.overflow = ''; };
  burger.addEventListener('click', () => {
    const otw = menu.hidden;
    if (otw) menu.style.setProperty('--mm-top', $('.top').getBoundingClientRect().bottom + 'px');
    menu.hidden = !otw; burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
    document.body.style.overflow = otw ? 'hidden' : '';
  });
  $$('a', menu).forEach(a => a.addEventListener('click', zamknij));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) zamknij(); });
  addEventListener('resize', () => { if (innerWidth > 1180 && !menu.hidden) zamknij(); });

  /* dolny pasek dopiero po przewinięciu za przycisk z pierwszego ekranu */
  const pasek = $('#mob-pasek'), cta = $('#hero-cta');
  if (pasek && cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      const pokaz = !e.isIntersecting && e.boundingClientRect.top < 0;
      pasek.classList.toggle('widac', pokaz);
      pasek.setAttribute('aria-hidden', String(!pokaz));
      $$('a', pasek).forEach(a => a.tabIndex = pokaz ? 0 : -1);
    }).observe(cta);
  }

  /* galerie w kartach: palec, mysz, strzałki, kropki */
  const strz = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'}"/></svg>`;
  $$('.galeria').forEach(g => {
    const tor = $('.g-tor', g), imgs = $$('img', tor);
    if (imgs.length < 2) return;
    tor.tabIndex = 0; tor.setAttribute('role', 'region'); tor.setAttribute('aria-label', 'Zdjęcia produktu, ' + imgs.length);
    const kropki = document.createElement('div'); kropki.className = 'g-kropki';
    kropki.innerHTML = imgs.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
    const l = document.createElement('button'), p = document.createElement('button');
    l.className = 'g-str l'; p.className = 'g-str p'; l.type = p.type = 'button';
    l.setAttribute('aria-label', 'Poprzednie zdjęcie'); p.setAttribute('aria-label', 'Następne zdjęcie');
    l.innerHTML = strz(0); p.innerHTML = strz(1);
    g.append(kropki, l, p);
    const idx = () => Math.round(tor.scrollLeft / tor.clientWidth);
    const idz = i => tor.scrollTo({ left: Math.max(0, Math.min(imgs.length - 1, i)) * tor.clientWidth, behavior: 'smooth' });
    l.addEventListener('click', () => idz(idx() - 1));
    p.addEventListener('click', () => idz(idx() + 1));
    tor.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); idz(idx() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); idz(idx() - 1); } });
    tor.addEventListener('scroll', () => { const i = idx(); $$('i', kropki).forEach((k, j) => k.classList.toggle('on', i === j)); }, { passive: true });
    let x0 = null, s0 = 0;
    tor.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; x0 = e.clientX; s0 = tor.scrollLeft; tor.setPointerCapture(e.pointerId); tor.classList.add('ciagnie'); });
    tor.addEventListener('pointermove', e => { if (x0 !== null) tor.scrollLeft = s0 - (e.clientX - x0); });
    const koniec = e => { if (x0 === null) return; const dx = e.clientX - x0; tor.classList.remove('ciagnie'); x0 = null; idz(Math.round(s0 / tor.clientWidth) + (dx < -40 ? 1 : dx > 40 ? -1 : 0)); };
    tor.addEventListener('pointerup', koniec); tor.addEventListener('pointercancel', koniec);
    addEventListener('resize', () => { tor.scrollLeft = idx() * tor.clientWidth; });
  });

  /* zakładki cennika */
  const tabs = $$('.zakladki [role=tab]');
  const wybierz = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => wybierz(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; wybierz(n); n.focus(); }
    });
  });

  /* formularz pokazowy */
  const f = $('#formularz');
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', f).forEach(i => { const bl = !i.value.trim(); i.classList.toggle('bl', bl); if (bl) ok = false; });
    pokazToast(ok ? 'Dziękujemy! To formularz pokazowy - w gotowej stronie wiadomość trafi na info@superalbum.pl.' : 'Uzupełnij imię i telefon lub e-mail.');
    if (ok) f.reset();
  });
})();
