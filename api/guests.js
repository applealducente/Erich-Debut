// Vercel serverless function: GET /api/guests
// Reads the Google Sheet on the server (no browser CORS limits) and returns clean JSON.
const Guests = require('../guests.js');

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(Guests.SHEET_EXPORT_URL, { redirect: 'follow' });
    if (!response.ok) throw new Error('Google returned ' + response.status);

    const text = await response.text();
    const guests = Guests.parseGuests(text);

    // A private sheet returns a sign-in page instead of CSV, which parses to zero guests.
    if (!guests.length) {
      throw new Error('No guests found. Share the sheet as "Anyone with the link can view" and keep the guest list on the first tab.');
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
    res.status(200).json({ guests, count: guests.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: err.message });
  }
};
