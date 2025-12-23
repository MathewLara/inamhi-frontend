import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  
  listaUsuarios: any[] = [];
  usuarioSeleccionado: any = null; 
  passwordNueva: string = '';      

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
      },
      error: (e) => console.error(e)
    });
  }

  seleccionarUsuario(user: any) {
    this.usuarioSeleccionado = { ...user }; // Copia los datos
    this.passwordNueva = ''; // Limpia el campo contraseña
  }

  cancelarEdicion() {
    this.usuarioSeleccionado = null;
  }

  guardar() {
    if (!this.usuarioSeleccionado) return;

    const datosActualizar = {
      ...this.usuarioSeleccionado,
      password: this.passwordNueva 
    };

    this.usuarioService.updateUsuario(this.usuarioSeleccionado.id, datosActualizar).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
        this.usuarioSeleccionado = null; 
        this.cargarUsuarios(); 
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar.', 'error');
      }
    });
  }
}