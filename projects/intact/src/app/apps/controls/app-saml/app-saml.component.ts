import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnChanges
} from '@angular/core';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';
import { SamlAppDocView } from 'intact-models';
import { GlobalState } from '../../../_core';
import { DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'iam-app-saml',
    templateUrl: './app-saml.component.html',
    styleUrls: ['../app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatFormFieldModule, MatInputModule, FormsModule]
})
export class AppSamlComponent implements OnInit, OnChanges {
    // #region Properties (2)

    @Input() public app!: SamlAppDocView;
    @Input() public editable!: boolean;

    certificateValidFrom = '';
    certificateValidTo = '';
    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(
        private _appSvc: GlobalState,
        private _cd: ChangeDetectorRef,
        private _datePipe: DatePipe
    ) { }

    // #endregion Constructors (1)

    // #region Public Accessors (4)

    public labelBehaviour(): FloatLabelType {
        return this.editable ? 'auto' : 'always';
    }

    public get isAssigned(): boolean {
        return this.app !== undefined;
    }
    // #endregion Public Accessors (4)

    // #region Public Methods (4)

    public refreshLayout(): void {
        this._cd.markForCheck();
    }

    public ngOnInit() {}
    public ngOnChanges() {
        this.certificateValidFrom = this._datePipe.transform(this.app.saml_app_info?.certificate?.from_date, 'dd MMM yyyy HH:mm') || '';
        this.certificateValidTo = this._datePipe.transform(this.app.saml_app_info?.certificate?.to_date, 'dd MMM yyyy HH:mm') || '';
    }

    // #endregion Public Methods (4)
}
