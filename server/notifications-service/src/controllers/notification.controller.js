const ReminderService = require('../services/reminder.service');

const ejecutarManual = async (req, res) => {
    try {
        console.log('👇 Ejecución manual de recordatorios solicitada via API');
        const resultado = await ReminderService.enviarRecordatoriosManana();
        
        res.status(200).json({
            ok: true,
            mensaje: 'Proceso de recordatorios finalizado',
            detalles: resultado
        });
    } catch (error) {
        res.status(500).json({ 
            ok: false, 
            error: error.message 
        });
    }
};

module.exports = { ejecutarManual };