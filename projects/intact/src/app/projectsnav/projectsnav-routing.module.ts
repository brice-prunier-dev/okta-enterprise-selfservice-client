import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyKpiResolver } from '../_app/data/my-kpi-list.resolver';
import { AuthGuard } from '../_core';
import { ProjectDetailResolver } from './data/project-detail.resolver';
import { ProjectComponent } from './ui/project.component';
// ────────────────────────────────────────────────────────────────────────────────


const routes: Routes = [
    {
        path: ':projId',
        children: [
            {
                path: '',
                component: ProjectComponent,
                pathMatch: 'prefix',
                resolve: { inputs: ProjectDetailResolver, myKpis: MyKpiResolver },
                outlet: 'nav-outlet',
            },
            {
                path: 'home',
                loadChildren: () => import( '../projects/projects.module' )
                    .then( m => m.ProjectsModule )
            },
            {
                path: 'apps',
                pathMatch: 'prefix',
                loadChildren: () => import( '../apps/apps.module' ).then( m => m.AppsModule ),
                canActivate: [ AuthGuard ]
            },
            {
                path: 'groups',
                loadChildren: () => import( '../groups/groups.module' ).then( m => m.GroupsModule ),
                canActivate: [ AuthGuard ]
            },
            {
                path: 'scopes',
                loadChildren: () => import( '../scopes/scopes.module' ).then( m => m.ScopesModule ),
                canActivate: [ AuthGuard ]
            }
        ]
    }
];


@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )
export class ProjectsNavRoutingModule { }
