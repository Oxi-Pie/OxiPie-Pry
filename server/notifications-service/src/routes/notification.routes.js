const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const WhatsappController = require('../controllers/whatsapp.controller');
const SchedulerController = require('../controllers/scheduler.controller'); // Importar

// Rutas existentes
router.post('/recordatorios', NotificationController.ejecutarManual);
router.get('/status', WhatsappController.getEstado);
router.post('/logout', WhatsappController.desconectar);

// NUEVAS RUTAS DE HORARIO
router.get('/config', SchedulerController.getHora);
router.post('/config', SchedulerController.setHora);

module.exports = router;