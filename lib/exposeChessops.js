import { parseFen, makeFen } from 'chessops/fen';
import { makeSan, parseSan, makeSanAndPlay } from 'chessops/san';
import { Chess } from 'chessops/chess';

export function exposeChessopsGlobalsToWindow() {
    if (typeof window === 'undefined') return;

    window.parseFen = parseFen;
    window.makeFen = makeFen;
    window.makeSan = makeSan;
    window.parseSan = parseSan;
    window.makeSanAndPlay = makeSanAndPlay;
    window.Chess = Chess;
}
