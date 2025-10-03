import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base = `${API_BASE}/api/user`;  // Usar apiUrl desde environment

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  // Agregar un nuevo usuario
  addUser(usuario: User): Observable<User> {
    return this.http.post<User>(this.base, usuario);
  }

  // Actualizar un usuario existente
  updateUser(usuario: User): Observable<User> {
    return this.http.put<User>(`${this.base}/${usuario._id}`, usuario);
  }

  updateUserByUsername(username: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${encodeURIComponent(username)}`, data);
  }

  // Eliminar un usuario por su _id
  deleteUserById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/${id}`);
  }

  deleteUserByUsername(username: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/${encodeURIComponent(username)}`);
  }

  // Actualizar el array de experiencias de un usuario
  updateUserEvents(userId: string, eventId: string): Observable<User> {
    return this.http.put<User>(`${this.base}/${userId}/addEvent`, { eventId });
  }
}
