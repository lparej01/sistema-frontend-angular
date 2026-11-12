import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4 animate__animated animate__fadeIn">
      <!-- Fila Principal Centrada -->
      <div class="row justify-content-center align-items-center" style="min-height: 70vh;">
        <div class="col-md-8 col-lg-6 text-center">

          <!-- Contenedor Visual del "Huevo Frito" Estilizado con Bootstrap 5 -->
          <div class="card border-0 shadow-sm p-5 bg-white mb-4 rounded-4 position-relative overflow-hidden">
            <!-- Detalle decorativo de fondo -->
            <div class="position-absolute top-0 start-0 bg-warning opacity-10 rounded-circle" style="width: 150px; height: 150px; transform: translate(-30%, -30%);"></div>

            <div class="card-body position-relative z-index-1">
              <!-- Icono Creativo del Huevo Frito (Yema Dorada + Clara Blanca Flotante) -->
              <div class="d-inline-flex position-relative mb-4 animate-bounce">
                <!-- Clara (Fondo Blanco/Grisáceo Suave Redondeado) -->
                <div class="bg-light border border-2 border-secondary border-opacity-10 rounded-pill shadow-inner" style="width: 120px; height: 100px; border-radius: 60% 40% 70% 30% / 50% 60% 40% 50% !important;">
                  <!-- Yema (Círculo Perfecto Amarillo/Naranja en el Centro) -->
                  <div class="bg-warning position-absolute top-50 start-50 translate-middle rounded-circle shadow" style="width: 50px; height: 50px; background: linear-gradient(135deg, #ffca28 0%, #f57c00 100%); border: 3px solid #fff;"></div>
                </div>
              </div>

              <!-- Textos de Bienvenida -->
              <h1 class="display-5 fw-bold text-dark mb-2">¡Todo Listo!</h1>
              <p class="fs-5 text-secondary mb-4">Bienvenido al panel principal de control.</p>

              <!-- Alerta Informativa sobre el Usuario en Sesión (Signals) -->
              <div class="alert alert-warning border-0 rounded-3 d-inline-flex align-items-center py-2 px-4 shadow-sm" role="alert">
                <i class="bi bi-person-check-fill me-2 fs-5 text-warning-dark"></i>
                <div class="text-start">
                  Se ha iniciado sesión como <strong class="text-dark">{{ authService.currentUser()?.userId  }}</strong>
                  con privilegios de <span class="badge bg-dark ms-1" style="text-transform: uppercase;">{{ authService.currentRole() }}</span>.
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjetas de Estado Rápidas de Bootstrap 5 -->
          <div class="row g-3">
            <div class="col-6">
              <div class="p-3 bg-white rounded-3 shadow-sm border-start border-primary border-4 text-start">
                <div class="text-muted small uppercase fw-bold">Conexión SQLite</div>
                <div class="fs-5 fw-bold text-dark d-flex align-items-center gap-2 mt-1">
                  <span class="spinner-grow spinner-grow-sm text-success" role="status"></span>
                  Estable
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="p-3 bg-white rounded-3 shadow-sm border-start border-success border-4 text-start">
                <div class="text-muted small uppercase fw-bold">Spring Boot API</div>
                <div class="fs-5 fw-bold text-dark d-flex align-items-center gap-2 mt-1">
                  <i class="bi bi-check-circle-fill text-success"></i>
                  Online
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Animación sutil de rebote para hacer el huevo frito interactivo */
    .animate-bounce {
      animation: bounce 3s infinite ease-in-out;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .text-warning-dark {
      color: #e65100;
    }
    .z-index-1 {
      z-index: 1;
    }
  `]
})
export class InicioComponent {
  // Inyectamos el AuthService para renderizar los datos del usuario usando Signals
  public authService = inject(AuthService);
}
