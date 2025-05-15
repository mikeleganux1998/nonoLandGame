import {estadoJuego} from './estadoJuego.js';

// Sonidos
const sonidoSalto = new Audio('assets/audio/salto.mp3');
const sonidoMoneda = new Audio('assets/audio/moneda.mp3');
const sonidoGolpe = new Audio('assets/audio/golpe.mp3');

// Imagen de vidas
const vidaImg = new Image();
vidaImg.src = 'assets/img/vida.png';

// Evita delay en primera reproducción (buffering)
[sonidoSalto, sonidoMoneda, sonidoGolpe].forEach(sonido => {
    sonido.load();
});

sonidoGolpe.volume = 0.18;
sonidoSalto.volume = 0.18;
sonidoMoneda.volume = 0.18;

const himnoInstrumental = new Audio('assets/audio/himno_instrumental.mp3');
himnoInstrumental.loop = true;
himnoInstrumental.volume = 0.2;
himnoInstrumental.load(); // Preload para evitar delay

$('#monedasContador').text(estadoJuego.monedas);
$('#itemsContador').text(estadoJuego.items);

const gameOverScreen = $('#gameOverScreen');
const reiniciarBtn = $('#reiniciarBtn');

let juegoTerminado = false;
let himnoReproducido = false;

reiniciarBtn.on('click', () => {
    localStorage.clear();
    location.href = 'nivel1.html';
});

const canvas = $('#juegoCanvas')[0];
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fondo = new Image();
fondo.src = 'assets/img/fondo.png';
const jugadorImg = new Image();
jugadorImg.src = 'assets/img/jugador3.png';
const monedaImg = new Image();
monedaImg.src = 'assets/img/moneda.png';
const ticketImg = new Image();
ticketImg.src = 'assets/img/ticket.png';
const noviaImg = new Image();
noviaImg.src = 'assets/img/novia.png';
const enemigo1Img = new Image();
enemigo1Img.src = 'assets/img/enemigo.png';
const enemigo2Img = new Image();
enemigo2Img.src = 'assets/img/enemigo2.png';
const enemigo3Img = new Image();
enemigo3Img.src = 'assets/img/enemigo3.png';


const nivelCompletadoImg = new Image();
nivelCompletadoImg.src = 'assets/img/nivel_completado.jpg';

const images = [fondo, jugadorImg, monedaImg, ticketImg, noviaImg, enemigo1Img, enemigo2Img, nivelCompletadoImg, vidaImg];

let cargadas = 0;
images.forEach(img => {
    img.onload = () => {
        cargadas++;
        if (cargadas === images.length) {
            iniciarJuego();
        }
    };
});

// Jugador
const jugador = {
    x: 100, y: canvas.height - 220,
    width: 100, height: 110,
    dx: 0, dy: 0,
    velocidad: 5, saltando: false
};

const gravedad = 0.5;
const salto = -25;

// Plataformas
const plataformas = [
    {x: 200, y: canvas.height - 200, width: 150, height: 20},
    {x: 500, y: canvas.height - 350, width: 180, height: 20},
    {x: 800, y: canvas.height - 500, width: 200, height: 20},
    {x: 1100, y: canvas.height - 600, width: 150, height: 20},
    {x: 1400, y: canvas.height - 280, width: 150, height: 20},


    // Nuevas plataformas agregadas
    {x: 300, y: canvas.height - 450, width: 120, height: 20},
    {x: 600, y: canvas.height - 620, width: 150, height: 20},
    {x: 950, y: canvas.height - 750, width: 200, height: 20},

    {x: 1150, y: canvas.height - 250, width: 130, height: 20},
    {x: 700, y: canvas.height - 300, width: 120, height: 20},
    {x: 50, y: canvas.height - 150, width: 100, height: 20},

    {x: canvas.width - 300, y: 150, width: 180, height: 20},
];

