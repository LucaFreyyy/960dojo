if (typeof window.arrowStartSquare === 'undefined') window.arrowStartSquare = null;
if (typeof window.currentHoverSquare === 'undefined') window.currentHoverSquare = null;
if (typeof window.previewArrow === 'undefined') window.previewArrow = null;
if (typeof window.previewHighlight === 'undefined') window.previewHighlight = null;
if (typeof window.isRightClickDragging === 'undefined') window.isRightClickDragging = false;
if (typeof window.savedArrows === 'undefined') window.savedArrows = new Set();
if (typeof window.ratingInterval === 'undefined') window.ratingInterval = null;
if (typeof window.MOVE_IN_PROGRESS === 'undefined') window.MOVE_IN_PROGRESS = false;
if (typeof window.HALF_MOVE_THRESHOLD === 'undefined') window.HALF_MOVE_THRESHOLD = 18;
if (typeof window.ENGINE_RUNNING === 'undefined') window.ENGINE_RUNNING = false;
if (typeof window.CURRENTLY_HIGHLIGHTED_SQUARE === 'undefined') window.CURRENTLY_HIGHLIGHTED_SQUARE = null;
if (typeof window.DRAG_START_SQUARE === 'undefined') window.DRAG_START_SQUARE = null;
if (typeof window.userInfo === 'undefined') window.userInfo = null;
if (typeof window.gameState === 'undefined') window.gameState = {
    playing: false,
    position: null,
    userColor: null,
    colorToMove: null,
    premove: null,
    isRated: false,
    userRating: null,
    halfMoveNumber: 0,
    moveHistorySAN: [],
    moveHistoryUCI: [],
    fenHistory: [],
    evaluations: [],
};

if (typeof window.legalMoves === 'undefined') window.legalMoves = [];
if (typeof window.legalSans === 'undefined') window.legalSans = [];
if (typeof window.fenResults === 'undefined') window.fenResults = [];
if (typeof window.moveIsMate === 'undefined') window.moveIsMate = [];
if (typeof window.initialEval === 'undefined') window.initialEval = 0;
if (typeof window.currentBrowsePosition === 'undefined') window.currentBrowsePosition = -1;
if (typeof window.lastDrawnPosition === 'undefined') window.lastDrawnPosition = -1;
