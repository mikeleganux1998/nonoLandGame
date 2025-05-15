import { estadoJuego } from './estadoJuego.js';



// Sonidos
const sonidoSalto = new Audio('assets/audio/salto.mp3');
const sonidoMoneda = new Audio('assets/audio/moneda.mp3');
const sonidoGolpe = new Audio('assets/audio/golpe.mp3');

// Evita delay en primera reproducción (buffering)
[sonidoSalto, sonidoMoneda, sonidoGolpe].forEach(sonido => {
    sonido.load();
});

sonidoGolpe.volume = 0.3;
sonidoSalto.volume = 0.2;
sonidoMoneda.volume = 0.2;



// Inicializa contadores con los valores guardados
$('#monedasContador').text(estadoJuego.monedas);
$('#itemsContador').text(estadoJuego.items);

const gameOverScreen = $('#gameOverScreen');
const reiniciarBtn = $('#reiniciarBtn');

let juegoTerminado = false;

reiniciarBtn.on('click', () => {
    localStorage.clear();
    location.href = 'nivel1.html';
});

const canvas = $('#juegoCanvas')[0];
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cargar imágenes
const fondo = new Image(); fondo.src = 'assets/img/fondo_2.png';
const jugadorImg = new Image(); jugadorImg.src = 'assets/img/jugador2.png';
const monedaImg = new Image(); monedaImg.src = 'assets/img/moneda.png';
const balonImg = new Image(); balonImg.src = 'assets/img/balon.png';
const portalImg = new Image(); portalImg.src = 'assets/img/portal.png';
const nivelCompletadoImg = new Image(); nivelCompletadoImg.src = 'assets/img/nivel_completado.jpg';
const enemigoImg = new Image(); enemigoImg.src = 'assets/img/enemigo.png';

// Jugador
const jugador = {
    x: 100, y: canvas.height - 220,
    width: 100, height: 110,
    dx: 0, dy: 0,
    velocidad: 5, saltando: false
};

const gravedad = 0.5;
const salto = -23;

// Plataformas
const plataformas = [
    { x: 200, y: canvas.height - 200, width: 150, height: 20 },
    { x: 450, y: canvas.height - 350, width: 180, height: 20 },
    { x: 700, y: canvas.height - 500, width: 200, height: 20 },
    { x: 1000, y: canvas.height - 600, width: 150, height: 20 },
    { x: 1300, y: canvas.height - 450, width: 180, height: 20 },
    { x: 1600, y: canvas.height - 300, width: 150, height: 20 },
    { x: 1900, y: canvas.height - 200, width: 220, height: 20 }
];

// Monedas
const MONEDA_WIDTH = 45, MONEDA_HEIGHT = 45;
const monedas = plataformas.map(p => ({
    x: p.x + 80,
    y: p.y - MONEDA_HEIGHT,
    recogida: false
}));

let itemRecogido = false;
const bandera = {
    x: (canvas.width / 2) - 130,
    y: (canvas.height / 2) - 375,
    width: 60, height: 75
};
const portal = {
    x: canvas.width - 170,
    y: 20,
    width: 150, height: 150
};

let anguloMoneda = 0;
let anguloPortal = 0;

const teclas = {};
$(document).on('keydown', e => teclas[e.code] = true);
$(document).on('keyup', e => teclas[e.code] = false);

// Enemigo
const enemigo = {
    plataformaIndex: 0,
    x: plataformas[0].x + 50,
    y: plataformas[0].y - 140,
    width: 140, height: 140
};

function moverEnemigoRandom() {
    let nuevaIndex;
    do {
        nuevaIndex = Math.floor(Math.random() * plataformas.length);
    } while (nuevaIndex === enemigo.plataformaIndex);

    enemigo.plataformaIndex = nuevaIndex;
    enemigo.x = plataformas[nuevaIndex].x + 50;
    enemigo.y = plataformas[nuevaIndex].y - enemigo.height;
}
setInterval(moverEnemigoRandom, 2200);

let nivelCompletado = false;
let tiempoTransicion = 0;

function actualizar() {
    if (juegoTerminado || nivelCompletado) {
        jugador.dx = jugador.dy = 0;
        return;
    }

    if (estadoJuego.monedas <= 0) {
        juegoTerminado = true;
        gameOverScreen.show();
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

    if (!itemRecogido &&
        jugador.x < bandera.x + bandera.width &&
        jugador.x + jugador.width > bandera.x &&
        jugador.y < bandera.y + bandera.height &&
        jugador.y + jugador.height > bandera.y) {
        itemRecogido = true;
        estadoJuego.sumarItem();
        $('#itemsContador').text(estadoJuego.items);
    }

    if (
        jugador.x < portal.x + portal.width &&
        jugador.x + jugador.width > portal.x &&
        jugador.y < portal.y + portal.height &&
        jugador.y + jugador.height > portal.y
    ) {
        nivelCompletado = true;
        jugador.x = portal.x + (portal.width - jugador.width) / 2;
        jugador.y = portal.y + (portal.height - jugador.height) / 2;
        jugador.dx = jugador.dy = 0;
        teclas['ArrowLeft'] = teclas['ArrowRight'] = teclas['Space'] = false;
    }

    if (
        jugador.x < enemigo.x + enemigo.width &&
        jugador.x + jugador.width > enemigo.x &&
        jugador.y < enemigo.y + enemigo.height &&
        jugador.y + jugador.height > enemigo.y
    ) {
        if (!juegoTerminado) {
            // Restar solo 1 moneda
            estadoJuego.monedas = Math.max(0, estadoJuego.monedas - 1);
            $('#monedasContador').text(estadoJuego.monedas);

            // Sonido de golpe
            sonidoGolpe.currentTime = 0;
            sonidoGolpe.play();

            // Empuje fuerte y salto leve
            const direccion = Math.random() < 0.5 ? -1 : 1;
            jugador.x += direccion * 250; // Empuje fuerte
            jugador.dy = -15; // Salto por el golpe

            // Revisar si se acabaron las monedas
            if (estadoJuego.monedas <= 0) {
                juegoTerminado = true;
                setTimeout(() => gameOverScreen.show(), 500); // Delay visual
            }
        }
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
        ctx.drawImage(balonImg, bandera.x, bandera.y, bandera.width, bandera.height);
    }

    ctx.save();
    ctx.translate(portal.x + portal.width / 2, portal.y + portal.height / 2);
    ctx.rotate(anguloPortal * Math.PI / 180);
    ctx.drawImage(portalImg, -portal.width / 2, -portal.height / 2, portal.width, portal.height);
    ctx.restore();

    ctx.drawImage(enemigoImg, enemigo.x, enemigo.y, enemigo.width, enemigo.height);

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

        $('#nivelCompletadoTitulo').show();
        $('#continuar-btn').show();
    }
}


$('#continuar-btn').on('click', () => {

    location.href = 'nivel3.html'; // Cambia a la ruta del siguiente nivel

});

const mensaje = $('#mensajeEnemigo');
mensaje.fadeIn();

setTimeout(() => {
    mensaje.fadeOut(1000);
}, 1200); // l



function bucle() {
    actualizar();
    dibujar();
    requestAnimationFrame(bucle);
}

bucle();