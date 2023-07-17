import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import { GROUP_STORE } from 'intact-models';
import { GlobalState } from '../../_core';
import { AppDataInput } from '../../apps';
import { AppResolver } from '../../apps';
import { GroupsService } from '../../groups/data/groups.service';
// ────────────────────────────────────────────────────────────────────────────

@Injectable( {
    providedIn: 'root'
} )
export class AppUserListResolver implements Resolve<AppDataInput> {
    constructor(
        _appSvc: GlobalState,
        private _appRsv: AppResolver,
        proxy: GroupsService ) {
        _appSvc.register( GROUP_STORE, proxy );
    }
    public resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot )
        : AppDataInput {
        return this._appRsv.resolve( route, state );
    }
}
