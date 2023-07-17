import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    Inject,
    ChangeDetectionStrategy
} from '@angular/core';
import {
    UserDocView,
    UserDocData,
    USER_TYPES,
    UserProfileView,
    ReferenceChangesData,
    ReferenceChangesMessageData,
    LANGS,
    S_GAIA_LOGIN,
    USER_TYPES_TEST,
    TEST_LOGING_DOMAIN,
    SERVICE_LOGING_DOMAIN,
    INTERNAL_USER_TYPES,
    EXTERNAL_USER_TYPES,
    USER_TYPES_CUSTOMER,
    LANGS_FRENCH,
    LANGS_ENGLISH,
    USER_TYPES_INTERNAL,
    ProjectDocData,
    GroupLinkData,
    AssignStatus,
    USER_TYPES_SERVICE,
    ACCOUNT_USER_TYPES,
    UserStatus,
    IS_INTERNAL
} from 'intact-models';
import {
    DataOrigin,
    ValidationState,
    ChangeSet,
    ChangeStateEnum,
    isStringAssigned,
    sameString,
    isBlank,
    DataObj
} from 'joe-fx';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSelectionListChange} from '@angular/material/list';
import {UsersService} from '../../data/users.service';
import {GlobalState, GroupMembersViewModel} from '../../../_core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {BOUNTY_LOGING_DOMAIN, USER_TYPES_BOUNTY} from 'projects/intact-models/src';
import {BehaviorSubject, catchError, debounceTime, EMPTY, filter, map, Observable, Subscription, switchMap} from 'rxjs';
import {AppViewModel} from '../../../apps';

export type UserEditorDialogInput = [
    UserDocData,
    GroupLinkData[],
    GroupMembersViewModel[],
    ProjectDocData,
    AppViewModel,
    boolean
];

