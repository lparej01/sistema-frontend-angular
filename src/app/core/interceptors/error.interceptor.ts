import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 🌟 Detectamos si el servidor nos rechaza por token expirado o inválido
      if (error.status === 401 || error.status === 403) {
        console.warn('Sesión expirada o no autorizada. Redirigiendo al login...');

        // 1. Limpiamos el Signal central y el almacenamiento local (debes tener este método en tu servicio)
        authService.logout();

        // 2. Redirigimos al usuario de inmediato al formulario de acceso
        router.navigate(['/login']);
      }

      // Propagamos el error original por si el componente necesita mostrar un mensaje específico
      return throwError(() => error);
    })
  );
};
