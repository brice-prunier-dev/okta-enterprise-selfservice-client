import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RenamingDialogComponent } from '../dialogs/renaming-dialog/renaming-dialog.component';
import { PROJECTITEM_TYPE, ResourceLinkData } from 'intact-models';
import { IViewElement } from 'joe-fx';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RenamingService {
    constructor(private dialog: MatDialog) {}

    public rename(
        resourceType: PROJECTITEM_TYPE,
        resource: ResourceLinkData & IViewElement
    ): Promise<boolean> {
        return firstValueFrom(
            this.dialog
                .open(RenamingDialogComponent, { data: [resourceType, resource] })
                .afterClosed()
        );
    }
}
