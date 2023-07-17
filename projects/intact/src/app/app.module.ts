// ────────────────────────────────────────────────────────────────────────────
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// ────────────────────────────────────────────────────────────────────────────
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';

// ────────────────────────────────────────────────────────────────────────────
import { AuthGuard, IAM_CONFIG, APP_VERSION } from './_core';
import { CoreModule } from './_core/core.module';
import { SharedModule } from './_shared/shared.module';
// ────────────────────────────────────────────────────────────────────────────
import { JoeLogger } from 'joe-fx';
// ────────────────────────────────────────────────────────────────────────────
import { environment } from '../environments/environment';
import { version } from './app.version';
import { ProjectsBarComponent } from './_app/controls/projects-bar.component';
import { NewProjectDialog } from './_app/dialogs/new-project/new-project.dialog';
import { HomeResolver } from './_app/data/app-home.resolver';
import { ProjectsResolver } from './_core/data/projects/projects-list.resolver';
import { IamComponent } from './_app/ui/iam.component';
import { IamHomeComponent } from './_app/ui/iam-home/iam-home.component';
import { IamHelpComponent } from './_app/ui/iam-help/iam-help.component';
import { IamMyProjectsComponent } from './_app/ui/iam-my-projects/iam-my-projects.component';
import { IamProjectListComponent } from './_app/ui/iam-project-list/iam-project-list.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { KpisResolver } from './_app/data/kpi-list.resolver';
import { TokenValidityInterceptor } from './_shared';
import { MyKpiResolver } from './_app/data/my-kpi-list.resolver';
// ────────────────────────────────────────────────────────────────────────────

const authConfig = Object.assign(new AuthConfig(), environment.iam, {
    requireHttps: false,
    showDebugInformation: true,
    sessionChecksEnabled: false
}) as AuthConfig;
JoeLogger.isProd = environment.production;
JoeLogger.env = environment.env;
JoeLogger.debug(environment);

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
        loadChildren: () =>
            import('./projectsnav/projectsnav.module').then((m) => m.ProjectsNavModule),
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
        loadChildren: () => import('./login/login.module').then((m) => m.LoginModule),
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: 'me' } // bad routes redirect to HOME
];

// ────────────────────────────────────────────────────────────────────────────

export function markedOptions(): MarkedOptions {
    const renderer = new MarkedRenderer();

    renderer.blockquote = (text: string) => {
        return '<blockquote class="blockquote"><p>' + text + '</p></blockquote>';
    };

    return { renderer };
}

// ────────────────────────────────────────────────────────────────────────────


