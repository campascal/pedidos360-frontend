import {
  BrowserCacheLocation,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: '9f69979b-4f6a-44b1-ab5c-1c866d4e0cdc',
    authority: 'https://login.microsoftonline.com/8884e1d0-1e66-4d1e-b302-2531ab2fb9d2',

    // Usa automáticamente localhost o la URL de Amplify,
    // dependiendo de dónde esté ejecutándose la aplicación.
    redirectUri: window.location.origin
  },

  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage
  },

  system: {
    loggerOptions: {
      loggerCallback: (
        logLevel: LogLevel,
        message: string,
        containsPii: boolean
      ) => {
        if (!containsPii) {
          console.log(message);
        }
      },
      logLevel: LogLevel.Info
    }
  }
});

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    'api://555d2758-7b9d-4390-8e69-7853cbf17070/access_as_user'
  ]
};