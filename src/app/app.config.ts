import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 👈 Importamos withInterceptors

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor'; // 👈 Importamos tu nuevo interceptor
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),

    // 🌐 HTTP CONFIG: Encadenamos ambos interceptores en el orden correcto
    provideHttpClient(
      withInterceptors([
        jwtInterceptor,   // 1° Inyecta el token en la petición saliente
        errorInterceptor  // 2° Evalúa errores de expiración en la respuesta entrante
      ])
    )
  ]
};


