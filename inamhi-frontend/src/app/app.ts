import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  
  mostrarMenu: boolean = false; 
  mostrarPerfil: boolean = false;
  mostrarNotificaciones: boolean = false;
  mostrarModalEditar: boolean = false;

  usuario = { 
    nombre: 'Usuario', 
    rol: 'Invitado', 
    email: 'usuario@inamhi.gob.ec', 
    departamento: 'Tecnología (TICs)' 
  };
  
  usuarioTemporal: any = {};

  misNotificaciones = [
    { mensaje: '⚠️ El TDR-002 vence en 3 días', fecha: 'Hace 2 horas', ruta: '/tdr-lista' },
    { mensaje: '✅ Nuevo contrato registrado', fecha: 'Hace 5 horas', ruta: '/contratos' },
    { mensaje: '🔧 Mantenimiento de Server pendiente', fecha: 'Ayer', ruta: '/mantenimientos' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlReal = event.urlAfterRedirects || event.url;
        this.mostrarMenu = !urlReal.includes('/login');
        if (this.mostrarMenu) {
          this.cargarDatos();
        }
      }
    });
  }

  cargarDatos() {
    const data = localStorage.getItem('usuario');
    if (data) {
      try {
        const userObj = JSON.parse(data);
        this.usuario.nombre = userObj.nombre || userObj.nombres || 'Usuario';
        this.usuario.rol = userObj.rol || userObj.nombre_rol || 'Invitado';
        this.usuario.email = userObj.email || 'usuario@inamhi.gob.ec';
      } catch (e) {
        console.error("Error cargando datos", e);
      }
    }
  }

  togglePerfil(event?: Event) {
    if (event) event.stopPropagation();
    this.mostrarPerfil = !this.mostrarPerfil;
    this.mostrarNotificaciones = false;
  }

  toggleNotificaciones(event?: Event) {
    if (event) event.stopPropagation();
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    this.mostrarPerfil = false;
  }

  // --- FUNCIONES QUE FALTABAN PARA EL MODAL ---
  abrirEdicion() {
    this.usuarioTemporal = { ...this.usuario };
    this.mostrarPerfil = false;
    this.mostrarModalEditar = true;
  }

  cerrarEdicion() {
    this.mostrarModalEditar = false;
  }

  guardarCambios() {
    this.usuario = { ...this.usuarioTemporal };
    
    const existing = localStorage.getItem('usuario');
    let userObj = existing ? JSON.parse(existing) : {};
    
    userObj.nombre = this.usuario.nombre;
    userObj.email = this.usuario.email;
    
    localStorage.setItem('usuario', JSON.stringify(userObj));
    this.mostrarModalEditar = false;
    alert("✅ Perfil actualizado");
  }

  logout() {
    localStorage.clear();
    this.mostrarPerfil = false;
    this.router.navigate(['/login']);
  }
  irA(ruta: string) {
    this.mostrarNotificaciones = false;
    this.router.navigate([ruta]);
  }

  @HostListener('document:click')
  clickGlobal() {
    this.mostrarPerfil = false;
    this.mostrarNotificaciones = false;
  }
}