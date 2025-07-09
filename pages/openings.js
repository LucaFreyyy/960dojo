import { useState } from 'react';
import { Chessboard } from 'react-chessboard'; // or your chessboard lib
import '../src/styles/openings.css';

export default function OpeningsPage() {
    const [positionIndex, setPositionIndex] = useState(0);
    const [isTraining, setIsTraining] = useState(true);
    const [color, setColor] = useState('random');
    const [rating, setRating] = useState(100);

    return (
        <div className="openings-page">
            <div
                className="main-content"
                style={{
                    display: 'flex',
                    alignItems: 'center', // changed from 'flex-start' to 'center'
                    gap: '32px',
                    minHeight: '60vh', // optional: ensures enough height for vertical centering
                }}
            >
                <div className="chessboard-wrapper">
                    <Chessboard position={generateFEN(positionIndex)} />
                </div>
                <div className="side-controls" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="position-selectors">
                        <select
                            onChange={(e) => setPositionIndex(Number(e.target.value))}
                            value="random"
                        >
                            <option value="random">Random</option>
                            {[...Array(960)].map((_, i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                        <select
                            onChange={(e) => setPositionIndex(Number(e.target.value))}
                            value={positionIndex}
                        >
                            {[...Array(960)].map((_, i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                    </div>
                    <div className="toggle-buttons">
                        <button
                            className={isTraining ? 'active' : ''}
                            onClick={() => setIsTraining(true)}
                        >Training</button>
                        <button
                            className={!isTraining ? 'active' : ''}
                            onClick={() => setIsTraining(false)}
                        >Rated</button>
                    </div>
                    <div className="color-buttons">
                        {['white', 'black', 'random'].map(c => (
                            <button
                                key={c}
                                className={color === c ? 'active' : ''}
                                onClick={() => setColor(c)}
                            >
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button className="start-button">Start</button>
                </div>
            </div>
            <div className="rating-selector">
                <span className="label">Rating:</span>
                <span>{rating}</span>
                <button onClick={() => setRating(r => Math.max(0, r - 10))}>🔽</button>
                <button onClick={() => setRating(r => r + 10)}>🔼</button>
            </div>
        </div >
    );
}

function generateFEN(index) {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'; // replace with real 960 FEN gen
}