import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { FaCoffee } from 'react-icons/fa';
import fs from 'node:fs/promises';
import path from 'node:path';
import Chessboard from '../components/Chessboard';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';
import { fetchUserSettings, upsertUserSettings } from '../lib/openingsDb';
import { positionNrToStartFen } from '../lib/chess960';
import { playButtonClick } from '../lib/soundEffects';
import { useBoardVisuals } from '../lib/BoardVisualsContext';
import {
  normalizeBoardTheme,
  normalizePieceSet,
} from '../lib/boardVisuals';

export default function SettingsPage({ allPieceSets = [], allBoardThemes = [] }) {
  const session = useSupabaseSession();
  const { setBoardVisuals } = useBoardVisuals();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingDeepAnal, setOpeningDeepAnal] = useState(false);
  const [pieceSet, setPieceSet] = useState(allPieceSets[0] || 'cburnett');
  const [boardTheme, setBoardTheme] = useState(allBoardThemes[0] || 'brown');
  const settingsReadyRef = useRef(false);

  useEffect(() => {
    const email = session?.user?.email || null;
    if (!email) {
      setUserId(null);
      setLoading(false);
      settingsReadyRef.current = false;
      return;
    }
    setLoading(true);
    hashEmail(email)
      .then((id) => setUserId(id))
      .catch(() => {
        setUserId(null);
        setLoading(false);
      });
  }, [session?.user?.email]);

  useEffect(() => {
    if (!userId) return;
    settingsReadyRef.current = false;
    (async () => {
      const s = await fetchUserSettings(userId);
      if (s) {
        setOpeningDeepAnal(Boolean(s.opening_deep_anal));
        if (typeof s.piece_set === 'string' && s.piece_set) setPieceSet(normalizePieceSet(s.piece_set));
        if (typeof s.board === 'string' && s.board) setBoardTheme(normalizeBoardTheme(s.board));
      }
      settingsReadyRef.current = true;
      setLoading(false);
    })();
  }, [userId]);

  useEffect(() => {
    if (!userId || !settingsReadyRef.current) return;
    (async () => {
      await upsertUserSettings(userId, {
        opening_deep_anal: openingDeepAnal,
        piece_set: pieceSet,
        board: boardTheme,
      });
    })();
  }, [userId, openingDeepAnal, pieceSet, boardTheme]);

  useEffect(() => {
    setBoardVisuals({ pieceSet, boardTheme });
  }, [pieceSet, boardTheme, setBoardVisuals]);

  return (
    <>
      <Head>
        <title>Settings - 960 Dojo</title>
      </Head>
      <main className="page-shell settings-page">
        <h1 className="page-title">Settings</h1>

        {!session?.user ? (
          <p className="text-warn">Log in to persist your settings.</p>
        ) : null}
        {loading ? <p className="settings-save-note">Loading…</p> : null}

        <section className="settings-section">
          <h2 className="settings-section__title">Board visuals</h2>
          <div className="settings-grid">
            <label className="settings-field">
              Piece set
              <select value={pieceSet} onChange={(e) => setPieceSet(e.target.value)}>
                {allPieceSets.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Board theme
              <select value={boardTheme} onChange={(e) => setBoardTheme(e.target.value)}>
                {allBoardThemes.map((v) => (
                  <option key={v} value={v}>{v.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '')}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="settings-sample-board">
            <Chessboard
              fen={positionNrToStartFen(0)}
              orientation="white"
              disabled={false}
              movableColor="none"
              showCoordinates={false}
              pieceSet={pieceSet}
              boardTheme={boardTheme}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Openings Page Settings</h2>
          <label className="opening-deep-anal-toggle">
            <input
              type="checkbox"
              checked={openingDeepAnal}
              onChange={(e) => {
                playButtonClick();
                setOpeningDeepAnal(e.target.checked);
              }}
            />
            <span className="slider-toggle__track" aria-hidden>
              <span className="slider-toggle__thumb" />
            </span>
            <span>analyze each move [not recommended on phone]</span>
          </label>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const pieceDir = path.join(process.cwd(), 'public', 'lichess-assets', 'piece');
  const boardDir = path.join(process.cwd(), 'public', 'lichess-assets', 'board');

  let allPieceSets = [];
  let allBoardThemes = [];

  try {
    const pieceEntries = await fs.readdir(pieceDir, { withFileTypes: true });
    allPieceSets = pieceEntries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {}

  try {
    const boardEntries = await fs.readdir(boardDir, { withFileTypes: true });
    allBoardThemes = boardEntries
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((n) => /\.(png|jpg|jpeg|svg|webp)$/i.test(n))
      .filter((n) => !n.includes('.thumbnail.') && !n.includes('.orig.'))
      .filter((n) => !n.endsWith('.last-move.png') && !n.endsWith('.move-dest.png') && !n.endsWith('.current-premove.png') && !n.endsWith('.selected.png'))
      .filter((name, idx, arr) => arr.indexOf(name) === idx)
      .sort((a, b) => a.localeCompare(b));
  } catch {}

  if (!allPieceSets.length) allPieceSets = ['cburnett'];
  if (!allBoardThemes.length) allBoardThemes = ['brown.png'];

  return {
    props: {
      allPieceSets,
      allBoardThemes,
    },
  };
}
