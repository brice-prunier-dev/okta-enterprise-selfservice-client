import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {
    USER_TYPES_SERVICE,
    USER_TYPES_BOUNTY,
    USER_TYPES_TEST,
    USER_TYPES_INTERNAL,
    PROJECT_STORE,
    ServiceUserProfileType,
    TestUserProfileType,
    BountyUserProfileType,
    UserDocData,
    UserDocType,
    UserDocView,
    S_ENGIE_MAIL,
    USER_TYPES_CUSTOMER
} from 'intact-models';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {isStringAssigned, isEmptyString, isBlank, ArrayViewFactory} from 'joe-fx';
import {tap, debounceTime, switchMap} from 'rxjs/operators';
import {GlobalState, ProjectsService} from '../../../_core';
import {StoreManager} from 'joe-viewmodels';
import {isArrayAssigned} from 'projects/joe-fx/src';
import {IS_INTERNAL} from 'projects/intact-models/src';

@Component({
    selector: 'iam-member-actions',
    templateUrl: './member-actions.component.html',
    styleUrls: ['./member-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProvisionningComponent implements OnInit, OnDestroy {
    // #region Properties (13)
    // @Input() projVm: ProjectDetailViewModel;
    @Input() editable!: boolean;
    @Input() userExists!: (usr: UserDocData) => boolean;
    @Input() displayUser!: (user: UserDocData) => void;
    @Input() projectAccounts!: UserDocData[];
    @Output() searchChanged = new EventEmitter();

    private _internalSearchEvent = new Subject<string>();
    private _subs = new Subscription();
    private _internalSearchText = '';

    internalUsers: UserDocData[] | undefined;
    runningOp: string | undefined;
    searching = false;

    // #endregion Properties (13)

    // #region Constructors (1)

    constructor(private _cd: ChangeDetectorRef, private _userState: GlobalState) { }

    // #endregion Constructors (1)

    // #region Public Accessors (4)

    get initialized(): boolean {
        return !!this.userExists;
    }

    get addInternalTooltip(): string {
        return this.editable
            ? 'Search an internal user by mail'
            : 'You are not accredited to manage internals';
    }

    // displayUserDict: StringMap<UserDocData>;
    get internalSearchText(): string {
        return this._internalSearchText;
    }

    get running(): boolean {
        return !!this.runningOp;
    }

    // #endregion Public Accessors (4)

    // #region Public Methods (20)

    addService() {
        const usr = UserDocType.defaultValue() as UserDocData;
        usr.profile = ServiceUserProfileType.defaultValue();
        usr.profile.userType = USER_TYPES_SERVICE;
        this.displayInternal(usr);
    }

    addTest() {
        const usr = UserDocType.defaultValue() as UserDocData;
        usr.profile = TestUserProfileType.defaultValue();
        usr.profile.userType = USER_TYPES_TEST;
        this.displayInternal(usr);
    }

    addBounty() {
        const usr = UserDocType.defaultValue() as UserDocData;
        usr.profile = BountyUserProfileType.defaultValue();
        usr.profile.userType = USER_TYPES_BOUNTY;
        this.displayInternal(usr);
    }

    appUserLayout(user: UserDocData) {
        return user.status === 'ACTIVE' ? ['user-row'] : ['user-row', 'inactive'];
    }

    canBeAdded(user: UserDocData): boolean {
        return !!user._canBeAdded_ && this.editable;
    }

    displayInternal(usr: UserDocData) {
        this._internalSearchText = '';
        this.internalUsers = [];
        this._cd.markForCheck();
        this.displayUser(usr);
    }

    internalSearchTextChanged(input: string) {
        if (input !== this._internalSearchText) {
            if (!isStringAssigned(input)) {
                this.searching = false;
                this.internalUsers = undefined;
                this.searchChanged.emit('');
                this._internalSearchText = input;
                this._cd.markForCheck();
            } else {
                input = input.trim();
                if (isEmptyString(input)) {
                    this.searchChanged.emit('');
                } else if (input !== this._internalSearchText) {
                    this._internalSearchText = input as string;
                    this._internalSearchEvent.next(input);
                    this.searchChanged.emit(input);
                }
            }
        }
    }

    ngOnDestroy() {
        this._subs.unsubscribe();
    }

    ngOnInit() {
        this._prepareInternalSearch();
    }

    onInternalSearchTextChanged(event: KeyboardEvent) {
        const newInput = (event.target as HTMLInputElement).value;
        this.internalSearchTextChanged(newInput.replace(' ', '.'));
    }

    onInternalSelection(arg: MatAutocompleteSelectedEvent) {
        if (typeof arg.option.value === 'string') {
            this.displayInternal({
                profile: {login: arg.option.value.trim() as string}
            } as UserDocData);
        } else {
            const usr = arg.option.value as UserDocData;
            if (usr._canBeAdded_) {
                if (usr.profile.userType === undefined) {
                    usr.profile.userType = IS_INTERNAL(usr.profile)
                        ? USER_TYPES_INTERNAL
                        : USER_TYPES_CUSTOMER;
                }
                usr.b2e = true;
                this.displayInternal(usr);
            }
        }
        this.internalSearchTextChanged('');
    }

    searchDisplayFn(usr: any): string {
        return typeof usr === 'string'
            ? (usr as string)
            : usr
                ? usr.profile.firstName + ' ' + usr.profile.lastName
                : '';
    }

    searchedUserLayout(user: UserDocData) {
        return user.b2e ? ['block', 'isB2E'] : ['block', 'isIdp'];
    }

    userLabel(user: UserDocData): string {
        return UserDocView.userLabel(user);
    }

    private _internalAccountSearch(search: string) {
        return isArrayAssigned(this.projectAccounts)
            ? this.projectAccounts.filter(
                (usr) => usr.profile.login.includes(search) || usr.profile.email.includes(search)
            )
            : [];
    }

    private _prepareInternalSearch() {
        const proxy = StoreManager.INSTANCE.store<ProjectsService>(PROJECT_STORE);
        const that = this;
        this._subs.add(
            this._internalSearchEvent
                .pipe(
                    tap(() => {
                        that.searching = true;
                        that._cd.markForCheck();
                    }),
                    debounceTime(150),
                    switchMap((search: string) => proxy.internalSearchAsync(search.trim()))
                )
                .subscribe(
                    (idpResult) => {
                        const internals = that._internalAccountSearch(
                            that._internalSearchText.toLowerCase()
                        );
                        that.searching = false;
                        that.internalUsers = ArrayViewFactory.SortFromPropertyList(
                            idpResult.concat(internals),
                            ['./profile/lastName', './profile/firstName']
                        );
                        that.internalUsers.forEach((u) => (u._canBeAdded_ = !that.userExists(u)));
                        that._cd.markForCheck();
                    },
                    () => {
                        that.searching = false;
                        that._cd.markForCheck();
                    }
                )
        );
    }
}
