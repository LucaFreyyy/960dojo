import React, { useRef, useEffect, useState } from 'react';

export default function Chessboard() {
    const boardRef = useRef(null);
    const svgRef = useRef(null);
    const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (boardRef.current) {
            const { width, height } = boardRef.current.getBoundingClientRect();
            setBoardSize({ width, height });
        }

        // Optional: resize listener for responsive boards
        const handleResize = () => {
            if (boardRef.current) {
                const { width, height } = boardRef.current.getBoundingClientRect();
                setBoardSize({ width, height });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section className="chessboard-container">
            <button
                className="lichess-analysis"
                id="lichessBtn"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: '170px',
                    left: '50%',
                    marginLeft: '210px',
                }}
            >
                Lichess Analysis
            </button>

            <div
                id="loading-circle"
                className="loading-spinner"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    width: '24px',
                    height: '24px',
                    border: '8px solid #8abfe2',
                    borderTop: '8px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    marginTop: '170px',
                    marginLeft: '-350px',
                }}
            ></div>

            <div
                className="chessboard"
                id="chessboard"
                style={{ position: 'relative' }}
                ref={boardRef}
            >
                {[...Array(8)].map((_, row) => (
                    <div className="row" key={row}>
                        {[...Array(8)].map((_, col) => {
                            const squareColor = (row + col) % 2 === 0 ? 'white' : 'black';
                            const square = `${'abcdefgh'[col]}${8 - row}`;
                            return (
                                <div
                                    className={`square ${squareColor}`}
                                    key={col}
                                    id={`square-${square}`}
                                    data-row={row}
                                    data-col={col}
                                    data-square={square}
                                />
                            );
                        })}
                    </div>
                ))}

                <svg
                    id="arrow-layer"
                    ref={svgRef}
                    width={boardSize.width}
                    height={boardSize.height}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        zIndex: 4,
                    }}
                />
            </div>
        </section>
    );
}
