import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
// ────────────────────────────────────────────────────────────────────────────
import { IViewElement, RuntimeSummary, Objview } from 'joe-fx';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-validation',
    template: `
        <mat-list *ngIf="visible" dense>
            <mat-list-item class="error" *ngFor="let err of errors">{{ err }}</mat-list-item>
        </mat-list>
    `,
    styles: ['.error { color: red; }'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ValidationComponent implements OnInit {
    @Input('element') public element!: IViewElement;

    public summary: RuntimeSummary;

    constructor() {
        this.summary = new RuntimeSummary();
    }

    public get errors(): string[] {
        this.summary.clearAll();
        const messages = this.element.$src.type.fillValidationSummary(
            this.element.$validation.errors,
            this.summary,
            this.element.$src.path
        ).messages;
        return this.element instanceof Objview
            ? messages.filter((rm) => rm.property === '_').map((rm) => rm.msg)
            : messages.map((rm) => rm.msg);
    }

    public get visible(): boolean {
        return (
            this.element !== undefined &&
            this.element.$validation !== undefined &&
            this.element.$validation.withError()
        );
    }

    public ngOnInit() {}
}
