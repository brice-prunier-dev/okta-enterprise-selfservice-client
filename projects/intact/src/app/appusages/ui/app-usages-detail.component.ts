import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommandNotification } from 'joe-viewmodels';
import { AppViewModel } from '../../apps';
import { AppUsagesContext } from '../data/app-usages.context';
import { AppUsagesDataInput } from '../data/types';
import { UserUsagesContext } from '../data/user-usage.context';
import { ProjectDetailViewModel } from '../../projectsnav';
import { UserUsagesHourlyComponent } from '../controls/user-usages-hourly/user-usages-hourly.component';
import { UserUsagesDailyComponent } from '../controls/user-usages-daily/user-usages-daily.component';
import { UserUsagesMonthlyComponent } from '../controls/user-usages-monthly/user-usages-monthly.component';
import { AppUsagesHourlyComponent } from '../controls/app-usages-hourly/app-usages-hourly.component';
import { AppUsagesDailyComponent } from '../controls/app-usages-daily/app-usages-daily.component';
import { AppUsagesMonthlyComponent } from '../controls/app-usages-monthly/app-usages-monthly.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ErrorComponent } from '../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'iam-app-usages-detail',
    templateUrl: './app-usages-detail.component.html',
    styleUrls: ['./app-usages-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, ErrorComponent, MatTabsModule, MatIconModule, MatTooltipModule, AppUsagesMonthlyComponent, AppUsagesDailyComponent, AppUsagesHourlyComponent, UserUsagesMonthlyComponent, UserUsagesDailyComponent, UserUsagesHourlyComponent]
})
export class AppUsagesDetailComponent implements OnInit {
    public error: any;
    public runningOp: string | undefined;
    public graphView = 'graph-runtime';
    public selectedIndex: number | null = null;
    public searching = false;

    public projVm!: ProjectDetailViewModel;
    public appVm!: AppViewModel;
    public usrCdhCtx!: UserUsagesContext;
    public appCdhCtx!: AppUsagesContext;

    public get initialized(): boolean {
        return this.appVm?.loaded;
    }

    public get withError(): boolean {
        return !!this.appVm.error;
    }

    public get running(): boolean {
        return !!this.runningOp || (this.initialized && this.appVm.running);
    }

    constructor(private _cd: ChangeDetectorRef, titleService: Title, route: ActivatedRoute) {
        const self = this;
        firstValueFrom(route.data).then((data) => {
            self.projVm = data.inputs[0];
            self.appVm = data.inputs[1];
            self.appCdhCtx = data.inputs[2];
            self.usrCdhCtx = data.inputs[3];
            self.runningOp = undefined;
            self.appVm
                .whenLoaded()
                .then((vm) => (self.appCdhCtx.query.clientId = vm.view.client_id));

            self.projVm
                .whenUsersLoaded()
                .then((map) => (self.usrCdhCtx.users = Object.values(map)));
            titleService.setTitle(self.appCdhCtx.entry.query.id + ' usages');

            titleService.setTitle(self.appCdhCtx.entry.query.id + ' usages');

            setTimeout(self._cd.markForCheck, 0);
        });
    }

    ngOnInit() {
        this.selectedIndex = 0;
    }

    ngOnDestroy() {
        this.selectedIndex = null;
    }
}
