import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- AGREGADO ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MantenimientoService } from '../services/mantenimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimientos.html',
  styleUrls: ['./mantenimientos.css']
})
export class MantenimientosComponent implements OnInit {

  listaMantenimientos: any[] = [];
  mostrarModalReporte: boolean = false;

  nuevoReporte = {
    nombre_equipo: '',
    descripcion_fallo: '',
    fecha_reporte: new Date().toISOString().split('T')[0], 
    tecnico_sugerido: '',
    id_usuario_reporta: 0 
  };

  rolUsuario: string = '';

  constructor(
    private mantenimientoService: MantenimientoService,
    private cd: ChangeDetectorRef // <--- INYECCIÓN DE DEPENDENCIA
  ) { }

  ngOnInit(): void {
    // 1. Cargar Usuario
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      this.nuevoReporte.id_usuario_reporta = usuario.id_usuario;
      this.rolUsuario = usuario.rol;
    }

    // 2. Cargar la Tabla INMEDIATAMENTE
    console.log("🔄 Iniciando componente Mantenimientos...");
    this.cargarMantenimientos();
  }

  cargarMantenimientos() {
    this.mantenimientoService.getMantenimientos().subscribe({
      next: (data: any) => {
        console.log("📥 Datos recibidos en el Frontend:", data); // Mira la consola para ver si llegan
        this.listaMantenimientos = data || [];
        this.cd.detectChanges(); // <--- ¡ESTO ES LO QUE FORZA LA TABLA A APARECER!
      },
      error: (error: any) => {
        console.error('🔥 Error al cargar:', error);
      }
    });
  }

  abrirModalReporte() {
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte() {
    this.mostrarModalReporte = false;
  }

  registrarReporte() {
    if (!this.nuevoReporte.nombre_equipo || !this.nuevoReporte.descripcion_fallo) {
      Swal.fire({
        title: 'Faltan datos',
        text: 'Por favor completa el nombre del equipo y la descripción.',
        icon: 'warning',
        confirmButtonColor: '#003366'
      });
      return;
    }

    if (this.nuevoReporte.id_usuario_reporta === 0) {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            this.nuevoReporte.id_usuario_reporta = JSON.parse(usuarioGuardado).id_usuario;
        } else {
            this.nuevoReporte.id_usuario_reporta = 1; 
        }
    }

    this.mantenimientoService.createMantenimiento(this.nuevoReporte).subscribe({
      next: (resp: any) => {
        Swal.fire({
          title: '¡Reporte Enviado!',
          text: 'Se ha registrado correctamente.',
          icon: 'success',
          confirmButtonColor: '#003366'
        });

        this.cerrarModalReporte();
        this.cargarMantenimientos(); // Recargar tabla
        
        // Limpiar form
        this.nuevoReporte = {
          nombre_equipo: '',
          descripcion_fallo: '',
          fecha_reporte: new Date().toISOString().split('T')[0],
          tecnico_sugerido: '',
          id_usuario_reporta: this.nuevoReporte.id_usuario_reporta
        };
      },
      error: (error: any) => {
        console.error('Error al guardar:', error);
        Swal.fire('Error', 'No se pudo guardar.', 'error');
      }
    });
  }

  cambiarEstado(mantenimiento: any, nuevoEstado: string) {
    Swal.fire({
      title: '¿Actualizar estado?',
      text: `Pasará a: ${nuevoEstado}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mantenimientoService.updateEstado(mantenimiento.id_mantenimiento, nuevoEstado).subscribe({
          next: () => {
            this.cargarMantenimientos();
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
            Toast.fire({ icon: 'success', title: 'Estado actualizado' });
          },
          error: (error: any) => console.error(error)
        });
      }
    });
  }
}