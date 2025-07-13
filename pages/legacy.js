import Head from 'next/head';
import { useEffect } from 'react';

export default function LegacyPage({ session }) {
    useEffect(() => {
        if (session?.user) {
            window.user = session.user;
        }

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

        scriptFiles.forEach((file) => {
            const script = document.createElement('script');
            script.src = `/legacy-site/js/${file}`;
            script.async = false;
            script.onload = () => {
                loadedCount++;
                if (loadedCount === scriptFiles.length) {
                    if (typeof initializeUI === 'function') {
                        initializeUI(); console.log('UI ready');
                        initializeEventListeners(); console.log('Listeners attached');
                        setupRatingControls();
                        setupArrowDrawing();
                        initializeBoard();
                        resizeArrowCanvas();
                        window.addEventListener('resize', resizeArrowCanvas);
                    }
                }
            };
            document.body.appendChild(script);
        });
    }, [session]);

    return (
        <>
            <Head>
                <title>960 Dojo</title>
                <link rel="icon" href="/legacy-site/favicon.ico" />
                <link rel="stylesheet" href="/legacy-site/css/base.css" />
                <link rel="stylesheet" href="/legacy-site/css/buttons.css" />
                <link rel="stylesheet" href="/legacy-site/css/dropdown.css" />
                <link rel="stylesheet" href="/legacy-site/css/chessboard.css" />
                <link rel="stylesheet" href="/legacy-site/css/selectors.css" />
                <link rel="stylesheet" href="/legacy-site/css/others.css" />
            </Head>

            <div id="fullScreenLoadingOverlay" style={{ display: 'none' }}>
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
                Loading, please wait...
            </div>

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
                    <button className="lichess-analysis" id="lichessBtn" style={{
                        display: 'none', position: 'absolute', top: '0px', left: '50%', marginTop: '170px', marginLeft: '210px'
                    }}>
                        Lichess Analysis
                    </button>

                    <div id="loading-circle" className="loading-spinner" style={{
                        display: 'none', position: 'absolute', top: 0, left: '50%', width: '24px', height: '24px',
                        border: '8px solid #8abfe2', borderTop: '8px solid #3498db', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', zIndex: 1000, pointerEvents: 'none',
                        marginTop: '170px', marginLeft: '-350px'
                    }}></div>

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
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }} id="browseButtonContainer">
                                <button className="back-button" id="backButton"></button>
                                <button id="browseallthewayback" className="browseallthewayback" style={{ position: 'absolute', right: '-50px' }}></button>
                                <button id="browseback" className="browseback" style={{ position: 'absolute', right: '-95px' }}></button>
                                <button id="browseforward" className="browseforward" style={{ position: 'absolute', right: '-140px' }}></button>
                                <button id="browseallthewayforward" className="browseallthewayforward" style={{ position: 'absolute', right: '-185px' }}></button>
                            </div>
                            <ul className="move-list" id="moveList"></ul>
                            <button id="playAgainBtn" className="start-button" style={{ display: 'none', position: 'absolute', top: '120%', left: '60%', transform: 'translate(-50%, 20px)', zIndex: 1200, pointerEvents: 'auto', width: '200px' }}>Play Again</button>
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

                <div id="loginMessage" style={{ color: 'red', display: 'none', marginTop: '10px' }}>
                    Log in to play rated
                </div>
            </main>
        </>
    );
}