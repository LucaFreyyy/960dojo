import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { exposeChessopsGlobalsToWindow } from '../lib/exposeChessops.js';
import { fetchUnfinishedOpening, writeGameStateToDatabase, writeBackOldOpeningAndFetchNew } from '../lib/opening_supabase_functions.js';
import { supabase } from '../lib/supabase.js';

export default function LegacyPage() {
    const { data: session, status } = useSession();

    useEffect(() => {
        const alreadyVisited = sessionStorage.getItem("visitedLegacyPage");

        const navigationEntries = performance.getEntriesByType("navigation");
        const navType = navigationEntries[0]?.type; // 'reload', 'navigate', 'back_forward', etc.

        if (alreadyVisited === "true" && navType === "reload") {
            sessionStorage.removeItem("visitedLegacyPage");
            window.location.reload(); // Only after real reloads
        } else {
            sessionStorage.setItem("visitedLegacyPage", "true");
        }
    }, []);



    useEffect(() => {
        exposeChessopsGlobalsToWindow();

        // Always define sessionUser immediately
        window.sessionUser = {
            id: session?.user?.id ?? null,
            rating_openings: 1500,
            ...(session?.user || {})
        };

        const finishSetup = () => {
            if (typeof initializeUI === 'function') {
                window.writeGameStateToDatabase = writeGameStateToDatabase;
                window.writeBackOldOpeningAndFetchNew = writeBackOldOpeningAndFetchNew;
                initializeEventListeners();
                setupRatingControls();
                setupArrowDrawing();
                initializeBoard();
                resizeArrowCanvas();
                window.addEventListener('resize', resizeArrowCanvas);

                const ratedBtn = document.getElementById('ratedBtn');
                if (!window.sessionUser?.id) {
                    ratedBtn.classList.add('locked');
                    ratedBtn.disabled = true;
                    ratedBtn.title = 'Log in to play rated';
                    selectMode('training');
                } else {
                    ratedBtn.classList.remove('locked');
                    ratedBtn.disabled = false;
                    ratedBtn.title = '';
                    selectMode('rated');
                }
            } else {
                console.error('initializeUI is not defined');
            }
        };

        // If authenticated, fetch from Supabase and override sessionUser
        if (status === 'authenticated') {
            (async () => {
                try {
                    const { data: ratingData, error } = await supabase
                        .from('Rating')
                        .select('value')
                        .eq('userId', session.user.id)
                        .eq('type', 'openings')
                        .order('createdAt', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (ratingData) {
                        window.sessionUser.rating_openings = ratingData.value;
                    }

                    const opening = await fetchUnfinishedOpening(session.user.id);

                    window.sessionUser.openingNr = opening.openingNr;
                    window.sessionUser.color = opening.color;
                    window.sessionUser.pgn = opening.pgn;
                    window.WRITING_INTO_DATABASE = false;

                } catch (err) {
                    console.error('[legacy.js] Supabase fetch error:', err);
                } finally {
                    // Now that sessionUser is complete, load scripts
                    loadLegacyScripts(finishSetup);
                }
            })();
        } else {
            // Not logged in, just load legacy scripts immediately
            loadLegacyScripts(finishSetup);
        }

        function loadLegacyScripts(callback) {
            const scriptFiles = [
                'stockfish.js',
                'chess_constants.js',
                'chess_logic.js',
                'constants_and_globals.js',
                'utility_functions.js',
                'board_setup_and_drawing.js',
                'game_mode_and_color_selection.js',
                'game_flow.js',
                'move_list_display.js',
                'square_click_handling.js',
                'event_listeners_and_init.js',
            ];

            let loadedCount = 0;

            scriptFiles.forEach(file => {
                const script = document.createElement('script');
                script.src = `/legacy-site/js/${file}`;
                script.async = false;
                script.onload = () => {
                    loadedCount++;
                    if (loadedCount === scriptFiles.length) {
                        callback();
                    }
                };
                document.body.appendChild(script);
            });
        }
    }, [status, session]);

    return (
        <>
            <main>
                <section className="selectors">
                    <select id="Category" className="dropdown">
                        <option value="Random">Random</option>
                        <option value="Number Selection">Number Selection</option>
                        <option value="Standard">Standard</option>
                        <option value="Fixed Piece">Fixed Piece</option>
                    </select>

                    <div id="fixedPieceSelectors" style={{ display: 'none' }}>
                        <select id="PieceSelector" className="dropdown">
                            <option value="Knight">Knight</option>
                            <option value="Bishop">Bishop</option>
                            <option value="Rook">Rook</option>
                            <option value="Queen">Queen</option>
                            <option value="King">King</option>
                        </select>
                        <select id="SquareFixPieceSelector1" className="dropdown">
                            {[...'abcdefgh'].map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select id="SquareFixPieceSelector2" className="dropdown">
                            {["-", ...'abcdefgh'].map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div id="numberSelectContainer" className="number-select-container"></div>

                    <select id="numberSelect" className="dropdown" disabled>
                        {[...Array(960)].map((_, i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </section>

                <section className="chessboard-container">
                    <div id="loading-circle" className="loading-spinner" style={{
                        display: 'none', position: 'absolute', top: 0, left: '50%', width: '24px', height: '24px',
                        border: '8px solid #8abfe2', borderTop: '8px solid #3498db', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', zIndex: 1000, pointerEvents: 'none',
                        marginTop: '170px', marginLeft: '-350px'
                    }}></div>
                    <button className="lichess-analysis" id="lichessBtn" style={{
                        display: 'none', position: 'absolute'
                    }}>
                        Lichess Analysis
                    </button>

                    <div className="chessboard" id="chessboard" style={{ position: 'relative' }}>
                        {[...Array(8)].map((_, row) => (
                            <div className="row" key={row}>
                                {[...Array(8)].map((_, col) => {
                                    const squareColor = (row + col) % 2 === 0 ? 'white' : 'black';
                                    const square = `${'abcdefgh'[col]}${8 - row}`;
                                    return (
                                        <div
                                            className={`square ${squareColor}`}
                                            key={col}
                                            data-row={row}
                                            data-col={col}
                                            data-square={square}
                                        ></div>
                                    );
                                })}
                            </div>
                        ))}
                        <canvas id="arrow-layer" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 4 }}></canvas>
                    </div>

                    <div className="controls-container">
                        <div className="mode">
                            <button id="ratedBtn" className="inactive">Rated</button>
                            <button id="trainingBtn" className="active">Training</button>
                        </div>
                        <div className="button-separator"></div>
                        <div className="color">
                            <button id="whiteBtn" className="active">White</button>
                            <button id="blackBtn" className="inactive">Black</button>
                            <button id="randomBtn" className="color-btn inactive">Random</button>
                        </div>
                        <div className="button-separator"></div>
                        <div className="action-buttons">
                            <button id="startBtn" className="start-button">Start</button>
                        </div>
                        <div className="move-list-container" id="moveListContainer" style={{ position: 'relative' }}>
                            <div id="browseButtonContainer">
                                <button className="back-button" id="backButton"></button>
                                <button id="browseallthewayback" className="browseallthewayback"></button>
                                <button id="browseback" className="browseback"></button>
                                <button id="browseforward" className="browseforward"></button>
                                <button id="browseallthewayforward" className="browseallthewayforward"></button>
                            </div>
                            <ul className="move-list" id="moveList"></ul>
                        </div>
                    </div>
                </section>

                <section className="text-output" style={{ marginLeft: '-250px', display: 'flex', alignItems: 'center' }}>
                    <span className="rating-box">
                        Rating: <span id="ratingDisplay">1500</span>
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px' }} id="ratingChangeButtons">
                        <button id="ratingUp" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', height: '28px' }}>
                            <svg width="28" height="20" viewBox="0 0 14 10" style={{ display: 'block' }}>
                                <polygon points="7,2 2,8 12,8" fill="#adf" />
                            </svg>
                        </button>
                        <button id="ratingDown" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', height: '28px' }}>
                            <svg width="28" height="20" viewBox="0 0 14 10" style={{ display: 'block' }}>
                                <polygon points="2,2 12,2 7,8" fill="#adf" />
                            </svg>
                        </button>
                    </span>
                </section>
                <button id="playAgainBtn" className="start-button" style={{ display: 'none', marginLeft: '75rem', marginTop: '-10rem' }}>Play Again</button>

                <div id="loginMessage" style={{ color: 'red', display: 'none', marginTop: '10px' }}>
                    Log in to play rated
                </div>

                <div id="fullScreenLoadingOverlay">
                    <div className="loader">
                        <svg width="60" height="60" viewBox="0 0 50 50">
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray="31.4 31.4"
                                transform="rotate(-90 25 25)"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 25 25"
                                    to="360 25 25"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </svg>
                    </div>
                    Processing moves, please wait...
                </div>
            </main>
        </>
    );
}