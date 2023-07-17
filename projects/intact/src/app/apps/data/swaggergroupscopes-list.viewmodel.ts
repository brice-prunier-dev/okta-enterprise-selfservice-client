import {IRuntimeContext, RuntimeEntry, ListDataModel} from 'joe-viewmodels';
import {AppLinkData, GroupScopesData, GroupScopesType, ProjectDocData} from 'intact-models';
import {environment} from 'projects/intact/src/environments/environment';
import {asPromise, DataObj, sameString, StringMap} from 'joe-fx';

export class SwaggerGroupsScopesViewModel extends ListDataModel<GroupScopesData> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, GroupScopesType, parentContext);
        this.contextname = 'Group Scopes List';
    }

    public get withData(): boolean {
        return this.loaded && this.view.length > 0;
    }

    public getAllAppGroupsScopesAsync(
        project: ProjectDocData,
        appLink: AppLinkData
    ): Promise<GroupScopesData[]> {
        return new Promise<GroupScopesData[]>((resolve, reject) => {
            try {
                if (this.loaded) {
                    resolve(this.getAllAppGroupsScopes(project, appLink));
                } else {
                    const self = this;
                    this.onStateChanged.subscribe((s) => {
                        if (self.loaded) {
                            resolve(self.getAllAppGroupsScopes(project, appLink));
                        }
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public getAllAppGroupsScopes(project: ProjectDocData, appLink: AppLinkData): GroupScopesData[] {
        const audienceConfig = environment.audiences;
        const audienceView = this.view
            .filter((r) => {
                return (
                    sameString(r.label, appLink.audience) &&
                    (sameString(r.oid, audienceConfig.b2e.oid) ||
                        sameString(r.oid, audienceConfig.gem.oid) ||
                        sameString(r.oid, audienceConfig.all.oid))
                );
            })
            .slice();

        const result = this.view
            .filter((r) => {
                return (
                    !sameString(r.label, 'default') &&
                    !sameString(r.oid, audienceConfig.b2e.oid) &&
                    !sameString(r.oid, audienceConfig.gem.oid) &&
                    !sameString(r.oid, audienceConfig.all.oid)
                );
            })
            .slice();

        const groupIds = appLink.groups.slice();
        const appGroups = project.groups.filter((g) => groupIds.includes(g.oid));
        appGroups
            .filter((g) => !result.some((r) => sameString(r.oid, g.oid)))
            .forEach((g) =>
                result.push({
                    oid: g.oid,
                    label: g.label,
                    scopes: []
                })
            );

        if (appLink.audience && appLink.audience !== 'prj') {
            if (audienceView.length > 0) {
                result.push(audienceView[0]);
            } else {
                result.push({
                    oid: (audienceConfig as StringMap<any>)[appLink.audience].oid,
                    label: (audienceConfig as StringMap<any>)[appLink.audience].label,
                    scopes: []
                });
            }
        }

        this.setView(result);

        return result;
    }
}
