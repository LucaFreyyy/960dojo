import { parseFen, makeFen } from 'chessops/fen';
import { makeSan, parseSan, makeSanAndPlay } from 'chessops/san';
import { defaultGame, ChildNode, makePgn } from 'chessops/pgn';
import { Chess } from 'chessops/chess';
import { parseUci } from 'chessops/util';

export function exposeChessopsGlobalsToWindow() {
    if (typeof window === 'undefined') return;

    window.parseFen = parseFen;
    window.makeFen = makeFen;
    window.makeSan = makeSan;
    window.parseSan = parseSan;
    window.makeSanAndPlay = makeSanAndPlay;
    window.defaultGame = defaultGame;
    window.ChildNode = ChildNode;
    window.makePgn = makePgn;
    window.Chess = Chess;
    window.parseUci = parseUci;
}
