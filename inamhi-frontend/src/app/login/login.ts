import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service'; // <--- Importamos el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  usuario: string = '';
  password: string = '';
  mensajeError: string = '';
  cargando: boolean = false; // Para evitar doble clic

  constructor(private authService: AuthService, private router: Router) {}

  ingresar() {
    // 1. Validaciones básicas
    if (!this.usuario || !this.password) {
      this.mensajeError = '⚠️ Por favor ingresa usuario y contraseña.';
      return;
    }

    this.mensajeError = '';
    this.cargando = true;

    // 2. CONEXIÓN CON EL BACKEND REAL
    this.authService.login(this.usuario, this.password).subscribe({
      next: (respuesta) => {
        // SI TODO SALE BIEN (Backend responde 200 OK)
        console.log('Login exitoso:', respuesta);
        
        // Guardamos el token y los datos
        this.authService.guardarSesion(respuesta.token, respuesta.usuario);
        
        // Vamos al Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // SI SALE MAL (Backend responde error)
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