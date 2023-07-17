import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import { GlobalState } from './global.state';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    // #region Constructors (1)
    private _globalState: GlobalState;
    constructor(globalState: GlobalState) {
        this._globalState = globalState;
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this._globalState.isAuthenticated) {
            return true;
        }

        const navstate = state.url.includes('/projects/') ? state.url : '';

        if (state.url.indexOf('?') === -1) {
            this._globalState.initFlow(navstate);
            this._globalState.runLoginFlow();
            return state.url.startsWith('/home');
        } else {
            this._globalState.runLoginFlow();
            return true;
        }
    }

    // #endregion Public Methods (1)
}
