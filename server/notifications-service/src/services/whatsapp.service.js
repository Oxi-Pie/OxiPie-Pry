const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// Rutas absolutas a las carpetas problemáticas
const authPath = path.join(__dirname, '../../.wwebjs_auth');
const cachePath = path.join(__dirname, '../../.wwebjs_cache');

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

client.on('disconnected', async (reason) => {
    console.log('⚠️ Cliente desconectado por WhatsApp:', reason);
    isConnected = false;
    
    // Si fue intencional desde el celular, limpiamos todo
    if (reason === 'NAVIGATION' || reason === 'CONFLICT' || reason === 'UNPAIRED_IDLE') {
        await logout();
    } else {
        client.initialize(); 
    }
});

client.initialize();

const getStatus = () => {
    return {
        connected: isConnected,
        qr: qrCodeData,
        phone: client.info ? client.info.wid.user : null
    };
};

const logout = async () => {
    console.log('🧹 Iniciando proceso de desconexión y limpieza...');
    
    try {
        if (isConnected) await client.logout();
    } catch (e) {
        console.warn('⚠️ Cierre educado falló. Procediendo a destrucción forzada.');
    }

    try {
        await client.destroy(); // Matar Puppeteer
    } catch (e) {
        // Ignoramos si ya estaba muerto
    }

    // ELIMINAR LAS CARPETAS FÍSICAMENTE
    try {
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log('🗑️ Carpeta .wwebjs_auth eliminada.');
        }
        if (fs.existsSync(cachePath)) {
            fs.rmSync(cachePath, { recursive: true, force: true });
            console.log('🗑️ Carpeta .wwebjs_cache eliminada.');
        }
    } catch (fsError) {
        console.error('❌ Error borrando carpetas:', fsError);
    }

    // Reiniciar valores
    isConnected = false;
    qrCodeData = null;

    // Volver a levantar el navegador para que genere un nuevo QR
    console.log('♻️ Inicializando cliente desde cero...');
    client.initialize(); 
    
    return true;
};