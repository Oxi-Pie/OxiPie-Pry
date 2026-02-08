const express = require('express');
const cron = require('node-cron');
const { procesarRecordatorios } = require('./services/notificacion.service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

// Endpoint manual para probar sin esperar al Cron (Útil para desarrollo)
app.post('/api/notificaciones/test-trigger', async (req, res) => {
    try {
        console.log("🔫 Disparo manual de notificaciones iniciado...");
        await procesarRecordatorios();
        res.json({ message: "Proceso de notificaciones ejecutado manualmente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health Check
app.get('/', (req, res) => res.send('Microservicio de Notificaciones (WhatsApp) ONLINE'));

// --- CRON JOB ---
// Se ejecuta cada hora en el minuto 0 (ej: 08:00, 09:00, 10:00...)
cron.schedule('0 * * * *', () => {
    procesarRecordatorios();
});

app.listen(PORT, () => {
  console.log(`✅ Notifications Service corriendo en puerto ${PORT}`);
  console.log(`⏰ Cron Job programado para ejecutarse cada hora.`);
});