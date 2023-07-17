import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../_shared/shared.module';
import {LoginRoutingModule} from './login-routing.module';
// ────────────────────────────────────────────────────────────────────────────────
import {OktaProfileComponent} from './ui/okta-profile.component';

// ────────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [LoginRoutingModule, CommonModule, SharedModule],
    exports: [OktaProfileComponent],
    declarations: [OktaProfileComponent]
})
export class LoginModule {}
