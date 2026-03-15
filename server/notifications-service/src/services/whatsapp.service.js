const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '../../.wwebjs_auth');
const cachePath = path.join(__dirname, '../../.wwebjs_cache');

let qrCodeData = null;
let isConnected = false;
let isRestarting = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true
    }
});

// 1. EL RESET ABSOLUTO (A prueba de bloqueos de Windows)
const logout = async () => {
    if (isRestarting) return false;
    isRestarting = true;
    
    console.log('🧹 Iniciando limpieza profunda de sesión...');

    // PASO 1: Destruir el navegador de Puppeteer para que suelte los archivos
    try {
        console.log('🛑 Cerrando navegador interno...');
        await client.destroy();
    } catch (e) {
        console.log('⚠️ El navegador ya estaba cerrado o no respondió.');
    }

    // PASO 2: Darle a Windows 1.5 segundos para liberar el bloqueo del disco duro
    console.log('⏳ Esperando que Windows libere los archivos...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // PASO 3: Borrar las carpetas (con reintentos por si Windows se pone terco)
    try {
        // maxRetries: 5 significa que si falla, lo intentará 5 veces más esperando medio segundo
        const rmOptions = { recursive: true, force: true, maxRetries: 5, retryDelay: 500 };
        
        if (fs.existsSync(authPath)) fs.rmSync(authPath, rmOptions);
        if (fs.existsSync(cachePath)) fs.rmSync(cachePath, rmOptions);
        
        console.log('🗑️ Carpetas de sesión eliminadas del disco correctamente.');
    } catch (fsError) {
        console.error('❌ Error crítico borrando carpetas (Archivo aún en uso):', fsError.message);
    }

    // PASO 4: El "Suicidio" para limpiar la memoria (PM2 nos revivirá al instante)
    console.log('☠️ Reiniciando proceso para limpiar memoria...');
    setTimeout(() => {
        process.exit(1);
    }, 1000);

    return true;
};

// 2. PROTECCIÓN CONTRA CRASHES GLOBALES
// Evita que errores de "Target closed" de Puppeteer maten el servidor sin permiso
process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️ Promesa huérfana ignorada (Común al reiniciar Puppeteer)');
});

// 3. EVENTOS
client.on('qr', (qr) => {
    console.log('NUEVO QR GENERADO (Disponible en API)');
    qrCodeData = qr;
    isConnected = false;
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp conectado!');
    isConnected = true;
    qrCodeData = null;
    isRestarting = false;
});

client.on('authenticated', () => {
    console.log('✅ Autenticado correctamente');
    isConnected = true;
});

client.on('auth_failure', async (msg) => {
    console.error('❌ Fallo de autenticación detectado:', msg);
    await logout();
});

client.on('disconnected', async (reason) => {
    console.log(`⚠️ Cliente desconectado por WhatsApp. Motivo: ${reason}`);
    
    // Agregamos 'LOGOUT' a la lista de razones fatales
    const fatalReasons = ['NAVIGATION', 'CONFLICT', 'UNPAIRED_IDLE', 'LOGOUT'];
    
    if (fatalReasons.includes(reason)) {
        await logout();
    } else {
        console.log('🔄 Desconexión menor. Esperando que la librería se reconecte sola...');
        // Dejamos que whatsapp-web.js maneje las caídas de WiFi por su cuenta
    }
});

// 4. EXPORTS
const getStatus = () => {
    return {
        connected: isConnected,
        qr: qrCodeData,
        phone: client?.info?.wid?.user || null
    };
};

client.initialize();

module.exports = { client, getStatus, logout };