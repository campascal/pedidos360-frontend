import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {

  datosApi: any = null;

  constructor(private apiService: ApiService) {}

  consultarApi(): void {

    this.apiService.obtenerDatos().subscribe({

      next: (respuesta) => {
        this.datosApi = respuesta;
        console.log('RESPUESTA DEL BACKEND:', respuesta);
      },

      error: (error) => {
        console.error('ERROR AL CONSULTAR API:', error);
      }

    });

  }

}