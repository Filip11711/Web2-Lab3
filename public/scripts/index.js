const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Postavljanje dimenzija canvasa na veličinu prozora
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const SPEED = 3 // Brzina igrača
const ASTEROID_SPEED = 2 // Srednja brzina asteroida
const FRICTION = 0.97 // Trenje
const ASTEROID_NUM = 7 // Početni broj asteroida
const SPAWN_TIME = 1 // Vrijeme generiranja asteroida u sekundama

// Inicijalizacija vremena i najboljeg vremena
startTime = Date.now();
bestTime = localStorage.getItem('bestTime') || 0;

// Definiranje klase igrača
class Player {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity
    }

    // Metoda za crtanje igrača na canvasu
    draw() {
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 3
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x - 15, this.position.y - 15, 30, 30);
        ctx.shadowColor='rgba(ff,ff,ff,0)';
        ctx.fillRect(this.position.x - 15, this.position.y - 15, 30, 30);
    }

    // Metoda za ažuriranje pozicije igrača
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Provjera da li je igrač izvan granica canvasa i postavljanje na rub
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

// Inicijalizacija igrača
const player = new Player({x: canvas.width / 2, y: canvas.height / 2}, {x: 0, y: 0});

// Objekt koji prati pritisnute tipke
let keys = {
    up: false,
    left: false,
    right: false,
    down: false
};

// Definiranje klase asteroida
class Asteroid {
    constructor(position, velocity, size, color) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
    }

    // Metoda za crtanje asteroida na canvasu
    draw() {
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 3
        ctx.fillStyle = `rgb(${this.color},${this.color},${this.color})`;
        console.log(ctx.fillStyle)
        ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
        ctx.shadowColor='rgba(ff,ff,ff,0)';
        ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
    }

    // Metoda za ažuriranje pozicije asteroida
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Polje asteroida
const asteroids = [];

// Funkcija za detekciju kolizije između igrača i asteroida
function collision(asteroid) {
    if (
        Math.abs(player.position.x - asteroid.position.x) <= (15 + asteroid.size/2) &&
        Math.abs(player.position.y - asteroid.position.y) <= (15 + asteroid.size/2)
    ) {
        return true
    }
    return false;
}

// Funkcija za generiranje asteroida sa nasumičnim vrijednostima pozicije, brzine, veličine i nijanse sive boje
function spawn_asteroid() {
    const direction = Math.floor(Math.random() * 4);
    let x, y;
    let velocity_x, velocity_y;
    const size = 40 * Math.random() + 20;

    switch (direction) {
        case 0: // gore
            x = Math.random() * canvas.width;
            y = 0 - size/2;
            velocity_x = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            velocity_y = Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2;
            break;
        case 1: // lijevo
            x = 0 - size/2;
            y = Math.random() * canvas.height;
            velocity_x = Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2;
            velocity_y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            break;
        case 2: // desno
            x = canvas.width + size/2;
            y = Math.random() * canvas.height;
            velocity_x = (-1) * (Math.random() * ASTEROID_SPEED + ASTEROID_SPEED/2);
            velocity_y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            break;
        case 3: // dolje
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

// Generiranje početnih asteroida
for (let i = 0; i < ASTEROID_NUM; i++) {
    spawn_asteroid()
}

// Postavljanje intervala za generiranje novih asteroida
const interval = window.setInterval(() => {
    spawn_asteroid();
}, SPAWN_TIME * 1000);

// Funkcija za animaciju igre
function animate() {
    const animation = window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    // Ažuriranje pozicija i detekcija kolizije za sve asteroide
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();

        // Provjera kolizije s igračem
        if (collision(asteroid)) {
            // Završetak igre
            window.cancelAnimationFrame(animation);
            clearInterval(interval);
        }

        // Provjera izlaska asteroida izvan granica canvasa i brisanje
        if (
            asteroid.position.x + asteroid.size/2 < 0 ||
            asteroid.position.x - asteroid.size/2 > canvas.width ||
            asteroid.position.y - asteroid.size/2 > canvas.height ||
            asteroid.position.y + asteroid.size/2 < 0
          ) {
            asteroids.splice(i, 1)
          }
    }

    // Ažuriranje i prikaz vremena igre
    const elapsedTime = Date.now() - startTime;

    if (elapsedTime > bestTime) {
        bestTime = elapsedTime;
        localStorage.setItem('bestTime', bestTime);
    }

    document.getElementById('bestTime').textContent = `Najbolje vrijeme: ${formatTime(bestTime)}`;
    document.getElementById('currentTime').textContent = `Vrijeme: ${formatTime(Date.now() - startTime)}`;

    // Ažuriranje brzine igrača prema pritisnutim tipkama
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

// Funkcija za formatiranje vremena u željeni format
function formatTime(time) {
    const minutes = Math.floor(time / (60 * 1000));
    const seconds = Math.floor((time % (60 * 1000)) / 1000);
    const milliseconds = time % 1000;
    return `${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`;
}

// Pomoćne funkcije za dodavanje nula ispred brojeva
function pad2(num) {
    return num.toString().padStart(2, '0');
}

function pad3(num) {
    return num.toString().padStart(3, '0');
}

// Event listeneri za pritisak i otpuštanje tipki
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

// Pokretanje animacije
animate()