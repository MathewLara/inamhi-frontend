import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importamos esto
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  stats = {
    contratos: 0,
    tdrs: 0,
    mantenimientos: 0
  };

  usuarioNombre: string = 'Administrador';

  // 👇 2. Inyectamos el detector "cd" en el constructor
  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarEstadisticas();
  }

  cargarDatosUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario_inamhi');
    if (usuarioGuardado) {
      const userObj = JSON.parse(usuarioGuardado);
      this.usuarioNombre = userObj.nombre || userObj.username;
    }
  }

  cargarEstadisticas() {
    this.http.get<any>('http://localhost:3000/api/dashboard').subscribe({
      next: (datos) => {
        console.log('Stats recibidas:', datos);
        this.stats.contratos = datos.totalContratos;
        this.stats.tdrs = datos.totalTDRs; // Si ya tuvieras TDRs
        
        // 👇 3. ¡LA CURA MÁGICA! Forzamos la actualización visual
        this.cd.detectChanges(); 
      },
      error: (e) => console.error('Error cargando dashboard:', e)
    });
  }
}