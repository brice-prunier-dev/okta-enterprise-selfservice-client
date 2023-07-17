import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy,
    ViewChild
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute, Data} from '@angular/router';
import {MatStepper} from '@angular/material/stepper';
import {PartialObserver, Subscription} from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import {RuntimeMessage, MessageDomain, JoeLogger} from 'joe-fx';
import {pascalCase} from 'joe-types';
import {CommandNotification, DetailViewModel} from 'joe-viewmodels';
import {AppDocData, APPLICATION_TYPE, DefaultAppDocView, ServiceAppDocView} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import {GlobalState, NotifierService, ProjectsViewModel} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {AppNewViewModel} from '../../data/app-new.viewmodel';
import {ApplicationService} from '../../data/apps.service';
import {AppNewDataInput} from '../../data/types';
import {MessageTypology} from 'joe-fx';
import {AppBrowserComponent} from '../../controls/app-browser/app-browser.component';
import {AppServiceComponent} from '../../controls/app-service/app-service.component';
import {AppWebComponent} from '../../controls/app-web/app-web.component';
import {AppNativeComponent} from '../../controls/app-native/app-native.component';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-app-new',
    templateUrl: './app-new.component.html',
    styleUrls: ['./app-new.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNewComponent implements OnInit, OnDestroy {
    @ViewChild('stepper') private stepper!: MatStepper;
    @ViewChild(AppBrowserComponent) private browserComponent!: AppBrowserComponent;
    @ViewChild(AppServiceComponent) private serviceComponent!: AppServiceComponent;
    @ViewChild(AppWebComponent) private webComponent!: AppWebComponent;
    @ViewChild(AppNativeComponent) private nativeComponent!: AppNativeComponent;
    private _subs = new Subscription();
    //
    // ─── Ctor & Init ──────────────────────────────────────────────────────────────────────
    //
    constructor(
        private _router: Router,
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _appsProxy: ApplicationService,
        private _notifierSvc: NotifierService,
        route: ActivatedRoute,
        titleService: Title
    ) {
        titleService.setTitle('New App');
        this._subs.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded && this.projVm && this.projVm.loaded && !this.running);
    }
    public get running(): boolean {
        return !!this.runningOp;
    }

    public get editable(): boolean {
        const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
        const userState = this._userState;
        if (this.initialized && this.vm.loaded) {
            return (
                userState.isIntactAdmin ||
                userState.isMyProject(projVm.view.id) ||
                projVm.isProjectAdmin
            );
        }
        return false;
    }

    public get initialized(): boolean {
        return !!this.vm;
    }

    public get flowSelection(): string {
        return this._flowSelection;
    }
    public set flowSelection(input: string) {
        this._flowSelection = input;
        this.vm.appType = input as APPLICATION_TYPE;
        this.stepper.next();
    }
    public get appFlow(): string | undefined {
        return this.flowSelection ? pascalCase(this.flowSelection) : undefined;
    }
    public get viewAsUserApp(): DefaultAppDocView {
        return this.vm.view as DefaultAppDocView;
    }

    public get viewAsService(): ServiceAppDocView {
        return this.vm.view as ServiceAppDocView;
    }
    //
    // ─── private field ──────────────────────────────────────────────────────────────────────
    //
    private _flowSelection: string = '';
    //
    // ─── Public field & properties ───────────────────────────────────────────────────────────
    //
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public vm!: AppNewViewModel;
    public runningOp: string | undefined;

    //
    // ─── private functions ──────────────────────────────────────────────────────────────────────
    //
    private _initObserver(d: {inputs: AppNewDataInput}) {
        this.vm = d.inputs[0];
        this.projListVm = d.inputs[1];
        this.projVm = d.inputs[2];
        const self = this;
        this.vm.editBehavior = {
            before_save: (
                vm: DetailViewModel<AppDocData, ServiceAppDocView | DefaultAppDocView>
            ) => {
                (vm as AppNewViewModel).beforeSave();
            },
            after_create: (
                vm: DetailViewModel<AppDocData, ServiceAppDocView | DefaultAppDocView>
            ) => {
                (vm as AppNewViewModel).afterCreate();
            },
            notify: self._notifierSvc.notifyFunc()
        };

        this._subs.add(this.vm.onStateChanged.subscribe(this._invalidateChildrenUI.bind(this)));
    }

    private _invalidateChildrenUI(notif: string) {
        JoeLogger.debug('RECEIVE NOTIF on NEW-APP Page -> ' + notif);
        if (notif === CommandNotification.StateChanged) {
            this._cd.markForCheck();
        } else if (notif === MessageDomain.VALIDATION) {
            if (this.browserComponent !== undefined) {
                this.browserComponent.refreshLayout();
            }
            if (this.webComponent !== undefined) {
                this.webComponent.refreshLayout();
            }
            if (this.serviceComponent !== undefined) {
                this.serviceComponent.refreshLayout();
            }
            if (this.nativeComponent !== undefined) {
                this.nativeComponent.refreshLayout();
            }
            this._cd.markForCheck();
        }
    }

    //
    // ─── Public functions ──────────────────────────────────────────────────────────────────────
    //
    public ngOnInit() { }

    public ngOnDestroy() {
        this._subs.unsubscribe();
        this.vm.terminate();
    }

    public save() {
        if (this.editable && !this.vm.view.$validation.withError()) {
            this.runningOp = 'Saving data...';
            this.vm.setError(undefined);
            this._cd.markForCheck();
            const self = this;
            const terminateCall = (err: any) => {
                self.runningOp = undefined;
                JoeLogger.debug(err);
                self._cd.markForCheck();
            };
            const appView = this.vm.view;
            self.vm
                .saveAsync()
                .then((ok) => {
                    self.runningOp = undefined;
                    this._cd.markForCheck();
                    if (this.vm.error) {
                        this.vm.view.$edit();
                    } else {
                        this.vm.appLinkView.oid = this.vm.view.id;
                        this.vm.appLinkView.type = this.vm.view.application_type;
                        const g = this.vm.appLinkView.groups;
                        if (g.length === 0) {
                            JoeLogger.debug('No groups on new app: ' + this.vm.appLinkView.label);
                        }
                        const redirectUrl =
                            appView.application_type === APPLICATION_TYPE.Service
                                ? `/projects/${this.projVm.view.id}/apps/${this.vm.appLinkView.label}/details`
                                : `/projects/${this.projVm.view.id}/apps/${this.vm.appLinkView.label}/groups`;
                        this.projVm.checkMeGroup();
                        this.vm.terminate();
                        this._router.navigateByUrl(redirectUrl);
                    }
                })
                .catch((err) => terminateCall(err));
        }
    }
}

RuntimeMessage.Register('uniquename', () => {
    return `An application with the same name already exist`;
});
