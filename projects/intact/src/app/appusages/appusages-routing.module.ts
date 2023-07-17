import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_core';
import { AppUsagesResolver } from './data/app-usages.resolver';
// ────────────────────────────────────────────────────────────────────────────────

import { AppUsagesDetailComponent } from './ui/app-usages-detail.component';
// ────────────────────────────────────────────────────────────────────────────────

const routes: Routes = [
    {
        path: '',
        component: AppUsagesDetailComponent,
        resolve: { inputs: AppUsagesResolver },
        canActivate: [AuthGuard]
    }
];

// ────────────────────────────────────────────────────────────────────────────────
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppUsagesRoutingModule {
    
}
