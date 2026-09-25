import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://5q7f13rcmc.execute-api.us-east-1.amazonaws.com';

  constructor(private http: HttpClient) {}

  obtenerDatos(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/pedidos`
    );
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/productos`
    );
  }

}