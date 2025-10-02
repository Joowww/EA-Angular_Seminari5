import { Evento } from './evento.model';  // Asegúrate de importar el modelo Experiencia

export interface User { 
  _id?: string;      // MongoDB genera automáticamente este campo al insertar
  username: string;
  gmail: string;
  password: string;
  birthday: Date; 
  eventos?: Evento[];   
}


  