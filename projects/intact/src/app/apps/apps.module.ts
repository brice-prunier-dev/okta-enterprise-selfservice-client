import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { JoeLogger } from 'joe-fx';
import { SharedModule } from '../_shared/shared.module';
// ────────────────────────────────────────────────────────────────────────────
import { AppsRoutingModule } from './apps-routing.module';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
// ────────────────────────────────────────────────────────────────────────────
import { AppSamlComponent } from './controls/app-saml/app-saml.component';
import { AppServiceComponent } from './controls/app-service/app-service.component';
import { AppBrowserComponent } from './controls/app-browser/app-browser.component';
import { AppNativeComponent } from './controls/app-native/app-native.component';
import { AppWebComponent } from './controls/app-web/app-web.component';
import { AppDetailComponent } from './ui/app-detail/app-detail.component';
import { AppNewComponent } from './ui/app-new/app-new.component';
import { AppAboutComponent } from './ui/app-about/app-about.component';
import { AppHomeComponent } from './ui/app-home/app-home.component';
import { AppKpisComponent } from './ui/app-kpis/app-kpis.component';
// ────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [CommonModule, SharedModule, AppsRoutingModule, ProjectsNavModule, AppDetailComponent,
        AppNewComponent,
        AppServiceComponent,
        AppSamlComponent,
        AppBrowserComponent,
        AppNativeComponent,
        AppWebComponent,
        AppAboutComponent,
        AppHomeComponent,
        AppKpisComponent],
    exports: [AppDetailComponent, AppHomeComponent],
    providers: [
        DatePipe
    ]
})
export class AppsModule {}
