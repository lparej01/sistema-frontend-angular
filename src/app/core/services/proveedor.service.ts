import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProveedorTabla {
  provId?: number;            // Mapea con private Integer provId
  nombre: string;             // Mapea con private String nombre
  contacto?: string | null;   // Mapea con private String contacto
  telf1?: string | null;      // Mapea con private String telf1
  telf2?: string | null;      // Mapea con private String telf2
  telfContacto?: string | null; // Mapea con private String telfContacto
  email?: string | null;      // Mapea con private String email
  emailContacto?: string | null; // Mapea con private String emailContacto
  activo: number;             // Mapea con private Integer activo
  timestamp: string;          // Mapea con private String timestamp
  usuario?: string | null;    // Mapea con private String usuario
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private http = inject(HttpClient);
  // Coincide exactamente con el @RequestMapping("/api/proveedores") de tu Java
  private apiUrl = 'http://localhost:8080/api/proveedores';

  getProveedores(): Observable<ProveedorTabla[]> {
    return this.http.get<ProveedorTabla[]>(this.apiUrl);
  }

  listar(): Observable<ProveedorTabla[]> {
    return this.http.get<ProveedorTabla[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ProveedorTabla> {
    return this.http.get<ProveedorTabla>(`${this.apiUrl}/${id}`);
  }

  crear(proveedor: ProveedorTabla): Observable<ProveedorTabla> {
    return this.http.post<ProveedorTabla>(this.apiUrl, proveedor);
  }

  actualizar(id: number, proveedor: ProveedorTabla): Observable<ProveedorTabla> {
    return this.http.put<ProveedorTabla>(`${this.apiUrl}/${id}`, proveedor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  buscarProveedores(termino: string): Observable<ProveedorTabla[]> {
    const params = new HttpParams().set('nombre', termino ?? '');
    return this.http.get<ProveedorTabla[]>(`${this.apiUrl}/buscar`, { params });
  }
}


