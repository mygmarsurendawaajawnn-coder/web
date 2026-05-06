/**
 * ================================================================
 *  admin.js  —  Firebase Auth + Firestore CRUD
 *
 *  Хамрах хүрээ:
 *    - Firebase Email/Password нэвтрэх / гарах
 *    - Auth guard (нэвтрээгүй бол login руу шилжүүлнэ)
 *    - Profile    → setDoc  (upsert)
 *    - Experience → addDoc / updateDoc / deleteDoc
 *    - Skills     → addDoc / updateDoc / deleteDoc
 *    - Education  → addDoc / updateDoc / deleteDoc
 *    - Messages   → getDocs / deleteDoc / is_read тэмдэглэх
 *    - Overview   → тоо + сүүлийн мессежүүд
 * ================================================================
 */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  limit,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ── Firebase init ─────────────────────────────────────────── */
const app  = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ── Хуудас тодорхойлох ────────────────────────────────────── */
const PAGE = document.body.classList.contains('login-body')
  ? 'login'
  : 'dashboard';

/* ── XSS аюулгүй болгох ────────────────────────────────────── */
const esc = v => String(v ?? '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
let toastTimer = null;
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

/* ══════════════════════════════════════════════════════════════
   AUTH STATE  —  нэвтрэх / гарах шалгах
══════════════════════════════════════════════════════════════ */
onAuthStateChanged(auth, user => {
  if (PAGE === 'login') {
    // Login хуудас дээр байхад нэвтэрсэн бол dashboard руу
    if (user) { window.location.href = 'dashboard.php'; }
  } else {
    // Dashboard дээр байхад нэвтрээгүй бол login руу
    const guard = document.getElementById('auth-guard');
    if (!user) {
      window.location.href = 'index.php';
      return;
    }
    // Нэвтэрсэн — guard нуух, UI ачаалах
    guard?.classList.add('hidden');
    initDashboard(user);
  }
});

/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════ */
if (PAGE === 'login') {

  /* Eye button — нууц үг харуулах */
  const eyeBtn = document.getElementById('eye-btn');
  const pwdInput = document.getElementById('password');
  eyeBtn?.addEventListener('click', () => {
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    eyeBtn.textContent = pwdInput.type === 'password' ? '👁' : '🙈';
  });

  /* Form submit */
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('login-btn');
    const btnTxt   = document.getElementById('login-btn-txt');
    const errEl    = document.getElementById('login-error');

    errEl.classList.remove('show');
    errEl.textContent = '';
    btn.disabled  = true;
    btnTxt.textContent = 'Нэвтэрч байна...';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged → dashboard руу автоматаар
    } catch (err) {
      const msgs = {
        'auth/invalid-credential':    'И-мэйл эсвэл нууц үг буруу байна.',
        'auth/user-not-found':        'Хэрэглэгч олдсонгүй.',
        'auth/wrong-password':        'Нууц үг буруу байна.',
        'auth/too-many-requests':     'Олон удаа оролдлоо. Хэсэг хүлээнэ үү.',
        'auth/invalid-email':         'И-мэйл хаяг буруу форматтай байна.',
      };
      errEl.textContent = msgs[err.code] ?? `Алдаа: ${err.message}`;
      errEl.classList.add('show');
    } finally {
      btn.disabled  = false;
      btnTxt.textContent = 'Нэвтрэх';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD — init
══════════════════════════════════════════════════════════════ */
function initDashboard(user) {
  /* User email харуулах */
  const email = user.email ?? '';
  const setEl = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  setEl('sb-user',     email);
  setEl('topbar-user', email);

  /* Sidebar nav tabs */
  document.querySelectorAll('.sb-link[data-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  /* Mobile burger */
  const sidebar = document.getElementById('sidebar');
  document.getElementById('topbar-burger')?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  /* Logout */
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.php';
  });

  /* Confirm modal */
  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);

  /* Overview ачаалах */
  loadOverview();
}

/* ── Tab switcher ──────────────────────────────────────────── */
window.switchTab = function (tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sb-link[data-tab]').forEach(l => l.classList.remove('active'));

  document.getElementById(`tab-${tabName}`)?.classList.add('active');
  document.querySelector(`.sb-link[data-tab="${tabName}"]`)?.classList.add('active');

  const titles = {
    overview: 'Тойм', profile: 'Профайл засах',
    experience: 'Туршлага', skills: 'Ур чадвар',
    education: 'Боловсрол', messages: 'Мессежүүд',
  };
  const t = document.getElementById('topbar-title');
  if (t) t.textContent = titles[tabName] ?? tabName;

  /* Тухай бүрдээ ачаалах */
  const loaders = {
    profile:    loadProfile,
    experience: loadExperience,
    skills:     loadSkills,
    education:  loadEducation,
    messages:   loadMessages,
  };
  loaders[tabName]?.();

  /* Mobile sidebar хаах */
  document.getElementById('sidebar')?.classList.remove('open');
};

