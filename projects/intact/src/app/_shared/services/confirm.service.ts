import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../ui/confirm-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmService {
    constructor(private dialog: MatDialog) {}

    public confirmDeletion(ref: string): Promise<boolean> {
        return this.confirm('Confirmation', `Do you confirm the deletion of "${ref}"?`);
    }

    public confirm(title: string, message: string): Promise<boolean> {
        return firstValueFrom(
            this.dialog.open(ConfirmDialogComponent, { data: { title, message } }).afterClosed()
        );
    }

    public info(title: string, message: string): Promise<boolean> {
        return firstValueFrom(
            this.dialog
                .open(ConfirmDialogComponent, {
                    data: { title, message, info: true },
                    width: '600px'
                })
                .afterClosed()
        );
    }
}
