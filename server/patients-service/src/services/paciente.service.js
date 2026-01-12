const { PrismaClient } = require('../../../shared/node_modules/@prisma/client');
const prisma = new PrismaClient();

const buscarTodos = async () => {
  return await prisma.paciente.findMany({
    orderBy: { apellidos_pac: 'asc' }
  });
};

const buscarPorId = async (id) => {
  return await prisma.paciente.findUnique({
    where: { id_pac: parseInt(id) }
  });
};

const buscarPorCedula = async (cedula) => {
  return await prisma.paciente.findUnique({
    where: { cedula_pac: cedula }
  });
};

const registrar = async (datos) => {
  // Validar si ya existe la cédula
  const existe = await buscarPorCedula(datos.cedula_pac);
  if (existe) {
    throw new Error(`El paciente con cédula ${datos.cedula_pac} ya existe.`);
  }

  // Convertir fecha de string a Date ISO-8601
  const datosFormateados = {
    ...datos,
    fechaNac_pac: new Date(datos.fechaNac_pac),
  };

  return await prisma.paciente.create({
    data: datosFormateados
  });
};

const actualizar = async (id, datos) => {
   // Prevenir cambio de cédula a una existente si se enviara
   if (datos.cedula_pac) {
       const existe = await buscarPorCedula(datos.cedula_pac);
       if (existe && existe.id_pac !== parseInt(id)) {
           throw new Error("La cédula ya pertenece a otro paciente");
       }
   }

   const datosFormateados = { ...datos };
   if (datos.fechaNac_pac) {
       datosFormateados.fechaNac_pac = new Date(datos.fechaNac_pac);
   }

   return await prisma.paciente.update({
    where: { id_pac: parseInt(id) },
    data: datosFormateados
   });
};

const eliminar = async (id) => {
  // Primero verificamos si existe
  const existe = await prisma.paciente.findUnique({
    where: { id_pac: parseInt(id) }
  });
  
  if (!existe) {
    throw new Error("Paciente no encontrado");
  }

  return await prisma.paciente.delete({
    where: { id_pac: parseInt(id) }
  });
};

module.exports = {
  buscarTodos,
  buscarPorId,
  registrar,
  actualizar,
  buscarPorCedula,
  eliminar
};