import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PeriodoService } from '../../core/services/periodo.service';
import { AuthService } from '../../core/services/auth.service'; // 👈 1. Importa tu AuthService
import { Periodo } from '../../core/models/periodo.model';

@Component({
  selector: 'app-periodos',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './periodo.html',
  styleUrls: ['./periodo.css']
})
export class PeriodoComponent implements OnInit, OnDestroy {
  private readonly periodoService = inject(PeriodoService);
  private readonly authService = inject(AuthService); // 👈 2. Inyecta el servicio de autenticación
  private readonly destroy$ = new Subject<void>();

  public listaPeriodos: Periodo[] = [];
  public periodoActual: Periodo | null = null;
  public anioFiltro: number | null = null;
  public cargando: boolean = false;

  ngOnInit(): void {
    this.cargarPeriodoActual();
    this.cargarTodosLosPeriodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public cargarPeriodoActual(): void {
    this.periodoService.obtenerActual()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (periodo) => this.periodoActual = periodo,
        error: (err) => console.error('Error al obtener el periodo actual:', err)
      });
  }

  public cargarTodosLosPeriodos(): void {
    this.cargando = true;
    this.periodoService.listarTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.listaPeriodos = res;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al listar periodos:', err);
          this.cargando = false;
        }
      });
  }

  public filtrarPorAnio(): void {
    if (!this.anioFiltro) {
      this.cargarTodosLosPeriodos();
      return;
    }

    this.cargando = true;
    this.periodoService.buscarPorAnio(this.anioFiltro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.listaPeriodos = res;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al filtrar por año:', err);
          this.cargando = false;
        }
      });
  }

  public alternarEstadoCierre(periodo: Periodo): void {
    const copiaPeriodo = { ...periodo, esCerrado: periodo.esCerrado === 1 ? 0 : 1 };

    this.periodoService.editarPeriodo(periodo.idPeriodo, copiaPeriodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cargarTodosLosPeriodos();
          this.cargarPeriodoActual();
        },
        error: (err) => console.error('Error al actualizar el periodo:', err)
      });
  }

  // 🚀 NUEVO: Flujo seguro para cierre automático y apertura del nuevo ciclo
  public ejecutarApertura(): void {
    if (!this.periodoActual) {
      alert('⚠️ No hay un periodo activo que sirva de base para la apertura.');
      return;
    }

    // 👈 3. Recupera dinámicamente el userId del Signal (con paréntesis por ser computed)
    const usuarioActual = this.authService.currentUsername();

    // Validación extra de seguridad por si acaso la sesión expiró de golpe
    if (!usuarioActual) {
      alert('⚠️ No se detectó una sesión activa. Por favor, vuelve a iniciar sesión.');
      return;
    }

    const mensaje = `⚠️ ¿Confirmas la apertura del próximo periodo contable?\n\n` +
      `• El periodo actual (${this.periodoActual.idPeriodo}) pasará a Histórico/Cerrado.\n` +
      `• El sistema calculará automáticamente el siguiente ciclo cronológico.\n` +
      `• Se arrastrará el stock final de todos los SKUs activos como saldo inicial.`;

    if (confirm(mensaje)) {
      this.cargando = true;

      // 👈 4. Se envía el usuarioActual real recuperado del token/estado
      this.periodoService.aperturarSiguientePeriodo(usuarioActual)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('¡Periodo aperturado con éxito! 🟢');
            // Recargamos ambas vistas para reflejar los cambios en caliente
            this.cargarPeriodoActual();
            this.cargarTodosLosPeriodos();
          },
          error: (err) => {
            console.error('Error al aperturar periodo:', err);
            alert(`❌ Error del servidor: ${err.error?.message || err.message}`);
            this.cargando = false;
          }
        });
    }
  }
}
