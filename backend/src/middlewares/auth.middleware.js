const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const { ROLES } = require('../config/constants');
const Institute = require('../modules/institute/institute.model');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token missing'));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }

  req.user = decoded;

  // super_admin kisi institute se belong nahi karta — is check ki zarurat nahi
  if (decoded.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  // Institute block check — YEH har authenticated request pe chalta hai, sirf
  // login pe nahi. Isi se already-logged-in user bhi turant block ho jaata hai,
  // token valid hone ke bawajood.
  try {
    const institute = await Institute.findById(decoded.instituteId).select('isActive');
    if (!institute || institute.isActive === false) {
     return next(new ApiError(403, 'Institute access suspended. Contact your institute administrator.', [], 'INSTITUTE_SUSPENDED'));
    }
  } catch (err) {
    return next(new ApiError(500, 'Failed to verify institute status'));
  }

  next();
};

module.exports = authMiddleware;













/*

# `auth.middleware.js` — Poora Context aur Line-by-Line Samajh

---

## 🎯 Ye File Kya Hai, Aur Kyun Zaroori Hai

Ye ek **Express middleware** hai — matlab ek aisa function jo kisi bhi request ke **controller (asli logic) tak pahunchne se pehle** chalta hai. Iska ek hi kaam hai:

> **"Kya ye request bhejne wala user genuinely LOGIN hai? Aur kya uska institute abhi bhi ACTIVE hai?"**

Ye check poore project ke **har protected route** pe lagta hai — jaise "batches dekhna", "fee jama karna", "attendance maarna" — in sabme pehle ye middleware chalta hai, tabhi aage jaane deta hai.

Route me typically aise use hota hai:

```js
router.get('/batches', authMiddleware, batchController.getBatches);
```

Matlab: pehle `authMiddleware` chalega, sab sahi mila to `next()` bolega, tabhi `getBatches` controller chalega.

---

## 🧩 Ye File Kis-Kis Se Judi Hai (Dependencies)

```js
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const { ROLES } = require('../config/constants');
const Institute = require('../modules/institute/institute.model');
```

| Import | Kaam |
|---|---|
| `ApiError` | Jab bhi kuch galat mile (token missing, invalid, institute suspended), ek proper error object banane ke liye — jo aage `error.middleware.js` tak jaakar client ko consistent response dega |
| `verifyAccessToken` | `utils/token.js` wala function — token ko decode/verify karta hai (humne pehle detail se samjha tha) |
| `ROLES` | Ek constants file jisme roles define hain (jaise `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`) — hardcoded strings ('super_admin') baar-baar likhne ke bajaye ek jagah se import karte hain, taaki typo na ho |
| `Institute` (Model) | Mongoose model — MongoDB ke `institutes` collection se seedha data padhne ke liye use hota hai (yahan sirf ek institute ka `isActive` status check karne ke liye) |

**Important observation:** Ye middleware sirf token verify nahi karta — ye **database tak jaakar bhi check karta hai** (institute active hai ya nahi). Isliye ye function **`async`** hai.

---

## 🔍 Poora Function Step-by-Step

### Step 1 — Token Nikalna Aur Format Check Karna

```js
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return next(new ApiError(401, 'Access token missing'));
}
```

- Frontend (React app ya Mobile app) jab request bhejta hai, to header me aisa kuch bhejta hai:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQ...
  ```
- `req.headers.authorization` se ye poora string mil jaata hai.
- Check hota hai: header hai bhi ya nahi (`!authHeader`), aur agar hai to `"Bearer "` word se shuru hota hai ya nahi (ye standard convention hai — sirf `"Bearer "` prefix wale tokens accept karte hain, koi random string nahi).
- Dono me se koi bhi fail ho, to **401 (Unauthorized)** error — matlab "pehle login karo, tab request bhejo."
- `return next(new ApiError(...))` — `return` isliye zaroori hai taaki is line ke baad ka code **bilkul na chale**. Agar `return` na likhte, to function aage bhi execute hota rehta (JavaScript khud se function ko rok nahi deta jab tak `return` na ho).

---

### Step 2 — Actual Token String Nikalna

```js
const token = authHeader.split(' ')[1];
```

- `authHeader` tha: `"Bearer eyJhbGc..."`
- `.split(' ')` — space se todke array banaya: `['Bearer', 'eyJhbGc...']`
- `[1]` — doosra element liya, matlab sirf **actual token** (`"Bearer"` word hata diya).

---

### Step 3 — Token Verify Karna

```js
let decoded;
try {
  decoded = verifyAccessToken(token);
} catch (err) {
  return next(new ApiError(401, 'Invalid or expired access token'));
}
```

- `verifyAccessToken(token)` call hota hai (jo hum pehle detail se samjh chuke hain) — ye token ke andar chhupa hua **payload** decode karta hai (jaise `{ userId, role, instituteId }`).
- Ye operation **fail bhi ho sakta hai** — agar token **tampered** hai (kisi ne chhed-chhad ki), ya **expire** ho gaya hai (15 minute se zyada waqt guzar gaya), to `verifyAccessToken` andar se **error throw** karega.
- Isiliye `try/catch` lagaya hai — agar error aaye, to catch block usse pakadta hai aur ek **saaf, user-friendly** `401 Invalid or expired access token` error bhej deta hai (na ki library ka raw technical error).
- `let decoded;` (function ke bahar declare kiya, `try` ke andar nahi) — isliye kyunki humein iski value `try` block ke **bahar bhi** (Step 4 me) chahiye. Agar `try` ke andar `const decoded = ...` likhte, to wo variable sirf `try` block ke andar hi accessible rehta (**scope** ka rule).

---

### Step 4 — User Info Ko Request Pe Chipkana

```js
req.user = decoded;
```

Ye **sabse important line** hai poori file me. `decoded` (jo humein payload mila, jaise `{ userId: '123', role: 'admin', instituteId: '456' }`) ko `req` (request) object pe ek custom property `user` banakar attach kar diya.

**Kyun important hai?** Kyunki Express me ek hi `req` object **middleware se controller tak** safar karta hai — jo bhi property tum isme daaloge, wo **aage ke saare functions ko available** ho jaati hai. Ab is request ke baad chalne wala **koi bhi middleware ya controller** seedha likh sakta hai:

```js
req.user.role         // 'admin'
req.user.instituteId  // '456'
req.user.userId       // '123'
```

Bina baar-baar token dobara decode kiye — ek baar yahan decode hua, sabke liye available hai.

---

### Step 5 — Super Admin Ko Special Treatment

```js
// super_admin kisi institute se belong nahi karta — is check ki zarurat nahi
if (decoded.role === ROLES.SUPER_ADMIN) {
  return next();
}
```

- Ye project **multi-tenant** hai — matlab platform pe **kayi institutes** hain, aur har normal user (`admin`, `teacher`, `student`) kisi **ek specific institute** se belong karta hai.
- Lekin **Super Admin** (platform ka malik/owner) kisi bhi institute se belong nahi karta — wo **poore platform ko manage** karta hai.
- Isliye agar role `SUPER_ADMIN` hai, to aage wala **institute-check bilkul skip** karke seedha `next()` bulakar request ko aage jaane diya — kyunki uske paas koi `instituteId` hai hi nahi jise check kiya jaaye.

---

### Step 6 — Institute Active Hai Ya Suspend? (Sabse Interesting Part)

```js
// Institute block check — YEH har authenticated request pe chalta hai, sirf
// login pe nahi. Isi se already-logged-in user bhi turant block ho jaata hai,
// token valid hone ke bawajood.
try {
  const institute = await Institute.findById(decoded.instituteId).select('isActive');
  if (!institute || institute.isActive === false) {
    return next(new ApiError(403, 'Institute access suspended. Contact your institute administrator.', [], 'INSTITUTE_SUSPENDED'));
  }
} catch (err) {
  return next(new ApiError(500, 'Failed to verify institute status'));
}
```

**Ye kya problem solve karta hai, samjho pehle:**

Maan lo kal ek institute ka payment due ho gaya, ya platform admin ne kisi wajah se ek institute ko **suspend** kar diya. Us institute ke teachers/students ke paas **abhi bhi valid tokens** hain (kyunki token 15 min tak valid rehta hai, expire nahi hua). Agar sirf token verify karke chhod dete, to wo log **suspend hone ke bawajood app use karte rehte** jab tak unka token naturally expire na ho.

**Isiliye ye extra DB check hai** — **har single authenticated request pe**, ye seedha database jaakar check karta hai ki institute abhi bhi active hai ya nahi:

- `Institute.findById(decoded.instituteId)` — `decoded` payload me jo `instituteId` tha, usse database me institute dhoondha.
- `.select('isActive')` — **performance optimization**: poora institute document nahi mangwaya, sirf `isActive` field mangwaya — kyunki humein sirf yehi ek cheez chahiye, poora document laana waste hoga.
- `if (!institute || institute.isActive === false)` — do cases cover kiye:
  - `!institute` — agar institute **delete** ho gaya database se (tab `findById` `null` return karega)
  - `institute.isActive === false` — agar institute **suspend** kiya gaya hai (flag `false` set hai)
  - In dono cases me: **403 error** bheja, saath me ek `errorCode: 'INSTITUTE_SUSPENDED'` bhi diya — taaki **frontend** is specific code ko dekh ke ek **custom message/screen** dikha sake (jaise "Aapka institute suspend hai, admin se contact karo" wala popup), general error se alag.
- Bahar wala `try/catch` — agar database query hi fail ho jaaye (jaise MongoDB connection issue), to `500 Failed to verify institute status` error diya — **generic server error**, kyunki ye user ki galti nahi, system ki problem hai.

---

### Step 7 — Sab Sahi, Aage Jaane Do

```js
next();
```

Agar function yahan tak pahunch gaya (koi bhi upar wala check fail nahi hua), to matlab:
✅ Token valid hai
✅ `req.user` set ho chuka hai
✅ Institute active hai (ya user Super Admin hai)

Ab request ko **aage** — agle middleware (jaise `roleMiddleware`) ya seedha **controller** tak jaane do.

---

## 🗺️ Poora Flow — Ek Diagram Ki Tarah

```
Request aayi (Authorization header ke saath)
        │
        ▼
   Header hai? "Bearer " se start hota hai?
        │NO ──────────────────────► 401 "Access token missing"
        │YES
        ▼
   Token nikala (split karke)
        │
        ▼
   Token verify kiya (jwt verify)
        │FAIL ─────────────────────► 401 "Invalid or expired access token"
        │SUCCESS (decoded payload mila)
        ▼
   req.user = decoded  (poore request ke liye user info save ho gayi)
        │
        ▼
   Role === SUPER_ADMIN?
        │YES ──────────────────────► next()  (institute check skip)
        │NO
        ▼
   Database se institute check kiya (isActive?)
        │NOT FOUND / INACTIVE ─────► 403 "Institute access suspended" (errorCode: INSTITUTE_SUSPENDED)
        │DB QUERY FAILED ──────────► 500 "Failed to verify institute status"
        │ACTIVE
        ▼
      next()  →  Request aage controller tak jaati hai ✅
```

---

## 💡 Is File Se Seekhne Wali 3 Important Design Cheezein

1. **Middleware sirf token verify nahi karta, business-rule bhi check kar sakta hai** — yahan "institute suspended hai kya" ek **real-time DB check** hai, sirf token ke andar ke stale data pe depend nahi kiya, balki **live status** verify kiya.

2. **Errors specific aur actionable hote hain** — `errorCode: 'INSTITUTE_SUSPENDED'` jaisi cheezein frontend ko **exact reason** batati hain, generic "Something went wrong" nahi.

3. **Roles ke hisaab se alag logic** — Super Admin ke liye ek shortcut hai, baaki sab ke liye extra security layer — ek hi function ke andar **conditional flow** clean tareeke se likha gaya hai.

---

## 🔗 Ye File Kin Doosri Files Se Connected Hai

- **Pehle chalti hai:** `token.js` (`verifyAccessToken`) — verification ke liye
- **Iske baad typically chalti hai:** `role.middleware.js` — jo `req.user.role` use karke specific permission check karta hai (jo humne is file me set kiya)
- **Agar kahin fail ho:** `error.middleware.js` tak `next(new ApiError(...))` ke through pahunchta hai
- **Database se baat karta hai:** `institute.model.js` (Mongoose model) ke through

Yehi wo chain hai jo poore project ke security layer ko banata hai.

*/

