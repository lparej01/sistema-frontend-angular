import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaTabla } from './categorias.service';


export interface SkuTabla {
  sku: number;
  categoria: CategoriaTabla;
  marca: string;
  descripcion: string;
  presentacion: number;
  unidadMedida: string;
  empaque: number;
  costoUnitario: number;
  activo: number;
  timestamp: string;
  usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkuService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/sku'; // Tu ruta en singular de Spring Boot



  obtenerSkus(): Observable<SkuTabla[]> {
    return this.http.get<SkuTabla[]>(this.apiUrl);
  }

  crearSku(sku: SkuTabla): Observable<SkuTabla> {
    return this.http.post<SkuTabla>(this.apiUrl, sku);
  }

  // Tu controlador recibe el id (Integer) en la ruta /api/sku/{id}
  actualizarSku(skuId: number, sku: SkuTabla): Observable<SkuTabla> {
    return this.http.put<SkuTabla>(`${this.apiUrl}/${skuId}`, sku);
  }

  eliminarSku(skuId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${skuId}`);
  }
  // En tu sku.service.ts, añade esta función:
  buscarPorDescripcion(descripcion: string): Observable<SkuTabla[]> {
    return this.http.get<SkuTabla[]>(`${this.apiUrl}/buscar`, {
      params: { descripcion }
    });
  }

}


