import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'http://localhost:3000/api/evento'; // URL de la API para eventos

  constructor(private http: HttpClient) {}

  // Obtener la lista de eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  // Obtener eventos asociados a un usuario específico por su ID como participante
  getEventoByUser(userId: string): Observable<Evento[]> {
    // Consulta para obtener eventos participante
    return this.http.get<Evento[]>(`${this.apiUrl}?participante=${userId}`);
  }
  // Obtener una evento por ID
  getEventoById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  // Agregar una nueva evento al backend
  addEvento(newEvent: Evento): Observable<Evento> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Evento>(this.apiUrl, newEvent, { headers });
  }

  // Asignar un evento a un usuario (añadir al array de eventos)
  addEventToUser(userId: string, eventId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`http://localhost:3000/api/user/${userId}/addEvent`, { eventId }, { headers });
  }

  // Eliminar un evento por su ID
  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
