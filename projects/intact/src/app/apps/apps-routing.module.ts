import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_core';
import { AppResolver } from './data/app.resolver';
import { AppNewResolver } from './data/app-new.resolver';
import { AppDetailComponent } from './ui/app-detail/app-detail.component';
import { AppAboutComponent } from './ui/app-about/app-about.component';
import { AppHomeComponent } from './ui/app-home/app-home.component';
import { AppNewComponent } from './ui/app-new/app-new.component';
import { AppKpisComponent } from './ui/app-kpis/app-kpis.component';
import { MyKpiResolver } from '../_app/data/my-kpi-list.resolver';

const routes: Routes = [
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
                    import('../appgroups/appgroups.module').then((m) => m.AppGroupsModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'users',
                loadChildren: () =>
                    import('../appusers/appusers.module').then((m) => m.AppUsersModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'apis',
                loadChildren: () =>
                    import('../appapis/appapis.module').then((m) => m.AppApisModule),
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
                loadChildren: () => import('../admins/admins.module').then((m) => m.AdminsModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'appusages',
                loadChildren: () =>
                    import('../appusages/appusages.module').then((m) => m.AppUsagesModule),
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

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppsRoutingModule {}
