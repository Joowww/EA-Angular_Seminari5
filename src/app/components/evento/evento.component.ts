import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Evento } from '../../models/evento.model';
import { EventoService } from '../../services/evento.service';

// Si ya tienes un UserService y modelo, usa esos imports
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent implements OnInit {
  eventos: Evento[] = [];

  // Usuarios disponibles para seleccionar como participantes
  users: User[] = [];

  // Form state
  newEvent: Evento = {
    name: '',
    schedule: [],
    address: '',
    participantes: []
  };

  // Multi-select de participantes (IDs de usuario)
  selectedParticipantes: string[] = [];

  // Builder de horarios
  dateStr: string = ''; // "YYYY-MM-DD"
  timeStr: string = ''; // "HH:mm"

  errorMessage = '';

  constructor(
    private eventoService: EventoService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Cargar eventos
    this.eventoService.getEventos().subscribe({
      next: (evts) => (this.eventos = evts),
      error: (err) => console.error('Error cargando eventos', err)
    });

    // Cargar usuarios para el selector de participantes
    this.userService.getUsers().subscribe({
      next: (users) => (this.users = users),
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  // Añadir un "slot" a schedule (como string)
  addScheduleSlot(): void {
    this.errorMessage = '';

    if (!this.dateStr || !this.timeStr) {
      this.errorMessage = 'Por favor, selecciona fecha y hora antes de añadir.';
      return;
    }

    // Representación legible, sin timezone (puedes usar ISO si prefieres)
    const slot = `${this.dateStr} ${this.timeStr}`;

    if (!this.newEvent.schedule) {
      this.newEvent.schedule = [];
    }

    this.newEvent.schedule.push(slot);

    // Limpiar inputs de fecha/hora
    this.dateStr = '';
    this.timeStr = '';
  }

  removeScheduleSlot(index: number): void {
    if (!this.newEvent.schedule) return;
    this.newEvent.schedule.splice(index, 1);
  }

  onSubmit(): void {
  this.errorMessage = '';

  if (!this.newEvent.name?.trim()) {
    this.errorMessage = 'El título del evento es obligatorio.';
    return;
  }

  if (!this.newEvent.schedule || this.newEvent.schedule.length === 0) {
    this.errorMessage = 'Añade al menos un horario.';
    return;
  }

  // Asegurar participantes desde el multi-select
  this.newEvent.participantes = [...this.selectedParticipantes];

  this.eventoService.addEvento(this.newEvent).subscribe({
    next: (created) => {
      this.eventos.push(created);
      this.resetForm();
    },
    error: (err) => {
      console.error('Error creando evento (POST /api/event):', {
        status: err?.status,
        body: err?.error
      });
      this.errorMessage = 'Error al crear el evento. Revisa los datos.';
    }
  });
}

  deleteEvent(index: number): void {
    const evt = this.eventos[index];
    if (!evt?._id) return;

    if (confirm(`¿Eliminar el evento "${evt.name}"?`)) {
      this.eventoService.deleteEvento(evt._id).subscribe({
        next: () => this.eventos.splice(index, 1),
        error: (err) => {
          console.error('Error eliminando evento', err);
          this.errorMessage = 'Error al eliminar el evento.';
        }
      });
    }
  }

  getUserNameById(id: string): string {
    const u = this.users.find(x => x._id === id);
    return u ? u.username : id;
  }

  private resetForm(): void {
    this.newEvent = {
      name: '',
      schedule: [],
      address: '',
      participantes: []
    };
    this.selectedParticipantes = [];
    this.dateStr = '';
    this.timeStr = '';
    this.errorMessage = '';
  }
}
