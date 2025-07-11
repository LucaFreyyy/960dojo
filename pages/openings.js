import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import '../src/styles/openings.css';
import { freestyleNumberToFEN } from '../lib/chesslogic';

export default function OpeningsPage() {
    const [positionIndex, setPositionIndex] = useState(0);
    const [isTraining, setIsTraining] = useState(true);
    const [color, setColor] = useState('random');
    const [rating, setRating] = useState(1500);
    const [fen, setFen] = useState(freestyleNumberToFEN(0));

    // State for mode and fixed pieces
    const [mode, setMode] = useState('random');
    const [fixedPiece, setFixedPiece] = useState('knight');
    const [fixedFiles, setFixedFiles] = useState(['a', '-']);

    useEffect(() => {
        try {
            const newFen = freestyleNumberToFEN(positionIndex);
            setFen(newFen);
        } catch (err) {
            console.error('Invalid position index:', positionIndex);
        }
    }, [positionIndex, color]);

    // Dummy function for fixed pieces positions
    function getPosWithFixedPieces() {
        // Return a filtered array of indices, e.g. [1, 5, 10]
        return [1, 5, 10];
    }

    // Handle mode change
    function handleModeChange(e) {
        const newMode = e.target.value;
        setMode(newMode);
        if (newMode === 'random') {
            const rand = Math.floor(Math.random() * 960);
            setPositionIndex(rand);
        } else if (newMode === 'nrSelect') {
            setPositionIndex(0);
        } else if (newMode === 'fixedPieces') {
            const positions = getPosWithFixedPieces(fixedPiece, fixedFiles);
            setPositionIndex(positions[0] || 0);
        }
    }

    // Handle fixed piece or file change
    function handleFixedPieceChange(e) {
        const newPiece = e.target.value;
        setFixedPiece(newPiece);
        const positions = getPosWithFixedPieces(newPiece, fixedFiles);
        setPositionIndex(positions[0] || 0);
    }
    function handleFixedFileChange(idx, val) {
        const newFiles = [...fixedFiles];
        newFiles[idx] = val;
        setFixedFiles(newFiles);
        const positions = getPosWithFixedPieces(fixedPiece, newFiles);
        setPositionIndex(positions[0] || 0);
    }

    // Get options for number select
    let numberOptions = [];
    if (mode === 'fixedPieces') {
        numberOptions = getPosWithFixedPieces(fixedPiece, fixedFiles);
    } else {
        numberOptions = [...Array(960).keys()];
    }

    function useAcceleratingHold(onChange) {
        const rafRef = React.useRef();
        const active = React.useRef(false);
        const directionRef = React.useRef(1);
        const speedRef = React.useRef(100); // starting speed (ms)
        const lastTimeRef = React.useRef(0);
        const stepRef = React.useRef(1);
        const rampRef = React.useRef(0);

        function loop(now) {
            if (!active.current) return;

            const elapsed = now - lastTimeRef.current;
            if (elapsed >= speedRef.current) {
                rampRef.current += 1;

                // Step size increase after 10/20 ticks
                if (rampRef.current === 10) stepRef.current = 5;
                else if (rampRef.current === 20) stepRef.current = 10;

                // Accelerate by reducing delay
                if (rampRef.current === 5) speedRef.current = 60;
                else if (rampRef.current === 15) speedRef.current = 30;

                onChange(directionRef.current * stepRef.current);
                lastTimeRef.current = now;
            }

            rafRef.current = requestAnimationFrame(loop);
        }

        function start(direction) {
            if (active.current) return;
            active.current = true;

            directionRef.current = direction;
            stepRef.current = 1;
            rampRef.current = 0;
            speedRef.current = 100;
            lastTimeRef.current = performance.now();

            onChange(direction * stepRef.current); // First change immediately
            rafRef.current = requestAnimationFrame(loop);
        }

        function stop() {
            active.current = false;
            cancelAnimationFrame(rafRef.current);
        }

        return { start, stop };
    }
    const decHold = useAcceleratingHold((delta) => setRating(r => Math.max(0, r - delta)));
    const incHold = useAcceleratingHold((delta) => setRating(r => r + delta));


    return (
        <div className="openings-page">
            <div className="main-content">
                <div className="chessboard-wrapper">
                    <Chessboard position={fen} />
                </div>
                <div className="side-controls">
                    <div className="position-selectors">
                        <select
                            onChange={handleModeChange}
                            value={mode}
                        >
                            <option value="random">Random</option>
                            <option value="nrSelect">Number Selection</option>
                            <option value="fixedPieces">Fixed Piece(s)</option>
                        </select>
                        <select className='small-selector'
                            disabled={mode === 'random'}
                            onChange={e => {
                                const val = Number(e.target.value);
                                if (mode === 'nrSelect' || mode === 'fixedPieces') setPositionIndex(val);
                            }}
                            value={positionIndex}
                        >
                            {numberOptions.map(i => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                    </div>

                    <hr className="separator" />

                    <div className='position-selectors'>
                        {mode === 'fixedPieces' && (
                            <div className="fixed-pieces-selectors">
                                <select className='small-selector' value={fixedPiece} onChange={handleFixedPieceChange}>
                                    <option value="knight">♞</option>
                                    <option value="bishop">♝</option>
                                    <option value="rook">♜</option>
                                    <option value="queen">♛</option>
                                    <option value="king">♚</option>
                                </select>
                                <select className='small-selector' value={fixedFiles[0]} onChange={e => handleFixedFileChange(0, e.target.value)}>
                                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <select className='small-selector' value={fixedFiles[1]} onChange={e => handleFixedFileChange(1, e.target.value)}>
                                    <option value="-">-</option>
                                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {mode === 'fixedPieces' && <hr className="separator" />}

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

                    <hr className="separator" />

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

                    <hr className="separator" />

                    <button className="start-button">Start</button>
                </div>
            </div>
            <div className="rating-selector">
                <span className="rating-label">Rating:</span>
                <span>{rating}</span>
                <button
                    className="arrow-btn"
                    onMouseDown={() => decHold.start(-1)}
                    onMouseUp={decHold.stop}
                    onMouseLeave={decHold.stop}
                    onTouchStart={() => decHold.start(-1)}
                    onTouchEnd={decHold.stop}
                    aria-label="Decrease rating"
                    style={{ padding: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <svg width="100%" height="100%" viewBox="0 0 24 24" style={{ display: 'block', borderRadius: '6px' }} fill="none">
                        <path d="M12 16L6 10H18L12 16Z" fill="var(--text-color-main)" />
                    </svg>
                </button>
                <button
                    className="arrow-btn"
                    onMouseDown={() => incHold.start(1)}
                    onMouseUp={incHold.stop}
                    onMouseLeave={incHold.stop}
                    onTouchStart={() => incHold.start(1)}
                    onTouchEnd={incHold.stop}
                    aria-label="Increase rating"
                    style={{ padding: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <svg width="100%" height="100%" viewBox="0 0 24 24" style={{ display: 'block', borderRadius: '6px' }} fill="none">
                        <path d="M12 8L18 14H6L12 8Z" fill="var(--text-color-main)" />
                    </svg>
                </button>
            </div>
        </div >
    );
}
