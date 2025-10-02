export interface Evento {
  _id?: string;  // Propiedad opcional _id para el ID de la experiencia
  name: string; 
  schedule: string[];
  address?: string; 
  participantes: string[]; // Array de IDs de participantes
}

  