/* ═════════════════════════════════════════════════════════════
   OVERVIEW
═════════════════════════════════════════════════════════════ */
async function loadOverview() {
  const counts = {
    experience: 'ov-exp',
    skills:     'ov-skill',
    education:  'ov-edu',
  };

  for (const [col, elId] of Object.entries(counts)) {
    const snap = await getDocs(collection(db, col));
    const el   = document.getElementById(elId);
    if (el) el.textContent = snap.size;
  }

  /* Messages тоо + unread badge */
  const msgSnap = await getDocs(
    query(collection(db, 'messages'), orderBy('created_at', 'desc'))
  );
  const setEl = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  setEl('ov-msg', msgSnap.size);

  const unread = msgSnap.docs.filter(d => !d.data().is_read).length;
  const badge  = document.getElementById('msg-badge');
  if (badge) {
    badge.textContent    = unread;
    badge.style.display  = unread > 0 ? 'inline-flex' : 'none';
  }

  /* Сүүлийн 5 мессеж */
  const recentEl = document.getElementById('ov-recent-msgs');
  if (!recentEl) return;

  if (msgSnap.empty) {
    recentEl.innerHTML = '<div class="loading-row">Мессеж байхгүй байна.</div>';
    return;
  }

  recentEl.innerHTML = msgSnap.docs.slice(0,5).map(d => {
    const m    = d.data();
    const date = m.created_at?.toDate
      ? m.created_at.toDate().toLocaleDateString('mn-MN')
      : '—';
    return `
      <div class="data-row" style="margin-bottom:8px">
        <div class="dr-main">
          <div class="dr-title">
            ${!m.is_read ? '<span class="unread-dot"></span>' : ''}
            ${esc(m.sender_name)}
            <span style="font-size:12px;color:var(--muted);font-weight:400">— ${esc(m.sender_email)}</span>
          </div>
          <div class="dr-meta">${esc(m.message).slice(0,80)}${m.message?.length > 80 ? '...' : ''}</div>
        </div>
        <div style="font-size:11.5px;color:var(--muted);white-space:nowrap">${date}</div>
      </div>`;
  }).join('');
}

/* ═════════════════════════════════════════════════════════════
   PROFILE  —  setDoc (upsert)
═════════════════════════════════════════════════════════════ */
let socialRows = [];

async function loadProfile() {
  const snap = await getDoc(doc(db, 'profile', 'main'));
  if (!snap.exists()) return;
  const d = snap.data();

  const setVal = (id, v) => { const e = document.getElementById(id); if(e) e.value = v ?? ''; };
  setVal('p-name',     d.full_name);
  setVal('p-title',    d.job_title);
  setVal('p-email',    d.email);
  setVal('p-phone',    d.phone);
  setVal('p-location', d.location);
  setVal('p-website',  d.website);
  setVal('p-avatar',   d.avatar_url);
  setVal('p-bio',      d.bio);
  setVal('p-badge',    d.badge_text);

  /* Social */
  socialRows = Array.isArray(d.social) ? [...d.social] : [];
  renderSocialRows();
}

function renderSocialRows() {
  const cont = document.getElementById('social-list');
  if (!cont) return;
  cont.innerHTML = socialRows.map((s, i) => `
    <div class="social-row-item">
      <div class="afield">
        ${i === 0 ? '<label>Platform</label>' : ''}
        <input type="text" value="${esc(s.platform)}"
          oninput="updateSocial(${i},'platform',this.value)"
          placeholder="GitHub">
      </div>
      <div class="afield">
        ${i === 0 ? '<label>URL</label>' : ''}
        <input type="url" value="${esc(s.url)}"
          oninput="updateSocial(${i},'url',this.value)"
          placeholder="https://github.com/">
      </div>
      <button class="btn-del-row" onclick="removeSocial(${i})" title="Устгах">✕</button>
    </div>`).join('');
}

window.updateSocial = (i, key, val) => { if (socialRows[i]) socialRows[i][key] = val; };
window.removeSocial = (i) => { socialRows.splice(i, 1); renderSocialRows(); };

