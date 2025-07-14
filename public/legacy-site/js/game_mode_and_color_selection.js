async function selectMode(mode) {
    const categorySelect = document.getElementById('Category');
    const user = window.sessionUser;

    console.log('[selectMode] mode before user check:', mode);
    console.log('[selectMode] user:', user);

    if (mode === 'rated' && categorySelect.value !== 'Random') {
        console.log('[selectMode] forcing category to Random');
        categorySelect.value = 'Random';
        await toggleNumberSelect().catch(e => console.error('[selectMode] toggleNumberSelect error:', e));
    }

    document.getElementById('ratedBtn').classList.toggle('active', mode === 'rated');
    document.getElementById('ratedBtn').classList.toggle('inactive', mode !== 'rated');
    document.getElementById('trainingBtn').classList.toggle('active', mode === 'training');
    document.getElementById('trainingBtn').classList.toggle('inactive', mode !== 'training');

    const ratingDisplay = document.getElementById('ratingDisplay');
    const rating = user?.rating_openings ?? 1500;
    ratingDisplay.textContent = `${rating}`;

    document.getElementById('ratingChangeButtons').style.display = (mode === 'rated') ? 'none' : 'block';

    if (mode === 'rated') {
        console.log('[selectMode] entering rated mode');
        selectColor('random');
    } else {
        console.log('[selectMode] entering training mode');
    }
}


function selectColor(color) {
    const isRated = document.getElementById('ratedBtn').classList.contains('active');
    if ((color === 'white' || color === 'black') && isRated) {
        selectMode('training');
    }
    document.getElementById('whiteBtn').classList.toggle('active', color === 'white');
    document.getElementById('whiteBtn').classList.toggle('inactive', color !== 'white');
    document.getElementById('blackBtn').classList.toggle('active', color === 'black');
    document.getElementById('blackBtn').classList.toggle('inactive', color !== 'black');
    document.getElementById('randomBtn').classList.toggle('active', color === 'random');
    document.getElementById('randomBtn').classList.toggle('inactive', color !== 'random');
    const numberSelect = document.getElementById('numberSelect');
    const number = parseInt(numberSelect.value);
    if (color !== 'random') {
        setPositionByNumber(number, color);
    }
}

async function toggleNumberSelect() {
    const select = document.getElementById('Category');
    const numberSelect = document.getElementById('numberSelect');
    const fixedPieceSelectors = document.getElementById('fixedPieceSelectors');
    makeSelectorsNormal();
    switch (select.value) {
        case 'Number Selection':
            selectMode('training');
            fixedPieceSelectors.style.display = 'none';
            numberSelect.disabled = false;
            break;
        case 'Standard':
            selectMode('training');
            numberSelect.disabled = true;
            fixedPieceSelectors.style.display = 'none';
            numberSelect.value = 518;
            await setPositionByNumber(518);
            break;
        case 'Fixed Piece':
            selectMode('training');
            numberSelect.disabled = true;
            fixedPieceSelectors.style.display = 'block';
            createPositionWithFixedPieces();
            break;
        default:
            fixedPieceSelectors.style.display = 'none';
            numberSelect.disabled = true;
    }
}

async function createPositionWithFixedPieces() {
    const piece = document.getElementById('PieceSelector').value;
    const first = document.getElementById('SquareFixPieceSelector1').value;
    const second = document.getElementById('SquareFixPieceSelector2').value;
    const position = position_with_fixed_pieces(piece, first, second);
    const startPosNumbers = position;
    if (startPosNumbers.length === 0) {
        makeSelectorsRed();
        return;
    }
    makeSelectorsNormal();
    const startPosNumbersInt = startPosNumbers.map(n => parseInt(n, 10));
    const randomNumber = startPosNumbersInt[Math.floor(Math.random() * startPosNumbersInt.length)];
    const color = document.querySelector('.color .active').id.replace('Btn', '');
    document.getElementById('numberSelect').value = randomNumber;
    setPositionByNumber(randomNumber, color).catch(console.error);
}

async function onNumberSelectChange() {
    const number = parseInt(document.getElementById('numberSelect').value);
    await setPositionByNumber(number);
}