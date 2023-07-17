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
import {sameString} from 'joe-fx';
import {CommandNotification} from 'joe-viewmodels';
import {GroupLinkView, ResourceLinkData} from 'intact-models';
import {ProjectsViewModel, GlobalState, NotifierService} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {GroupsService} from '../../data/groups.service';
import { ValidationMessagePipe } from '../../../_shared/pipes/valmsg.pipe';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'iam-admin-list',
    templateUrl: './group-about.component.html',
    styleUrls: ['./group-about.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, ValidationMessagePipe]
})
export class GroupAboutComponent implements OnInit, OnDestroy {
    private _sub = new Subscription();

    public error: any;
    public view!: GroupLinkView;
    public projVm!: ProjectDetailViewModel;
    public projListVm!: ProjectsViewModel;
    public runningOp: string | undefined;

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _grpService: GroupsService,
        private _titleService: Title,
        route: ActivatedRoute
    ) {
        this._sub.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    private _initObserver(d: {inputs: [ProjectsViewModel, ProjectDetailViewModel, string]}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        const groupName = d.inputs[2];
        this._titleService.setTitle(groupName + ' (Def)');
        const self = this;
        const initializerFunc = () => {
            self.view = self.projVm.view.groups.find((a) => sameString(a.label, groupName))!;
            if (self.view === undefined) {
                self.error = `${groupName} is not a valid group name...`;
            }
            this.runningOp = undefined;
            self._cd.markForCheck();
        };
        if (this.projVm.loaded) {
            initializerFunc();
        } else {
            this._sub.add(
                this.projVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        initializerFunc();
                    }
                })
            );
        }
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
        if (userState.isMyProject(projVm.view.id)) {
            return false;
        }
        return (
            userState.isIntactAdmin ||
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
            this._grpService
                .renameAsync(this.view.$json() as unknown as ResourceLinkData)
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
}
