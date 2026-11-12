import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// 🎯 Aquí definimos las rutas que el sistema estaba buscando
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component'),
    canActivate: [authGuard]
  },
  {
    path: 'inicio',
    loadComponent: () => import('./features/dashboard/inicio.component').then(m => m.InicioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categorias/categorias.component').then(m => m.CategoriasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sku',
    loadComponent: () => import('./features/sku/sku.component').then(m => m.SkuComponent),
    canActivate: [authGuard]
  },

  {
    path: 'proveedores',
    loadComponent: () => import('./features/proveedores/proveedores.component').then(m => m.ProveedoresComponent),
    canActivate: [authGuard]
  },
  {
    path: 'periodo',
    loadComponent: () => import('./features/periodo/periodo.component').then(m => m.PeriodoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pedido',
    loadComponent: () => import('./features/pedido/pedido.component').then(m => m.PedidoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'existencia',
    loadComponent: () => import('./features/existencia/existencia.component').then(m => m.default),
    canActivate: [authGuard]
  },
  {
    path: 'despacho',
    loadComponent: () => import('./features/despacho/despacho.component').then(m => m.DespachoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inventario',
    loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent),
    canActivate: [authGuard]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./features/auth/recuperar.component').then(m => m.RecuperarComponent)
    // ⚠️ SIN canActivate porque es público
  },
  {
    path: 'restaurar',
    loadComponent: () => import('./features/auth/restaurar.component').then(m => m.RestaurarComponent)
    // ⚠️ SIN canActivate porque es público
  },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];

