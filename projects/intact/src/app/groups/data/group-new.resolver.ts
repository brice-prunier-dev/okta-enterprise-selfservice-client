import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import { queryNew, ViewModelManager, StoreManager } from 'joe-viewmodels';
import { GROUP_STORE, PROJECTITEM_TYPE } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import { ProjectsViewModel } from '../../_core';
import { ProjectDetailResolver, ProjectDetailViewModel } from '../../projectsnav';
import { GroupNewViewModel } from './group-new.viewmodel';
import { GroupsService } from './groups.service';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class GroupNewResolver
    implements Resolve<[GroupNewViewModel, ProjectsViewModel, ProjectDetailViewModel]>
{
    // #region Constructors (1)

    constructor(_groupsProxy: GroupsService, private _projDetailRslvr: ProjectDetailResolver) {
        StoreManager.INSTANCE.registerStore(_groupsProxy, GROUP_STORE);
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): [GroupNewViewModel, ProjectsViewModel, ProjectDetailViewModel] {
        const [projListVm, projVm] = this._projDetailRslvr.resolve(route, state);
        projVm.selecting(undefined, PROJECTITEM_TYPE.newGroup);
        const vm = ViewModelManager.INSTANCE.resolveCurrentViewModel<GroupNewViewModel>(
            GroupNewViewModel,
            queryNew
        );
        vm.projectVm = projVm;
        return [vm, projListVm, projVm];
    }

    // #endregion Public Methods (1)
}
