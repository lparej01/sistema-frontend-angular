import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExistenciaTabla {
  sku: number;
  descripcion?: string; // <-- Agregamos el campo opcional
  periodo: number;
  invInicial: number;
  entradas: number;
  salidas:number;
  merma: number;
  costoUnitario:number;
  invFinal:number;
  timestamp: string;
  usuario: string;
}

@Injectable({
  providedIn: 'root'
})


export class ExistenciaService {
  private http = inject(HttpClient);

  // Ruta oficial mapeada en tu ExistenciaController de Spring Boot
  private readonly API_URL = 'http://localhost:8080/api/existencia';

  obtenerExistencia(): Observable<ExistenciaTabla[]> {
    return this.http.get<ExistenciaTabla[]>(this.API_URL);
  }

  crearExistencia(existencia: ExistenciaTabla): Observable<ExistenciaTabla> {
    return this.http.post<ExistenciaTabla>(this.API_URL, existencia);
  }

  actualizarExistencia(sku: number, existencia: ExistenciaTabla): Observable<any> { // 🌟 Cambiado a any
    return this.http.put<any>(`${this.API_URL}/${sku}`, existencia);
  }

  eliminarExistencia(sku: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${sku}`);
  }
}

