const { PrismaClient } = require('../../../shared/node_modules/@prisma/client');
const { enviarMensaje } = require('./whatsapp.provider');
const prisma = new PrismaClient();

// Helper para sumar horas
const sumarHoras = (fecha, horas) => {
    const nueva = new Date(fecha);
    nueva.setHours(nueva.getHours() + horas);
    return nueva;
};

const procesarRecordatorios = async () => {
    console.log("⏰ Ejecutando chequeo de recordatorios...");

    // 1. Definir el rango de tiempo: "Dentro de 24 horas exactas"
    // Buscaremos citas que ocurran entre (Ahora + 24h) y (Ahora + 25h)
    // Así, si el Cron corre cada hora, capturará las citas de esa franja.
    const ahora = new Date();
    const mananaInicio = sumarHoras(ahora, 24);
    const mananaFin = sumarHoras(ahora, 25);

    // 2. Buscar CITAS
    const citas = await prisma.cita.findMany({
        where: {
            fechaHora_cit: {
                gte: mananaInicio,
                lt: mananaFin
            },
            estado_cit: 'pendiente' // Solo pendientes
        },
        include: { paciente: true, podologa: true }
    });

    // 3. Buscar CONSULTAS
    const consultas = await prisma.consulta.findMany({
        where: {
            fechaHora_con: {
                gte: mananaInicio,
                lt: mananaFin
            },
            estado_con: 'pendiente'
        },
        include: { paciente: true, podologa: true }
    });

    console.log(`📊 Encontradas: ${citas.length} citas y ${consultas.length} consultas para recordar.`);

    // 4. Enviar Mensajes
    // Procesar Citas
    for (const cita of citas) {
        if (cita.paciente.telefono_pac) {
            await enviarMensaje(
                cita.paciente.telefono_pac,
                cita.paciente.nombres_pac,
                cita.fechaHora_cit.toLocaleDateString(),
                cita.horaInicio_cit.toLocaleTimeString()
            );
        } else {
            console.warn(`⚠️ Paciente ${cita.paciente.nombres_pac} no tiene teléfono.`);
        }
    }

    // Procesar Consultas
    for (const cons of consultas) {
        if (cons.paciente.telefono_pac) {
            await enviarMensaje(
                cons.paciente.telefono_pac,
                cons.paciente.nombres_pac,
                cons.fechaHora_con.toLocaleDateString(),
                cons.horaInicio_con.toLocaleTimeString()
            );
        }
    }
};

module.exports = { procesarRecordatorios };