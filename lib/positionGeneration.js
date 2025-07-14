import { STARTING_POSITIONS } from './startingPositions';

// Convert 960 index to legal Chess960 FEN
export function freestyleNumberToFEN(number) {
    const key = number.toString().padStart(3, '0');
    const frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error("Invalid position number: " + number);
    return `${frontRank.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${frontRank} w KQkq - 0 1`;
}

// Return a board matrix with piece images (for UI rendering)
export function getPosition(number, color) {
    const key = number.toString().padStart(3, '0');
    let frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error("Invalid position number: " + number);

    const pieceMap = { 'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N' };
    const mapPiece = (piece, c) => `${c}_${piece}`;

    let backRank, pawnColor;
    if (color === 'black') {
        frontRank = frontRank.split('').reverse().join('');
        backRank = frontRank;
        pawnColor = 'b';
    } else {
        backRank = frontRank;
        pawnColor = 'w';
    }

    const board = [
        backRank.split('').map(p => mapPiece(pieceMap[p], color === 'black' ? 'w' : 'b')),
        Array(8).fill(mapPiece('P', color === 'black' ? 'w' : 'b')),
        ...Array(4).fill(Array(8).fill('')),
        Array(8).fill(mapPiece('P', color === 'black' ? 'b' : 'w')),
        frontRank.split('').map(p => mapPiece(pieceMap[p], color === 'black' ? 'b' : 'w')),
    ];

    return board;
}

// Used for filtering by fixed pieces (e.g. all positions where king is on e1 and rook on h1)
export function positionWithFixedPieces(piece, firstFile, secondFile = null) {
    const pieceLetterMap = {
        king: 'K',
        queen: 'Q',
        rook: 'R',
        bishop: 'B',
        knight: 'N'
    };
    const letter = pieceLetterMap[piece.toLowerCase()];
    if (!letter) throw new Error("Unknown piece: " + piece);

    const fileToIndex = (file) => file.charCodeAt(0) - 'a'.charCodeAt(0);
    const firstIdx = fileToIndex(firstFile);
    const secondIdx = secondFile !== null && secondFile !== '-' ? fileToIndex(secondFile) : null;

    const matching = [];

    for (const [key, pos] of Object.entries(STARTING_POSITIONS)) {
        const indices = [...pos].reduce((acc, ch, i) => {
            if (ch === letter) acc.push(i);
            return acc;
        }, []);

        if (!indices.includes(firstIdx)) continue;
        if (secondIdx !== null && (!indices.includes(secondIdx) || secondIdx === firstIdx)) continue;

        matching.push(key);
    }

    return matching;
}
