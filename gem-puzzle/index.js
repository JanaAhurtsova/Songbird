//create layout
const body = document.querySelector('body')

const overlay = document.createElement('div');
overlay.classList.add('overlay');

const header = document.createElement('div');
header.classList.add('header');

const headerWrapper = document.createElement('div');
headerWrapper.classList.add('header__wrapper');
header.append(headerWrapper);

const hamburger = document.createElement('span');
hamburger.classList.add('hamburger');

const hamburgerLine = document.createElement('span');
hamburgerLine.classList.add('hamburger__line');
hamburger.append(hamburgerLine);

const wrapper = document.createElement('div');
wrapper.classList.add('wrapper');
body.append(header, wrapper, overlay);

const buttonsContainer = document.createElement('div');
buttonsContainer.classList.add('buttons__container');
headerWrapper.append(buttonsContainer, hamburger);

const shuffleBtn = document.createElement('button');
shuffleBtn.classList.add('button');
shuffleBtn.textContent = 'Shuffle and Start';

const pauseBtn = document.createElement('button');
pauseBtn.classList.add('button');
pauseBtn.textContent = 'Pause';

const saveBtn = document.createElement('button');
saveBtn.classList.add('button');
saveBtn.textContent = 'Save';

const resultBtn = document.createElement('button');
resultBtn.classList.add('button');
resultBtn.textContent = 'Result';
buttonsContainer.append(shuffleBtn, pauseBtn, saveBtn, resultBtn);

const gameProcess = document.createElement('div');
gameProcess.classList.add('game__process');

const move = document.createElement('span');
move.classList.add('text');
move.textContent = 'Move: ';

const moveNum = document.createElement('span');
moveNum.classList.add('text');
moveNum.textContent = '0';
move.append(moveNum);

const volume = document.createElement('div');
volume.classList.add('volume');

const time = document.createElement('span');
time.classList.add('text');
time.textContent = 'Time: ';
gameProcess.append(move, volume, time);

const timeNum = document.createElement('span');
timeNum.classList.add('text');
timeNum.textContent = '00:00';
time.append(timeNum);

const audio = document.createElement('audio');
audio.setAttribute('src', 'assets/drop_sound.mp3')

const frame = document.createElement('div');
frame.classList.add('frame')

const audioShuffle = document.createElement('audio');
audioShuffle.setAttribute('src', 'assets/waterfall.mp3')

const frameSize = document.createElement('span');
frameSize.classList.add('frame__size');

const sizeContainer = document.createElement('div');
sizeContainer.classList.add('choose__size');

const otherSizes = document.createElement('span');
otherSizes.classList.add('sizes');
otherSizes.textContent = 'Other sizes:';

const audioWin = document.createElement('audio');
audioWin.setAttribute('src', 'assets/win.mp3')
wrapper.append(gameProcess, frame, frameSize, otherSizes, sizeContainer);

const size3 = document.createElement('span');
const size4 = document.createElement('span');
const size5 = document.createElement('span');
const size6 = document.createElement('span');
const size7 = document.createElement('span');
const size8 = document.createElement('span');
sizeContainer.append(size3, size4, size5, size6, size7, size8);

const wonCard = document.createElement('div')
wonCard.className = 'won';

const sizes = [size3, size4, size5, size6, size7, size8];

for(let i = 0; i < sizes.length; i++) {
    sizes[i].dataset.id = i + 3;
    sizes[i].className = 'size';
    sizes[i].textContent = `${i + 3}x${i + 3}`
}
size4.className += ' active';

let selected;
let selectedSize;

function changeSize() {
    for(let i = 0; i < sizes.length; i++) {
        if(sizes[i].classList.contains('active')) {
            selectedSize = Number(sizes[i].dataset.id);
        }
    }
}
changeSize();

frameSize.textContent = `Frame size: ${selectedSize}x${selectedSize}`;
let count = 0;
let seconds = 0;
let minutes = 0;
let interval = null;
const emptyNumber = 0;
let blockedCoords = null;

//burger menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    hamburgerLine.classList.toggle('active');
    buttonsContainer.classList.toggle('active');
    overlay.classList.toggle('active');
    body.classList.add('lock');
})

overlay.addEventListener('click', closeBurger);

function closeBurger() {
    hamburger.classList.remove('active');
    hamburgerLine.classList.remove('active');
    buttonsContainer.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('lock');
}

//sound of game
volume.addEventListener('click', () => {
    audio.muted = !audio.muted;
    audioShuffle.muted = !audioShuffle.muted
    if(audio.muted && audioShuffle.muted) {
        volume.classList.add('mute');
    } else {
        volume.classList.remove('mute');
    }
})