@Component({
    selector: 'iam-user-editor-dialog',
    templateUrl: './user-editor.dialog.html',
    styleUrls: ['./user-editor.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditorDialog implements OnInit, OnDestroy {
    private _subs = new Subscription();
    private _groupsChangesSaved: boolean = false;
    private _user!: UserDocView;
    private _userChangesSaved = false;
    private _userData: UserDocData;
    private _userLogin: string;
    private _userAdminGroup: string[];
    private _isMyProject: boolean;
    private _groupPayload!: ReferenceChangesMessageData;
    private _displayAllGroups = false;
    private _groupMemberList: GroupMembersViewModel[];
    private _groupList: GroupLinkData[];
    private _appVm: AppViewModel;

    private _accountTypes = ACCOUNT_USER_TYPES;
    private _internalTypes = INTERNAL_USER_TYPES;
    private _externalTypes = EXTERNAL_USER_TYPES;

    // #region Properties (1)
    public error: any;
    public langs = LANGS;
    public profile!: UserProfileView;
    public runningOp: string | undefined;
    public userTypes: USER_TYPES = [];
    public proj: ProjectDocData;
    public canEdit: boolean;
    public searching = false;
    public search$: BehaviorSubject<string> = new BehaviorSubject<string>('')
    public internalUsers$: Observable<UserDocData[]> =
        this.search$.pipe(
            filter(c => c.length !== 0),
            debounceTime(200),
            switchMap(c => this._userProxy.internalSearchAsync(c)),
            map(users => users
                .filter(c => c.profile.login.includes('-O@') === false)
                .filter(c => ['I', 'E'].includes(c.profile.userType))
                .filter(c => c.status === 'ACTIVE')
            ),
            catchError(() => EMPTY),
        );

    // #endregion Properties (10)

    // #region Constructors (1)

    /**
     * data: [ usr: UserDocData, groups: OitemData[], projName: string, canEdit :boolean ] )
     */
    constructor(
        // @Inject( MAT_DIALOG_DATA ) public data: InfrSystemView,
        private _cd: ChangeDetectorRef,
        private _globalState: GlobalState,
        private _userProxy: UsersService,
        public dialogRef: MatDialogRef<UserEditorDialog, ReferenceChangesData | UserStatus>,
        @Inject(MAT_DIALOG_DATA) data: UserEditorDialogInput
    ) {
        this.runningOp = "Loading user's groups info";
        const login = (this._userLogin = _globalState.login);
        this._userData = data[0];
        this._groupList = data[1];
        this._groupMemberList = data[2];
        this.proj = data[3];
        this._appVm = data[4];
        this.canEdit = data[5];
        this._isMyProject = !this.proj.public && this._globalState.isMyProject(this.proj.id);
        this._userAdminGroup = this._groupMemberList
            .filter((gm) => this._groupList.some((grp) => grp.admins.includes(gm.group.oid)))
            .filter((gm) => gm.view.some((usr) => sameString(usr.profile.login, login)))
            .map((gm) => gm.group.oid);

        const profile = this._userData.profile;
        this._initGroupPayload();
    }

    // #endregion Constructors (1)

    // #region Public Accessors (13)

    public get groupList(): GroupLinkData[] {
        return this.displayAllGroups ? this.proj.groups : this._groupList;
    }

    public get accountSuffix(): string {
        if (this.isAccount) {
            switch (this._userData.profile.userType) {
                case USER_TYPES_TEST:
                    return TEST_LOGING_DOMAIN;

                case USER_TYPES_SERVICE:
                    return SERVICE_LOGING_DOMAIN;

                case USER_TYPES_BOUNTY:
                    return BOUNTY_LOGING_DOMAIN;
            }
        }
        return '';
    }

    public get canBeSave() {
        return (
            !this.running &&
            !this.displayAllGroups &&
            !this.error &&
            this.canEdit &&
            ((this.isDirty && this.canBeEdit) || !this.canBeEdit) &&
            !this.profile.$validation.withError()
        );
    }

    public get displayAllGroups(): boolean {
        return this._displayAllGroups;
    }

    public displayAllGroupsChanged(arg: MatSlideToggleChange) {
        this._displayAllGroups = arg.checked;
        this._cd.markForCheck();
    }

    public get isAccount(): boolean {
        return this._user && this._user.isAccount;
    }

    public get canBeEdit(): boolean {
        return this._user.isAccount || this._user.isExternal;
    }

    public get isDirty(): boolean {
        return this._user.$isEditing && this._user.$editor!.isTouched();
    }

    public get isExternal(): boolean {
        return this._user && this._user.isExternal;
    }

    public get isInternalAsClass() {
        return this._user && this._user.isInternal ? {not: false} : {not: true};
    }

    public get isNewUser(): boolean {
        return this._user.created === undefined;
    }

    public get isUpdate(): boolean {
        return !!this._userData.created;
    }

    public set profileLogin(value: string) {
        this._user.profile.login = this.isAccount ? value + this.accountSuffix : value;
        if (this.isExternal) {
            this._user.profile.email = value;
        }
        if (this.profile.userType === USER_TYPES_BOUNTY) {
            this._user.profile.email = this._user.profile.login;
        }
    }

    public get profileLogin(): string {
        const profile = this._user.profile;
        if (this.isAccount && isStringAssigned(profile.login)) {
            switch (profile.userType) {
                case USER_TYPES_TEST:
                    if (profile.login.endsWith(TEST_LOGING_DOMAIN)) {
                        return profile.login.substring(
                            0,
                            profile.login.length - TEST_LOGING_DOMAIN.length
                        );
                    }
                    break;

                case USER_TYPES_SERVICE:
                    if (profile.login.endsWith(SERVICE_LOGING_DOMAIN)) {
                        return profile.login.substring(
                            0,
                            profile.login.length - SERVICE_LOGING_DOMAIN.length
                        );
                    }
                    break;

                case USER_TYPES_BOUNTY:
                    if (profile.login.endsWith(BOUNTY_LOGING_DOMAIN)) {
                        return profile.login.substring(
                            0,
                            profile.login.length - BOUNTY_LOGING_DOMAIN.length
                        );
                    }
                    break;
            }
        }

        return this._user.profile.login;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get isActiveAccount(): boolean {
        return this._user && this._user.isAccount && !this.isNewUser && this._user.isActive;
    }

    public get isSuspendAccount(): boolean {
        return this._user && this._user.isAccount && !this.isNewUser && this._user.isSuspended;
    }

    public get profileEmail(): string {
        return this.profile.userType == USER_TYPES_BOUNTY
            ? this.profile.secondEmail || (this.isUpdate ? this.profile.email : '')
            : this.profile.email;
    }

    public set profileEmail(value: string) {
        if (this.profile.userType == USER_TYPES_BOUNTY) {
            this.profile.secondEmail = value;
        } else {
            this.profile.email = value;
        }
        if (value) {
            this.search$.next(value);
        }
    }

    public get profileEmailError(): DataObj | undefined {
        return this.profile.userType == USER_TYPES_BOUNTY
            ? this.profile.$validation.errors.secondEmail
            : this.profile.$validation.errors.email;
    }

    public get validationResult(): ValidationState {
        return this.profile.$validation;
    }

    // #endregion Public Accessors (13)

    // #region Public Methods (6)

    public userLabel(user: UserDocData): string {
        return UserDocView.userLabel(user);
    }

    public cmdCancel() {
        if (this._user && this._user.$isEditing) {
            this._user.$editor!.cancelEdit();
        }
        this.dialogRef.close();
    }

    public ngOnDestroy() {
        this._subs.unsubscribe();
        if (this.profile.$src.detached) {
            this.profile.$release();
        }
    }

    public ngOnInit() {
        const p = this._userData.profile;
        if (p.userType === USER_TYPES_BOUNTY && isBlank(p.secondEmail)) {
            p.secondEmail = p.email;
            p.email = p.login;
        }
        const that = this;
        const groups = this._groupList.map((g) => g.label);
        const usrlogin = this._userData.profile.login;
        if (
            this._userData.created &&
            !this._userData.groupNames &&
            !(this._userData._canBeAdded_ === true)
        ) {
            this._userProxy.getLoginGroupsAsync(usrlogin).then((r) => {
                that._userData.groupNames = r
                    .filter((g) => groups.includes(g.profile.name))
                    .map((g) => g.profile.name);
                that._initUserView();
                that._endRun();
            });
        } else {
            that._initUserView();
            that._endRun();
        }
    }

    public cmdSave() {
        if (this.canEdit) {
            if (!this.profile.validate().withError()) {
                this.runningOp = "Saving user's data";
                this._cd.markForCheck();
                this._initGroupPayload();
                if (this.isNewUser) {
                    this._userChangesSaved = this._groupsChangesSaved = false;
                    this._createUser();
                } else {
                    this._groupsChangesSaved = !(
                        this._user.groupNames.$isEditing && this._user.groupNames.$editor!.isDirty
                    );
                    this._userChangesSaved = !(
                        this.canBeEdit &&
                        this._user.profile.$isEditing &&
                        this._user.profile.$editor!.isDirty()
                    );
                    if (this._userChangesSaved && this._groupsChangesSaved) {
                        this._terminateDataUpdate();
                    } else {
                        if (!this._groupsChangesSaved) {
                            this._updateUserGroups();
                        }
                        if (!this._userChangesSaved) {
                            this._updateUser();
                        }
                    }
                }
            } else {
                this._cd.markForCheck();
            }
        }
    }

    public cmdSuspend() {
        if (this.canEdit && this.isActiveAccount) {
            this.runningOp = 'Suspending user';
            this._cd.markForCheck();
            const user = this._user;
            const self = this;
            this._userProxy
                .suspendAsync(this._user.profile.login)
                .then((result) => {
                    user.status = 'SUSPENDED';
                    self._terminateAccountStatus();
                })
                .catch((err) => self._handleError(err, true));
        }
    }

    public cmdUnsuspend() {
        if (this.canEdit && this.isSuspendAccount) {
            this.runningOp = 'Re activating user';
            this._cd.markForCheck();
            const user = this._user;
            const self = this;
            this._userProxy
                .unsuspendAsync(this._user.profile.login)
                .then((result) => {
                    user.status = 'ACTIVE';
                    self._terminateAccountStatus();
                })
                .catch((err) => self._handleError(err, true));
        }
    }

    public isGroupSelected(groupName: string): boolean {
        return this._user.groupNames.contains(groupName);
    }

    public isGroupOptionEnabled(groupId: string) {
        return (
            !this._displayAllGroups &&
            this.canEdit &&
            (this._globalState.isIntactAdmin ||
                this._isMyProject ||
                this._groupMemberList
                    .find((gm) => gm.group.oid === groupId)!
                    .group.admins.some((id) => this._userAdminGroup.includes(id)))
        );
    }

    public groupsChanged(arg: MatSelectionListChange) {
        const option = arg.options[0];
        const groupName = option.value as string;
        if (option.selected) {
            if (!this._user.groupNames.contains(groupName)) {
                this._user.groupNames.add(groupName);
            }
        } else {
            if (this._user.groupNames.contains(groupName)) {
                this._user.groupNames.remove(groupName);
            }
        }
    }

    // #endregion Public Methods (6)

    // #region Private Methods (9)
    private _initGroupPayload(): void {
        this._groupPayload = {
            project: this.proj.id,
            targetType: 'usr',
            target: this._userData.profile.login,
            changes: {
                added: [],
                removed: []
            }
        };
    }

    private _getUserGroupChanges(): ReferenceChangesData {
        const result: ReferenceChangesData = {
            added: [],
            removed: []
        };
        if (this._user.groupNames.$isEditing && this._user.groupNames.$editor!.isDirty()) {
            const editor = this._user.groupNames.$editor!;
            this._user.groupNames.forEach((s) => {
                if (editor.isInsertedItem(s)) {
                    result.added.push(s);
                }
            });
            const src = this._user.groupNames.$src.obj as string[];
            if (src) {
                src.forEach((s) => {
                    if (editor.isDeletedItem(s)) {
                        result.removed.push(s);
                    }
                });
            }
        }
        return result;
    }

    private _afterAssignDone(result: AssignStatus[]) {
        const errorMessage = result
            .filter(
                (r) => sameString(r.status, 'Not assigned') || sameString(r.status, 'Not removed')
            )
            .map((r) => r.message)
            .join(', ');
        if (isStringAssigned(errorMessage)) {
            this.error = errorMessage;
            this._cd.markForCheck();
        } else {
            this._groupsChangesSaved = true;
        }
        this._terminateDataUpdate();
    }

    private _afterUserChangeDone(result: UserDocData) {
        this._user
            .$assign({
                created: result.created,
                lastUpdated: result.lastUpdated,
                status: result.status
            })
            .$editor!.endEdit();
        if (this._userData._canBeAdded_) {
            this._userData._canBeAdded_ = false;
        }
        this._groupsChangesSaved = this._userChangesSaved = true;
        this._terminateDataUpdate();
    }

    private _createUser() {
        const onSucceed = this._afterUserChangeDone.bind(this);
        const onFailed = this._handleError.bind(this);

        try {
            const userPayload = this._user.asPayloadData();
            userPayload.application = this._appVm ? this._appVm.app.label : undefined;
            userPayload.groups = [];
            const groupList = this._groupList;
            const changes = [] as ChangeSet;
            this._user.groupNames.$editor!.writeChangeSet(changes);
            for (const change of changes) {
                if (change.op === ChangeStateEnum.inserted) {
                    const grp = groupList.find((g) => g.label === change.obj)!;
                    userPayload.groups.push(grp.label);
                    this._groupPayload.changes.added.push(grp.label);
                }
            }

            this._userProxy
                .createAsync(userPayload)
                .then((result) => onSucceed(result))
                .catch((err) => onFailed(err));
        } catch (err) {
            onFailed(err);
        }
    }

    private _endRun() {
        this.runningOp = undefined;
        this._cd.markForCheck();
    }

    private _handleError(err: any, forUserStatus = false) {
        this.error = err;
        if (forUserStatus) {
            this._terminateAccountStatus();
        } else {
            this._terminateDataUpdate();
        }
    }

    private _initUserView() {
        if (this._userData.groupNames === undefined) {
            this._userData.groupNames = [];
        }
        this._user = new UserDocView(this._userData);
        this.profile = this._user.profile;
        this.profile.$edit();
        this._subs.add(
            this._user.$editor!.onViewChanged!.subscribe((p) => {
                if (p.origin === DataOrigin.code) {
                    this._cd.markForCheck();
                }
            })
        );
        if (this.isNewUser || this._user.groupNames.length === 0) {
            if (this._groupList.length == 1) {
                this._user.groupNames.add(this._groupList[0].label);
            }
        }
        if (this.isNewUser) {
            this.profile.lang = LANGS_ENGLISH;
        }
        this.profile.validate();
        if (this.profile.$validation.errors.userType) {
            this.profile.userType = IS_INTERNAL(this.profile)
                ? USER_TYPES_INTERNAL
                : USER_TYPES_CUSTOMER;
        }
        this.userTypes = this._user.isAccount
            ? this._accountTypes
            : this.profile.isInternal
                ? this._internalTypes
                : this._externalTypes;
    }

    private _terminateDataUpdate() {
        if (this.error !== undefined) {
            this.runningOp = undefined;
            this._cd.markForCheck();
        } else if (this._userChangesSaved && this._groupsChangesSaved) {
            this.runningOp = undefined;
            if (this._user.$isEditing) {
                this._user.$editor!.endEdit();
            }
            const dialogRef = this.dialogRef;
            const changes = this._groupPayload?.changes;
            dialogRef.close(changes);
        }
    }

    private _terminateAccountStatus() {
        if (this.error !== undefined) {
            this.runningOp = undefined;
            this._cd.markForCheck();
        } else {
            this.runningOp = undefined;
            if (this._user.$isEditing) {
                this._user.$editor!.endEdit();
            }
            const dialogRef = this.dialogRef;
            dialogRef.close(this._user.status);
        }
    }

    private _updateUser() {
        const onSucceed = this._afterUserChangeDone.bind(this);
        const onFailed = this._handleError.bind(this);
        try {
            this._userProxy
                .updateAsync(this._user.asPayloadData())
                .then((result) => onSucceed(result))
                .catch((err) => onFailed(err));
        } catch (err) {
            onFailed(err);
        }
    }

    private _updateUserGroups() {
        const groupList = this._groupList;
        const changes = [] as ChangeSet;
        this._user.groupNames.$editor!!.writeChangeSet(changes);
        const payload = this._groupPayload;
        for (const change of changes) {
            if (change.op === ChangeStateEnum.inserted) {
                const grp = groupList.find((g) => g.label === change.obj)!;
                payload.changes.added.push(grp.label);
            } else if (change.op === ChangeStateEnum.deleted) {
                const grp = groupList.find((g) => g.label === change.obj)!;
                payload.changes.removed.push(grp.label);
            }
        }
        const onSucceed = this._afterAssignDone.bind(this);
        const onFailed = this._handleError.bind(this);
        try {
            this._userProxy
                .userMembershipAsync(payload)
                .then((result) => onSucceed(result))
                .catch((err) => onFailed(err));
        } catch (err) {
            onFailed(err);
        }
    }
    // #endregion Private Methods (9)
}
