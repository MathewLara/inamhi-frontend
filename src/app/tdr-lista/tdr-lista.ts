import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { TdrService } from '../services/tdr.service'; 

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

  // VARIABLE DE CONTROL DE ACCESO (ADMINISTRADOR)
  esAdmin: boolean = false; 

  constructor(
    private tdrService: TdrService, 
    private router: Router,
    private cd: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.verificarRol(); // Se ejecuta la validación de seguridad al iniciar
    this.obtenerTdrs();
  }

  // LÓGICA DE DETECCIÓN DE ROL SEGÚN REQUERIMIENTOS
  verificarRol() {
    const data = localStorage.getItem('usuario');
    if (data) {
      try {
        const userObj = JSON.parse(data);
        const rolTexto = (userObj.rol || userObj.nombre_rol || '').toLowerCase();
        
        // El administrador del sistema es detectado, pero se excluye al personal técnico
        // Esto evita que 'Técnico Administrativo' sea detectado como administrador.
        this.esAdmin = rolTexto.includes('administrador') && !rolTexto.includes('técnico');
        
        console.log("Vista TDR - Rol:", rolTexto, "| ¿Es Administrador?:", this.esAdmin);
      } catch (e) {
        console.error("Error al verificar rol", e);
        this.esAdmin = false;
      }
    }
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

  // PROTECCIÓN DE ACCIONES CRÍTICAS (REQUERIMIENTO 2.1)
  editarTdr(tdr: any) {
    if (!this.esAdmin) {
      alert('Acción restringida: Solo el administrador puede modificar TDRs.');
      return;
    }
    this.router.navigate(['/nuevo-tdr'], { queryParams: { id: tdr.id_tdr } });
  }

  // ELIMINAR TDR: Restaurado solo para administradores con confirmación
  eliminarTdr(tdr: any) {
    // Bloqueo total para técnicos y operativos
    if (!this.esAdmin) {
      alert('Acción restringida: Solo el administrador puede eliminar registros del sistema.');
      return;
    }

    if(confirm(`¿Estás seguro de que deseas eliminar el TDR: ${tdr.numero_tdr}?`)) {
      this.tdrService.deleteTdr(tdr.id_tdr).subscribe({
        next: () => {
          alert('✅ TDR Eliminado correctamente');
          this.obtenerTdrs(); 
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar el TDR');
        }
      });
    }
  }

  verTdr(tdr: any) {
    this.tdrSeleccionado = tdr;
    this.mostrarModalVer = true;
  }

  cerrarModalVer() {
    this.mostrarModalVer = false;
    this.tdrSeleccionado = null;
  }

  getClaseBadge(estado: any): string {
    const s = String(estado || '').toUpperCase();
    if (s.includes('BORRADOR') || s === '1') return 'bg-secondary'; 
    if (s.includes('PROCESO')) return 'bg-warning text-dark';
    if (s.includes('APROBADO')) return 'bg-success';
    return 'bg-light text-dark border';
  }

  getTextoEstado(estado: any): string {
    return estado ? String(estado).toUpperCase() : 'BORRADOR';
  }
}