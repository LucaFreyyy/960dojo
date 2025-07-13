let arrowStartSquare = null;
let currentHoverSquare = null;
let previewArrow = null;
let previewHighlight = null;
let isRightClickDragging = false;
let savedArrows = new Set();
let ratingInterval = null;
let MOVE_IN_PROGRESS = false;
let HALF_MOVE_THRESHOLD = 18; // 18 we will always stop after bots move, but too lazy to change this now
let ENGINE_RUNNING = false;
let CURRENTLY_HIGHLIGHTED_SQUARE = null;
let DRAG_START_SQUARE = null;
let userInfo = null;
let gameState = {
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

let legalMoves = [];
let legalSans = [];
let fenResults = [];
let moveIsMate = [];
let initialEval = 0;
let currentBrowsePosition = -1;
let lastDrawnPosition = -1;