import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppGroupLinkComponent } from './ui/appgroup-link.component';
import { AppResolver } from '../apps';

// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
    {
        path: '',
        component: AppGroupLinkComponent,
        resolve: { inputs: AppResolver },
    },
];

// ────────────────────────────────────────────────────────────────────────────────


@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )
export class AppGroupsRoutingModule { }