// Monedas
const MONEDA_WIDTH = 45, MONEDA_HEIGHT = 45;
const monedas = plataformas.map(p => ({
    x: p.x + 80,
    y: p.y - MONEDA_HEIGHT,
    recogida: false
}));

// Ticket
let ticketRecogido = false;
const ticket = {
    x: 900,
    y: canvas.height - 650,
    width: 60,
    height: 60
};

// Novia en la plataforma más alta y derecha
const ultimaPlataforma = plataformas[plataformas.length - 1];
const novia = {
    x: ultimaPlataforma.x + (ultimaPlataforma.width / 2) - 40, // centrado horizontalmente (80/2=40)
    y: ultimaPlataforma.y - 100, // ajusta esto para que toque bien la plataforma
    width: 80,
    height: 100
};

// Enemigos con movimiento limitado a su plataforma
const enemigos = [
    {
        img: enemigo1Img,
        width: 130,
        height: 130,
        dx: 2,
        tipo: 'aleatorio',
        tiempoCambio: 0,
        plataformaIndex: Math.floor(Math.random() * plataformas.length)
    },
    {
        img: enemigo2Img,
        width: 130,
        height: 130,
        dx: 1.5,
        tipo: 'aleatorio',
        tiempoCambio: 0,
        plataformaIndex: Math.floor(Math.random() * plataformas.length)
    },
    {
        img: enemigo3Img, // ← nuevo enemigo
        width: 130,
        height: 130,
        dx: 2.2,
        tipo: 'aleatorio',
        tiempoCambio: 0,
        plataformaIndex: Math.floor(Math.random() * plataformas.length)
    }
];

// Posición inicial basada en la plataforma asignada
enemigos.forEach(enemigo => {
    enemigo.plataformaIndex = Math.floor(Math.random() * (plataformas.length - 1));
    const plataforma = plataformas[enemigo.plataformaIndex];
    enemigo.x = plataforma.x + Math.random() * (plataforma.width - enemigo.width);
    enemigo.y = plataforma.y - enemigo.height;
});
function moverEnemigos() {
    enemigos.forEach(enemigo => {
        const plataforma = plataformas[enemigo.plataformaIndex];

        // Movimiento horizontal
        enemigo.x += enemigo.dx;

        // Límites de la plataforma
        const limiteIzq = plataforma.x;
        const limiteDer = plataforma.x + plataforma.width - enemigo.width;

        // Rebote en bordes
        if (enemigo.x <= limiteIzq || enemigo.x >= limiteDer) {
            enemigo.dx *= -1;
            enemigo.x = Math.max(limiteIzq, Math.min(enemigo.x, limiteDer));
        }

        enemigo.y = plataforma.y - enemigo.height;
    });
}

let nivelCompletado = false;
let tiempoTransicion = 0;

const teclas = {};
$(document).on('keydown', e => {
    if (juegoTerminado || nivelCompletado) return;
    teclas[e.code] = true;

    if (!himnoReproducido && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        himnoReproducido = true;
        himnoInstrumental.currentTime = 28; // Iniciar desde el segundo 28
        himnoInstrumental.play().catch(err => {
            console.warn("Error al reproducir el himno:", err);
        });
    }
});
$(document).on('keyup', e => teclas[e.code] = false);

if (window.location.href.includes('nivel6.html')) {
    ticketRecogido = false;
    estadoJuego.items = 0;
    localStorage.setItem('estadoJuego', JSON.stringify(estadoJuego));
}

