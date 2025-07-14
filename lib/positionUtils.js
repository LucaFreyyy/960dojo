import { STARTING_POSITIONS } from './startingPositions';

/**
 * Converts a piece and color into a piece string like "w_K" or "b_P".
 */
function mapPiece(piece, color) {
    return `${color}_${piece}`;
}

/**
 * Get the 2D matrix representing a Chess960 board setup based on index and color.
 */
export function getPositionMatrixFromIndex(number, color = 'white') {
    const key = number.toString().padStart(3, '0');
    const frontRank = STARTING_POSITIONS[key];

    if (!frontRank) throw new Error(`Invalid position number: ${number}`);

    const pieceMap = { K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N' };

    const reverse = color === 'black';
    const backRank = reverse ? frontRank.split('').reverse() : frontRank.split('');
    const frontRankFinal = reverse ? frontRank.split('').reverse() : frontRank.split('');

    const whitePawns = Array(8).fill(mapPiece('P', 'w'));
    const blackPawns = Array(8).fill(mapPiece('P', 'b'));
    const emptyRank = Array(8).fill('');

    const board = [];

    if (color === 'white') {
        board.push(backRank.map(p => mapPiece(pieceMap[p], 'b')));
        board.push(blackPawns);
        board.push([...emptyRank]);
        board.push([...emptyRank]);
        board.push([...emptyRank]);
        board.push([...emptyRank]);
        board.push(whitePawns);
        board.push(frontRankFinal.map(p => mapPiece(pieceMap[p], 'w')));
    } else {
        board.push(backRank.map(p => mapPiece(pieceMap[p], 'w')));
        board.push(whitePawns);
        board.push([...emptyRank]);
        board.push([...emptyRank]);
        board.push([...emptyRank]);
        board.push([...emptyRank]);
        board.push(blackPawns);
        board.push(frontRankFinal.map(p => mapPiece(pieceMap[p], 'b')));
    }

    return board;
}
