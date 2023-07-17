import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { GlobalState } from '../../_core';
import { AppResolver } from '../../apps';
import type { AppDataInput } from '../../apps';
// ────────────────────────────────────────────────────────────────────────────

@Injectable( {
    providedIn: 'root'
} )
export class AppGroupLinkResolver implements Resolve<AppDataInput> {
    constructor( _appSvc: GlobalState, private _appRsv: AppResolver ) {

    }
    public resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot )
        : AppDataInput {
        return this._appRsv.resolve( route, state );
    }
}
