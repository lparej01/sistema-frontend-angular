import { Component, inject, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule // 👈 2. AGREGADO AQUÍ EN LOS IMPORTS DEL COMPONENTE
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export default class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  myGroup = new FormGroup({
    password: new FormControl(''),

    userId : new FormControl('')

  });

  // Signals para manejar estados visuales reactivos
  readonly errorMensaje = signal<string | null>(null);
  readonly cargando = signal<boolean>(false);

  // Estructura del Formulario Reactivo con validaciones iniciales
  readonly loginForm: FormGroup = this.fb.group({
    userId: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  /**
   * Dispara el flujo de autenticación si el formulario es válido
   */
  onSubmit(): void {
    // Si el usuario intenta enviar el formulario vacío, activamos los errores visuales
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    const { userId, password } = this.loginForm.value;

    this.authService.login(userId, password).subscribe({
      next: () => {
        // Login exitoso: Redirigimos al inicio (el Signal de AuthService ya se actualizó)
        this.router.navigate(['/inicio']);
      },
      error: (err: Error) => {
        // Captura el mensaje optimizado por tu AuthService (Spring Boot o Servidor Inactivo)
        this.errorMensaje.set(err.message);
        this.cargando.set(false);
      }
    });
  }

  /**
   * Helper visual para comprobar si un input tiene errores y fue tocado por el usuario
   */
  esCampoInvalido(campo: string): boolean {
    const control = this.loginForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}


