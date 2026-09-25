import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import { routes } from './app.routes';
import { msalInstance } from './auth-config';

import {
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MSAL_GUARD_CONFIG,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalGuard,
  MsalGuardConfiguration,
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import { InteractionType } from '@azure/msal-browser';


export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {

  const protectedResourceMap = new Map<string, Array<string>>();

  protectedResourceMap.set(
    'https://5q7f13rcmc.execute-api.us-east-1.amazonaws.com/api/pedidos',
    [
      'api://555d2758-7b9d-4390-8e69-7853cbf17070/access_as_user'
    ]
  );

  protectedResourceMap.set(
    'https://5q7f13rcmc.execute-api.us-east-1.amazonaws.com/api/productos',
    [
      'api://555d2758-7b9d-4390-8e69-7853cbf17070/access_as_user'
    ]
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}


export function MSALGuardConfigFactory(): MsalGuardConfiguration {

  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [
        'api://555d2758-7b9d-4390-8e69-7853cbf17070/access_as_user'
      ]
    }
  };

}


export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    MsalService,

    MsalBroadcastService,

    MsalGuard,

    {
      provide: MSAL_INSTANCE,
      useValue: msalInstance
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }

  ]

};