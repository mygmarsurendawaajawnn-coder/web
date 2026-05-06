<!-- # 🌐 Профайл Вэбсайт — Firebase + PHP

## 📁 Файлын бүтэц

```
profile/
├── index.php                 ← Үндсэн HTML хуудас (PHP)
├── config/
│   └── firebase.php          ← 🔧 Firebase config (ЭНД СОЛИНО)
├── assets/
│   ├── css/
│   │   └── style.css         ← Бүх загвар (Dark theme)
│   └── js/
│       ├── firebase.js       ← Firebase Firestore холболт
│       └── app.js            ← Nav, burger, scroll UI
├── firestore-data.md         ← Firestore-д оруулах өгөгдлийн заавар
└── README.md
```

---

## 🚀 Суурилуулах алхамууд

### 1. Firebase Project үүсгэх

1. [console.firebase.google.com](https://console.firebase.google.com) руу орно
2. **"Add project"** → нэр өгөх → үүсгэх
3. **Firestore Database** → **"Create database"** → **Production mode**
4. **Project Settings** → **"Your apps"** → **Web app** нэм (</>)
5. `firebaseConfig` объектыг хуулж авна

### 2. Firebase Config тохируулах

`config/firebase.php` файлыг нээж утгуудыг солино:

```php
return [
    'apiKey'            => 'ТАНЫ_API_KEY',
    'authDomain'        => 'ТАНЫ_PROJECT_ID.firebaseapp.com',
    'projectId'         => 'ТАНЫ_PROJECT_ID',
    'storageBucket'     => 'ТАНЫ_PROJECT_ID.appspot.com',
    'messagingSenderId' => 'ТАНЫ_SENDER_ID',
    'appId'             => 'ТАНЫ_APP_ID',
];
```

### 3. Firestore-д өгөгдөл оруулах

`firestore-data.md` файлыг нээж, Firebase Console дээр collection + document-уудыг нэм.

**Оруулах collection-ууд:**
- `profile` → doc `main` (нэр, ажил, bio, холбоо)
- `experience` (туршлага)
- `skills` (ур чадвар)
- `education` (боловсрол)

### 4. Firestore Rules тохируулах

Firebase Console → **Firestore** → **Rules** → доорхыг оруулж **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profile/{d}    { allow read: if true; allow write: if false; }
    match /experience/{d} { allow read: if true; allow write: if false; }
    match /skills/{d}     { allow read: if true; allow write: if false; }
    match /education/{d}  { allow read: if true; allow write: if false; }
    match /messages/{d}   { allow read: if false; allow create: if true; }
  }
}
```

### 5. XAMPP дээр ажиллуулах

```
C:\xampp\htdocs\profile\   ← энд хавтасаа тавина
```

Браузерт: **http://localhost/profile/**

---

## 🐙 GitHub-д байршуулах

```bash
git init
git add .
git commit -m "Initial profile website"
git remote add origin https://github.com/ТАНЫ_НЭР/profile.git
git push -u origin main
```

> **⚠️ Анхааруулга:** `config/firebase.php` дотор API key байгаа.
> Public repo болгохын өмнө `.gitignore`-д нэм:
>
> ```
> config/firebase.php
> ```
>
> Эсвэл Firebase Console-оос **API key restrictions** (domain restriction) тохируулна.

---

## 🔧 Мэдээллээ засах

Firebase Console → Firestore → collection сонгох → document засах

| Collection  | Агуулга |
|-------------|---------|
| `profile/main` | Нэр, ажил, bio, холбоо, social |
| `experience` | Туршлага карт бүр |
| `skills`    | Ур чадвар + хувь |
| `education` | Боловсрол |
| `messages`  | Ирсэн мессежүүд (автомат) | -->
