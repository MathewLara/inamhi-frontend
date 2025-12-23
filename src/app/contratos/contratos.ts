import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// ELIMINADO RouterLink para quitar el error NG8113
import { RouterModule } from '@angular/router'; 
import { ContratoService } from '../services/contrato.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contratos',
  standalone: true,
  // Solo dejamos RouterModule si usas routerLink en el HTML
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})
export class ContratosComponent implements OnInit {

  listaContratos: any[] = [];
  listaDirecciones: any[] = [];
  listaSupervisores: any[] = [];
  
  // VARIABLE CLAVE DE SEGURIDAD
  esAdmin: boolean = false; 

  nuevoContrato = {
    numero: '', cedula: '', nombre: '', honorarios: null as number | null,
    inicio: '', fin: '', direccion_domicilio: '', objeto_contrato: '',
    id_direccion_solicitante: '', id_usuario_supervisor: ''
  };

  mostrarModalCrear: boolean = false;
  mostrarModalVer: boolean = false; 
  seleccionado: any = null; 
  esEdicion: boolean = false;      
  idContratoEditar: any = null;    

  constructor(
    private contratoService: ContratoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.verificarRol(); // Bloqueo de seguridad inicial
    this.cargarListas();
    this.cargarContratos();
  }

  verificarRol() {
    const data = localStorage.getItem('usuario'); 
    if (data) {
      try {
        const userObj = JSON.parse(data);
        const rolTexto = (userObj.rol || userObj.nombre_rol || '').toLowerCase();
        
        // El Administrador del Sistema entra, pero el Técnico Administrativo NO
        this.esAdmin = rolTexto.includes('administrador') && !rolTexto.includes('técnico');
        
        console.log("Contratos - ¿Acceso Admin?:", this.esAdmin);
      } catch (e) { 
        this.esAdmin = false;
      }
    }
  }

  cargarListas() {
    this.contratoService.getCatalogos().subscribe({
      next: (data: any) => {
        this.listaDirecciones = data.areas || [];
        this.listaSupervisores = data.supervisores || [];
      }
    });
  }

  cargarContratos() {
    this.contratoService.getContratos().subscribe({
      next: (data: any) => {
        this.listaContratos = data;
        this.cd.detectChanges();
      }
    });
  }

  abrirModalCrear() {
    if (!this.esAdmin) return; // Protección extra
    this.esEdicion = false;
    this.idContratoEditar = null;
    this.nuevoContrato = {
      numero: '', cedula: '', nombre: '', honorarios: null, 
      inicio: '', fin: '', direccion_domicilio: '', 
      objeto_contrato: '', id_direccion_solicitante: '', id_usuario_supervisor: ''
    };
    this.mostrarModalCrear = true;
  }

  abrirModalEditar(c: any) {
    if (!this.esAdmin) return; // Protección extra
    this.esEdicion = true;
    this.idContratoEditar = c.id_contrato;
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
    this.mostrarModalCrear = true; 
  }

  cerrarModalCrear() { this.mostrarModalCrear = false; }

  guardarContrato() {
    if (!this.esAdmin) return; 
    const datosEnviar = { ...this.nuevoContrato, idArea: this.nuevoContrato.id_direccion_solicitante, idSupervisor: this.nuevoContrato.id_usuario_supervisor };

    if (this.esEdicion) {
      this.contratoService.updateContrato(this.idContratoEditar, datosEnviar).subscribe({
        next: () => { this.cerrarModalCrear(); this.cargarContratos(); Swal.fire('Éxito', 'Actualizado', 'success'); }
      });
    } else {
      this.contratoService.createContrato(datosEnviar).subscribe({
        next: () => { this.cerrarModalCrear(); this.cargarContratos(); Swal.fire('Éxito', 'Guardado', 'success'); }
      });
    }
  }

  verDetalle(c: any) { this.seleccionado = c; this.mostrarModalVer = true; }
  cerrarModalVer() { this.mostrarModalVer = false; this.seleccionado = null; }

  eliminar(id: number) {
    if (!this.esAdmin) return; // Bloqueo para Roberto
    Swal.fire({
      title: '¿Eliminar?', text: "No podrás revertirlo", icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, borrar', confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contratoService.deleteContrato(id).subscribe({
          next: () => { this.cargarContratos(); Swal.fire('Eliminado', 'Registro borrado', 'success'); }
        });
      }
    });
  }
}