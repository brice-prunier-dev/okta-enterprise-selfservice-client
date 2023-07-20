import {Routes} from '@angular/router';
import {MyKpiResolver} from '../_app';
import {AuthGuard} from '../_core';
import {ProjectDetailResolver} from './data/project-detail.resolver';


export const PROJECTSNAV_ROUTES: Routes = [
    {
        path: ':projId',
        children: [
            {
                path: '',
                loadComponent: () => import('./ui/project.component').then(c => c.ProjectComponent),
                pathMatch: 'prefix',
                resolve: {inputs: ProjectDetailResolver, myKpis: MyKpiResolver},
                outlet: 'nav-outlet',
            },
            {
                path: 'home',
                loadChildren: () => import('../projects/projects.routes')
                    .then(m => m.PROJECTS_ROUTES)
            },
            {
                path: 'apps',
                pathMatch: 'prefix',
                loadChildren: () => import('../apps/apps.routes').then(m => m.APPS_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'groups',
                loadChildren: () => import('../groups/groups.routes').then(m => m.GROUPS_ROUTES),
                canActivate: [AuthGuard]
            },
            {
                path: 'scopes',
                loadChildren: () => import('../scopes/scopes.routes').then(m => m.SCOPES_ROUTES),
                canActivate: [AuthGuard]
            }
        ]
    }
];
