const PodologaService = require('../services/podologa.service');

const obtenerTodas = async (req, res) => {
  try {
    const podologas = await PodologaService.buscarTodas();
    res.json(podologas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerUna = async (req, res) => {
  try {
    const podologa = await PodologaService.buscarPorId(req.params.id);
    if (!podologa) return res.status(404).json({ error: 'Podóloga no encontrada' });
    res.json(podologa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const nueva = await PodologaService.registrar(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const actualizada = await PodologaService.actualizar(req.params.id, req.body);
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
    try {
        await PodologaService.eliminar(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { obtenerTodas, obtenerUna, crear, actualizar, eliminar };