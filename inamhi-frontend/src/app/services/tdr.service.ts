import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TdrService {

  // Asegúrate de que esta URL coincida con tu backend
  private apiUrl = 'http://localhost:3000/api/tdrs'; 

  constructor(private http: HttpClient) { }

  // 1. OBTENER TODOS
  getTdrs(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // 2. CREAR NUEVO
  createTdr(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 3. EDITAR (Lo que te faltaba)
  updateTdr(id: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // 4. ELIMINAR (Lo que te dio error)
  deleteTdr(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 5. OBTENER CATALOGOS (Para los selectores)
  getCatalogos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalogos`);
  }
}