import {Routes} from '@angular/router';
import {MyKpiResolver} from '../_app';
import {AuthGuard} from '../_core';
import {AppNewResolver} from './data/app-new.resolver';
import {AppResolver} from './data/app.resolver';
import {AppAboutComponent} from './ui/app-about/app-about.component';
import {AppDetailComponent} from './ui/app-detail/app-detail.component';
import {AppHomeComponent} from './ui/app-home/app-home.component';
import {AppKpisComponent} from './ui/app-kpis/app-kpis.component';
import {AppNewComponent} from './ui/app-new/app-new.component';

export const APPS_ROUTES: Routes = [
    {
        path: 'new',
        component: AppNewComponent,
        resolve: { inputs: AppNewResolver },
        canActivate: [AuthGuard]
    },
    {
        path: ':appId',
        pathMatch: 'prefix',
        component: AppHomeComponent,
        resolve: { inputs: AppResolver, myKpis: MyKpiResolver },
        children: [
            {
                path: 'details',
                component: AppDetailComponent,
                resolve: { inputs: AppResolver },
                canActivate: [AuthGuard]
            },
            {
                path: 'groups',
                loadChildren: () =>
                    import('../appgroups/appgroups.routes').then((m) => m.APPGROUPS_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'users',
                loadChildren: () =>
                    import('../appusers/appusers.routes').then((m) => m.APPUSERS_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'apis',
                loadChildren: () =>
                    import('../appapis/appapis.routes').then((m) => m.APPAPIS_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'defs',
                component: AppAboutComponent,
                resolve: { inputs: AppResolver },
                canActivate: [AuthGuard]
            },
            {
                path: 'admins',
                loadChildren: () => import('../admins/admins.routes').then((m) => m.ADMINS_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'appusages',
                loadChildren: () =>
                    import('../appusages/appusages.routes').then((m) => m.APPUSAGES_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'warnings',
                component: AppKpisComponent,
                resolve: { inputs: AppResolver, myKpis: MyKpiResolver },
                canActivate: [AuthGuard]
            }
        ]
    }
];
