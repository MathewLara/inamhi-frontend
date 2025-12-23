import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router'; 
import { ContratoService } from '../services/contrato.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule], 
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})
export class ContratosComponent implements OnInit {

  // VARIABLES DE DATOS
  listaContratos: any[] = [];
  listaDirecciones: any[] = [];
  listaSupervisores: any[] = [];
  rolUsuario: string = ''; 

  // VARIABLES FORMULARIO
  nuevoContrato = {
    numero: '', 
    cedula: '', 
    nombre: '',
    honorarios: null as number | null,
    inicio: '', 
    fin: '',
    direccion_domicilio: '', 
    objeto_contrato: '',
    id_direccion_solicitante: '',
    id_usuario_supervisor: ''
  };

  // VARIABLES DE CONTROL (MODALES Y EDICIÓN)
  mostrarModalCrear: boolean = false;
  mostrarModalVer: boolean = false; // Modal de detalles (lupa)
  
  seleccionado: any = null; // Para ver detalles
  
  esEdicion: boolean = false;      // <--- Variable clave
  idContratoEditar: any = null;    // <--- Variable clave

  constructor(
    private contratoService: ContratoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.detectarRol();
    this.cargarListas();
    this.cargarContratos();
  }

  detectarRol() {
    const usuarioGuardado = localStorage.getItem('usuario'); 
    if (usuarioGuardado) {
      try {
        const u = JSON.parse(usuarioGuardado);
        this.rolUsuario = u.rol || '';
      } catch (e) { console.error(e); }
    }
  }

  cargarListas() {
    this.contratoService.getCatalogos().subscribe({
      next: (data: any) => {
        this.listaDirecciones = data.areas || [];
        this.listaSupervisores = data.supervisores || [];
      },
      error: (e: any) => console.error("Error catálogos", e)
    });
  }

  cargarContratos() {
    this.contratoService.getContratos().subscribe({
      next: (data: any) => {
        this.listaContratos = data;
        this.cd.detectChanges();
      },
      error: (e: any) => console.error("Error contratos", e)
    });
  }

  // --- LÓGICA DEL FORMULARIO (CREAR Y EDITAR) ---

  // 1. Abrir modal en modo "LIMPIO" (Crear)
  abrirModalCrear() {
    this.esEdicion = false;
    this.idContratoEditar = null;

    // Limpiamos el formulario
    this.nuevoContrato = {
      numero: '', cedula: '', nombre: '', honorarios: null, 
      inicio: '', fin: '', direccion_domicilio: '', 
      objeto_contrato: '', id_direccion_solicitante: '', id_usuario_supervisor: ''
    };
    this.mostrarModalCrear = true;
  }

  // 2. Abrir modal en modo "CARGADO" (Editar)
  abrirModalEditar(c: any) {
    this.esEdicion = true;
    this.idContratoEditar = c.id_contrato;

    // Llenamos el formulario con los datos de la fila
    // IMPORTANTE: Las fechas vienen con hora (YYYY-MM-DDTHH:mm...), hay que cortarlas
    this.nuevoContrato = {
      numero: c.numero_contrato,
      cedula: c.cedula_profesional,
      nombre: c.nombre_completo_profesional,
      honorarios: c.honorarios_mensuales,
      inicio: c.fecha_inicio ? c.fecha_inicio.split('T')[0] : '',
      fin: c.fecha_fin ? c.fecha_fin.split('T')[0] : '',
      direccion_domicilio: c.direccion_domicilio,
      objeto_contrato: c.objeto_contrato || '',
      id_direccion_solicitante: c.id_direccion_solicitante,
      id_usuario_supervisor: c.id_usuario_supervisor
    };

    this.mostrarModalCrear = true; // Reusamos la misma ventana
  }

  cerrarModalCrear() { 
    this.mostrarModalCrear = false; 
  }

  // 3. Función inteligente para Guardar o Actualizar
  guardarContrato() {
    // Validaciones básicas
    if (!this.nuevoContrato.numero || !this.nuevoContrato.nombre) {
      Swal.fire('Atención', 'Complete Número y Nombre del profesional', 'warning');
      return;
    }

    // Preparamos los datos (mapeo de nombres si es necesario)
    const datosEnviar = {
      ...this.nuevoContrato,
      idArea: this.nuevoContrato.id_direccion_solicitante,
      idSupervisor: this.nuevoContrato.id_usuario_supervisor
    };

    if (this.esEdicion) {
      // --- MODO ACTUALIZAR ---
      this.contratoService.updateContrato(this.idContratoEditar, datosEnviar).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'Contrato modificado correctamente', 'success');
          this.cerrarModalCrear();
          this.cargarContratos();
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar', 'error');
        }
      });

    } else {
      // --- MODO CREAR ---
      this.contratoService.createContrato(datosEnviar).subscribe({
        next: () => {
          Swal.fire('¡Creado!', 'Contrato registrado exitosamente', 'success');
          this.cerrarModalCrear();
          this.cargarContratos();
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo guardar', 'error');
        }
      });
    }
  }

  // --- VER DETALLES (LUPA) ---
  verDetalle(c: any) {
    this.seleccionado = c;
    this.mostrarModalVer = true;
  }

  cerrarModalVer() { 
    this.mostrarModalVer = false; 
    this.seleccionado = null; 
  }

  // --- ELIMINAR ---
  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar Contrato?', 
      text: "Esta acción no se puede deshacer", 
      icon: 'warning',
      showCancelButton: true, 
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contratoService.deleteContrato(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Contrato eliminado.', 'success');
            this.cargarContratos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar (puede tener pagos asociados)', 'error')
        });
      }
    });
  }
}