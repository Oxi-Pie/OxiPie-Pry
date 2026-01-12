export interface Paciente {
  id_pac: number;
  nombres_pac: string;
  apellidos_pac: string;
  cedula_pac: string;
  genero_pac: 'masculino' | 'femenino' | 'otro';
  telefono_pac?: string;
  direccion_pac?: string;
  email_pac?: string;
  fechaNac_pac: string; // Viene como string ISO del backend
}