import {
    Component,
    ChangeDetectorRef,
    OnChanges,
    Input,
    SimpleChanges,
    OnDestroy
} from '@angular/core';
import {
    GroupLinkView,
    ReferenceChangesData,
    PROJECTITEM_TYPE,
    ReferenceChangesMessageData,
    PROJECT_STORE
} from 'intact-models';
import { Setview } from 'joe-fx';
import { GlobalState, NotifierService, ProjectsService } from '../../../_core';
import { MatSelectionListChange, MatListModule } from '@angular/material/list';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { Subscription } from 'rxjs';
import { StoreManager } from 'joe-viewmodels';
import { NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ValidationComponent } from '../../../_shared/ui/app-validation.component';

@Component({
    selector: 'iam-project-admins',
    templateUrl: './project-admins.component.html',
    styleUrls: ['./project-admins.component.scss'],
    standalone: true,
    imports: [ValidationComponent, MatCardModule, MatListModule, NgFor]
})
export class ProjectAdminsComponent implements OnChanges, OnDestroy {
    public _sub = new Subscription();
    public error: any;
    public runningOp: string | undefined;
    public graphView = 'graph-runtime';

    public searching = false;

    @Input() public vm!: ProjectDetailViewModel;

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService
    ) {}

    public ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    public get viewGroups(): GroupLinkView[] {
        return this.initialized
            ? this.editable
                ? this.vm.view.groups
                : this.vm.view.groups.filter((g) => this.isSelected(g.oid))
            : [];
    }

    public get editable(): boolean {
        if (this.initialized) {
            const userState = this._userState;
            return (
                userState.isIntactAdmin ||
                userState.isMyProject(this.vm.view.id) ||
                this.vm.isProjectAdmin
            );
        }
        return false;
    }

    public get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    public isSelected(oid: string): boolean {
        return this.initialized ? this.vm.view.admins.includes(oid) : false;
    }

    public admindGroupsChanged(arg: MatSelectionListChange) {
        const change = { added: [] as string[], removed: [] as string[] };
        const option = arg.options[0];
        const oid = option.value as string;
        if (option.selected) {
            change.added.push(oid);
            if (!this.vm.view.admins.includes(oid)) {
                (this.vm.view.admins as Setview<string>).add(oid);
            }
        } else {
            change.removed.push(oid);
            if (this.vm.view.admins.includes(oid)) {
                (this.vm.view.admins as Setview<string>).remove(oid);
            }
        }
        this.adminchange(change);
    }

    public adminchange(event: ReferenceChangesData) {
        if (this.editable) {
            this.error = undefined;
            // this.runningOp = 'Saving data...';
            const adminView = this.vm.view.admins;

            if (adminView.$isEditing && !this.vm.view.$validation.withError()) {
                const payload = {
                    project: this.vm.view.id,
                    target: this.vm.view.id,
                    targetType: PROJECTITEM_TYPE.project,
                    changes: event
                } as ReferenceChangesMessageData;

                const self = this;
                const projectService = StoreManager.INSTANCE.store(
                    PROJECT_STORE
                ) as ProjectsService;

                projectService
                    .ownershipAsync(payload)
                    .then(() => {
                        self.runningOp = undefined;
                        self.vm.view.admins.$editor!.endEdit();
                        self._cd.markForCheck();
                        self._notifierSvc.notify('Ownership Management', 'Succeed');
                    })
                    .catch((err) => {
                        self.runningOp = undefined;
                        self.error = err;
                        self.vm.view.admins.$editor!.cancelEdit();
                        self._cd.markForCheck();
                    });
            }
        }
    }

    ngOnChanges(changements: SimpleChanges) {
        const self = this;
        if (this.vm) {
            if (this.vm.loaded) {
                self._cd.markForCheck();
            } else {
                this._sub.add(
                    this.vm.onStateChanged.subscribe(() => {
                        if (self.vm.loaded) {
                            self._cd.markForCheck();
                        }
                    })
                );
            }
        }
    }
}
