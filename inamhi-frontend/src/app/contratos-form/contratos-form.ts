import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <--- IMPORTANTE PARA EL *ngFor
import { ContratoService } from '../services/contrato.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contratos-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule], // <--- Verifica que CommonModule esté aquí
  templateUrl: './contratos-form.html',
  styleUrl: './contratos-form.css'
})
export class ContratosFormComponent implements OnInit {

  // Variables del Formulario
  nuevoNombre: string = '';
  nuevoCargo: string = '';
  nuevoHonorario: number | null = null;
  nuevoInicio: string = '';
  nuevoFin: string = '';
  
  // VARIABLES PARA LOS SELECTS
  selectedArea: any = null;       
  selectedSupervisor: any = null; 

  // LISTAS VACÍAS (Se llenarán al iniciar)
  listaAreas: any[] = [];
  listaSupervisores: any[] = [];

  constructor(private contratoService: ContratoService, private router: Router) {}

  ngOnInit() {
    // AL INICIAR, PEDIMOS LOS DATOS
    this.cargarListas();
  }

  cargarListas() {
    console.log("🔄 Cargando listas de áreas y supervisores...");
    this.contratoService.getCatalogos().subscribe({
      next: (data: any) => {
        console.log("✅ Datos recibidos del backend:", data);
        this.listaAreas = data.areas;
        this.listaSupervisores = data.supervisores;
      },
      error: (err) => {
        console.error("❌ Error cargando listas:", err);
        Swal.fire('Error', 'No se pudieron cargar las áreas. Revisa que el Backend esté encendido.', 'error');
      }
    });
  }

  guardar() {
    if (!this.nuevoNombre || !this.nuevoCargo) {
      Swal.fire('Atención', 'Nombre y Cargo son obligatorios.', 'warning');
      return;
    }

    const nuevoContrato = {
      nombre: this.nuevoNombre,
      cargo: this.nuevoCargo,
      honorarios: Number(this.nuevoHonorario) || 0,
      inicio: this.nuevoInicio !== '' ? this.nuevoInicio : null,
      fin: this.nuevoFin !== '' ? this.nuevoFin : null,
      estado: 'VIGENTE',
      
      // ENVIAMOS LOS IDs SELECCIONADOS
      idArea: this.selectedArea,
      idSupervisor: this.selectedSupervisor
    };

    console.log("Enviando:", nuevoContrato);

    this.contratoService.createContrato(nuevoContrato).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Contrato guardado correctamente', 'success').then(() => {
          this.router.navigate(['/contratos']);
        });
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'Error desconocido', 'error');
      }
    });
  }
}