import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../_shared/shared.module';
// ────────────────────────────────────────────────────────────────────────────────
import {JoeLogger} from 'joe-fx';
import {ProjectsModule} from '../projects/projects.module';
import {AppsModule} from '../apps/apps.module';
import {GroupsModule} from '../groups/groups.module';
import {ProjectsNavModule} from '../projectsnav/projectsnav.module';
// ────────────────────────────────────────────────────────────────────────────────
import {AppUsersRoutingModule} from './appusers-routing.module';
// ────────────────────────────────────────────────────────────────────────────────
import {AppUserListComponent} from './ui/appuser-list.component';
// ────────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AppUsersRoutingModule,
        ProjectsModule,
        ProjectsNavModule,
        AppsModule,
        GroupsModule,
        ProjectsNavModule,
        AppUserListComponent,
    ]
})
export class AppUsersModule {}
