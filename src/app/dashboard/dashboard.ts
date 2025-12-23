import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router'; // <--- Esto activa los clics

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule], // <--- Necesario para que div use routerLink
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  usuarioNombre: string = '';
  stats = { contratos: 0, tdrs: 0, mantenimientos: 0 };

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarEstadisticas();
  }

  cargarDatosUsuario() {
    const data = localStorage.getItem('usuario');
    if (data) {
      try {
        const userObj = JSON.parse(data);
        this.usuarioNombre = userObj.nombre || 'Usuario';
      } catch (e) {
        console.error("Error al leer usuario", e);
      }
    }
    this.cd.detectChanges();
  }

  cargarEstadisticas() {
    this.http.get<any>('http://localhost:3000/api/dashboard').subscribe({
      next: (res) => {
        // Asignamos los valores que vienen del controlador corregido
        this.stats.contratos = res.totalContratos || 0;
        this.stats.tdrs = res.totalTdrs || 0;
        this.stats.mantenimientos = res.totalMantenimientos || 0;
        this.cd.detectChanges();
      },
      error: (err) => console.error("Error en API Dashboard:", err)
    });
  }
}