async function selectMode(mode) {
    const categorySelect = document.getElementById('Category');
    if (!userInfo) mode = 'training';
    if (mode === 'rated' && categorySelect.value !== 'Random') {
        categorySelect.value = 'Random';
        toggleNumberSelect().catch(console.error);
    }
    document.getElementById('ratedBtn').classList.toggle('active', mode === 'rated');
    document.getElementById('ratedBtn').classList.toggle('inactive', mode !== 'rated');
    document.getElementById('trainingBtn').classList.toggle('active', mode === 'training');
    document.getElementById('trainingBtn').classList.toggle('inactive', mode !== 'training');
    const ratingDisplay = document.getElementById('ratingDisplay');
    if (mode === 'rated') {
        ratingDisplay.textContent = `${userInfo.rating}`;
        document.getElementById('ratingChangeButtons').style.display = 'none';
        selectColor('random');
    } else {
        if (userInfo) {
            ratingDisplay.textContent = `${userInfo.rating}`;
        } else {
            ratingDisplay.textContent = `1500`;
        }
        document.getElementById('ratingChangeButtons').style.display = 'block';
    }
}

function ratedButtonClick() {
    if (userInfo) {
        selectMode("rated");
    } else {
        startLogin();
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