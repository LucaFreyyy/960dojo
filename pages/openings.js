import { useState } from 'react'
import ChessBoard from '../components/Chessboard';
import Button from '../components/Button.js'
import { freestyleNumberToFEN } from '../lib/freestyleUtils';
import { getDatabaseMove } from '../lib/moveGeneration';

export default function Openings() {

  const [fen, setFen] = useState(freestyleNumberToFEN(1))
  const [orientation, setOrientation] = useState('white')

  const handleNewPosition = () => {
    const randomNumber = Math.floor(Math.random() * 960);
    const newFen = freestyleNumberToFEN(randomNumber);
    const randomColor = Math.random() < 0.5 ? 'white' : 'black';

    setFen(newFen)
    setOrientation(randomColor)
    console.log('New FEN generated: ' + fen);
  };

  const handleGetDatabaseMove = async () => {
    await getDatabaseMove(fen, 1500)
  }

  return (
    <>
      <main>
        <section style={{
          maxWidth: 800,
          margin: '2rem auto',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.2rem',
            marginBottom: '2rem'
          }}>
            Openings V2 🧭
          </h2>

          <div className="chessboard-container">
            <ChessBoard fen={fen} orientation={orientation} />
            <Button onClick={handleNewPosition}>
              New position
            </Button>
            <Button onClick={handleGetDatabaseMove}>
              Get Database Move
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}

