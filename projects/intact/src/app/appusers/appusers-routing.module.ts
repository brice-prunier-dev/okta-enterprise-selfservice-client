import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppUserListComponent } from './ui/appuser-list.component';
import { AppUserListResolver } from './data/appuser-list.resolver';

// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
  { path: '', component: AppUserListComponent, resolve: { inputs: AppUserListResolver } },
];

// ────────────────────────────────────────────────────────────────────────────────


@NgModule( {
  imports: [ RouterModule.forChild( routes ) ],
  exports: [ RouterModule ]
} )
export class AppUsersRoutingModule { }
