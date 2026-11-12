import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Periodo } from '../models/periodo.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/periodos';

  // GET /api/periodos
  listarTodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(this.apiUrl);
  }

  // GET /api/periodos/{id}
  buscarPorId(id: number): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.apiUrl}/${id}`);
  }

  // GET /api/periodos/actual
  obtenerActual(): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.apiUrl}/actual`);
  }

  // GET /api/periodos/anio/{anio}
  buscarPorAnio(anio: number): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrl}/anio/${anio}`);
  }

  // GET /api/periodos/abiertos
  listarAbiertos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrl}/abiertos`);
  }

  // POST /api/periodos
  crearPeriodo(periodo: Periodo): Observable<Periodo> {
    return this.http.post<Periodo>(this.apiUrl, periodo);
  }

  // PUT /api/periodos/{id}
  editarPeriodo(id: number, periodo: Periodo): Observable<Periodo> {
    return this.http.put<Periodo>(`${this.apiUrl}/${id}`, periodo);
  }

  // DELETE /api/periodos/{id}
  eliminarPeriodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  /**
   * Dispara el proceso síncrono y blindado en el Backend para
   * cerrar el ciclo actual y aperturar el siguiente cronológico.
   */
  aperturarSiguientePeriodo(usuarioAnfitrion: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/aperturar`, null, {
      params: { usuarioAnfitrion }
    });
  }
}
