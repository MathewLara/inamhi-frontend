import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  
  // Usaremos esta ruta estándar. 
  // SI SIGUE DANDO ERROR 404: Significa que te falta registrar la ruta en el index.js del backend.
  private apiUrl = 'http://localhost:3000/api/mantenimientos'; 

  constructor(private http: HttpClient) { }

  getMantenimientos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createMantenimiento(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { nuevoEstado });
  }
}