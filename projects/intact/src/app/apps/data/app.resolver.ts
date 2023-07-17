import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { APPDEF_STORE, PROJECTITEM_TYPE, AppLinkView, AppDocData } from 'intact-models';
import { AppViewModel } from './app.viewmodel';
import { ProjectDetailResolver, ProjectDetailViewModel } from '../../projectsnav';

import { isBlank, isStringAssigned } from 'joe-fx';
import { ApplicationService } from './apps.service';
import { AppDataInput } from './types';
import { ViewModelManager, StoreManager, CommandNotification } from 'joe-viewmodels';

// ────────────────────────────────────────────────────────────────────────────────
@Injectable({
    providedIn: 'root'
})
export class AppResolver implements Resolve<AppDataInput> {
    // #region Constructors (1)

    constructor(
        private _appsProxy: ApplicationService,
        private _projDetailRslvr: ProjectDetailResolver
    ) {
        StoreManager.INSTANCE.registerStore(_appsProxy, APPDEF_STORE);
    }

    // #endregion Constructors (1)

    // #region Public Methods (3)

    public loadApp(appId: string, appVm: AppViewModel, projId: string) {
        const getApp = this._appsProxy
            .getByLabel(appVm.app.label)
            .then((result: AppDocData) => {
                if (appVm.app && !isStringAssigned(result.description)) {
                    result.description = appVm.app?.description;
                }
                (result as any).project = projId;
                appVm.loadData(result);
                appVm.onStateChanged.next(CommandNotification.StateChanged);
            })
            .catch((err) => {
                appVm.setError(err);
            });
    }

    public loadAppApis(appId: string, caller: AppViewModel) {
        if (caller.apis && (!caller.apis.loaded || caller.apis.entry.validity < new Date())) {
            this._appsProxy
                .getAppApisInfoAsync(appId)
                .then((r) => caller.apis.loadData(r))
                .catch((err) => caller.setError(err));
        }
        if (
            caller.app.swagger &&
            caller.swaggerScopes &&
            (!caller.swaggerScopes.loaded || caller.swaggerScopes.entry.validity < new Date())
        ) {
            this._appsProxy
                .getSwaggerScopesAsync(appId)
                .then((r) => caller.swaggerScopes.loadData(r))
                .catch((err) => caller.setError(err));
        }
    }

    private syncVm(projVm: ProjectDetailViewModel, vm: AppViewModel) {
        vm.app = projVm.selectedItem as AppLinkView;
        vm.error = undefined;
        // vm.readonly( true );
    }
    private loadVm(vm: AppViewModel, appName: string, projId: string) {
        if (!vm.loaded) {
            if (vm.app) {
                this.loadApp(appName, vm, projId);
                // this.loadAppUsers( appId, vm );
                this.loadAppApis(appName, vm);
            } else {
                vm.error = `no application named {appName} exist fin project {projId}`;
            }
            // vm.groups.setView( appGroupLinks )
        }
    }

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): AppDataInput {
        const appName = isBlank(route.params.appId)
            ? route.pathFromRoot.find((p) => p.params.appId !== undefined)!.params.appId
            : route.params.appId;
        const [projListVm, projVm] = this._projDetailRslvr.resolve(route, state);
        const vm = ViewModelManager.INSTANCE.resolveCurrentViewModel<AppViewModel>(AppViewModel, {
            id: appName
        });

        if (vm.loaded && projVm.loaded) {
            if (
                projVm.selection !== appName ||
                projVm.selectionType !== PROJECTITEM_TYPE.application
            ) {
                projVm.selecting(appName, PROJECTITEM_TYPE.application);
                this.syncVm(projVm, vm);
                this.loadVm(vm, appName, projVm.entry.query.id as string);
            }
        } else if (!vm.entry.handled) {
            vm.handled();
            if (projVm.loaded) {
                if (
                    projVm.selection !== appName ||
                    projVm.selectionType !== PROJECTITEM_TYPE.application
                ) {
                    projVm.selecting(appName, PROJECTITEM_TYPE.application);
                    this.syncVm(projVm, vm);
                    this.loadVm(vm, appName, projVm.entry.query.id as string);
                }
            } else {
                const self = this;
                const sub = projVm.onStateChanged.subscribe(() => {
                    if (projVm.loaded) {
                        sub.unsubscribe();
                        if (
                            projVm.selection !== appName ||
                            projVm.selectionType !== PROJECTITEM_TYPE.application
                        ) {
                            projVm.selecting(appName, PROJECTITEM_TYPE.application);
                            self.syncVm(projVm, vm);
                            self.loadVm(vm, appName, projVm.entry.query.id as string);
                        }
                    }
                });
            }
        }

        // const query = JSON.stringify( { id } );

        return [projListVm, projVm, vm];
    }

    // #endregion Public Methods (3)
}
