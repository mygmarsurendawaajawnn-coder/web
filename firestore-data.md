# 🔥 Firebase Firestore — Өгөгдөл оруулах заавар

Firebase Console → Firestore Database руу орж доорх collection + document-уудыг нэм.

---

## 📄 Collection: `profile` → Document ID: `main`

```
full_name:   "Мягмарсүрэн Даваажав"
job_title:   "Full-Stack Веб Хөгжүүлэгч"
bio:         "Технологид дурлагч, их зүйл хийж бүтээхийг эрмэлздэг. ."
email:       "mygmarsurendawaajawnn@gmail.com"
phone:       "+976 8592 3594"
location:    "Улаанбаатар, Монгол"
avatar_url:  "https://i.pinimg.com/736x/32/52/8b/32528b5787cfe22add8e78161793b3fa.jpg"   ← зургийн URL (хоосон орхивол эхний үсэг харуулна)
badge_text:  "Ажлын байранд нээлттэй"
website:     "https://example.mn"

social: (Array)
  [0]: { platform: "GitHub",   url: "https://github.com/mygmarsurendawaajawnn-coder/davka" }
  [1]: { platform: "LinkedIn", url: "https://linkedin.com/" }
  [2]: { platform: "Facebook", url: "https://www.facebook.com/davaa.jaw.1/" }
```

---

## 📁 Collection: `experience`

### Document 1
```
company:     "Ikh zasag university"
position:    "Software engineering"
start_date:  "2023 оны 9-р сар"
end_date:    ""   ← хоосон = Одоо
description: "суралцаж байгаа."
tags:        "HTML, CSS,  PHP, Laravel, MySQL, Vue.js, JS, ReactJS, C++, C#,Java, Python "
sort_order:  1
```

### Document 2
```
company:     "Sodon Solution LLC"
position:    "Веб Хөгжүүлэгч"
start_date:  "2025 оны 6-р сар"
end_date:    "2025 оны 7-р сар"
description: "Ахлагч нарын удирдлага нь доор 2 вебсайт front-end хөгжүүлж, 1 төсөл дээр ажилласан."
tags:        "HTML, CSS, JavaScript, React.JS"
sort_order:  2
```

---

## 📁 Collection: `skills`

### Document 1
```
name:       "PHP 8"
level:      88
category:   "Backend"
sort_order: 1
```

### Document 2
```
name:       "MySQL"
level:      84
category:   "Backend"
sort_order: 2
```

### Document 3
```
name:       "HTML5 / CSS3"
level:      92
category:   "Frontend"
sort_order: 1
```

### Document 4
```
name:       "JavaScript"
level:      82
category:   "Frontend"
sort_order: 2
```

### Document 5
```
name:       "Firebase"
level:      76
category:   "Frontend"
sort_order: 3
```

### Document 6
```
name:       "Git / GitHub"
level:      80
category:   "Хэрэгсэл"
sort_order: 1
```

### Document 6
```
name:       "Java / Python"
level:      80
category:   "Back-end"
sort_order: 1
---

## 📁 Collection: `education`

### Document 1
```
degree:      "Software engineering"
institution: "Их засаг их сургууль"
start_year:  2023
end_year:    2027
description: "Программ хангамжийн инженерчлэл чиглэлээр суралцсан."
```

---

## 📁 Collection: `messages`

Энэ collection форм submit хийхэд автоматаар үүснэ.
Firebase Console-оос ирсэн мессежүүдийг харж болно.

Талбарууд:
```
sender_name:  (string)
sender_email: (string)
subject:      (string)
message:      (string)
created_at:   (timestamp)
is_read:      (boolean) false
```

---

## 🔒 Firestore Rules (Firebase Console → Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Profile, experience, skills, education — зөвхөн унших
    match /profile/{docId}    { allow read: if true; allow write: if false; }
    match /experience/{docId} { allow read: if true; allow write: if false; }
    match /skills/{docId}     { allow read: if true; allow write: if false; }
    match /education/{docId}  { allow read: if true; allow write: if false; }

    // Messages — зөвхөн бичих (хэрэглэгч унших боломжгүй)
    match /messages/{docId}   { allow read: if false; allow create: if true; }
  }
}
```
