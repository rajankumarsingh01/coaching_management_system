const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};






















// // ==========================================================================
// // JWT TOKEN UTILITY — Access aur Refresh Tokens banane/verify karne ke
// // liye reusable functions. Poore project me jahan bhi login/auth ka kaam
// // hota hai, ye file use hoti hai.
// //
// // JWT (JSON Web Token) ek encrypted string hai jisme user ka data
// // (jaise userId, role) chhupa hota hai. Login ke baad user ko token
// // milta hai, aur har agli request me wo token bhejta hai taaki backend
// // use pehchan sake — bina baar-baar password maange.
// // ==========================================================================

// const jwt = require('jsonwebtoken');   // npm package — token banane/verify karne ke functions deta hai (sign, verify)
// const env = require('../config/env');  // .env se aayi settings (secrets, expiry times) — Phase 1 me dekha tha


// // --------------------------------------------------------------------------
// // generateAccessToken — SHORT-LIVED token banata hai (15 min, .env se aata
// // hai). Ye wahi token hai jo user har API request ke saath bhejta hai
// // khud ko authenticate karne ke liye.
// //
// // PARAMETER:
// //   payload -> koi bhi JS object jo token ke andar "chhupa" ke store karna
// //              hai. Ye function KHUD decide nahi karta payload me kya
// //              hoga — jo bhi CALLER (jaise auth.service.js login karte
// //              waqt) isko de, wahi andar chala jaata hai. Jaise:
// //                generateAccessToken({ userId: '123', role: 'admin' })
// //
// // SYNTAX NOTE: (payload) => ... ye ek ARROW FUNCTION hai.
// //   (payload) wala bracket function ka PARAMETER hai — normal function
// //   jaisa hi, bas short syntax.
// //   Body ek hi line ki hai aur { } nahi lagaya -> iska matlab ye
// //   "implicit return" hai, matlab jo bhi jwt.sign(...) return karega,
// //   wahi is function ka bhi result ban jaayega (return keyword likhne
// //   ki zaroorat nahi).
// // --------------------------------------------------------------------------
// const generateAccessToken = (payload) =>

//   // jwt.sign() teen arguments leta hai (ye library ka fixed rule hai):
//   //   1) payload              -> jo data token ke andar store karna hai
//   //   2) env.jwt.accessSecret -> secret key jisse token "sign" (lock)
//   //                              hota hai. Isi secret ke bina koi bhi
//   //                              fake/tampered token nahi bana sakta.
//   //   3) { expiresIn: ... }   -> YE EK OBJECT HAI (curly braces {}),
//   //                              jwt.sign() ka teesra argument — isme
//   //                              EXTRA SETTINGS/OPTIONS di jaati hain.
//   //                              Yahan sirf ek option di: expiresIn
//   //                              (kab token khud-b-khud expire ho jaaye).
//   //                              Object isliye use kiya kyunki future
//   //                              me aur options (jaise issuer, algorithm)
//   //                              bhi isi object ke andar add ho sakti
//   //                              hain, bina function ka signature
//   //                              badle.
//   //              env.jwt.accessExpiry ki value hai '15m' (.env se aayi,
//   //              Phase 1 me dekha tha) — matlab token 15 minute baad
//   //              apne aap invalid ho jaayega.
//   jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });


// // --------------------------------------------------------------------------
// // generateRefreshToken — LONG-LIVED token banata hai (7 din, .env se).
// // Iska kaam hai: jab access token expire ho jaaye, to isse ek NAYA
// // access token generate karwaya jaa sake — bina user ko dobara login
// // karwaye.
// //
// // Bilkul upar wale jaisa hi pattern hai, sirf 2 farak hain:
// //   - Alag secret (refreshSecret) — isliye ALAG rakha access wale se,
// //     taaki agar galti se access-secret kabhi leak ho jaaye, to
// //     refresh tokens (jo zyada powerful/long-lived hain) phir bhi
// //     safe rahein.
// //   - Alag expiry (refreshExpiry = '7d') — bahut lamba time, kyunki
// //     iska use hi cham-cham kam hota hai (sirf naya access token
// //     lene ke liye).
// // --------------------------------------------------------------------------
// const generateRefreshToken = (payload) =>
//   jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });


// // --------------------------------------------------------------------------
// // verifyAccessToken — ULTA KAAM karta hai generateAccessToken se.
// // Ek bana-banaya token (string) leta hai, aur check karta hai:
// //   1) Kya ye isi accessSecret se signed hai (genuine hai, koi tampering
// //      nahi hui)?
// //   2) Kya ye abhi tak EXPIRE nahi hua (15 min wali limit)?
// //
// // AGAR DONO SAHI: to wahi PAYLOAD wapas return karta hai jo generate
// // karte waqt diya gaya tha — jaise { userId: '123', role: 'admin' }.
// // (Isi return value ko auth.middleware.js me "decoded" naam se use
// // kiya gaya tha, aur req.user me daala gaya tha.)
// //
// // AGAR GALAT/EXPIRED: jwt.verify() andar se ERROR THROW karta hai —
// // isiliye iska use hamesha try/catch ke andar hota hai (jaisa
// // auth.middleware.js me dekha tha).
// // --------------------------------------------------------------------------
// const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);


// // --------------------------------------------------------------------------
// // verifyRefreshToken — bilkul same jaisa upar wala, bas refreshSecret
// // se verify karta hai. Iska use tab hota hai jab frontend "mera access
// // token expire ho gaya, mujhe naya do" jaisi request bhejta hai, saath
// // me apna refresh token bhejta hai — ye function use verify karta hai.
// // --------------------------------------------------------------------------
// const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);


// // --------------------------------------------------------------------------
// // EXPORT — chaaron functions ko ek object ke andar export kiya.
// // { generateAccessToken } object SHORTHAND syntax hai — iska matlab hai
// // { generateAccessToken: generateAccessToken } (jab key aur value ka
// // naam same ho, to sirf ek baar likh sakte hain).
// //
// // Isse doosri files aise import kar paati hain:
// //   const { verifyAccessToken } = require('../utils/token');
// // --------------------------------------------------------------------------
// module.exports = {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
// };


// // ==========================================================================
// // POORA FLOW (ek nazar me):
// //
// //   1. User login karta hai (email + password sahi)
// //   2. auth.service.js kehta hai:
// //        generateAccessToken({ userId, role, instituteId })
// //   3. Yahan jwt.sign() chalta hai -> ek naya token string banta hai
// //   4. Token frontend ko response me bhej diya jaata hai
// //   5. Frontend har agli request me ye token
// //        "Authorization: Bearer <token>" header me bhejta hai
// //   6. auth.middleware.js me verifyAccessToken(token) call hota hai
// //   7. Sahi hua to payload wapas milta hai -> req.user me set hota hai
// //   8. Ab poore request ke lifecycle me pata rehta hai ye request
// //      kis user ki hai
// // ==========================================================================