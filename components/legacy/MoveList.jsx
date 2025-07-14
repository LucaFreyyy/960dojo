import React from 'react';

export default function MoveList({
    moves = [],
    onBack,
    onBrowseBack,
    onBrowseAllBack,
    onBrowseForward,
    onBrowseAllForward,
    onPlayAgain,
    showPlayAgain = false,
}) {
    return (
        <div className="move-list-container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                <button className="back-button" onClick={onBack}></button>
                <button className="browseallthewayback" style={{ position: 'absolute', right: '-50px' }} onClick={onBrowseAllBack}></button>
                <button className="browseback" style={{ position: 'absolute', right: '-95px' }} onClick={onBrowseBack}></button>
                <button className="browseforward" style={{ position: 'absolute', right: '-140px' }} onClick={onBrowseForward}></button>
                <button className="browseallthewayforward" style={{ position: 'absolute', right: '-185px' }} onClick={onBrowseAllForward}></button>
            </div>

            <ul className="move-list">
                {moves.map((move, i) => (
                    <li key={i}>{move}</li>
                ))}
            </ul>

            {showPlayAgain && (
                <button
                    className="start-button"
                    onClick={onPlayAgain}
                    style={{
                        position: 'absolute',
                        top: '120%',
                        left: '60%',
                        transform: 'translate(-50%, 20px)',
                        zIndex: 1200,
                        pointerEvents: 'auto',
                        width: '200px'
                    }}
                >
                    Play Again
                </button>
            )}
        </div>
    );
}
