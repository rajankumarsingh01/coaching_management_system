const axios = require('axios');
const env = require('./env');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// openrouter/free — OpenRouter ka auto-router, khud available free model choose
// karta hai. Isse "yeh model ab free nahi raha" wala issue dobara nahi aayega,
// kyunki catalog badalne par yeh khud adapt ho jaata hai.
// Agar kabhi fixed model chahiye ho: https://openrouter.ai/models?max_price=0
// pe jaake koi bhi ":free" wala slug copy kar lena.
const OPENROUTER_MODEL = 'openrouter/free';

const generateContent = async (prompt, maxOutputTokens = 500) => {
  const { data } = await axios.post(
    OPENROUTER_URL,
    {
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxOutputTokens,
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${env.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-institute-app.com',
        'X-Title': 'Coaching App AI Tutor',
      },
      timeout: 15000,
    }
  );

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenRouter');
  return text.trim();
};

// Photo doubt — sends the image as an image_url content part alongside the
// text prompt. openrouter/free auto-filters to a vision-capable free model
// when it sees image content in the request, so we keep using the same
// router (no separate API key/config needed).
//
// RISK NOTE (flagged in the build plan): free vision models can be
// inconsistent in quality. If answers on photo doubts are consistently poor,
// swap OPENROUTER_MODEL below for a specific vision-capable :free slug from
// https://openrouter.ai/models?max_price=0&fmt=table&input_modalities=image
// e.g. (check availability first, this list changes often):
//   const OPENROUTER_VISION_MODEL = 'google/gemma-4-31b-it:free';
const generateVisionContent = async (prompt, imageUrl, maxOutputTokens = 500) => {
  const { data } = await axios.post(
    OPENROUTER_URL,
    {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: maxOutputTokens,
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${env.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-institute-app.com',
        'X-Title': 'Coaching App AI Tutor',
      },
      timeout: 25000, // vision calls tend to be slower than text-only
    }
  );

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenRouter (vision)');
  return text.trim();
};

module.exports = { generateContent, generateVisionContent };