import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsRoutingModule } from './admins-routing.module';
import { AdminListComponent } from './ui/admin-list.component';
import { JoeLogger } from 'joe-fx';
import { SharedModule } from '../_shared/shared.module';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';

@NgModule( {
    imports: [CommonModule, SharedModule, AdminsRoutingModule, ProjectsNavModule, AdminListComponent]
} )
export class AdminsModule {}
