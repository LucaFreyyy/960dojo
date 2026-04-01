export default async function handler(req, res) {
    const { fen, ratingMin, ratingMax, variant } = req.query;
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