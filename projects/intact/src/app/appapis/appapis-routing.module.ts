import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────────
import { ApiSubscriptionsResolver } from './data/app-subscriptions.resolver';
import { AppSubscriptionsPage } from './ui/app-apis.page';
// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
    { path: '', component: AppSubscriptionsPage, resolve: { inputs: ApiSubscriptionsResolver } }
];

// ────────────────────────────────────────────────────────────────────────────────
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppApisRoutingModule {}
