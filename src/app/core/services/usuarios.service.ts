import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioTabla {
  userId: string;
  role: string;
  active: number;
  password?: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/auth/usuarios';

  obtenerUsuarios(): Observable<UsuarioTabla[]> {
    return this.http.get<UsuarioTabla[]>(this.API_URL);
  }

  crearUsuario(usuario: UsuarioTabla): Observable<any> {
    // 🚨 Añadimos la compatibilidad de texto para capturar mensajes limpios del backend
    return this.http.post(this.API_URL, usuario, { responseType: 'text' });
  }

  actualizarUsuario(userId: string, datos: UsuarioTabla): Observable<any> {
    // 🚨 Eliminamos el "/${userId}" del final para que coincida exactamente con el cambio en Java
    return this.http.put(this.API_URL, datos, { responseType: 'text' });
  }

  eliminarUsuario(userId: string): Observable<any> {
    // 🚨 Hacemos lo mismo para la eliminación
    return this.http.delete(`${this.API_URL}/${userId}`, { responseType: 'text' });
  }
}

