import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Inyectamos el servicio central de autenticación
  public authService = inject(AuthService);

  // Exponemos el Signal computado de autenticación para usarlo directamente en el HTML
  public isAuthenticated = this.authService.isAuthenticated;

  onLogout(): void {
    this.authService.logout();
  }
}

