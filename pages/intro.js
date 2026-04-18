import Head from 'next/head';
import Link from 'next/link';

export default function IntroPage() {
  const sectionsInOrder = [
    {
      key: 'puzzle',
      imgSrc: '/landing-page-assets/puzzle.png',
      imgAlt: 'Tactics puzzle preview',
      heading: 'Improve your tactical vision for chess960',
      paragraphs: [
        'Solve puzzles from Freestyle games (generated from YOUR mistakes in the Opening Practice and lichess games)',
      ],
      href: '/tactics',
    },
    {
      key: 'training-mode-opening',
      imgSrc: '/landing-page-assets/training-mode-opening.png',
      imgAlt: 'Training mode starting position preview',
      heading: 'Select starting positions you want to focus on',
      paragraphs: [],
      href: '/openings',
    },
    {
      key: 'opening-in-game',
      imgSrc: '/landing-page-assets/opening-in-game.png',
      imgAlt: 'In-game openings training preview',
      heading: 'Avoid opening traps and lay your own.',
      paragraphs: [
        'Learn how to play chess960 by practice and develop your own strategy.',
        'Planning ahead is key: Get a feel for how to develop and when center control is more important than king safety.',
      ],
      href: '/openings',
    },
    {
      key: 'opening-after-game-eval-feedback',
      imgSrc: '/landing-page-assets/opening-after-game-eval-feedback.png',
      imgAlt: 'Opening feedback panel',
      heading: 'Get instant feedback of your mistakes',
      paragraphs: [],
      href: '/openings',
    },
    {
      key: 'analysis',
      imgSrc: '/landing-page-assets/analysis.png',
      imgAlt: 'Analysis board with engine lines',
      heading: 'Analyze your games',
      paragraphs: [],
      href: '/analysis',
    },
    {
      key: 'leaderboard',
      imgSrc: '/landing-page-assets/leaderboard.png',
      imgAlt: 'Leaderboard preview',
      heading: 'Climb the leaderboards',
      paragraphs: [],
      href: '/leaderboard',
    },
    {
      key: 'streak',
      imgSrc: '/streak-symbols/full_flame_pawn.png',
      imgAlt: 'Streak flame icon',
      imgClassName: 'peck-like-landing__img--icon',
      heading: 'Be consistent and hold your streak',
      paragraphs: [],
      href: '/leaderboard',
    },
    {
      key: 'theme-selection-and-custom-board-and-pieces',
      imgSrc: '/landing-page-assets/theme-selection-and-custom-board-and-pieces.png',
      imgAlt: 'Theme and piece settings',
      heading: 'Customize visuals',
      paragraphs: [],
      href: '/settings',
    },
    {
      key: 'position-generator',
      imgSrc: '/landing-page-assets/position-generator.png',
      imgAlt: 'Position generator preview',
      heading: 'Generate random positions',
      paragraphs: [],
      href: '/positionGenerator',
    },
  ];

  return (
    <>
      <Head>
        <title>960 Dojo - Intro</title>
      </Head>

      <main className="peck-like-landing">
        <section className="peck-like-landing__hero">
          <div className="peck-like-landing__hero-center">
            <img src="/960_logo_red.png" alt="960 Dojo" className="peck-like-landing__hero-logo" />
            <h1>Welcome to a website dedicated only to chess960!</h1>
            <p className="peck-like-landing__lead">Tired of (having to memorize) opening theory?</p>
            <p className="peck-like-landing__lead">Play chess960 online for free and without ads.</p>
            <p className="peck-like-landing__lead">Constantly improving with your feedback</p>
            <p className="peck-like-landing__enter">
              <Link href="/">Enter 960 Dojo</Link>
            </p>
          </div>
        </section>

        <section className="peck-like-landing__stack">
          {sectionsInOrder.map((s, i) => {
            const alignLeft = i % 2 === 0;
            const blockClassName = `peck-like-landing__block ${
              alignLeft ? 'peck-like-landing__block--left' : 'peck-like-landing__block--right'
            } ${s.key === 'training-mode-opening' ? 'peck-like-landing__block--smaller' : ''}`.trim();

            const text = (
              <div>
                <h2>{s.heading}</h2>
                {Array.isArray(s.paragraphs) && s.paragraphs.map((p) => <p key={p}>{p}</p>)}
              </div>
            );

            const img = (
              <img
                src={s.imgSrc}
                alt={s.imgAlt}
                className={s.imgClassName || undefined}
              />
            );

            const article = (
              <article className={blockClassName}>
                {alignLeft ? (
                  <>
                    {text}
                    {img}
                  </>
                ) : (
                  <>
                    {img}
                    {text}
                  </>
                )}
              </article>
            );

            return s.href ? (
              <Link key={s.key} href={s.href} className="peck-like-landing__blockLink">
                {article}
              </Link>
            ) : (
              article
            );
          })}
        </section>

        <Link href="/play" className="peck-like-landing__blockLink">
          <section className="peck-like-landing__teaser">
            <p className="peck-like-landing__mini">And</p>
            <h2>PLAY</h2>
            <p>960 with ratings for different time formats</p>
          </section>
        </Link>

        <section className="peck-like-landing__luca-note">
          <p>
            !Is chess960 harder than standard chess? - I think we just lack experience. After a few training
            sessions I bet you will feel more comfortable from the get go. Also, being exposed to all different
            kinds of patterns must be improving your chess skills over all. In my opinion not even beginners
            should only be taught position 518 ;)
          </p>
        </section>
      </main>
    </>
  );
}
