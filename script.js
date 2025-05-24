// Game elements
const board = document.getElementById('game-board');
const scoreText = document.getElementById('score');
const highScoreText = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverScreen = document.querySelector('.game-over');
const finalScoreText = document.getElementById('final-score');
const lossNotification = document.getElementById('loss-notification');

// Mobile controls
const upBtn = document.querySelector('.up');
const downBtn = document.querySelector('.down');
const leftBtn = document.querySelector('.left');
const rightBtn = document.querySelector('.right');

// Game variables
let snake, food, score, highScore, direction, nextDirection, gameInterval;
let isPaused = false;
let isGameOver = false;
let gameSpeed = 150;
const gridSize = 20;
const cellSize = board.clientWidth / gridSize;

// Initialize game
function initGame() {
  // Load high score from localStorage
  highScore = localStorage.getItem('snakeHighScore') || 0;
  highScoreText.textContent = `High Score: ${highScore}`;
  
  // Set up event listeners
  document.addEventListener('keydown', changeDirection);
  startBtn.addEventListener('click', toggleGame);
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', startGame);
  
  // Mobile controls
  upBtn.addEventListener('click', () => changeDirection({key: 'ArrowUp'}));
  downBtn.addEventListener('click', () => changeDirection({key: 'ArrowDown'}));
  leftBtn.addEventListener('click', () => changeDirection({key: 'ArrowLeft'}));
  rightBtn.addEventListener('click', () => changeDirection({key: 'ArrowRight'}));
  
  resetGame();
}

// Reset game state
function resetGame() {
  // Initial snake position (centered)
  const startX = Math.floor(gridSize / 2);
  const startY = Math.floor(gridSize / 2);
  snake = [{ x: startX, y: startY }];
  
  food = generateFood();
  score = 0;
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  scoreText.textContent = `Skor: ${score}`;
  gameSpeed = 150;
  isGameOver = false;
  
  // Clear any existing interval
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  
  drawGameBoard();
}

// Generate food at random position
function generateFood() {
  let foodX, foodY;
  
  // Make sure food doesn't spawn on snake
  do {
    foodX = Math.floor(Math.random() * gridSize);
    foodY = Math.floor(Math.random() * gridSize);
  } while (snake.some(segment => segment.x === foodX && segment.y === foodY));
  
  return { x: foodX, y: foodY };
}

// Draw game elements
function drawGameBoard() {
  board.innerHTML = '';
  
  // Draw snake
  snake.forEach((segment, index) => {
    const segmentElement = document.createElement('div');
    segmentElement.style.position = 'absolute';
    segmentElement.style.width = `${cellSize}px`;
    segmentElement.style.height = `${cellSize}px`;
    segmentElement.style.backgroundColor = index === 0 ? '#2E7D32' : '#4CAF50'; // Darker head
    segmentElement.style.left = `${segment.x * cellSize}px`;
    segmentElement.style.top = `${segment.y * cellSize}px`;
    segmentElement.style.borderRadius = index === 0 ? '50% 50% 20% 20%' : '30%';
    board.appendChild(segmentElement);

    // Gunakan gambar untuk kepala dan badan ular
    if (index === 0) {
      segmentElement.style.backgroundImage = "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX1gtK9wmoYoqnWFmdjc-xTAne39CJ4egFC7j3r1Mv2PDTJegsj58WFUUWo2aJWb6KVew&usqp=CAU')";
    } else {
      segmentElement.style.backgroundImage = "url('snake-body.png')";
    }

    board.appendChild(segmentElement);
  });
  
  // Draw food
  const foodElement = document.createElement('div');
  foodElement.style.position = 'absolute';
  foodElement.style.width = `${cellSize}px`;
  foodElement.style.height = `${cellSize}px`;
  foodElement.style.backgroundColor = '#E91E63';
  foodElement.style.left = `${food.x * cellSize}px`;
  foodElement.style.top = `${food.y * cellSize}px`;
  foodElement.style.borderRadius = '50%';
  foodElement.style.boxShadow = '0 0 8px #FF4081';
  board.appendChild(foodElement);
}

// Move snake
function moveSnake() {
  if (isPaused || isGameOver) return;
  
  // Update direction from the buffered next direction
  direction = nextDirection;
  
  const head = { ...snake[0] };
  
  // Move head based on direction
  switch (direction) {
    case 'UP': head.y -= 1; break;
    case 'DOWN': head.y += 1; break;
    case 'LEFT': head.x -= 1; break;
    case 'RIGHT': head.x += 1; break;
  }
  
  // Wall collision (teleport)
  if (head.x < 0) head.x = gridSize - 1;
  if (head.x >= gridSize) head.x = 0;
  if (head.y < 0) head.y = gridSize - 1;
  if (head.y >= gridSize) head.y = 0;
  
  // Check for self collision
  if (isSnakeColliding(head)) {
    gameOver();
    return;
  }
  
  // Add new head
  snake.unshift(head);
  
  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreText.textContent = `Skor: ${score}`;
    food = generateFood();
    
    // Increase speed every 50 points
    if (score % 50 === 0 && gameSpeed > 50) {
      gameSpeed -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(moveSnake, gameSpeed);
    }
  } else {
    // Remove tail if no food eaten
    snake.pop();
  }
  
  drawGameBoard();
}

// Check if snake collides with itself
function isSnakeColliding(head) {
  return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

// Change direction with input buffering
function changeDirection(event) {
  if (isGameOver) return;
  
  // Prevent opposite direction changes
  switch (event.key) {
    case 'ArrowUp':
      if (direction !== 'DOWN') nextDirection = 'UP';
      break;
    case 'ArrowDown':
      if (direction !== 'UP') nextDirection = 'DOWN';
      break;
    case 'ArrowLeft':
      if (direction !== 'RIGHT') nextDirection = 'LEFT';
      break;
    case 'ArrowRight':
      if (direction !== 'LEFT') nextDirection = 'RIGHT';
      break;
  }
}

// Start or stop game
function toggleGame() {
  if (gameInterval) {
    // Game is running - stop it
    stopGame();
    startBtn.textContent = 'Mulai Game';
  } else {
    // Game is stopped - start it
    startGame();
  }
}

// Start game
function startGame() {
  resetGame();
  gameInterval = setInterval(moveSnake, gameSpeed);
  startBtn.textContent = 'Berhenti Game';
  pauseBtn.disabled = false;
  isPaused = false;
  pauseBtn.textContent = 'Jeda';
  gameOverScreen.style.display = 'none';
}

// Stop game
function stopGame() {
  clearInterval(gameInterval);
  gameInterval = null;
  pauseBtn.disabled = true;
}

// Pause or resume game
function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
}

// Show loss notification
function showLossNotification() {
  lossNotification.style.display = 'block';
  lossNotification.style.animation = 'none';
  void lossNotification.offsetWidth; // Trigger reflow
  lossNotification.style.animation = 'slideDown 0.5s ease, fadeOut 0.5s ease 1.5s forwards';
}

// Game over
function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  
  // Show loss notification
  showLossNotification();
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreText.textContent = `High Score: ${highScore}`;
  }
  
  // Show game over screen
  finalScoreText.textContent = `Skor Akhir: ${score}`;
  gameOverScreen.style.display = 'flex';
  
  // Auto-restart after 3 seconds
  setTimeout(() => {
    if (isGameOver) { // Only restart if still game over (user didn't click restart)
      startGame();
    }
  }, 3000);
}

// Initialize the game when page loads
window.onload = initGame;