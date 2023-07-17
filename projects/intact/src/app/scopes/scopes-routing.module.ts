import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScopeDetailComponent } from './ui/scope-detail.component';
import { ScopeResolver } from './data/scope.resolver';
import { AuthGuard } from '../_core/services/auth.guard';
import { ScopeNewComponent } from './ui/scope-new.component';
import { ScopeNewResolver } from './data/scope-new.resolver';
import { ScopeAboutComponent } from './ui/scope-about.component';
import { ScopeHomeComponent } from './ui/scope-home.component';
import { ScopeWarningsComponent } from './ui/scope-warnings.component';
import { MyKpiResolver } from '../_app/data/my-kpi-list.resolver';


// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
    {
        path: 'new', component: ScopeNewComponent, resolve: { inputs: ScopeNewResolver }, canActivate: [ AuthGuard ]
    },
    {
        path: ':scpId',
        pathMatch: 'prefix',
        component: ScopeHomeComponent,
        resolve: { inputs: ScopeResolver, myKpis: MyKpiResolver },
        children: [
            {
                path: 'warnings',
                component: ScopeWarningsComponent,
                resolve: { inputs: ScopeResolver, myKpis: MyKpiResolver },
                canActivate: [ AuthGuard ],
            },
            {
                path: 'details',
                component: ScopeDetailComponent,
                resolve: { inputs: ScopeResolver },
                canActivate: [ AuthGuard ],
            },
            {
                path: 'defs',
                component: ScopeAboutComponent,
                resolve: { inputs: ScopeResolver },
                canActivate: [ AuthGuard ],
            },
            {
                path: 'admins',
                loadChildren: () => import( '../admins/admins.module' ).then( m => m.AdminsModule ),
                canActivate: [ AuthGuard ]
            }
        ]
    }

];

// ────────────────────────────────────────────────────────────────────────────────


@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )
export class ScopesRoutingModule { }
