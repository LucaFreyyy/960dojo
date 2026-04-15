import Head from 'next/head';
import Link from 'next/link';

export default function IntroPage() {
  return (
    <>
      <Head>
        <title>960 Dojo - Intro</title>
      </Head>

      <main className="peck-like-landing">
        <section className="peck-like-landing__hero">
          <p className="peck-like-landing__label">Pattern Recognition</p>
          <h1>Train your Chess960 instincts.</h1>
          <p className="peck-like-landing__lead">
            Deliberate opening reps, tactical pattern work, and practical analysis in one continuous training loop.
          </p>
          <img
            src="/landing-page-assets/training-mode-opening.png"
            alt="Chess960 opening training preview"
            className="peck-like-landing__hero-img"
          />
          <p className="peck-like-landing__enter">
            <Link href="/">Enter 960 Dojo</Link>
          </p>
        </section>

        <section className="peck-like-landing__band">
          <span>Solve faster</span>
          <span>Master patterns</span>
          <span>Play sharper</span>
          <span>Review deeper</span>
        </section>

        <section className="peck-like-landing__stack">
          <article className="peck-like-landing__block peck-like-landing__block--left">
            <div>
              <p className="peck-like-landing__mini">01 The Method</p>
              <h2>Openings training with structure</h2>
              <p>
                Pick random starts, constrain by piece, or drill exact positions. Build practical confidence from the
                first move.
              </p>
            </div>
            <img src="/landing-page-assets/opening-after-game-eval-feedback.png" alt="Opening feedback panel" />
          </article>

          <article className="peck-like-landing__block peck-like-landing__block--right">
            <img src="/landing-page-assets/puzzle.png" alt="Tactics puzzle preview" />
            <div>
              <p className="peck-like-landing__mini">02 Repetition</p>
              <h2>Tactics that become automatic</h2>
              <p>
                Improve motif recall through repeated exposure and direct feedback, so ideas appear faster over the
                board.
              </p>
            </div>
          </article>

          <article className="peck-like-landing__block peck-like-landing__block--left">
            <div>
              <p className="peck-like-landing__mini">03 Analysis</p>
              <h2>Engine lines you can actually use</h2>
              <p>
                Compare candidate lines, inspect move quality, and connect board arrows to readable engine suggestions.
              </p>
            </div>
            <img src="/landing-page-assets/analysis.png" alt="Analysis board with engine lines" />
          </article>

          <article className="peck-like-landing__block peck-like-landing__block--right">
            <img src="/landing-page-assets/theme-selection-and-custom-board-and-pieces.png" alt="Theme and piece settings" />
            <div>
              <p className="peck-like-landing__mini">04 Personalization</p>
              <h2>Train with your board and pieces</h2>
              <p>
                Keep visuals consistent with your preferences to reduce friction and stay focused on chess decisions.
              </p>
            </div>
          </article>

          <article className="peck-like-landing__block peck-like-landing__block--left">
            <div>
              <p className="peck-like-landing__mini">05 Progress</p>
              <h2>Track your growth over time</h2>
              <p>
                Ratings, streaks, and leaderboard feedback give a clear signal of improvement across training cycles.
              </p>
            </div>
            <img src="/landing-page-assets/leaderboard.png" alt="Leaderboard preview" />
          </article>
        </section>

        <section className="peck-like-landing__teaser">
          <p className="peck-like-landing__mini">Coming Soon</p>
          <h2>Play Section</h2>
          <p>
            A dedicated live play experience is on the way. Until then, enter the dojo and sharpen your game in
            training.
          </p>
          <p className="peck-like-landing__enter">
            <Link href="/">Continue to Home</Link>
          </p>
        </section>
      </main>
    </>
  );
}
