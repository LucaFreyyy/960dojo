import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function GameList({ userId, format }) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setGames([]);
        setOffset(0);
        setHasMore(true);
        loadMoreGames(true);
    }, [userId, format]);

    async function loadMoreGames(initial = false) {
        if (loading || (!initial && !hasMore)) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('Game')
            .select('*')
            .eq('user_id', userId)
            .eq('format', format)
            .order('timestamp', { ascending: false })
            .range(offset, offset + 19);

        if (!error && data.length > 0) {
            setGames(prev => [...(initial ? [] : prev), ...data]);
            setOffset(offset + 20);
            if (data.length < 20) setHasMore(false);
        } else {
            setHasMore(false);
        }

        setLoading(false);
    }

    return (
        <div className="game-list">
            {games.length === 0 ? (
                <p>No games yet for this format.</p>
            ) : (
                <ul>
                    {games.map(game => (
                        <li key={game.id} className="game-item">
                            <p><strong>{game.result}</strong> vs {game.opponent} on {new Date(game.timestamp).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
            {hasMore && (
                <button className="load-more" onClick={() => loadMoreGames()}>Load More Games</button>
            )}
        </div>
    );
}
