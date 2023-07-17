import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {sameString} from 'joe-fx';
import {ScopeLinkView, ResourceLinkData} from 'intact-models';
import {PartialObserver, Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data} from '@angular/router';
import {CommandNotification} from 'joe-viewmodels';
import {ScopesService} from '../data/scopes.service';
import {ProjectsViewModel, NotifierService, GlobalState} from '../../_core';
import {ProjectDetailViewModel} from '../../projectsnav';
import {ScopeSubscriberType} from '../data/types';

@Component({
    selector: 'iam-scope-about',
    templateUrl: './scope-about.component.html',
    styleUrls: ['./scope-about.component.scss']
})
export class ScopeAboutComponent implements OnInit, OnDestroy {
    private _sub = new Subscription();

    public error: any | undefined;
    public scpId!: string;
    public view!: ScopeLinkView;
    public projVm!: ProjectDetailViewModel;
    public projListVm!: ProjectsViewModel;

    public runningOp: string | undefined;

    private _inputsObserver(d: {inputs: ScopeSubscriberType}) {
        this.runningOp = 'Loading application';
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.scpId = d.inputs[2];
        this._titleService.setTitle(this.scpId + ' (Def)');
        if (this.projVm.loaded) {
            this.view = this.projVm.view.scopes.find((a) => sameString(a.oid, this.scpId))!;
            if (this.view === undefined) {
                this.error = `${this.scpId} is not a valid scope identifier...`;
            }
            this.runningOp = undefined;
            this._cd.markForCheck();
        } else {
            const $this = this;
            this._sub.add(
                this.projVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        $this.view = $this.projVm.view.scopes.find((a) =>
                            sameString(a.oid, $this.scpId)
                        )!;
                        if ($this.view === undefined) {
                            $this.error = `${$this.scpId} is not a valid scope identifier...`;
                        }
                        this.runningOp = undefined;
                        $this._cd.markForCheck();
                    }
                })
            );
        }
    }

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _scpService: ScopesService,
        private _titleService: Title,
        route: ActivatedRoute
    ) {
        route.params.subscribe((p) => (this.scpId = p.scpId));
        this._sub.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    public get initialized(): boolean {
        return !!this.view;
    }
    public get withError(): boolean {
        return !!this.error;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get editable(): boolean {
        const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
        const userState = this._userState;
        return (
            userState.isIntactAdmin ||
            userState.isMyProject(projVm.view.id) ||
            projVm.isProjectAdmin ||
            projVm.isItemAdmin(this.view, userState.login, userState.groups)
        );
    }

    public get canSave(): boolean {
        return this.view.$isEditing && this.view.$editor!.isTouched();
    }

    ngOnInit() { }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public saveAsync() {
        if (this.editable) {
            this.runningOp = 'Saving data...';
            this.error = undefined;
            const caller = this;
            this._scpService
                .renameAsync(this.view.$json() as unknown as ResourceLinkData)
                .then((r) => {
                    caller._notifierSvc.notify('Definition Update', 'Succeed');
                    caller.view.$editor!.endEdit();
                    this.runningOp = undefined;
                    this._cd.markForCheck();
                })
                .catch((err) => {
                    this.error = err;
                    this.runningOp = undefined;
                    this._cd.markForCheck();
                });
        }
    }
}
