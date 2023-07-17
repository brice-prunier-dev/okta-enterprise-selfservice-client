import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ViewModelManager, queryAny, queryList } from 'joe-viewmodels';
import { Injectable } from '@angular/core';
import { MyKpiListViewModel } from './my-kpi-list.viewmodel';
import { MY_KPI_STORE } from 'intact-models';
import { KpisService } from './kpis.service';
import { GlobalState } from '../../_core';

@Injectable( {
    providedIn: 'root'
} )
export class MyKpiResolver implements Resolve<MyKpiListViewModel> {

    constructor(userState: GlobalState, private _kpisProxy: KpisService) {
        userState.register(MY_KPI_STORE, this._kpisProxy);
    }

    public resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): MyKpiListViewModel {
        const vm = ViewModelManager.INSTANCE.resolveStaticViewModel<MyKpiListViewModel>(
            MyKpiListViewModel,
            queryList
        );
        if (!vm.loaded) {
            vm.loadOp();
        }
        return vm;
    }
}