document.getElementById('add-social-btn')?.addEventListener('click', () => {
  socialRows.push({ platform: '', url: '' });
  renderSocialRows();
});

document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('save-profile-btn');
  btn.disabled = true;
  try {
    await setDoc(doc(db, 'profile', 'main'), {
      full_name:  document.getElementById('p-name').value.trim(),
      job_title:  document.getElementById('p-title').value.trim(),
      email:      document.getElementById('p-email').value.trim(),
      phone:      document.getElementById('p-phone').value.trim(),
      location:   document.getElementById('p-location').value.trim(),
      website:    document.getElementById('p-website').value.trim(),
      avatar_url: document.getElementById('p-avatar').value.trim(),
      bio:        document.getElementById('p-bio').value.trim(),
      badge_text: document.getElementById('p-badge').value.trim(),
      social:     socialRows.filter(s => s.platform && s.url),
    });
    toast('✅ Профайл амжилттай хадгалагдлаа!', 'ok');
    showStatus('profile-status', '✅ Хадгалагдлаа');
  } catch (err) {
    toast('❌ Алдаа гарлаа: ' + err.message, 'err');
  } finally {
    btn.disabled = false;
  }
});

/* ═════════════════════════════════════════════════════════════
   EXPERIENCE  —  CRUD
═════════════════════════════════════════════════════════════ */
async function loadExperience() {
  const listEl = document.getElementById('exp-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="loading-row">Ачааллаж байна...</div>';

  const q    = query(collection(db,'experience'), orderBy('sort_order'));
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = '<div class="loading-row">Туршлага нэмэгдээгүй байна. Дээр + товч дарж нэм.</div>';
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const ex   = d.data();
    const tags = (ex.tags ?? '').split(',').map(t=>t.trim()).filter(Boolean);
    const end  = ex.end_date ? esc(ex.end_date) : '<span style="color:var(--acc3)">Одоо</span>';
    return `
      <div class="data-row">
        <div class="dr-main">
          <div class="dr-title">${esc(ex.position)}</div>
          <div class="dr-sub">${esc(ex.company)}</div>
          <div class="dr-meta">${esc(ex.start_date)} — ${end} · Эрэмбэ: ${ex.sort_order ?? 0}</div>
          ${ex.description ? `<div class="dr-desc">${esc(ex.description).slice(0,100)}${ex.description.length>100?'...':''}</div>` : ''}
          ${tags.length ? `<div class="dr-tags">${tags.map(t=>`<span class="dr-tag">${esc(t)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="dr-actions">
          <button class="btn-edit" onclick="editExp('${d.id}')">✏ Засах</button>
          <button class="btn-del"  onclick="confirmDelete('experience','${d.id}','${esc(ex.position)} — ${esc(ex.company)}')">🗑 Устгах</button>
        </div>
      </div>`;
  }).join('');
}

/* Add button */
document.getElementById('add-exp-btn')?.addEventListener('click', () => {
  clearExpForm();
  document.getElementById('exp-form-title').textContent = 'Шинэ туршлага нэм';
  document.getElementById('exp-form-card').style.display = 'block';
  document.getElementById('exp-form-card').scrollIntoView({ behavior:'smooth' });
});

document.getElementById('cancel-exp-btn')?.addEventListener('click', () => {
  document.getElementById('exp-form-card').style.display = 'none';
  clearExpForm();
});

window.editExp = async (docId) => {
  const snap = await getDoc(doc(db,'experience',docId));
  if (!snap.exists()) return;
  const ex = snap.data();
  document.getElementById('exp-doc-id').value   = docId;
  document.getElementById('exp-company').value  = ex.company    ?? '';
  document.getElementById('exp-position').value = ex.position   ?? '';
  document.getElementById('exp-start').value    = ex.start_date ?? '';
  document.getElementById('exp-end').value      = ex.end_date   ?? '';
  document.getElementById('exp-desc').value     = ex.description ?? '';
  document.getElementById('exp-tags').value     = ex.tags       ?? '';
  document.getElementById('exp-sort').value     = ex.sort_order ?? 1;
  document.getElementById('exp-form-title').textContent = '✏ Туршлага засах';
  document.getElementById('exp-form-card').style.display = 'block';
  document.getElementById('exp-form-card').scrollIntoView({ behavior:'smooth' });
};

document.getElementById('save-exp-btn')?.addEventListener('click', async () => {
  const btn   = document.getElementById('save-exp-btn');
  const docId = document.getElementById('exp-doc-id').value.trim();
  const data  = {
    company:     document.getElementById('exp-company').value.trim(),
    position:    document.getElementById('exp-position').value.trim(),
    start_date:  document.getElementById('exp-start').value.trim(),
    end_date:    document.getElementById('exp-end').value.trim(),
    description: document.getElementById('exp-desc').value.trim(),
    tags:        document.getElementById('exp-tags').value.trim(),
    sort_order:  parseInt(document.getElementById('exp-sort').value) || 1,
  };

  if (!data.company || !data.position || !data.start_date) {
    toast('⚠ Компани, албан тушаал, огноо заавал оруулна!', 'err'); return;
  }

  btn.disabled = true;
  try {
    if (docId) {
      await updateDoc(doc(db,'experience',docId), data);
      toast('✅ Туршлага шинэчлэгдлээ!', 'ok');
    } else {
      await addDoc(collection(db,'experience'), data);
      toast('✅ Туршлага нэмэгдлээ!', 'ok');
    }
    document.getElementById('exp-form-card').style.display = 'none';
    clearExpForm();
    loadExperience();
    loadOverview();
  } catch (err) {
    toast('❌ ' + err.message, 'err');
  } finally {
    btn.disabled = false;
  }
});

function clearExpForm() {
  ['exp-doc-id','exp-company','exp-position','exp-start',
   'exp-end','exp-desc','exp-tags','exp-sort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ═════════════════════════════════════════════════════════════
   SKILLS  —  CRUD
═════════════════════════════════════════════════════════════ */
async function loadSkills() {
  const listEl = document.getElementById('skill-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="loading-row">Ачааллаж байна...</div>';

  const q    = query(collection(db,'skills'), orderBy('category'), orderBy('sort_order'));
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = '<div class="loading-row">Ур чадвар нэмэгдээгүй байна.</div>';
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const sk = d.data();
    return `
      <div class="data-row">
        <div class="dr-main">
          <div class="dr-title">${esc(sk.name)}</div>
          <div class="dr-sub">${esc(sk.category)}</div>
          <div class="dr-meta">Түвшин: ${sk.level}% · Эрэмбэ: ${sk.sort_order ?? 0}</div>
          <div class="dr-skill-bar">
            <div class="dr-skill-fill" style="width:${parseInt(sk.level)}%"></div>
          </div>
        </div>
        <div class="dr-actions">
          <button class="btn-edit" onclick="editSkill('${d.id}')">✏ Засах</button>
          <button class="btn-del"  onclick="confirmDelete('skills','${d.id}','${esc(sk.name)}')">🗑 Устгах</button>
        </div>
      </div>`;
  }).join('');
}

document.getElementById('add-skill-btn')?.addEventListener('click', () => {
  clearSkillForm();
  document.getElementById('skill-form-title').textContent = 'Шинэ ур чадвар нэм';
  document.getElementById('skill-form-card').style.display = 'block';
  document.getElementById('skill-form-card').scrollIntoView({ behavior:'smooth' });
});

document.getElementById('cancel-skill-btn')?.addEventListener('click', () => {
  document.getElementById('skill-form-card').style.display = 'none';
  clearSkillForm();
});

window.editSkill = async (docId) => {
  const snap = await getDoc(doc(db,'skills',docId));
  if (!snap.exists()) return;
  const sk = snap.data();
  document.getElementById('skill-doc-id').value  = docId;
  document.getElementById('skill-name').value    = sk.name      ?? '';
  document.getElementById('skill-cat').value     = sk.category  ?? '';
  document.getElementById('skill-level').value   = sk.level     ?? 80;
  document.getElementById('skill-sort').value    = sk.sort_order ?? 1;
  document.getElementById('skill-form-title').textContent = '✏ Ур чадвар засах';
  document.getElementById('skill-form-card').style.display = 'block';
  document.getElementById('skill-form-card').scrollIntoView({ behavior:'smooth' });
};

document.getElementById('save-skill-btn')?.addEventListener('click', async () => {
  const btn   = document.getElementById('save-skill-btn');
  const docId = document.getElementById('skill-doc-id').value.trim();
  const level = parseInt(document.getElementById('skill-level').value) || 0;
  const data  = {
    name:       document.getElementById('skill-name').value.trim(),
    category:   document.getElementById('skill-cat').value.trim(),
    level:      Math.min(100, Math.max(0, level)),
    sort_order: parseInt(document.getElementById('skill-sort').value) || 1,
  };

  if (!data.name || !data.category) {
    toast('⚠ Нэр болон категори заавал оруулна!', 'err'); return;
  }

  btn.disabled = true;
  try {
    if (docId) {
      await updateDoc(doc(db,'skills',docId), data);
      toast('✅ Ур чадвар шинэчлэгдлээ!', 'ok');
    } else {
      await addDoc(collection(db,'skills'), data);
      toast('✅ Ур чадвар нэмэгдлээ!', 'ok');
    }
    document.getElementById('skill-form-card').style.display = 'none';
    clearSkillForm();
    loadSkills();
    loadOverview();
  } catch (err) {
    toast('❌ ' + err.message, 'err');
  } finally {
    btn.disabled = false;
  }
});

function clearSkillForm() {
  ['skill-doc-id','skill-name','skill-cat','skill-level','skill-sort']
    .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
}

/* ═════════════════════════════════════════════════════════════
   EDUCATION  —  CRUD
═════════════════════════════════════════════════════════════ */
async function loadEducation() {
  const listEl = document.getElementById('edu-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="loading-row">Ачааллаж байна...</div>';

  const q    = query(collection(db,'education'), orderBy('start_year','desc'));
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = '<div class="loading-row">Боловсрол нэмэгдээгүй байна.</div>';
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const ed  = d.data();
    const end = ed.end_year ? ed.end_year : '<span style="color:var(--acc3)">Одоо</span>';
    return `
      <div class="data-row">
        <div class="dr-main">
          <div class="dr-title">${esc(ed.degree)}</div>
          <div class="dr-sub">🏛 ${esc(ed.institution)}</div>
          <div class="dr-meta">${ed.start_year} — ${end}</div>
          ${ed.description ? `<div class="dr-desc">${esc(ed.description)}</div>` : ''}
        </div>
        <div class="dr-actions">
          <button class="btn-edit" onclick="editEdu('${d.id}')">✏ Засах</button>
          <button class="btn-del"  onclick="confirmDelete('education','${d.id}','${esc(ed.degree)}')">🗑 Устгах</button>
        </div>
      </div>`;
  }).join('');
}

document.getElementById('add-edu-btn')?.addEventListener('click', () => {
  clearEduForm();
  document.getElementById('edu-form-title').textContent = 'Шинэ боловсрол нэм';
  document.getElementById('edu-form-card').style.display = 'block';
  document.getElementById('edu-form-card').scrollIntoView({ behavior:'smooth' });
});

document.getElementById('cancel-edu-btn')?.addEventListener('click', () => {
  document.getElementById('edu-form-card').style.display = 'none';
  clearEduForm();
});

window.editEdu = async (docId) => {
  const snap = await getDoc(doc(db,'education',docId));
  if (!snap.exists()) return;
  const ed = snap.data();
  document.getElementById('edu-doc-id').value = docId;
  document.getElementById('edu-degree').value = ed.degree      ?? '';
  document.getElementById('edu-inst').value   = ed.institution ?? '';
  document.getElementById('edu-start').value  = ed.start_year  ?? '';
  document.getElementById('edu-end').value    = ed.end_year    ?? '';
  document.getElementById('edu-desc').value   = ed.description ?? '';
  document.getElementById('edu-form-title').textContent = '✏ Боловсрол засах';
  document.getElementById('edu-form-card').style.display = 'block';
  document.getElementById('edu-form-card').scrollIntoView({ behavior:'smooth' });
};

document.getElementById('save-edu-btn')?.addEventListener('click', async () => {
  const btn   = document.getElementById('save-edu-btn');
  const docId = document.getElementById('edu-doc-id').value.trim();
  const data  = {
    degree:      document.getElementById('edu-degree').value.trim(),
    institution: document.getElementById('edu-inst').value.trim(),
    start_year:  parseInt(document.getElementById('edu-start').value) || null,
    end_year:    parseInt(document.getElementById('edu-end').value)   || null,
    description: document.getElementById('edu-desc').value.trim(),
  };

  if (!data.degree || !data.institution || !data.start_year) {
    toast('⚠ Зэрэг, сургууль, эхлэх он заавал оруулна!', 'err'); return;
  }

  btn.disabled = true;
  try {
    if (docId) {
      await updateDoc(doc(db,'education',docId), data);
      toast('✅ Боловсрол шинэчлэгдлээ!', 'ok');
    } else {
      await addDoc(collection(db,'education'), data);
      toast('✅ Боловсрол нэмэгдлээ!', 'ok');
    }
    document.getElementById('edu-form-card').style.display = 'none';
    clearEduForm();
    loadEducation();
    loadOverview();
  } catch (err) {
    toast('❌ ' + err.message, 'err');
  } finally {
    btn.disabled = false;
  }
});

function clearEduForm() {
  ['edu-doc-id','edu-degree','edu-inst','edu-start','edu-end','edu-desc']
    .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
}

/* ═════════════════════════════════════════════════════════════
   MESSAGES  —  харах, унших тэмдэглэх, устгах
═════════════════════════════════════════════════════════════ */
async function loadMessages() {
  const listEl = document.getElementById('msg-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="loading-row">Ачааллаж байна...</div>';

  const q    = query(collection(db,'messages'), orderBy('created_at','desc'));
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = '<div class="loading-row">Мессеж байхгүй байна.</div>';
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const m    = d.data();
    const date = m.created_at?.toDate
      ? m.created_at.toDate().toLocaleString('mn-MN')
      : '—';
    const unread = !m.is_read;
    return `
      <div class="data-row" id="msg-${d.id}" style="${unread ? 'border-color:rgba(61,127,255,.25)' : ''}">
        <div class="dr-main">
          <div class="dr-title">
            ${unread ? '<span class="unread-dot"></span>' : ''}
            ${esc(m.sender_name)}
            ${m.subject ? `<span style="font-size:12.5px;color:var(--muted2);font-weight:500"> · ${esc(m.subject)}</span>` : ''}
          </div>
          <div class="dr-sub" style="font-size:12.5px;color:var(--muted)">${esc(m.sender_email)}</div>
          <div class="dr-desc" style="margin-top:10px;font-size:14px;color:var(--text)">${esc(m.message)}</div>
          <div class="dr-meta" style="margin-top:8px">${date}</div>
        </div>
        <div class="dr-actions" style="flex-direction:column;gap:8px">
          ${unread
            ? `<button class="btn-edit" onclick="markRead('${d.id}')">✅ Уншсан</button>`
            : `<span style="font-size:11.5px;color:var(--acc3)">✓ Уншсан</span>`
          }
          <button class="btn-del" onclick="confirmDelete('messages','${d.id}','${esc(m.sender_name)}-ийн мессеж')">🗑 Устгах</button>
        </div>
      </div>`;
  }).join('');
}

