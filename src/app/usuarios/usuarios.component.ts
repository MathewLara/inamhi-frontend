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
  mostrarModal = false;

  // Objeto para crear nuevo usuario (coincide con tu DB)
  nuevoUsuario = {
    nombres: '',
    apellidos: '',
    username: '',
    password: '',
    email: '',
    cargo: '',
    id_rol: 2 // Por defecto 2 (Técnico). Revisa tu tabla 'roles' si los IDs son 1, 2, 3...
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(res => {
      this.listaUsuarios = res;
    });
  }

  guardarUsuario() {
    if(!this.nuevoUsuario.username || !this.nuevoUsuario.password || !this.nuevoUsuario.nombres) {
      Swal.fire('Error', 'Completa los datos obligatorios', 'warning');
      return;
    }

    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        this.mostrarModal = false;
        this.cargarUsuarios();
        this.limpiarForm();
      },
      error: (err) => Swal.fire('Error', err.error.error || 'No se pudo crear', 'error')
    });
  }

  // CAMBIO DE CONTRASEÑA RÁPIDO
  cambiarPass(usuario: any) {
    Swal.fire({
      title: `Cambiar clave a ${usuario.username}`,
      input: 'password',
      inputLabel: 'Ingresa la nueva contraseña',
      inputPlaceholder: 'Nueva contraseña...',
      showCancelButton: true,
      confirmButtonText: 'Guardar cambio',
      confirmButtonColor: '#003366'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.usuarioService.cambiarPassword(usuario.id_usuario, result.value).subscribe({
            next: () => Swal.fire('Listo', 'Contraseña actualizada', 'success'),
            error: () => Swal.fire('Error', 'No se pudo cambiar la clave', 'error')
        });
      }
    });
  }
  
  eliminar(id: number) {
      Swal.fire({
          title: '¿Estás seguro?',
          text: "El usuario ya no podrá acceder",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar'
      }).then((result) => {
          if (result.isConfirmed) {
              this.usuarioService.eliminarUsuario(id).subscribe(() => {
                  this.cargarUsuarios();
                  Swal.fire('Eliminado', '', 'success');
              });
          }
      });
  }

  limpiarForm() {
    this.nuevoUsuario = { nombres: '', apellidos: '', username: '', password: '', email: '', cargo: '', id_rol: 2 };
  }
}