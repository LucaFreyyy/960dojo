import { Chess as ChessopsChess } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { makeSan, parseSan } from 'chessops/san';
import { makeSquare, parseSquare } from 'chessops/util';

const PROMOTIONS = ['queen', 'rook', 'bishop', 'knight'];

function createPositionFromFen(fen) {
  const parsed = parseFen(fen);
  if (parsed.isErr) throw new Error(`Invalid FEN: ${parsed.error}`);
  const res = ChessopsChess.fromSetup(parsed.value);
  if (res.isErr) throw new Error(`Invalid position: ${res.error}`);
  return res.value;
}

function normalizePromotion(p) {
  if (!p) return undefined;
  const s = String(p).toLowerCase();
  if (s === 'q' || s === 'queen') return 'queen';
  if (s === 'r' || s === 'rook') return 'rook';
  if (s === 'b' || s === 'bishop') return 'bishop';
  if (s === 'n' || s === 'knight') return 'knight';
  return undefined;
}

export class Chess {
  constructor(fen = undefined) {
    this.pos = fen ? createPositionFromFen(fen) : ChessopsChess.default();
  }

  fen() {
    return makeFen(this.pos.toSetup());
  }

  turn() {
    return this.pos.turn === 'white' ? 'w' : 'b';
  }

  moveNumber() {
    return this.pos.fullmoves;
  }

  isGameOver() {
    return this.pos.isEnd();
  }

  moves(options = {}) {
    const verbose = Boolean(options?.verbose);
    const out = [];
    const ctx = this.pos.ctx();
    for (const fromSq of this.pos.board[this.pos.turn]) {
      const from = makeSquare(fromSq);
      for (const toSq of this.pos.dests(fromSq, ctx)) {
        const to = makeSquare(toSq);
        const isPromotionRank = to[1] === '1' || to[1] === '8';
        const isPawn = this.pos.board.getRole(fromSq) === 'pawn';
        const candidates = isPawn && isPromotionRank ? PROMOTIONS : [undefined];
        for (const promotion of candidates) {
          const move = { from: fromSq, to: toSq, promotion };
          if (!this.pos.isLegal(move, ctx)) continue;
          const san = makeSan(this.pos, move);
          if (verbose) out.push({ san, from, to, promotion });
          else out.push(san);
        }
      }
    }
    return out;
  }

  move(input) {
    if (typeof input === 'string') {
      const move = parseSan(this.pos, input);
      if (!move || !this.pos.isLegal(move)) throw new Error(`Invalid move: ${input}`);
      const san = makeSan(this.pos, move);
      this.pos.play(move);
      return {
        san,
        from: makeSquare(move.from),
        to: makeSquare(move.to),
        promotion: move.promotion,
      };
    }

    if (!input || typeof input !== 'object') return null;
    const fromSq = parseSquare(input.from);
    const toSq = parseSquare(input.to);
    if (fromSq === undefined || toSq === undefined) return null;
    const move = { from: fromSq, to: toSq, promotion: normalizePromotion(input.promotion) };
    if (!this.pos.isLegal(move)) return null;
    const san = makeSan(this.pos, move);
    this.pos.play(move);
    return {
      san,
      from: makeSquare(move.from),
      to: makeSquare(move.to),
      promotion: move.promotion,
    };
  }
}

