import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Inject
} from '@angular/core';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';
import { AuthConfig } from 'angular-oauth2-oidc';
import { ServiceAppDocView, APPLICATION_TYPE } from 'intact-models';
import { isStringAssigned, ValidationScopes } from 'joe-fx';
import { GlobalState, IAM_CONFIG } from '../../../_core';
import { ValidationMessagePipe } from '../../../_shared/pipes/valmsg.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
    selector: 'iam-app-service',
    templateUrl: './app-service.component.html',
    styleUrls: ['../app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, ClipboardModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule, MatProgressSpinnerModule, ValidationMessagePipe]
})
export class AppServiceComponent implements OnInit {
    // #region Properties (2)

    @Input() public app!: ServiceAppDocView;
    @Input() public editable!: boolean;

    public validatingName = false;
    public hideClientId = true;
    public hideClientSecret = true;
    tokenUrl: string;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(
        @Inject(IAM_CONFIG) authConfig: AuthConfig,
        private _appSvc: GlobalState,
        private _cd: ChangeDetectorRef
    ) {
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

    public get isSaml(): boolean {
        return this.isAssigned && this.app.application_type === APPLICATION_TYPE.Saml;
    }

    public get isUpdate(): boolean {
        return isStringAssigned(this.app.created);
    }

    validateClientName(app: ServiceAppDocView) {
        app.validateAsync(ValidationScopes.Property, 'client_name');
    }

    // #endregion Public Accessors (4)

    // #region Public Methods (4)

    public refreshLayout(): void {
        this._cd.markForCheck();
    }

    public ngOnInit() {}

    // #endregion Public Methods (4)
}
