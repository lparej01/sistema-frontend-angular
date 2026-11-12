export interface Proveedor {
  provId?: number;
  nombre: string;
  contacto?: string | null;
  telf1?: string | null;
  telf2?: string | null;
  telfContacto?: string | null;
  email?: string | null;
  emailContacto?: string | null;
  activo: number; // Mapea el Integer (0 o 1) de SQLite
  timestamp: string;
  usuario?: string | null;
}
