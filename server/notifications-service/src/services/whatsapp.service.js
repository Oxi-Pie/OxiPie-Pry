const { Client, LocalAuth } = require('whatsapp-web.js');

console.log('🔄 Inicializando servicio de WhatsApp...');

// Variables para almacenar estado
let qrCodeData = null;
let isConnected = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true
    }
});

client.on('qr', (qr) => {
    // En lugar de imprimirlo, lo guardamos para mandarlo al front
    console.log('NUEVO QR GENERADO (Disponible en API)');
    qrCodeData = qr;
    isConnected = false;
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp conectado!');
    isConnected = true;
    qrCodeData = null; // Ya no necesitamos el QR
});

client.on('authenticated', () => {
    console.log('Autenticado correctamente');
    isConnected = true;
});

client.on('auth_failure', () => {
    console.error('Fallo de autenticación');
    isConnected = false;
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    isConnected = false;
    client.initialize(); // Reiniciar para generar nuevo QR
});

client.initialize();

// Funciones para que el controlador acceda a los datos
const getStatus = () => {
    return {
        connected: isConnected,
        qr: qrCodeData,
        phone: client.info ? client.info.wid.user : null
    };
};

const logout = async () => {
    try {
        await client.logout();
        isConnected = false;
        qrCodeData = null;
        // Reiniciamos para permitir nueva vinculación
        client.initialize(); 
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = { client, getStatus, logout };