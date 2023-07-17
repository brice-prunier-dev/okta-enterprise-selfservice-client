import {
    DetailViewModel,
    IRuntimeContext,
    RuntimeEntry,
    StoreManager,
    ViewModelManager,
    queryById
} from 'joe-viewmodels';
import {
    ServiceAppDocView,
    DefaultAppDocView,
    AppDocData,
    APPLICATION_TYPE,
    APPDEF_STORE,
    AppLinkView,
    ServiceAppDocType,
    SamlAppDocType
} from 'intact-models';
import {isAssigned} from 'joe-fx';
import {AppApisViewModel} from './appapi-list.viewmodel';
import {ApplicationService} from './apps.service';
import {SwaggerGroupsScopesViewModel} from './swaggergroupscopes-list.viewmodel';
import {DefaultAppDocType} from 'projects/intact-models/src';

export class AppViewModel extends DetailViewModel<
    AppDocData,
    ServiceAppDocView | DefaultAppDocView
> {
    // #region Properties (2)
    private _apisVm: AppApisViewModel;
    private _swaggerScopesVm: SwaggerGroupsScopesViewModel;
    public app!: AppLinkView;
    // #endregion Properties (2)
    // #region Constructors (1)

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, DefaultAppDocType, parentContext);
        this.contextname = 'App Detail';
        const id = this.entry.query.id as string;
        const apiEntry = ViewModelManager.INSTANCE.createViewModelEntry(
            (AppApisViewModel as any).name,
            queryById(id)
        );
        this._apisVm = new AppApisViewModel(apiEntry);
        this._swaggerScopesVm = new SwaggerGroupsScopesViewModel(apiEntry);
    }

    // #endregion Constructors (1)

    // #region Public Accessors (3)
    // public projectVm: ProjectDetailViewModel;

    public get apis(): AppApisViewModel {
        return this._apisVm;
    }

    public get swaggerScopes(): SwaggerGroupsScopesViewModel {
        return this._swaggerScopesVm;
    }

    // public get groups(): GroupsViewModel {
    //     return this._groupsVm;
    // }

    public get appType(): APPLICATION_TYPE {
        return isAssigned(this.view) ? this.view.application_type : APPLICATION_TYPE.Native;
    }

    // #endregion Public Accessors (3)

    // #region Public Methods (2)

    public loadData(data: AppDocData) {
        switch (data.application_type) {
            case APPLICATION_TYPE.Saml:
                super.loadData(data, SamlAppDocType);
                break;
            case APPLICATION_TYPE.Service:
                super.loadData(data, ServiceAppDocType);
                break;
            default:
                super.loadData(data, DefaultAppDocType);
                break;
        }
    }

    onLoad(): void {
        return;
    }

    persistAsync(view: ServiceAppDocView | DefaultAppDocView): Promise<any> {
        const payload = view.$json() as unknown as AppDocData;
        const store = StoreManager.INSTANCE.store<ApplicationService>(APPDEF_STORE);
        return store.putOneAsync(payload).then((r) => {
            store.syncDocIdentity(r, view);
            return r;
        });
    }

    public release(): void {
        super.release();
        this._apisVm.release();
    }

    // #endregion Public Methods (2)
}
