import Head from 'next/head';
import Link from 'next/link';
import SectionTitle from '../components/SectionTitle';
import Explanation from '../components/Explanation';
import PlayTimeControlButton from '../components/PlayTimeControlButton';

const timeControls = [
  { time: '1+0', label: 'Bullet' },
  { time: '2+1', label: 'Bullet' },
  { time: '3+0', label: 'Blitz' },
  { time: '3+2', label: 'Blitz' },
  { time: '5+0', label: 'Blitz' },
  { time: '5+3', label: 'Blitz' },
  { time: '10+0', label: 'Rapid' },
  { time: '10+5', label: 'Rapid' },
  { time: '15+10', label: 'Rapid' },
  { time: '30+0', label: 'Classical' },
  { time: '30+30', label: 'Classical' },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>960 Dojo</title>
      </Head>

      <main className="home-main">
        <section className="practice">
          <SectionTitle title="Practice" sectionClassName="practice" headingClassName="section-title__heading--home" />
          <div className="practice-grid">
            <div className="practice-card">
              <Link className="practice-box" href="/tactics">
                <h3>Tactics</h3>
              </Link>
              <div className="practice-card__explain">
                <Explanation label="About Tactics">
                  <p>Improve your chess960 pattern recognition with puzzles generated from real games.</p>
                  <p>Failed puzzles get rescheduled from time to time.</p>
                </Explanation>
              </div>
            </div>
            <div className="practice-card">
              <Link className="practice-box" href="/openings">
                <h3>Openings</h3>
              </Link>
              <div className="practice-card__explain">
                <Explanation label="About Openings">
                  <p>Select ranked or practice a type of starting position of your choice.</p>
                  <p>
                    Play against a Maia 2 model finetuned on the lichess database for chess960.
                  </p>
                </Explanation>
              </div>
            </div>
          </div>
        </section>

        <section className="tools">
          <SectionTitle title="Tools" sectionClassName="tools" headingClassName="section-title__heading--home" />
          <div className="practice-grid">
            <div className="practice-card">
              <Link className="practice-box" href="/analysis">
                <h3>Analysis</h3>
              </Link>
              <div className="practice-card__explain">
                <Explanation label="About Analysis">
                  <p>Analyze Chess960 games or any imported PGN/FEN.</p>
                </Explanation>
              </div>
            </div>
            <div className="practice-card">
              <Link className="practice-box" href="/studies">
                <h3>Studies</h3>
              </Link>
              <div className="practice-card__explain">
                <Explanation label="About Studies">
                  <p>Browse and share saved analysis studies.</p>
                </Explanation>
              </div>
            </div>
            <div className="practice-card">
              <Link className="practice-box" href="/positionGenerator">
                <h3>Position Generator</h3>
              </Link>
            </div>
          </div>
        </section>

        <section className="play">
          <SectionTitle title="Play" sectionClassName="play" headingClassName="section-title__heading--home" />
          <div className="time-grid">
            {timeControls.map(({ time, label }) => (
              <PlayTimeControlButton key={time} time={time} label={label} />
            ))}
            <Link href="/play" className="time-box">
              Custom
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
