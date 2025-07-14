import { useEffect, useState, useRef, useMemo } from 'react';

import Chessboard from './Chessboard';
import ControlPanel from './ControlPanel';
import FixedPieceSelectors from './FixedPieceSelectors';
import LoadingOverlay from './LoadingOverlay';
import MoveList from './MoveList';
import NumberSelect from './NumberSelect';
import RatingDisplay from './RatingDisplay';

import { useArrowDrawing } from '../../hooks/useArrowDrawing';
import { useEventListeners } from '../../hooks/useEventListeners';
import { useRatingControls } from '../../hooks/useRatingControls';
import useLegacyScriptInit from '../../hooks/useLegacyScriptInit';
import useMoveHighlight from '../../hooks/useMoveHighlight';
import { useGameFlow } from '../../hooks/useGameFlow';
import { boardSetupAndDrawing } from '../../lib/boardSetupAndDrawing';

import { createGameGlobals } from '../../lib/globals';

export default function LegacyLayout({ session }) {
    const globals = useRef(createGameGlobals()).current;
    const boardUtils = useMemo(() => boardSetupAndDrawing(globals.gameState, session?.user), [globals, session]);

    const [mode, setMode] = useState('training');
    const [color, setColor] = useState('white');
    const [playAgainVisible, setPlayAgainVisible] = useState(false);
    const [gameState, setGameState] = useState(globals.gameState);

    const boardRef = useRef(null);

    const getUserPreferences = () => ({
        opening_color: session?.user?.opening_color,
        opening_position: session?.user?.opening_position,
        rating_openings: session?.user?.rating_openings,
    });

    const {
        startGame,
        backButtonClick,
        browseBackClick,
        browseAllTheWayBackClick,
        browseForwardClick,
        browseAllTheWayForwardClick,
        playAgain,
    } = useGameFlow({ gameState, setGameState, getUserPreferences, globals });

    // Hook integrations
    useArrowDrawing(gameState, globals);
    useEventListeners(gameState, globals);
    useRatingControls(gameState, globals);
    useMoveHighlight(gameState, globals);
    useGameStateSync(mode, color, gameState, setGameState, globals);
    useLegacyScriptInit({ gameState, setGameState, globals });

    useEffect(() => {
        setGameState(prev => ({
            ...prev,
            isRated: mode === 'rated',
            userColor: color,
        }));
    }, [mode, color]);

    return (
        <>
            <LoadingOverlay />
            <main>
                <FixedPieceSelectors />
                <NumberSelect />
                <Chessboard ref={boardRef} />
                <ControlPanel
                    onModeChange={setMode}
                    onColorChange={setColor}
                    onStart={startGame}
                    onBack={backButtonClick}
                    onBrowseBack={browseBackClick}
                    onBrowseAllTheWayBack={browseAllTheWayBackClick}
                    onBrowseForward={browseForwardClick}
                    onBrowseAllTheWayForward={browseAllTheWayForwardClick}
                    onPlayAgain={playAgain}
                    showPlayAgain={playAgainVisible}
                />
                <MoveList />
                <RatingDisplay />
            </main>
        </>
    );
}
