import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { markedOptions } from './app/app.module';
import { environment } from './environments/environment';
import { IamComponent } from './app/_app/ui/iam.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { IamHelpComponent } from './app/_app/ui/iam-help/iam-help.component';
import { KpisResolver } from './app/_app/data/kpi-list.resolver';
import { IamProjectListComponent } from './app/_app/ui/iam-project-list/iam-project-list.component';
import { MyKpiResolver } from './app/_app/data/my-kpi-list.resolver';
import { ProjectsResolver } from './app/_core/data/projects/projects-list.resolver';
import { IamMyProjectsComponent } from './app/_app/ui/iam-my-projects/iam-my-projects.component';
import { HomeResolver } from './app/_app/data/app-home.resolver';
import { IamHomeComponent } from './app/_app/ui/iam-home/iam-home.component';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { SharedModule } from './app/_shared/shared.module';
import { CoreModule } from './app/_core/core.module';
import { TokenValidityInterceptor } from './app/_shared';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { version } from './app/app.version';
import { JoeLogger } from 'joe-fx';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { IAM_CONFIG, APP_VERSION, AuthGuard } from './app/_core';

const authConfig = Object.assign(new AuthConfig(), environment.iam, {
    requireHttps: false,
    showDebugInformation: true,
    sessionChecksEnabled: false
}) as AuthConfig;
// ────────────────────────────────────────────────────────────────────────────
const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    {
        path: 'home',
        component: IamHomeComponent,
        canActivate: [AuthGuard],
        resolve: { vm: HomeResolver }
    },
    {
        path: 'me',
        component: IamMyProjectsComponent,
        resolve: { input: ProjectsResolver, myKpis: MyKpiResolver },
        canActivate: [AuthGuard]
    },
    {
        path: 'gem',
        component: IamProjectListComponent,
        resolve: { input: KpisResolver, projects: ProjectsResolver },
        canActivate: [AuthGuard]
    },
    {
        path: 'projects',
        loadChildren: () => import("./app/projectsnav/projectsnav.module").then((m) => m.ProjectsNavModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'guides/:helpId',
        component: IamHelpComponent,
        canActivate: [AuthGuard],
        outlet: 'help'
    },
    {
        path: 'login',
        loadChildren: () => import("./app/login/login.module").then((m) => m.LoginModule),
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: 'me' } // bad routes redirect to HOME
];const renderer = new MarkedRenderer();



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

bootstrapApplication(IamComponent, {
    providers: [
        importProvidersFrom(CoreModule, SharedModule, BrowserModule, OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: [environment.api.url],
                sendAccessToken: true
            }
        }), MarkdownModule.forRoot({
            loader: HttpClient,
            markedOptions: { provide: MarkedOptions, useFactory: markedOptions }
        }), ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        })),
        { provide: IAM_CONFIG, useValue: authConfig },
        { provide: APP_VERSION, useValue: version },
        { provide: HTTP_INTERCEPTORS, useClass: TokenValidityInterceptor, multi: true },
        provideAnimations(),
        provideRouter(routes)
    ]
})
    .catch((err) => console.log(err));
