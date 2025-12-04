# Firebase Firestore Security Rules Setup

## 📋 הגדרת Rules ל-Firestore

### 1. גישה ל-Firebase Console
1. לך ל-[Firebase Console](https://console.firebase.google.com)
2. בחר את הפרויקט: `gen-lang-client-0143969667`
3. לחץ על **Firestore Database** בתפריט הצד
4. לחץ על טאב **Rules**

### 2. העתק את ה-Rules הבאים:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - each user can only read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Prevent deletion
    }
    
    // Default: deny all access to other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. לחץ על **Publish** כדי לשמור

---

## 🔧 הגדרת Firebase Admin Service Account

### 1. יצירת Service Account
1. ב-Firebase Console, לך ל-**Project Settings** (גלגל השיניים למעלה)
2. בחר טאב **Service Accounts**
3. לחץ על **Generate new private key**
4. שמור את קובץ ה-JSON שירד

### 2. הוספה ל-Vercel
1. לך ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. בחר את הפרויקט **smart-designer**
3. לך ל-**Settings** > **Environment Variables**
4. הוסף משתנה חדש:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** העתק את **כל** תוכן קובץ ה-JSON (כמו שהוא, עם כל הסוגריים)
   - **Environment:** All (Production, Preview, Development)
5. לחץ **Save**

### 3. Redeploy
לאחר הוספת המשתנה, עשה deployment חדש:
```bash
git commit --allow-empty -m "chore: trigger redeploy for new env vars"
git push origin main
```

---

## 🗃️ מבנה הנתונים ב-Firestore

### Collection: `users`
כל משתמש מקבל document עם המבנה הבא:

```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,            // כתובת מייל
  plan: 'free' | 'premium', // סוג התוכנית
  credits: {
    used: number,           // כמה קרדיטים נוצלו
    limit: number,          // מגבלת קרדיטים (3 לחינמיים, -1 לפרימיום)
    resetDate: timestamp    // תאריך איפוס (לעתיד)
  },
  createdAt: timestamp,     // מתי המשתמש נרשם
  updatedAt: timestamp      // עדכון אחרון
}
```

---

## ✅ בדיקה שהכל עובד

### 1. בדוק ב-Firebase Console:
1. לך ל-**Firestore Database** > **Data**
2. צריך לראות collection בשם `users`
3. כשמישהו נרשם, document חדש צריך להופיע תחת ה-UID שלו

### 2. בדוק ב-Vercel:
1. לך ל-**Deployments**
2. לחץ על הפריסה האחרונה
3. לך ל-**Functions** ותבדוק שאין שגיאות ב-`generate-concepts`

### 3. בדוק באפליקציה:
1. התחבר למערכת
2. נסה ליצור קונספט
3. בדוק ב-Firestore Console שה-`credits.used` עלה ב-1

---

## 🐛 פתרון בעיות נפוצות

### שגיאה: "Missing or insufficient permissions"
**פתרון:** בדוק שה-Rules מוגדרים נכון ושפורסמו.

### שגיאה: "PERMISSION_DENIED: Missing or insufficient permissions"
**פתרון:** ודא שהמשתמש מחובר ו-`request.auth.uid` תואם ל-`userId` בנתיב.

### שגיאה: "Could not reach Cloud Firestore backend"
**פתרון:** בדוק שה-Firestore Database הופעל (Create Database אם עדיין לא קיים).

### API מחזיר 500: "Firebase Admin not initialized"
**פתרון:** 
1. בדוק ש-`FIREBASE_SERVICE_ACCOUNT` קיים ב-Vercel Environment Variables
2. ודא שהערך הוא JSON תקין (כל הקובץ, לא רק חלק ממנו)
3. עשה redeploy

---

## 📚 משאבים נוספים

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**לאחר הגדרה מוצלחת, המערכת תתחיל לעבוד עם מערכת הקרדיטים!** 🎉
