import {
    DetailViewModel,
    CommandNotification,
    RuntimeEntry,
    IRuntimeContext
} from 'joe-viewmodels';
import {
    ScopeLinkView,
    SCOPE_PREFIX,
    GroupLinkView,
    ResourceLinkData,
    ScopeLinkType,
    ScopeLinkData
} from 'intact-models';
import {ProjectDetailViewModel} from '../../projectsnav';
import {RuntimeMessage} from 'joe-fx';
import {ValidationRule} from 'projects/joe-fx/src';

export class ScopeNewViewModel extends DetailViewModel<ScopeLinkData, ScopeLinkView> {
    // #region Properties (5)

    private _projectViewModel!: ProjectDetailViewModel;

    // #endregion Properties (5)

    // #region Constructors (1)
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, ScopeLinkType, parentContext);
        this.contextname = 'New Scope';

        RuntimeMessage.Register('projectscope', (args) => {
            const projid = args.projid;
            return `should contains ${projid} or application name part!`;
        });
    }

    // #endregion Constructors (1)

    // #region Public Accessors (3)

    public get projectViewModel(): ProjectDetailViewModel {
        return this._projectViewModel;
    }

    public set projectViewModel(input: ProjectDetailViewModel) {
        this._projectViewModel = input;
        if (!input) {
            this.error = 'projectViewModel is not assigned';
        } else if (!this.loaded) {
            this.rules = {
                oid: this._projectViewModel.scopeValidationError.bind(
                    this._projectViewModel
                ) as unknown as ValidationRule<ScopeLinkData>
            };
            const newScope = input.view.scopes.$newChild<ScopeLinkView>();
            this.setView(newScope);

            newScope.oid = SCOPE_PREFIX + this._projectViewModel.view.id;

            input.view.admins.forEach((adminRef: string) => newScope.admins.add(adminRef), this);

            this.view.validate();
        }
    }

    public addToProject(data: ResourceLinkData) {
        this.projectViewModel.view.scopes.add(this.view);
        this.projectViewModel.view.$editor!.endEdit();
        this.projectViewModel.checkMeGroup();
        this.projectViewModel.onStateChanged.next(CommandNotification.StateChanged);
    }

    public projectGroups(): GroupLinkView[] {
        return this._projectViewModel ? this._projectViewModel.view.groups : [];
    }

    public terminate() {
        if (this.view.$rules?.oid !== undefined) {
            delete this.view.$rules.oid;
        }
        super.terminate();
    }

    // #endregion Public Accessors (3)
}
