import {IRuntimeContext, RuntimeEntry, StoreManager, ListDataModel} from 'joe-viewmodels';
import {
    MyKpiInfoData,
    KpiInfoType,
    ProjectDocData,
    MY_KPI_STORE,
    GroupLinkData,
    AppLinkData,
    UserDocData
} from 'intact-models';
import {KpisService} from './kpis.service';
import moment from 'moment';
import {environment} from 'projects/intact/src/environments/environment';
import {StringMap} from 'joe-fx';
import {SharedAccountData} from 'dist/intact-models/lib/kpis/shared-account.model';

export class MyKpiListViewModel extends ListDataModel<MyKpiInfoData> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, KpiInfoType, parentContext);
        this.contextname = 'My Kpi List';
    }

    public loadOp(): Promise<void> {
        const store = StoreManager.INSTANCE.store<KpisService>(MY_KPI_STORE);
        const self = this;

        return store.getMine().then((ks) => {
            self.setView(ks);
        });
    }

    public getDeprecatedAccounts(project: ProjectDocData) {
        const projectKpi = this.view.find((c) => c.projectId === project.id);
        return projectKpi?.deprecatedAccount;
    }

    public getSharedAccounts(project: ProjectDocData) {
        const projectKpi = this.view.find((c) => c.projectId === project.id);
        return Object.entries(projectKpi?.sharedAccounts ?? {});
    }
    public getSharedServices(project: ProjectDocData) {
        const projectKpi = this.view.find((c) => c.projectId === project.id);
        return Object.entries(projectKpi?.sharedService ?? {});
    }

    public getUnusedScopes(project: ProjectDocData, context: ProjectDocData[]) {
        const usedScopes = [project, ...context].flatMap((c) => c.apps).flatMap((c) => c.scopes);
        const unusedLastUpdate = this.view.find(
            (kpi) => project.id === kpi.projectId
        )?.unusedScopes;
        const stillUnused = unusedLastUpdate?.filter((c) => usedScopes.indexOf(c) === -1);
        return stillUnused ?? [];
    }

    unusedApps(project: ProjectDocData) {
        return project.apps.filter((app) => this.isUnused(project, app));
    }

    isUnused(project: ProjectDocData, app: AppLinkData): boolean {
        const publicProject: boolean = project.public ?? false;
        const date = moment(app.usage);
        const publicMaxNonUsed = environment.env === 'prod' ? 12 : 6;
        const maxNonUsed = publicProject === false ? 3 : publicMaxNonUsed;

        return date.add(maxNonUsed, 'month') < moment();
    }

    uselessGroups(project: ProjectDocData) {
        return project.groups.filter((group) => this.groupIsUseless(project, group));
    }

    groupIsUseless(project: ProjectDocData, group: GroupLinkData): boolean {
        const usedGroups = project.admins
            .concat(project.apps.flatMap((c) => c.admins))
            .concat(project.apps.flatMap((c) => c.groups))
            .concat(project.scopes.flatMap((c) => c.admins))
            .concat(project.groups.filter((c) => c.oid != group.oid).flatMap((c) => c.admins));
        return usedGroups.every((c) => c !== group.oid);
    }

    missingCmdbApps(project: ProjectDocData): AppLinkData[] {
        return project.apps.filter((app) => this.appIsMissingCmdb(project, app));
    }

    appIsMissingCmdb(project: ProjectDocData, app: AppLinkData): boolean {
        const hasCmdb = app.cmdbId !== undefined || project.cmdbs.length === 1;

        return hasCmdb === false;
    }

    groupHasWarning(
        project: ProjectDocData,
        group: GroupLinkData,
        users: StringMap<UserDocData>
    ): boolean {
        const groupWarnings = this.groupsWarnings(project, group, users);
        return (
            groupWarnings.uselessGroup ||
            groupWarnings.sharedAccounts.length !== 0 ||
            groupWarnings.deprecatedAccounts.length !== 0
        );
    }

    appHasWarning(project: ProjectDocData, app: AppLinkData): boolean {
        return (
            this.appIsMissingCmdb(project, app) ||
            this.isUnused(project, app) ||
            this.getSharedServices(project)?.find(([appId, data]) => appId === app.oid) !==
            undefined
        );
    }

    appWarnings(project: ProjectDocData, app: AppLinkData) {
        const e = this.getSharedServices(project)?.filter(([appId, data]) => appId === app.oid);

        return {
            unusedSince: this.isUnused(project, app) ? app.usage : undefined,
            missingCmdb: this.appIsMissingCmdb(project, app)
                ? {noProject: project.cmdbs.length === 0}
                : undefined,
            sharedService: e.map(([appId, app]) => app)
        };
    }

    groupsWarnings(
        project: ProjectDocData,
        group: GroupLinkData,
        users: StringMap<UserDocData>
    ): GroupWarnings {
        const deprecatedAccount = this.getDeprecatedAccounts(project)?.filter((c) =>
            c.groups.some((c) => c.profile.name === group.label)
        );
        const sharedAccounts = this.getSharedAccounts(project).filter(
            ([_, data]) =>
                users[data.login] !== undefined &&
                users[data.login].groupNames.find((c) => c === group.label)
        );

        return {
            uselessGroup: this.groupIsUseless(project, group),
            deprecatedAccounts:
                deprecatedAccount?.map((c) => ({
                    account: c.account.profile.login,
                    owner: {
                        login: c.account.profile.email,
                        status: c.accountOwner?.status
                    }
                })) ?? [],
            sharedAccounts: sharedAccounts?.map(([_, data]) => data)
        };
    }
    scopeHasWarning(project: ProjectDocData, scope: string, context: ProjectDocData[]): boolean {
        return this.scopeIsUseless(project, scope, context);
    }

    scopeWarnings(project: ProjectDocData, scope: string, context: ProjectDocData[]) {
        return {
            uselessScope: this.scopeIsUseless(project, scope, context)
        };
    }
    scopeIsUseless(project: ProjectDocData, scope: string, context: ProjectDocData[]) {
        return this.getUnusedScopes(project, context).find((c) => scope === c) !== undefined;
    }
}

export type GroupWarnings = {
    uselessGroup: boolean;
    deprecatedAccounts: Array<{
        account: string;
        owner: {
            status?: string;
            login: string;
        };
    }>;
    sharedAccounts: SharedAccountData[];
};
