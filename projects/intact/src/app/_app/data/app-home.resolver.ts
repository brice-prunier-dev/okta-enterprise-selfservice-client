import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {DetailDataModel, ViewModelManager, queryAny} from 'joe-viewmodels';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HomeResolver implements Resolve<DetailDataModel> {

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): DetailDataModel {
        const vm = new DetailDataModel(
            ViewModelManager.INSTANCE.createViewModelEntry(
                'Home',
                queryAny)
        );
        return vm;
    }
}
