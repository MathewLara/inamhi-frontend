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
    numero: '', cedula: '', nombre: '',
    honorarios: null as number | null,
    inicio: '', fin: '',
    direccion_domicilio: '', objeto_contrato: '',
    id_direccion_solicitante: '',
    id_usuario_supervisor: ''
  };

  // VARIABLES MODALES
  mostrarModalCrear: boolean = false;
  mostrarModal: boolean = false; // <--- Esta controla el modal de "Ver"
  
  seleccionado: any = null;      // <--- Aquí se guardan los datos del contrato que ves

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
    const usuarioGuardado = localStorage.getItem('usuario'); // O 'usuario_inamhi' según uses
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
      error: (e) => console.error("Error catálogos", e)
    });
  }

  cargarContratos() {
    this.contratoService.getContratos().subscribe({
      next: (data) => {
        this.listaContratos = data;
        this.cd.detectChanges();
      },
      error: (e) => console.error("Error contratos", e)
    });
  }

  // --- CREAR ---
  abrirModalCrear() {
    this.nuevoContrato = {
      numero: '', cedula: '', nombre: '', honorarios: null, 
      inicio: '', fin: '', direccion_domicilio: '', 
      objeto_contrato: '', id_direccion_solicitante: '', id_usuario_supervisor: ''
    };
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() { this.mostrarModalCrear = false; }

  guardarContrato() {
    if (!this.nuevoContrato.numero || !this.nuevoContrato.nombre) {
      Swal.fire('Atención', 'Complete los datos obligatorios', 'warning');
      return;
    }
    const datosEnviar = {
      ...this.nuevoContrato,
      idArea: this.nuevoContrato.id_direccion_solicitante,
      idSupervisor: this.nuevoContrato.id_usuario_supervisor
    };
    this.contratoService.createContrato(datosEnviar).subscribe({
      next: () => {
        Swal.fire('¡Creado!', 'Contrato registrado', 'success');
        this.cerrarModalCrear();
        this.cargarContratos();
      },
      error: () => Swal.fire('Error', 'No se pudo guardar', 'error')
    });
  }

  // --- VER DETALLES (AQUÍ ESTÁ LA LÓGICA QUE PIDE EL BOTÓN) ---
  verDetalle(c: any) {
    this.seleccionado = c; // Guardamos el contrato clickeado
    this.mostrarModal = true; // Abrimos la ventana
  }

  cerrarModal() { 
    this.mostrarModal = false; 
    this.seleccionado = null; 
  }

  // --- ELIMINAR ---
  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar?', text: "No se puede deshacer", icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contratoService.deleteContrato(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Contrato borrado.', 'success');
            this.cargarContratos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  // --- HELPERS VISUALES ---
  obtenerClaseEstado(c: any): string {
    const s = (c.estado || '').toUpperCase();
    if (s === 'VIGENTE') return 'badge-verde'; // Asegúrate de tener estas clases en tu CSS o usar estilos en línea
    if (s === 'FINALIZADO') return 'badge-rojo';
    return 'badge-gris';
  }
}