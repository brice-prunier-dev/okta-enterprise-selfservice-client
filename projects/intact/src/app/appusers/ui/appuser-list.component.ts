import {
    Component,
    OnDestroy,
    ChangeDetectorRef,
    OnInit,
    ChangeDetectionStrategy
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {PartialObserver, Subscription} from 'rxjs';
import {ProjectsViewModel} from '../../_core';
import {ProjectDetailViewModel} from '../../projectsnav';
import {
    UserDocData,
    GroupLinkData,
    ReferenceChangesData,
    AppLinkView,
    ProjectDocData,
    USER_TYPES_TEST,
    USER_TYPES_SERVICE,
    USER_TYPES_FAKE,
    USER_TYPES_CONTRACTOR,
    USER_TYPES_ADMINISTRATOR,
    USER_TYPES_FONCTIONAL,
    USER_TYPES_INTERNAL,
    USER_TYPES_TECHNICAL,
    USER_TYPES_CUSTOMER,
    UserDocView,
    UserStatus,
    IS_INTERNAL
} from 'intact-models';
import {isStringAssigned, ArrayViewFactory, isArrayAssigned, isString} from 'joe-fx';
import {BreakpointObserver} from '@angular/cdk/layout';
import {AppViewModel} from '../../apps';
import {AppDataInput} from '../../apps';
import {GlobalState, GroupMembersViewModel} from '../../_core';
import {UserEditorDialog} from '../../groups';
import {USER_TYPES_BOUNTY} from 'projects/intact-models/src';
import { FilterPipe } from '../../_shared/pipes/filter';
import { UserTypePipe } from '../../_shared/pipes/usrtyp.pipe';
import { ArrayLabelPipe } from '../../_shared/pipes/arraylabel.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { ErrorComponent } from '../../_shared/ui/app-error.component';
import { UserProvisionningComponent } from '../../projectsnav/controls/member-actions/member-actions.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

type UserDialogInput = [
    UserDocData,
    GroupLinkData[],
    GroupMembersViewModel[],
    ProjectDocData,
    AppViewModel,
    boolean
];
@Component({
    selector: 'iam-appusers-list',
    templateUrl: './appuser-list.component.html',
    styleUrls: ['./appuser-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, UserProvisionningComponent, ErrorComponent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, MatIconModule, MatTooltipModule, MatButtonModule, ArrayLabelPipe, UserTypePipe, FilterPipe]
})
export class AppUserListComponent implements OnInit, OnDestroy {
    private _subs = new Subscription();
    private _appLink!: AppLinkView;

    public filterStmt = '';
    public grpMembersVmList!: GroupMembersViewModel[];
    public appVm!: AppViewModel;
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public runningOp: string | undefined;
    public error: any;

    public appMembers: UserDocData[] = [];

    public get initialized(): boolean {
        return !!this._appLink;
    }

    public get loading(): boolean {
        return !this.initialized;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get groupEditable(): boolean {
        return (
            this.initialized &&
            (this._userState.isIntactAdmin ||
                this.projVm.isItemAdmin(
                    this._appLink,
                    this._userState.login,
                    this._userState.groups
                ))
        );
    }

    public get userEditable(): boolean {
        return (
            this.initialized &&
            (this._userState.isIntactAdmin ||
                this._appLink.groups.some(
                    (g_id) =>
                        this.projVm.isItemAdmin(
                            this.projVm.view.groups.find(
                                (grp) => grp.oid === g_id
                            ) as GroupLinkData,
                            this._userState.login,
                            this._userState.groups
                        ),
                    this
                ))
        );
    }

    public get withFilter(): boolean {
        return isStringAssigned(this.filterStmt);
    }

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _media: BreakpointObserver,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this.runningOp = 'Loading data...';
        this._subs.add(
            route.data.subscribe(
                this._runtimeInputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    private _runtimeInputsObserver(d: {inputs: AppDataInput}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.appVm = d.inputs[2];
        const $this = this;

        if (this.projVm.loaded) {
            this._onProjectLoaded();
        } else {
            const subProjLoaded = this.projVm.onStateChanged.subscribe((p) => {
                if ($this.projVm.loaded) {
                    subProjLoaded.unsubscribe();
                    $this._onProjectLoaded();
                }
            });
        }

        if (this.projVm.areUsersLoaded) {
            this._onProjectUserLoaded();
        } else {
            const subProjUserLoaded = this.projVm.onStateChanged.subscribe((p) => {
                if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                    subProjUserLoaded.unsubscribe();
                    $this._onProjectUserLoaded();
                }
            });
        }

        if (this.appVm.loaded) {
            this._onAppLoaded();
        } else {
            this._subs.add(
                this.appVm.onStateChanged.subscribe(() => {
                    if ($this.appVm.loaded) {
                        $this._onAppLoaded();
                    }
                })
            );
        }
    }

    private _onProjectLoaded() {
        const appName = this.appVm.entry.query.id;
        this._appLink = this.projVm.view.apps.find((a) => a.label === appName)!;
    }

    private _onProjectUserLoaded() {
        const appName = this.appVm.entry.query.id;
        this._appLink = this.projVm.view.apps.find((a) => a.label === appName)!;
        const appGroupNames = this.projVm.view.groups
            .filter((g) => this._appLink.groups.includes(g.oid))
            .map((g) => g.label);
        const projectUsers = Object.values(this.projVm.users);
        this.appMembers = ArrayViewFactory.SortFromPropertyList(
            projectUsers.filter((usr) => usr.groupNames.some((s) => appGroupNames.includes(s))),
            ['profile>lastName', 'profile>firstName']
        );
        this.runningOp = undefined;
        this._cd.markForCheck();
    }

    private _onAppLoaded() {
        this._titleService.setTitle(this.appVm.view.client_name + ' (Users)');
        this.grpMembersVmList = this.projVm.groupMembersViewModels.filter((pg) =>
            this._appLink.groups.includes(pg.group.oid)
        );
        this.runningOp = undefined;
        this._cd.markForCheck();
    }

    ngOnInit() { }

    public ngOnDestroy() {
        this._subs.unsubscribe();
    }

    public ux_userLabelStyle(user: UserDocData): string[] {
        return user.status === 'ACTIVE' ? ['item-label'] : ['item-label', 'inactive'];
    }

    public ux_userLabel(user: UserDocData): string {
        return UserDocView.userLabel(user);
    }

    public ux_userColor(usr: UserDocData) {
        const testColor = '#e62b87';
        const serviceColor = '#f18f09';
        const bountyColor = '#269955';
        const internalColor = '#0af';
        const internalContractorColor = '#0069a7';
        const externalColor = '#009934';
        switch (usr.profile.userType) {
            case USER_TYPES_TEST:
                return testColor;
            case USER_TYPES_SERVICE:
                return serviceColor;
            case USER_TYPES_BOUNTY:
                return bountyColor;
            case USER_TYPES_FAKE:
                return '#becd00';

            case USER_TYPES_CONTRACTOR:
                return internalContractorColor;
            case USER_TYPES_ADMINISTRATOR:
            case USER_TYPES_FONCTIONAL:
            case USER_TYPES_INTERNAL:
            case USER_TYPES_TECHNICAL:
                return internalColor;

            case USER_TYPES_CUSTOMER:
                return externalColor;
            default:
                return IS_INTERNAL(usr.profile)
                    ? internalColor
                    : externalColor;
        }
        return '#b0bec5';
    }

    public searchGroupDisplayFn(grp?: GroupLinkData | string): string | undefined {
        return typeof grp === 'string' ? (grp as string) : grp ? grp.label : undefined;
    }

    public userExists(user: UserDocData): boolean {
        const result = this.appMembers.some((usr) => usr.profile.login === user.profile.login);
        return result;
    }

    public onSearchChanged(search: string): void {
        this.filterStmt = search;
        this._cd.markForCheck();
    }

    public matchingUser(usr: UserDocData, filterStmt: string) {
        const searchStmt = (filterStmt || '').toLowerCase();
        return isStringAssigned(filterStmt)
            ? usr.profile.firstName.toLowerCase().includes(searchStmt) ||
            usr.profile.lastName.toLowerCase().includes(searchStmt) ||
            usr.profile.email.toLowerCase().includes(searchStmt) ||
            usr.profile.login.split('@')[0].toLowerCase().includes(searchStmt)
            : true;
    }

    public withProjectUsers(): boolean {
        return this.appMembers.length > 0;
    }

    public canProvisionUser(): boolean {
        return (
            this.withProjectUsers() &&
            !this._userState.isMyProject(this.projListVm.currentProject!.view.id)
        );
    }

    public displayUser(usr: UserDocData) {
        const appGroups: GroupLinkData[] = this.projVm.view.groups.filter((g) =>
            this._appLink.groups.includes(g.oid)
        );
        const dialogData = {
            data: [
                this.projVm.users[usr.profile.login] || usr,
                appGroups,
                this.projVm.groupMembersViewModels,
                this.projVm.view,
                this.appVm,
                this.groupEditable
            ],
            width: this._media.isMatched('(min-width: 1024px)') ? '600px' : undefined
        };
        this.openUserDialog(dialogData as MatDialogConfig<UserDialogInput>);
    }

    public openUserDialog(dialogData: MatDialogConfig<UserDialogInput>) {
        const self = this;
        const groups = this.grpMembersVmList;
        const groupNames = groups.map((g) => g.group.label);
        const projectUser = this.projVm.users[dialogData.data![0].profile.login];
        const projectUserExists = projectUser !== undefined;
        const user = projectUserExists ? projectUser : dialogData.data![0];

        this.dialog
            .open(UserEditorDialog, dialogData)
            .afterClosed()
            .subscribe((changes: ReferenceChangesData | UserStatus) => {
                if (isString(changes)) {
                    user.status = changes;
                } else if (changes) {
                    this.appMembers = [];
                    self._cd.markForCheck();
                    const groupstStillExists = isArrayAssigned(user.groupNames);
                    if (groupstStillExists) {
                        user.groupNames = user.groupNames.sort();
                    } else {
                        user.groupNames = [];
                    }
                    if (!projectUserExists && changes.added.length > 0) {
                        // project user override
                        self.projVm.users[user.profile.login] = user;
                    }

                    if (projectUserExists && !groupstStillExists) {
                        // deprecated project user
                        delete self.projVm.users[user.profile.login];
                    }
                    groups.forEach((g) => {
                        if (changes.added.includes(g.group.label)) {
                            // new group user
                            g.view.push(user);
                            g.setView(
                                ArrayViewFactory.SortFromPropertyList(g.view, [
                                    'profile>lastName',
                                    'profile>firstName'
                                ])
                            );
                        }
                        if (changes.removed.includes(g.group.label)) {
                            // deprecated group user
                            const index = g.view.findIndex(
                                (u) => u.profile.login === user.profile.login
                            );
                            g.view.splice(index, 1);
                        }
                    });

                    self.appMembers = ArrayViewFactory.SortFromPropertyList(
                        Object.values(this.projVm.users).filter((usr) =>
                            usr.groupNames.some((s) => groupNames.includes(s))
                        ),
                        ['profile>lastName', 'profile>firstName']
                    );
                }
                self.filterStmt = '';
                self._cd.markForCheck();
            });
    }
}
