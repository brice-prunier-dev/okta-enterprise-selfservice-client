import { Injectable } from '@angular/core';
import { InputDialogComponent } from '../ui/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Injectable( {
    providedIn: 'root'
} )
export class InputService {

    constructor( private dialog: MatDialog ) { }

    public ask( title: string, label: string, asToken: boolean ): Observable<string> {
        return this.dialog.open( InputDialogComponent, { data: { title, label, input: '', asToken }, width: '400px' } )
            .afterClosed() as Observable<string>;
    }

    public describe( title: string, label: string ): Observable<string> {
        return this.dialog.open( InputDialogComponent, { data: { title, label, input: '', asToken: false }, width: '500px' } )
            .afterClosed() as Observable<string>;
    }
}
