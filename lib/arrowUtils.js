/**
 * Utility to create an arrow SVG element between two squares
 * Assumes squares are 64x64 pixels and positioned in an 8x8 grid.
 */
export function drawArrow(startSquare, endSquare, color = 'rgba(255, 0, 0, 0.5)') {
    const svgNS = 'http://www.w3.org/2000/svg';

    const arrow = document.createElementNS(svgNS, 'line');
    arrow.setAttribute('stroke', color);
    arrow.setAttribute('stroke-width', '8');
    arrow.setAttribute('stroke-linecap', 'round');

    const [x1, y1] = getSquareCenter(startSquare);
    const [x2, y2] = getSquareCenter(endSquare);

    arrow.setAttribute('x1', x1);
    arrow.setAttribute('y1', y1);
    arrow.setAttribute('x2', x2);
    arrow.setAttribute('y2', y2);
    arrow.classList.add('arrow');

    return arrow;
}

/**
 * Converts a square index (0-63) into [x, y] center coordinates on the board.
 */
function getSquareCenter(squareIndex) {
    const size = 64; // square size in pixels
    const file = squareIndex % 8;
    const rank = 7 - Math.floor(squareIndex / 8);
    return [file * size + size / 2, rank * size + size / 2];
}

/**
 * Converts a DOM square element ID (like "square-e4") to a 0–63 index.
 */
export function squareIdToIndex(squareId) {
    if (!squareId || !squareId.startsWith('square-')) return null;
    const algebraic = squareId.replace('square-', '');
    return algebraicToIndex(algebraic);
}

/**
 * Converts algebraic notation like 'e4' to a 0–63 square index.
 */
export function algebraicToIndex(sq) {
    return (parseInt(sq[1], 10) - 1) * 8 + (sq.charCodeAt(0) - 'a'.charCodeAt(0));
}

/**
 * Converts a 0–63 square index back to algebraic notation like 'e4'.
 */
export function indexToAlgebraic(idx) {
    const file = String.fromCharCode('a'.charCodeAt(0) + (idx % 8));
    const rank = Math.floor(idx / 8) + 1;
    return file + rank;
}

/**
 * Clears all arrows from the board.
 */
export function clearArrows() {
    const svg = document.getElementById('arrowLayer');
    if (svg) svg.innerHTML = '';
}
