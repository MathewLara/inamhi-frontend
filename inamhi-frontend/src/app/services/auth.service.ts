import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // La URL de tu Backend (Node.js)
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  // Función para hacer Login real
  login(usuario: string, clave: string): Observable<any> {
    const body = { username: usuario, password: clave };
    // Esto hace el POST igual que hicimos con curl
    return this.http.post(`${this.apiUrl}/login`, body);
  }

  // Guardar datos en la memoria del navegador
  guardarSesion(token: string, usuario: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuarioNombre', usuario.nombre);
    localStorage.setItem('usuarioRol', usuario.rol);
    localStorage.setItem('usuarioEmail', usuario.email);
  }

  // Cerrar sesión
  logout() {
    localStorage.clear();
  }
  // En auth.service.ts

// 1. Obtener el rol actual (asegúrate de que en tu login.component.ts estés guardando 'rol' en localStorage)
getRol(): string {
  return localStorage.getItem('rol') || ''; 
}

// 2. Función para saber si es Jefe (Admin o Tecnico)
esJefe(): boolean {
  const rol = this.getRol();
  return rol === 'admin' || rol === 'tecnico';
}

// 3. Función para saber si es Operativo
esOperativo(): boolean {
  const rol = this.getRol();
  return rol === 'operativo';
}
}