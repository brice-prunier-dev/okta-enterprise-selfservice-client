import { JoeLogger } from 'joe-fx';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectHomeComponent } from './ui/project-home.component';
import { ProjectAdminsComponent } from './controls/project-admins/project-admins.component';
import { ProjectRuntimeComponent } from './controls/project-runtime/project-runtime.component';
import { ProjectOwnershipComponent } from './controls/project-ownership/project-ownership.component';
import { ProjectHistoryComponent } from './controls/project-history/project-history.component';

@NgModule({
    imports: [CommonModule, SharedModule, ProjectsRoutingModule, ProjectsNavModule, ProjectHomeComponent,
        ProjectAdminsComponent,
        ProjectRuntimeComponent,
        ProjectOwnershipComponent,
        ProjectHistoryComponent]
})
export class ProjectsModule {}
