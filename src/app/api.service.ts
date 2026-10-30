
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface NuevoPedido {
  producto: string
  cantidad: number
  total: number
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://5q7f13rcmc.execute-api.us-east-1.amazonaws.com'

  constructor(private http: HttpClient) {}

  obtenerDatos(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/pedidos`
    )
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/productos`
    )
  }

  crearPedido(pedido: NuevoPedido): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/pedidos`,
      pedido
    )
  }
}
