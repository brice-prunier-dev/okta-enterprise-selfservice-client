import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { PROJECTITEM_TYPE, ResourceLinkData } from 'intact-models';
import { isAssigned, IViewElement } from 'joe-fx';
import { ProjectsService } from '../../../_core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'iam-renaming-dialog',
    templateUrl: './renaming-dialog.component.html',
    styleUrls: ['./renaming-dialog.component.scss']
})
export class RenamingDialogComponent implements OnInit {
    private _invalidKeys = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        ' '
    ];
    private _invalidKeyTyped = false;

    public resourceType: PROJECTITEM_TYPE;
    public resource: ResourceLinkData & IViewElement;
    public error: any;
    public runningOp: string | undefined;

    constructor(
        private _cd: ChangeDetectorRef,
        private _proxy: ProjectsService,
        public dialogRef: MatDialogRef<RenamingDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        data: [PROJECTITEM_TYPE, ResourceLinkData & IViewElement]
    ) {
        this.resourceType = data[0];
        this.resource = data[1];
    }

    ngOnInit() {}

    public get resourceTypeLabel(): string | undefined {
        if (!this.resourceType) {
            return undefined;
        }
        switch (this.resourceType) {
            case PROJECTITEM_TYPE.project:
                return 'Project';
            case PROJECTITEM_TYPE.application:
                return 'Application';
            case PROJECTITEM_TYPE.group:
                return 'Group';
            case PROJECTITEM_TYPE.scope:
                return 'Scope';
        }
        return undefined;
    }

    public get canBeSave() {
        return (
            !this.running && !this.error && this.isDirty && !this.resource.$validation.withError()
        );
    }

    public get isDirty(): boolean {
        return this.resource.$isEditing && this.resource.$editor!.isTouched();
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public cancel() {
        if (this.resource.$isEditing) {
            this.resource.$editor!.cancelEdit();
        }
        this.dialogRef.close(false);
    }

    get withFormatHint(): boolean {
        return isAssigned(this.resource?.label) && this._invalidKeyTyped;
    }

    public onInputChanged(event: KeyboardEvent) {
        const newInput = (event.target as HTMLInputElement).value;
        if (this._invalidKeys.includes(event.key)) {
            this._invalidKeyTyped = true;
            this.resource.label = newInput.replace(' ', '-').toLowerCase();
        }
    }

    public ok() {
        if (this.canBeSave) {
            this.runningOp = 'Saving ...';
            this._cd.markForCheck();
            const self = this;
            const rsc = this._proxy
                .renameItem(this.resourceType, this.resource.$json())
                .then((r) => {
                    this.runningOp = undefined;
                    self.resource.$editor!.endEdit();
                    this.dialogRef.close(true);
                })
                .catch((err) => {
                    self.runningOp = undefined;
                    self.error = err;
                    self._cd.markForCheck();
                });
        }
    }
}
