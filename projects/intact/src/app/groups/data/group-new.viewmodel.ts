import {
    IRuntimeContext,
    queryById,
    RuntimeEntry,
    DetailViewModel,
    ViewModelManager
} from 'joe-viewmodels';
import {GroupLinkData, GroupLinkType, GroupLinkView} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import {GroupMembersViewModel} from '../../_core';
import {ProjectDetailViewModel} from '../../projectsnav';
import {GroupsService} from './groups.service';
// ────────────────────────────────────────────────────────────────────────────

export class GroupNewViewModel extends DetailViewModel<GroupLinkData, GroupLinkView> {
    // #region Properties (5)

    private _projectVm!: ProjectDetailViewModel;

    // #endregion Properties (5)

    // #region Constructors (1)

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, GroupLinkType, parentContext);
        this.contextname = 'New Group';
    }

    // #endregion Constructors (1)

    // #region Public Accessors (3)

    public get projectVm(): ProjectDetailViewModel {
        return this._projectVm;
    }

    public set projectVm(input: ProjectDetailViewModel) {
        if (this._projectVm !== input) {
            this._projectVm = input;
            this.setView(input.view.groups.$newChild());
        }
    }

    public get projectGroups(): GroupLinkView[] {
        return this._projectVm ? this._projectVm.view.groups : [];
    }

    public addToProject(oid: string, proxy: GroupsService): void {
        this.view.oid = oid;
        this._projectVm.view.groups.add(this.view);
        this._projectVm.view.$editor!.endEdit();
        const key = (GroupMembersViewModel as any).name;
        const entry = ViewModelManager.INSTANCE.createViewModelEntry(key, queryById(oid));
        const vm = new GroupMembersViewModel(entry);
        vm.group = this.view;
        this._projectVm.groupMembersViewModels.push(vm);
        proxy
            .getGroupMembersAsync(oid)
            .then((result) => vm.loadData(result))
            .catch((err) => vm.setError(err));
    }

    // #endregion Public Accessors (3)
}
