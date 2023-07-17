import {DetailViewModel, StoreManager, RuntimeEntry, IRuntimeContext} from 'joe-viewmodels';
import {
    ServiceAppDocView,
    DefaultAppDocView,
    APPLICATION_TYPE,
    GRANT_TYPE,
    RESPONSE_TYPE,
    APPDEF_STORE,
    AppLinkView,
    ProjectDocView,
    GroupLinkView,
    AppDocData,
    DefaultAppDocType
} from 'intact-models';
import {newGuid} from 'joe-types';
import {ApplicationService} from './apps.service';
import {isBlank, ValidationScopes} from 'joe-fx';

export class AppNewViewModel extends DetailViewModel<
    AppDocData,
    ServiceAppDocView | DefaultAppDocView
> {
    // #region Properties Internal (5)

    private _userView!: DefaultAppDocView;
    private _projectView!: ProjectDocView;
    private _serviceView!: ServiceAppDocView;
    private _type!: APPLICATION_TYPE;

    // #endregion Properties Internal (5)

    // #region Properties Public (7)

    public appLinkView!: AppLinkView;

    public get appFlow(): string {
        switch (this.appType) {
            case APPLICATION_TYPE.Service:
                return 'Client Credential Flow';
            case APPLICATION_TYPE.Browser:
                return 'Authorization Code Flow';
            case APPLICATION_TYPE.Swagger:
                return 'Authorization Code Flow';
            default:
                return 'Implicit Flow';
        }
    }

    public get projectGroups(): GroupLinkView[] {
        return this._projectView ? this._projectView.groups : [];
    }

    public get projectView(): ProjectDocView {
        return this._projectView;
    }

    public set projectView(input: ProjectDocView) {
        if (this._projectView === undefined) {
            this._projectView = input;
            this.appLinkView = input.apps.$newChild();
            input.admins.forEach((oid) => this.appLinkView.admins.add(oid), this);
        }
    }

    // public get adminsGroups(): GroupLinkView[] {
    //     return this._projectView
    //         ? this._projectView
    //             .groups
    //             .filter( g => this._projectView.admins.includes( g.oid ) )
    //         : [];

    // }
    public get appType(): APPLICATION_TYPE {
        return this._type;
    }

    public set appType(input: APPLICATION_TYPE) {
        this._type = input;
        const old_view = this.view;
        const old_client_id = old_view.client_id;
        const old_client_name = old_view.client_name;
        const old_client_uri = old_view.client_uri;
        if (old_view.$isEditing) {
            old_view.$editor?.cancelEdit();
        }
        let new_view: ServiceAppDocView | DefaultAppDocView;
        switch (input) {
            case APPLICATION_TYPE.Service:
                if (!this._serviceView) {
                    this._serviceView = new ServiceAppDocView();
                }
                this._serviceView.application_type = APPLICATION_TYPE.Service;
                this._serviceView.grant_type = GRANT_TYPE.ClientCredentials;
                this._serviceView.response_types.add(RESPONSE_TYPE.Token);
                new_view = this._serviceView;
                break;
            default:
                if (!this._userView) {
                    this._userView = new DefaultAppDocView();
                }
                this._userView.application_type = input;
                this._userView.grant_type = GRANT_TYPE.AuthorizationCode;
                if (!this._userView.response_types.some((s) => s === RESPONSE_TYPE.Code)) {
                    this._userView.response_types.add(RESPONSE_TYPE.Code);
                }
                new_view = this._userView;
                break;
        }
        this.setView(new_view);
        if (!new_view.$isEditing) {
            this.view.$edit();
        }
        if (!this.isNullView(old_view)) {
            if (!isBlank(old_client_id)) {
                new_view.client_id = old_client_id;
            }
            if (!isBlank(old_client_name)) {
                new_view.client_name = old_client_name;
            }
            if (!isBlank(old_client_uri)) {
                new_view.client_uri = old_client_uri;
            }
        } else {
            new_view.client_id = newGuid();
        }

        new_view.validate(ValidationScopes.EnforceState);
    }

    // #endregion Properties Public (7)

    // #region Constructors (1)

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, DefaultAppDocType, parentContext);
        this.contextname = 'New App';
    }

    // #endregion Constructors (1)

    // #region Methods Public (3)

    public afterCreate(): void {
        this.appLinkView.oid = this.view.id;
        this.appLinkView.swagger = this.view.application_type === 'swagger';
        this._projectView.apps.add(this.appLinkView);
        this._projectView.$editor!.endEdit();
    }

    public beforeSave(): void {
        switch (this.view.application_type) {
            case 'browser':
            case 'web':
                const defaultDef = this.view as DefaultAppDocView;
                defaultDef.client_uri = defaultDef.initiate_login_uri;
                break;
        }
        this.appLinkView.label = this.view.client_name;
        this.appLinkView.description = this.view.description;
        this.view.project = this._projectView.id;
        this.view.admins = this.appLinkView.admins.$json() as unknown as string[];
    }

    persistAsync(view: ServiceAppDocView | DefaultAppDocView): Promise<any> {
        const store = StoreManager.INSTANCE.store<ApplicationService>(APPDEF_STORE);
        const payload = view.$json() as unknown as AppDocData;
        return store.putOneAsync(payload).then((r) => {
            store.syncDocIdentity(r, view);
            return r;
        });
    }

    // #endregion Methods Public (3)
}
