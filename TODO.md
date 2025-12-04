# ✅ TODO - Smart Studio Freemium

## 🔥 דחוף - לפני שהמערכת תעבוד

### 1. הגדרת Firestore Database
```
[ ] לך ל-Firebase Console
[ ] Firestore Database > Create Database
[ ] בחר מיקום: us-central
[ ] Rules > הדבק את ה-Rules מ-FIRESTORE_SETUP.md
[ ] לחץ Publish
```

### 2. Service Account
```
[ ] Firebase Console > Project Settings > Service Accounts
[ ] Generate new private key
[ ] שמור את קובץ ה-JSON
```

### 3. Vercel Environment Variable
```
[ ] Vercel Dashboard > smart-designer > Settings > Environment Variables
[ ] Name: FIREBASE_SERVICE_ACCOUNT
[ ] Value: [העתק את כל תוכן ה-JSON]
[ ] Environment: All
[ ] Save
```

### 4. Deployment
```
[ ] git commit --allow-empty -m "chore: trigger redeploy"
[ ] git push origin main
[ ] המתן לסיום deployment
```

### 5. בדיקה
```
[ ] התחבר לאפליקציה
[ ] בדוק שרואים את CreditsBadge ב-UserMenu
[ ] נסה ליצור קונספט
[ ] בדוק ב-Firestore Console שנוצר document חדש ב-users
[ ] בדוק ש-credits.used עלה ב-1
```

---

## 🚀 שלב הבא - Stripe Payment

### 1. הקמת חשבון Stripe
```
[ ] יצירת חשבון ב-stripe.com
[ ] הפעלת Test Mode
[ ] יצירת מוצר "Smart Studio Premium"
[ ] מחיר: ₪39/חודש (או $10/month)
[ ] שמירת Product ID ו-Price ID
```

### 2. קוד Stripe
```
[ ] npm install stripe
[ ] יצירת api/create-checkout-session.ts
[ ] יצירת api/stripe-webhook.ts
[ ] עדכון UpgradePrompt.tsx עם Stripe Checkout
```

### 3. Environment Variables
```
[ ] STRIPE_SECRET_KEY ב-Vercel
[ ] STRIPE_WEBHOOK_SECRET ב-Vercel
[ ] VITE_STRIPE_PUBLISHABLE_KEY ב-Vercel
```

### 4. Webhook Setup
```
[ ] Stripe Dashboard > Webhooks
[ ] הוסף endpoint: https://smart-designer-opal.vercel.app/api/stripe-webhook
[ ] אירועים: checkout.session.completed, customer.subscription.deleted
```

---

## 🎨 Nice to Have (אופציונלי)

### UI Improvements
```
[ ] אנימציה כשנגמרים קרדיטים
[ ] Confetti כשמשדרגים לפרימיום
[ ] דף ניהול מנוי (/account)
[ ] היסטוריית שימוש
```

### Email Notifications
```
[ ] Firebase Extensions > Trigger Email
[ ] התראה כשנותר קרדיט אחד
[ ] אישור שדרוג
[ ] תזכורת חודשית
```

### Analytics
```
[ ] Google Analytics 4
[ ] מעקב conversion rate
[ ] Funnel analysis
```

---

## 📊 KPIs למעקב

```
[ ] מספר הרשמות
[ ] Conversion Rate (Free → Premium)
[ ] Churn Rate
[ ] Average Revenue Per User (ARPU)
[ ] Customer Lifetime Value (LTV)
```

---

## 🐛 Bug Fixes ידועים

```
[כרגע אין]
```

---

**עדכון אחרון:** 2025-12-04
**נוצר על ידי:** Henry Stauber
