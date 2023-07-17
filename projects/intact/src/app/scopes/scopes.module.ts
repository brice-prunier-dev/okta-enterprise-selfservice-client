import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';
// ────────────────────────────────────────────────────────────────────────────────

import { ScopesRoutingModule } from './scopes-routing.module';
// ────────────────────────────────────────────────────────────────────────────────
import { ScopesService } from './data/scopes.service';
import { ScopeListResolver } from './data/scope-list.resolver';
import { JoeLogger } from 'joe-fx';
import { ScopeDetailComponent } from './ui/scope-detail.component';
import { ScopeResolver } from './data/scope.resolver';
import { ScopeNewComponent } from './ui/scope-new.component';
import { ScopeNewResolver } from './data/scope-new.resolver';
import { ScopeAboutComponent } from './ui/scope-about.component';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
import { ScopeHomeComponent } from './ui/scope-home.component';
import { ScopeWarningsComponent } from './ui/scope-warnings.component';
// ────────────────────────────────────────────────────────────────────────────────

@NgModule( {
    imports: [CommonModule, SharedModule, ScopesRoutingModule, ProjectsNavModule, ScopeHomeComponent,
        ScopeDetailComponent,
        ScopeNewComponent,
        ScopeAboutComponent,
        ScopeWarningsComponent]
} )
export class ScopesModule {
    constructor() {
        JoeLogger.header( 'ScopesModule' );
    }
}
