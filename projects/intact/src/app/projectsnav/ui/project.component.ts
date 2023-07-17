import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { ProjectDetailViewModel } from '../data/project-detail.viewmodel';
import {
    ResourceLinkData,
    GroupLinkData,
    PROJECTITEM_TYPE,
    GroupLinkView,
    AppLinkView,
    ScopeLinkView,
    ReferenceChangesMessageData,
    ProjectDocView
} from 'intact-models';
import { RenamingService } from '../data/renaming.service';
import { IViewElement, Setview, JoeLogger } from 'joe-fx';
import { NotifierService, GlobalState, ProjectsService, ProjectsViewModel } from '../../_core';
import { ConfirmService } from '../../_shared';
import { PartialObserver, Subscription } from 'rxjs';
import { CommandNotification } from 'joe-viewmodels';
import { environment } from 'projects/intact/src/environments/environment';
import { AppLinkData } from 'intact-models';
import { MyKpiListViewModel } from '../../_app/data/my-kpi-list.viewmodel';
import { MatBadgeModule } from '@angular/material/badge';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProjectSelectorComponent } from '../controls/project-selector/project-selector.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgClass, NgStyle, NgIf, NgFor } from '@angular/common';
// ────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgClass, NgStyle, MatProgressBarModule, NgIf, ProjectSelectorComponent, MatExpansionModule, MatIconModule, MatFormFieldModule, MatButtonModule, MatTooltipModule, MatListModule, NgFor, MatMenuModule, ClipboardModule, MatBadgeModule]
})
export class ProjectComponent implements OnInit, OnDestroy {
    // #region Properties (14)

