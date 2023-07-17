import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import {ViewModelManager, StoreManager, queryById} from 'joe-viewmodels';
import {AppUsagesDataInput} from './types';
import {AppResolver} from '../../apps';
import {AppUsagesContext} from './app-usages.context';
import {AppUsagesService} from './app-usages.service';
import {UserUsagesContext} from './user-usage.context';

// ────────────────────────────────────────────────────────────────────────────
export const CDH_STORE = 'cdh';

@Injectable({
    providedIn: 'root'
})
export class AppUsagesResolver implements Resolve<AppUsagesDataInput> {
    // #region Constructors (1)
    constructor(private _appDetailRslvr: AppResolver, appUsagesProxy: AppUsagesService) {
        StoreManager.INSTANCE.registerStore(appUsagesProxy, CDH_STORE);
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): AppUsagesDataInput {
        const [projsViewModel, projDetailViewModel, appViewModel] = this._appDetailRslvr.resolve(
            route,
            state
        );

        const appContext = ViewModelManager.INSTANCE.resolveDependentViewModel<AppUsagesContext>(
            AppUsagesContext,
            queryById(appViewModel.entry.query.id as string),
            appViewModel
        );

        const userContext = ViewModelManager.INSTANCE.resolveDependentViewModel<UserUsagesContext>(
            UserUsagesContext,
            queryById(projDetailViewModel.entry.query.id as string),
            projDetailViewModel
        );

        return [projDetailViewModel, appViewModel, appContext, userContext];
    }

    // #endregion Public Methods (1)
}
