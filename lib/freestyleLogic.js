import { STARTING_POSITIONS } from './startingPositions';

const pieceLetterMap = {
    king: 'K',
    queen: 'Q',
    rook: 'R',
    bishop: 'B',
    knight: 'N',
};

/**
 * Returns an array of position numbers (as strings) where the given piece is
 * fixed at certain files (first and optionally second).
 */
export function positionWithFixedPieces(piece, firstFile, secondFile = null) {
    const letter = pieceLetterMap[piece.toLowerCase()];
    if (!letter) throw new Error('Unknown piece: ' + piece);

    function fileToIndex(file) {
        return file.charCodeAt(0) - 'a'.charCodeAt(0);
    }

    const firstIdx = fileToIndex(firstFile);
    const secondIdx = secondFile ? fileToIndex(secondFile) : null;

    const matchingPositions = [];

    for (const [key, pos] of Object.entries(STARTING_POSITIONS)) {
        const indices = [...pos].map((c, i) => (c === letter ? i : -1)).filter(i => i !== -1);

        if (!indices.includes(firstIdx)) continue;
        if (secondIdx !== null) {
            if (indices.length < 2) continue;
            if (!indices.includes(secondIdx) || secondIdx === firstIdx) continue;
        }

        matchingPositions.push(key);
    }

    return matchingPositions;
}

/**
 * Converts a 960 position number to a standard FEN string.
 */
export function freestyleNumberToFEN(number) {
    const key = number.toString().padStart(3, '0');
    const frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error('Invalid position number: ' + number);

    return `${frontRank.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${frontRank} w KQkq - 0 1`;
}
