const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pacienteRoutes = require('./routes/paciente.routes');

const app = express();
const PORT = process.env.PORT || 4001;

// Middlewares
app.use(cors()); // Permite que NextJS llame a este servicio
app.use(express.json());

// Rutas
app.use('/api/pacientes', pacienteRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Microservicio de Pacientes OxiPie: ONLINE');
});

app.listen(PORT, () => {
  console.log(`✅ Servicio de Pacientes corriendo en http://localhost:${PORT}`);
});