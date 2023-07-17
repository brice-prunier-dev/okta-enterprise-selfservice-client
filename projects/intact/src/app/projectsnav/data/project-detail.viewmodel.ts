import {
    DetailViewModel,
    StoreManager,
    CommandNotification,
    RuntimeEntry,
    IRuntimeContext
} from 'joe-viewmodels';
import {
    ProjectDocView,
    ResourceLinkData,
    PROJECTITEM_TYPE,
    AdministratedItemData,
    SCOPE_PREFIX,
    DATA_PREFIX,
    HTTPS_PREFIX,
    UserDocData,
    UserDocType,
    PROJECT_STORE,
    GROUP_ME_ID,
    ProjectDocData,
    ScopeLinkData,
    USER_TYPES_SERVICE,
    USER_TYPES_TEST,
    ProjectDocType
} from 'intact-models';
import {sameString, ArrayViewFactory, StringMap, JsonObj, DataObj, isBlank} from 'joe-fx';
import {GroupMembersViewModel, ProjectsViewModel} from '../../_core';
import {ProjectsService} from '../../_core';
import {IamApiStore} from 'joe-store-api';
import {SubscriptionDocData} from 'intact-models';
import {USER_TYPES_BOUNTY} from 'intact-models';
import {OidData} from 'joe-models';
import {Subscription} from 'rxjs/internal/Subscription';

export class ProjectDetailViewModel extends DetailViewModel<ProjectDocData, ProjectDocView> {
    public static SELECTION_CHANGED = 'selection-changed';
    public static MEMBER_LOADED = 'members-loaded';
    public links: SubscriptionDocData[] | undefined;
    public subscriptionsDeprecated = false;
    public subscriptions: SubscriptionDocData[] | undefined;
    public totalScopes = 0;
    public totalExtApps = 0;
    public groupMembersViewModels: GroupMembersViewModel[];

