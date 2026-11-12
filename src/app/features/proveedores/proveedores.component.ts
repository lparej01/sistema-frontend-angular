import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedorService, ProveedorTabla } from '../../core/services/proveedor.service';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit, OnDestroy {
  proveedores: ProveedorTabla[] = [];
  proveedorForm!: FormGroup;
  isEditing: boolean = false;
  selectedId?: number;

  // 🟢 Controla la visibilidad de la modal flotante y estado de carga
  mostrarModal: boolean = false;
  isLoading = false;

  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);

  // Mecanismo de búsqueda reactiva
  private buscador$ = new Subject<string>();
  private buscadorSub!: Subscription;

  ngOnInit(): void {
    this.initForm();
    this.listarProveedores();
    this.inicializarBuscador();
  }

  initForm(): void {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      contacto: ['', [Validators.maxLength(50)]],
      telf1: ['', [Validators.maxLength(15)]],
      telf2: ['', [Validators.maxLength(15)]],
      telfContacto: ['', [Validators.maxLength(15)]],
      email: ['', [Validators.email, Validators.maxLength(40)]],
      emailContacto: ['', [Validators.email, Validators.maxLength(40)]],
      activo: [1, [Validators.required]]
    });
  }

  listarProveedores(): void {
    this.isLoading = true;
    this.proveedorService.listar().subscribe({
      next: (data) => {
        this.proveedores = data ? data.sort((a, b) => (b.provId || 0) - (a.provId || 0)) : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.isLoading = false;
      }
    });
  }

  // 🟢 Inicializador del Buscador Reactivo controlado
  private inicializarBuscador(): void {
    this.buscadorSub = this.buscador$.pipe(
      debounceTime(300), // Espera 300ms de calma tras la última tecla
      distinctUntilChanged(),     // Solo emite si el texto realmente cambió
      switchMap((termino) => {
        const query = termino.trim();
        this.isLoading = true;

        // Si el usuario borró el texto de búsqueda, llamamos al listado normal
        if (!query) {
          return this.proveedorService.listar().pipe(
            catchError((err) => {
              console.error('Error al restaurar lista:', err);
              return of([]);
            })
          );
        }

        // Ejecuta la petición de búsqueda al servicio
        return this.proveedorService.buscarProveedores(query).pipe(
          catchError((err) => {
            console.error('Error en servicio de búsqueda:', err);
            this.isLoading = false;
            return of([]); // Evita que el flujo se rompa ante un fallo del servidor
          })
        );
      })
    ).subscribe({
      next: (resultados) => {
        // Ordenamos los resultados por ID descendente de igual forma que el listado general
        this.proveedores = resultados ? resultados.sort((a, b) => (b.provId || 0) - (a.provId || 0)) : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fallo crítico en la suscripción del buscador:', err);
        this.isLoading = false;
      }
    });
  }

  // Método conectado al evento (input) de la vista HTML
  onBuscar(event: Event): void {
    const elementoInput = event.target as HTMLInputElement;
    this.buscador$.next(elementoInput.value);
  }

  // 🟢 Método para abrir la modal al crear un registro nuevo
  abrirModalCrear(): void {
    this.isEditing = false;
    this.selectedId = undefined;
    this.proveedorForm.reset({ activo: 1 });
    this.mostrarModal = true;
  }

  // 🟢 Método para abrir la modal cargada con datos para edición
  editar(proveedor: ProveedorTabla): void {
    this.isEditing = true;
    this.selectedId = proveedor.provId;
    this.proveedorForm.patchValue({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto || '',
      telf1: proveedor.telf1 || '',
      telf2: proveedor.telf2 || '',
      telfContacto: proveedor.telfContacto || '',
      email: proveedor.email || '',
      emailContacto: proveedor.emailContacto || '',
      activo: proveedor.activo ?? 1
    });
    this.mostrarModal = true;
  }

  // 🟢 Método para cerrar la ventana modal de forma segura
  cerrarModal(): void {
    this.mostrarModal = false;
    this.isEditing = false;
    this.selectedId = undefined;
    this.proveedorForm.reset({ activo: 1 });
  }

  guardar(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    const formValues = this.proveedorForm.value;

    const payload: ProveedorTabla = {
      nombre: formValues.nombre,
      contacto: formValues.contacto || null,
      telf1: formValues.telf1 || null,
      telf2: formValues.telf2 || null,
      telfContacto: formValues.telfContacto || null,
      email: formValues.email || null,
      emailContacto: formValues.emailContacto || null,
      activo: formValues.activo ?? 1,
      timestamp: new Date().toISOString().substring(0, 25),
      usuario: 'ADMIN'
    };

    if (this.isEditing && this.selectedId !== undefined) {
      payload.provId = this.selectedId;
      this.proveedorService.actualizar(this.selectedId, payload).subscribe({
        next: () => this.finalizarOperacion(),
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      if (this.proveedores.length > 0) {
        const maxId = Math.max(...this.proveedores.map(p => p.provId || 0));
        payload.provId = maxId + 1;
      } else {
        payload.provId = 1;
      }

      this.proveedorService.crear(payload).subscribe({
        next: () => this.finalizarOperacion(),
        error: (err) => {
          console.error('Error detallado del backend:', err);
          alert(`No se pudo crear el proveedor. Detalles en la consola F12.`);
        }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm(`¿Está seguro de eliminar al proveedor #${id}?`)) {
      this.proveedorService.eliminar(id).subscribe({
        next: () => this.listarProveedores(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  private finalizarOperacion(): void {
    this.listarProveedores();
    this.cerrarModal();
  }

  // 🟢 Limpieza estricta de suscripciones para evitar fugas de memoria (Memory Leaks)
  ngOnDestroy(): void {
    if (this.buscadorSub) {
      this.buscadorSub.unsubscribe();
    }
  }
}

