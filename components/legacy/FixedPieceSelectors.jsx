import React from 'react';

export default function FixedPieceSelectors({
    piece,
    square1,
    square2,
    onPieceChange,
    onSquare1Change,
    onSquare2Change,
    visible = false,
}) {
    if (!visible) return null;

    return (
        <div id="fixedPieceSelectors">
            <select id="PieceSelector" className="dropdown" value={piece} onChange={(e) => onPieceChange(e.target.value)}>
                <option value="Knight">Knight</option>
                <option value="Bishop">Bishop</option>
                <option value="Rook">Rook</option>
                <option value="Queen">Queen</option>
                <option value="King">King</option>
            </select>

            <select id="SquareFixPieceSelector1" className="dropdown" value={square1} onChange={(e) => onSquare1Change(e.target.value)}>
                {[...'abcdefgh'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                ))}
            </select>

            <select id="SquareFixPieceSelector2" className="dropdown" value={square2} onChange={(e) => onSquare2Change(e.target.value)}>
                {["-", ...'abcdefgh'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                ))}
            </select>
        </div>
    );
}
