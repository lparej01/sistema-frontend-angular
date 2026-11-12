import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkuService, SkuTabla } from '../../core/services/sku.service';
import { CategoriasService, CategoriaTabla } from '../../core/services/categorias.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-sku',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sku.component.html'
})
export class SkuComponent implements OnInit {
  private skuService = inject(SkuService);
  private categoriasService = inject(CategoriasService);
  public authService = inject(AuthService);
  private buscador$ = new Subject<string>();

  skus = signal<SkuTabla[]>([]);
  listaCategorias = signal<CategoriaTabla[]>([]);
  errorMensaje = signal<string | null>(null);

  // Modales y Edición
  mostrarModal = signal<boolean>(false);
  modoEdicion = signal<boolean>(false);

  // 🎛️ SEÑALES PARA FILTROS AVANZADOS Y PAGINACIÓN
  filtroCategoria = signal<number | string>('TODAS');
  filtroEstado = signal<string>('TODOS'); // 'TODOS', '1' (Activos), '0' (Inactivos)

  paginaActual = signal<number>(1);
  articulosPorPagina = signal<number>(5); // Tamaño de página por defecto

  skuFormulario: SkuTabla = {
    sku: 0,
    categoria: null as any,
    marca: '',
    descripcion: '',
    presentacion: 1,
    unidadMedida: '',
    empaque: 1,
    costoUnitario: 0,
    activo: 1,
    timestamp: '',
    usuario: ''
  };

  // 🧠 SEÑAL COMPUTADA: Aplica los filtros avanzados sobre los SKUs cargados
  skusFiltrados = computed(() => {
    let listado = this.skus();
    const cat = this.filtroCategoria();
    const estado = this.filtroEstado();

    // 1. Filtrar por Categoría
    if (cat !== 'TODAS') {
      listado = listado.filter(item => item.categoria?.catId === Number(cat));
    }

    // 2. Filtrar por Estado (Activo / Inactivo)
    if (estado !== 'TODOS') {
      listado = listado.filter(item => item.activo === Number(estado));
    }

    // Resetear a página 1 si los filtros reducen drásticamente la lista
    return listado;
  });

  // 🧠 SEÑAL COMPUTADA: Segmenta el resultado final para la página actual
  skusPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.articulosPorPagina();
    const fin = inicio + this.articulosPorPagina();
    return this.skusFiltrados().slice(inicio, fin);
  });

  // 🧠 SEÑAL COMPUTADA: Calcula el total de páginas dinámicamente
  totalPaginas = computed(() => {
    const totalArticulos = this.skusFiltrados().length;
    return Math.ceil(totalArticulos / this.articulosPorPagina()) || 1;
  });

  ngOnInit(): void {
    this.cargarSkus();
    this.cargarCategoriasDeRespaldo();
    this.inicializarBuscadorReactivo();
  }

  ngOnDestroy(): void {
    this.buscador$.complete();
  }

  inicializarBuscadorReactivo(): void {
    this.buscador$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        this.paginaActual.set(1); // Reiniciar a pag 1 al buscar
        if (!termino.trim()) {
          return this.skuService.obtenerSkus();
        }
        return this.skuService.buscarPorDescripcion(termino);
      })
    ).subscribe({
      next: (datos) => {
        this.skus.set(datos);
        this.errorMensaje.set(null);
      },
      error: (err) => {
        console.error(err);
        this.errorMensaje.set('Error al filtrar los códigos SKU.');
      }
    });
  }

  onBuscar(evento: Event): void {
    const termino = (evento.target as HTMLInputElement).value;
    this.buscador$.next(termino);
  }

  cargarSkus(): void {
    this.skuService.obtenerSkus().subscribe({
      next: (datos) => {
        this.skus.set(datos);
        this.errorMensaje.set(null);
      },
      error: (err) => {
        console.error(err);
        this.errorMensaje.set('No se pudieron recuperar los códigos SKU.');
      }
    });
  }

  cargarCategoriasDeRespaldo(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (cat) => this.listaCategorias.set(cat),
      error: (err) => console.error('Error al cargar catálogo de categorías', err)
    });
  }

  // Métodos auxiliares de cambio de página
  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  actualizarFiltro(): void {
    this.paginaActual.set(1); // Regresar a la primera página si cambian los combos
  }

  abrirModalCrear() {
    this.modoEdicion.set(false);
    this.skuFormulario = {
      sku: null as any,
      categoria: null as any,
      marca: '',
      descripcion: '',
      presentacion: 1,
      unidadMedida: '',
      empaque: 1,
      costoUnitario: 0,
      activo: 1,
      timestamp: new Date().toISOString().substring(0, 25),
      usuario: this.authService.currentUser()?.userId || 'SYSTEM'
    };
    this.mostrarModal.set(true);
  }

  abrirModalEditar(item: SkuTabla) {
    this.modoEdicion.set(true);
    const categoriaCoincidente = this.listaCategorias().find(c => c.catId === item.categoria?.catId) || item.categoria;
    this.skuFormulario = {
      ...item,
      categoria: categoriaCoincidente,
      timestamp: new Date().toISOString().substring(0, 25),
      usuario: this.authService.currentUser()?.userId || 'SYSTEM'
    };
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardarFormulario() {
    if (this.modoEdicion()) {
      this.skuService.actualizarSku(this.skuFormulario.sku, this.skuFormulario).subscribe({
        next: () => { this.cargarSkus(); this.cerrarModal(); },
        error: (err) => alert('Error al actualizar el SKU: ' + (err.error?.message || err.message))
      });
    } else {
      this.skuService.crearSku(this.skuFormulario).subscribe({
        next: () => { this.cargarSkus(); this.cerrarModal(); },
        error: (err) => alert('Error al generar el SKU: ' + (err.error?.message || err.message))
      });
    }
  }

  onEliminar(skuId: number) {
    if (confirm(`¿Está seguro de eliminar permanentemente el SKU #${skuId} de SQLite?`)) {
      this.skuService.eliminarSku(skuId).subscribe({
        next: () => { this.skus.update(items => items.filter(s => s.sku !== skuId)); },
        error: (err) => alert('Error al remover registro: ' + (err.error?.message || err.message))
      });
    }
  }
  cambiarTamanoPagina(evento: Event): void {
    const nuevoTamano = Number((evento.target as HTMLSelectElement).value);
    this.articulosPorPagina.set(nuevoTamano);
    this.paginaActual.set(1); // Restablece siempre a la página 1
  }

}


