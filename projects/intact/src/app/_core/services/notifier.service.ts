import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
// ────────────────────────────────────────────────────────────────────────────
import { INotifier } from 'joe-viewmodels';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class NotifierService implements INotifier {
    // #region Constructors (1)

    constructor(public snackBar: MatSnackBar) {}

    // #endregion Constructors (1)

    // #region Public Methods (2)

    notify(message: string, action: string) {
        // setTimeout guards against `ExpressionChangedAfterItHasBeenCheckedError`
        setTimeout(() => {
            this.snackBar.open(message, action, {
                duration: 2000
            });
        }, 0);
    }

    notifyFunc(): (message: string, action: string) => void {
        const snackBar = this.snackBar;
        return function (message: string, action: string) {
            // setTimeout guards against `ExpressionChangedAfterItHasBeenCheckedError`
            setTimeout(() => {
                snackBar.open(message, action, {
                    duration: 2000
                });
            }, 0);
        };
    }

    // #endregion Public Methods (2)
}
