const express = require('express');
const router = express.Router();
const PodologaController = require('../controllers/podologa.controller');

router.get('/', PodologaController.obtenerTodas);
router.get('/:id', PodologaController.obtenerUna);
router.post('/', PodologaController.crear);
router.put('/:id', PodologaController.actualizar);
router.delete('/:id', PodologaController.eliminar);

module.exports = router;