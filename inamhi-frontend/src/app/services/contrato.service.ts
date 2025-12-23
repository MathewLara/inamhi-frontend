import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  // URL del Backend
  private apiUrl = 'http://localhost:3000/api/contratos';
  private apiCatalogos = 'http://localhost:3000/api/catalogos'; 

  constructor(private http: HttpClient) { }

  // ==============================================================
  // 1. OBTENER LISTAS (Para Tabla y Selects)
  // ==============================================================

  // Obtener todos los contratos
  getContratos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // ✅ ESTA ES LA QUE NECESITAS PARA LOS SELECTS
  getCatalogos(): Observable<any> {
    return this.http.get<any>(this.apiCatalogos);
  }

  // ==============================================================
  // 2. ACCIONES DE GESTIÓN (Crear, Editar, Borrar)
  // ==============================================================

  // Crear contrato nuevo
  createContrato(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Eliminar contrato (Probablemente tu lista lo está buscando y por eso da error)
  deleteContrato(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Actualizar Estado (Aprobar/Finalizar)
  updateEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { nuevoEstado });
  }

  // ==============================================================
  // 3. ACCIONES DE OPERATIVO (Archivos)
  // ==============================================================

  // Subir PDF
  subirEntregable(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
}