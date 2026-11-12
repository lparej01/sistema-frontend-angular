import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService); // Aquí conectarás tu petición HTTP más adelante
  private readonly router = inject(Router);

  // Signals para manejar estados visuales de forma reactiva
  public cargando = signal<boolean>(false);
  public mensajeExito = signal<string | null>(null);
  public mensajeError = signal<string | null>(null);

  // Definición del Formulario Reactivo con validaciones
  public recuperarForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public enviarSolicitud(): void {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    const emailInput = this.recuperarForm.get('email')?.value;

    // 🟢 LLAMADA REAL AL BACKEND:
    this.authService.enviarEnlaceRecuperacion(emailInput).subscribe({
      next: (res) => {
        this.cargando.set(false);
        // Spring Boot responderá con el mensaje de confirmación
        this.mensajeExito.set(res.message || '🟢 Enlace enviado con éxito.');
        this.recuperarForm.reset();
      },
      error: (err) => {
        this.cargando.set(false);
        // Captura el mensaje exacto enviado por Spring Boot
        this.mensajeError.set(err.message);
      }
    });
  }
}
