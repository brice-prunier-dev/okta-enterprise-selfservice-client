import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Data } from '@angular/router';
import { PartialObserver, Subscription } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import { isArrayAssigned } from 'joe-fx';
import { APPLICATION_TYPE } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import { ProjectsViewModel, GlobalState, NotifierService } from '../../../_core';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { AppViewModel } from '../../data/app.viewmodel';
import { AppDataInput } from '../../data/types';
import { MyKpiListViewModel } from '../../../_app/data/my-kpi-list.viewmodel';
import { environment } from 'projects/intact/src/environments/environment';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-app-home',
    templateUrl: './app-home.component.html',
    styleUrls: ['./app-home.component.scss']
})
export class AppHomeComponent implements OnInit, OnDestroy {
    // #region Properties (7)

    private _runningOp: string | undefined;
    private _subs = new Subscription();

    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public searching = false;
    public vm!: AppViewModel;
    public myKpisVm!: MyKpiListViewModel;
    // #endregion Properties (7)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this._runningOp = 'Loading application...';
        this._subs.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (5)

    public get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    public get isUserApp(): boolean {
        return this.initialized
            ? this.vm.view.application_type === APPLICATION_TYPE.Browser ||
                  this.vm.view.application_type === APPLICATION_TYPE.Web ||
                  this.vm.view.application_type === APPLICATION_TYPE.Native ||
                  this.vm.view.application_type === APPLICATION_TYPE.Saml ||
                  (this.vm.view.application_type === APPLICATION_TYPE.Service &&
                      isArrayAssigned(this.vm.app.groups))
            : false;
    }

    public get isSamlApp(): boolean {
        return this.initialized ? this.vm.view.application_type === APPLICATION_TYPE.Saml : false;
    }

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded && !this.running);
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get runningOp(): string | undefined {
        return this._runningOp || this.vm?.runningOp || this.myKpisVm?.runningOp;
    }

    public get isSwagger(): boolean {
        return this.initialized && this.vm.app.swagger !== undefined;
    }

    public get appIcon(): string {
        return this.isSwagger
            ? '/assets/graph-app-swagger.svg'
            : `/assets/graph-app-${this.vm.app?.type || 'service'}.svg`;
    }

    // #endregion Public Accessors (5)

    // #region Public Methods (2)

    public ngOnDestroy() {
        this._subs.unsubscribe();
    }

    public ngOnInit(): void {}

    // #endregion Public Methods (2)

    // #region Private Methods (1)

    private _inputsObserver(d: { inputs: AppDataInput; myKpis: MyKpiListViewModel }) {
        this._runningOp = 'Loading application';
        const self = this;
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.vm = d.inputs[2];
        this.myKpisVm = d.myKpis;
        if (this.vm.loaded) {
            this._titleService.setTitle(this.vm.view.client_name + ' (Detail)');
            this._runningOp = undefined;
            this._cd.markForCheck();
        } else {
            this._subs.add(
                this.vm.onStateChanged.subscribe((p) => {
                    if (self.vm.loaded) {
                        self.vm.editBehavior = {
                            notify: self._notifierSvc.notifyFunc()
                        };
                        self._titleService.setTitle(this.vm.view.client_name + ' (Detail)');
                        self._runningOp = undefined;
                        self._cd.markForCheck();
                    }
                })
            );
        }
        this._subs.add(
            this.myKpisVm.onStateChanged.subscribe((p) => {
                self._cd.markForCheck();
            })
        );
    }

    hasWarning() {
        return (
            environment.toggleFeatures.kpis &&
            this.myKpisVm.appHasWarning(this.projVm.view, this.vm.app)
        );
    }

    // #endregion Private Methods (1)
}
