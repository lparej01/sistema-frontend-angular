import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';


// 🎯 Interfaz adaptada EXACTAMENTE a tu AuthResponse de Spring Boot
export interface UsuarioSesion {
  userId: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID); // 🌟 Protección SSR
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly SESSION_KEY = 'jwt_session';

  // 🔄 Signals y Estados Computados Reactivos de Angular 19
  readonly currentUser = signal<UsuarioSesion | null>(this.obtenerSesionInicial());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly currentRole = computed(() => this.currentUser()?.role || null);
  readonly currentUsername = computed(() => this.currentUser()?.userId || null);



  /**
   * Login conectado a tu API de Spring Boot / SQLite
   */
  login(userId: string, password: string): Observable<UsuarioSesion> {
    return this.http.post<UsuarioSesion>(`${this.API_URL}/login`, { userId, password }).pipe(
      tap((usuario) => this.guardarSesion(usuario)),
      catchError((error: HttpErrorResponse) => {
        console.error('Error de diagnóstico en login:', error);

        // 🌟 Captura robusta: maneja si Spring Boot responde texto plano o un objeto JSON de error
        let mensajeError = 'Credenciales incorrectas o servidor inactivo.';
        if (error.error) {
          mensajeError = typeof error.error === 'string' ? error.error : (error.error.message || mensajeError);
        }

        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Cierre de sesión limpio, seguro y sin residuos de memoria
   */
  logout(): void {
    // 1. Limpieza síncrona inmediata en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.SESSION_KEY);
    }

    // 2. Apagado inmediato del flujo reactivo para congelar los Guards
    this.currentUser.set(null);

    // 3. Redirección asíncrona segura al Login
    this.router.navigate(['/login']).catch((err) =>
      console.error('Error crítico al redirigir durante el logout:', err)
    );
  }

  /**
   * Guarda de forma segura el objeto de sesión parseado
   */
  private guardarSesion(usuario: UsuarioSesion): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(usuario));
    }
    this.currentUser.set(usuario);
  }

  /**
   * Obtiene la sesión inicial evaluando fallos de parseo y entorno de ejecución (SSR)
   */
  private obtenerSesionInicial(): UsuarioSesion | null {
    // 🌟 Si Angular se ejecuta del lado del servidor durante el renderizado inicial, localStorage no existe
    if (!isPlatformBrowser(this.platformId)) return null;

    const sesionGuardada = localStorage.getItem(this.SESSION_KEY);
    if (!sesionGuardada) return null;

    try {
      return JSON.parse(sesionGuardada) as UsuarioSesion;
    } catch {
      // Si el JSON guardado está corrupto o alterado, limpiamos inmediatamente
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }
  /**
   * ✉️ Fase 1: Solicita un enlace de recuperación enviando el correo del usuario
   * Conecta con: POST http://localhost:8080/api/auth/recuperar
   */
  enviarEnlaceRecuperacion(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/recuperar`, { email }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al solicitar recuperación de contraseña:', error);
        let mensajeError = 'No se pudo procesar la solicitud de recuperación.';
        if (error.error) {
          mensajeError = typeof error.error === 'string' ? error.error : (error.error.message || mensajeError);
        }
        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * 🔑 Fase 2: Envía la nueva contraseña junto al token recibido por correo
   * Conecta con: POST http://localhost:8080/api/auth/restaurar
   */
  restablecerPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/restaurar`, { token, password }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al restaurar la contraseña:', error);
        let mensajeError = 'El enlace ha expirado o el token no es válido.';
        if (error.error) {
          mensajeError = typeof error.error === 'string' ? error.error : (error.error.message || mensajeError);
        }
        return throwError(() => new Error(mensajeError));
      })
    );
  }
}


