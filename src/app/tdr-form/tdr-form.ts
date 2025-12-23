import { Component, OnInit } from '@angular/core'; // 1. Importar OnInit
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; // 2. Importar ActivatedRoute
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
export class TdrFormComponent implements OnInit { // 3. Implementar OnInit

  // Variables del formulario
  nuevoCodigo: string = '';
  nuevoTipo: string = 'Ínfima Cuantía';
  nuevoObjeto: string = '';
  nuevaDireccion: string = 'TICs (Tecnología)';
  nuevoPresupuesto: number | null = null;
  nuevaFechaInicio: string = '';
  nuevaFechaFin: string = '';
  nuevoEstado: string = 'VIGENTE';

  // Variables de control para Edición
  esEdicion: boolean = false;
  idTdrEditar: any = null;

  constructor(
    private tdrService: TdrService, 
    private router: Router,
    private route: ActivatedRoute // 4. Inyectar ActivatedRoute
  ) {}

  // 5. Esta función se ejecuta apenas carga la página
  ngOnInit(): void {
    // Escuchamos la URL para ver si hay un ID (ej: ?id=4)
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.idTdrEditar = id;
        this.cargarDatosParaEditar(id);
      }
    });
  }

  // 6. Función para traer los datos del backend y llenar el formulario
  cargarDatosParaEditar(id: any) {
    this.tdrService.getTdrById(id).subscribe({
      next: (data: any) => {
        // Llenamos los campos con lo que vino de la base de datos
        // OJO: Asegúrate que los nombres (data.xxxx) coincidan con tu base de datos
        this.nuevoCodigo = data.numero_tdr;
        this.nuevoObjeto = data.objeto_contratacion;
        this.nuevoPresupuesto = data.presupuesto_referencial;
        // Cortamos la fecha para que encaje en el input HTML (YYYY-MM-DD)
        this.nuevaFechaInicio = data.fecha_inicio_contrato ? data.fecha_inicio_contrato.split('T')[0] : '';
        this.nuevaFechaFin = data.fecha_fin_contrato ? data.fecha_fin_contrato.split('T')[0] : '';
        this.nuevoEstado = data.estado;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el TDR', 'error');
      }
    });
  }

  guardar() {
    if (!this.nuevoCodigo) {
      Swal.fire('Atención', 'Por favor, ingresa el número de TDR.', 'warning');
      return;
    }

    const datosTDR = {
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

    if (this.esEdicion) {
      // 7. MODO ACTUALIZAR
      this.tdrService.updateTdr(this.idTdrEditar, datosTDR).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'TDR actualizado correctamente', 'success');
          this.router.navigate(['/tdr-lista']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar', 'error');
        }
      });
    } else {
      // 8. MODO CREAR (Lo que ya tenías)
      this.tdrService.createTdr(datosTDR).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'TDR Registrado con éxito!', 'success');
          this.router.navigate(['/tdr-lista']);
        },
        error: (err) => {
          console.error("Error al guardar:", err);
          Swal.fire('Info', 'Solicitud enviada', 'info');
          this.router.navigate(['/tdr-lista']);
        }
      });
    }
  }
}