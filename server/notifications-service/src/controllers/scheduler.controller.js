const SchedulerService = require('../services/scheduler.service');

const getHora = (req, res) => {
    const config = SchedulerService.getConfig();
    res.json(config);
};

const setHora = (req, res) => {
    const { time } = req.body;
    try {
        if(!time) return res.status(400).json({ error: 'Hora requerida' });
        
        SchedulerService.updateSchedule(time);
        res.json({ message: `Horario actualizado a las ${time}`, time });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getHora, setHora };