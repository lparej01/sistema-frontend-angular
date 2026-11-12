import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // 🌟 Importamos NgForm para validación en el guardado
import { CategoriasService, CategoriaTabla } from '../../core/services/categorias.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html'
})
export class CategoriasComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  public readonly authService = inject(AuthService);

  // 🚦 Signals reactivos centrales
  readonly categorias = signal<CategoriaTabla[]>([]);
  readonly errorMensaje = signal<string | null>(null);
  readonly cargando = signal<boolean>(false); // 🌟 Spinner de control de peticiones

  readonly mostrarModal = signal<boolean>(false);
  readonly modoEdicion = signal<boolean>(false);

  // Objeto limpio mapeado uno a uno con SQLite
  categoriaFormulario: CategoriaTabla = this.obtenerModeloLimpio();

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias.set(datos);
        this.errorMensaje.set(null);
      },
      error: (err) => {
        console.error('ERROR EN HTTP CATEGORIAS:', err);
        this.errorMensaje.set('No se pudieron recuperar las categorías de la base de datos.');
      }
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion.set(false);
    this.errorMensaje.set(null);
    this.categoriaFormulario = this.obtenerModeloLimpio();
    this.mostrarModal.set(true);
  }

  abrirModalEditar(cat: CategoriaTabla): void {
    this.modoEdicion.set(true);
    this.errorMensaje.set(null);
    this.categoriaFormulario = {
      ...cat,
      timestamp: new Date().toISOString().substring(0, 25),
      usuario: this.authService.currentUser()?.userId || 'SYSTEM'
    };
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.errorMensaje.set(null);
  }

  /**
   * 🌟 GUARDADO OPTIMIZADO: Recibe el formulario de la vista para validar estados
   */
  guardarFormulario(formularioHtml: NgForm): void {
    // Si la vista detecta infracciones de Bootstrap, forzamos que se pinten en rojo
    if (formularioHtml.invalid) {
      Object.keys(formularioHtml.controls).forEach(key => {
        formularioHtml.controls[key].markAsTouched();
      });
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    if (this.modoEdicion()) {
      this.categoriasService.actualizarCategoria(this.categoriaFormulario.catId!, this.categoriaFormulario).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          this.errorMensaje.set(err.error?.message || err.message || 'Error al editar categoría.');
          this.cargando.set(false);
        }
      });
    } else {
      this.categoriasService.crearCategoria(this.categoriaFormulario).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          this.errorMensaje.set(err.error?.message || err.message || 'Error al crear categoría.');
          this.cargando.set(false);
        }
      });
    }
  }

  onEliminar(catId: number): void {
    if (confirm(`¿Está seguro de eliminar permanentemente la categoría #${catId} de SQLite?`)) {
      this.categoriasService.eliminarCategoria(catId).subscribe({
        next: () => {
          this.categorias.update(items => items.filter(c => c.catId !== catId));
        },
        error: (err) => alert('Error al borrar: ' + (err.error?.message || err.message))
      });
    }
  }

  /**
   * Helper privado para resetear el estado contable de forma segura
   */
  private obtenerModeloLimpio(): CategoriaTabla {
    return {
      categoria: '',
      costoUnitario: 0,
      precio: 0,
      peso: 0,
      activo: 1,
      timestamp: new Date().toISOString().substring(0, 25),
      usuario: this.authService.currentUser()?.userId || 'SYSTEM'
    };
  }
}




