import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
    selector: 'iam-confirm-dialog',
    template: `
  <div class="header-box dialog-header dialog-title flex-row">
    <img *ngIf="data.info" mat-card-avatar class="title-icon" src="/assets/dialog_info.png">
    <img *ngIf="!data.info"mat-card-avatar class="title-icon" src="/assets/dialog_confirm.png">
    <span class="header">{{data.title}}</span>
</div>
<mat-dialog-content>{{data.message}}</mat-dialog-content>
<mat-dialog-actions align="end">
  <button *ngIf="data.info" mat-button mat-dialog-close>Close</button>
  <button *ngIf="!data.info" mat-button mat-dialog-close>No</button>
  <button *ngIf="!data.info" mat-button [mat-dialog-close]="true">Yes</button>
</mat-dialog-actions>
  `,
    styles: [`
    .mat-dialog-content {
      padding-top: 20px;
    }
  `],
    standalone: true,
    imports: [
        NgIf,
        MatCardModule,
        MatDialogModule,
        MatButtonModule,
    ],
})
export class ConfirmDialogComponent implements OnInit {
  // #region Constructors (1)

  constructor(
    @Inject( MAT_DIALOG_DATA ) public data: any ) {
  }

  // #endregion Constructors (1)

  // #region Public Methods (1)

  public ngOnInit() {
  }

  // #endregion Public Methods (1)
}
