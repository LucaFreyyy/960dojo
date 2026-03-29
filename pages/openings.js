import ChessBoard from '../components/Chessboard';
import Button from '../components/Button.js'
import { freestyleNumberToFEN } from '../lib/freestyleUtils';

export default function Openings() {

  const handleNewPosition = () => {
    const randomNumber = Math.floor(Math.random() * 960);
    const newFen = freestyleNumberToFEN(randomNumber);
    // Update the board with newFen (we'll do this in Step 2)
    console.log('New FEN generated: ' + newFen);
  };

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
            <ChessBoard />
            <Button onClick={handleNewPosition}>
              New position
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}

