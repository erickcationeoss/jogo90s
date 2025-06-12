const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Configurações
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 30;
const BULLET_SIZE = 5;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 8;
const ENEMY_SIZE = 40;

// Jogador
const player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - 50,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 8,
    color: "#0f0"
};

// Tiros
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Inicializa inimigos
function initEnemies() {
    enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
            enemies.push({
                x: col * (ENEMY_SIZE + 20) + 100,
                y: row * (ENEMY_SIZE + 20) + 50,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
                alive: true
            });
        }
    }
}

// Controles
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed;
    }
    if (e.key === "ArrowRight" && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (e.key === " " && !gameOver) {
        bullets.push({
            x: player.x + player.width / 2 - BULLET_SIZE / 2,
            y: player.y,
            width: BULLET_SIZE,
            height: BULLET_SIZE * 2,
            speed: 10
        });
    }
    if (e.key === " " && gameOver) {
        resetGame();
    }
});

// Desenha elementos
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = "#ff0";
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = "#f00";
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
}

// Atualiza jogo
function update() {
    if (gameOver) return;

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move tiros
    bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
    });

    // Remove tiros fora da tela
    bullets = bullets.filter(bullet => bullet.y > 0);

    // Verifica colisões
    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            if (
                enemy.alive &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.alive = false;
                bullet.y = -10; // Remove o tiro
                score += 100;
                scoreElement.textContent = score;
            }
        });
    });

    // Verifica vitória
    if (enemies.every(enemy => !enemy.alive)) {
        gameOver = true;
        showMessage("YOU WIN!");
    }

    // Desenha tudo
    drawEnemies();
    drawBullets();
    drawPlayer();

    requestAnimationFrame(update);
}

// Mensagens de fim de jogo
function showMessage(text) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f0";
    ctx.font = "36px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// Reinicia jogo
function resetGame() {
    score = 0;
    scoreElement.textContent = "0";
    bullets = [];
    gameOver = false;
    initEnemies();
    update();
}

// Inicia
initEnemies();
update();