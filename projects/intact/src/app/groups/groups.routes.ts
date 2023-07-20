import {Routes} from '@angular/router';
import {MyKpiResolver} from '../_app';
import {AuthGuard} from '../_core';
import {GroupDetailResolver} from './data/group-detail.resolvers';
import {GroupNewResolver} from './data/group-new.resolver';
import {GroupAboutComponent} from './ui/group-about/group-about.component';
import {GroupDetailComponent} from './ui/group-detail/group-detail.component';
import {GroupHomeComponent} from './ui/group-home/group-home.component';
import {GroupKpisComponent} from './ui/group-kpis/group-kpis.component';
import {GroupNewComponent} from './ui/group-new/group-new.component';

export const GROUPS_ROUTES: Routes = [
    // { path: '', component: UserListComponent, resolve: { inputs: UserListResolver } },
    {
        path: 'new',
        component: GroupNewComponent,
        resolve: { inputs: GroupNewResolver },
        canActivate: [AuthGuard]
    },
    {
        path: ':grpId',
        pathMatch: 'prefix',
        component: GroupHomeComponent,
        resolve: { inputs: GroupDetailResolver, myKpis: MyKpiResolver },
        children: [
            {
                path: 'details',
                component: GroupDetailComponent,
                resolve: { inputs: GroupDetailResolver },
                canActivate: [AuthGuard]
            },
            {
                path: 'defs',
                component: GroupAboutComponent,
                resolve: { inputs: GroupDetailResolver },
                canActivate: [AuthGuard]
            },
            {
                path: 'warnings',
                component: GroupKpisComponent,
                resolve: { inputs: GroupDetailResolver, myKpis: MyKpiResolver },
                canActivate: [AuthGuard]
            },
            {
                path: 'admins',
                loadChildren: () => import('../admins/admins.routes').then((m) => m.ADMINS_ROUTES),
                canActivate: [AuthGuard]
            }
        ]
    }
];