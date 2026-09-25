import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, SilentRequest } from '@azure/msal-browser';

import { loginRequest } from './auth-config';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'Pedidos360';
  usuario: string | null = null;
  accessToken: string | null = null;
  datosApi: any = null;
  productos: any = null;

  constructor(
    private authService: MsalService,
    private apiService: ApiService
  ) { }

  async ngOnInit(): Promise<void> {

    await this.authService.instance.initialize();

    const response = await this.authService.instance.handleRedirectPromise();

    if (response?.account) {
      this.authService.instance.setActiveAccount(response.account);
    }

    const cuentaActiva =
      this.authService.instance.getActiveAccount() ??
      this.authService.instance.getAllAccounts()[0];

    if (cuentaActiva) {

      this.authService.instance.setActiveAccount(cuentaActiva);
      this.usuario = cuentaActiva.username;

      const tokenRequest: SilentRequest = {
        scopes: loginRequest.scopes,
        account: cuentaActiva
      };

      try {

        const tokenResponse: AuthenticationResult =
          await this.authService.instance.acquireTokenSilent(tokenRequest);

        this.accessToken = tokenResponse.accessToken;

        console.log(
          'ACCESS TOKEN OBTENIDO CORRECTAMENTE:',
          !!this.accessToken
        );

        const payload = JSON.parse(
          atob(this.accessToken.split('.')[1])
        );

        console.log('ISS DEL TOKEN:', payload.iss);
        console.log('AUD DEL TOKEN:', payload.aud);
        console.log('SCOPE DEL TOKEN:', payload.scp);

      } catch (error) {

        console.error(
          'Error al obtener el Access Token:',
          error
        );

      }
    }
  }

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

  consultarProductos(): void {

    this.apiService.obtenerProductos().subscribe({

      next: (respuesta) => {
        this.productos = respuesta;
        console.log('RESPUESTA DE PRODUCTOS:', respuesta);
      },

      error: (error) => {
        console.error('ERROR AL CONSULTAR PRODUCTOS:', error);
      }

    });

  }

  iniciarSesion(): void {

    this.authService.loginRedirect(loginRequest).subscribe({

      error: (error) =>
        console.error('Error al iniciar sesión:', error)

    });

  }

  cerrarSesion(): void {

    this.authService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });

  }

}