//create tiles
let cells = [];

function createTiles() {
    for (let i = 0; i < selectedSize * selectedSize; i++) {
        const cell = document.createElement('button');
        cell.classList.add('cell');
        cell.dataset.id = i;
        frame.append(cell)

        const num = document.createElement('span');
        cell.textContent = i;
        cell.append(num);

        if(cell.textContent === `0`) {
            cell.style.display = 'none'
        }
        cell.style.width = `${frame.offsetWidth * 100 / frame.offsetWidth / selectedSize}%`;
        cell.style.height = `${frame.offsetWidth * 100 / frame.offsetWidth / selectedSize - 0.2}% `;

        cell.setAttribute('draggable', true)

        cells.push(cell)
    }
}

createTiles()

let countTile = selectedSize * selectedSize;
let cellsArr = cells.map(cell => Number(cell.dataset.id));
let matrix = getMatrix(cellsArr);
setPositionCells(matrix);

if(cells.length != countTile) {
    throw new Error(`Must be ${countItem} cells`);
}

function getMatrix(arr) {
    let matrix = Array.from(Array(selectedSize), () => new Array(selectedSize));
    let x = 0;
    let y = 0;

    for(let i = 0; i < arr.length; i++) {
        if(x >= selectedSize) {
            y++;
            x = 0;
        }
        matrix[y][x] = arr[i];
        x++;
    }
    return matrix
}

function setPositionCells(matrix) {
    for(let y = 0; y < selectedSize; y++) {
        for(let x = 0; x < selectedSize; x++) {
            const value = matrix[y][x];
            const cell = cells[value];
            const shiftPos = 100;
            cell.style.transform = `translate(${x * shiftPos}%, ${y * shiftPos}%)`;
        }
    }
}

const maxShuffle = 70;
let duration;
let shuffled = false;

shuffleBtn.addEventListener('click', () => {
    shuffledField();
    closeBurger();
});

//shuffle tiles
function shuffledField() {
    resetTimer();

    if(shuffled) {
        return
    }

    moveNum.textContent = '0';

    audioShuffle.play();
    shuffled = true;
    
    const shuffleArr = randomShuffle(matrix.flat());
    matrix = getMatrix(shuffleArr)
    setPositionCells(matrix);

    clearInterval(duration);
    let shuffleCount = 0;

    if(shuffleCount === 0) {
        duration = setInterval(() => {
            randomShuffle(matrix.flat());
            setPositionCells(matrix);

            shuffleCount += 1;

            if(shuffleCount >= maxShuffle) {
                clearInterval(duration);
                shuffled = false;
                audioShuffle.pause();
                startTimer();
                if(!isSolvable(matrix)) {
                    shuffledField();
                }
            }
        }, 25)
    }
}

shuffledField();

function randomShuffle(arr) {
    return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

frame.addEventListener('click', game)

function game(event) {
    if(shuffled) {
        return
    }

    const cell = event.target.closest('button');
    if(!cell) {
        return;
    }
   
    audio.play();

    const cellNum = Number(cell.dataset.id);
    const cellCoords = findCoordinatesByNum(cellNum, matrix);
    const blankCoords = findCoordinatesByNum(emptyNumber, matrix);
    const isValidSwap = isValidForSwap(cellCoords, blankCoords);
    
    if(isValidSwap) {
        swap(cellCoords, blankCoords, matrix);
        setPositionCells(matrix)
        count++
        moveNum.textContent = `${count}`;
        if(isWon(matrix)) {
            stopTimer();
            setTimeout(() => {
            generateWonCard();
            }, 500);
        }
    }
}

//solvability check
function findValidCoordinates({ blankCoords, matrix, blockedCoords }) {
    let validCoords = [];
    let i = 0;
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            if(isValidForSwap({x, y}, blankCoords)) {
                if(!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)) {
                    validCoords.push({x, y})
                }
            }
        }
    }
    return validCoords
}

function findCoordinatesByNum(num, matrix) {
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            if(matrix[y][x] === num) {
                return {x, y}
            }
        }
    }
}

function isValidForSwap(coords1, coords2) {
    const diffX = Math.abs(coords1.x - coords2.x);
    const diffY = Math.abs(coords1.y - coords2.y);

    return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y)
}

function swap(coords1, coords2, matrix) {
    const coords1Num = matrix[coords1.y][coords1.x];
    matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
    matrix[coords2.y][coords2.x] = coords1Num;
}

