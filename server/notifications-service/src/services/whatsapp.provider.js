const axios = require('axios');
require('dotenv').config();

const enviarMensaje = async (telefono, nombrePaciente, fecha, hora) => {
  try {
    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PHONE_ID}/messages`;
    
    // IMPORTANTE: Meta requiere el número con código de país sin el '+' (Ej: 59399...)
    // Aquí hacemos una limpieza básica.
    let telefonoFormateado = telefono.replace(/\D/g, ''); 
    
    const method = 'POST';

    const body = {
      messaging_product: 'whatsapp',
      to: telefonoFormateado,
      type: 'template',
      template: {
        name: 'recordatorio_oxipie',
        language: { code: 'es_ECU' },
        
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: nombrePaciente },
              { type: "text", text: fecha },
              { type: "text", text: hora }
            ]
          }
        ]
        
      }
    };

    const config = {
      headers: {
        'Authorization': `Bearer ${process.env.META_WA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(url, method, body, config);
    console.log(`ÉXITO: Mensaje enviado a ${nombrePaciente} (${telefonoFormateado})`);
    return response.data;

  } catch (error) {
    console.error(`ERROR: Error enviando WhatsApp a ${telefono}:`, error.response ? error.response.data : error.message);
    // No lanzamos error para no detener el cron job si falla uno solo
    return null;
  }
};

module.exports = { enviarMensaje };