import React, { useState } from 'react';

export default function ControlPanel({
    onModeChange,
    onColorChange,
    onStart,
    onBack,
    onBrowseBack,
    onBrowseAllTheWayBack,
    onBrowseForward,
    onBrowseAllTheWayForward,
    onPlayAgain,
    showPlayAgain = false,
}) {
    const [mode, setMode] = useState('training');
    const [color, setColor] = useState('white');

    const handleModeClick = (selectedMode) => {
        setMode(selectedMode);
        onModeChange?.(selectedMode);
    };

    const handleColorClick = (selectedColor) => {
        setColor(selectedColor);
        onColorChange?.(selectedColor);
    };

    return (
        <div className="controls-container">
            <div className="mode">
                <button
                    className={mode === 'rated' ? 'active' : 'inactive'}
                    onClick={() => handleModeClick('rated')}
                >
                    Rated
                </button>
                <button
                    className={mode === 'training' ? 'active' : 'inactive'}
                    onClick={() => handleModeClick('training')}
                >
                    Training
                </button>
            </div>

            <div className="button-separator"></div>

            <div className="color">
                {['white', 'black', 'random'].map((c) => (
                    <button
                        key={c}
                        className={color === c ? 'active' : 'inactive'}
                        onClick={() => handleColorClick(c)}
                    >
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            <div className="button-separator"></div>

            <div className="action-buttons">
                <button className="start-button" onClick={onStart}>Start</button>
            </div>

            <div className="move-list-container" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                    <button className="back-button" onClick={onBack}></button>
                    <button className="browseallthewayback" style={{ position: 'absolute', right: '-50px' }} onClick={onBrowseAllTheWayBack}></button>
                    <button className="browseback" style={{ position: 'absolute', right: '-95px' }} onClick={onBrowseBack}></button>
                    <button className="browseforward" style={{ position: 'absolute', right: '-140px' }} onClick={onBrowseForward}></button>
                    <button className="browseallthewayforward" style={{ position: 'absolute', right: '-185px' }} onClick={onBrowseAllTheWayForward}></button>
                </div>

                <ul className="move-list"></ul>

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
                            width: '200px',
                        }}
                    >
                        Play Again
                    </button>
                )}
            </div>
        </div>
    );
}
