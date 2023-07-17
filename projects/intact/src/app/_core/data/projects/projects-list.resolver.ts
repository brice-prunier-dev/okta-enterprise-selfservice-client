import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { PROJECT_STORE, PROJECT_TYPEDEF } from 'intact-models';
import { ViewModelManager, queryList } from 'joe-viewmodels';
import { GlobalState } from '../../services/global.state';
import { ProjectsService } from '../../services/projects.service';
import { ProjectsViewModel } from './projects-list.viewmodel';

// ────────────────────────────────────────────────────────────────────────────────
@Injectable({
    providedIn: 'root'
})
export class ProjectsResolver implements Resolve<ProjectsViewModel> {
    // #region Properties (2)

    private _userState: GlobalState;
    projectsProxy: ProjectsService;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(userState: GlobalState, projectsProxy: ProjectsService) {
        this._userState = userState;
        this.projectsProxy = projectsProxy;
        userState.register(PROJECT_STORE, projectsProxy);
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ProjectsViewModel {
        const vm = ViewModelManager.INSTANCE.resolveStaticViewModel<ProjectsViewModel>(
            ProjectsViewModel,
            queryList
        ) as ProjectsViewModel;
        if (!vm.loaded) {
            vm.loadOp(this._userState.login);
        }

        return vm;
    }

    // #endregion Public Methods (1)
}
