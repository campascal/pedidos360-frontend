
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface NuevoPedido {
  producto: string
  cantidad: number
  total: number
}

export interface Producto {
  id?: number
  nombre: string
  precio: number
  categoria: string
  descripcion: string
  imagen: string
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

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(
      `${this.apiUrl}/api/productos`
    )
  }

  crearPedido(pedido: NuevoPedido): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/pedidos`,
      pedido
    )
  }

  agregarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(
      `${this.apiUrl}/api/productos`,
      producto
    )
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(
      `${this.apiUrl}/api/productos/${id}`,
      producto
    )
  }

  eliminarProductoAdmin(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/productos/${id}`
    )
  }
}
