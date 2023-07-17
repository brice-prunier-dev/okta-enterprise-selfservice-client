import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';
// ────────────────────────────────────────────────────────────────────────────────
import { JoeLogger } from 'joe-fx';

// ────────────────────────────────────────────────────────────────────────────────
import { ProjectsModule } from '../projects/projects.module';
import { AppApisRoutingModule } from './appapis-routing.module';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
import { AppsModule } from '../apps/apps.module';
// ────────────────────────────────────────────────────────────────────────────────
import { ApiInfoDialog } from './dialogs/api-info/api-info.dialog';
import { ScopesSubscriptionDialog } from './dialogs/scopes-subscriptions/scopes-subscriptions.dialog';
import { AppSubscriptionsComponent } from './controls/app-subscriptions/app-subscriptions.component';
import { AppGroupSubscriptionsComponent } from './controls/group-subscriptions/group-subscriptions.component';
import { AppSwaggerApisComponent } from './controls/swagger-apis/swagger-apis.component';
import { AppSubscriptionsPage } from './ui/app-apis.page';
// ────────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AppApisRoutingModule,
        ProjectsNavModule,
        ProjectsModule,
        AppsModule,
        AppSubscriptionsPage,
        AppGroupSubscriptionsComponent,
        AppSubscriptionsComponent,
        AppSwaggerApisComponent,
        ScopesSubscriptionDialog,
        ApiInfoDialog
    ],
    exports: [AppSubscriptionsComponent]
})
export class AppApisModule {}
