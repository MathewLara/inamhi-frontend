import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TdrService } from '../services/tdr.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tdr-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './tdr-form.html',
  styleUrl: './tdr-form.css'
})
export class TdrFormComponent {

  // Variables del formulario
  nuevoCodigo: string = '';
  nuevoTipo: string = 'Ínfima Cuantía';
  nuevoObjeto: string = '';
  nuevaDireccion: string = 'TICs (Tecnología)';
  nuevoPresupuesto: number | null = null;
  nuevaFechaInicio: string = '';
  nuevaFechaFin: string = '';
  nuevoEstado: string = 'VIGENTE';

  constructor(private tdrService: TdrService, private router: Router) {}

  guardar() {
    if (!this.nuevoCodigo) {
      Swal.fire('Atención', 'Por favor, ingresa el número de TDR.', 'warning');
      return;
    }

    // Datos tal cual los espera tu Base de Datos (snake_case)
    const nuevoTDR = {
      numero_tdr: this.nuevoCodigo,
      anio_fiscal: new Date().getFullYear(), 
      objeto_contratacion: this.nuevoObjeto,
      presupuesto_referencial: this.nuevoPresupuesto || 0,
      fecha_inicio_contrato: this.nuevaFechaInicio,
      fecha_fin_contrato: this.nuevaFechaFin,
      id_tipo_proceso: 1, 
      id_direccion_solicitante: 1,
      estado: this.nuevoEstado 
    };

    this.tdrService.createTdr(nuevoTDR).subscribe({
      next: (res: any) => { // Agregado : any
        Swal.fire('¡Éxito!', 'TDR Registrado con éxito!', 'success');
        this.router.navigate(['/tdr-lista']);
      },
      error: (err: any) => { // Agregado : any
        console.error("Error al guardar:", err);
        Swal.fire('Info', 'Solicitud enviada (Revisa consola)', 'info');
        this.router.navigate(['/tdr-lista']);
      }
    });
  }
}