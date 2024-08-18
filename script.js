const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src = 'player.png';

const playerJumpImg = new Image();
playerJumpImg.src = 'player2.png';

const debrisImg = new Image();
debrisImg.src = 'debris.png';

const player = {
  x: 50,
  y: canvas.height - 100,
  width: 50,
  height: 75,
  speed: 10,
  jumping: false,
  jumpHeight: 0, // Initial jump height
  maxJumpHeight: 180, // Maximum jump height
};

const debris = {
  x: canvas.width,
  y: canvas.height - 40,
  width: 20,
  height: 10,
  speed: 6,
};

let debrisCounter = 0;
let gameOver = false;
let debrisInterval;
let jumpInterval;
let jumpHeight = 0;

let highScore = localStorage.getItem('highScore') || 0;

const backgrounds = [
  'background.jpg',
  'background2.jpg',
  'background3.jpg',
  'background4.jpg',
  'background5.jpg',
];
let backgroundIndex = 0;
let usedBackgrounds = [];

const backgroundImg = new Image();
backgroundImg.src = backgrounds[backgroundIndex];

// Initial position of the background
let backgroundX = 0;

// Color transition variables
const colors = ['rgba(255, 255, 255, 0.2)', 'rgba(255, 230, 230, 0.2)', 'rgba(255, 204, 204, 0.2)', 'rgba(255, 179, 179, 0.2)', 'rgba(255, 153, 153, 0.2)', 'rgba(255, 128, 128, 0.2)', 'rgba(255, 102, 102, 0.2)', 'rgba(255, 77, 77, 0.2)', 'rgba(255, 51, 51, 0.2)', 'rgba(255, 26, 26, 0.2)'];
let currentColorIndex = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the scrolling background
  ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);

  // Move the background
  backgroundX -= debris.speed;

  // Repeat the background
  if (backgroundX <= -canvas.width) {
    backgroundX = 0;
  }

  // Draw ceiling lines
  ctx.beginPath();
  ctx.moveTo(0, 150); // Adjust the y-coordinate based on your desired height
  ctx.lineTo(canvas.width, 150); // Adjust the y-coordinate based on your desired height
  ctx.stroke();

  // Draw player
  if (player.jumping) {
    ctx.drawImage(playerJumpImg, player.x, player.y, player.width, player.height);
  } else {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  }

  // Draw debris
  ctx.drawImage(debrisImg, debris.x, debris.y, debris.width, debris.height);

  // Move debris
  debris.x -= debris.speed;

  // Check for collision with ceiling
  if (player.y < 420) { // Adjust the y-coordinate based on your desired height
    player.y = 420; // Adjust the y-coordinate based on your desired height
  }

  // Check for collision with debris
  if (
    player.x + 12 < debris.x + debris.width && // Reduce collision window on the left side
    player.x + player.width - 12 > debris.x && // Reduce collision window on the right side
    player.y + 10 < debris.y + debris.height && // Reduce collision window on the top side
    player.y + player.height - 10 > debris.y // Reduce collision window on the bottom side
  ) {
    if (!gameOver) {
      gameOver = true;
      if (debrisCounter > highScore) {
        highScore = debrisCounter;
        localStorage.setItem('highScore', highScore);
      }
      showGameOverScreen();
    }
  }

  // Reset debris position and update counter
  if (debris.x + debris.width < 1) {
    debris.x = canvas.width;
    debrisCounter++;

    // Increase speed every 5 debris
    if (debrisCounter % 5 === 0) {
      debris.speed += 2;
      console.log(`Debris Speed: ${debris.speed}`);
    }

    // Change background image every 10 debris
    if (debrisCounter % 10 === 0) {
      changeBackground();
    }

    // Change background color every 10 debris
    if (debrisCounter % 10 === 0 && currentColorIndex < colors.length - 1) {
      currentColorIndex++;
    }
  }

  // Draw the semi-transparent overlay
  ctx.fillStyle = colors[currentColorIndex];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Display debris counter and high score
  ctx.fillStyle = 'red';
  ctx.font = '30px Impact';
  ctx.fillText(`Poo Scooted: ${debrisCounter} | High Score: ${highScore}`, 10, 30);

  if (!gameOver) {
    requestAnimationFrame(draw);
  }
}

function changeBackground() {
  usedBackgrounds.push(backgrounds[backgroundIndex]);

  if (usedBackgrounds.length >= backgrounds.length) {
    usedBackgrounds = [];
  }

  let nextBackgrounds = backgrounds.filter(bg => !usedBackgrounds.includes(bg));

  backgroundIndex = Math.floor(Math.random() * nextBackgrounds.length);
  backgroundImg.src = nextBackgrounds[backgroundIndex];
}

function jump() {
  if (!player.jumping && jumpHeight < player.maxJumpHeight) {
    player.jumping = true;

    // Change player image when jumping
    playerImg.src = 'player2.png';

    jumpInterval = setInterval(() => {
      player.y -= 10;
      jumpHeight += 10; // Increment jump height
      player.jumping = true;

      if (jumpHeight >= player.maxJumpHeight) {
        endJump();
      }
    }, 20);
  }
}

function endJump() {
  if (player.jumping) {
    clearInterval(jumpInterval);

    const fallInterval = setInterval(() => {
      player.y += 7;

      if (player.y >= canvas.height - 100) {
        player.y = canvas.height - 100;
        player.jumping = false;

        // Change player image back to normal
        playerImg.src = 'player.png';

        clearInterval(fallInterval);

        // Reset jump height when landing
        jumpHeight = 0;
      }
    }, 20);
  }
}

function resetGame() {
  clearInterval(debrisInterval);
  clearInterval(jumpInterval); // Clear the jump interval on game reset
  gameOver = false;
  debrisCounter = 0;
  player.y = canvas.height - 40;
  debris.x = canvas.width;
  jumpHeight = 0; // Reset jump height
  backgroundIndex = 0; // Reset background index
  usedBackgrounds = []; // Clear used backgrounds
  backgroundImg.src = backgrounds[backgroundIndex]; // Reset to first background
  // Reload the page
  location.reload();
}

function moveDebris() {
  debrisInterval = setInterval(() => {
    // Randomize debris speed with a factor between -1 and 1
    const speedFactor = (Math.random() * 2) - 1;
    debris.x -= debris.speed + speedFactor;

    if (debris.x + debris.width < 0) {
      debris.x = canvas.width;
      debrisCounter++;

      // Increase speed every 5 debris
      if (debrisCounter % 5 === 0) {
        debris.speed += 0.5;
        console.log(`Debris Speed: ${debris.speed}`);
      }
    }
  }, 200); // Increase the interval for better observation
}

function handleJumpStart() {
  if (!gameOver) {
    jump();
  }
}

function handleJumpEnd() {
  if (player.jumping) {
    endJump();
  }
}

document.addEventListener('mousedown', handleJumpStart);
document.addEventListener('mouseup', handleJumpEnd);
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !gameOver) {
    handleJumpStart();
  }
});
document.addEventListener('keyup', () => {
  handleJumpEnd();
});

canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  handleJumpStart();
});

canvas.addEventListener('touchend', (event) => {
  event.preventDefault();
  handleJumpEnd();
});

const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  draw();
  moveDebris(); // Start moving the debris when the game starts
});

restartButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  resetGame();
});

function showGameOverScreen() {
  gameOverScreen.style.display = 'block';
  gameOverMessage.textContent = `You scooted ${debrisCounter} piles of poo.`;
}
