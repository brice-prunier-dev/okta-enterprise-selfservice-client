import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
// ────────────────────────────────────────────────────────────────────────────
import { isBlank, isString, JsonObj } from 'joe-fx';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgIf, JsonPipe } from '@angular/common';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-error',
    template: `
        <div *ngIf="errorDef.visible">
            <mat-expansion-panel class="panel-error" hideToggle="compactMode">
                <mat-expansion-panel-header>
                    <mat-panel-title> {{ errorDef.title }} </mat-panel-title>
                    <mat-panel-description *ngIf="!compactMode">
                        {{ errorDef.message }}
                    </mat-panel-description>
                    <button mat-icon-button (click)="close()"><mat-icon>cancel</mat-icon></button>
                </mat-expansion-panel-header>
                <h3 *ngIf="compactMode">{{ errorDef.message }}</h3>
                {{ errorDef.error | json }}
            </mat-expansion-panel>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: true,
    imports: [NgIf, MatExpansionModule, MatButtonModule, MatIconModule, JsonPipe]
})
export class ErrorComponent {
    // #region Properties (2)

    @Input() public compactMode: boolean = false;

    public errorDef: { visible: boolean; message: string; title: string; error?: JsonObj };

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor() {
        this.errorDef = { visible: true, title: 'Error', message: '?' };
    }

    // #endregion Constructors (1)

    // #region Public Accessors (1)

    @Input() public set value(v: any | string) {
        if (!isBlank(v)) {
            this.errorDef.visible = true;
            if (isString(v)) {
                this.errorDef.message = v;
            } else {
                if (v.message) {
                    this.errorDef.message = v.message;
                }
                const error = v.error || v.data;
                if (error) {
                    if (isString(error)) {
                        this.errorDef.message = error;
                    } else if (v.statusText && error.message) {
                        this.errorDef.title = v.statusText;
                        this.errorDef.message = this.removeRedundance(
                            v.statusText,
                            v.error.message
                        );
                    } else if (error.message) {
                        this.errorDef.message = error.message;
                    } else if (error.title) {
                        this.errorDef.message = error.title;
                    }
                    this.errorDef!.error = error.errors;
                }
            }
            this.compactMode = isBlank(this.errorDef.error);
        } else {
            this.errorDef.visible = false;
        }
    }

    // #endregion Public Accessors (1)

    // #region Private Methods (1)

    private removeRedundance(status: string, text: string): string {
        return text.toLowerCase().startsWith(status.toLowerCase())
            ? text.substring(status.length + 1)
            : text;
    }

    close() {
        this.value = undefined;
    }
    // #endregion Private Methods (1)
}
