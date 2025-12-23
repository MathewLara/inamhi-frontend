import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { TdrService } from '../services/tdr.service'; 
// Importa HttpClientModule si fuera necesario en tu versión, pero suele estar en app.config

@Component({
  selector: 'app-tdr-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './tdr-lista.html',
  styleUrls: ['./tdr-lista.css']
})
export class TdrListaComponent implements OnInit {

  tdrs: any[] = [];
  cargando: boolean = true; 
  mostrarModalVer: boolean = false;
  tdrSeleccionado: any = null;

  constructor(
    private tdrService: TdrService, 
    private router: Router,
    private cd: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.obtenerTdrs();
  }

  obtenerTdrs() {
    this.cargando = true;
    this.tdrService.getTdrs().subscribe({
      next: (data: any) => {
        this.tdrs = data || []; 
        this.cargando = false;
        this.cd.detectChanges(); 
      },
      error: (error: any) => {
        console.error("Error al cargar TDRs", error);
        this.cargando = false;
      }
    });
  }

  // --- NUEVO: EDITAR TDR ---
  editarTdr(tdr: any) {
    // Navega a la pantalla de creación pero pasando el ID para que se carguen los datos
    // Asegúrate de que en tu app.routes tengas una ruta que acepte parámetros o usa queryParams
    // Ejemplo: /nuevo-tdr/5
    this.router.navigate(['/nuevo-tdr'], { queryParams: { id: tdr.id_tdr } });
  }

  // --- NUEVO: ELIMINAR TDR ---
  eliminarTdr(tdr: any) {
    if(confirm(`¿Estás seguro de que deseas eliminar el TDR: ${tdr.numero_tdr}?`)) {
      
      // Llamamos al servicio (Asegurate de tener deleteTdr en tu servicio)
      this.tdrService.deleteTdr(tdr.id_tdr).subscribe({
        next: () => {
          alert('TDR Eliminado correctamente');
          this.obtenerTdrs(); // Recargar la lista
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar el TDR');
        }
      });
    }
  }

  // --- MODAL DE DETALLES ---
  verTdr(tdr: any) {
    this.tdrSeleccionado = tdr;
    this.mostrarModalVer = true;
  }

  cerrarModalVer() {
    this.mostrarModalVer = false;
    this.tdrSeleccionado = null;
  }

  // --- AYUDAS VISUALES ---
  getClaseBadge(estado: any): string {
    const s = String(estado || '').toUpperCase();
    if (s.includes('BORRADOR') || s === '1') return 'bg-secondary'; // 1 es ID Borrador
    if (s.includes('PROCESO')) return 'bg-warning text-dark';
    if (s.includes('APROBADO')) return 'bg-success';
    return 'bg-light text-dark border';
  }

  getTextoEstado(estado: any): string {
    return estado ? String(estado).toUpperCase() : 'BORRADOR';
  }
}