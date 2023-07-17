import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import {SCOPE_TYPEDEF, SCOPE_STORE} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import {queryList, ViewModelManager, StoreManager} from 'joe-viewmodels';
import {ScopeListViewModel} from './scope-list.viewmodel';
import {ScopesService} from './scopes.service';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class ScopeListResolver implements Resolve<ScopeListViewModel> {
    constructor(
        public scopesProxy: ScopesService) {
        StoreManager.INSTANCE.registerStore(scopesProxy, SCOPE_STORE);
    }
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
        : ScopeListViewModel {
        const vm = ViewModelManager.INSTANCE.resolveCurrentViewModel<ScopeListViewModel>(
            ScopeListViewModel,
            queryList);

        if (!vm.loaded) {
            this.scopesProxy.getAllAsync()
                .then((r) => vm.loadData(r))
                .catch((err) => vm.setError(err));
        }
        return vm;

    }
}
