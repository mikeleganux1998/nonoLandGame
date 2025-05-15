export const estadoJuego = {
    monedas: parseInt(localStorage.getItem('monedas')) || 0,
    items: parseInt(localStorage.getItem('items')) || 0,
    vidas: parseInt(localStorage.getItem('vidas')) || 3,
    monedasUltimaVida: parseInt(localStorage.getItem('monedasUltimaVida')) || 0,

    sumarMoneda() {
        this.monedas++;
        localStorage.setItem('monedas', this.monedas);

        // Otorgar una vida por cada 5 monedas nuevas
        if (this.monedas - this.monedasUltimaVida >= 5) {
            this.vidas++;
            this.monedasUltimaVida = this.monedas;
            localStorage.setItem('vidas', this.vidas);
            localStorage.setItem('monedasUltimaVida', this.monedasUltimaVida);
        }
    },

    restarVida() {
        this.vidas = Math.max(0, this.vidas - 1);
        localStorage.setItem('vidas', this.vidas);
    },

    sumarItem() {
        this.items++;
        localStorage.setItem('items', this.items);
    },

    reset() {
        this.monedas = 0;
        this.items = 0;
        this.vidas = 3;
        this.monedasUltimaVida = 0;

        localStorage.setItem('monedas', 0);
        localStorage.setItem('items', 0);
        localStorage.setItem('vidas', 3);
        localStorage.setItem('monedasUltimaVida', 0);
    }
};