let max = 100;
let randomNumber = 0;
let attempts = 0;
let lives = 10;
let timer = 0;
let best = localStorage.getItem('bestScore');
let gameActive = true;
let guessedNumbers = new Set();
let timerId;

const difficultyLives = { 10: 12, 50: 10, 100: 8 };
const messageBox = document.getElementById('messageBox');
const message = document.getElementById('message');
const messageIcon = document.getElementById('messageIcon');
const guessInput = document.getElementById('guessInput');
const validationMessage = document.getElementById('validationMessage');
const captionOverlay = document.getElementById('captionOverlay');
const captionTitle = document.getElementById('captionTitle');
const captionText = document.getElementById('captionText');
const captionClose = document.getElementById('captionClose');
const captionAction = document.getElementById('captionAction');

function updateBestScore() {
  document.getElementById('best').textContent = best || '—';
}

function updateTimer() {
  document.getElementById('timer').textContent = timer;
}

function updateProgress() {
  const percentage = Math.max((lives / difficultyLives[max]) * 100, 0);
  const bar = document.getElementById('bar');
  const progressTrack = document.querySelector('.progress-track');
  document.getElementById('lives').textContent = lives;
  document.getElementById('attempts').textContent = attempts;
  document.getElementById('progressCopy').textContent = `${lives} of ${difficultyLives[max]} lives`;
  bar.style.width = `${percentage}%`;
  bar.style.background = lives <= 2 ? 'linear-gradient(90deg, var(--danger), var(--pink))' : 'linear-gradient(90deg, var(--accent), #f2d26b)';
  progressTrack.setAttribute('aria-valuemax', difficultyLives[max]);
  progressTrack.setAttribute('aria-valuenow', lives);
}

function setMessage(text, type = 'normal', icon = '✦') {
  message.textContent = text;
  messageIcon.textContent = icon;
  messageBox.className = `message-box${type === 'normal' ? '' : ` ${type}`}`;
}

function setValidation(text = '') {
  validationMessage.textContent = text;
}

function showCaption(title, text, tone = 'success') {
  captionTitle.textContent = title;
  captionText.innerHTML = text;
  captionOverlay.className = `caption-overlay ${tone}`;
  captionOverlay.hidden = false;
  document.body.classList.add('caption-is-open');
  captionClose.focus();
}

function closeCaption() {
  captionOverlay.hidden = true;
  document.body.classList.remove('caption-is-open');
}

function showWinCaption(isNewBest) {
  if (isNewBest || attempts === 1) {
    showCaption('YOU KNEW SOMEHOW', 'Sometimes, instinct speaks before logic does.');
  } else if (attempts <= Math.ceil(difficultyLives[max] * 0.5)) {
    showCaption('No second guessing. Just instinct.');
  } else {
    showCaption("Sometimes your instinct needs a little time to find its way.<br />You stayed with it — and that's what matters. 🌱");
  }
}

function showLossCaption() {
  showCaption('Not every instinct is right.<br />Sometimes, listening means learning.', 'danger');
}

function addHistory(guess, result) {
  const history = document.getElementById('history');
  const emptyHistory = history.querySelector('.empty-history');
  if (emptyHistory) emptyHistory.remove();

  const item = document.createElement('span');
  item.className = `history-number ${result}`;
  item.textContent = guess;
  item.title = result === 'low' ? 'Too low' : result === 'high' ? 'Too high' : 'Correct guess';
  history.appendChild(item);
  document.getElementById('historyCount').textContent = guessedNumbers.size;
}

function checkGuess(event) {
  if (event) event.preventDefault();
  if (!gameActive) return;

  const guess = Number(guessInput.value);
  if (!Number.isInteger(guess) || guess < 1 || guess > max) {
    setValidation(`Enter a whole number between 1 and ${max}.`);
    guessInput.focus();
    return;
  }
  if (guessedNumbers.has(guess)) {
    setValidation('You already tried that number. Choose another.');
    guessInput.select();
    return;
  }

  setValidation('');
  guessedNumbers.add(guess);
  attempts += 1;
  lives -= 1;
  let result;

  if (guess === randomNumber) {
    result = 'win';
    gameActive = false;
    let isNewBest = false;
    setMessage(`You found ${randomNumber} in ${attempts} attempt${attempts === 1 ? '' : 's'}!`, 'success', '✓');
    if (best === null || attempts < Number(best)) {
      isNewBest = true;
      best = String(attempts);
      localStorage.setItem('bestScore', best);
      setValidation('New personal best!');
    }
    createConfetti();
    showWinCaption(isNewBest);
  } else if (guess < randomNumber) {
    result = 'low';
    setMessage('Too low. Look a little higher.', 'normal', '↑');
  } else {
    result = 'high';
    setMessage('Too high. Bring it down a little.', 'normal', '↓');
  }

  addHistory(guess, result);
  updateProgress();
  updateBestScore();
  guessInput.value = '';

  if (lives === 0 && gameActive) {
    gameActive = false;
    setMessage(`Game over. The number was ${randomNumber}.`, 'danger', '×');
    setValidation('Start a new round and try again.');
    showLossCaption();
  }
}

function restartGame() {
  closeCaption();
  window.clearInterval(timerId);
  randomNumber = Math.floor(Math.random() * max) + 1;
  attempts = 0;
  lives = difficultyLives[max];
  timer = 0;
  gameActive = true;
  guessedNumbers = new Set();
  document.getElementById('history').innerHTML = '<p class="empty-history">Your guesses will appear here.</p>';
  document.getElementById('historyCount').textContent = '0';
  guessInput.value = '';
  guessInput.disabled = false;
  document.querySelector('.guess-button').disabled = false;
  setValidation('');
  setMessage('A number is waiting to be discovered.');
  updateTimer();
  updateProgress();
  timerId = window.setInterval(() => {
    if (gameActive) {
      timer += 1;
      updateTimer();
    }
  }, 1000);
  guessInput.focus();
}

function changeDifficulty() {
  max = Number(document.getElementById('difficulty').value);
  document.getElementById('rangeMax').textContent = max;
  guessInput.max = max;
  restartGame();
}

function toggleTheme() {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
  document.getElementById('themeIcon').textContent = nextTheme === 'dark' ? '☼' : '☾';
}

function createConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['var(--accent)', 'var(--pink)', 'var(--blue)', '#f2d26b'];
  container.innerHTML = '';
  for (let index = 0; index < 36; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 220)}px`);
    piece.style.animationDelay = `${Math.random() * 160}ms`;
    container.appendChild(piece);
  }
  window.setTimeout(() => { container.innerHTML = ''; }, 1600);
}

document.getElementById('guessForm').addEventListener('submit', checkGuess);
captionClose.addEventListener('click', closeCaption);
captionAction.addEventListener('click', closeCaption);
captionOverlay.addEventListener('click', (event) => {
  if (event.target === captionOverlay) closeCaption();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !captionOverlay.hidden) closeCaption();
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') toggleTheme();
updateBestScore();
restartGame();
