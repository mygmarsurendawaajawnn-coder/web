<?php
/**
 * admin/index.php — Admin нэвтрэх хуудас
 * Firebase Email/Password Authentication ашиглана
 */
$firebaseConfig = require __DIR__ . '/../config/firebase.php';
$firebaseConfigJson = json_encode($firebaseConfig);
?>
<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Нэвтрэх</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/admin.css">
</head>
<body class="login-body">

<div class="login-wrap">
  <!-- Logo / Brand -->
  <div class="login-brand">
    <div class="login-logo">A</div>
    <h1 class="login-title">Admin Panel</h1>
    <p class="login-sub">Профайл вэбсайт удирдах хэсэг</p>
  </div>

  <!-- Login Card -->
  <div class="login-card">
    <div class="lcard-header">
      <span class="lcard-dot"></span>
      Firebase Authentication
    </div>

    <form id="login-form" novalidate>
      <div class="lfield">
        <label for="email">И-мэйл</label>
        <div class="linput-wrap">
          <span class="linput-icon">✉</span>
          <input type="email" id="email" placeholder="admin@example.mn" required autocomplete="email">
        </div>
      </div>

      <div class="lfield">
        <label for="password">Нууц үг</label>
        <div class="linput-wrap">
          <span class="linput-icon">🔒</span>
          <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password">
          <button type="button" class="eye-btn" id="eye-btn" aria-label="Нууц үг харах">👁</button>
        </div>
      </div>

      <div class="lerror" id="login-error"></div>

      <button type="submit" class="login-btn" id="login-btn">
        <span id="login-btn-txt">Нэвтрэх</span>
        <span class="login-arrow">→</span>
      </button>
    </form>

    <p class="login-hint">
      Firebase Console → Authentication → Users дээр admin хэрэглэгч нэм
    </p>
  </div>
</div>

<div class="login-bg-orb ob1"></div>
<div class="login-bg-orb ob2"></div>

<script>window.FIREBASE_CONFIG = <?= $firebaseConfigJson ?>;</script>
<script type="module" src="assets/js/admin.js"></script>
</body>
</html>
