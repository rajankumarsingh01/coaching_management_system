const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/index');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());

// CORS config — credentials true hone ki wajah se origin '*' nahi chalega,
// isliye specific origin(s) allow kar rahe hain
const allowedOrigins = [
  'http://localhost:5173',
  // CLIENT_URL comma-separated ho sakta hai (jaise: Vercel prod URL + custom domain)
  ...(process.env.CLIENT_URL || '').split(',').map((u) => u.trim()),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// IMPORTANT: Razorpay webhook needs the raw request body (as a Buffer) to
// verify its HMAC signature — this must be registered BEFORE express.json(),
// and only for this specific path, so the rest of the app keeps using
// normal parsed JSON.
app.use('/api/v1/fees/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use(errorMiddleware);

module.exports = app;














// ==========================================================================
// CORS (Cross-Origin Resource Sharing) CONFIGURATION
// ==========================================================================
// Browser security feature hai — control karta hai ki KAUN SI websites
// (origins) is backend se data maang sakti hain. Bina isके, koi bhi
// random website tumhare API ko call kar sakti thi.
// ==========================================================================

// STEP 1: Un saari websites/URLs ki list banao jinko backend access karne
// ki permission deni hai.
// const allowedOrigins = [
//   // Local development me React (Vite) app isi URL pe chalta hai
//   'http://localhost:5173',

  // ------------------------------------------------------------------
  // Production URLs .env file se CLIENT_URL variable ke through aate hain.
  // Ye comma-separated ho sakte hain, jaise:
  //   CLIENT_URL=https://myapp.vercel.app,https://mycustomdomain.com
  // (ek se zyada frontend URLs allow karne ke liye, jaise Vercel ka
  // default domain + apna custom domain)
  //
  // Neeche wali line 4 steps me kaam karti hai (andar se bahar padho):
  //
  //   a) process.env.CLIENT_URL || ''
  //      -> Agar .env me CLIENT_URL set NAHI hai, to process.env.CLIENT_URL
  //         "undefined" hoga. '' (empty string) fallback isliye diya taaki
  //         aage .split() call karne pe crash na ho (undefined.split()
  //         karne se error aata hai).
  //
  //   b) .split(',')
  //      -> String ko comma pe todke ek ARRAY banata hai.
  //         "url1,url2" -> ['url1', 'url2']
  //         Agar string khaali thi (''), to result hoga [''] (ek khaali
  //         string wala array, empty array NAHI).
  //
  //   c) .map((u) => u.trim())
  //      -> Har URL ke aage-peeche ka extra space hata deta hai
  //         (agar .env me galti se "url1, url2" jaisa space ke saath
  //         likha ho, to trim() use clean kar deta hai).
  //
  //   d) ...  (SPREAD OPERATOR)
  //      -> Upar wale 3 steps se jo ARRAY mila (jaise ['url1', 'url2']),
  //         use "khol" ke iske individual elements ko seedha is outer
  //         array ke andar daal deta hai — jaise wo shuru se yahin
  //         likhe hue the.
  //
  //         SPREAD KE BINA (galat, nested array ban jaata):
  //           ['http://localhost:5173', ['url1', 'url2']]
  //           -> allowedOrigins.includes('url1') FALSE aayega,
  //              kyunki 'url1' seedha array me nahi, ek array
  //              ke ANDAR ek aur array me hai.
  //
  //         SPREAD KE SAATH (sahi, flat array):
  //           ['http://localhost:5173', 'url1', 'url2']
  //           -> ab .includes() sahi se kaam karega.
  // ------------------------------------------------------------------
  // ...(process.env.CLIENT_URL || '').split(',').map((u) => u.trim()),

// STEP 2: .filter(Boolean) — array se saare "falsy" values hata do
// (empty string '', null, undefined, 0).
//
// Ye isliye zaroori hai kyunki agar CLIENT_URL .env me set hi nahi tha,
// to Step (b) se humein [''] mila tha (khaali string). Spread hone ke
// baad array kuch aisa dikhta: ['http://localhost:5173', '']
//
// Boolean('') => false, isliye filter(Boolean) use hata deta hai.
// Boolean('http://localhost:5173') => true, isliye wo rehta hai.
//
// Final result (agar CLIENT_URL set nahi tha): ['http://localhost:5173']
// Final result (agar CLIENT_URL set tha):
//   ['http://localhost:5173', 'https://myapp.vercel.app', ...]


// ].filter(Boolean);


// STEP 3: CORS middleware ko is allowedOrigins list ke saath configure karo.


// app.use(cors({

  // origin: yahan hum ek FUNCTION de rahe hain (fixed string/array ki
  // jagah), taaki HAR REQUEST ke liye DYNAMICALLY check kar sakein ki
  // allow karna hai ya nahi.
  //
  // cors package khud is function ko HAR REQUEST pe call karega, aur
  // apni taraf se 2 cheezein dega:
  //   - origin   -> us request ka origin (jaise "http://localhost:5173"),
  //                 ya undefined agar request browser se nahi aayi
  //                 (jaise Postman se, ya server-to-server call se).
  //   - callback -> ek function jo HUMEIN khud call karna hai, ye
  //                 batane ke liye "allow karo" ya "reject karo".
  //                 Pattern hai: callback(error, result)
  //                   -> callback(null, true)        = allow karo
  //                   -> callback(new Error('...'))  = reject karo
  // origin: (origin, callback) => {

    // CONDITION: !origin  ->  origin undefined/null hai (Postman jaisa
    //                         tool, jisme koi "Origin" header hota hi
    //                         nahi) — aise requests allow kar do.
    //
    //            allowedOrigins.includes(origin)  ->  ye check karta hai
    //                         ki request jahan se aayi hai, wo humari
    //                         allowedOrigins list me maujood hai ya nahi.
    //
    //            ||  ->  in dono me se KOI EK bhi true ho, to poora
    //                    condition true ho jaata hai (OR logic).
    // if (!origin || allowedOrigins.includes(origin)) {
      // Allow: pehla argument null (koi error nahi),
      //        doosra argument true (is origin ko allow karo)
    //   callback(null, true);
    // } else {
      // Reject: sirf ek Error object diya callback ko — cors package
      // ise dekh ke samajh jaata hai ki request reject karni hai.
      // Browser ko CORS error milega, request backend tak nahi jaayegi.
//       callback(new Error('Not allowed by CORS'));
//     }
//   },

//   // credentials: true -> Cookies aur Authorization headers (jaise JWT
//   // token) ko cross-origin requests ke saath bhejna/receive karna
//   // allow karta hai.
//   //
//   // IMPORTANT RULE: jab credentials: true ho, to origin: '*' (sabko
//   // allow) use NAHI kar sakte — browser security isko block kar deta
//   // hai. Isiliye humein upar wala dynamic function-based origin check
//   // likhna pada, ek fixed wildcard '*' nahi chala.
//   credentials: true,
// }));