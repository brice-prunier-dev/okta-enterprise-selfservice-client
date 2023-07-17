import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';
// ────────────────────────────────────────────────────────────────────────────────
import { JoeLogger } from 'joe-fx';
import { ProjectsModule } from '../projects/projects.module';
import { AppsModule } from '../apps/apps.module';
// ────────────────────────────────────────────────────────────────────────────────
import { AppGroupsRoutingModule } from './appgroups-routing.module';
// ────────────────────────────────────────────────────────────────────────────────
import { AppGroupLinkComponent } from './ui/appgroup-link.component';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
// ────────────────────────────────────────────────────────────────────────────────

@NgModule( {

    imports: [
        CommonModule,
        SharedModule,
        AppGroupsRoutingModule,
        ProjectsNavModule,
        ProjectsModule,
        AppsModule
    ],
    exports: [
        AppGroupLinkComponent
    ],
    declarations: [
        AppGroupLinkComponent
    ]
} )
export class AppGroupsModule {
    constructor() {
        JoeLogger.header( 'AppGroupsModule' );
    }
}
