import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ViewModelManager, queryList } from 'joe-viewmodels';
import { KPI_STORE } from 'intact-models';
import { GlobalState } from '../../_core';
import { KpiListViewModel } from './kpi-list.viewmodel';
import { KpisService } from './kpis.service';

// ────────────────────────────────────────────────────────────────────────────────
@Injectable({
    providedIn: 'root'
})
export class KpisResolver implements Resolve<KpiListViewModel> {
    // #region Properties (2)


    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(userState: GlobalState, private _kpisProxy: KpisService) {
        userState.register(KPI_STORE, this._kpisProxy);
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): KpiListViewModel {
        const vm = ViewModelManager.INSTANCE.resolveStaticViewModel<KpiListViewModel>(
            KpiListViewModel,
            queryList
        );

        if (!vm.loaded) {
            vm.loadOp();
        }

        return vm;
    }

    // #endregion Public Methods (1)
}
