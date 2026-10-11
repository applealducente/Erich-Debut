// Vercel serverless function: GET /api/roles
// Reads the "18's" tab of the Google Sheet on the server and returns clean JSON.
const Guests = require('../guests.js');

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(Guests.ROLES_EXPORT_URL, { redirect: 'follow' });
    if (!response.ok) throw new Error('Google returned ' + response.status);

    const roles = Guests.parseRoles(await response.text());
    if (!roles) {
      throw new Error('Could not read the 18\'s tab. Keep the headings 18 Roses, 18 Treasures, 18 Blue Bills, 18 Candles and Cottilion in the first row.');
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
    res.status(200).json({ roles, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: err.message });
  }
};
