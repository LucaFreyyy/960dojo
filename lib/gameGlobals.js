export let arrowStartSquare = null;
export let currentHoverSquare = null;
export let previewArrow = null;
export let previewHighlight = null;
export let isRightClickDragging = false;
export let savedArrows = new Set();
export let ratingInterval = null;
export let MOVE_IN_PROGRESS = false;
export let HALF_MOVE_THRESHOLD = 18;
export let ENGINE_RUNNING = false;
export let CURRENTLY_HIGHLIGHTED_SQUARE = null;
export let DRAG_START_SQUARE = null;

export let legalMoves = [];
export let legalSans = [];
export let fenResults = [];
export let moveIsMate = [];
export let initialEval = 0;
export let currentBrowsePosition = -1;
export let lastDrawnPosition = -1;

export const gameState = {
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