function getInversion(arr) {
    let inversion = 0;
    for (let i = 0; i < countTile - 1; i++) {
        for (let j = i + 1; j < countTile; j++) {
            if (arr[j] && arr[i] && arr[i] > arr[j]) {
                inversion++;
            }
        }
    }
    return inversion;
}

function findEmptyPos(matrix) {
    for (let i = selectedSize - 1; i >= 0; i--) {
        for (let j = selectedSize - 1; j >= 0; j--) {
            if (matrix[i][j] == 0) {
                return selectedSize - i;
            }
        }
    }
}
function isSolvable(matrix) {
    let matrixArr = matrix.flat();
    let pos = findEmptyPos(matrix);
    let inversions = getInversion(matrixArr);
    if(selectedSize % 2 !== 0) {
        return inversions % 2 === 0;
    } else {
        if(pos % 2 === 0) {
            return inversions % 2 !== 0;
        } else {
            return inversions % 2 === 0
        }
    }
}

//create timer
function timer() {
    seconds++;

    let secs = seconds % 60;
    let mins = Math.floor(seconds / 60);
    if(secs < 10) secs = '0' + secs;
    if(mins < 10) mins = '0' + mins;
    
    timeNum.innerText = `${mins}:${secs}`;
}

function startTimer() {
    if(interval) {
        return;
    }
    interval = setInterval(timer, 1000)
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    timeNum.textContent = '00:00'
}

//change size

sizeContainer.addEventListener('click', (event) => {
    sizes.forEach(size => size.classList.remove('active'));
    let size = event.target.closest('span');
    if (!size) return;
    activeSize(size);
    frame.innerHTML = '';
    cells = [];
    changeSize();
    createTiles();
    cellsArr = cells.map(cell => Number(cell.dataset.id));
    matrix = getMatrix(cellsArr);
    countTile = selectedSize * selectedSize;
    setPositionCells(matrix);
    shuffledField();
    frameSize.textContent = `Frame size: ${selectedSize}x${selectedSize}`;
})

function activeSize(size) {
    if(selected) {
        selected.classList.remove('active');
    }
    selected = size;
    selected.classList.add('active');
}

//buttons
let isGame = false;

pauseBtn.addEventListener('click', () => {
    if(!isGame) {
        frame.removeEventListener('click', game);
        isGame = true;
        pauseBtn.classList.add('active');
        pauseBtn.textContent = 'Continue';
        stopTimer();
    } else {
        frame.addEventListener('click', game);
        isGame = false;
        pauseBtn.classList.remove('active');
        pauseBtn.textContent = 'Pause';
        startTimer();
    }
    closeBurger()
})

//won 

function isWon(matrix) {
    let winArr = new Array(countTile).fill(0).map((item, i) => i + 1);
    winArr[winArr.length - 1] = 0;  
    let matrixArr = matrix.flat();
    for(let i = 0; i < winArr.length; i++) {
       if (matrixArr[i] !== winArr[i]) {
        return false;
       }
    }
    return true;
}

function generateWonCard() {
    let template = '';
    const overlayWon = document.createElement('div')
    overlayWon.className = 'overlay__won';

    template += `<div class='won'>`
    template += `<span class='won__text'>Hooray! You solved the puzzle in ${timeNum.textContent} and ${moveNum.textContent} moves!</span>`
    template += `</div>`

    body.append(overlayWon);
    overlayWon.innerHTML = template;
    overlayWon.addEventListener('click', closeWonMessage);
    audioWin.play();
    return overlayWon;
}

function closeWonMessage(e) {
    let classes = e.target.classList;
    if(classes.contains('overlay__won')) {
        document.querySelector('.overlay__won').remove();
        audioWin.pause();
    }
}

frame.addEventListener('dragstart', dragStart);
frame.addEventListener('dragend', dragEnd);

function dragStart(event) {
    const cell = event.target.closest('button');
    if(!cell) {
        return;
    }
    const cellNum = Number(cell.dataset.id);
    const cellCoords = findCoordinatesByNum(cellNum, matrix);
    const blankCoords = findCoordinatesByNum(emptyNumber, matrix);
    const isValid = isValidForSwap(cellCoords, blankCoords);

    if(isValid) {
        setTimeout(() => {
            cell.setAttribute('droggable', true)
            cell.classList.add('hide')
            event.dataTransfer.setData('id', event.target.dataset.id)
        }, 0)
    }
}

function dragEnd(event) {
    const cell = event.target.closest('button');
    cell.classList.remove('hide');
}

function dragOver(event) {
    event.preventDefault(); 
}

cells.forEach(cell => {
    cell.addEventListener('dragover', dragOver);
})



