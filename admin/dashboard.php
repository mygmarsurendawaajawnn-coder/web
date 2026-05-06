<?php
/**
 * admin/dashboard.php — Admin Dashboard
 * Firebase Auth шалгаж, нэвтрээгүй бол login руу илгээнэ (JS дээр)
 */
$firebaseConfig = require __DIR__ . '/../config/firebase.php';
$firebaseConfigJson = json_encode($firebaseConfig);
?>
<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard — Профайл</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/admin.css">
</head>
<body class="dashboard-body">

<!-- Auth guard overlay -->
<div id="auth-guard">
  <div class="guard-inner">
    <div class="guard-spinner"></div>
    <p>Хэрэглэгч шалгаж байна...</p>
  </div>
</div>

<!-- ═══ SIDEBAR ═══ -->
<aside class="sidebar" id="sidebar">
  <div class="sb-brand">
    <div class="sb-logo">A</div>
    <div>
      <div class="sb-title">Admin Panel</div>
      <div class="sb-user" id="sb-user">...</div>
    </div>
  </div>

  <nav class="sb-nav">
    <div class="sb-section-label">Удирдах хэсэг</div>
    <a href="#" class="sb-link active" data-tab="overview">
      <span class="sb-icon">📊</span> Тойм
    </a>
    <a href="#" class="sb-link" data-tab="profile">
      <span class="sb-icon">👤</span> Профайл
    </a>
    <a href="#" class="sb-link" data-tab="experience">
      <span class="sb-icon">💼</span> Туршлага
    </a>
    <a href="#" class="sb-link" data-tab="skills">
      <span class="sb-icon">⚡</span> Ур чадвар
    </a>
    <a href="#" class="sb-link" data-tab="education">
      <span class="sb-icon">🎓</span> Боловсрол
    </a>
    <a href="#" class="sb-link" data-tab="messages">
      <span class="sb-icon">✉️</span> Мессежүүд
      <span class="sb-badge" id="msg-badge" style="display:none">0</span>
    </a>
  </nav>

  <div class="sb-bottom">
    <a href="../index.php" target="_blank" class="sb-link">
      <span class="sb-icon">🌐</span> Вэбсайт харах
    </a>
    <button class="sb-link sb-logout" id="logout-btn">
      <span class="sb-icon">🚪</span> Гарах
    </button>
  </div>
</aside>

