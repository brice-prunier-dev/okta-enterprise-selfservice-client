import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {SCOPE_STORE, SCOPE_TYPEDEF, PROJECTITEM_TYPE} from 'intact-models';
import {queryNew, ViewModelManager, StoreManager} from 'joe-viewmodels';
// ────────────────────────────────────────────────────────────────────────────
import {ProjectsViewModel} from '../../_core';
import {ScopeNewViewModel} from './scope-new.viewmodel';
import {ScopesService} from './scopes.service';
import {ProjectDetailViewModel, ProjectDetailResolver} from '../../projectsnav';

// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class ScopeNewResolver implements Resolve<[ScopeNewViewModel, ProjectsViewModel, ProjectDetailViewModel]> {
    // #region Constructors (1)

    constructor(
        _scopesProxy: ScopesService,
        private _projDetailRslvr: ProjectDetailResolver) {
        StoreManager.INSTANCE.registerStore(_scopesProxy, SCOPE_STORE);
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
        : [ScopeNewViewModel, ProjectsViewModel, ProjectDetailViewModel] {
        const [projListVm, projVm] = this._projDetailRslvr.resolve(route, state);
        projVm.selecting(undefined, PROJECTITEM_TYPE.newScope);
        const vm = ViewModelManager.INSTANCE.resolveCurrentViewModel<ScopeNewViewModel>(
            ScopeNewViewModel,
            queryNew);
        vm.projectViewModel = projVm;
        return [vm, projListVm, projVm];
    }

    // #endregion Public Methods (1)
}
