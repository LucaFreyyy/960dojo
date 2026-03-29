import ChessBoard from '../components/Chessboard';

export default function Openings() {
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
          </div>
        </section>
      </main>
    </>
  )
}

