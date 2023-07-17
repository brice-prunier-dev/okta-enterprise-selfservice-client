import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data} from '@angular/router';
import {PartialObserver, Subscription} from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import {sameString} from 'joe-fx';
import {OitemData} from 'joe-models';
import {CommandNotification} from 'joe-viewmodels';
import {AppLinkData, AppLinkView} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import {ProjectsViewModel, GlobalState, NotifierService} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {ApplicationService} from '../../data/apps.service';
import {AppViewModel} from '../../data/app.viewmodel';
import {AppDataInput} from '../../data/types';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-admin-list',
    templateUrl: './app-about.component.html',
    styleUrls: ['./app-about.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAboutComponent implements OnInit, OnDestroy {
    // #region Properties (8)

    private _sub = new Subscription();

    appVm!: AppViewModel;
    error: any;
    projListVm!: ProjectsViewModel;
    projVm!: ProjectDetailViewModel;
    runningOp: string | undefined;
    view!: AppLinkView;

    // #endregion Properties (8)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _appService: ApplicationService,
        private _titleService: Title,
        route: ActivatedRoute
    ) {
        this._sub.add(
            route.data.subscribe(this._initObserverI.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    // #endregion Constructors (1)

    // #region Accessors (5)

    get canSave(): boolean {
        return this.view.$isEditing && this.view.$editor!.isTouched();
    }

    get editable(): boolean {
        const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
        const userState = this._userState;
        return (
            userState.isIntactAdmin ||
            userState.isMyProject(projVm.view.id) ||
            projVm.isProjectAdmin ||
            projVm.isItemAdmin(this.view, userState.login, userState.groups)
        );
    }

    get initialized(): boolean {
        return !!this.view;
    }

    get running(): boolean {
        return !!this.runningOp;
    }

    get withError(): boolean {
        return !!this.error;
    }

    get projectCmdbs(): OitemData[] {
        return this.projVm.view?.cmdbs || [];
    }

    // #endregion Accessors (5)

    // #region Methods (3)

    ngOnDestroy() {
        this._sub.unsubscribe();
    }

    ngOnInit() { }

    saveAsync() {
        if (this.editable) {
            this.runningOp = 'Saving data...';
            this.error = undefined;
            const caller = this;
            this._appService
                .renameAsync(this.view.$json() as unknown as AppLinkData)
                .then((r) => {
                    caller._notifierSvc.notify('Definition Update', 'Succeed');
                    caller.view.$editor!.endEdit();
                    this.runningOp = undefined;
                    this._cd.markForCheck();
                })
                .catch((err) => {
                    this.error = err;
                    this._cd.markForCheck();
                });
        }
    }

    // #endregion Methods (3)

    // #region Private Methods (1)

    private _initObserverI(d: {inputs: AppDataInput}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.appVm = d.inputs[2];
        this._titleService.setTitle(this.appVm.view.client_name + ' (Def)');
        const self = this;
        const initialyzerFunc = () => {
            self.view = self.projVm.view.apps.find((a) =>
                sameString(a.label, self.appVm.view.client_name)
            )!;
            if (self.view === undefined) {
                self.error = `${self.appVm.view.client_name} is not a valid application name...`;
            }
            self.runningOp = undefined;
            self._cd.markForCheck();
        };
        if (this.appVm.loaded) {
            initialyzerFunc();
        } else {
            self._sub.add(
                this.projVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        initialyzerFunc();
                    }
                })
            );
        }
    }

    // #endregion Private Methods (1)
}
