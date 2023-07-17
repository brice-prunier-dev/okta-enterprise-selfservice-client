import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Inject
} from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectionListChange, MatListModule } from '@angular/material/list';
import { AuthConfig } from 'angular-oauth2-oidc';
import { isStringAssigned, ValidationScopes } from 'joe-fx';
import { DefaultAppDocView, NATIVE_GRANT_TYPE_VALUES, GRANT_TYPE } from 'intact-models';
import { IAM_CONFIG } from '../../../_core';
import { ValidationMessagePipe } from '../../../_shared/pipes/valmsg.pipe';
import { ValidationComponent } from '../../../_shared/ui/app-validation.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'iam-app-native',
    templateUrl: './app-native.component.html',
    styleUrls: ['../app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, ClipboardModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule, MatProgressSpinnerModule, MatListModule, NgFor, MatChipsModule, ValidationComponent, ValidationMessagePipe]
})
export class AppNativeComponent implements OnInit {
    // #region Properties (3)

    public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @Input() public app!: DefaultAppDocView;
    @Input() public editable!: boolean;
    tokenUrl: string;

    readonly propertyValidation: ValidationScopes = ValidationScopes.Property;
    public validatingName = false;

    public GRANT_TYPES = NATIVE_GRANT_TYPE_VALUES;
    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(@Inject(IAM_CONFIG) authConfig: AuthConfig, private _cd: ChangeDetectorRef) {
        this.tokenUrl = authConfig.tokenEndpoint!;
    }

    // #endregion Constructors (1)

    // #region Public Accessors (4)

    public labelBehaviour(): FloatLabelType {
        return this.editable ? 'auto' : 'always';
    }

    public get isAssigned(): boolean {
        return this.app !== undefined;
    }

    public get isUpdate(): boolean {
        return isStringAssigned(this.app.created);
    }

    // #endregion Public Accessors (4)

    // #region Public Methods (8)

    public addLogout(event: any): void {
        if (this.editable) {
            const input = event.target as HTMLInputElement;
            const value = input.value;
            // Add our fruit
            if ((value || '').trim()) {
                this.app.logout_uris.add(value.trim());
            }
            // Reset the input value
            if (input) {
                input.value = '';
            }
            if (!this.app.logout_uris.$validation.withError()) {
                this.app.validate(this.propertyValidation, 'logout_uris');
            }
            this._cd.markForCheck();
        }
    }

    public addRedirect(event: any): void {
        if (this.editable) {
            const input = event.target as HTMLInputElement;
            const value = input.value;
            // Add our fruit
            if ((value || '').trim()) {
                this.app.redirect_uris.add(value.trim());
            }
            // Reset the input value
            if (input) {
                input.value = '';
            }
            if (!this.app.redirect_uris.$validation.withError()) {
                this.app.validate(this.propertyValidation, 'redirect_uris');
            }
            this._cd.markForCheck();
        }
    }

    public isAppGrantType(granType: string): boolean {
        return this.app.grant_types.indexOf(granType as GRANT_TYPE) > -1;
    }

    public onGrantTypeChanged(event: MatSelectionListChange) {
        const gt = event.source.selectedOptions.selected.map((v) => v.value as GRANT_TYPE);
        if (gt && gt.length > 0) {
            this.app.grant_types = gt;
        } else {
            this.app.grant_types = [];
        }
    }

    public refreshLayout(): void {
        this._cd.markForCheck();
    }

    public ngOnInit() {}

    public removeLogout(url: string): void {
        if (this.editable) {
            this.app.logout_uris.remove(url);
            if (!this.app.logout_uris.$validation.withError()) {
                this.app.validate(ValidationScopes.Property, 'logout_uris');
            }
            this._cd.markForCheck();
        }
    }

    public removeRedirect(url: string): void {
        if (this.editable) {
            this.app.redirect_uris.remove(url);
            if (!this.app.redirect_uris.$validation.withError()) {
                this.app.validate(ValidationScopes.Property, 'redirect_uris');
            }
            this._cd.markForCheck();
        }
    }

    validateClientName() {
        this.app.validateAsync(ValidationScopes.Property, 'client_name');
    }
    // #endregion Public Methods (8)
}
