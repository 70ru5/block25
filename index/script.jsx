const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let imgPath;

document.addEventListener('DOMContentLoaded', function() {
    fetchQuiz();
});

const fetchQuiz = () => {
    fetch('/quiz')
        .then(response => response.json())
        .then(data => {
            displayQuiz(data);
        })
        .catch(error => console.error('Error fetching quiz:', error));
}

const img = new Image();
const displayQuiz = (quiz) => {
    document.getElementById('question').textContent = quiz.question;
    document.getElementById('ansLength').textContent = quiz.ans_length;

    if (quiz.ans_type === 0) {
        document.getElementById('ansType').textContent = "ひらがな";
    } else if (quiz.ans_type === 1) {
        document.getElementById('ansType').textContent = "カタカナ";
    }

    img.src = "./images/quiz/" + quiz.img_path;
}

canvas.style.border = "3px solid";


let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 5;
const brickColumnCount = 5;
const brickWidth = canvas.width/5;
const brickHeight = brickWidth * 2/3;
const brickPadding = 0;
const brickOffsetTop = 30;
const brickOffsetLeft = 0;
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let score = 25;
let lives = 3;

let request = null;
let isPaused = false;

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = true;
    } else if (e.key === " " || e.key === "Spacebar") {
        pause();
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = false;
    } else if (e.key === "SPACE") {
        spacePressed = false;
    }
}

const collisionDetection = () => {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    x > b.x &&
                    x < b.x + brickWidth &&
                    y > b.y &&
                    y < b.y + brickHeight
                ) {
                    dy = -dy;
                    b.status = 0;
                    score--;
                }
            }
        }
    }
}

const drawScore = () => {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

const drawLives = () => {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
  }


const drawBall = () => {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

const drawPaddle = () => {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

const drawBricks = () => {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#999";
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.closePath();
            }
        }
    }
}
  
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 30, canvas.width, img.height * canvas.width / img.width); 
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        }
        else {
            lives--;
            if(!lives) {
                alert("GAME OVER");
                document.location.reload();
            }
            else {
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width-paddleWidth)/2;
            }
        }
    }
      

    x += dx;
    y += dy;

    if (rightPressed) {
        paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
    } else if (leftPressed) {
        paddleX = Math.max(paddleX - 7, 0);
    }

    request = requestAnimationFrame(draw);
}

draw();

const pause = () => {
    if(!isPaused && request !== null){
        isPaused = true;
        window.cancelAnimationFrame(request);
        request = null;
    } else if (isPaused) {
        isPaused = false;
        request = requestAnimationFrame(draw);
    } 
}
