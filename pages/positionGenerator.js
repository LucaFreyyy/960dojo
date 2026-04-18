import Head from 'next/head';
import { useCallback, useMemo, useRef, useState } from 'react';
import Chessboard from '../components/Chessboard';
import PositionSelector from '../components/PositionSelector';
import PositionDisplay from '../components/PositionDisplay';
import StartBtn from '../components/StartBtn';
import SectionTitle from '../components/SectionTitle';
import { positionNrToStartFen } from '../lib/chess960';

export default function PositionGeneratorPage() {
  const positionRef = useRef(null);

  const [openingNr, setOpeningNr] = useState(0);
  const startFen = useMemo(() => positionNrToStartFen(openingNr), [openingNr]);

  const generate = useCallback(() => {
    const gen = positionRef.current?.generatePosition?.();
    const nr = gen?.openingNr ?? openingNr;
    setOpeningNr(nr);
  }, [openingNr]);

  return (
    <>
      <Head>
        <title>Position Generator - 960 Dojo</title>
      </Head>

      <main className="page-shell position-generator-page">
        <SectionTitle title="Position Generator" />

        <div className="openings-layout">
          <div className="openings-col-board">
            <div className="openings-board-head">
              <PositionDisplay value={openingNr} editable={false} />
            </div>

            <div className="training-chessboard">
              <Chessboard fen={startFen} orientation="white" disabled showCoordinates onWheelNavigate={null} />
            </div>
          </div>

          <div className="openings-col-side openings-col-side--playing">
            <PositionSelector
              ref={positionRef}
              rankedMode={false}
              openingNr={openingNr}
              onOpeningNrChange={setOpeningNr}
              disabled={false}
              minimal={false}
            />

            <div className="narrow-action">
              <StartBtn onClick={generate} label="Generate" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

