import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PartialObserver, Subscription } from 'rxjs';
import { ProjectsViewModel } from '../../_core';
import { ActivatedRoute, Data } from '@angular/router';
import { ProjectDetailViewModel } from '../../projectsnav';
import { ScopeSubscriberType } from '../data/types';
import { MyKpiListViewModel } from '../../_app/data/my-kpi-list.viewmodel';
import { environment } from 'projects/intact/src/environments/environment';

@Component({
    selector: 'iam-app-home',
    templateUrl: './scope-home.component.html',
    styleUrls: ['./scope-home.component.scss']
})
export class ScopeHomeComponent implements OnDestroy {
    private _subscriptions = new Subscription();
    public runningOp: string | undefined;
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public scopeId!: string;
    public myKpis!: MyKpiListViewModel;

    public get initialized(): boolean {
        return (
            this.projVm?.loaded &&
            (environment.toggleFeatures.kpis === false || this.myKpis?.loaded)
        );
    }

    public get loading(): boolean {
        return !(this.projVm?.loaded && !this.running);
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    constructor(private _cd: ChangeDetectorRef, route: ActivatedRoute) {
        this.runningOp = 'Loading application...';
        this._subscriptions.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    private _inputsObserver(d: { inputs: ScopeSubscriberType; myKpis: MyKpiListViewModel }) {
        this.runningOp = 'Loading application';
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.scopeId = d.inputs[2];
        this.myKpis = d.myKpis;
        const self = this;

        const initComponent = () => {
            self.runningOp = undefined;
            self._cd.markForCheck();
        };

        if (self.projVm.loaded) {
            initComponent();
        } else {
            this._subscriptions.add(
                self.projVm.onStateChanged.subscribe(() => {
                    if (self.projVm.loaded) {
                        initComponent();
                    }
                })
            );
        }
        this._subscriptions.add(
            self.myKpis.onStateChanged.subscribe(() => self._cd.markForCheck())
        );
    }

    hasWarning() {
        return (
            environment.toggleFeatures.kpis &&
            this.myKpis.scopeHasWarning(this.projVm.view, this.scopeId, this.projListVm.view)
        );
    }

    public ngOnDestroy() {
        this._subscriptions.unsubscribe();
    }
}
