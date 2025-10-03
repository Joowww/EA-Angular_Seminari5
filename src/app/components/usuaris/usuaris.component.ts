import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MaskEmailPipe } from '../../pipes/maskEmail.pipe';
import { EventoService } from '../../services/evento.service';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-usuaris',
  templateUrl: './usuaris.component.html',
  styleUrls: ['./usuaris.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe, MaskEmailPipe]
})
export class UsuarisComponent implements OnInit {
  usuarios: User[] = [];
  desplegado: boolean[] = [];
  mostrarPassword: boolean[] = [];

  // 🔹 Modelo de dominio (con Date)
  nuevoUsuario: User = {
    username: '',
    gmail: '',
    password: '',
    birthday: new Date(), // valor "dummy"; el input trabaja con birthdayStr
    eventos: []
  };

  // 🔹 Campo para el <input type="date"> (string "YYYY-MM-DD")
  birthdayStr: string = this.todayISO();

  confirmarPassword: string = '';
  usuarioEdicion: User | null = null;
  indiceEdicion: number | null = null;
  formSubmitted: boolean = false;

  originalUsername: string | null = null;

  constructor(private userService: UserService, private eventoService: EventoService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(data => {
      // Si el backend devuelve la fecha como string ISO, la convertimos a Date
      this.usuarios = data.map(u => ({
        ...u,
        birthday: new Date(u.birthday as unknown as string)
      }));

      this.desplegado = new Array(this.usuarios.length).fill(false);

      // "Popular" eventos: si hay IDs, los sustituyo por objetos Evento
      this.usuarios.forEach(usuario => {
        if (usuario.eventos && usuario.eventos.length) {
          usuario.eventos.forEach((exp, index) => {
            if (typeof exp === 'string') {
              this.eventoService.getEventoById(exp).subscribe((evento: Evento) => {
                usuario.eventos![index] = evento; // remplazo ID por Evento
              });
            }
          });
        }
      });
    });
  }

  agregarElemento(userForm: NgForm): void {
    this.formSubmitted = true;

    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }

    const birthdayDate = this.parseAsUTCDate(this.birthdayStr);

    if (this.indiceEdicion !== null) {
      // ✅ UPDATE por username original
      const targetUsername = this.originalUsername || this.nuevoUsuario.username;

      const payload: Partial<User> = {
        username: this.nuevoUsuario.username,
        gmail: this.nuevoUsuario.gmail,
        password: this.nuevoUsuario.password,
        birthday: birthdayDate,
        eventos: this.nuevoUsuario.eventos
      };

      this.userService.updateUserByUsername(targetUsername, payload).subscribe(
        (updated: any) => {
          // Normaliza para la UI
          const updatedUI: User = {
            ...updated,
            birthday: new Date(updated.birthday)
          };
          this.usuarios[this.indiceEdicion!] = updatedUI;
          this.indiceEdicion = null;
          this.originalUsername = null;
          this.resetForm(userForm);
        },
        (error) => {
          console.error('PUT /api/user/:username error', { status: error?.status, body: error?.error });
          alert('Error al actualizar el usuario. Revisa consola.');
        }
      );
    } else {
      // CREATE
      const usuarioJSON: User = {
        username: this.nuevoUsuario.username,
        gmail: this.nuevoUsuario.gmail,
        password: this.nuevoUsuario.password,
        birthday: birthdayDate,
        eventos: this.nuevoUsuario.eventos ?? []
      };

      this.userService.addUser(usuarioJSON).subscribe((response: any) => {
        const created = response.user ?? response;
        const createdUI: User = {
          ...created,
          birthday: new Date(created.birthday)
        };
        this.usuarios.push(createdUI);
        this.desplegado.push(false);
        this.resetForm(userForm);
      });
    }
  }

  // Manejo del cambio en el <select> de eventos (ejemplo básico)
  agregarEvento(usuarioId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value; // ID del evento seleccionado
    console.log(`Usuario ID: ${usuarioId}, Evento: ${selectedValue}`);
    // Aquí podrías llamar a addEventToUser(usuarioId, selectedValue) del servicio si corresponde.
  }

  resetForm(userForm: NgForm): void {
    this.nuevoUsuario = {
      username: '',
      gmail: '',
      password: '',
      birthday: new Date(),
      eventos: []
    };
    this.birthdayStr = this.todayISO();
    this.confirmarPassword = '';
    this.formSubmitted = false;
    userForm.resetForm();
  }

  prepararEdicion(usuario: User, index: number): void {
    this.usuarioEdicion = { ...usuario };
    this.nuevoUsuario = { ...usuario };
    this.indiceEdicion = index;
    this.desplegado[index] = true;

    // ✅ Guarda el username original para el path del PUT
    this.originalUsername = usuario.username;

    // Rellena el input date
    this.birthdayStr = this.toISODate(new Date(usuario.birthday));
  }

  eliminarElemento(index: number): void {
    const usuarioAEliminar = this.usuarios[index];

    if (!usuarioAEliminar?.username) {
      console.error('El usuario no tiene username válido. No se puede eliminar.');
      alert('El usuario no se puede eliminar porque no tiene username válido.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar a ${usuarioAEliminar.username}?`)) {
      this.userService.deleteUserByUsername(usuarioAEliminar.username).subscribe(
        () => {
          this.usuarios.splice(index, 1);
          this.desplegado.splice(index, 1);
        },
        (error) => {
          // Log útil para ver exactamente qué devuelve el backend si algo falla
          console.error('DELETE /api/user/:username error', {
            status: error?.status,
            body: error?.error
          });
          alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
        }
      );
    }
  }

  toggleDesplegable(index: number): void {
    this.desplegado[index] = !this.desplegado[index];
  }

  togglePassword(index: number): void {
    this.mostrarPassword[index] = !this.mostrarPassword[index];
  }

  // --------- Helpers ---------
  private todayISO(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
    // Ojo: si quieres zona local estricta, puedes construirla con getFullYear()/getMonth()+1/getDate()
  }

  private toISODate(d: Date): string {
    // Normaliza a "YYYY-MM-DD" (UTC) para <input type="date">
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }

  private parseAsUTCDate(ymd: string): Date {
    // Evita desfases por timezone
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  // Type guard para plantillas (cuando eventos pueden ser string o Evento)
  isEvento(e: string | Evento): e is Evento {
    return !!e && typeof e === 'object' && 'name' in e && 'schedule' in e;
  }
}
