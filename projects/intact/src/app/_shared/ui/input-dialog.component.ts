import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { isStringAssigned } from 'joe-fx';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

interface InputDialogData {
    title: string;
    label: string;
    input: string;
    asToken: boolean;
}

@Component({
    selector: 'iam-input-dialog',
    template: `
        <div class="header-box dialog-header dialog-title flex-row">
            <img mat-card-avatar class="title-icon" src="/assets/dialog_info.png" />
            <span class="header">{{ data.title }}</span>
        </div>
        <mat-dialog-content>
            <mat-form-field class="full-width">
                <input
                    #input
                    matInput
                    required="true"
                    (keyup)="onInputChanged($event)"
                    [(ngModel)]="data.input"
                />
                <mat-label>{{ data.label }}</mat-label>
                <mat-hint *ngIf="input.value == undefined || input.value.length == 0"
                    >Mandatory value for OK button to become enabled</mat-hint
                >
                <mat-hint *ngIf="withFormatHint">Input should be lowercase without space.</mat-hint>
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button
                mat-button
                cdkFocusInitial
                [mat-dialog-close]="data.input"
                [disabled]="input.value == undefined || input.value.length == 0"
            >
                Ok
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            .mat-dialog-content {
                padding-top: 20px;
            }
        `
    ],
    standalone: true,
    imports: [MatCardModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, NgIf, MatButtonModule]
})
export class InputDialogComponent implements OnInit {
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
    constructor(@Inject(MAT_DIALOG_DATA) public data: InputDialogData) {}

    ngOnInit() {
        this._invalidKeyTyped = false;
    }

    get label(): string {
        return this.data ? this.data.label : '';
    }

    get input(): string {
        return this.data ? this.data.input : '';
    }

    set input(value: string) {
        this.data.input = value;
    }

    get withFormatHint(): boolean {
        return isStringAssigned(this.input) && this._invalidKeyTyped;
    }

    public onInputChanged(event: KeyboardEvent) {
        if (this.data.asToken) {
            const newInput = (event.target as HTMLInputElement).value;
            if (this._invalidKeys.includes(event.key)) {
                this._invalidKeyTyped = true;
                this.input = newInput.replace(' ', '-').toLowerCase();
            }
        }
    }
}
