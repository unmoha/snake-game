const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const cell = canvas.width / gridSize;
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const fruitEl = document.getElementById('fruitCount');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayCopy = document.getElementById('overlayCopy');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const statusText = document.getElementById('statusText');
const speedRange = document.getElementById('speedRange');
const speedLabel = document.getElementById('speedLabel');
const paceValue = document.getElementById('paceValue');
const speeds = { 1: 170, 2: 115, 3: 72 };
let snake, fruit, direction, nextDirection, score, fruitCount, timer, running = false, paused = false;
let best = Number(localStorage.getItem('neon-orchard-best') || 0);
bestEl.textContent = String(best).padStart(3, '0');

function resetGame() {
  snake = [{ x: 10, y: 11 }, { x: 9, y: 11 }, { x: 8, y: 11 }];
  direction = { x: 1, y: 0 }; nextDirection = direction; score = 0; fruitCount = 0;
  placeFruit(); updateStats(); draw();
}
function placeFruit() { do { fruit = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; } while (snake.some(part => part.x === fruit.x && part.y === fruit.y)); }
function updateStats() { scoreEl.textContent = String(score).padStart(3, '0'); fruitEl.textContent = String(fruitCount).padStart(2, '0'); bestEl.textContent = String(best).padStart(3, '0'); }
function draw() {
  ctx.fillStyle = '#17261f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(213,243,92,.065)'; ctx.lineWidth = 1;
  for (let i = 1; i < gridSize; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(canvas.width, i * cell); ctx.stroke(); }
  ctx.fillStyle = '#f26b45'; ctx.beginPath(); ctx.arc(fruit.x * cell + cell / 2, fruit.y * cell + cell / 2, cell * .27, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#d5f35c'; ctx.fillRect(fruit.x * cell + cell * .58, fruit.y * cell + cell * .18, cell * .1, cell * .12);
  snake.forEach((part, index) => { ctx.fillStyle = index === 0 ? '#e8ff82' : '#b8d94f'; const inset = index === 0 ? 2 : 4; ctx.fillRect(part.x * cell + inset, part.y * cell + inset, cell - inset * 2, cell - inset * 2); });
  if (snake[0]) { ctx.fillStyle = '#17261f'; const head = snake[0]; ctx.fillRect(head.x * cell + cell * .62, head.y * cell + cell * .28, 4, 4); ctx.fillRect(head.x * cell + cell * .62, head.y * cell + cell * .63, 4, 4); }
}
function tick() {
  direction = nextDirection; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(part => part.x === head.x && part.y === head.y)) return endGame();
  snake.unshift(head); if (head.x === fruit.x && head.y === fruit.y) { score += 10; fruitCount++; if (score > best) { best = score; localStorage.setItem('neon-orchard-best', best); } placeFruit(); } else snake.pop(); updateStats(); draw();
}
function startGame() { resetGame(); running = true; paused = false; pauseButton.disabled = false; overlay.classList.add('hidden'); statusText.textContent = 'RUNNING / KEEP MOVING'; clearInterval(timer); timer = setInterval(tick, speeds[speedRange.value]); }
function endGame() { running = false; clearInterval(timer); pauseButton.disabled = true; statusText.textContent = 'RUN COMPLETE'; overlayTitle.textContent = 'Field mapped.'; overlayCopy.textContent = `You grew to ${score} points. Ready for another pass?`; startButton.textContent = 'PLAY AGAIN  ↗'; overlay.classList.remove('hidden'); }
function togglePause() { if (!running) return; paused = !paused; pauseButton.innerHTML = paused ? '<span>▶</span> RESUME <kbd>SPACE</kbd>' : '<span>Ⅱ</span> PAUSE <kbd>SPACE</kbd>'; statusText.textContent = paused ? 'PAUSED / TAKE A BREATH' : 'RUNNING / KEEP MOVING'; if (paused) clearInterval(timer); else timer = setInterval(tick, speeds[speedRange.value]); }
function setDirection(name) { const moves = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }; const move = moves[name]; if (!move) return; if (!running) { startGame(); nextDirection = move; return; } if (move.x !== -direction.x || move.y !== -direction.y) nextDirection = move; }
document.addEventListener('keydown', event => { const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }; if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); } if (event.code === 'Space') { event.preventDefault(); togglePause(); } if (event.key.toLowerCase() === 'r') startGame(); });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
startButton.addEventListener('click', startGame); pauseButton.addEventListener('click', togglePause); document.getElementById('restartButton').addEventListener('click', startGame);
speedRange.addEventListener('input', () => { const labels = { 1: 'CALM', 2: 'MEDIUM', 3: 'FERAL' }; speedLabel.textContent = labels[speedRange.value]; paceValue.textContent = labels[speedRange.value]; if (running && !paused) { clearInterval(timer); timer = setInterval(tick, speeds[speedRange.value]); } });
resetGame();