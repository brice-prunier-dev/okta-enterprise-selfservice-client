import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminListComponent } from './ui/admin-list.component';
import { AuthGuard } from '../_core';
import { AdminsResolver } from './data/admins.resolver';

// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
  { path: '', component: AdminListComponent, resolve: { inputs: AdminsResolver }, canActivate: [ AuthGuard ] },
];

// ────────────────────────────────────────────────────────────────────────────────


@NgModule( {
  imports: [ RouterModule.forChild( routes ) ],
  exports: [ RouterModule ]
} )
export class AdminsRoutingModule { }
