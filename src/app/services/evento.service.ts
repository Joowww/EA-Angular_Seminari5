import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  // ✅ Tu backend expone /api/event (no /api/evento)
  private apiUrl = 'http://localhost:3000/api/event';

  constructor(private http: HttpClient) {}

  // Obtener la lista de eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  // Obtener eventos asociados a un usuario por su ID (si lo usas)
  getEventoByUser(userId: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}?participante=${userId}`);
  }

  // Obtener un evento por ID
  getEventoById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  // Agregar un nuevo evento al backend
  // (tu front usa Evento con schedule: string[], backend espera schedule: string)
  addEvento(newEvent: Evento): Observable<Evento> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // ✅ convertir array -> string para el backend
    const scheduleAsString =
      Array.isArray(newEvent.schedule) ? newEvent.schedule.join(' | ') : (newEvent.schedule as any);

    // Enviar payload compatibilizado con el backend (schedule: string)
    const payload: any = {
      ...newEvent,
      schedule: scheduleAsString
    };

    return this.http.post<Evento>(this.apiUrl, payload, { headers });
  }

  // Asignar un evento a un usuario (si lo usas)
  addEventToUser(userId: string, eventId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`http://localhost:3000/api/user/${userId}/addEvent`, { eventId }, { headers });
  }

  // Eliminar un evento por su ID
  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
