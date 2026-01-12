const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/paciente.controller');

router.get('/', PacienteController.obtenerTodos);
router.get('/:id', PacienteController.obtenerUno);
router.post('/', PacienteController.crearPaciente);
router.put('/:id', PacienteController.actualizarPaciente);
router.delete('/:id', PacienteController.eliminarPaciente);

module.exports = router;