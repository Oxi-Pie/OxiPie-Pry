const WhatsappService = require('../services/whatsapp.service');

const getEstado = (req, res) => {
    try {
        const status = WhatsappService.getStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el estado de WhatsApp' });
    }
};

const desconectar = async (req, res) => {
    try {
        console.log('🛑 Petición de desconexión recibida desde el Frontend');
        
        // Llamamos a nuestra nueva función destructora
        const success = await WhatsappService.logout();
        
        if (success) {
            res.status(200).json({ ok: true, message: 'Sesión destruida y limpiada correctamente' });
        } else {
            res.status(500).json({ ok: false, error: 'Hubo un problema al limpiar las carpetas de sesión' });
        }
    } catch (error) {
        console.error('Error en controlador de desconexión:', error);
        res.status(500).json({ ok: false, error: 'Error interno al intentar desconectar' });
    }
};

module.exports = { getEstado, desconectar };