    // #region constructor & init
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, ProjectDocType, parentContext);
        this.contextname = 'Project Detail';
        this.groupMembersViewModels = [];
    }

    private _users: StringMap<UserDocData> = {};
    public get users(): StringMap<UserDocData> {
        return this._users;
    }

    public accountUsers: UserDocData[] = [];

    private _isProjectAppAdmin: boolean = false;
    public get isProjectAdmin(): boolean {
        return !!this._isProjectAppAdmin;
    }

    private _selectedItem: ResourceLinkData | undefined;
    public get selectedItem(): ResourceLinkData | undefined {
        return this._selectedItem;
    }

    public selectionType: PROJECTITEM_TYPE = PROJECTITEM_TYPE.project;

    private _selection: string | undefined;
    public get selection(): string | undefined {
        return this._selection;
    }

    public get withSelection(): boolean {
        return this.selectedItem !== undefined;
    }

    public get isAppSelection(): boolean {
        return this.withSelection && this.selectionType === PROJECTITEM_TYPE.application;
    }
    public get isGroupSelection(): boolean {
        return this.withSelection && this.selectionType === PROJECTITEM_TYPE.group;
    }
    public get isScopeSelection(): boolean {
        return this.withSelection && this.selectionType === PROJECTITEM_TYPE.scope;
    }

    public get areUsersLoaded(): boolean {
        return Object.keys(this._users).length > 0;
    }
    public resetLinks(projListVm: ProjectsViewModel) {
        if (!this.subscriptions || this.subscriptionsDeprecated) {
            this.resetSubscriptions();
        }
    }

    public resetSubscriptions() {
        const projectsService = StoreManager.INSTANCE.store<ProjectsService>(PROJECT_STORE);
        const self = this;
        projectsService.subscriptionsByProjectAsync(this.entry.query.id as string).then((r) => {
            self.subscriptions = r;
            self.dispatchSubscriptions();
            self.onStateChanged.next(ProjectsViewModel.ProjectChangedEvent);
        });
    }

    public dispatchSubscriptions() {
        if (this.loaded && this.subscriptions) {
            this.view.scopes.forEach((scp) => {
                scp.subsDocs = this.subscriptions!.filter(
                    (sub) => sub.status === 'active' && sameString(scp.oid, sub.what.item.oid)
                );
                (scp.$src.obj as ScopeLinkData).subsCount = scp.subsDocs?.length;
            });
            this.view.apps.forEach((app) => {
                app.subsDocs = this.subscriptions!.filter((sub) =>
                    sameString(app.oid, sub.target.item.oid)
                );
            });
            this.onStateChanged.next(CommandNotification.DataChanged);
        }
    }

    public onLoad(): void {
        this.dispatchSubscriptions();
    }
    // #endregion constructor & init

    // #region public properties get & set

    // #region public properties

    public selecting(value: string | undefined, type: PROJECTITEM_TYPE) {
        if (this._selection !== value || this.selectionType !== type) {
            this._selection = value;
            this.selectionType = type;
            if (value === undefined || 'new' === value) {
                this._selectedItem = undefined;
            } else if (!!type) {
                switch (type) {
                    case PROJECTITEM_TYPE.application:
                        this.currents[type] = this._selectedItem = this.view.apps.find((a) =>
                            sameString(a.label, value)
                        )!;
                        break;

                    case PROJECTITEM_TYPE.group:
                        this.currents[type] = this._selectedItem = this.view.groups.find((a) =>
                            sameString(a.label, value)
                        )!;
                        break;

                    case PROJECTITEM_TYPE.scope:
                        this.currents[type] = this._selectedItem = this.view.scopes.find((a) =>
                            sameString(a.oid, value)
                        )!;
                        break;
                }
            }
            this.onStateChanged.next(ProjectDetailViewModel.SELECTION_CHANGED);
        }
    }

    // #endregion
    // #region public methods

    public isMyProject(login: string) {
        return this.view.id?.length === 6 && sameString(login.substring(0, 6), this.view.id);
    }

    public isMyVirtulaProject() {
        return this.view.groups.some((g) => g.oid === GROUP_ME_ID);
    }

    public checkMeGroup() {
        if (this.isMyVirtulaProject()) {
            const appStore = StoreManager.INSTANCE.store(
                PROJECT_STORE
            ) as IamApiStore<ProjectDocData>;
            const projectService = appStore as ProjectsService;
            const view = this.view;
            const virtualGroup = view.groups.find((g) => g.oid === GROUP_ME_ID)!;
            const self = this;
            projectService
                .meGroup()
                .then((r) => {
                    virtualGroup.oid = r.oid;
                    virtualGroup.label = r.label;
                    virtualGroup.description = r.description!;
                    virtualGroup.fixed = r.fixed;
                    if (view.apps.length === 1 && view.apps[0].admins.length === 1) {
                        view.apps[0].admins.remove(GROUP_ME_ID);
                        view.apps[0].admins.add(r.oid);
                    }
                    if (view.scopes.length === 1 && view.scopes[0].admins.length === 1) {
                        view.scopes[0].admins.remove(GROUP_ME_ID);
                        view.scopes[0].admins.add(r.oid);
                    }
                    if (view.$isEditing) {
                        view.$editor!.endEdit();
                    }
                })
                .catch((err) => self.setError(err));
        }
    }

    public buildUsers(userInfo?: [string, string[]]) {
        const users: StringMap<UserDocData> = {};
        const accounts: StringMap<UserDocData> = {};
        const withUserInfo = userInfo !== undefined && userInfo.length === 2;
        if (withUserInfo) {
            this._isProjectAppAdmin = false;
            if (this.isMyProject(userInfo[0])) {
                this._isProjectAppAdmin = true;
            }
        }
        for (const groupMembersVm of this.groupMembersViewModels) {
            if (groupMembersVm.loaded) {
                if (withUserInfo) {
                    if (
                        this.view.admins.includes(groupMembersVm.group.oid) &&
                        userInfo[1].includes(groupMembersVm.group.label)
                    ) {
                        this._isProjectAppAdmin = true;
                    }
                }
                for (const user of groupMembersVm.view) {
                    const projUser = users[user.profile.login];
                    if (projUser === undefined) {
                        user.groupNames = [groupMembersVm.group.label];
                        users[user.profile.login] = user;
                        if (
                            user.profile.userType === USER_TYPES_SERVICE ||
                            user.profile.userType === USER_TYPES_TEST ||
                            user.profile.userType === USER_TYPES_BOUNTY
                        ) {
                            accounts[user.profile.login] = user;
                        }
                    } else {
                        projUser.groupNames.push(groupMembersVm.group.label);
                    }
                    if (withUserInfo) {
                        if (
                            !this._isProjectAppAdmin &&
                            sameString(user.profile.login, userInfo[0]) &&
                            this.view.admins.includes(groupMembersVm.group.oid)
                        ) {
                            this._isProjectAppAdmin = true;
                        }
                    }
                }
            }
        }
        this._users = users;
        this.accountUsers = Object.values(accounts);
        this.onStateChanged.next(ProjectDetailViewModel.MEMBER_LOADED);
    }

    whenUsersLoaded(): Promise<StringMap<UserDocData>> {
        const self = this;
        return new Promise<StringMap<UserDocData>>((resolve, reject) => {
            if (Object.keys(self._users).length > 0) {
                resolve(self._users);
            } else {
                const sub = new Subscription();
                try {
                    sub.add(
                        self.onStateChanged.subscribe((p) => {
                            if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                                resolve(self._users);
                                sub.unsubscribe();
                            }
                        })
                    );
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    public isAdmin(userGroups: string[]): boolean {
        var userProjectGroups = this.view.groups.filter((pg) =>
            userGroups.some((ug) => sameString(ug, pg.label))
        );
        return this.view.admins.some((grpId) =>
            userProjectGroups.some((upg) => sameString(grpId, upg.oid))
        );
    }

    public isItemAdmin(item: AdministratedItemData, login: string, userGroups: string[]) {
        if (item === undefined) {
            return false;
        }
        if (this.isMyProject(login)) {
            return true;
        }

        for (const groupMembersVm of this.groupMembersViewModels) {
            if (
                groupMembersVm.loaded &&
                item.admins &&
                item.admins.includes(groupMembersVm.group.oid)
            ) {
                if (userGroups.some((s) => sameString(s, groupMembersVm.group.label))) {
                    return true;
                }
                if (groupMembersVm.view.some((u) => sameString(u.profile.login, login))) {
                    return true;
                }
            }
        }
        return false;
    }

    public adminsOf(items: AdministratedItemData | AdministratedItemData[]): UserDocData[] {
        const members: UserDocData[] = [];
        if (!Array.isArray(items)) {
            items = [items];
        }
        for (const item of items) {
            for (const groupMembersVm of this.groupMembersViewModels) {
                if (
                    groupMembersVm.loaded &&
                    item.admins &&
                    item.admins.includes(groupMembersVm.group.oid)
                ) {
                    groupMembersVm.view.forEach((u) => {
                        if (!members.some((m) => u.profile.login === m.profile.login)) {
                            members.push(u);
                        }
                    });
                }
            }
        }
        return ArrayViewFactory.SortFromTypeDef(members, UserDocType);
    }

    public scopeValidationError(item: OidData): DataObj | undefined {
        const oid = item.oid;
        const projectId = this.view.id;
        const apiPrefix = SCOPE_PREFIX;
        const dataPrefix = DATA_PREFIX;
        const httpsPrefix = HTTPS_PREFIX;
        if (isBlank(oid) || !oid.startsWith(apiPrefix) || !oid.startsWith(apiPrefix) || !oid.startsWith(apiPrefix)) {
            return undefined
        }

        if (oid.startsWith(HTTPS_PREFIX)) {
            return undefined;
        } 

        const oidSuffix = oid.startsWith(SCOPE_PREFIX)
            ? oid.substring(SCOPE_PREFIX.length)
            : oid.substring(DATA_PREFIX.length);
        
        if (oidSuffix === projectId || oidSuffix.startsWith( projectId + '.')) {
            return undefined;
        } else {
            const scopeSegments = oidSuffix.split(/\.-_/);
            const apps = this.view.apps;
            // const appKeyWords = ['client', 'swagger', 'api', 'server', 'feeder', 'connector'];
            // tslint:disable-next-line: prefer-for-of
            for (let index = 0; index < apps.length; index++) {
                const app = apps[index];
                const appName = app.label.toLocaleLowerCase();
                const segments = appName.split(/-|_|\./);
                if (scopeSegments.some((s) => segments.includes(s))) {
                    return undefined;
                }
            }
            return {
                projectscope: {projid: '"' + projectId + '" or an application name segment'}
            };
        }
    }

    public groupCopyTo(sourceGroupId: string, targetGroupId: string): void {
        const source = this.groupMembersViewModels.find((gvm) => gvm.group.oid === sourceGroupId);
        const target = this.groupMembersViewModels.find((gvm) => gvm.group.oid === targetGroupId);
        if (source && target && source.loaded && target.loaded) {
            const members = target.view;
            source.view.forEach((u) => {
                if (!members.some((m) => m.profile.login === u.profile.login)) {
                    members.push(u);
                }
            });
            target.setView(ArrayViewFactory.SortFromTypeDef(members, UserDocType));
        }
    }

    public release(): void {
        if (this.groupMembersViewModels) {
            this.groupMembersViewModels.forEach((vm) => {
                if (vm.entry) {
                    vm.entry.static = false;
                    vm.release();
                }
            });
        }
        this.subscriptions = undefined;
        super.release();
    }

    // #endregion public methods
}
