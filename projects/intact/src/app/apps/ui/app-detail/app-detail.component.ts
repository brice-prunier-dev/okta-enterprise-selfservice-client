import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PartialObserver, Subscription } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import { AppInfoData, DefaultAppDocView, SamlAppDocView, ServiceAppDocView } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import { GlobalState, NotifierService, ProjectsViewModel } from '../../../_core';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { AppWebComponent } from '../../controls/app-web/app-web.component';
import { AppServiceComponent } from '../../controls/app-service/app-service.component';
import { AppSamlComponent } from '../../controls/app-saml/app-saml.component';
import { AppNativeComponent } from '../../controls/app-native/app-native.component';
import { AppBrowserComponent } from '../../controls/app-browser/app-browser.component';
import { AppViewModel } from '../../data/app.viewmodel';
import { AppDataInput } from '../../data/types';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-app-detail',
    templateUrl: './app-detail.component.html',
    styleUrls: ['./app-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDetailComponent implements OnInit, OnDestroy {
    // #region Properties (7)

    @ViewChild(AppBrowserComponent) private browserComponent!: AppBrowserComponent;
    @ViewChild(AppServiceComponent) private serviceComponent!: AppServiceComponent;
    @ViewChild(AppSamlComponent) private samlComponent!: AppSamlComponent;
    @ViewChild(AppWebComponent) private webComponent!: AppWebComponent;
    @ViewChild(AppNativeComponent) private nativeComponent!: AppNativeComponent;

    private _subs = new Subscription();
    public runningOp: string | undefined;
    public searching = false;
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;

    public vm!: AppViewModel;

    // #endregion Properties (7)

    // #region Public Accessors (4)

    public get editable(): boolean {
        const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
        const userState = this._userState;
        return (
            userState.isIntactAdmin ||
            userState.isMyProject(projVm.view.id) ||
            projVm.isItemAdmin(this.vm.app, userState.login, userState.groups)
        );
    }

    public get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded && !this.running);
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get viewAsUserApp(): DefaultAppDocView {
        return this.vm.view as DefaultAppDocView;
    }

    public get viewAsService(): ServiceAppDocView {
        return this.vm.view as ServiceAppDocView;
    }

    public get viewAsSaml(): SamlAppDocView {
        return this.vm.view as SamlAppDocView;
    }

    // #endregion Public Accessors (4)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this.runningOp = 'Loading application...';
        this._subs.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    // #endregion Constructors (1)

    // #region Private Methods (2)

    private _inputsObserver(d: { inputs: AppDataInput }) {
        this.runningOp = 'Loading application';
        const self = this;
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.vm = d.inputs[2];
        if (this.vm.loaded) {
            this._titleService.setTitle(this.vm.view.client_name + ' (Detail)');
            this.runningOp = undefined;
            this._cd.markForCheck();
            this._subs.add(
                this.vm.onStateChanged.subscribe((p) => {
                    if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                        self._invalidateChildrenUI();
                    }
                })
            );
        } else {
            this._subs.add(
                this.vm.onStateChanged.subscribe((p) => {
                    if (self.vm.loaded) {
                        self.vm.editBehavior = {
                            notify: self._notifierSvc.notifyFunc()
                        };
                        self._titleService.setTitle(this.vm.view.client_name + ' (Detail)');
                        self.runningOp = undefined;
                        self._cd.markForCheck();
                    }
                })
            );
        }
    }

    private _invalidateChildrenUI() {
        if (this.browserComponent !== undefined) {
            this.browserComponent.refreshLayout();
        }
        if (this.webComponent !== undefined) {
            this.webComponent.refreshLayout();
        }
        if (this.serviceComponent !== undefined) {
            this.serviceComponent.refreshLayout();
        }
        if (this.samlComponent !== undefined) {
            this.samlComponent.refreshLayout();
        }        
        if (this.nativeComponent !== undefined) {
            this.nativeComponent.refreshLayout();
        }
    }
    
    // #endregion Private Methods (2)

    // #region Public Methods (7)

    public cancel() {
        if (this.vm.editing) {
            this.vm.view.$editor!.cancelEdit();
            this.vm.setError(undefined);
            this.vm.view.validate();
            this._invalidateChildrenUI();
            this._cd.markForCheck();
        }
    }

    public edit() {
        if (this.editable) {
            if (!this.vm.editing) {
                this.vm.view.$edit();
            }
            this._invalidateChildrenUI();
            this._cd.markForCheck();
        }
    }

    public ngOnDestroy() {
        this._subs.unsubscribe();
    }

    public ngOnInit() {}

    public saveAsync() {
        if (this.editable && !this.vm.view.$validation.withError()) {
            this.runningOp = 'Saving data...';
            this.vm.setError(undefined);
            const self = this;
            self.vm
                .saveAsync()
                .then((_) => {
                    self.runningOp = undefined;
                    self._cd.markForCheck();
                })
                .catch((err) => {
                    self.vm.error = err;
                    self._cd.markForCheck();
                });
        }
    }

    public searchDisplayFn(app: AppInfoData | string): string | undefined {
        return typeof app === 'string' ? (app as string) || '' : app.label || '';
    }

    // #endregion Public Methods (7)
}
