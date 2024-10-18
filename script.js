const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

let player = {
    x: 50,
    y: canvas.height - 30,
    width: 30,
    height: 30,
    dy: 0,
    gravity: 0.8,
    jumpStrength: -12,
    isDucking: false,
    isJumping: false,
    isPowerUpActive: false
};

let obstacles = [];
let gameOver = false;
let score = 0;
let bestScore = 0;
let frameCount = 0;
let isGameStarted = false;
let powerUpActiveTime = 0;

let coins = 0; // Monete guadagnate
let powerUpsAvailable = 1; // Numero di power-up disponibili

// Funzione per aggiornare gli ostacoli
function updateObstacles() {
    if (frameCount % 100 === 0) {
        let height = Math.random() * 50 + 20;
        let isLowObstacle = Math.random() > 0.5; // 50% di possibilità che l'ostacolo sia basso
        let yPosition = isLowObstacle ? canvas.height - 40 : canvas.height - height;

        obstacles.push({ x: canvas.width, y: yPosition, width: 20, height: height, isLow: isLowObstacle });
    }

    let speed = Math.min(5 + Math.floor(score / 100), 15);
    obstacles.forEach(obstacle => {
        obstacle.x -= speed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

// Funzione per disegnare gli ostacoli
function drawObstacles() {
    ctx.fillStyle = '#ff0000';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Funzione per controllare le collisioni
function checkCollision() {
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
                
            // Se l'ostacolo è basso e il giocatore non è abbassato, perde
            if (obstacle.isLow && !player.isDucking) {
                gameOver = true;
            } else if (!obstacle.isLow) {
                gameOver = true;
            }
        }
    });
}

// Funzione per disegnare il giocatore
function drawPlayer() {
    ctx.fillStyle = player.isPowerUpActive ? '#ffd700' : '#00838f';
    ctx.beginPath();
    
    if (player.isDucking) {
        // Disegna un'ellisse schiacciata quando il giocatore si abbassa
        ctx.ellipse(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, player.height / 4, 0, 0, Math.PI * 2);
    } else {
        // Disegna il cerchio normale
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
    }
    
    ctx.fill();
}

// Funzione per abbassarsi
function duck() {
    player.isDucking = true;
    player.height = 20; // Cambia l'altezza per simulare un'ellisse schiacciata
}

// Funzione per tornare alla posizione normale
function stand() {
    player.isDucking = false;
    player.height = 30; // Torna all'altezza originale
}

// Funzione per il salto
function jump() {
    if (!player.isJumping) {
        player.dy = player.jumpStrength;
        player.isJumping = true;
    }
}

// Funzione per attivare il power-up con clic del mouse
function activatePowerUp() {
    if (coins >= 50 && powerUpsAvailable > 0) { // Controlla se ci sono abbastanza monete
        player.isPowerUpActive = true;
        coins -= 50; // Riduci le monete per l'acquisto
        powerUpsAvailable--; // Riduci il numero di power-up disponibili
        powerUpActiveTime = Infinity; // Imposta il power-up come attivo indefinitamente
        document.getElementById('powerUpMessage').innerText = 'Power-Up attivato!'; // Messaggio di attivazione
    } else {
        document.getElementById('powerUpMessage').innerText = 'Non hai abbastanza monete!'; // Messaggio di errore
    }
}

// Funzione per aggiornare il gioco
function updateGame() {
    if (!gameOver) {
        frameCount++;
        score++;
        coins++; // Aggiungi moneta ogni volta che il punteggio aumenta

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateObstacles();
        drawObstacles();
        drawPlayer();
        checkCollision();

        // Gestione del salto
        player.dy += player.gravity;
        player.y += player.dy;

        if (player.y + player.height >= canvas.height) {
            player.y = canvas.height - player.height;
            player.isJumping = false;
        }

        // Gestione del power-up
        if (player.isPowerUpActive) {
            powerUpActiveTime--;
            if (powerUpActiveTime <= 0) {
                player.isPowerUpActive = true;
            }
        }

        // Mostra punteggio, miglior record, monete e power-ups disponibili
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText("Punteggio: " + score, 10, 30);
        ctx.fillText("Miglior Record: " + bestScore, canvas.width - 200, 30);
        ctx.fillText("Monete: " + coins, 10, 60); // Monete
        ctx.fillText("Power-ups: " + powerUpsAvailable, canvas.width - 200, 60); // Power-ups disponibili

        requestAnimationFrame(updateGame);
    } else {
        // Aggiorna il miglior record se il punteggio attuale è più alto
        bestScore = Math.max(bestScore, score);

        // Mostra Game Over e punteggio finale
        ctx.fillStyle = '#000';
        ctx.font = '30px Arial';
        ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 30);
        ctx.fillText("Punteggio: " + score, canvas.width / 2 - 80, canvas.height / 2 + 10);
        ctx.fillText("Miglior Record: " + bestScore, canvas.width / 2 - 80, canvas.height / 2 + 50);
        ctx.fillText("Monete: " + coins, canvas.width / 2 - 80, canvas.height / 2 + 90); // Mostra le monete a Game Over

        // Aggiungi il tasto per ricominciare
        ctx.fillText("Premi un tasto per ricominciare", canvas.width / 2 - 180, canvas.height / 2 + 130);
        document.addEventListener('keydown', resetGame);
    }
}

// Funzione per resettare il gioco
function resetGame() {
    document.removeEventListener('keydown', resetGame);
    gameOver = false;
    score = 0;
    obstacles = [];
    frameCount = 0;
    updateGame();
}

// Avvia il gioco con un tasto qualsiasi o clic del mouse
document.addEventListener('keydown', startGame);
document.addEventListener('mousedown', startGame);

function startGame() {
    document.removeEventListener('keydown', startGame);
    document.removeEventListener('mousedown', startGame);
    updateGame();
}

// Eventi per abbassarsi e rialzarsi
document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowDown') {
        duck();
    } else if (event.code === 'Space') {
        jump(); // Salto con barra spaziatrice
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowDown') {
        stand();
    }
});

// Eventi per attivare power-up
document.getElementById('buyPowerUp').addEventListener('click', activatePowerUp);
canvas.addEventListener('mousedown', activatePowerUp);