import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
// ────────────────────────────────────────────────────────────────────────────
import { isBlank } from 'joe-fx';
import { StoreManager } from 'joe-viewmodels';
import { USERS_STORE, PROJECTITEM_TYPE } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────
import { ProjectsViewModel } from '../../_core';
import { ProjectDetailResolver, ProjectDetailViewModel } from '../../projectsnav';
import { UsersService } from './users.service';

// ────────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class GroupDetailResolver
    implements Resolve<[ProjectsViewModel, ProjectDetailViewModel, string]>
{
    // #region Constructors (1)

    constructor(private _projDetailRslvr: ProjectDetailResolver, _usersProxy: UsersService) {
        StoreManager.INSTANCE.registerStore(_usersProxy, USERS_STORE);
    }

    // #endregion Constructors (1)

    // #region Public Methods (3)

    public resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): [ProjectsViewModel, ProjectDetailViewModel, string] {
        const grpId = isBlank(route.params.grpId)
            ? route.pathFromRoot.find((p) => p.params.grpId !== undefined)!.params.grpId
            : route.params.grpId;
        const [projListVm, projVm] = this._projDetailRslvr.resolve(route, state);
        if (projVm.loaded) {
            projVm.selecting(grpId, PROJECTITEM_TYPE.group);
        } else {
            const sub = projVm.onStateChanged.subscribe((p) => {
                if (projVm.loaded) {
                    sub.unsubscribe();
                    projVm.selecting(grpId, PROJECTITEM_TYPE.group);
                }
            });
        }

        return [projListVm, projVm, grpId];
    }

    // #endregion Public Methods (3)
}
