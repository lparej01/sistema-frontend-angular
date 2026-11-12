import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.currentRole();

  const currentUrl = state.url.split('?')[0]; // Limpiamos parámetros por si viene con ?token=...

  if (currentUrl === '/login' || currentUrl === '/recuperar' || currentUrl === '/restablecer-password') {
    if (isAuthenticated) {
      router.navigate(['/inicio']);
      return false;
    }
    return true; // Permitir acceso visual a estas pantallas si no está logueado
  }

  // 2. FILTRO DE AUTENTICACIÓN GLOBAL
  if (!isAuthenticated) {
    router.navigate(['/login']); // Expulsar si intenta navegar sin token
    return false;
  }

  // 3. CONTROL DE ROLES Y EXCLUSIVIDAD (ADMIN)
  if (currentUrl.startsWith('/usuarios') && userRole !== 'ADMIN_ROLE') {
    router.navigate(['/inicio']); // Rebotar si un usuario común intenta auditar usuarios
    return false;
  }

  // 4. CORRECCIÓN DE SEGURIDAD EN RUTA MÓDULO CATEGORÍAS
  // Si digitan la ruta vieja en singular, los redirigimos limpiamente a la ruta oficial en plural
  if (currentUrl === '/categoria') {
    router.navigate(['/categorias']);
    return false;
  }

  // 🎯 ACCESO CONCEDIDO: El usuario está autenticado y cumple con los privilegios requeridos
  return true;
};

