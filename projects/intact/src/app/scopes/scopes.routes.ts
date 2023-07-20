import {Routes} from '@angular/router';
import {MyKpiResolver} from '../_app';
import {AuthGuard} from '../_core';
import {ScopeNewResolver} from './data/scope-new.resolver';
import {ScopeResolver} from './data/scope.resolver';
import {ScopeAboutComponent} from './ui/scope-about.component';
import {ScopeDetailComponent} from './ui/scope-detail.component';
import {ScopeHomeComponent} from './ui/scope-home.component';
import {ScopeNewComponent} from './ui/scope-new.component';
import {ScopeWarningsComponent} from './ui/scope-warnings.component';

export const SCOPES_ROUTES: Routes = [
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
                loadChildren: () => import( '../admins/admins.routes' ).then( m => m.ADMINS_ROUTES ),
                canActivate: [ AuthGuard ]
            }
        ]
    }

];