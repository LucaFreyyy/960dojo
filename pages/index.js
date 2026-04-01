import Head from 'next/head';
import { useSupabaseSession } from '../lib/SessionContext';
import Link from 'next/link';
import ChessBoard from '../components/Chessboard';
import SectionTitle from '../components/SectionTitle';

const timeControls = [
  { time: "1+0", label: "Bullet" },
  { time: "2+1", label: "Bullet" },
  { time: "3+0", label: "Blitz" },
  { time: "3+2", label: "Blitz" },
  { time: "5+0", label: "Blitz" },
  { time: "5+3", label: "Blitz" },
  { time: "10+0", label: "Rapid" },
  { time: "10+5", label: "Rapid" },
  { time: "15+10", label: "Rapid" },
  { time: "30+0", label: "Classical" },
  { time: "30+20", label: "Classical" },
];

export default function HomePage() {
  const session = useSupabaseSession();

  return (
    <>
      <Head>
        <title>960 Dojo</title>
      </Head>

      <main>
        <section className="practice">
          <SectionTitle title="Practice" sectionClassName="practice" headingClassName="section-title__heading--home" />
          <div className="practice-grid">
            <Link className="practice-box" href="/tactics">
              <h3>Tactics</h3>
              <p className="practice-desc">
                <span className="emphasis">Improve</span> your <span className="emphasis">chess960 pattern recognition</span> with puzzles generated from real games.
              </p>
            </Link>
            <Link className="practice-box" href="/openings">
              <h3>Openings</h3>
              <div className="practice-desc">
                <p><span className="emphasis">Pick</span> a starting <span className="emphasis">position</span></p>
                <p><span className="emphasis">Play</span> against the <span className="emphasis">lichess database</span> and <span className="emphasis">Stockfish</span> at <span className="emphasis">your level</span></p>
                <p><span className="emphasis">Grind to gain rating</span> in ranked mode to start dominating your games from the very start</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="play">
          <SectionTitle title="Play" sectionClassName="play" headingClassName="section-title__heading--home" />
          <div className="time-grid">
            {timeControls.map(({ time, label }) => (
              <Link
                key={time}
                href={`/play?time=${encodeURIComponent(time)}`}
                className={`time-box`}
              >
                {time}
                <small>{label}</small>
              </Link>
            ))}
            <Link
              href="/play?time=custom"
              className="time-box"
            >
              Custom
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
