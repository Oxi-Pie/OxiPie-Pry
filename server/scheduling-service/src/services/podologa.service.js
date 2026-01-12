const { PrismaClient } = require('../../../shared/node_modules/@prisma/client');
const prisma = new PrismaClient();

const buscarTodas = async () => {
  return await prisma.podologa.findMany({
    orderBy: { apellidos_pod: 'asc' }
  });
};

const buscarPorId = async (id) => {
  return await prisma.podologa.findUnique({
    where: { id_pod: parseInt(id) }
  });
};

const buscarPorCedula = async (cedula) => {
  return await prisma.podologa.findUnique({
    where: { cedula_pod: cedula }
  });
};

const registrar = async (datos) => {
  const existe = await buscarPorCedula(datos.cedula_pod);
  if (existe) throw new Error(`La podóloga con cédula ${datos.cedula_pod} ya existe.`);

  // Convertir fecha
  const datosFormateados = {
    ...datos,
    fechaNac_pod: new Date(datos.fechaNac_pod),
  };

  return await prisma.podologa.create({ data: datosFormateados });
};

const actualizar = async (id, datos) => {
  const datosFormateados = { ...datos };
  if (datos.fechaNac_pod) {
      datosFormateados.fechaNac_pod = new Date(datos.fechaNac_pod);
  }
  // Removemos ID si viene en el objeto para evitar error de Prisma
  delete datosFormateados.id_pod;

  return await prisma.podologa.update({
    where: { id_pod: parseInt(id) },
    data: datosFormateados
  });
};

const eliminar = async (id) => {
    // Validar dependencias (Citas/Consultas) en el futuro
    return await prisma.podologa.delete({
        where: { id_pod: parseInt(id) }
    });
};

module.exports = {
  buscarTodas, buscarPorId, registrar, actualizar, eliminar
};