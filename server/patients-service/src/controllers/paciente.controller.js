const PacienteService = require('../services/paciente.service');

const obtenerTodos = async (req, res) => {
  try {
    const pacientes = await PacienteService.buscarTodos();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

const obtenerUno = async (req, res) => {
  try {
    const paciente = await PacienteService.buscarPorId(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar paciente' });
  }
};

const crearPaciente = async (req, res) => {
  try {
    const { nombres_pac, apellidos_pac, cedula_pac, genero_pac, fechaNac_pac } = req.body;
    
    // Validación básica requerida
    if (!nombres_pac || !apellidos_pac || !cedula_pac || !fechaNac_pac) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const nuevoPaciente = await PacienteService.registrar(req.body);
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizarPaciente = async (req, res) => {
  try {
    const pacienteActualizado = await PacienteService.actualizar(req.params.id, req.body);
    res.json(pacienteActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarPaciente = async (req, res) => {
  try {
    await PacienteService.eliminar(req.params.id);
    res.status(204).send(); // 204 No Content es estándar para delete exitoso
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  obtenerTodos,
  obtenerUno,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
};