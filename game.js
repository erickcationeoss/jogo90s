const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Configurações
const ROAD_WIDTH = 400;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 60;

// Carro do jogador
const car = {
    x: canvas.width / 2 - CAR_WIDTH / 2,
    y: canvas.height - CAR_HEIGHT - 30,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    speed: 6
};

// Variáveis do jogo
let obstacles = [];
let score = 0;
let gameSpeed = 3;
let gameOver = false;

// Controles
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && car.x > canvas.width / 2 - ROAD_WIDTH / 2) {
        car.x -= car.speed;
    }
    if (e.key === "ArrowRight" && car.x < canvas.width / 2 + ROAD_WIDTH / 2 - CAR_WIDTH) {
        car.x += car.speed;
    }
    if (e.key === " " && gameOver) {
        resetGame();
    }
});

// Gera obstáculos
function generateObstacle() {
    const x = Math.random() * (ROAD_WIDTH - OBSTACLE_WIDTH) + (canvas.width / 2 - ROAD_WIDTH / 2);
    obstacles.push({
        x: x,
        y: -OBSTACLE_HEIGHT,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT
    });
}

// Desenha os elementos
function drawCar() {
    ctx.fillStyle = "#333"; // Carro preto
    ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawObstacles() {
    ctx.fillStyle = "#ff0000"; // Obstáculos vermelhos
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawRoad() {
    ctx.fillStyle = "#555"; // Estrada cinza
    ctx.fillRect(canvas.width / 2 - ROAD_WIDTH / 2, 0, ROAD_WIDTH, canvas.height);
}

// Lógica principal
function update() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha a estrada
    drawRoad();

    // Atualiza obstáculos
    obstacles.forEach(obstacle => {
        obstacle.y += gameSpeed;

        // Verifica colisão
        if (
            car.x < obstacle.x + obstacle.width &&
            car.x + car.width > obstacle.x &&
            car.y < obstacle.y + obstacle.height &&
            car.y + car.height > obstacle.y
        ) {
            gameOver = true;
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#fff";
            ctx.font = "30px 'Press Start 2P'";
            ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
        }
    });

    // Remove obstáculos passados
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

    // Gera novos obstáculos
    if (Math.random() < 0.02) {
        generateObstacle();
    }

    // Atualiza pontuação
    score++;
    scoreElement.textContent = score;
    if (score % 500 === 0) gameSpeed += 0.3;

    // Desenha tudo
    drawObstacles();
    drawCar();

    requestAnimationFrame(update);
}

// Reinicia o jogo
function resetGame() {
    obstacles = [];
    score = 0;
    gameSpeed = 3;
    gameOver = false;
    scoreElement.textContent = "0";
    car.x = canvas.width / 2 - CAR_WIDTH / 2;
    update();
}

// Inicia
generateObstacle();
update();