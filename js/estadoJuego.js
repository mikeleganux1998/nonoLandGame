// estadoJuego.js

// Si ya existen en localStorage, los tomamos. Si no, los inicializamos en 0.
export const estadoJuego = {
    monedas: parseInt(localStorage.getItem('monedas')) || 0,
    items: parseInt(localStorage.getItem('items')) || 0,

    sumarMoneda() {
        this.monedas++;
        localStorage.setItem('monedas', this.monedas);
        document.getElementById('monedasContador').textContent = this.monedas;
    },

    sumarItem() {
        this.items++;
        localStorage.setItem('items', this.items);
        document.getElementById('itemsContador').textContent = this.items;
    },

    reset() {
        this.monedas = 0;
        this.items = 0;
        localStorage.setItem('monedas', 0);
        localStorage.setItem('items', 0);
    }
};