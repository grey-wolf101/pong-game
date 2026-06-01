// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const ai = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    maxSpeed: 7
};

const score = {
    player: 0,
    ai: 0
};

// Input handling
const keys = {
    arrowUp: false,
    arrowDown: false,
    mouseY: null
};

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.arrowUp = true;
    if (e.key === 'ArrowDown') keys.arrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.arrowUp = false;
    if (e.key === 'ArrowDown') keys.arrowDown = false;
});

// Mouse event listener
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    keys.mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayer() {
    // Mouse control
    if (keys.mouseY !== null) {
        const targetY = keys.mouseY - player.height / 2;
        player.y += (targetY - player.y) * 0.2; // Smooth movement
    }

    // Arrow key control
    if (keys.arrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.arrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Keep player within bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update AI paddle position
function updateAI() {
    const aiCenter = ai.y + ai.height / 2;
    const ballCenter = ball.y;

    // AI follows the ball with some delay
    if (aiCenter < ballCenter - 35) {
        ai.y += ai.speed;
    } else if (aiCenter > ballCenter + 35) {
        ai.y -= ai.speed;
    }

    // Keep AI within bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) {
        ai.y = canvas.height - ai.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Paddle collision detection
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - player.y) / player.height;
        ball.dy = (hitPos - 0.5) * 8;
    }

    if (
        ball.x + ball.size > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height
    ) {
        ball.dx = -ball.dx;
        ball.x = ai.x - ball.size;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - ai.y) / ai.height;
        ball.dy = (hitPos - 0.5) * 8;
    }

    // Scoring and ball reset
    if (ball.x - ball.size < 0) {
        score.ai++;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        score.player++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = score.player;
    document.getElementById('aiScore').textContent = score.ai;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawDashedLine(x, y, width, height, dashLength) {
    ctx.strokeStyle = '#64c8ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([dashLength, dashLength]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
}

// Render game
function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0a0e27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawDashedLine(canvas.width / 2 - 1, 0, 2, canvas.height, 10);

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#64c8ff');
    drawRect(ai.x, ai.y, ai.width, ai.height, '#ff6464');

    // Draw ball with glow effect
    ctx.shadowColor = '#64c8ff';
    ctx.shadowBlur = 10;
    drawCircle(ball.x, ball.y, ball.size, '#64c8ff');
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateAI();
    updateBall();
    updateScore();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();