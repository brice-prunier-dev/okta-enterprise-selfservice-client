import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ────────────────────────────────────────────────────────────────────────────────

import { AuthGuard } from '../_core';
import { GroupNewResolver } from './data/group-new.resolver';
import { GroupDetailResolver } from './data/group-detail.resolvers';
import { GroupAboutComponent } from './ui/group-about/group-about.component';
import { GroupDetailComponent } from './ui/group-detail/group-detail.component';
import { GroupHomeComponent } from './ui/group-home/group-home.component';
import { GroupNewComponent } from './ui/group-new/group-new.component';
import { MyKpiResolver } from '../_app/data/my-kpi-list.resolver';
import { GroupKpisComponent } from './ui/group-kpis/group-kpis.component';

// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
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
                loadChildren: () => import('../admins/admins.module').then((m) => m.AdminsModule),
                canActivate: [AuthGuard]
            }
        ]
    }
];

// ────────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GroupsRoutingModule {}
