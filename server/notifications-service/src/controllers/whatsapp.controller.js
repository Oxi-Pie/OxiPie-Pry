const WhatsappService = require('../services/whatsapp.service');

const getEstado = (req, res) => {
    const status = WhatsappService.getStatus();
    res.json(status);
};

const desconectar = async (req, res) => {
    await WhatsappService.logout();
    res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = { getEstado, desconectar };