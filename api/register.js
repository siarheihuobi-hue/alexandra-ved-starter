const https = require('https');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }).toString();

  const res = await httpRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);

  return res.access_token;
}

async function appendToSheet(accessToken, row) {
  const body = JSON.stringify({ values: [row] });
  const path = `/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent('РЕГИСТРАЦИИ')}!A:F:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  return httpRequest({
    hostname: 'sheets.googleapis.com',
    path,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

async function sendTelegram(name, email, telegram) {
  const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const text = `🔔 Новая заявка!\n\n👤 ${name || '—'}\n📧 ${email}\n✈️ ${telegram || '—'}\n\n🕐 ${now}\n📍 Стартер-лендинг`;
  const body = JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' });

  return httpRequest({
    hostname: 'api.telegram.org',
    path: `/bot${TG_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, body);
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, telegram } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email обязателен' });
  }

  const now = new Date();
  const date = now.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
  const time = now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
  const row = [date, time, name || '', email, telegram || '', 'starter-landing'];

  try {
    const accessToken = await getAccessToken();
    await Promise.all([
      appendToSheet(accessToken, row),
      sendTelegram(name, email, telegram),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};
