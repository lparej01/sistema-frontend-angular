import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ExistenciaService, ExistenciaTabla } from '../../core/services/existencia.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-existencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './existencia.component.html'
})
export class ExistenciaComponent implements OnInit {

  private readonly existenciaService = inject(ExistenciaService);
  public readonly authService = inject(AuthService);

  // 🚦 Signals reactivos centrales
  readonly existencia = signal<ExistenciaTabla[]>([]);
  readonly errorMensaje = signal<string | null>(null);
  readonly cargando = signal<boolean>(false);

  readonly mostrarModal = signal<boolean>(false);
  readonly modoEdicion = signal<boolean>(false);

  // 🔍 NUEVOS SIGNALS: Para manejar la búsqueda por Periodo
  readonly filtroPeriodo = signal<string>('');

  // Objeto limpio mapeado uno a uno con tu backend
  existenciaFormulario: ExistenciaTabla = this.obtenerModeloLimpio();

  // 🧮 SIGNAL COMPUTED: Calcula el Inventario Final en tiempo real al cambiar la Merma
  readonly inventarioFinalCalculado = computed(() => {
    const inicial = Number(this.existenciaFormulario.invInicial) || 0;
    const entradas = Number(this.existenciaFormulario.entradas) || 0;
    const salidas = Number(this.existenciaFormulario.salidas) || 0;
    const merma = Number(this.existenciaFormulario.merma) || 0;

    return inicial + entradas - salidas - merma;
  });

  // Genera automáticamente la lista filtrada cada vez que cambia 'existencia' o 'filtroPeriodo'
  readonly existenciasFiltradas = computed(() => {
    const busqueda = this.filtroPeriodo().trim();
    if (!busqueda) {
      return this.existencia();
    }
    return this.existencia().filter(ext =>
      ext.periodo !== undefined && String(ext.periodo).includes(busqueda)
    );
  });

  ngOnInit(): void {
    this.cargarExistencia();
  }

  cargarExistencia(): void {
    this.cargando.set(true);
    this.existenciaService.obtenerExistencia().subscribe({
      next: (datosMapeados) => {
        this.existencia.set(datosMapeados);
        this.errorMensaje.set(null);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('ERROR EN HTTP EXISTENCIA:', err);
        this.errorMensaje.set('No se pudieron recuperar las existencias de la base de datos.');
        this.cargando.set(false);
      }
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion.set(false);
    this.errorMensaje.set(null);
    this.existenciaFormulario = this.obtenerModeloLimpio();
    this.mostrarModal.set(true);
  }

  abrirModalEditar(ext: ExistenciaTabla): void {
    this.modoEdicion.set(true);
    this.errorMensaje.set(null);
    this.existenciaFormulario = {
      ...ext,
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
   * 🌟 GUARDADO OPTIMIZADO: Recalcula, válida advertencia de negocio y envía los datos
   */
  guardarFormulario(formularioHtml: NgForm): void {
    if (formularioHtml.invalid) {
      Object.keys(formularioHtml.controls).forEach(key => {
        formularioHtml.controls[key].markAsTouched();
      });
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    // 🚀 ASIGNACIÓN: Inyectamos el cálculo matemático del Inventario Final antes de enviar al Servidor
    this.existenciaFormulario.invFinal = this.inventarioFinalCalculado();

    if (this.modoEdicion()) {
      this.existenciaService.actualizarExistencia(this.existenciaFormulario.sku!, this.existenciaFormulario).subscribe({
        next: (res) => {
          // 🛑 INTERCEPCIÓN DE ADVERTENCIA CONTROLADA:
          // Si el backend validó que se generaría un saldo negativo
          if (res && res.status === 'advertencia') {
            this.errorMensaje.set(`⚠️ Advertencia: ${res.mensaje}`);
            this.cargando.set(false);
            // 💡 NOTA: Al no ejecutar this.cerrarModal(), el usuario permanece en el formulario para corregir
          } else {
            // Flujo de éxito normal
            this.cargarExistencia();
            this.cerrarModal();
            this.cargando.set(false);
          }
        },
        error: (err) => {
          // Errores críticos de infraestructura (500, Caídas de red)
          this.errorMensaje.set(err.error?.message || err.message || 'Error al editar existencia.');
          this.cargando.set(false);
        }
      });
    } else {
      // Flujo de creación estándar
      this.existenciaService.crearExistencia(this.existenciaFormulario).subscribe({
        next: () => {
          this.cargarExistencia();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          this.errorMensaje.set(err.error?.message || err.message || 'Error al crear existencia.');
          this.cargando.set(false);
        }
      });
    }
  }

  onEliminar(sku: number): void {
    if (confirm(`¿Está seguro de eliminar permanentemente la existencia #${sku} de SQLite?`)) {
      this.existenciaService.eliminarExistencia(sku).subscribe({
        next: () => {
          this.existencia.update(items => items.filter(e => e.sku !== sku));
        },
        error: (err) => alert('Error al borrar: ' + (err.error?.message || err.message))
      });
    }
  }

  actualizarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroPeriodo.set(input.value);
  }

  limpiarFiltro(): void {
    this.filtroPeriodo.set('');
  }

  private obtenerModeloLimpio(): ExistenciaTabla {
    return {
      sku: 0,
      descripcion: '',
      periodo: 0,
      invInicial: 0,
      entradas: 0,
      salidas: 0,
      merma: 0,
      costoUnitario: 0,
      invFinal: 0,
      timestamp: new Date().toISOString().substring(0, 25),
      usuario: this.authService.currentUser()?.userId || 'SYSTEM'
    };
  }

  trackBySkuPeriodo(index: number, item: ExistenciaTabla): string {
    return `${item.sku}_${item.periodo}`;
  }
}

export default ExistenciaComponent;
