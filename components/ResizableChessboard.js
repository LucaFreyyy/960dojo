import { useState, useRef, useEffect, useCallback } from 'react';
import Chessboard from './Chessboard';

const MIN_SIZE = 280;
const MAX_SIZE = 800;
const STORAGE_KEY = 'chessboard-size';

export default function ResizableChessboard({ ...chessboardProps }) {
  const [boardSize, setBoardSize] = useState(() => {
    if (typeof window === 'undefined') return 560;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const size = Number(stored);
      if (size >= MIN_SIZE && size <= MAX_SIZE) return size;
    }
    return 560;
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0, size: 560 });

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      size: boardSize,
    };
  }, [boardSize]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      const delta = (deltaX + deltaY) / 2; // Average both axes for smooth resize
      
      let newSize = startPosRef.current.size + delta;
      newSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newSize));
      
      setBoardSize(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, String(boardSize));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, boardSize]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${boardSize}px`,
        maxWidth: '100%',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
        <Chessboard {...chessboardProps} />
      </div>
      
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 24,
          height: 24,
          cursor: isDragging ? 'nwse-resize' : 'nwse-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomRightRadius: 12,
          background: 'rgba(255, 255, 255, 0.05)',
          transition: isDragging ? 'none' : 'background 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          style={{ opacity: 0.6, pointerEvents: 'none' }}
        >
          <path
            d="M11 11L11 6M11 11L6 11M11 11L7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            style={{ color: '#e2e8f0' }}
          />
        </svg>
      </div>
    </div>
  );
}
