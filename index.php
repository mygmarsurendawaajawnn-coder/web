<?php
/**
 * ================================================================
 *  index.php — Профайл вэбсайтын үндсэн хуудас
 *  HTML бүтэц + Firebase config PHP-аас JS-д дамжуулна
 * ================================================================
 */

// Firebase config PHP-аас уншиж JS-д дамжуулна
$firebaseConfig = require __DIR__ . '/config/firebase.php';
$firebaseConfigJson = json_encode($firebaseConfig, JSON_UNESCAPED_UNICODE);

$currentYear = date('Y');
?>
<!DOCTYPE html>
<html lang="mn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Хувийн профайл вэбсайт">
    <title>Профайл — Хувийн Вэбсайт</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<!-- ═══════════════════════════════════════
     LOADING SCREEN
═══════════════════════════════════════ -->
<div id="loading-screen">
    <div class="loader-inner">
        <div class="loader-logo" id="loader-initials">PW</div>
        <div class="loader-bar"><div class="loader-fill"></div></div>
        <p class="loader-txt">Ачааллаж байна...</p>
    </div>
</div>

<!-- ═══════════════════════════════════════
     NAVIGATION
═══════════════════════════════════════ -->
<header class="nav" id="nav">
    <div class="nav-brand">
        <span class="brand-dot"></span>
        <span id="nav-name">Профайл</span>
    </div>

    <nav class="nav-links" id="nav-links">
        <a href="#about"      class="nav-link">Тухай</a>
        <a href="#experience" class="nav-link">Туршлага</a>
        <a href="#skills"     class="nav-link">Ур чадвар</a>
        <a href="#education"  class="nav-link">Боловсрол</a>
        <a href="#contact"    class="nav-link">Холбоо</a>
    </nav>

    <a href="#contact" class="nav-cta">Холбоо барих</a>

    <button class="burger" id="burger" aria-label="Цэс нээх">
        <span></span>
        <span></span>
        <span></span>
    </button>
</header>

<!-- Mobile nav drawer -->
<div class="mobile-drawer" id="mobile-drawer">
    <a href="#about">Тухай</a>
    <a href="#experience">Туршлага</a>
    <a href="#skills">Ур чадвар</a>
    <a href="#education">Боловсрол</a>
    <a href="#contact">Холбоо барих</a>
</div>

<!-- ═══════════════════════════════════════
     HERO
═══════════════════════════════════════ -->
<section class="hero" id="hero">
    <!-- Background effects -->
    <div class="hero-bg">
        <div class="mesh-orb mo1"></div>
        <div class="mesh-orb mo2"></div>
        <div class="mesh-orb mo3"></div>
        <div class="hero-grid-overlay"></div>
    </div>

    <div class="hero-inner">
        <!-- Left: Text -->
        <div class="hero-left">
            <div class="hero-badge">
                <span class="badge-pulse"></span>
                <span id="hero-badge-txt">Ачааллаж байна...</span>
            </div>

            <p class="hero-greeting">Сайн байна уу, би</p>

            <h1 class="hero-name" id="hero-name">
                <span class="skel skel-name">&nbsp;</span>
            </h1>

            <div class="hero-role">
                <span class="role-line"></span>
                <span class="role-text" id="hero-role">...</span>
            </div>

            <p class="hero-bio" id="hero-bio">
                <span class="skel" style="width:100%;height:72px;display:block;border-radius:8px"></span>
            </p>

            <div class="hero-btns">
                <a href="#contact"    class="btn-primary">Холбоо барих <span class="btn-arrow">→</span></a>
                <a href="#experience" class="btn-outline">Туршлага харах</a>
            </div>

            <div class="hero-stats">
                <div class="hstat">
                    <span class="hstat-num" id="stat-exp">—</span>
                    <span class="hstat-lbl">Туршлага</span>
                </div>
                <div class="hstat">
                    <span class="hstat-num" id="stat-skills">—</span>
                    <span class="hstat-lbl">Технологи</span>
                </div>
                <div class="hstat">
                    <span class="hstat-num" id="stat-edu">—</span>
                    <span class="hstat-lbl">Боловсрол</span>
                </div>
            </div>
        </div>

        <!-- Right: Avatar -->
        <div class="hero-right">
            <div class="avatar-wrap">
                <div class="av-ring avr1"></div>
                <div class="av-ring avr2"></div>
                <div class="avatar-el" id="hero-avatar">PW</div>
                <div class="tech-pill tp1" id="tp1">PHP</div>
                <div class="tech-pill tp2" id="tp2">MySQL</div>
                <div class="tech-pill tp3" id="tp3">JS</div>
                <div class="tech-pill tp4" id="tp4">Firebase</div>
            </div>
        </div>
    </div>

    <div class="scroll-hint">
        <div class="scroll-line"></div>
        <span>Доош гүйлгэ</span>
    </div>
</section>

<!-- ═══════════════════════════════════════
     ABOUT
