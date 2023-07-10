import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { IonicStorageModule } from '@ionic/storage-angular';

import { LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt);

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    {
      provide: LOCALE_ID,
      useValue: 'pt'
    },

    /* if you don't provide the currency symbol in the pipe, 
    this is going to be the default symbol (R$) ... */
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'BRL'
    },

    importProvidersFrom(
      IonicModule.forRoot({}),
      HttpClientModule,
      IonicStorageModule.forRoot(),
    ),
    provideRouter(routes),
  ],
});
