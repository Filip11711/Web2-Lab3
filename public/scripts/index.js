const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const SPEED = 3
const ASTEROID_SPEED = 2
const FRICTION = 0.97
const ASTEROID_NUM = 7
const SPAWN_TIME = 1

startTime = Date.now();
bestTime = localStorage.getItem('bestTime') || 0;

class Player {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity
    }

    draw() {
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 3
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x - 15, this.position.y - 15, 30, 30);
        ctx.shadowColor='rgba(ff,ff,ff,0)';
        ctx.fillRect(this.position.x - 15, this.position.y - 15, 30, 30);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.position.x < 15) {
            this.position.x = 15;
        } else if (this.position.x > canvas.width - 15) {
            this.position.x = canvas.width - 15
        }

        if (this.position.y < 15) {
            this.position.y = 15;
        } else if (this.position.y > canvas.height - 15) {
            this.position.y = canvas.height - 15
        }
    }
}


const player = new Player({x: canvas.width / 2, y: canvas.height / 2}, {x: 0, y: 0});

let keys = {
    up: false,
    left: false,
    right: false,
    down: false
};

class Asteroid {
    constructor(position, velocity, size, color) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
    }

    draw() {
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 3
        ctx.fillStyle = `rgb(${this.color},${this.color},${this.color})`;
        console.log(ctx.fillStyle)
        ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
        ctx.shadowColor='rgba(ff,ff,ff,0)';
        ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const asteroids = [];

function collision(asteroid) {
    if (
        Math.abs(player.position.x - asteroid.position.x) <= (15 + asteroid.size/2) &&
        Math.abs(player.position.y - asteroid.position.y) <= (15 + asteroid.size/2)
    ) {
        return true
    }
    return false;
}

function spawn_asteroid() {
    const direction = Math.floor(Math.random() * 4);
    let x, y;
    let velocity_x, velocity_y;
    const size = 40 * Math.random() + 20;

    switch (direction) {
        case 0: // up
            x = Math.random() * canvas.width;
            y = 0 - size/2;
            velocity_x = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            velocity_y = Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2;
            break;
        case 1: // left
            x = 0 - size/2;
            y = Math.random() * canvas.height;
            velocity_x = Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2;
            velocity_y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            break;
        case 2: // right
            x = canvas.width + size/2;
            y = Math.random() * canvas.height;
            velocity_x = (-1) * (Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2);
            velocity_y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            break;
        case 3: // down
            x = Math.random() * canvas.width;
            y = canvas.height + size/2;
            velocity_x = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            velocity_y = (-1) * (Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2);
            break;
    }
    
    asteroids.push(new Asteroid(
        {x: x, y: y},
        {x: velocity_x, y: velocity_y},
        size,
        Math.random() * 150 + 53
    ))
}

for (let i = 0; i < ASTEROID_NUM; i++) {
    spawn_asteroid()
}

const interval = window.setInterval(() => {
    spawn_asteroid();
}, SPAWN_TIME * 1000);

function animate() {
    const animation = window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();

        if (collision(asteroid)) {
            window.cancelAnimationFrame(animation);
            clearInterval(interval);
        }

        if (
            asteroid.position.x + asteroid.size/2 < 0 ||
            asteroid.position.x - asteroid.size/2 > canvas.width ||
            asteroid.position.y - asteroid.size/2 > canvas.height ||
            asteroid.position.y + asteroid.size/2 < 0
          ) {
            asteroids.splice(i, 1)
          }
    }

    const elapsedTime = Date.now() - startTime;

    if (elapsedTime > bestTime) {
        bestTime = elapsedTime;
        localStorage.setItem('bestTime', bestTime);
    }

    document.getElementById('bestTime').textContent = `Najbolje vrijeme: ${formatTime(bestTime)}`;
    document.getElementById('currentTime').textContent = `Vrijeme: ${formatTime(Date.now() - startTime)}`;

    if (keys.up) {
        player.velocity.y = (-1) * SPEED;
    } else {
        player.velocity.y *= FRICTION;
    } 
    if (keys.left) {
        player.velocity.x = (-1) * SPEED;
    } else {
        player.velocity.x *= FRICTION;
    } 
    if (keys.right) {
        player.velocity.x = SPEED;
    } else {
        player.velocity.x *= FRICTION;
    } 
    if (keys.down) {
        player.velocity.y = SPEED;
    } else {
        player.velocity.y *= FRICTION;
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / (60 * 1000));
    const seconds = Math.floor((time % (60 * 1000)) / 1000);
    const milliseconds = time % 1000;
    return `${pad(minutes)}:${pad(seconds)}.${pad3(milliseconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function pad3(num) {
    return num.toString().padStart(3, '0');
}

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowDown':
            keys.down = true;
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowDown':
            keys.down = false;
            break;
    }
})

animate()