/* Уншсан тэмдэглэх */
window.markRead = async (docId) => {
  try {
    await updateDoc(doc(db,'messages',docId), { is_read: true });
    /* UI шинэчлэх */
    const row = document.getElementById(`msg-${docId}`);
    if (row) {
      row.querySelector('.unread-dot')?.remove();
      row.style.borderColor = '';
      const btn = row.querySelector('.btn-edit');
      if (btn) btn.outerHTML = `<span style="font-size:11.5px;color:var(--acc3)">✓ Уншсан</span>`;
    }
    toast('✅ Уншсан гэж тэмдэглэлээ', 'ok');
    loadOverview();
  } catch(err) {
    toast('❌ ' + err.message, 'err');
  }
};

/* ═════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
═════════════════════════════════════════════════════════════ */
let _delCollection = '';
let _delDocId      = '';

function closeModal() {
  document.getElementById('confirm-modal').classList.remove('open');
  _delCollection = '';
  _delDocId      = '';
}

window.confirmDelete = (col, docId, label) => {
  _delCollection = col;
  _delDocId      = docId;
  document.getElementById('modal-desc').textContent =
    `"${label}" устгах уу? Энэ үйлдлийг буцаах боломжгүй.`;
  document.getElementById('confirm-modal').classList.add('open');
};

document.getElementById('modal-confirm')?.addEventListener('click', async () => {
  if (!_delCollection || !_delDocId) return;
  try {
    await deleteDoc(doc(db, _delCollection, _delDocId));
    toast('🗑 Амжилттай устгагдлаа', 'ok');
    closeModal();

    /* Тухайн tab-ийг дахин ачаалах */
    const reloaders = {
      experience: loadExperience,
      skills:     loadSkills,
      education:  loadEducation,
      messages:   loadMessages,
    };
    reloaders[_delCollection]?.();
    loadOverview();
  } catch (err) {
    toast('❌ Устгах үед алдаа: ' + err.message, 'err');
    closeModal();
  }
});

/* Overlay гадна дарахад хаах */
document.getElementById('confirm-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('confirm-modal')) closeModal();
});

/* ── Status helper ─────────────────────────────────────────── */
function showStatus(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = 'fadeStatus 3s ease forwards'; });
}
