const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializadores
require('./services/whatsapp.service');
const SchedulerService = require('./services/scheduler.service'); // Importar

const notificationRoutes = require('./routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.use('/api/notificaciones', notificationRoutes);

// --- INICIAR EL PROGRAMADOR ---
// Esto leerá el archivo config.json y pondrá la hora correcta al iniciar
SchedulerService.initScheduler();

app.get('/', (req, res) => {
    res.send('Microservicio de Notificaciones: ONLINE');
});

app.listen(PORT, () => {
    console.log(`✅ Notifications Service corriendo en http://localhost:${PORT}`);
});