<!-- ═══ MAIN CONTENT ═══ -->
<main class="dash-main">

  <!-- Top bar -->
  <header class="dash-topbar">
    <button class="topbar-burger" id="topbar-burger">☰</button>
    <div class="topbar-title" id="topbar-title">Тойм</div>
    <div class="topbar-right">
      <span class="topbar-user" id="topbar-user">...</span>
    </div>
  </header>

  <!-- ─── TAB: OVERVIEW ─── -->
  <div class="tab-content active" id="tab-overview">
    <div class="page-header">
      <h2 class="page-title">Dashboard Тойм</h2>
      <p class="page-sub">Профайл вэбсайтын агуулгын хураангуй</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="sc-icon">💼</div>
        <div class="sc-body">
          <div class="sc-num" id="ov-exp">—</div>
          <div class="sc-lbl">Туршлага</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="sc-icon">⚡</div>
        <div class="sc-body">
          <div class="sc-num" id="ov-skill">—</div>
          <div class="sc-lbl">Ур чадвар</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="sc-icon">🎓</div>
        <div class="sc-body">
          <div class="sc-num" id="ov-edu">—</div>
          <div class="sc-lbl">Боловсрол</div>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="sc-icon">✉️</div>
        <div class="sc-body">
          <div class="sc-num" id="ov-msg">—</div>
          <div class="sc-lbl">Нийт мессеж</div>
        </div>
      </div>
    </div>

    <div class="ov-grid">
      <div class="ov-card">
        <div class="ov-card-title">Сүүлийн мессежүүд</div>
        <div id="ov-recent-msgs"><div class="loading-row">Ачааллаж байна...</div></div>
      </div>
      <div class="ov-card">
        <div class="ov-card-title">Хурдан үйлдлүүд</div>
        <div class="quick-actions">
          <button class="qa-btn" onclick="switchTab('experience')">💼 Туршлага нэм</button>
          <button class="qa-btn" onclick="switchTab('skills')">⚡ Ур чадвар нэм</button>
          <button class="qa-btn" onclick="switchTab('education')">🎓 Боловсрол нэм</button>
          <button class="qa-btn" onclick="switchTab('messages')">✉️ Мессежүүд харах</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ─── TAB: PROFILE ─── -->
  <div class="tab-content" id="tab-profile">
    <div class="page-header">
      <h2 class="page-title">Профайл засах</h2>
      <p class="page-sub">Firestore: profile/main document</p>
    </div>
    <div class="form-card">
      <div class="fc-section-title">Үндсэн мэдээлэл</div>
      <div class="form-grid-2">
        <div class="afield">
          <label>Бүтэн нэр</label>
          <input type="text" id="p-name" placeholder="Болд Батбаяр">
        </div>
        <div class="afield">
          <label>Ажлын гарчиг</label>
          <input type="text" id="p-title" placeholder="Full-Stack Хөгжүүлэгч">
        </div>
        <div class="afield">
          <label>И-мэйл</label>
          <input type="email" id="p-email" placeholder="email@example.mn">
        </div>
        <div class="afield">
          <label>Утасны дугаар</label>
          <input type="text" id="p-phone" placeholder="+976 9900 0000">
        </div>
        <div class="afield">
          <label>Байршил</label>
          <input type="text" id="p-location" placeholder="Улаанбаатар, Монгол">
        </div>
        <div class="afield">
          <label>Вэбсайт</label>
          <input type="url" id="p-website" placeholder="https://example.mn">
        </div>
        <div class="afield">
          <label>Профайл зургийн URL</label>
          <input type="url" id="p-avatar" placeholder="https://... (хоосон бол эхний үсэг)">
        </div>
        <div class="afield">
          <label>Hero badge текст</label>
          <input type="text" id="p-badge" placeholder="Ажлын байранд нээлттэй">
        </div>
      </div>
      <div class="afield">
        <label>Bio (Танилцуулга)</label>
        <textarea id="p-bio" rows="4" placeholder="Өөрийгөө танилцуулах текст..."></textarea>
      </div>

      <div class="fc-section-title" style="margin-top:28px">Сошиал холбоосууд</div>
      <div id="social-list"></div>
      <button class="btn-add-row" id="add-social-btn">+ Сошиал нэм</button>

      <div class="form-actions">
        <button class="btn-save" id="save-profile-btn">💾 Хадгалах</button>
        <span class="save-status" id="profile-status"></span>
      </div>
    </div>
  </div>

  <!-- ─── TAB: EXPERIENCE ─── -->
  <div class="tab-content" id="tab-experience">
    <div class="page-header">
      <h2 class="page-title">Туршлага</h2>
      <p class="page-sub">Firestore: experience collection</p>
      <button class="btn-add-new" id="add-exp-btn">+ Шинэ туршлага</button>
    </div>

    <!-- Add/Edit Form -->
    <div class="form-card" id="exp-form-card" style="display:none">
      <div class="fc-section-title" id="exp-form-title">Шинэ туршлага нэм</div>
      <input type="hidden" id="exp-doc-id">
      <div class="form-grid-2">
        <div class="afield">
          <label>Компани</label>
          <input type="text" id="exp-company" placeholder="Монгол Телеком">
        </div>
        <div class="afield">
          <label>Албан тушаал</label>
          <input type="text" id="exp-position" placeholder="Senior PHP Хөгжүүлэгч">
        </div>
        <div class="afield">
          <label>Эхлэх огноо</label>
          <input type="text" id="exp-start" placeholder="2022 оны 6-р сар">
        </div>
        <div class="afield">
          <label>Дуусах огноо <small>(хоосон = Одоо)</small></label>
          <input type="text" id="exp-end" placeholder="Хоосон орхивол 'Одоо' харуулна">
        </div>
        <div class="afield">
          <label>Эрэмбэ (sort_order)</label>
          <input type="number" id="exp-sort" placeholder="1" min="1">
        </div>
      </div>
      <div class="afield">
        <label>Тайлбар</label>
        <textarea id="exp-desc" rows="3" placeholder="Компанид хийсэн ажлын тайлбар..."></textarea>
      </div>
      <div class="afield">
        <label>Технологийн шошго <small>(таслалаар тусгаарлах)</small></label>
        <input type="text" id="exp-tags" placeholder="PHP, Laravel, MySQL, Vue.js">
      </div>
      <div class="form-actions">
        <button class="btn-save" id="save-exp-btn">💾 Хадгалах</button>
        <button class="btn-cancel" id="cancel-exp-btn">Цуцлах</button>
        <span class="save-status" id="exp-status"></span>
      </div>
    </div>

    <div class="data-list" id="exp-list"></div>
  </div>

  <!-- ─── TAB: SKILLS ─── -->
  <div class="tab-content" id="tab-skills">
    <div class="page-header">
      <h2 class="page-title">Ур чадвар</h2>
      <p class="page-sub">Firestore: skills collection</p>
      <button class="btn-add-new" id="add-skill-btn">+ Шинэ ур чадвар</button>
    </div>

    <div class="form-card" id="skill-form-card" style="display:none">
      <div class="fc-section-title" id="skill-form-title">Шинэ ур чадвар нэм</div>
      <input type="hidden" id="skill-doc-id">
      <div class="form-grid-2">
        <div class="afield">
          <label>Нэр</label>
          <input type="text" id="skill-name" placeholder="PHP 8">
        </div>
        <div class="afield">
          <label>Категори</label>
          <input type="text" id="skill-cat" placeholder="Backend / Frontend / Хэрэгсэл">
        </div>
        <div class="afield">
          <label>Түвшин (0–100%)</label>
          <input type="number" id="skill-level" placeholder="85" min="0" max="100">
        </div>
        <div class="afield">
          <label>Эрэмбэ (sort_order)</label>
          <input type="number" id="skill-sort" placeholder="1" min="1">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" id="save-skill-btn">💾 Хадгалах</button>
        <button class="btn-cancel" id="cancel-skill-btn">Цуцлах</button>
        <span class="save-status" id="skill-status"></span>
      </div>
    </div>

    <div class="data-list" id="skill-list"></div>
  </div>

  <!-- ─── TAB: EDUCATION ─── -->
  <div class="tab-content" id="tab-education">
    <div class="page-header">
      <h2 class="page-title">Боловсрол</h2>
      <p class="page-sub">Firestore: education collection</p>
      <button class="btn-add-new" id="add-edu-btn">+ Шинэ боловсрол</button>
    </div>

    <div class="form-card" id="edu-form-card" style="display:none">
      <div class="fc-section-title" id="edu-form-title">Шинэ боловсрол нэм</div>
      <input type="hidden" id="edu-doc-id">
      <div class="form-grid-2">
        <div class="afield">
          <label>Зэрэг / Мэргэжил</label>
          <input type="text" id="edu-degree" placeholder="Мэдээллийн Технологийн Инженер">
        </div>
        <div class="afield">
          <label>Сургуулийн нэр</label>
          <input type="text" id="edu-inst" placeholder="МУИС">
        </div>
        <div class="afield">
          <label>Эхлэх он</label>
          <input type="number" id="edu-start" placeholder="2016" min="1990" max="2099">
        </div>
        <div class="afield">
          <label>Дуусах он <small>(хоосон = Одоо)</small></label>
          <input type="number" id="edu-end" placeholder="2020" min="1990" max="2099">
        </div>
      </div>
      <div class="afield">
        <label>Тайлбар</label>
        <textarea id="edu-desc" rows="3" placeholder="Суралцсан чиглэл, амжилт..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-save" id="save-edu-btn">💾 Хадгалах</button>
        <button class="btn-cancel" id="cancel-edu-btn">Цуцлах</button>
        <span class="save-status" id="edu-status"></span>
      </div>
    </div>

    <div class="data-list" id="edu-list"></div>
  </div>

  <!-- ─── TAB: MESSAGES ─── -->
  <div class="tab-content" id="tab-messages">
    <div class="page-header">
      <h2 class="page-title">Мессежүүд</h2>
      <p class="page-sub">Firestore: messages collection — Холбоо барих формоос ирсэн</p>
    </div>
    <div class="data-list" id="msg-list"></div>
  </div>

</main>

<!-- ═══ CONFIRM MODAL ═══ -->
<div class="modal-overlay" id="confirm-modal">
  <div class="modal-box">
    <div class="modal-icon">🗑</div>
    <h3 class="modal-title">Устгах уу?</h3>
    <p class="modal-desc" id="modal-desc">Энэ үйлдлийг буцаах боломжгүй.</p>
    <div class="modal-actions">
      <button class="btn-confirm-del" id="modal-confirm">Тийм, устга</button>
      <button class="btn-modal-cancel" id="modal-cancel">Цуцлах</button>
    </div>
  </div>
</div>

<!-- Toast notification -->
<div class="toast" id="toast"></div>

<script>window.FIREBASE_CONFIG = <?= $firebaseConfigJson ?>;</script>
<script type="module" src="assets/js/admin.js"></script>
</body>
</html>
