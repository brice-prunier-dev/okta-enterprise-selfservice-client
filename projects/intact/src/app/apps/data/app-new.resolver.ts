import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { APPDEF_STORE, APPDEF_TYPEDEF, PROJECTITEM_TYPE } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import { GlobalState } from '../../_core';
import { AppNewViewModel } from './app-new.viewmodel';
import { ApplicationService } from './apps.service';
import { ProjectDetailResolver } from '../../projectsnav';
import { queryNew, ViewModelManager, StoreManager } from 'joe-viewmodels';
import { AppNewDataInput } from './types';
import { Subscription } from 'rxjs';

// ────────────────────────────────────────────────────────────────────────────
@Injectable({
    providedIn: 'root'
})
export class AppNewResolver implements Resolve<AppNewDataInput> {
    // #region Constructors (1)
    private _subs = new Subscription();
    constructor(
        private _userState: GlobalState,
        _appsProxy: ApplicationService,
        private _projDetailRslvr: ProjectDetailResolver
    ) {
        StoreManager.INSTANCE.registerStore(_appsProxy, APPDEF_STORE);
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): AppNewDataInput {
        const [projListVm, projVm] = this._projDetailRslvr.resolve(route, state);
        projVm.selecting(undefined, PROJECTITEM_TYPE.newApp);
        const vm = ViewModelManager.INSTANCE.resolveCurrentViewModel<AppNewViewModel>(
            AppNewViewModel,
            queryNew
        );
        if (projVm.loaded) {
            vm.projectView = projVm.view;
        } else {
            this._subs.unsubscribe();
            this._subs.add(
                projVm.onStateChanged.subscribe((p) => {
                    if (projVm.loaded) {
                        vm.projectView = projVm.view;
                    }
                })
            );
        }
        return [vm, projListVm, projVm];
    }

    // #endregion Public Methods (1)
}