    private _opennedTab: PROJECTITEM_TYPE | undefined;
    private _subs = new Subscription();
    private _isAdmin?: boolean;
    PROJECTITEM_TYPE = PROJECTITEM_TYPE;
    error: any;
    projListVm!: ProjectsViewModel;
    // runningOp: string | undefined;
    vm!: ProjectDetailViewModel;
    vmMyKpis!: MyKpiListViewModel;
    // #endregion Properties (14)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _router: Router,
        private _notifierSvc: NotifierService,
        private _confirmSvc: ConfirmService,
        private _renamingSvc: RenamingService,
        private _projecSvc: ProjectsService,
        route: ActivatedRoute
    ) {
        JoeLogger.debug('ProjectNavComponent');
        this._subs.add(
            route.data.subscribe(this.xInputObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (11)

    get apisOpenned(): boolean {
        return this._opennedTab === undefined
            ? this.vm.selectionType === PROJECTITEM_TYPE.api
            : this._opennedTab === PROJECTITEM_TYPE.api;
    }

    get appsOpenned(): boolean {
        return this._opennedTab === undefined
            ? this.vm.selectionType === PROJECTITEM_TYPE.application
            : this._opennedTab === PROJECTITEM_TYPE.application;
    }

    get groupsOpenned(): boolean {
        return this._opennedTab === undefined
            ? this.vm.selectionType === PROJECTITEM_TYPE.group
            : this._opennedTab === PROJECTITEM_TYPE.group;
    }

    get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    get isNewOption(): boolean {
        return (
            this.vm.selection === undefined &&
            this.vm.selectionType !== undefined &&
            this.vm.selectionType !== PROJECTITEM_TYPE.project
        );
    }

    get isPersonalProject(): boolean {
        return this.initialized && this._userState.isMyProject(this.vm.view.id);
    }

    public get newapiOpenned(): boolean {
        return this._opennedTab === undefined
            ? this.vm.selectionType === PROJECTITEM_TYPE.newApi
            : this._opennedTab === PROJECTITEM_TYPE.newApi;
    }

    get newscopeOpenned(): boolean {
        return this._opennedTab === undefined
            ? this.vm.selectionType === PROJECTITEM_TYPE.newScope
            : this._opennedTab === PROJECTITEM_TYPE.newScope;
    }

    get running(): boolean {
        return !!this.vm.runningOp;
    }

    get scopesOpenned(): boolean {
        return this._opennedTab === undefined
            ? this.vm.selectionType === PROJECTITEM_TYPE.scope
            : this._opennedTab === PROJECTITEM_TYPE.scope;
    }

    get withSelectedApp(): boolean {
        return !!(this.vm && this.vm.loaded && this.vm.selection);
    }

    get isAdmin(): boolean {
        if (this._isAdmin === undefined) {
            if (!this.initialized) {
                return (
                    this._userState.isIntactAdmin ||
                    this._userState.isMyProject(this.vm.entry.query.id as string)
                );
            }
            this._isAdmin =
                this._userState.isIntactAdmin ||
                this._userState.isMyProject(this.vm.entry.query.id as string) ||
                this.vm.isAdmin(this._userState.groups);
        }
        return this._isAdmin;
    }

    // #endregion Public Accessors (11)

    // #region Public Methods (25)

    appStateStyle(id: string, inactive: boolean = false, item: any) {
        return {
            ['standard-link']: true,
            creation: id.startsWith('new-'),
            ['active-link']: this.vm?.selection === id,
            inactive: inactive,
            ['warning-link']:
                environment.toggleFeatures.kpis &&
                this.itemHasWarning(id, PROJECTITEM_TYPE.application, item)
        };
    }

    isActive(item: ResourceLinkData): boolean {
        return this.vm.selectedItem === item;
    }

    isFreezed(fixed: boolean = false): any {
        return {
            ['freezed-light']: fixed,
            ['flex-row']:true,
            ['flex-align-center']:true,
        };
    }

    itemStateStyle(id: string, type: PROJECTITEM_TYPE, item?: any) {
        return {
          ['creation']: id.startsWith('new'),
          ['standard-link']: true,
            ['active-link']:
                (id.startsWith('new') && this._opennedTab === type) || this.vm?.selection === id,
            ['warning-link']: environment.toggleFeatures.kpis && this.itemHasWarning(id, type, item)
        };
    }

    itemHasWarning(id: string, type: PROJECTITEM_TYPE, item?: any) {
        let hasWarning: boolean;
        switch (type) {
            case PROJECTITEM_TYPE.application:
                hasWarning = this.vmMyKpis.appHasWarning(this.vm.view, item);
                break;
            case PROJECTITEM_TYPE.group:
                hasWarning = this.vmMyKpis.groupHasWarning(this.vm.view, item, this.vm.users);
                break;
            case PROJECTITEM_TYPE.scope:
                hasWarning = this.vmMyKpis.scopeHasWarning(this.vm.view, id, this.projListVm.view);
                break;
            default:
                hasWarning = false;
                break;
        }
        return hasWarning;
    }

    menu_app_delete(app: AppLinkView) {
        const self = this;
        const groups = app.groupGroups();
        if (groups.length > 0) {
            const groupInfo = groups.map((g) => g.label).join(', ');
            const msg = `Application: "${app.label}" can't be deleted: it is still linked to : ${groupInfo} !`;
            this._confirmSvc.info('Application Removal', msg);
        } else {
            this._confirmSvc
                .confirm(
                    'Application Removal',
                    `Do you confirm the removal of application: "${app.label}" from project: "${this.vm.view.id}" ?`
                )
                .then((ok) => {
                    if (ok) {
                        self.vm.runningOp = 'Application Removal';
                        self._cd.markForCheck();
                        self._projecSvc
                            .deleteApp(this.vm.view.id, app.oid)
                            .then((r) => {
                                self.vm.view.apps.remove(app);
                                self.vm.view.$editor!.endEdit();
                                self._cd.markForCheck();
                                self._notifierSvc.notify('Application Removal', 'Succeed');
                                self.xRefreshNavigation();
                            })
                            .catch((err) => {
                                self.error = err;
                                self._cd.markForCheck();
                            });
                    }
                });
        }
    }

    menu_app_toggleStatus(appLnk: AppLinkView) {
        const self = this;
        this._projecSvc
            .toggleAppstatus(this.vm.view.id, appLnk.oid, appLnk.label, !appLnk.inactive)
            .then((r) => {
                appLnk.inactive = !appLnk.inactive;
                appLnk.$editor!.endEdit();
                self._cd.markForCheck();
            })
            .catch((err) => {
                self.error = err;
                self._cd.markForCheck();
            });
    }

    // public async menu_singleAdminGroup( adminGroupId: string ): Promise<void> {
    //   await this.setSingleAdminGroup( adminGroupId );
    // }
    async menu_group_asAdmin(adminGroupId: string): Promise<void> {
        const project = this.vm.view;
        let failure = '';
        let done = await this.xSingleAdminGroupForItemAsync(
            adminGroupId,
            project.id,
            PROJECTITEM_TYPE.project,
            project.id,
            project.admins
        );
        if (!done) {
            failure = 'Project';
        }

        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < project.apps.length; index++) {
            const application = project.apps[index];
            done = await this.xSingleAdminGroupForItemAsync(
                adminGroupId,
                project.id,
                PROJECTITEM_TYPE.application,
                application.oid,
                application.admins
            );
            if (!done) {
                failure =
                    failure.length === 0 ? application.label : failure + ', ' + application.label;
            }
        }

        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < project.groups.length; index++) {
            const group = project.groups[index];
            done = await this.xSingleAdminGroupForItemAsync(
                adminGroupId,
                project.id,
                PROJECTITEM_TYPE.group,
                group.oid,
                group.admins
            );
            if (!done) {
                failure = failure.length === 0 ? group.label : failure + ', ' + group.label;
            }
        }

        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < project.scopes.length; index++) {
            const scope = project.scopes[index];
            done = await this.xSingleAdminGroupForItemAsync(
                adminGroupId,
                project.id,
                PROJECTITEM_TYPE.scope,
                scope.oid,
                scope.admins
            );
            if (!done) {
                failure = failure.length === 0 ? scope.oid : failure + ', ' + scope.oid;
            }
        }

        if (failure.length === 0) {
            this._notifierSvc.notify('Ownership Reset', 'Done');
        } else {
            this._notifierSvc.notify('Ownership Reset', 'Failed:' + failure);
        }

        const vm = this.vm;
        const router = this._router;
        const currentUrl = router.url;
        setTimeout(() => {
            router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
                vm.terminate();
                router.navigateByUrl(currentUrl);
            });
        }, 2100);
    }

    menu_group_copyto(
        sourceGroupId: string,
        sourceGroupLabel: string,
        targetGroupId: string,
        targetGroupLabel: string
    ) {
        const self = this;
        this._confirmSvc
            .confirm(
                "Group's member Copy",
                `Do you agree the copy of users from "${sourceGroupLabel}" to "${targetGroupLabel}" ?`
            )
            .then((ok) => {
                if (ok) {
                    self._projecSvc
                        .copyTo(sourceGroupId, targetGroupId)
                        .then((r) => {
                            self.vm.groupCopyTo(sourceGroupId, targetGroupId);
                            self._notifierSvc.notify("Group's member Copy", 'Succeed');
                            self.xRefreshNavigation();
                        })
                        .catch((err) => {
                            self.error = err;
                            self._notifierSvc.notify("Group's member Copy", 'Failed');
                            self._cd.markForCheck();
                        });
                }
            });
    }

    menu_group_delete(group: GroupLinkView) {
        const self = this;
        const view = this.vm.view;
        const apps = group.apps() as AppLinkData[];
        if (apps.length > 0) {
            const groupInfo = apps.map((a) => a.label).join(', ');
            const msg = `Group: "${group.label}" can't be deleted: it is still linked to : ${groupInfo} !`;
            this._confirmSvc.info('Group Removal', msg);
        } else {
            this._confirmSvc
                .confirm(
                    'Group Removal',
                    `Do you confirm the removal of group: "${group.label}" from project: "${this.vm.view.id}" ?`
                )
                .then((ok) => {
                    if (ok) {
                        self._projecSvc
                            .deleteGroup(view.id, group.oid)
                            .then((r) => {
                                view.groups.remove(group);
                                view.$editor!.endEdit();
                                self._cd.markForCheck();
                                self._notifierSvc.notify('Group Removal', 'Succeed');
                                self.xRefreshNavigation();
                            })
                            .catch((err) => {
                                self.error = err;
                                self._cd.markForCheck();
                            });
                    }
                });
        }
    }

    menu_group_mailto(groupOid: string) {
        const members = this.vm.groupMembersViewModels.find((vm) => vm.group.oid === groupOid)!;
        const mails = members.view.map((u) => u.profile.email.replace('@', '%40')).join('%3B%20');
        // window.open( 'mailto:' + mails );
        window.open(
            'https://outlook.office.com/owa/?path=/mail/action/compose&to=' +
                mails +
                '&subject=Customer+Service+Request&body=Add+Your+Request+here'
        );
    }

    menu_group_toggleLock(resource: GroupLinkView) {
        const project = resource.$root() as unknown as ProjectDocView;
        const self = this;
        this._projecSvc
            .lockGroup(resource.oid, resource.label, !resource.fixed, project.oid)
            .then((r) => {
                resource.fixed = !resource.fixed;
                resource.$editor!.endEdit();
                self._cd.markForCheck();
            })
            .catch((err) => {
                self.error = err;
                self._cd.markForCheck();
            });
    }

    menu_rename(resourceType: PROJECTITEM_TYPE, resource: ResourceLinkData & IViewElement) {
        const self = this;
        this._renamingSvc
            .rename(resourceType, resource)
            .then((r) => {
                if (r) {
                    self.xRefreshNavigation();
                }
            })
            .catch((err) => {
                self.error = err;
                self._cd.markForCheck();
            });
    }

    menu_scope_delete(scope: ScopeLinkView) {
        const self = this;
        const apps = this.vm.view.apps.filter((a) => a.scopes.includes(scope.oid));
        if (apps.length > 0) {
            const appInfo = apps.map((a) => a.label).join(', ');
            const msg = `Scope: "${scope.oid}" can't be deleted: it is still linked to : ${appInfo} !`;
            this._confirmSvc.info('Scope Removal', msg);
        } else {
            this._confirmSvc
                .confirm(
                    'Scope Removal',
                    `Do you confirm the removal of scope: "${scope.oid}" from project: "${this.vm.view.id}" ?`
                )
                .then((ok) => {
                    if (ok) {
                        self.vm.runningOp = 'Deleting ' + scope.oid;
                        self._cd.markForCheck();
                        self.vm.onStateChanged.next(CommandNotification.DataChanged);
                        self._projecSvc
                            .deleteScopeAsync(this.vm.view.id, scope.oid)
                            .then((r) => {
                                self.vm.runningOp = undefined;
                                self.vm.onStateChanged.next(CommandNotification.StateChanged);
                                self.vm.view.scopes.remove(scope);
                                self.vm.view.$editor!.endEdit();
                                self._cd.markForCheck();
                                self._notifierSvc.notify('Scope Removal', 'Succeed');
                                self.xRefreshNavigation();
                            })
                            .catch((err) => {
                                self.vm.runningOp = undefined;
                                self.vm.onStateChanged.next(CommandNotification.StateChanged);
                                self.error = err;
                                self._cd.markForCheck();
                            });
                    }
                });
        }
    }

    newApiStateStyle(): any {
        return this.vm?.selectionType === PROJECTITEM_TYPE.newApi
            ? ['square-btn', 'new-pai-btn-active']
            : ['square-btn', 'api'];
    }

    newApp() {
        this.error = undefined;
        this._router.navigateByUrl('/projects/projects/apps/new');
    }

    newAppStateStyle(): any {
        return this.vm?.selectionType === PROJECTITEM_TYPE.newApp
            ? ['square-btn', 'new-app-btn-active']
            : ['square-btn', 'app'];
    }

    newGrpStateStyle(): any {
        return this.vm?.selectionType === PROJECTITEM_TYPE.newGroup
            ? ['square-btn', 'new-grp-btn-active']
            : ['square-btn', 'grp'];
    }

    newItem(event: Event, type: PROJECTITEM_TYPE) {
        event.stopPropagation();
        this.select('new', type);
    }

    newScpStateStyle(): any {
        return this.vm?.selectionType === PROJECTITEM_TYPE.newScope
            ? ['square-btn', 'new-scp-btn-active']
            : ['square-btn', 'scp'];
    }

    ngOnDestroy() {
        this._subs.unsubscribe();
    }

    ngOnInit() {}

    opennedTab(value: PROJECTITEM_TYPE) {
        this._opennedTab = value;
        this._cd.markForCheck();
    }

    otherGroup(label: string): GroupLinkData[] {
        if (this.vm.loaded) {
            return this.vm.view.groups.filter((g) => g.label !== label);
        }
        return [];
    }

    public select(value: string, type: PROJECTITEM_TYPE) {
        if (this.vm.selection !== value || this.vm.selectionType !== type) {
            this._opennedTab = type;
            // this.vm.selecting( value, type );
            let url = `/projects/${this.vm.view.id}/`;
            switch (type) {
                case PROJECTITEM_TYPE.application:
                    const appHasKpi =
                        environment.toggleFeatures.kpis &&
                        this.vmMyKpis.appHasWarning(
                            this.vm.view,
                            this.vm.view.apps.find((c) => c.label === value)!
                        );
                    url += `apps/${value}/${appHasKpi ? 'warnings' : 'details'}`;
                    break;
                case PROJECTITEM_TYPE.newApp:
                    url += `apps/new`;
                    break;
                case PROJECTITEM_TYPE.group:
                    const groupHasKpi =
                        environment.toggleFeatures.kpis &&
                        this.vmMyKpis.groupHasWarning(
                            this.vm.view,
                            this.vm.view.groups.find((c) => c.label === value)!,
                            this.vm.users
                        );
                    url += `groups/${value}/${groupHasKpi ? 'warnings' : 'details'}`;
                    break;
                case PROJECTITEM_TYPE.newGroup:
                    url += `groups/new`;
                    break;
                case PROJECTITEM_TYPE.scope:
                    const scopeHasWarning =
                        environment.toggleFeatures.kpis &&
                        this.vmMyKpis.scopeHasWarning(this.vm.view, value, this.projListVm.view);
                    url += `scopes/${value}/${scopeHasWarning ? 'warnings' : 'details'}`;
                    break;
                case PROJECTITEM_TYPE.newScope:
                    url = `/projects/${this.vm.view.id}/scopes/new`;
                    break;
                // case PROJECTITEM_TYPE.api:
                //   url += `apis/${ value }/details`;
                //   break;
                // case PROJECTITEM_TYPE.newApi:
                //   url = `/projects/${ this.vm.view.id }/apis/new`;
                //   break;
            }
            if (url) {
                this._router.navigateByUrl(url);
            }
        }
    }

    public apiUrl(api: string): string {
        return environment.easyapi.url + '/catalog/' + api;
    }

    ux_menu() {
        return JoeLogger.env.startsWith('prod') ? ['primary'] : ['dark'];
    }

    ux_root() {
        return JoeLogger.env.startsWith('prod') ? ['nav', 'primary'] : ['nav', 'dark'];
    }

    // #endregion Public Methods (25)

    // #region Private Methods (4)

    private xAsyncDone(message: string) {
        if (
            message === CommandNotification.StateChanged ||
            message === ProjectDetailViewModel.SELECTION_CHANGED
        ) {
            this._cd.markForCheck();
        }
    }

    private xInputObserver(d: {
        inputs: [ProjectsViewModel, ProjectDetailViewModel];
        myKpis: MyKpiListViewModel;
    }) {
        this.projListVm = d.inputs[0];
        this.vm = d.inputs[1];
        const cd = this._cd;
        const asyncDone = this.xAsyncDone.bind(this);
        this._subs.add(this.vm.onStateChanged.subscribe(asyncDone));

        if (this.vm.loaded) {
            asyncDone(CommandNotification.StateChanged);
        }

        this.vmMyKpis = d.myKpis;
        this._subs.add(this.vm.onStateChanged.subscribe(asyncDone));
        this._subs.add(this.vmMyKpis.onStateChanged.subscribe(() => this._cd.markForCheck()));
    }

    private xRefreshNavigation() {
        const vm = this.vm;
        vm.runningOp = undefined;
        const router = this._router;
        const homeUrl = `/projects/${vm.view.id}/home`;
        setTimeout(() => {
            router
                .navigateByUrl('/home', { skipLocationChange: true })
                .then(() => router.navigateByUrl(homeUrl));
        }, 500);
    }

    private async xSingleAdminGroupForItemAsync(
        adminGroupId: string,
        projectId: string,
        targetType: PROJECTITEM_TYPE,
        target: string,
        admins: Setview<string>
    ): Promise<boolean> {
        const message: ReferenceChangesMessageData = {
            project: projectId,
            target,
            targetType,
            changes: {
                added: [],
                removed: []
            }
        };
        let touched = false;
        if (!admins.includes(adminGroupId)) {
            message.changes.added.push(adminGroupId);
            message.changes.removed = admins.slice();
            admins.add(adminGroupId);
            message.changes.removed.forEach((id) => admins.remove(id));
            touched = true;
        } else {
            message.changes.removed = admins.filter((grpOid) => grpOid !== adminGroupId);
            if (message.changes.removed.length > 1) {
                message.changes.removed.forEach((id) => admins.remove(id));
                touched = true;
            }
        }

        if (touched) {
            try {
                await this._projecSvc.ownershipAsync(message);
                admins.$editor!.endEdit();
                return Promise.resolve(true);
            } catch {
                return Promise.resolve(false);
            }
        }
        return Promise.resolve(true);
    }

    // #endregion Private Methods (4)
}
