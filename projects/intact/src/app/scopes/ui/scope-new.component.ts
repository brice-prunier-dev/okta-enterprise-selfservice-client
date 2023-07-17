import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';
import { PartialObserver, Subscription } from 'rxjs';
import { ScopeNewViewModel } from '../data/scope-new.viewmodel';
import { CommandNotification } from 'joe-viewmodels';
import { GlobalState, NotifierService, ProjectsViewModel } from '../../_core';
import { ScopesService } from '../data/scopes.service';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ResourceLinkData } from 'intact-models';
import { ProjectDetailViewModel } from '../../projectsnav';

@Component({
    selector: 'iam-scope-new',
    templateUrl: './scope-new.component.html',
    styleUrls: ['./scope-new.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScopeNewComponent implements OnInit, OnDestroy {
    // #region Properties Internal (2)

    private _subscriptions = new Subscription();

    // #endregion Properties Internal (2)

    // #region Properties Public (8)

    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public runningOp: string | undefined;
    public vm!: ScopeNewViewModel;

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

    public get running(): boolean {
        return !!this.runningOp;
    }

    // #endregion Properties Public (8)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _scopesProxy: ScopesService,
        private _notifierSvc: NotifierService,
        private _router: Router,
        route: ActivatedRoute,
        titleService: Title
    ) {
        titleService.setTitle('New Scope');
        this._subscriptions.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    // #endregion Constructors (1)

    // #region Methods Internal (1)

    private _inputsObserver(d: {
        inputs: [ScopeNewViewModel, ProjectsViewModel, ProjectDetailViewModel];
    }) {
        this.vm = d.inputs[0];
        this.projListVm = d.inputs[1];
        this.projVm = d.inputs[2];
        const self = this;

        if (this.projVm.loaded) {
            this.vm.projectViewModel = this.projVm;
            this._cd.markForCheck();
        } else {
            this._subscriptions.add(
                this.projVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        self.vm.projectViewModel = self.projVm;
                        self._cd.markForCheck();
                    }
                })
            );
        }
    }

    // #endregion Methods Internal (1)

    // #region Methods Public (3)

    public ngOnDestroy() {
        this._subscriptions.unsubscribe();
        this.vm.terminate();
    }

    public ngOnInit() {}

    public saveAsync() {
        if (this.editable && !this.vm.view.$validation.withError()) {
            this.runningOp = 'Saving data...';
            this.vm.setError(undefined);
            this._cd.markForCheck();
            const self = this;
            const scopeId = self.vm.view.oid;
            const projectId = self.projVm.view.id;
            this._scopesProxy
                .createScopeAsync(projectId, this.vm.view.$json() as unknown as ResourceLinkData)
                .then((r) => {
                    self.vm.addToProject(r);
                    self._notifierSvc.notify(scopeId, 'Created');
                    const redirectUrl = `/projects/${projectId}/home`;
                    setTimeout(() => self._router.navigateByUrl(redirectUrl), 500);
                    this.runningOp = undefined;
                    self._cd.markForCheck();
                })
                .catch((err) => {
                    self.vm.setError(err);
                    this.runningOp = undefined;
                    self._cd.markForCheck();
                });
        }
    }

    // #endregion Methods Public (3)
}