═══════════════════════════════════════ -->
<section class="section" id="about">
    <div class="container">
        <div class="sec-label"><span class="sl-num">01</span> Тухай</div>
        <div class="about-grid">
            <!-- Left -->
            <div class="about-text">
                <h2 class="sec-title">Миний <em>тухай</em></h2>
                <p id="about-bio">Ачааллаж байна...</p>
                <div class="big-nums">
                    <div class="bn"><span class="bn-num" id="bn-exp">0+</span><span class="bn-lbl">Компани</span></div>
                    <div class="bn"><span class="bn-num" id="bn-skill">0+</span><span class="bn-lbl">Технологи</span></div>
                    <div class="bn"><span class="bn-num" id="bn-edu">0</span><span class="bn-lbl">Зэрэг</span></div>
                </div>
            </div>
            <!-- Right: Info tiles -->
            <div class="about-side" id="about-side">
                <div class="skel" style="height:68px;border-radius:10px"></div>
                <div class="skel" style="height:68px;border-radius:10px;margin-top:12px"></div>
                <div class="skel" style="height:68px;border-radius:10px;margin-top:12px"></div>
            </div>
        </div>
    </div>
</section>

<!-- ═══════════════════════════════════════
     EXPERIENCE
═══════════════════════════════════════ -->
<section class="section section-alt" id="experience">
    <div class="container">
        <div class="sec-label"><span class="sl-num">02</span> Туршлага</div>
        <h2 class="sec-title">Ажилласан <em>газрууд</em></h2>
        <div class="exp-timeline" id="exp-list">
            <div class="skel" style="height:160px;border-radius:14px;margin-bottom:18px"></div>
            <div class="skel" style="height:160px;border-radius:14px"></div>
        </div>
    </div>
</section>

<!-- ═══════════════════════════════════════
     SKILLS
═══════════════════════════════════════ -->
<section class="section section-dark" id="skills">
    <div class="container">
        <div class="sec-label"><span class="sl-num">03</span> Ур чадвар</div>
        <h2 class="sec-title">Ашигласан<em>технологи</em></h2>
        <div id="skills-container">
            <div class="skel" style="height:200px;border-radius:14px"></div>
        </div>
    </div>
</section>

<!-- ═══════════════════════════════════════
     EDUCATION
═══════════════════════════════════════ -->
<section class="section section-alt" id="education">
    <div class="container">
        <div class="sec-label"><span class="sl-num">04</span> Боловсрол</div>
        <h2 class="sec-title">Суралцсан <em>сургууль</em></h2>
        <div class="edu-grid" id="edu-list">
            <div class="skel" style="height:200px;border-radius:14px"></div>
            <div class="skel" style="height:200px;border-radius:14px"></div>
        </div>
    </div>
</section>

<!-- ═══════════════════════════════════════
     CONTACT
═══════════════════════════════════════ -->
<section class="section" id="contact">
    <div class="container">
        <div class="sec-label"><span class="sl-num">05</span> Холбоо барих</div>
        <h2 class="sec-title">Холбоо <em>барих</em></h2>

        <div class="contact-grid">
            <!-- Left: Info -->
            <div class="contact-left">
                <p class="contact-intro">Асуулт, санал, хамтын ажиллагааны саналаа илгээгээрэй. Хариуг аль болох хурдан өгөх болно!</p>
                <div class="cinfo-list" id="cinfo-list">
                    <div class="skel" style="height:54px;border-radius:10px;margin-bottom:10px"></div>
                    <div class="skel" style="height:54px;border-radius:10px;margin-bottom:10px"></div>
                    <div class="skel" style="height:54px;border-radius:10px"></div>
                </div>
                <div class="social-strip" id="social-strip"></div>
            </div>

            <!-- Right: Form -->
            <form class="cform" id="contact-form" novalidate>
                <div class="cform-head">
                    <h3 class="cform-title">Мессеж илгээх</h3>
                    <p class="cform-sub">Firebase Firestore-д хадгалагдана</p>
                </div>

                <div class="form-row">
                    <div class="field">
                        <label for="f-name">Нэр</label>
                        <input type="text" id="f-name" placeholder="Таны нэр" required>
                    </div>
                    <div class="field">
                        <label for="f-email">И-мэйл</label>
                        <input type="email" id="f-email" placeholder="email@domain.mn" required>
                    </div>
                </div>

                <div class="field">
                    <label for="f-subject">Сэдэв</label>
                    <input type="text" id="f-subject" placeholder="Хамтын ажиллагаа / Асуулт...">
                </div>

                <div class="field">
                    <label for="f-msg">Мессеж</label>
                    <textarea id="f-msg" rows="5" placeholder="Таны мессеж..." required></textarea>
                </div>

                <div class="form-alert" id="alert-ok"  role="alert">✅ Мессеж амжилттай илгээгдлээ!</div>
                <div class="form-alert alert-err" id="alert-err" role="alert">❌ Алдаа гарлаа. Дахин оролдоно уу.</div>

                <button type="submit" class="btn-submit" id="submit-btn">
                    <span id="btn-txt">Илгээх</span>
                    <span class="btn-arrow">→</span>
                </button>
            </form>
        </div>
    </div>
</section>

<!-- ═══════════════════════════════════════
     FOOTER
═══════════════════════════════════════ -->
<footer class="footer">
    <p>© <?= $currentYear ?> <span id="footer-name">...</span> · Firebase + PHP + ❤️</p>
</footer>

<!-- ═══════════════════════════════════════
     FIREBASE CONFIG (PHP → JS)
═══════════════════════════════════════ -->
<script>
    // PHP-аас Firebase config-г JS-д дамжуулна
    window.FIREBASE_CONFIG = <?= $firebaseConfigJson ?>;
</script>

<!-- JavaScript файлууд -->
<script type="module" src="assets/js/firebase.js"></script>
<script src="assets/js/app.js" defer></script>

</body>
</html>
