import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Obtenemos el token guardado en el Signal central
  const token = authService.currentUser()?.token;

  // Si el token existe (y no es el token local de emergencia bypass)
  if (token && token !== 'EMERGENCY-LOCAL-TOKEN-SQLite-BYPASS') {
    // Clonamos la petición original e inyectamos el encabezado HTTP
    const reqClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqClonada);
  }

  // Si no hay token o es el de emergencia, la petición pasa sin modificaciones
  return next(req);
};
