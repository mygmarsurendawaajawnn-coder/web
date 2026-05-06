/**
 * ================================================================
 *  firebase.js  —  Firebase Firestore холболт
 *  Энэ файл type="module" болгон ачаалагдана
 *
 *  Firestore Collections:
 *    profile    → doc: "main"
 *    experience → collection (sort_order талбараар)
 *    skills     → collection (category, sort_order)
 *    education  → collection (start_year DESC)
 *    messages   → collection (form submit-ийн үед нэмэгдэнэ)
 * ================================================================
 */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ── Firebase init (config-г PHP-аас авна) ────────────────── */
const app = initializeApp(window.FIREBASE_CONFIG);
const db  = getFirestore(app);

/* ── Тусламжийн функц: XSS аюулгүй болгох ─────────────────── */
function esc(val) {
  return String(val ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/* ══════════════════════════════════════════════════════════════
   1. ПРОФАЙЛ  →  Firestore: profile/main
══════════════════════════════════════════════════════════════ */
async function loadProfile() {
  const snap = await getDoc(doc(db, 'profile', 'main'));
  if (!snap.exists()) return;

  const d = snap.data();

  /* Nav + loader */
  document.getElementById('nav-name').textContent =
    d.full_name ?? 'Профайл';

  document.getElementById('loader-initials').textContent =
    (d.full_name ?? 'PW')
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');

  document.getElementById('footer-name').textContent =
    d.full_name ?? '';

  /* Hero badge */
  document.getElementById('hero-badge-txt').textContent =
    d.badge_text ?? 'Ажлын байранд нээлттэй';

  /* Hero name: сүүлийн үгийг gradient болгоно */
  const parts = (d.full_name ?? '').split(' ');
  const last  = parts.pop();
  document.getElementById('hero-name').innerHTML =
    `${esc(parts.join(' '))} <span class="grad-word">${esc(last)}</span>`;

  /* Role + bio */
  document.getElementById('hero-role').textContent  = d.job_title ?? '';
  document.getElementById('hero-bio').textContent   = d.bio       ?? '';
  document.getElementById('about-bio').textContent  = d.bio       ?? '';

  /* Avatar */
  const initials = (d.full_name ?? 'PW')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const avEl = document.getElementById('hero-avatar');

  if (d.avatar_url) {
    const img = document.createElement('img');
    img.src       = d.avatar_url;
    img.alt       = esc(d.full_name);
    img.className = 'avatar-el is-photo';
    img.id        = 'hero-avatar';
    avEl.replaceWith(img);
  } else {
    avEl.textContent = initials;
  }

  /* About side info tiles */
  const tileHTML = (icon, label, value, href = '') => {
    const wrap = href
      ? `<a href="${esc(href)}" class="info-tile">`
      : `<div class="info-tile">`;
    const close = href ? '</a>' : '</div>';
    return `${wrap}
      <div class="it-icon">${icon}</div>
      <div>
        <span class="it-label">${label}</span>
        <span class="it-value">${esc(value)}</span>
      </div>
    ${close}`;
  };

  let sidesHTML = '';
  if (d.location) sidesHTML += tileHTML('📍', 'Байршил',  d.location);
  if (d.email)    sidesHTML += tileHTML('✉️', 'И-мэйл',   d.email,   `mailto:${d.email}`);
  if (d.phone)    sidesHTML += tileHTML('📞', 'Утас',      d.phone,   `tel:${d.phone}`);
  if (d.website)  sidesHTML += tileHTML('🌐', 'Вэбсайт',  d.website, d.website);

  document.getElementById('about-side').innerHTML = sidesHTML;

  /* Contact info */
  let cinfoHTML = '';
  if (d.email)
    cinfoHTML += `<a href="mailto:${esc(d.email)}" class="cinfo-item">
      <div class="ci-ico">✉</div>${esc(d.email)}</a>`;
  if (d.phone)
    cinfoHTML += `<a href="tel:${esc(d.phone)}" class="cinfo-item">
      <div class="ci-ico">☎</div>${esc(d.phone)}</a>`;
  if (d.location)
    cinfoHTML += `<div class="cinfo-item">
      <div class="ci-ico">📍</div>${esc(d.location)}</div>`;

  document.getElementById('cinfo-list').innerHTML = cinfoHTML;

  /* Social links */
  if (Array.isArray(d.social)) {
    const icons = {
      GitHub: '🐙', LinkedIn: '💼', Facebook: '📘',
      Twitter: '🐦', Instagram: '📸', YouTube: '▶️',
    };
    document.getElementById('social-strip').innerHTML = d.social
      .map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="soc-btn">
          ${icons[s.platform] ?? '🔗'} ${esc(s.platform)}
        </a>`)
      .join('');
  }
}

/* ══════════════════════════════════════════════════════════════
   2. ТУРШЛАГА  →  Firestore: experience (sort_order)
══════════════════════════════════════════════════════════════ */
async function loadExperience() {
  const q    = query(collection(db, 'experience'), orderBy('sort_order'));
  const snap = await getDocs(q);
  const list = document.getElementById('exp-list');

  if (snap.empty) {
    list.innerHTML = '<p style="color:var(--muted);padding:20px 0">Туршлага одоогоор нэмэгдээгүй байна.</p>';
    updateStat('stat-exp', 0, '+');
    updateStat('bn-exp',   0, '+');
    return;
  }

  let html = '';
  let idx  = 0;

  snap.forEach(docSnap => {
    idx++;
    const ex        = docSnap.data();
    const isCurrent = !ex.end_date;
    const tags      = (ex.tags ?? '').split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const tagHTML = tags.length
      ? `<div class="exp-tags">${tags.map(t => `<span class="etag">${esc(t)}</span>`).join('')}</div>`
      : '';

    const descHTML = ex.description
      ? `<p class="exp-desc">${esc(ex.description)}</p>`
      : '';

    html += `
      <div class="exp-item reveal">
        <div class="exp-left">
          <div class="exp-dot"></div>
          <div class="exp-connector"></div>
        </div>
        <div class="exp-card">
          <div class="exp-header">
            <div>
              <div class="exp-pos">${esc(ex.position)}</div>
              <div class="exp-company">${esc(ex.company)}</div>
            </div>
            <div class="exp-period-wrap">
              ${isCurrent ? '<span class="badge-current">● Одоо</span>' : ''}
              <span class="exp-dates">
                ${esc(ex.start_date)} — ${isCurrent ? 'Одоо' : esc(ex.end_date)}
              </span>
            </div>
          </div>
          ${descHTML}
          ${tagHTML}
        </div>
      </div>`;
  });

  list.innerHTML = html;
  updateStat('stat-exp', idx, '+');
  updateStat('bn-exp',   idx, '+');
}

/* ══════════════════════════════════════════════════════════════
   3. UR CHADVAR  →  Firestore: skills (category, sort_order)
══════════════════════════════════════════════════════════════ */
async function loadSkills() {
  const q    = query(
    collection(db, 'skills'),
    orderBy('category'),
    orderBy('sort_order')
  );
  const snap = await getDocs(q);
  const cont = document.getElementById('skills-container');

  const byCategory = {};
  let   total      = 0;
  const allNames   = [];

  snap.forEach(docSnap => {
    const sk = docSnap.data();
    total++;
    allNames.push(sk.name);
    if (!byCategory[sk.category]) byCategory[sk.category] = [];
    byCategory[sk.category].push(sk);
  });

  /* Tech pills on avatar */
  ['tp1','tp2','tp3','tp4'].forEach((id, i) => {
    if (allNames[i]) {
      const el = document.getElementById(id);
      if (el) el.textContent = allNames[i];
    }
  });

  if (!snap.size) {
    cont.innerHTML = '<p style="color:var(--muted)">Ур чадвар нэмэгдээгүй байна.</p>';
    return;
  }

  let html = '';

  Object.entries(byCategory).forEach(([cat, items]) => {
    const cardsHTML = items.map(sk => `
      <div class="skill-card reveal">
        <div class="sk-top">
          <span class="sk-name">${esc(sk.name)}</span>
          <span class="sk-pct">${sk.level}%</span>
        </div>
        <div class="sk-track">
          <div class="sk-fill" style="--w:${parseInt(sk.level)}%"></div>
        </div>
      </div>`).join('');

    html += `
      <div class="skill-section">
        <div class="skill-cat-header">${esc(cat)}</div>
        <div class="skill-grid">${cardsHTML}</div>
      </div>`;
  });

  cont.innerHTML = html;
  updateStat('stat-skills', total, '+');
  updateStat('bn-skill',    total, '+');
}

/* ══════════════════════════════════════════════════════════════
   4. БОЛОВСРОЛ  →  Firestore: education (start_year DESC)
══════════════════════════════════════════════════════════════ */
async function loadEducation() {
  const q    = query(collection(db, 'education'), orderBy('start_year', 'desc'));
  const snap = await getDocs(q);
  const list = document.getElementById('edu-list');

  let html  = '';
  let count = 0;

  snap.forEach(docSnap => {
    count++;
    const ed = docSnap.data();
    const descHTML = ed.description
      ? `<div class="edu-desc">${esc(ed.description)}</div>`
      : '';

    html += `
      <div class="edu-card reveal">
        <div class="edu-period">${esc(ed.start_year)} — ${ed.end_year ?? 'Одоо'}</div>
        <div class="edu-degree">${esc(ed.degree)}</div>
        <div class="edu-school">🏛 ${esc(ed.institution)}</div>
        ${descHTML}
      </div>`;
  });

  list.innerHTML = html || '<p style="color:var(--muted)">Боловсрол нэмэгдээгүй байна.</p>';
  updateStat('stat-edu', count, '');
  updateStat('bn-edu',   count, '');
}

/* ══════════════════════════════════════════════════════════════
   5. ХОЛБОО БАРИХ ФОРМ  →  Firestore: messages collection
══════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const btn     = document.getElementById('submit-btn');
  const btnTxt  = document.getElementById('btn-txt');
  const okEl    = document.getElementById('alert-ok');
  const errEl   = document.getElementById('alert-err');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    okEl.classList.remove('show');
    errEl.classList.remove('show');
    btn.disabled      = true;
    btnTxt.textContent = 'Илгээж байна...';

    const payload = {
      sender_name:  document.getElementById('f-name').value.trim(),
      sender_email: document.getElementById('f-email').value.trim(),
      subject:      document.getElementById('f-subject').value.trim(),
      message:      document.getElementById('f-msg').value.trim(),
      created_at:   serverTimestamp(),
      is_read:      false,
    };

    try {
      await addDoc(collection(db, 'messages'), payload);
      okEl.classList.add('show');
      form.reset();

      /* 4 секундийн дараа амжилтын мэдэгдлийг нуух */
      setTimeout(() => okEl.classList.remove('show'), 4000);
    } catch (err) {
      console.error('Firestore write error:', err);
      errEl.classList.add('show');
    } finally {
      btn.disabled      = false;
      btnTxt.textContent = 'Илгээх';
    }
  });
}

/* ── Stat counter helper ───────────────────────────────────── */
function updateStat(id, num, suffix = '') {
  const el = document.getElementById(id);
  if (el) el.textContent = num + suffix;
}

/* ── Reveal observer (scroll animation) ───────────────────── */
function initReveal() {
  const io = new IntersectionObserver(
    entries => entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   MAIN  —  бүгдийг зэрэг ачаалаад Loading screen нуух
══════════════════════════════════════════════════════════════ */
(async () => {
  try {
    await Promise.all([
      loadProfile(),
      loadExperience(),
      loadSkills(),
      loadEducation(),
    ]);
  } catch (err) {
    console.error('Firebase data load error:', err);
  } finally {
    /* Loading screen fade out */
    setTimeout(() => {
      const ls = document.getElementById('loading-screen');
      if (ls) ls.classList.add('hidden');

      /* Scroll reveal observer ачаалах */
      initReveal();
    }, 500);
  }

  /* Форм */
  initContactForm();
})();
