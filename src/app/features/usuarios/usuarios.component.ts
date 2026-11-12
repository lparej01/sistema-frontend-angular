import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Vital para capturar datos en el modal
import { UsuariosService, UsuarioTabla } from '../../core/services/usuarios.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 Registramos FormsModule
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  public authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);

  listaUsuarios = signal<UsuarioTabla[]>([]);
  errorMensaje = signal<string | null>(null);

  // 🚦 SIGNALS DE CONTROL PARA LA MODAL FLOTANTE
  mostrarModal = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);

  // 🎯 Objeto molde para el formulario con firstName y lastName incluidos por defecto
  usuarioFormulario: UsuarioTabla = {
    userId: '',
    role: 'USER_ROLE',
    active: 1,
    password: '',
    firstName: '',
    lastName: ''
  };

  ngOnInit(): void {
    this.cargarUsuariosDeBaseDeDatos();
  }

  cargarUsuariosDeBaseDeDatos(): void {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (usuarios) => this.listaUsuarios.set(usuarios),
      error: () => this.errorMensaje.set('No se pudieron recuperar los usuarios de la base de datos.')
    });
  }

  abrirModalCrear() {
    this.modoEdicion.set(false);
    // 🆕 Limpiamos los campos incluyendo Nombre y Apellido para el nuevo registro
    this.usuarioFormulario = {
      userId: '',
      role: 'USER_ROLE',
      active: 1,
      password: '',
      firstName: '',
      lastName: ''
    };
    this.mostrarModal.set(true);
  }

  abrirModalEditar(usuario: UsuarioTabla) {
    this.modoEdicion.set(true);
    // Clonamos el objeto de la tabla para mantenerfirstName y lastName en caso de edición
    this.usuarioFormulario = { ...usuario, password: '' };
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardarFormulario() {
    if (this.modoEdicion()) {
      this.usuariosService.actualizarUsuario(this.usuarioFormulario.userId, this.usuarioFormulario).subscribe({
        next: (respuestaTexto) => {
          console.log('Respuesta del servidor:', respuestaTexto);
          this.cargarUsuariosDeBaseDeDatos(); // Sincroniza la tabla con SQLite
          this.cerrarModal();
        },
        error: (err) => {
          console.error('ERROR CRÍTICO DETECTADO:', err);
          const mensaje = err.error || err.message || 'Error en la petición';
          alert('Error al actualizar: ' + mensaje);
        }
      });
    } else {
      // 🆕 OPERACIÓN DE CREACIÓN (POST)
      this.usuariosService.crearUsuario(this.usuarioFormulario).subscribe({
        next: (respuesta) => {
          console.log('Usuario registrado con éxito:', respuesta);
          this.cargarUsuariosDeBaseDeDatos(); // Recarga la lista desde SQLite
          this.cerrarModal();
        },
        error: (err) => {
          console.error('ERROR CRÍTICO AL REGISTRAR:', err);

          let mensajeError = 'Error desconocido';
          if (err.error) {
            try {
              const jsonError = JSON.parse(err.error);
              mensajeError = jsonError.message || jsonError.error || err.error;
            } catch {
              mensajeError = err.error; // Texto plano directo de Spring Boot
            }
          } else {
            mensajeError = err.message;
          }

          alert('Error al registrar: ' + mensajeError);
        }
      });
    }
  }

  onEliminar(userId: string) {
    if (confirm(`¿Está completamente seguro de eliminar permanentemente a [${userId}] de la base de datos SQLite?`)) {
      this.usuariosService.eliminarUsuario(userId).subscribe({
        next: () => {
          // Mutamos el Signal para eliminarlo de la UI de inmediato sin recargar
          this.listaUsuarios.update(users => users.filter(u => u.userId !== userId));
        },
        error: (err) => alert('Error al eliminar: ' + (err.error || err.message))
      });
    }
  }
}
