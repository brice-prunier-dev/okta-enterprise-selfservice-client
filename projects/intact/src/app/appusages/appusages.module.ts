import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { JoeLogger } from 'joe-fx';
import { SharedModule } from '../_shared/shared.module';

// ────────────────────────────────────────────────────────────────────────────
import { AppUsagesRoutingModule } from './appusages-routing.module';
import { ProjectsNavModule } from '../projectsnav/projectsnav.module';
// ────────────────────────────────────────────────────────────────────────────

import { AppUsagesMonthlyComponent } from './controls/app-usages-monthly/app-usages-monthly.component';
import { AppUsagesDailyComponent } from './controls/app-usages-daily/app-usages-daily.component';
import { AppUsagesHourlyComponent } from './controls/app-usages-hourly/app-usages-hourly.component';

import { UserUsagesMonthlyComponent } from './controls/user-usages-monthly/user-usages-monthly.component';
import { UserUsagesDailyComponent } from './controls/user-usages-daily/user-usages-daily.component';
import { UserUsagesHourlyComponent } from './controls/user-usages-hourly/user-usages-hourly.component';

import { AppUsagesDetailComponent } from './ui/app-usages-detail.component';
// ────────────────────────────────────────────────────────────────────────────

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NgChartsModule,
        ProjectsNavModule,
        AppUsagesRoutingModule,
        AppUsagesDailyComponent,
        AppUsagesMonthlyComponent,
        AppUsagesHourlyComponent,
        AppUsagesDetailComponent,
        UserUsagesMonthlyComponent,
        UserUsagesDailyComponent,
        UserUsagesHourlyComponent
    ]
})
export class AppUsagesModule {}
