# Smart Studio - Freemium System

## ✅ מה בנינו עד כה

### 1. **תשתית Firestore**
- ✅ הוספת Firestore ל-`src/config/firebase.ts`
- ✅ יצירת מבנה משתמשים ב-Firestore:
  ```typescript
  users/{uid} {
    plan: 'free' | 'premium',
    credits: { used, limit, resetDate },
    email, createdAt, updatedAt
  }
  ```

### 2. **שירותי ניהול קרדיטים (Client-Side)**
📁 `src/services/credits.ts`
- `initializeUserCredits()` - אתחול משתמש חדש
- `getUserCredits()` - קבלת מידע על קרדיטים
- `hasCreditsAvailable()` - בדיקה האם יש קרדיטים זמינים
- `getRemainingCredits()` - מספר הקרדיטים שנותרו
- `useCredit()` - שימוש בקרדיט אחד

### 3. **אינטגרציה עם AuthContext**
📁 `src/contexts/AuthContext.tsx`
- ✅ אתחול אוטומטי של קרדיטים בהרשמה
- ✅ מצב `userCredits` זמין ב-useAuth()
- ✅ פונקציה `refreshCredits()` לעדכון מידע

### 4. **קומפוננטות UI**
- ✅ `CreditsBadge.tsx` - תצוגת מצב קרדיטים
- ✅ `UpgradePrompt.tsx` - מודל לשדרוג לפרימיום

### 5. **API Infrastructure**
📁 `api/lib/`
- ✅ `firebase-admin.ts` - Firebase Admin SDK
- ✅ `auth-middleware.ts` - אימות ובדיקת קרדיטים בצד השרת

### 6. **הגנה על API Endpoints**
📁 `api/generate-concepts.ts`
- ✅ אימות משתמש דרך Bearer token
- ✅ בדיקת קרדיטים לפני יצירה
- ✅ ניכוי קרדיט אוטומטי לאחר יצירה מוצלחת

### 7. **Client API Utility**
📁 `src/services/api.ts`
- ✅ `apiRequest()` - בקשות API עם אימות אוטומטי
- ✅ `generateConcepts()` - wrapper מאומת

---

## 🚧 מה צריך להשלים

### שלב הבא: אינטגרציה בממשק
1. **הוספת CreditsBadge לממשק**
   - להוסיף ל-Header או UserMenu
   - להציג תמיד את מצב הקרדיטים

2. **טיפול בשגיאות קרדיטים**
   - לתפוס שגיאה 403 מה-API
   - להציג UpgradePrompt אוטומטית

3. **עדכון BriefForm**
   - להשתמש ב-`generateConcepts()` מ-`services/api.ts`
   - להציג הודעה ידידותית אם אין קרדיטים

### שלב 3: מערכת תשלומים (Stripe)
1. יצירת חשבון Stripe
2. הוספת Stripe SDK
3. יצירת API endpoint לתשלום
4. Webhook לעדכון מנוי

---

## 🔧 הגדרות נדרשות

### Environment Variables (Vercel)
נדרש להוסיף:
```env
# Firebase Admin (for server-side)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Firebase Console
1. **Firestore Database:**
   - ליצור Database (אם לא קיים)
   - Rules זמניים לפיתוח:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

2. **Service Account:**
   - Settings > Service Accounts
   - Generate new private key
   - להעתיק את ה-JSON ל-FIREBASE_SERVICE_ACCOUNT

---

## 📋 דוגמאות שימוש

### בקומפוננטה כלשהי:
```tsx
import { useAuth } from '../contexts/AuthContext';
import CreditsBadge from '../components/CreditsBadge';
import UpgradePrompt from '../components/UpgradePrompt';

function MyComponent() {
  const { userCredits } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <CreditsBadge />
      {userCredits?.credits.used >= userCredits?.credits.limit && (
        <button onClick={() => setShowUpgrade(true)}>
          שדרג לפרימיום
        </button>
      )}
      <UpgradePrompt 
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        remainingCredits={userCredits?.credits.limit - userCredits?.credits.used}
      />
    </>
  );
}
```

### קריאה ל-API:
```tsx
import { generateConcepts } from '../services/api';

async function handleSubmit() {
  try {
    const result = await generateConcepts(briefData);
    console.log('Concepts:', result.concepts);
    console.log('Credits remaining:', result.creditsRemaining);
  } catch (error) {
    if (error.message.includes('אין מספיק קרדיטים')) {
      setShowUpgrade(true);
    }
  }
}
```

---

## 🎯 המשך העבודה

**הצעד הבא שלנו:** לשלב את ה-UI components בממשק הקיים ולבדוק את הזרימה המלאה.

רוצה שאמשיך עם זה? 🚀
