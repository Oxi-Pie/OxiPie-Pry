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
        let index = 0;

        // --- INICIO DEL BUCLE DE ENVÍO ---
        for (const cita of citas) {
            index++; // Aumentamos el contador en cada vuelta
            
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
                    break;
                }

                const contactoValidado = await client.getNumberId(chatIdRaw);

                if (!contactoValidado) {
                    console.log(`⚠️ El número ${chatIdRaw} del paciente ${cita.paciente.nombres_pac} no está registrado en WhatsApp.`);
                    continue;
                }

                const destinatarioFinal = contactoValidado._serialized; 

                // === PREPARACIÓN DE VARIABLES ===
                const hora = new Date(cita.fechaHora_cit).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
                const especialista = cita.podologa ? `${cita.podologa.nombres_pod} ${cita.podologa.apellidos_pod}` : 'Por asignar';
                const fecha = inicioDia.toLocaleDateString();
                const nombrePaciente = cita.paciente.nombres_pac;
                const nombreTratamiento = cita.tratamiento.nombres_tra;
                
                // === BANCO DE PLANTILLAS DE MENSAJES ===
                // Array con 4 estilos diferentes para parecer humano
                const plantillas = [
                    // Estilo 1: El Clásico (El que ya tenías)
                    `👋 Hola *${nombrePaciente}*, saludos de OxiPie.\n\nLe recordamos su cita para mañana:\n🗓 *Fecha:* ${fecha}\n⏰ *Hora:* ${hora}\n🦶 *Tratamiento:* ${nombreTratamiento}\n👩‍⚕️ *Especialista:* ${especialista}\n\nSi necesita reagendar, por favor avísenos por este medio. ¡Le esperamos!`,

                    // Estilo 2: Amigable y Directo
                    `¡Hola *${nombrePaciente}*! 🌟 Le escribimos del centro podológico OxiPie para confirmar su turno de mañana.\n\n📌 *Detalles de su cita:*\n- *Día:* ${fecha}\n- *Hora:* ${hora}\n- *Servicio:* ${nombreTratamiento}\n- *Le atenderá:* ${especialista}\n\nPor favor, si tiene algún inconveniente para asistir, comuníquese con nosotros. ¡Que tenga un excelente día!`,

                    // Estilo 3: Breve y Formal
                    `Estimado/a *${nombrePaciente}*, desde OxiPie le recordamos su cita programada para el día de mañana.\n\n🗓️ ${fecha} a las ⏰ ${hora}\n🦶 Tratamiento: ${nombreTratamiento} con ${especialista}.\n\nAgradecemos su puntualidad. Si desea cancelar o modificar el horario, responda a este mensaje. Saludos cordiales.`,

                    // Estilo 4: Cálido y Cercano
                    `Hola *${nombrePaciente}*, esperamos que esté muy bien. Nos comunicamos de OxiPie para recordarle su visita de mañana 🗓️ ${fecha}.\n\nSu turno es a las *${hora}* para el tratamiento de *${nombreTratamiento}* con *${especialista}*.\n\n¡Le esperamos con gusto! Cualquier duda o cambio, estamos a las órdenes por aquí. 👋`
                ];

                // === SELECCIÓN ALEATORIA ===
                // Math.random() elige un número al azar entre 0 y 3
                const indiceAleatorio = Math.floor(Math.random() * plantillas.length);
                const mensajeSeleccionado = plantillas[indiceAleatorio];

                // Enviamos el mensaje que salió sorteado
                await client.sendMessage(destinatarioFinal, mensajeSeleccionado);
                console.log(`✅ Recordatorio enviado a: ${nombrePaciente} (Usando plantilla #${indiceAleatorio + 1})`);
                enviados++;

                // ESTRATEGIA ANTI-BAN: Pausa Aleatoria
                // Solo hacemos la pausa si NO es el último paciente de la lista
                if (index < citas.length) {
                    // Generar un tiempo aleatorio entre 20 y 45 segundos
                    const minSegundos = 20;
                    const maxSegundos = 45;
                    const segundosEspera = Math.floor(Math.random() * (maxSegundos - minSegundos + 1)) + minSegundos;
                    
                    console.log(`Anti-Ban: Simulando comportamiento humano. Esperando ${segundosEspera} segundos...`);
                    
                    // Detiene la ejecución de este bucle durante los segundos calculados
                    await new Promise(resolve => setTimeout(resolve, segundosEspera * 1000));
                }

            } catch (errorIndividual) {
                console.error(`Error enviando a ${cita.paciente.nombres_pac}: ${errorIndividual.message}`);
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