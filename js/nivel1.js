// JS DEL NIVEL 1

import { estadoJuego } from './estadoJuego.js';


// Sonidos
const sonidoSalto = new Audio('assets/audio/salto.mp3');
const sonidoMoneda = new Audio('assets/audio/moneda.mp3');

// Evita delay en primera reproducción (buffering)
[sonidoSalto, sonidoMoneda].forEach(sonido => {
    sonido.load();
});

sonidoSalto.volume = 0.18;
sonidoMoneda.volume = 0.18;


// Himno instrumental
const himno = new Audio('assets/audio/himno_instrumental.mp3');
himno.volume = 0.2;
himno.loop = true;

let audioIniciado = false;

// Inicializa contadores con los valores guardados
$('#monedasContador').text(estadoJuego.monedas);
$('#itemsContador').text(estadoJuego.items);

const canvas = $('#juegoCanvas')[0];
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cargar imágenes
const fondo = new Image();
fondo.src = 'assets/img/fondo_1.png';

const jugadorImg = new Image();
jugadorImg.src = 'assets/img/jugador.png';

const monedaImg = new Image();
monedaImg.src = 'assets/img/moneda.png';

const banderaImg = new Image();
banderaImg.src = 'assets/img/bandera_liverpool.png';

const portalImg = new Image();
portalImg.src = 'assets/img/portal.png';

const nivelCompletadoImg = new Image();
nivelCompletadoImg.src = 'assets/img/nivel_completado.jpg';

// Jugador
const jugador = {
    x: 100,
    y: canvas.height - 220,
    width: 100,
    height: 110,
    dx: 0,
    dy: 0,
    velocidad: 5,
    saltando: false
};

const gravedad = 0.5;
const salto = -23;

// Plataformas
const plataformas = [
    { x: 300, y: canvas.height - 250, width: 180, height: 20 },
    { x: 900, y: canvas.height - 430, width: 220, height: 20 },
    { x: canvas.width - 400, y: canvas.height - 730, width: 220, height: 20 }
];

// Monedas
const MONEDA_WIDTH = 45;
const MONEDA_HEIGHT = 45;
const monedas = plataformas.map(p => ({
    x: p.x + 80,
    y: p.y - MONEDA_HEIGHT,
    recogida: false
}));

let itemRecogido = false;
const bandera = {
    x: plataformas[2].x + 0,
    y: plataformas[2].y - 150,
    width: 60,
    height: 75
};

const portal = {
    x: canvas.width - 170,
    y: 20,
    width: 150,
    height: 150
};

let monedasContador = 0;
let itemsContador = 0;

let anguloMoneda = 0;
let anguloPortal = 0;

const teclas = {};
$(document).on('keydown', e => {
    teclas[e.code] = true;

    // Inicia el himno solo una vez al primer movimiento del jugador
    if (!audioIniciado && ['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        himno.currentTime = 28; // ⏱️ Empieza desde el segundo 28
        himno.play().catch(err => {
            console.warn('El audio no pudo reproducirse automáticamente:', err);
        });
        audioIniciado = true;
    }
});
$(document).on('keyup', e => teclas[e.code] = false);

// Transición de nivel
let nivelCompletado = false;
let tiempoTransicion = 0;

function actualizar() {
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
            sonidoMoneda.currentTime = 0;
            sonidoMoneda.play();
        }
    });

    if (!itemRecogido &&
        jugador.x < bandera.x + bandera.width &&
        jugador.x + jugador.width > bandera.x &&
        jugador.y < bandera.y + bandera.height &&
        jugador.y + jugador.height > bandera.y) {
        itemRecogido = true;
        estadoJuego.sumarItem();
    }

    if (
        jugador.x < portal.x + portal.width &&
        jugador.x + jugador.width > portal.x &&
        jugador.y < portal.y + portal.height &&
        jugador.y + jugador.height > portal.y
    ) {
        nivelCompletado = true;
        // Detener música
        himno.pause();

        // Bloqueamos el movimiento pegándolo al centro del portal
        jugador.x = portal.x + (portal.width - jugador.width) / 2;
        jugador.y = portal.y + (portal.height - jugador.height) / 2;
        jugador.dx = 0;
        jugador.dy = 0;

        // Limpiamos las teclas para que no siga moviéndose
        teclas['ArrowLeft'] = false;
        teclas['ArrowRight'] = false;
        teclas['Space'] = false;
    }

    anguloMoneda += 3;
    anguloPortal += 1;
}


function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    plataformas.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    monedas.forEach(moneda => {
        if (!moneda.recogida) {
            ctx.save();
            ctx.shadowColor = 'yellow';
            ctx.shadowBlur = 20;
            ctx.translate(moneda.x + MONEDA_WIDTH / 2, moneda.y + MONEDA_HEIGHT / 2);
            ctx.rotate(anguloMoneda * Math.PI / 180);
            ctx.drawImage(monedaImg, -MONEDA_WIDTH / 2, -MONEDA_HEIGHT / 2, MONEDA_WIDTH, MONEDA_HEIGHT);
            ctx.restore();
        }
    });

    if (!itemRecogido) {
        ctx.drawImage(banderaImg, bandera.x, bandera.y, bandera.width, bandera.height);
    }

    ctx.save();
    ctx.translate(portal.x + portal.width / 2, portal.y + portal.height / 2);
    ctx.rotate(anguloPortal * Math.PI / 180);
    ctx.drawImage(portalImg, -portal.width / 2, -portal.height / 2, portal.width, portal.height);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 25;
    ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
    ctx.restore();

    if (nivelCompletado) {
        tiempoTransicion++;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(nivelCompletadoImg, canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);

        // Mostrar título y botón
        $('#nivelCompletadoTitulo').show();
        $('#continuar-btn').show();
    }
}

function bucle() {
    actualizar();
    dibujar();
    requestAnimationFrame(bucle);
}

const mensaje = $('#mensajeInicio');
mensaje.show();

setTimeout(() => {
    mensaje.fadeOut(1000);
}, 1300);

bucle();


