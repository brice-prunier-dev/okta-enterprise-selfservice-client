import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OktaProfileComponent } from './ui/okta-profile.component';
import { AuthGuard } from '../_core';

const routes: Routes = [
    { path: '', pathMatch: 'full', component: OktaProfileComponent },
];

@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )
export class LoginRoutingModule { }
