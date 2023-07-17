import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export function getBaseApiUrl() {
    return environment.api.url;
}

export function getSignalRUrl() {
    return environment.api.signalr;
}

const providers = [
    { provide: 'BASE_URL', useFactory: getBaseApiUrl, deps: [] },
    { provide: 'SIGNALR_URL', useFactory: getSignalRUrl, deps: [] }
];
if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic(providers)
    .bootstrapModule(AppModule)
    .catch((err) => console.log(err));
