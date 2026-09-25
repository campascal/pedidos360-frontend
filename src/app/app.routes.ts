import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { PedidosComponent } from './pedidos/pedidos.component';

export const routes: Routes = [
  {
    path: 'pedidos',
    component: PedidosComponent,
    canActivate: [MsalGuard]
  }
];