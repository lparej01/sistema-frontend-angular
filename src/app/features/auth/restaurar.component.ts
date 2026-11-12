import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restaurar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './restaurar.component.html',
  styleUrls: ['./restaurar.component.css']
})
export class RestaurarComponent implements OnInit { // 👈 Se añadió 'export' aquí
  token: string = '';
  nuevaPassword: string = '';
  repetirPassword = ''; // 👈 Nueva variable para la confirmación
  ocultarPassword = true; // Controla la visibilidad del ojo
  ocultarRepetirPassword = true; // 👈 Controla el ojo del segundo input
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  cambiarPassword() {
    if (!this.nuevaPassword) {
      alert('Por favor, ingresa una contraseña.');
      return;
    }

    const urlBackend = 'http://localhost:8080/api/auth/restaurar';
    const body = { token: this.token, password: this.nuevaPassword };

    this.http.post(urlBackend, body).subscribe({
      next: (res: any) => {
        alert('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Hubo un error al intentar cambiar la contraseña o el token ya expiró.');
        console.error(err);
      }
    });
  }
}
