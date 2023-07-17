import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { PROJECT_TYPEDEF, GROUP_ME_ID, PROJECT_STORE } from 'intact-models';
import {
    GlobalState,
    ProjectsResolver,
    GroupMembersViewModel,
    ProjectsViewModel,
    ProjectsService
} from '../../_core';

import { ProjectDetailViewModel } from './project-detail.viewmodel';
import { CommandNotification, queryById, ViewModelManager } from 'joe-viewmodels';
import { isBlank, isMatchingSelector } from 'joe-fx';

// ────────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class ProjectDetailResolver implements Resolve<[ProjectsViewModel, ProjectDetailViewModel]> {
    // #region Constructors (1)

    constructor(
        private _userState: GlobalState,
        private _router: Router,
        private _projListRslvr: ProjectsResolver
    ) {}

    // #endregion Constructors (1)

    // #region Public Methods (3)

    public loadProjectGroupsMembers(projVm: ProjectDetailViewModel) {
        const viewModelManager = ViewModelManager.INSTANCE;
        const groupMembersVmName = (GroupMembersViewModel as any).name;
        if (projVm.groupMembersViewModels.length === 0) {
            // projVm.groupMembersViewModels = [];
            const login = this._userState.login;
            const groups = this._userState.groups;
            const memberOps: Promise<any>[] = projVm.view.groups.map((group) => {
                const entry = viewModelManager.createViewModelEntry(
                    groupMembersVmName,
                    queryById(group.oid)
                );
                const vm = new GroupMembersViewModel(entry);
                vm.group = group;
                projVm.groupMembersViewModels.push(vm);
                return vm.loadOp(this._userState);
            });
            Promise.all(memberOps).then(() => projVm.buildUsers([login, groups]));
        }
        return Promise.resolve(false);
    }

    public resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): [ProjectsViewModel, ProjectDetailViewModel] {
        const projListVm = this._projListRslvr.resolve(route, state);
        const id = isBlank(route.params.projId)
            ? route.pathFromRoot.find((p) => p.params.projId !== undefined)!.params.projId
            : route.params.projId;
        const vm = ViewModelManager.INSTANCE.resolveCurrentViewModel<ProjectDetailViewModel>(
            ProjectDetailViewModel,
            { id }
        );

        if (vm.loaded) {
            projListVm.setCurrentProject(id, vm);
            vm.resetLinks(projListVm);
        } else if (!vm.entry.handled) {
            vm.handled();

            const self = this;
            if (projListVm.loaded) {
                projListVm.setCurrentProject(id, vm);
                vm.resetLinks(projListVm);
                this.loadProjectGroupsMembers(vm);
            } else {
                projListVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged && projListVm.loaded) {
                        if (!projListVm.setCurrentProject(id, vm)) {
                            self._router.navigate(['/me'], { replaceUrl: true });
                        }
                        vm.resetLinks(projListVm);
                        self.loadProjectGroupsMembers(vm);
                    }
                });
            }
        }
        return [projListVm, vm];
    }

    // #endregion Public Methods (3)
}
