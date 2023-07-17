import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import {APPAPIS_STORE} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import {GlobalState} from '../../_core';
import {AppResolver} from '../../apps';
import {AppDataInput} from '../../apps';
import {AppApisService} from './appapis.service';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class ApiSubscriptionsResolver implements Resolve<AppDataInput> {
    constructor(
        private _appRsv: AppResolver,
        _globalState: GlobalState,
        apiSvc: AppApisService) {
        _globalState.register(APPAPIS_STORE, apiSvc);
    }
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
        : AppDataInput {
        return this._appRsv.resolve(route, state);
    }
}
