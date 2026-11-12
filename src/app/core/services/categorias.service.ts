import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface CategoriaTabla {
  catId?: number;
  categoria: string;
  costoUnitario: number;
  precio: number;
  peso: number;
  activo: number;
  timestamp: string;
  usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private http = inject(HttpClient);

  // Ruta oficial mapeada en tu CategoriaController de Spring Boot
  private readonly API_URL = 'http://localhost:8080/api/categorias';

  obtenerCategorias(): Observable<CategoriaTabla[]> {
    return this.http.get<CategoriaTabla[]>(this.API_URL);
  }

  crearCategoria(categoria: CategoriaTabla): Observable<CategoriaTabla> {
    return this.http.post<CategoriaTabla>(this.API_URL, categoria);
  }

  actualizarCategoria(catId: number, categoria: CategoriaTabla): Observable<CategoriaTabla> {
    return this.http.put<CategoriaTabla>(`${this.API_URL}/${catId}`, categoria);
  }

  eliminarCategoria(catId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${catId}`);
  }
}




