const { PrismaClient } = require('../../../shared/node_modules/@prisma/client');
const { client } = require('./whatsapp.service');

const prisma = new PrismaClient();

// --- Función auxiliar para formatear números ---
const formatearCelular = (numero) => {
    if (!numero) return null;
    let limpio = numero.replace(/\D/g, '');
    if (limpio.startsWith('0')) limpio = limpio.substring(1);
    if (!limpio.startsWith('593')) limpio = '593' + limpio;
    return `${limpio}@c.us`;
};

const enviarRecordatoriosManana = async () => {
    console.log('🔄 Buscando citas para mañana...');

    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    const inicioDia = new Date(manana.setHours(0, 0, 0, 0));
    const finDia = new Date(manana.setHours(23, 59, 59, 999));

    try {
        const citas = await prisma.cita.findMany({
            where: {
                fechaHora_cit: { gte: inicioDia, lte: finDia },
                estado_cit: { not: 'cancelada' }
            },
            include: { paciente: true, tratamiento: true, podologa: true }
        });

        console.log(`📅 Encontradas: ${citas.length} citas para el ${inicioDia.toLocaleDateString()}`);

        if (citas.length === 0) return { procesados: 0, mensaje: 'No hay citas para mañana' };

        let enviados = 0;

        // --- INICIO DEL BUCLE DE ENVÍO ---
        for (const cita of citas) {
            // Protección individual: Si falla uno, el bucle continúa
            try {
                console.log(`🔍 Procesando paciente ID: ${cita.paciente.id_pac} - Nombre: ${cita.paciente.nombres_pac} - Tel: ${cita.paciente.telefono_pac}`);
                const telefono = cita.paciente.telefono_pac;
                const chatIdRaw = formatearCelular(telefono);

                if (!chatIdRaw) {
                    console.log(`⚠️ Paciente ${cita.paciente.nombres_pac} sin celular válido.`);
                    continue;
                }

                if (!client.info) {
                    console.log('❌ El bot no está conectado. Abortando envío.');
                    break; // Si no hay conexión, paramos todo
                }

                // === CORRECCIÓN DEL ERROR "NO LID" ===
                // Verificamos si el número está registrado en WhatsApp antes de enviar
                const contactoValidado = await client.getNumberId(chatIdRaw);

                if (!contactoValidado) {
                    console.log(`⚠️ El número ${chatIdRaw} del paciente ${cita.paciente.nombres_pac} no está registrado en WhatsApp.`);
                    continue;
                }

                // Usamos el ID serializado que nos devuelve WhatsApp (_serialized)
                const destinatarioFinal = contactoValidado._serialized; 

                const hora = new Date(cita.fechaHora_cit).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
                const especialista = cita.podologa ? `${cita.podologa.nombres_pod} ${cita.podologa.apellidos_pod}` : 'Por asignar';
                
                const mensaje = `👋 Hola *${cita.paciente.nombres_pac}*, saludos de OxiPie.\n\n` +
                                `Le recordamos su cita para mañana:\n` +
                                `🗓 *Fecha:* ${inicioDia.toLocaleDateString()}\n` +
                                `⏰ *Hora:* ${hora}\n` +
                                `🦶 *Tratamiento:* ${cita.tratamiento.nombres_tra}\n` +
                                `👩‍⚕️ *Especialista:* ${especialista}\n\n` +
                                `Si necesita reagendar, por favor avísenos por este medio. ¡Le esperamos!`;

                await client.sendMessage(destinatarioFinal, mensaje);
                console.log(`✅ Recordatorio enviado a: ${cita.paciente.nombres_pac}`);
                enviados++;

                
                
                // Pausa anti-ban
                await new Promise(r => setTimeout(r, 3000));

            } catch (errorIndividual) {
                // AQUÍ CAPTURAMOS EL ERROR DEL PACIENTE INDIVIDUAL
                // Así el servidor no se muere si un número falla
                console.error(`❌ Error enviando a ${cita.paciente.nombres_pac}: ${errorIndividual.message}`);
            }
        }
        // --- FIN DEL BUCLE ---

        return { total: citas.length, enviados: enviados };

    } catch (error) {
        console.error('Error general en el proceso de recordatorios:', error);
        // No lanzamos throw para no matar el cron job
        return { error: error.message };
    }
};

module.exports = { enviarRecordatoriosManana };