import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProjectDetailResolver } from '../../projectsnav';
import { GlobalState } from '../../_core';
import { PROJECTITEM_TYPE, AdministratedItemData } from 'intact-models';
import { Objview, isBlank } from 'joe-fx';
import { AdminListInput } from './types';
import { OidData } from 'joe-models';

@Injectable({
    providedIn: 'root'
})
export class AdminsResolver implements Resolve<AdminListInput> {
    // #region Constructors (1)

    constructor(private _appSvc: GlobalState, private _projDetailRslvr: ProjectDetailResolver) {}

    // #endregion Constructors (1)

    // #region Public Methods (3)

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): AdminListInput {
        const projId = isBlank(route.params.projId)
            ? route.pathFromRoot.find((p) => p.params.projId !== undefined)!.params.projId
            : route.params.projId;

        let itemType = PROJECTITEM_TYPE.project;
        let itemId = projId;
        if (state.url.includes('/apps/')) {
            itemType = PROJECTITEM_TYPE.application;
            itemId = isBlank(route.params.appId)
                ? route.pathFromRoot.find((p) => p.params.appId !== undefined)!.params.appId
                : route.params.appId;
        } else if (state.url.includes('/groups/')) {
            itemType = PROJECTITEM_TYPE.group;
            itemId = isBlank(route.params.grpId)
                ? route.pathFromRoot.find((p) => p.params.grpId !== undefined)!.params.grpId
                : route.params.grpId;
        } else if (state.url.includes('/scopes/')) {
            itemType = PROJECTITEM_TYPE.scope;
            itemId = isBlank(route.params.scpId)
                ? route.pathFromRoot.find((p) => p.params.scpId !== undefined)!.params.scpId
                : route.params.scpId;
        }
        const [projListVm] = this._projDetailRslvr.resolve(route, state);

        let loadingFailureMessage: `No {itemType} in {projId} matches {itemId}`;
        let loadingResult: (Objview & OidData & AdministratedItemData) | undefined;
        const projectView = projListVm.currentProject!.view;
        switch (itemType) {
            case PROJECTITEM_TYPE.application:
                loadingResult = projectView.apps.find((app) => app.label === itemId)!;
                break;
            case PROJECTITEM_TYPE.group:
                loadingResult = projectView.groups.find((grp) => grp.label === itemId)!;
                break;
            case PROJECTITEM_TYPE.scope:
                loadingResult = projectView.scopes.find((scp) => scp.oid === itemId)!;
                break;
            case PROJECTITEM_TYPE.project:
                loadingResult = projectView;
                break;
        }

        return loadingResult !== undefined
            ? [projListVm, itemType, loadingResult]
            : [projListVm, itemType, `No ${itemType} in ${projId} matches ${itemId}`];
    }

    // #endregion Public Methods (3)
}
