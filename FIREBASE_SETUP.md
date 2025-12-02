# 🔐 מדריך הגדרת Firebase Authentication

## סקירה כללית

מערכת האותנטיקציה בנויה עם **Firebase Authentication** ותומכת ב:
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Microsoft OAuth

---

## 🚀 שלב 1: יצירת פרויקט Firebase

### 1.1 צור פרויקט חדש

1. גש ל-[Firebase Console](https://console.firebase.google.com/)
2. לחץ על **Add project** / **הוסף פרויקט**
3. הכנס שם לפרויקט (לדוגמה: `smart-designer`)
4. (אופציונלי) הפעל Google Analytics
5. לחץ **Create project** / **צור פרויקט**

### 1.2 הוסף אפליקציה Web

1. בדף הראשי של הפרויקט, לחץ על **Web** (`</>`)
2. תן שם לאפליקציה (לדוגמה: `Smart Designer Web`)
3. **אל תסמן** את "Firebase Hosting" (אלא אם כן אתה רוצה)
4. לחץ **Register app** / **רשום אפליקציה**
5. **העתק את ה-Firebase Config** - תצטרך אותו מאוחר יותר!

---

## 🔧 שלב 2: הגדרת Authentication Methods

### 2.1 הפעל Authentication

1. בתפריט הצדדי, לחץ על **Build** → **Authentication**
2. לחץ **Get started** / **התחל**

### 2.2 הוסף Google Sign-In

1. בטאב **Sign-in method**, לחץ **Add new provider**
2. בחר **Google**
3. הפעל את ה-toggle (**Enable**)
4. בחר **Support email** (האימייל שלך)
5. לחץ **Save** / **שמור**

✅ **זהו! Google מוכן**

### 2.3 הוסף Facebook Sign-In

#### A. צור Facebook App

1. גש ל-[Facebook Developers](https://developers.facebook.com/)
2. לחץ **My Apps** → **Create App**
3. בחר **Consumer**
4. מלא פרטים:
   - **App Name**: Smart Designer
   - **App Contact Email**: האימייל שלך
5. לחץ **Create App**

#### B. הוסף Facebook Login

1. במסך ה-Dashboard, לחץ **Add Product**
2. חפש **Facebook Login** ולחץ **Set Up**
3. בחר **Web** כפלטפורמה
4. הכנס את ה-Site URL:
   ```
   http://localhost:5173
   ```
5. לחץ **Save** ו-**Continue**

#### C. הגדר OAuth Redirect URIs

1. בתפריט הצד, לחץ **Products** → **Facebook Login** → **Settings**
2. ב-**Valid OAuth Redirect URIs**, הוסף:
   ```
   http://localhost:5173
   https://your-domain.vercel.app
   ```
3. לחץ **Save Changes**

#### D. קבל App ID ו-App Secret

1. בתפריט הצד, לחץ **Settings** → **Basic**
2. העתק:
   - **App ID**
   - **App Secret** (לחץ **Show** כדי לראות)

#### E. חבר ל-Firebase

1. חזור ל-[Firebase Console](https://console.firebase.google.com/)
2. **Authentication** → **Sign-in method**
3. לחץ **Add new provider** → **Facebook**
4. הפעל את ה-toggle
5. הדבק את ה-**App ID** ו-**App Secret**
6. **העתק את ה-OAuth redirect URI** מ-Firebase
7. חזור ל-Facebook Developers
8. **Products** → **Facebook Login** → **Settings**
9. הדבק את ה-OAuth redirect URI מ-Firebase
10. שמור בשני המקומות

✅ **Facebook מוכן!**

### 2.4 הוסף Microsoft Sign-In

#### A. צור Azure AD App

1. גש ל-[Azure Portal](https://portal.azure.com/)
2. חפש **Azure Active Directory**
3. לחץ **App registrations** → **New registration**
4. מלא:
   - **Name**: Smart Designer
   - **Supported account types**: בחר באופציה הרחבה ביותר
5. **Redirect URI**: השאר ריק בינתיים
6. לחץ **Register**

#### B. הגדר Redirect URI

1. אחרי הרישום, לחץ **Authentication** בתפריט הצד
2. לחץ **Add a platform** → **Web**
3. חזור ל-Firebase Console
4. **Authentication** → **Sign-in method** → **Microsoft**
5. הפעל והעתק את ה-**OAuth redirect URI**
6. חזור ל-Azure והדבק ב-**Redirect URIs**
7. סמן **ID tokens** (for implicit and hybrid flows)
8. שמור

#### C. יצור Client Secret

1. ב-Azure, לחץ **Certificates & secrets** בתפריט הצד
2. לחץ **New client secret**
3. תן תיאור ובחר תוקף (24 חודשים מומלץ)
4. לחץ **Add**
5. **העתק מיד את ה-Value** - לא תוכל לראות אותו שוב!

#### D. חבר ל-Firebase

1. חזור ל-Firebase Console
2. **Authentication** → **Sign-in method** → **Microsoft**
3. הדבק:
   - **Application (client) ID** (מ-Azure Overview)
   - **Client secret value** (שהעתקת לפני רגע)
4. שמור

✅ **Microsoft מוכן!**

---

## 🔑 שלב 3: הגדרת משתני סביבה

### 3.1 קבל את Firebase Config

1. ב-Firebase Console, לחץ על הגלגל ⚙️ → **Project settings**
2. גלול ל-**Your apps** ובחר באפליקציה שלך
3. בחלק **SDK setup and configuration**, ראה את ה-Config
4. העתק את הערכים

### 3.2 צור .env.local

צור קובץ `.env.local` בשורש הפרויקט:

```env
# Gemini API (existing)
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

---

## 📦 שלב 4: התקנה והרצה

```bash
# התקן dependencies
npm install

# הרץ בפיתוח
npm run dev
```

גש ל-`http://localhost:5173` ובדוק את ההתחברות! 🎉

---

## 🚀 שלב 5: Deploy ל-Production

### 5.1 עדכן Firebase Authorized Domains

1. ב-Firebase Console: **Authentication** → **Settings**
2. בטאב **Authorized domains**, לחץ **Add domain**
3. הוסף את הדומיין שלך ב-Vercel:
   ```
   your-app.vercel.app
   ```

### 5.2 עדכן OAuth Redirect URIs

עבור כל ספק (Facebook, Microsoft), עדכן את ה-Redirect URIs להכיל:
```
https://your-app.vercel.app
```

### 5.3 הוסף Environment Variables ב-Vercel

1. ב-Vercel Dashboard, עבור ל-**Settings** → **Environment Variables**
2. הוסף את כל המשתנים מ-`.env.local`
3. Deploy!

```bash
vercel --prod
```

---

## 🐛 פתרון בעיות נפוצות

### ❌ "Firebase: Error (auth/unauthorized-domain)"
**פתרון**: הוסף את הדומיין ל-Authorized domains ב-Firebase

### ❌ "auth/popup-blocked"
**פתרון**: בקש מהמשתמש לאפשר pop-ups בדפדפן

### ❌ Facebook: "URL Blocked"
**פתרון**: ודא שה-domain מוגדר ב-App Domains ב-Facebook App Settings

### ❌ Microsoft: "AADSTS50011" (Redirect URI mismatch)
**פתרון**: בדוק שה-Redirect URI תואם בדיוק ב-Azure וב-Firebase

---

## 📊 מעקב משתמשים

ראה את כל המשתמשים המחוברים:
1. Firebase Console → **Authentication** → **Users**

---

## 🔒 אבטחה

### מומלץ להוסיף:

1. **Email Verification**:
```typescript
import { sendEmailVerification } from 'firebase/auth';
await sendEmailVerification(user);
```

2. **Password Reset** (אם תוסיף Email/Password):
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';
await sendPasswordResetEmail(auth, email);
```

3. **Rate Limiting**: Firebase מגן אוטומטית מפני brute force

---

## 💰 מכסות Firebase (Free Tier)

- **Authentications**: 10,000/חודש (יותר מספיק)
- **Verifications**: 10,000/חודש
- **Database**: לא בשימוש (רק Auth)

✅ **הכל חינמי!**

---

## 📚 משאבים נוספים

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Facebook Login Guide](https://developers.facebook.com/docs/facebook-login)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/)

---

🎉 **מזל טוב! האותנטיקציה מוכנה לשימוש!**
