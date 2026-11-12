export interface Sku {
  sku: string; // O el tipo de ID que uses
  descripcion?: string;
}

export interface Proveedor {
  provId: number;
  nombre?: string; // O la propiedad que tengas para el nombre comercial
}

export interface Pedido {
  pedidoId?: number; // Opcional al crear
  fechaPedido: string;
  // Permitimos que puedan ser null u opcionales:
  proveedores?: { provId?: number; nombre?: string } | null;
  sku?: { sku?: string; descripcion?: string } | null;
  cant: number;
  costoUnitario: number;
  costoTotal?: number; // Calculado o por defecto
  flete: number;
  costoTotalFlete?: number; // Calculado
  cantPendiente?: number;
  saldoPendiente?: number;
  activo?: number;
  timestamp?: string;
  usuario?: string;
}
