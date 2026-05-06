/**
 * ================================================================
 *  app.js  —  UI ажиллагаа
 *  Nav scroll, burger menu, active link highlight
 *  Firebase-тай холбоогүй — ердийн <script> болгон ачаалагдана
 * ================================================================
 */

(function () {
  'use strict';

  /* ── DOM References ──────────────────────────────────────── */
  const nav         = document.getElementById('nav');
  const burger      = document.getElementById('burger');
  const drawer      = document.getElementById('mobile-drawer');
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');
  const drawerLinks = document.querySelectorAll('.mobile-drawer a');

  /* ── 1. Nav: scroll-д гарч ирэхэд дарагдах ─────────────── */
  function onScroll() {
    /* Solid nav */
    nav.classList.toggle('scrolled', window.scrollY > 40);

    /* Active nav link */
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) {
        current = sec.id;
      }
    });

    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* анхдагч дуудалт */

  /* ── 2. Burger menu ──────────────────────────────────────── */
  function openDrawer()  {
    burger.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    burger.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  /* Drawer-ийн линк дарахад хаах */
  drawerLinks.forEach(a => a.addEventListener('click', closeDrawer));

  /* Гадна товших үед хаах */
  document.addEventListener('click', e => {
    if (
      drawer.classList.contains('open') &&
      !drawer.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      closeDrawer();
    }
  });

  /* ── 3. Smooth scroll for anchor links ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const targetId = a.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navH   = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h')
      ) || 66;

      window.scrollTo({
        top:      target.offsetTop - navH,
        behavior: 'smooth',
      });
    });
  });

})();
