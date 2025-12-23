import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css' // Ojo: a veces es styleUrls (plural) en versiones viejas, pero styleUrl (singular) está bien en Angular 17+
})
export class LoginComponent {

  usuario: string = '';
  password: string = '';
  mensajeError: string = '';
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ingresar() {
    // 1. Validaciones básicas
    if (!this.usuario || !this.password) {
      this.mensajeError = '⚠️ Por favor ingresa usuario y contraseña.';
      return;
    }

    this.mensajeError = '';
    this.cargando = true;

    // 2. UNA SOLA LLAMADA AL BACKEND
    this.authService.login(this.usuario, this.password).subscribe({
      // CORRECCIÓN AQUÍ: Agregamos ": any" para calmar a TypeScript
      next: (res: any) => { 
        console.log('Respuesta real del servidor:', res);
        
        // 3. LIMPIEZA NUCLEAR DE MEMORIA VIEJA
        localStorage.clear(); 
        sessionStorage.clear();

        // 4. GUARDAR SESIÓN Y NAVEGAR
        this.authService.guardarSesion(res.token, res.usuario);
        
        this.router.navigate(['/dashboard']); // Asegúrate que esta ruta exista en tu app.routes.ts
      },
      // CORRECCIÓN AQUÍ: Agregamos ": any"
      error: (err: any) => { 
        console.error('Error login:', err);
        this.cargando = false;
        
        if (err.status === 401) {
          this.mensajeError = '⛔ Usuario o contraseña incorrectos.';
        } else {
          this.mensajeError = '⚠️ Error de conexión con el servidor.';
        }
      }
    });
  }
}