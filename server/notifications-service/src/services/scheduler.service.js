const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const ReminderService = require('./reminder.service');

const CONFIG_PATH = path.join(__dirname, '../../config.json');
let currentTask = null;

// 1. Obtener hora guardada (o devolver default 08:00)
const getConfig = () => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            // Validación extra: Si el archivo está vacío, retorna default
            if (!data) return { time: "08:00" }; 
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Error leyendo config (Usando default):", e.message);
    }
    return { time: "08:00" }; // Default si falla algo
};

// 2. Guardar nueva hora
const saveConfig = (time) => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ time }));
        return true;
    } catch (e) {
        console.error("Error guardando config:", e);
        return false;
    }
};

// 3. Iniciar o Reiniciar el Cron
const initScheduler = () => {
    // Si ya existe una tarea corriendo, la detenemos
    if (currentTask) {
        console.log('🛑 Deteniendo cron anterior...');
        currentTask.stop();
    }

    const { time } = getConfig();
    const [hour, minute] = time.split(':');

    // Formato CRON: "minuto hora * * *"
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`⏰ Programando recordatorios a las: ${time} (${cronExpression})`);

    currentTask = cron.schedule(cronExpression, () => {
        console.log('🚀 Ejecutando tarea programada...');
        ReminderService.enviarRecordatoriosManana();
    });
};

// 4. Función para actualizar desde el Controller
const updateSchedule = (newTime) => {
    // Validar formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime)) {
        throw new Error("Formato de hora inválido. Use HH:MM");
    }

    saveConfig(newTime);
    initScheduler(); // Reinicia el cron con la nueva hora
    return newTime;
};

module.exports = { initScheduler, updateSchedule, getConfig };