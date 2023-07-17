import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { Setview, Objview, isString } from 'joe-fx';
import {
    GroupLinkView,
    PROJECTITEM_TYPE,
    AdministratedItemData,
    ReferenceChangesMessageData,
    GROUP_ME_ID,
    AppLinkData,
    AppLinkView,
    ReferenceChangesData
} from 'intact-models';
import { PartialObserver, Subscription } from 'rxjs';
import { ProjectDetailViewModel } from '../../projectsnav';
import { ProjectsViewModel, GlobalState, NotifierService, ProjectsService } from '../../_core';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Data } from '@angular/router';
import { OidData } from 'joe-models';
import { AdminListInput } from '../data/types';
import { ItemAdminListComponent } from '../../projectsnav/controls/item-admin-list/item-admin-list.component';
import { ErrorComponent } from '../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'iam-admin-list',
    templateUrl: './admin-list.component.html',
    styleUrls: ['./admin-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, ErrorComponent, ItemAdminListComponent]
})
export class AdminListComponent implements OnInit, OnDestroy {
    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _projectService: ProjectsService,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this._sub.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    public get initialized(): boolean {
        return !!this.view || this.withError;
    }
    public get withError(): boolean {
        return !!this.error;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get editable(): boolean {
        if (this.view && this.view.oid === GROUP_ME_ID) {
            return false;
        }
        const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
        return (
            this._userState.isIntactAdmin ||
            this._userState.isMyProject(this.projListVm.currentProject!.view.id) ||
            projVm.isProjectAdmin ||
            projVm.isItemAdmin(this.view, this._userState.login, this._userState.groups)
        );
    }

    public get canSave(): boolean {
        return this.view.$isEditing && this.view.$editor!.isTouched();
    }

    public _sub = new Subscription();

    public error: any;
    public itemType!: PROJECTITEM_TYPE;
    public view!: Objview & OidData & AdministratedItemData;
    public groups!: Setview<GroupLinkView>;
    public services: Setview<AppLinkView> | undefined;
    public projListVm!: ProjectsViewModel;
    public runningOp: string | undefined;

    private _initObserver(d: { inputs: AdminListInput }) {
        this.projListVm = d.inputs[0];
        this.itemType = d.inputs[1];
        const withResolverError = isString(d.inputs[2]);
        const cd = this._cd;
        if (withResolverError) {
            this.error = d.inputs[2] as string;
        } else {
            this.groups = this.projListVm.currentProject!.view.groups;
            this.view = d.inputs[2] as Objview & OidData & AdministratedItemData;
            switch (this.itemType) {
                case PROJECTITEM_TYPE.application:
                    this._titleService.setTitle((this.view as AppLinkView).label + ' (Admins)');
                    break;
                case PROJECTITEM_TYPE.group:
                    this._titleService.setTitle((this.view as GroupLinkView).label + ' (Admins)');
                    this.services = this.projListVm.currentProject!.view.apps.some(
                        (app) => app.type === 'service'
                    )
                        ? this.projListVm.currentProject!.view.apps
                        : undefined;
                    break;
                default:
                    this._titleService.setTitle(this.view.oid + ' (Admins)');
                    break;
            }
            this.view.$edit();
            this._sub.add(
                this.projListVm.currentProject!.view.$editor!.onViewChanged!.subscribe(() => {
                    cd.markForCheck();
                })
            );
        }

        cd.markForCheck();
    }

    ngOnInit() {}

    public ngOnDestroy() {
        if (this.view.$isEditing) {
            this.view.$editor!.cancelEdit();
        }
        this._sub.unsubscribe();
    }

    public onchange(event: ReferenceChangesData) {
        if (this.editable) {
            this.error = undefined;
            // this.runningOp = 'Saving data...';
            const adminView = this.view.admins as Setview<string>;

            if (adminView.$isEditing && !this.view.$validation.withError()) {
                const payload = {
                    project: this.projListVm.currentProject!.view.id,
                    target: this.view.oid,
                    targetType: this.itemType,
                    changes: event
                } as ReferenceChangesMessageData;

                const $this = this;
                this._projectService
                    .ownershipAsync(payload)
                    .then((result) => {
                        $this.runningOp = undefined;
                        adminView.$editor!.endEdit();
                        $this._notifierSvc.notify('Ownership Management', 'Succeed');
                        $this._cd.markForCheck();
                    })
                    .catch((err) => {
                        this.runningOp = undefined;
                        adminView.$editor!.cancelEdit();
                        $this.error = err;
                        $this._cd.markForCheck();
                    });
            }
        }
    }
}
