import { useState } from 'react';
import ChessBoard from '../components/Chessboard';
import Button from '../components/Button.js';
import { freestyleNumberToFEN } from '../lib/freestyleUtils';
import { getDatabaseMove, getMove } from '../lib/moveGeneration';
import { getStockfishMove } from '../lib/stockfishUtils';

export default function ChessboardTest() {

  const [startFen, setStartFen] = useState(freestyleNumberToFEN(1));
  const [currentFen, setCurrentFen] = useState(freestyleNumberToFEN(1));
  const [orientation, setOrientation] = useState('white');

  const handlePositionChange = (newFen) => {
    console.log('Position changed, newFen: ' + newFen);
    setCurrentFen(newFen);
  };

  const handleNewPosition = () => {
    const randomNumber = Math.floor(Math.random() * 960);
    const newFen = freestyleNumberToFEN(randomNumber);
    const randomColor = Math.random() < 0.5 ? 'white' : 'black';

    setStartFen(newFen);
    setCurrentFen(newFen);
    setOrientation(randomColor);
    console.log('New Start FEN generated: ' + startFen);
  };

  const handleGetDatabaseMove = async () => {
    const move = await getDatabaseMove(currentFen, 1500);
    console.log('Database returned move: ' + move);
  };

  const handleGetStockfishMove = async () => {
    const result = await getStockfishMove(currentFen, 1500);
    if (result) {
      console.log('Stockfish returned move:', result.san);
    } else {
      console.log('Stockfish returned: null');
    }
  };

  const handleGetMove = async () => {
    const move = await getMove(currentFen, 1500);
    console.log('Returned move: ' + move);
  };

  return (
    <>
      <main>
        <section className="dev-test-section">
          <h2 className="dev-test-title">
            ChessboardTest
          </h2>

          <div className="chessboard-container">
            <ChessBoard fen={startFen} orientation={orientation} onPositionChange={handlePositionChange} />
            <Button onClick={handleNewPosition}>
              New position
            </Button>
            <Button onClick={handleGetDatabaseMove}>
              Get Database Move
            </Button>
            <Button onClick={handleGetStockfishMove}>
              Get Stockfish Move
            </Button>
            <Button onClick={handleGetMove}>
              Get Move
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
