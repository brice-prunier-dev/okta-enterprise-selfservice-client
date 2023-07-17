// ────────────────────────────────────────────────────────────────────────────────
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';
import { JoeLogger } from 'joe-fx';
// ────────────────────────────────────────────────────────────────────────────────
// import { UserListResolver } from './data/user-list.resolver';
// ──────────────────────────────────────────────────────────────────
// import { UserListComponent } from './ui/user-list.component';
import { UserEditorDialog } from './dialogs/user-editor/user-editor.dialog';
// ──────────────────────────────────────────────────────────────────
import { GroupsRoutingModule } from './groups-routing.module';
import { GroupHomeComponent } from './ui/group-home/group-home.component';
import { GroupDetailComponent } from './ui/group-detail/group-detail.component';
import { GroupNewComponent } from './ui/group-new/group-new.component';
import { GroupAboutComponent } from './ui/group-about/group-about.component';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
import { GroupKpisComponent } from './ui/group-kpis/group-kpis.component';
// ────────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [CommonModule, SharedModule, GroupsRoutingModule, ProjectsNavModule],
    exports: [UserEditorDialog],
    declarations: [
        GroupDetailComponent,
        GroupHomeComponent,
        UserEditorDialog,
        GroupNewComponent,
        GroupAboutComponent,
        GroupKpisComponent,
    ]
})
export class GroupsModule {
    constructor() {
        JoeLogger.header('GroupsModule');
    }
}
