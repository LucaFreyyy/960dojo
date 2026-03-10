export default async function handler(req, res) {
    const { fen, ratingMin, ratingMax } = req.query;
    const url = `https://explorer.lichess.ovh/lichess?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}&time=blitz,rapid,classical`;
    
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.LICHESS_TOKEN}`,
        },
    });

    const data = await response.json();
    res.status(response.status).json(data);
}