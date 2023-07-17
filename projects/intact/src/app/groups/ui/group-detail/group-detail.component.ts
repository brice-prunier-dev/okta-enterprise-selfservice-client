import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {PartialObserver, Subscription} from 'rxjs';
import {isStringAssigned, sameString} from 'joe-fx';
import {
    UserDocData,
    USER_TYPES_SERVICE,
    USER_TYPES_TEST,
    USER_TYPES_CUSTOMER,
    USER_TYPES_INTERNAL,
    USER_TYPES_ADMINISTRATOR,
    USER_TYPES_CONTRACTOR,
    USER_TYPES_FONCTIONAL,
    USER_TYPES_TECHNICAL,
    USER_TYPES_FAKE,
    USER_TYPES_BOUNTY,
    UserDocView,
    IS_INTERNAL
} from 'intact-models';
import {ProjectsViewModel, GlobalState, GroupMembersViewModel} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {
    UserEditorDialog,
    UserEditorDialogInput
} from '../../dialogs/user-editor/user-editor.dialog';
import {I} from '@angular/cdk/keycodes';
import { FilterPipe } from '../../../_shared/pipes/filter';
import { UserTypePipe } from '../../../_shared/pipes/usrtyp.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { UserProvisionningComponent } from '../../../projectsnav/controls/member-actions/member-actions.component';
import { ErrorComponent } from '../../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgStyle } from '@angular/common';


@Component({
    selector: 'iam-user-list',
    templateUrl: './group-detail.component.html',
    styleUrls: ['./group-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, ErrorComponent, UserProvisionningComponent, NgStyle, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, MatIconModule, MatTooltipModule, MatButtonModule, UserTypePipe, FilterPipe]
})
export class GroupDetailComponent implements OnInit, OnDestroy {
    // #region Properties (12)

    private _externalSearchText = '';
    private _groupId!: string;
    private _internalSearchText = '';
    private _subscriptions = new Subscription();

    public externalUsers: UserDocData[] = [];
    public filterStmt: string = '';
    // public azsearching = false;
    public internalUsers!: UserDocData[];
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public runningOp: string | undefined;
    public searching = false;
    public vm!: GroupMembersViewModel;

    // #endregion Properties (12)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _media: BreakpointObserver,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this._subscriptions.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (5)

    public get editable(): boolean {
        const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
        return (
            this._userState.isIntactAdmin ||
            this._userState.isMyProject(projVm.view.id) ||
            projVm.isItemAdmin(this.vm.group, this._userState.login, this._userState.groups)
        );
    }

    public get externalSearchText(): string {
        return this._externalSearchText;
    }

    public get initialized(): boolean {
        return this.vm?.loaded;
    }

    // public displayUserDict: StringMap<UserDocData>;
    public get internalSearchText(): string {
        return this._internalSearchText;
    }

    public get running(): boolean {
        return this.vm?.running;
    }

    // #endregion Public Accessors (5)

    // #region Public Methods (10)

    public displayUser(usr: UserDocData) {
        const dialogData = {
            data: [
                usr,
                [this.vm.group],
                this.projVm.groupMembersViewModels,
                this.projVm.view,
                undefined,
                this.editable
            ]
        };
        this.openUserDialog(dialogData as MatDialogConfig<UserEditorDialogInput>);
    }

    public isProjectLoaded(): boolean {
        return this.initialized && !!this.projListVm.currentProject?.loaded;
    }

    public isPrivateProject(): boolean {
        return !this.projListVm.currentProject?.view.public;
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

    public ngOnDestroy() {
        this._subscriptions.unsubscribe();
    }

    public ngOnInit() { }

    public onSearchChanged(search: string): void {
        this.filterStmt = search;
        this._cd.markForCheck();
    }

    public openUserDialog(dialogData: MatDialogConfig<UserEditorDialogInput>) {
        const self = this;
        dialogData.width = this._media.isMatched('(min-width: 1024px)') ? '600px' : undefined;
        this.dialog
            .open(UserEditorDialog, dialogData)
            .afterClosed()
            .subscribe((_) => {
                self.vm.loadOp().then((_) => self.projVm.buildUsers());
                this.filterStmt = '';
                self._cd.markForCheck();
            });
    }

    public userColor(usr: UserDocData) {
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
                if (IS_INTERNAL(usr.profile)) {
                    return internalColor;
                }
                else {
                    return externalColor;
                }
                break;
        }
        return '#b0bec5';
    }

    public userExists(user: UserDocData): boolean {
        return this.initialized
            ? this.vm.view.findIndex((u2) => u2.profile.login === user.profile.login) > -1
            : false;
    }

    public userLabel(user: UserDocData): string {
        return UserDocView.userLabel(user);
    }

    // #endregion Public Methods (10)

    // #region Private Methods (2)

    private _loadEnded() {
        this.runningOp = undefined;
        this.vm = this.projVm.groupMembersViewModels.find((grpvm) =>
            sameString(grpvm.group.label, this._groupId)
        )!;
        this._cd.markForCheck();
    }

    private _initObserver(d: {inputs: [ProjectsViewModel, ProjectDetailViewModel, string]}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this._groupId = d.inputs[2];
        this._titleService.setTitle(this._groupId + ' (Members)');
        const self = this;
        const initializerFunc = () => {
            self.runningOp = undefined;
            self.vm = self.projVm.groupMembersViewModels.find((grpvm) =>
                sameString(grpvm.group.label, self._groupId)
            )!;
            self._cd.markForCheck();
        };
        if (this.projVm.areUsersLoaded) {
            initializerFunc();
        }

        this._subscriptions.add(
            this.projVm.onStateChanged.subscribe((p) => {
                if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                    initializerFunc();
                }
            })
        );
    }

    // #endregion Private Methods (2)
}
