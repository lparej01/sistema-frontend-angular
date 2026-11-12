import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../core/services/pedido.service';
import { SkuService,SkuTabla } from '../../core/services/sku.service';
import { ProveedorService,ProveedorTabla} from '../../core/services/proveedor.service';
import { Pedido, Proveedor, Sku } from '../../core/models/pedido.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido.component.html'


})


export class PedidoComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private proveedorService = inject(ProveedorService);
  private skuService = inject(SkuService);
  private authService = inject(AuthService);

  // Estados de la vista
  pedidos = signal<Pedido[]>([]);
  errorMensaje = signal<string | null>(null);
  mostrarModal = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);

  proveedoresList: Proveedor[] = [];
  skusList: Sku[] = [];

  nuevoPedido: Pedido = this.inicializarFormulario();

  readonly cargando = signal<boolean>(false);

  ngOnInit() {
    this.cargarPedidos();
    this.cargarListasAuxiliares();
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        const ordenados = (data || []).sort((a, b) => (b.pedidoId ?? 0) - (a.pedidoId ?? 0));
        this.pedidos.set(ordenados);
        this.cargando.set(false);

      },
      error: (err) => {
        console.error('ERROR EN HTTP PEDIDOS:', err);
        this.errorMensaje.set('No se pudieron recuperar lOS PEDIDOS de la base de datos.');
        this.cargando.set(false);
      }

    });
  }

  cargarListasAuxiliares() {
    this.proveedorService.getProveedores().subscribe({
      next: (data: ProveedorTabla[]) => {
        this.proveedoresList = (data || []).map(item => ({
          ...item,
          provId: item.provId ?? 0
        })) as Proveedor[];
      },
      error: () => this.errorMensaje.set('Error al cargar la lista de proveedores.')
    });

    this.skuService.obtenerSkus().subscribe({
      next: (data: SkuTabla[]) => {
        this.skusList = (data || []).map(item => ({
          ...item,
          sku: item.sku !== undefined && item.sku !== null ? String(item.sku).trim() : ''
        })) as Sku[];
      },
      error: (err) => {
        console.error('Error cargando SKUs:', err);
        this.errorMensaje.set('Error al cargar la lista de SKUs.');
      }
    });
  }

  inicializarFormulario(): Pedido {
    return {
      fechaPedido: new Date().toISOString().split('T')[0],
      proveedores: { provId: 0 },
      sku: { sku: '' },
      cant: 1,
      costoUnitario: 0,
      flete: 0,
      usuario: 'MASTER_USER'
    };
  }

  calcularCostos() {
    const cant = Number(this.nuevoPedido.cant) || 0;
    const unitario = Number(this.nuevoPedido.costoUnitario) || 0;
    const flete = Number(this.nuevoPedido.flete) || 0;

    this.nuevoPedido.costoTotal = cant * unitario;
    this.nuevoPedido.costoTotalFlete = (cant * unitario) + flete;
  }

  abrirModalNuevo() {
    this.nuevoPedido = this.inicializarFormulario();
    this.modoEdicion.set(false);
    this.errorMensaje.set(null);
    this.mostrarModal.set(true);
  }

  abrirModalEditar(pedido: Pedido) {
    // Acceso seguro respetando la interfaz Proveedor
    const provObj = pedido.proveedores as any; // Cast temporal solo para leer variantes del backend si vienen con minúscula

    this.nuevoPedido = {
      ...pedido,
      proveedores: pedido.proveedores
        ? { provId: pedido.proveedores.provId ?? provObj?.provid ?? 0 }
        : { provId: 0 },
      sku: pedido.sku
        ? { sku: pedido.sku.sku ?? '' }
        : { sku: '' }
    };

    this.modoEdicion.set(true);
    this.errorMensaje.set(null);
    this.mostrarModal.set(true);
  }
  guardarPedido() {
    this.calcularCostos();
    const usuarioLogeado = this.authService.currentUsername() || 'desconocido';

    // 1. Preparamos los datos base comunes
    const datosBase = {
      fechaPedido: this.nuevoPedido.fechaPedido,
      proveedores: {
        provId: Number(this.nuevoPedido.proveedores?.provId)
      },
      sku: {
        sku: String(this.nuevoPedido.sku?.sku)
      },
      cant: Number(this.nuevoPedido.cant || 0),
      costoUnitario: Number(this.nuevoPedido.costoUnitario || 0),
      costoTotal: Number(this.nuevoPedido.costoTotal || 0),
      flete: Number(this.nuevoPedido.flete || 0),
      costoTotalFlete: Number(this.nuevoPedido.costoTotalFlete || 0),
      cantPendiente: Number(this.nuevoPedido.cantPendiente ?? this.nuevoPedido.cant ?? 0),
      saldoPendiente: Number(this.nuevoPedido.saldoPendiente ?? this.nuevoPedido.costoTotalFlete ?? 0),
      activo: this.nuevoPedido.activo ?? 1,
      timestamp: this.nuevoPedido.timestamp || new Date().toISOString().replace(/[-T:.Z]/g, '').substring(0, 14),
      usuario: (this.modoEdicion() ? (this.nuevoPedido.usuario || usuarioLogeado) : usuarioLogeado).substring(0, 20)
    };

    // 2. Ejecutar según el modo (Crear vs Editar)
    if (this.modoEdicion()) {
      const id = this.nuevoPedido.pedidoId!;
      const payload: Pedido = {
        ...datosBase,
        pedidoId: id
      };

      this.pedidoService.actualizarPedido(id, payload).subscribe({
        next: () => this.exitoAlGuardar(),
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.errorMensaje.set('Ocurrió un error al actualizar el pedido.');
        }
      });
    } else {
      // Para registrar un pedido nuevo, NO incluimos la clave pedidoId en el objeto
      const payload: Pedido = {
        ...datosBase
      };

      this.pedidoService.crearPedido(payload).subscribe({
        next: () => this.exitoAlGuardar(),
        error: (err) => {
          console.error('Error al crear:', err);
          this.errorMensaje.set('Ocurrió un error al guardar el pedido.');
        }
      });
    }
  }

// Función auxiliar para limpiar y cerrar el modal
  exitoAlGuardar() {
    this.errorMensaje.set(null);
    this.mostrarModal.set(false);
    this.cargarPedidos();
  }

  eliminarPedido(pedido: Pedido) {
    if (!pedido.pedidoId) return;
    const confirmar = confirm(`¿Estás seguro de eliminar el pedido #${pedido.pedidoId}?`);
    if (confirmar) {
      this.pedidoService.eliminarPedido(pedido.pedidoId).subscribe({
        next: () => this.cargarPedidos(),
        error: () => this.errorMensaje.set('No se pudo eliminar el pedido.')
      });
    }
  }

  // Métodos de comparación optimizados para [compareWith] en el HTML
  compararProveedores(p1: any, p2: any): boolean {
    if (p1 === p2) return true;
    if (!p1 || !p2) return false;
    const id1 = p1.provId ?? p1.provid;
    const id2 = p2.provId ?? p2.provid;
    return id1 != null && id2 != null && String(id1) === String(id2);
  }

  compararSkus(s1: any, s2: any): boolean {
    if (s1 === s2) return true;
    if (!s1 || !s2) return false;
    const sku1 = typeof s1 === 'object' ? s1.sku : s1;
    const sku2 = typeof s2 === 'object' ? s2.sku : s2;
    return sku1 != null && sku2 != null && String(sku1).trim() === String(sku2).trim();
  }
}
