import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoeLogger } from 'joe-fx';

import { SharedModule } from '../_shared/shared.module';
import { ProjectsNavRoutingModule } from './projectsnav-routing.module';
import { ProjectComponent } from './ui/project.component';
import { ProjectSelectorComponent } from './controls/project-selector/project-selector.component';
import { RenamingDialogComponent } from './dialogs/renaming-dialog/renaming-dialog.component';
import { ItemAdminListComponent } from './controls/item-admin-list/item-admin-list.component';
import { UserProvisionningComponent } from './controls/member-actions/member-actions.component';
import { UserLabelHighlightComponent } from './controls/user-label-highlight.component';

@NgModule({
    imports: [CommonModule, SharedModule, ProjectsNavRoutingModule, ItemAdminListComponent,
        UserProvisionningComponent,
        ProjectComponent,
        ProjectSelectorComponent,
        RenamingDialogComponent,
        UserLabelHighlightComponent],
    exports: [
        ItemAdminListComponent,
        UserProvisionningComponent,
        ProjectComponent,
        ProjectSelectorComponent,
        UserLabelHighlightComponent
    ]
})
export class ProjectsNavModule {}
