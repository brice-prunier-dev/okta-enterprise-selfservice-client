import {Component, Inject, OnDestroy} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {ProjectDocData} from 'intact-models';
import {t} from 'joe-types';
import {DataObj, IViewElement, ObjectDef, Objview, sameString, Tobject} from 'joe-fx';

import {OdefinitionData, OidDef} from 'joe-models';
import { } from 'angular-oauth2-oidc';
import { ValidationMessagePipe } from '../../../_shared/pipes/valmsg.pipe';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

const ProjectDefinitionType: Tobject<OdefinitionData> = t.object.as({
    type: 'object',
    title: 'projectDefinitionDef',
    extends: [OidDef],
    properties: {
        oid: t.string.id.extendAs('S_PROJECT_ID',{
            type: 'string',
            pattern: '^[a-z0-9-_]*$',
            patternModel: 'Lower case alphanumeric acceptting _ or -'
        }),

        description: t.string.text.extendAs('S_PROJECT_DEFINITION', {
            type: 'string',
            minlength: 15
        })
    },
    required: ['oid', 'description'],
    index: {id: 'oid', sort: ['$>description']}
} as ObjectDef<OdefinitionData>);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class ProjectDefinitionView extends Objview<OdefinitionData> implements OdefinitionData {
    declare oid: string;
    declare description: string;
    constructor(entity?: any, parent?: IViewElement) {
        super(ProjectDefinitionType, entity, parent);
    }
}
ProjectDefinitionType.viewctor = ProjectDefinitionView;

// tslint:disable-next-line: variable-name
export const NULL_DESCITEMDATA: OdefinitionData = {oid: '', description: ''};

export type NewProjectDialogInput = ProjectDocData[];
export type NewProjectDialogOutput = [boolean, string | undefined, string | undefined];

@Component({
    selector: 'iam-new-project-dialog',
    templateUrl: './new-project.dialog.html',
    styleUrls: ['./new-project.dialog.scss'],
    standalone: true,
    imports: [MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule, NgIf, MatButtonModule, ValidationMessagePipe]
})
export class NewProjectDialog implements OnDestroy {
    private _projects: ProjectDocData[];

    public newProject: ProjectDefinitionView;

    get isValid(): boolean {
        return (
            this.newProject.$isEditing &&
            this.newProject.$editor!.isDirty() &&
            !this.newProject.$validation.withError()
        );
    }

    constructor(
        public dialogRef: MatDialogRef<NewProjectDialog, NewProjectDialogOutput>,
        @Inject(MAT_DIALOG_DATA) public data: NewProjectDialogInput
    ) {
        this._projects = data;
        ProjectDefinitionType.rules.oid = (newproj: OdefinitionData) => {
            return data.some((p) => sameString(p.id, newproj.oid))
                ? ({uniqueid: newproj.oid} as DataObj)
                : undefined;
        };
        this.newProject = new ProjectDefinitionView();
    }

    ngOnDestroy(): void {
        ProjectDefinitionType.rules.oid = undefined;
    }

    cmdCancel() {
        this.dialogRef.close([false, undefined, undefined]);
    }

    cmdSave() {
        if (!this.newProject.$validation.withError())
            this.dialogRef.close([true, this.newProject.oid, this.newProject.description]);
    }
}
