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

module.exports = { generateContent };