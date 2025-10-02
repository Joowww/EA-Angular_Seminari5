import { Component, OnInit } from '@angular/core';
import { EventoService } from '../../services/evento.service';
import { Evento } from '../../models/evento.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  standalone: true,
  styleUrls: ['./evento.component.css'],
  imports: [FormsModule, CommonModule, HttpClientModule, TruncatePipe]
})
export class EventoComponent implements OnInit {
  eventos: Evento[] = []; // Lista de eventos
  users: User[] = []; // Lista de usuarios para los desplegables
  selectedParticipantes: string[] = []; // Participantes seleccionados como ObjectId
  errorMessage: string = ''; // Variable para mostrar mensajes de error

  // Estructura inicial para un nuevo evento
  newEvent: Evento = {
    name: '',
    schedule: [],
    address: '',
    participantes: []
  };

  constructor(private eventoService: EventoService, private userService: UserService) {}

  ngOnInit(): void {
    this.getEventos(); // Obtener la lista de eventos
    this.getUsers(); // Obtener la lista de usuarios

  }

  // Obtener la lista de eventos desde la API
  getEventos(): void {
    this.eventoService.getEventos().subscribe(
      (data: Evento[]) => {
        // Filtrar eventos que tengan _id definido
        this.eventos = data.filter(exp => exp._id !== undefined);
        console.log('Eventos recibidos:', data);
      },
      (error) => {
        console.error('Error al obtener los eventos:', error);
      }
    );  
};

  // Obtener la lista de usuarios desde la API
  getUsers(): void {
    this.userService.getUsers().subscribe(
      (data: User[]) => {
        this.users = data;
        console.log('Usuarios recibidos:', data);
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  // Obtener el nombre de un usuario dado su ObjectId
  getUserNameById(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user ? user.username : 'Desconocido';
  }

  // Manejar el envío del formulario con validación de campos
  onSubmit(): void {
    this.errorMessage = ''; // Limpiar mensajes de error

    // Verificar si los campos están vacíos
    if (!this.newEvent.name || this.selectedParticipantes.length === 0 || !this.newEvent.schedule || !this.newEvent.address) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    // Convertir selectedParticipantes a ObjectId[] antes de enviar al backend
    this.newEvent.participantes = this.selectedParticipantes;

    // Llamar al servicio para agregar el nueva evento
    this.eventoService.addEvento(this.newEvent).subscribe(
      (response) => {
        console.log('Evento creada:', response);
        this.getEventos(); // Actualizar la lista de eventos después de crear una nueva
        this.resetForm(); // Limpiar el formulario
      },
      (error) => {
        console.error('Error al crear el evento:', error);
      }
    );
  }

  // Método para eliminar un evento por su ID
  deleteEvent(eventId: number): void {
    console.log('delete' , eventId);
    console.log('delete' ,  this.eventos);
    this.eventos.splice(eventId, 1);
    console.log('delete' ,  this.eventos);
  }

  // Resetear el formulario después de crear un evento
  resetForm(): void {
    this.newEvent = {
      name: '',
      schedule: [],
      address: '',
      participantes: []
    };
    this.selectedParticipantes = []; // Limpiar los participantes seleccionados
    this.errorMessage = ''; // Limpiar el mensaje de error
  }
}