function actualizar() {
    if (estadoJuego.vidas <= 0 && !juegoTerminado) {
        juegoTerminado = true;
        gameOverScreen.fadeIn(300);
        himnoInstrumental.pause();
        himnoInstrumental.currentTime = 0;
        return;
    }

    if (juegoTerminado || nivelCompletado) {
        jugador.dx = jugador.dy = 0;
        return;
    }

    jugador.dx = 0;
    if (teclas['ArrowLeft']) jugador.dx = -jugador.velocidad;
    if (teclas['ArrowRight']) jugador.dx = jugador.velocidad;
    if (teclas['Space'] && !jugador.saltando) {
        jugador.dy = salto;
        jugador.saltando = true;
        sonidoSalto.currentTime = 0;
        sonidoSalto.play();
    }

    jugador.dy += gravedad;
    jugador.x += jugador.dx;
    jugador.y += jugador.dy;

    if (jugador.x < 0) jugador.x = 0;
    if (jugador.x + jugador.width > canvas.width) jugador.x = canvas.width - jugador.width;
    if (jugador.y + jugador.height > canvas.height) {
        jugador.y = canvas.height - jugador.height;
        jugador.dy = 0;
        jugador.saltando = false;
    }

    plataformas.forEach(p => {
        if (
            jugador.x < p.x + p.width &&
            jugador.x + jugador.width > p.x &&
            jugador.y + jugador.height <= p.y + 10 &&
            jugador.y + jugador.height + jugador.dy >= p.y
        ) {
            jugador.y = p.y - jugador.height;
            jugador.dy = 0;
            jugador.saltando = false;
        }
    });

    monedas.forEach(moneda => {
        if (!moneda.recogida &&
            jugador.x < moneda.x + MONEDA_WIDTH &&
            jugador.x + jugador.width > moneda.x &&
            jugador.y < moneda.y + MONEDA_HEIGHT &&
            jugador.y + jugador.height > moneda.y) {

            moneda.recogida = true;
            estadoJuego.sumarMoneda();
            $('#monedasContador').text(estadoJuego.monedas);

            sonidoMoneda.currentTime = 0;
            sonidoMoneda.play();
        }
    });

    if (!ticketRecogido &&
        jugador.x < ticket.x + ticket.width &&
        jugador.x + jugador.width > ticket.x &&
        jugador.y < ticket.y + ticket.height &&
        jugador.y + jugador.height > ticket.y) {

        ticketRecogido = true;
        estadoJuego.sumarItem();
        $('#itemsContador').text(estadoJuego.items);

        sonidoMoneda.currentTime = 0;
        sonidoMoneda.play();
    }

    if (
        jugador.x < novia.x + novia.width &&
        jugador.x + jugador.width > novia.x &&
        jugador.y < novia.y + novia.height &&
        jugador.y + jugador.height > novia.y
    ) {
        if (ticketRecogido) {
            if (!nivelCompletado) {
                nivelCompletado = true;
                himnoInstrumental.pause();
                himnoInstrumental.currentTime = 0;
                jugador.x = novia.x + (novia.width - jugador.width) / 2;
                jugador.y = novia.y + (novia.height - jugador.height) / 2;
                jugador.dx = jugador.dy = 0;
                teclas['ArrowLeft'] = teclas['ArrowRight'] = teclas['Space'] = false;
            }
        } else {
            if (!$('#mensajeErrorTicket').length) {
                const mensaje = $('<div id="mensajeErrorTicket" style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); background: rgba(255,0,0,0.8); color: white; font-family: \'Press Start 2P\', cursive; font-size: 1.1rem; padding: 1rem 2rem; border: 2px solid white; border-radius: 10px; z-index: 10000; text-align: center;">¡Primero recoge el ticket!</div>');
                $('body').append(mensaje);
                mensaje.fadeIn(300);
                setTimeout(() => {
                    mensaje.fadeOut(300, () => mensaje.remove());
                }, 1500);
            }
        }
    }

    enemigos.forEach(enemigo => {
        if (
            jugador.x < enemigo.x + enemigo.width &&
            jugador.x + jugador.width > enemigo.x &&
            jugador.y < enemigo.y + enemigo.height &&
            jugador.y + jugador.height > enemigo.y
        ) {
            if (!juegoTerminado) {
                estadoJuego.restarVida();

                sonidoGolpe.currentTime = 0;
                sonidoGolpe.play();
                const direccion = jugador.x < enemigo.x ? -1 : 1;
                jugador.x += direccion * 180;
                jugador.dy = -15;

                if (estadoJuego.vidas <= 0) {
                    juegoTerminado = true;
                    setTimeout(() => gameOverScreen.fadeIn(300), 500);
                }
            }
        }
    });

    moverEnemigos();
}

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

    // Dibujar vidas
    const VIDA_WIDTH = 40;
    const VIDA_HEIGHT = 40;
    for (let i = 0; i < estadoJuego.vidas; i++) {
        ctx.drawImage(vidaImg, 10 + i * (VIDA_WIDTH + 10), 50, VIDA_WIDTH, VIDA_HEIGHT);
    }

    ctx.fillStyle = "red";
    plataformas.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    monedas.forEach(moneda => {
        if (!moneda.recogida) {
            ctx.save();
            ctx.shadowColor = 'yellow';
            ctx.shadowBlur = 20;
            ctx.drawImage(monedaImg, moneda.x, moneda.y, MONEDA_WIDTH, MONEDA_HEIGHT);
            ctx.restore();
        }
    });

    if (!ticketRecogido) {
        ctx.drawImage(ticketImg, ticket.x, ticket.y, ticket.width, ticket.height);
    }

    ctx.drawImage(noviaImg, novia.x, novia.y, novia.width, novia.height);

    enemigos.forEach(enemigo => {
        ctx.drawImage(enemigo.img, enemigo.x, enemigo.y, enemigo.width, enemigo.height);
    });

    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 25;
    ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
    ctx.restore();

    if (nivelCompletado) {
        tiempoTransicion++;

        if (tiempoTransicion === 1) {
            mostrarCinematicaFinal();
        }

        return;
    }
}

