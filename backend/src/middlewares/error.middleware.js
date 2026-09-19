const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  logger.error(`${req.method} ${req.originalUrl} - ${message}`);

res.status(statusCode || 500).json({
    success: false,
    message,
    errorCode: err.errorCode,   // NEW
    errors: err.errors || [],
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;





/*

Chalo ise ekdum basics se samajhte hain — pehle samjhenge Express me error-handling middleware kaise kaam karta hai (ye normal middleware se alag hota hai), phir line by line.

🔹 Sabse Pehle: Express Ko Kaise Pata Chalta Hai Ki Ye "Error Middleware" Hai?

Express me normal middleware aisa dikhta hai:

js
const normalMiddleware = (req, res, next) => { ... }   // 3 parameters

Lekin error-handling middleware aisa dikhta hai:

js
const errorMiddleware = (err, req, res, next) => { ... }  // 4 parameters (pehla "err")

Ye 4-parameter wala pattern Express ka ek special/fixed rule hai — Express khud check karta hai function ke kitne parameters hain. Agar 4 hain aur pehla err hai, to Express samajh jaata hai: "Ye normal route handler nahi hai, ye error handler hai — isse tabhi call karo jab kahin next(error) bulaya jaaye."

Yaad karo Phase 1 me app.js me humne dekha tha:

js
app.use('/api/v1', routes);
app.use(errorMiddleware);   // sabse aakhri me lagaya tha

Poore project me jahan bhi kisi ne next(new ApiError(...)) call kiya (jaise auth.middleware.js, ya kisi controller me), request seedha yahan chali aati hai, chahe wo kisi bhi file me error hua ho.

Analogy: Socho ye ek building ka "complaint department" hai. Kisi bhi floor pe (kisi bhi file me) kuch galat ho jaye, to complaint seedha is ek department tak pahunchti hai, jo standardized tareeke se har complaint ka jawab deta hai.

🔹 Ab Poori File Line By Line
Imports
js
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');
ApiError — humara custom error class (jo humne pehle samjha tha) — isse check karenge ki error humara "expected/planned" error hai ya koi "unexpected" error.
logger — Winston logger, console me error print karne ke liye.
env — batayega ki app development me chal rahi hai ya production me (isse decide karenge kitni detail response me bhejni hai).
Function Signature
js
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
(err, req, res, next) — 4 parameters, jaisa upar samjhaya. Express in sabko automatically dega jab bhi koi next(error) call karega:
err — jo error object pass hua tha
req — original request object
res — response bhejne ke liye
next — agla middleware bulaane ke liye (yahan use nahi ho raha, kyunki ye last stop hai)
// eslint-disable-next-line no-unused-vars — ye ek comment hai, code nahi — ye ESLint (code-quality checker tool) ko batata hai: "Agli line pe 'unused variable' warning mat dena." Kyun zaroori hai? Kyunki next parameter yahan kabhi use nahi hota (function ke andar kahin next() call nahi hua) — normally ESLint aisi cheez pe warning deta hai ("tumne next liya lekin use nahi kiya"). Lekin Express ko compulsory 4 parameters chahiye taaki wo isse "error middleware" pehchan sake — agar next hata denge, to Express ise normal middleware samjhega aur error-handling kaam nahi karega. Isliye next rakhna zaroori hai, lekin use nahi hota — is comment se ESLint ko chup karaya gaya hai taaki galat warning na aaye.
Step 1 — Error Se Basic Info Nikalna
js
let { statusCode, message } = err;
Destructuring — err object se statusCode aur message properties nikaal ke seedha variables bana diye.
let use kiya hai (const nahi), kyunki neeche in dono values ko change kar sakte hain (agle step me dekhoge).
Step 2 — Check Karo Ye "Expected" Error Hai Ya "Unexpected"
js
if (!(err instanceof ApiError)) {
  statusCode = err.statusCode || 500;
  message = err.message || 'Internal Server Error';
}

Pehle samjho do tarah ke errors is app me aa sakte hain:

Type 1 — "Expected" errors (jo humne khud planned/throw kiye):

js
throw new ApiError(404, 'User not found');

Ye developer ne jaan-bujhkar throw kiya — usne sochke statusCode aur message diya. Isme hume bharosa hai ki ye values sahi/meaningful hain.

Type 2 — "Unexpected" errors (jo kahin se bhi crash ho gaye):

js
const user = someUndefinedVariable.name;  // TypeError: Cannot read property 'name' of undefined

Ye koi coding mistake ya library ka internal error ho sakta hai — humne isko plan nahi kiya, isliye ismein statusCode shayad set hi nahi hoga (undefined hoga), aur message kuch technical/confusing ho sakta hai.

Ab line samjho:

err instanceof ApiError — check karta hai "kya err object ApiError class se bana hai?" — matlab kya ye humara planned error hai.
!(...) — isse ulta kar diya — "agar ye ApiError NAHI hai" (matlab Type 2 wala unexpected error hai).
Agar unexpected error hai, to safe fallback values use karte hain:
statusCode = err.statusCode || 500 — agar error me koi statusCode hai to wo lo, warna 500 (Internal Server Error) — kyunki agar humne isko plan nahi kiya, to safest assumption yahi hai ki ye server ki taraf se koi badi galti hai.
message = err.message || 'Internal Server Error' — agar koi message hai to wo lo, warna ek generic safe message do.
Agar ye ApiError HI hai (Type 1), to if block skip ho jaata hai, aur upar wali statusCode, message (jo Step 1 me destructure ki thi) waise hi use hoti hain — kyunki wo already sahi hain (developer ne khud set ki thi).

Simple words me: "Agar humne khud ye error plan karke bheja tha, to uski di gayi details use karo. Agar ye kahin se bhi achanak crash ho gaya (humne socha nahi tha), to ek safe generic '500 Internal Server Error' bhej do — kabhi bhi confusing/technical raw error client ko mat bhejo."

Step 3 — Log Karo (Server Ke Liye Record)
js
logger.error(`${req.method} ${req.originalUrl} - ${message}`);
Ye line client ko kuch nahi bhejti — ye sirf server ke console/logs me record karti hai ki error hua.
req.method — jaise GET, POST, DELETE
req.originalUrl — jaise /api/v1/users/123
message — jo error hua

Result kuch aisa print hoga: [timestamp] ERROR: DELETE /api/v1/users/123 - User not found

Kyun zaroori hai? Taaki developer/team baad me logs dekhkar samajh sake ki kab, kis route pe, kya error aaya — debugging aur monitoring ke liye essential hai.

Step 4 — Client Ko Response Bhejna
js
res.status(statusCode || 500).json({
  success: false,
  message,
  errorCode: err.errorCode,
  errors: err.errors || [],
  stack: env.nodeEnv === 'development' ? err.stack : undefined,
});

Ab final response bhejte hain client (frontend) ko:

res.status(statusCode || 500) — HTTP status code set kiya (jaise 404, 500). || 500 ek extra safety net hai — agar kisi wajah se statusCode phir bhi undefined reh gaya ho, to default 500 chala jaayega, kabhi bhi status code khaali nahi jaayega.
.json({...}) — response body me ek JSON object bheja:
success: false — hamesha false, kyunki ye error response hai.
message — human-readable error text (jaise "User not found").
errorCode: err.errorCode — agar ApiError banate waqt koi special code diya gaya tha (jaise humne auth.middleware.js me dekha tha: 'INSTITUTE_SUSPENDED'), to wo yahan chala jaata hai. Agar nahi diya tha (normal errors me), to ye undefined hoga — koi problem nahi, JSON me automatically skip ho jaata hai.
errors: err.errors || [] — agar multiple field-errors the (jaise validation fail hui thi, jo humne validate.middleware.js me dekha tha), to wo array yahan aata hai. Agar nahi the, to empty array [] default.
stack: env.nodeEnv === 'development' ? err.stack : undefined — ye security ke liye bahut important hai:
err.stack — poora stack trace hota hai (batata hai error exactly kis file, kis line pe hua, aur kaunse functions se hota hua wahan pahuncha).
Sirf development mode me ye response me bhejte hain — kyunki developer ke liye ye debugging me bahut useful hai (turant pata chal jaata hai kaha dhundhna hai).
Production me ise undefined rakha — kyunki stack trace me internal file paths, folder structure, library names jaisi sensitive information hoti hai. Agar ye hackers/attackers ko dikh jaaye, to unhe pata chal sakta hai app kaise bana hai andar se, jisse attack karna aasan ho sakta hai. Isliye production me users ko sirf message milta hai, poori technical detail nahi.
Export
js
module.exports = errorMiddleware;

Is function ko export kiya taaki app.js isko app.use(errorMiddleware) se register kar sake (jo humne Phase 1 me dekha tha, sabse aakhri middleware ke roop me).

🗺️ Poora Flow — Example Ke Saath

Maan lo auth.middleware.js me ye line chali:

js
return next(new ApiError(401, 'Access token missing'));

To yahan hoga:

next(error) call hua
        ↓
Express dhoondta hai error-handling middleware (4-param wala)
        ↓
errorMiddleware(err, req, res, next) call hota hai
        ↓
err instanceof ApiError? → TRUE (humne khud ApiError banaya tha)
        ↓
statusCode = 401, message = 'Access token missing'  (already sahi hain, if block skip)
        ↓
logger.error("GET /api/v1/batches - Access token missing")  ← server console me log
        ↓
Client ko response milta hai:
{
  "success": false,
  "message": "Access token missing",
  "errorCode": undefined,
  "errors": [],
  "stack": undefined   ← (agar production me hai)
}

Aur agar kahin unexpected crash ho jaaye (jaise koi typo ki wajah se undefined.someProperty access ho gaya):

err instanceof ApiError? → FALSE (ye normal JS error hai, ApiError nahi)
        ↓
statusCode = 500 (fallback), message = 'Internal Server Error' (fallback, raw technical message chhupa diya)
        ↓
Client ko safe generic error milta hai, internal details leak nahi hote
🎯 Ek Line Summary

Ye file poore project ka "single point of error handling" hai — kahin bhi koi error ho (planned ho ya accidental crash), ye use pakadti hai, decide karti hai kitni detail safe hai bhejna, log karti hai (developer ke liye), aur client ko ek hamesha same-shape wala, consistent JSON response bhejti hai — chahe error kahin bhi, kisi bhi module me hua ho.

Koi aur doubt ho isme? Warna agli file bhejo, main isi tarah samjhaunga.




*/