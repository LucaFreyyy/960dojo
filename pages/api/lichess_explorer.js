export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fen, ratingMin, ratingMax, variant } = req.query;
    if (typeof fen !== 'string' || !fen.trim()) {
        return res.status(400).json({ error: 'fen is required' });
    }
    if (fen.length > 200) {
        return res.status(400).json({ error: 'fen too long' });
    }
    if (!process.env.LICHESS_TOKEN) {
        return res.status(503).json({ error: 'Explorer not configured' });
    }

    const v = variant || 'standard';
    const url = `https://explorer.lichess.ovh/lichess?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}&time=blitz,rapid,classical&variant=${encodeURIComponent(v)}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.LICHESS_TOKEN}`,
        },
    });

    const data = await response.json();
    res.status(response.status).json(data);
}