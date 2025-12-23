import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../services/auditoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {

  // Objeto exacto para tus ngModel del HTML
  filtros = {
    busqueda: '',
    fechaInicio: '',
    fechaFin: ''
  };

  // Array para la tabla
  logs: any[] = [];
  cargando: boolean = false;

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.buscar(); // Cargar datos al iniciar
  }

  buscar() {
    this.cargando = true;
    
    this.auditoriaService.getAuditoria(this.filtros).subscribe({
      next: (resp) => {
        this.cargando = false;
        // Mapeamos la respuesta del backend para que coincida con tu HTML
        this.logs = resp.data.map((item: any) => ({
          fecha_registro: item.fecha_evento,
          modulo: item.tabla_afectada, // Base de datos: tabla -> HTML: modulo
          usuario: item.username,      
          accion: item.accion,
          // Función para convertir el JSON en texto legible para la columna "DETALLE"
          detalle: this.generarDetalleLegible(item) 
        }));
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los registros', 'error');
      }
    });
  }

  // Lógica para los colores de los Badges (pill labels)
  getBadgeClass(accion: string): string {
    switch (accion?.toUpperCase()) {
      case 'CREAR': return 'badge-crear';
      case 'ACTUALIZAR': return 'badge-editar';
      case 'ELIMINAR': return 'badge-eliminar';
      default: return 'badge-default';
    }
  }

  // Convierte el JSONb de Postgres en un string bonito para la tabla
  private generarDetalleLegible(item: any): string {
    // 1. Decidir qué datos mostrar (nuevos o anteriores)
    const datos = item.accion === 'ELIMINAR' ? item.datos_anteriores : item.datos_nuevos;
    
    // 2. Validación de seguridad
    if (!datos) return 'Sin detalles registrados';

    // 3. Lógica inteligente para detectar qué mostrar según el módulo
    
    // CASO A: Es un TDR
    if (datos.numero_tdr) {
        return `${datos.numero_tdr} - ${datos.objeto_contratacion || ''}`;
    }
    
    // CASO B: Es un Contrato
    if (datos.numero_contrato) {
        return `${datos.numero_contrato} (${datos.nombre_profesional || 'Sin nombre'})`;
    }

    // CASO C: Es un Mantenimiento (AQUI ESTABA EL FALLO)
    // El SQL guardó: { equipo: 'PC-01', fallo: 'No prende' }
    if (datos.equipo || datos.nombre_equipo) {
        const eq = datos.equipo || datos.nombre_equipo;
        const fl = datos.fallo || datos.descripcion_fallo;
        return `Soporte a ${eq}: "${fl}"`;
    }

    // CASO D: Es un Usuario
    if (datos.username) {
        return `Usuario: ${datos.username} (${datos.nombre_rol || 'Rol actualizado'})`;
    }

    // CASO E: Fallback (Si no reconoce nada)
    return 'Registro #' + (item.id_registro_afectado || '?');
  }
}