import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
// ────────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-user-label-matcher',
    template: `
        <span style="color: inherit;">{{ prefix }}</span>
        <span style="font-weight: bold; color: lightcoral;">{{ highlight }}</span>
        <span style="color: inherit;">{{ suffix }}</span>
    `,
    styles: ['highlight {color: green; }'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class UserLabelHighlightComponent implements OnInit {
    // #region Properties (5)

    @Input() public label!: string;
    @Input() public searchText!: string;

    public highlight = '';
    public prefix = '';
    public suffix = '';

    // #endregion Properties (5)

    // #region Constructors (1)

    constructor() {}

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public ngOnInit() {
        if (this.searchText) {
            const minimizedInput = this.label.toLowerCase().replace(' ', '.');
            const minimizedSearchText = this.searchText.toLowerCase();
            const start = minimizedInput.indexOf(minimizedSearchText);
            if (start === -1) {
                this.prefix = this.label;
            } else if (start === 0) {
                this.highlight = this.label.substr(0, this.searchText.length);
                this.suffix = this.label.substring(this.searchText.length);
            } else {
                this.prefix = this.label.substr(0, start);
                this.highlight = this.label.substr(start, this.searchText.length);
                this.suffix = this.label.substring(start + this.searchText.length);
            }
        } else {
            this.prefix = this.label;
        }
    }

    // #endregion Public Methods (1)
}
