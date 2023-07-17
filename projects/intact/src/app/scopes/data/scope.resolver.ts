import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import { SCOPE_STORE, PROJECTITEM_TYPE } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import { GlobalState } from '../../_core';
import { ScopesService } from './scopes.service';
import { ProjectDetailResolver } from '../../projectsnav';
import { IStore } from 'joe-types';
import { ScopeSubscriberType } from './types';
import { isBlank } from 'joe-fx';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class ScopeResolver implements Resolve<ScopeSubscriberType> {
    constructor(
        private _projDetailRslvr: ProjectDetailResolver,
        _userState: GlobalState,
        _scopeApiSvc: ScopesService
    ) {
        _userState.register(SCOPE_STORE, _scopeApiSvc as IStore);
    }
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ScopeSubscriberType {
        const scpId = isBlank(route.params.scpId)
            ? route.pathFromRoot.find((p) => p.params.scpId !== undefined)!.params.scpId
            : route.params.scpId;
        const [projListVm, projVm] = this._projDetailRslvr.resolve(route, state);
        if (projVm.loaded) {
            projVm.selecting(scpId, PROJECTITEM_TYPE.scope);
        } else {
            const sub = projVm.onStateChanged.subscribe((p) => {
                if (projVm.loaded) {
                    sub.unsubscribe();
                    projVm.selecting(scpId, PROJECTITEM_TYPE.scope);
                }
            });
        }
        return [projListVm, projVm, scpId];
    }
}
