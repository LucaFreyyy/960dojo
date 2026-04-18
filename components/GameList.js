import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { stashPgnAndOpenAnalysis } from '../lib/analysisSessionImport';

export default function GameList({ userId, format }) {
    const [games, setGames] = useState([]);
    const [nameByUserId, setNameByUserId] = useState({});
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setGames([]);
        setOffset(0);
        setHasMore(true);
        loadMoreGames(true);
    }, [userId, format]);

    useEffect(() => {
        let cancelled = false;
        const opponentIds = [...new Set(
            (games || []).map((g) => (g.whiteId === userId ? g.blackId : g.whiteId)).filter(Boolean)
        )];
        if (!opponentIds.length) {
            setNameByUserId({});
            return;
        }
        (async () => {
            const { data } = await supabase
                .from('User')
                .select('id, name')
                .in('id', opponentIds);
            if (cancelled) return;
            const map = {};
            (data || []).forEach((row) => {
                map[row.id] = row.name || null;
            });
            setNameByUserId(map);
        })();
        return () => {
            cancelled = true;
        };
    }, [games, userId]);

    async function loadMoreGames(initial = false) {
        if (loading || (!initial && !hasMore)) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('Game')
            .select('*')
            .or(`whiteId.eq.${userId},blackId.eq.${userId}`)
            .eq('type', format)
            .order('playedAt', { ascending: false })
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

    function getOpponent(game) {
        return game.whiteId === userId ? game.blackId : game.whiteId;
    }

    function resultTextForViewer(game) {
        const result = String(game?.result || '');
        const isWhite = game.whiteId === userId;
        if (result === '1/2-1/2') return 'Draw';
        if (result === '1-0') return isWhite ? 'Win' : 'Loss';
        if (result === '0-1') return isWhite ? 'Loss' : 'Win';
        return result || 'Result';
    }

    function opponentName(game) {
        const id = getOpponent(game);
        return nameByUserId[id] || id;
    }

    function openGameInAnalysis(game) {
        if (!game?.pgn || typeof game.pgn !== 'string' || !game.pgn.trim()) return;
        const orientation = game.whiteId === userId ? 'white' : 'black';
        stashPgnAndOpenAnalysis(game.pgn.trim(), { orientation });
    }

    return (
        <div className="profile-activity-feed">
            <h4 className="profile-activity-feed__title">Recent games</h4>
            {games.length === 0 ? (
                <p className="profile-activity-feed__empty">No games yet for this format.</p>
            ) : (
                <ul className="profile-activity-feed__list">
                    {games.map(game => (
                        <li key={game.id} className="profile-activity-feed__item">
                            <button
                                type="button"
                                className="profile-activity-feed__item-btn"
                                onClick={() => openGameInAnalysis(game)}
                                aria-label={`Open game vs ${opponentName(game)} in analysis`}
                            >
                                <div className="profile-activity-feed__meta">
                                    <time className="profile-activity-feed__time">
                                        {new Date(game.playedAt).toLocaleString()}
                                    </time>
                                    <div className="profile-activity-feed__lines">
                                        <div className="profile-activity-feed__line profile-activity-feed__line--title">
                                            {resultTextForViewer(game)} vs {opponentName(game)}
                                        </div>
                                        <div className="profile-activity-feed__line">{String(format || '').toUpperCase()}</div>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {hasMore && (
                <button className="load-more" onClick={() => loadMoreGames()}>
                    Load More Games
                </button>
            )}
        </div>
    );
}
