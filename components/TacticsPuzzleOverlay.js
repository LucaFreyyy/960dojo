import { useId, useLayoutEffect, useRef, useState, useEffect } from 'react';

/**
 * ~1s scribble-drawn pass/fail on the tactics board, then unmounts (puzzle stays finished).
 * pointer-events: none.
 */
export default function TacticsPuzzleOverlay({ visible, solved }) {
  const roughId = useId().replace(/:/g, '');
  const checkRef = useRef(null);
  const crossARef = useRef(null);
  const crossBRef = useRef(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDismissed(false);
      return;
    }
    setDismissed(false);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = reduced ? 600 : 1050;
    const t = window.setTimeout(() => setDismissed(true), ms);
    return () => window.clearTimeout(t);
  }, [visible, solved]);

  useLayoutEffect(() => {
    if (!visible || dismissed) return;
    const setLen = (el, prop) => {
      if (!el) return;
      try {
        el.style.setProperty(prop, String(el.getTotalLength()));
      } catch {
        el.style.setProperty(prop, '120');
      }
    };
    if (solved) {
      setLen(checkRef.current, '--tactics-stroke-len');
    } else {
      setLen(crossARef.current, '--tactics-x-a');
      setLen(crossBRef.current, '--tactics-x-b');
    }
  }, [visible, solved, dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div
      className={`tactics-puzzle-overlay tactics-puzzle-overlay--${solved ? 'success' : 'fail'}`}
      role="status"
      aria-live="polite"
      aria-label={solved ? 'Puzzle solved' : 'Wrong move'}
    >
      <div className="tactics-puzzle-overlay__backdrop" aria-hidden />
      <div className="tactics-puzzle-overlay__burst" aria-hidden />
      <div className="tactics-puzzle-overlay__mark-wrap">
        <svg
          className="tactics-puzzle-overlay__svg"
          viewBox="0 0 100 100"
          width="118"
          height="118"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <filter id={roughId} x="-45%" y="-45%" width="190%" height="190%">
              <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="n" seed="11" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="1.85" />
            </filter>
          </defs>
          <g filter={`url(#${roughId})`} className="tactics-puzzle-overlay__scribble">
            {solved ? (
              <path
                ref={checkRef}
                className="tactics-puzzle-overlay__check"
                d="M 22 52 L 41 71 L 80 29"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <path
                  ref={crossARef}
                  className="tactics-puzzle-overlay__cross tactics-puzzle-overlay__cross--a"
                  d="M 30 30 L 70 70"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  ref={crossBRef}
                  className="tactics-puzzle-overlay__cross tactics-puzzle-overlay__cross--b"
                  d="M 70 30 L 30 70"
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>
        </svg>
        <span className="tactics-puzzle-overlay__caption">{solved ? 'Nice!' : 'Nope'}</span>
      </div>
    </div>
  );
}
