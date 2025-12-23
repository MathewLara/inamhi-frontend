import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  
  // 1. IMPORTANTE: Iniciamos en 'false' para que no aparezca el menú de golpe
  mostrarMenu: boolean = false; 
  
  mostrarPerfil: boolean = false;
  mostrarNotificaciones: boolean = false;
  mostrarModalEditar: boolean = false;

  // DATOS DEL USUARIO
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

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        
        // 2. CORRECCIÓN CLAVE: Usamos 'urlAfterRedirects' para mayor precisión
        // Esto asegura que si estás en '/login', la variable sea false.
        const urlReal = event.urlAfterRedirects || event.url;
        this.mostrarMenu = !urlReal.includes('/login');

        // 3. RECUPERAR DATOS DE LA MEMORIA (Solo si mostramos el menú)
        if (this.mostrarMenu) {
            const nombreGuardado = localStorage.getItem('usuarioNombre');
            const rolGuardado = localStorage.getItem('usuarioRol');
            const emailGuardado = localStorage.getItem('usuarioEmail');

            if (nombreGuardado) this.usuario.nombre = nombreGuardado;
            if (rolGuardado) this.usuario.rol = rolGuardado;
            if (emailGuardado) this.usuario.email = emailGuardado;
        }
      }
    });
  }

  togglePerfil() {
    this.mostrarPerfil = !this.mostrarPerfil;
    this.mostrarNotificaciones = false;
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    this.mostrarPerfil = false;
  }

  irA(ruta: string) {
    this.mostrarNotificaciones = false;
    this.router.navigate([ruta]);
  }

  logout() {
    this.mostrarPerfil = false;
    localStorage.clear();
    this.router.navigate(['/login']);
  }

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
    localStorage.setItem('usuarioNombre', this.usuario.nombre);
    localStorage.setItem('usuarioEmail', this.usuario.email);
    this.mostrarModalEditar = false;
    alert("✅ Perfil actualizado correctamente");
  }

  // --- ESCUCHA DE CLICS GLOBALES ---
  @HostListener('document:click', ['$event'])
  clickGlobal(event?: any) {
    // Si el clic no fue dentro del menú, cerramos los desplegables
    // (Angular maneja esto, pero aseguramos que se cierren al dar clic fuera)
    this.mostrarNotificaciones = false;
    this.mostrarPerfil = false;
  }
}