function mostrarCinematicaFinal() {
    $('#cinematicaFinal').css('display', 'flex');

    const audioMeta = document.getElementById('audioMeta');
    audioMeta.currentTime = 0;
    audioMeta.play().catch(err => {
        console.warn("No se pudo reproducir el audio:", err);
    });
}

$('#finalizarJuegoBtn').on('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

function iniciarEnemigoIntervalos() {
    setInterval(() => {
        const enemigo = enemigos[0];
        cambiarPlataformaEnemigo(enemigo);
    }, 1950); // cada 2 segundos

    setInterval(() => {
        const enemigo = enemigos[1];
        cambiarPlataformaEnemigo(enemigo);
    }, 800); // cada 1 segundo

    setInterval(() => {
        const enemigo = enemigos[2];
        cambiarPlataformaEnemigo(enemigo);
    }, 1200); // cada 1.5 segundos
}

function cambiarPlataformaEnemigo(enemigo) {
    enemigo.plataformaIndex = Math.floor(Math.random() * (plataformas.length - 1));
    const plataforma = plataformas[enemigo.plataformaIndex];
    enemigo.x = plataforma.x + Math.random() * (plataforma.width - enemigo.width);
    enemigo.y = plataforma.y - enemigo.height;
    enemigo.dx *= Math.random() < 0.5 ? 1 : -1;
}

function loop() {
    actualizar();
    dibujar();
    requestAnimationFrame(loop);
}

function iniciarJuego() {
    $('#cinematicaFinal').hide();
    $('#gameOverScreen').hide();
    iniciarEnemigoIntervalos();
    loop();

    mostrarMensajeCapturaTicket();
}

function mostrarMensajeCapturaTicket() {
    const mensaje = $('<div id="mensajeTicket" style="position: fixed; top: 20%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: yellow; font-family: \'Press Start 2P\', cursive; font-size: 1.2rem; padding: 1rem 2rem; border: 2px solid yellow; border-radius: 10px; z-index: 10000; text-align: center;">Captura el ticket y salva a tu novia para entrar al estadio</div>');
    $('body').append(mensaje);

    mensaje.fadeIn(300);

    setTimeout(() => {
        mensaje.fadeOut(300, () => {
            mensaje.remove();
        });
    }, 1200);
}