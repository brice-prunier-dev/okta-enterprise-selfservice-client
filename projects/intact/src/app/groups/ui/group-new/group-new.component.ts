import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { PartialObserver, Subscription } from 'rxjs';
import { CommandNotification } from 'joe-viewmodels';
import { GroupLinkData } from 'intact-models';
import { ProjectsViewModel, GlobalState, NotifierService } from '../../../_core';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { GroupNewViewModel } from '../../data/group-new.viewmodel';
import { GroupsService } from '../../data/groups.service';

@Component({
    selector: 'iam-group-new',
    templateUrl: './group-new.component.html',
    styleUrls: ['./group-new.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupNewComponent implements OnInit, OnDestroy {
    //
    // ─── private field ──────────────────────────────────────────────────────────────────────
    //
    private _sub = new Subscription();

    //
    // ─── Public field & properties ───────────────────────────────────────────────────────────
    //

    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public vm!: GroupNewViewModel;
    public runningOp: string | undefined;

    //
    // ─── Public properties getter ───────────────────────────────────────────────────────────
    //

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
        return this.vm && this.vm.loaded;
    }

    //
    // ─── Ctor & Init ──────────────────────────────────────────────────────────────────────
    //
    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _groupsProxy: GroupsService,
        private _router: Router,
        private _notifierSvc: NotifierService,

        route: ActivatedRoute,
        titleService: Title
    ) {
        titleService.setTitle('New Group');
        this._sub.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    //
    // ─── private functions ──────────────────────────────────────────────────────────────────────
    //

    private _inputsObserver(d: {
        inputs: [GroupNewViewModel, ProjectsViewModel, ProjectDetailViewModel];
    }) {
        this.vm = d.inputs[0];
        this.projListVm = d.inputs[1];
        this.projVm = d.inputs[2];
        const self = this;
        if (this.projVm.loaded) {
            this.vm.projectVm = this.projVm;
            this._cd.markForCheck();
        } else {
            this._sub.add(
                this.projVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        self.vm.projectVm = self.projVm;
                        self._cd.markForCheck();
                    }
                })
            );
        }
    }

    //
    // ─── Public functions ──────────────────────────────────────────────────────────────────────
    //
    public ngOnInit() {}

    public ngOnDestroy() {
        this._sub.unsubscribe();
        this.vm.terminate();
    }

    public saveAsync() {
        if (this.editable) {
            this.runningOp = 'Saving data...';
            this.vm.setError(undefined);
            this._cd.markForCheck();
            if (this.vm.view.$validation.withError()) {
                this.runningOp = undefined;
                this._cd.markForCheck();
            } else {
                const $this = this;
                const view = this.vm.view;
                this._groupsProxy
                    .createProjectGroup(
                        this.vm.projectVm.view.id,
                        this.vm.view.$json() as unknown as GroupLinkData
                    )
                    .then((r) => {
                        $this.vm.addToProject(r.oid, $this._groupsProxy);
                        $this._notifierSvc.notify(view.label, 'Created');
                        const redirectUrl = `/projects/${$this.projVm.view.id}/groups/${view.label}/details`;
                        setTimeout(() => $this._router.navigateByUrl(redirectUrl), 500);
                    })
                    .catch((err) => {
                        $this.vm.setError(err);
                        $this.runningOp = undefined;
                        $this._cd.markForCheck();
                    });
            }
        }
    }
}
