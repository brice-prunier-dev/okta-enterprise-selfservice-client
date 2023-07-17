import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Inject
} from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FloatLabelType } from '@angular/material/form-field';
import { MatSelectionListChange } from '@angular/material/list';
import { AuthConfig } from 'angular-oauth2-oidc';
import { isStringAssigned, ValidationScopes } from 'joe-fx';
import {
    DefaultAppDocView,
    BROWSER_GRANT_TYPE_VALUES,
    GRANT_TYPE,
    APPLICATION_TYPE
} from 'intact-models';
import { IAM_CONFIG } from '../../../_core';

@Component({
    selector: 'iam-app-browser',
    templateUrl: './app-browser.component.html',
    styleUrls: ['../app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppBrowserComponent implements OnInit {
    // #region Properties (3)

    public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @Input() public app!: DefaultAppDocView;
    @Input() public editable!: boolean;
    tokenUrl: string;

    public validatingName = false;

    readonly propertyValidation: ValidationScopes = ValidationScopes.Property;

    public GRANT_TYPES = BROWSER_GRANT_TYPE_VALUES;
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
            this.app.grant_types = [GRANT_TYPE.AuthorizationCode, GRANT_TYPE.Implicit];
        }
    }

    public refreshLayout(): void {
        this._cd.markForCheck();
    }

    public ngOnInit() {
        if (this.isAssigned && this.app.application_type !== APPLICATION_TYPE.Service) {
            this.tokenUrl = this.tokenUrl.replace('/token', '/authorize');
        }
    }

    public removeLogout(url: string): void {
        if (this.editable) {
            this.app.logout_uris.remove(url);
            if (!this.app.logout_uris.$validation.withError()) {
                this.app.validate(this.propertyValidation, 'logout_uris');
            }
            this._cd.markForCheck();
        }
    }

    public removeRedirect(url: string): void {
        if (this.editable) {
            this.app.redirect_uris.remove(url);
            if (!this.app.redirect_uris.$validation.withError()) {
                this.app.validate(this.propertyValidation, 'redirect_uris');
            }
            this._cd.markForCheck();
        }
    }

    // #endregion Public Methods (8)
}
