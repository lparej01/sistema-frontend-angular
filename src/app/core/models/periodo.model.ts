export interface Periodo {
  idPeriodo: number;
  anio: number;
  mes: number;
  mesNombre: string;
  esCerrado: number; // 0 = Abierto, 1 = Cerrado
  esActual: number;  // 0 = No, 1 = Activo
  timestamp: string;
  usuario: string;
}
