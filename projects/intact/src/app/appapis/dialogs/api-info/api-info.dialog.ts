import {
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
    ViewChild,
    Component,
    OnInit,
    Inject
} from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { of, Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { startWith, map, finalize, debounceTime, mergeMap } from 'rxjs/operators';
// ────────────────────────────────────────────────────────────────────────────────
import { isAssigned, isBlank, isStringAssigned } from 'joe-fx';
import { pascalCase } from 'joe-types';
import { OdefinitionData } from 'joe-models';
import { CommandNotification, ViewModelManager } from 'joe-viewmodels';
// ────────────────────────────────────────────────────────────────────────────────
import { GlobalState, NotifierService } from '../../../_core';
import { ConfirmService } from '../../../_shared';
import { SwaggerLinkData, SwaggerLinkView } from '../../data/models';
import { AppApisService } from '../../data/appapis.service';
import { ApiInfoView, IS_INTERNAL, UserDocData } from 'intact-models';
import { ApiDetailViewModel } from '../../data/api-detail.viewmodel';
import { APIS_TYPEDEF } from '../../data/api-doc.model';
import { ValidationMessagePipe } from '../../../_shared/pipes/valmsg.pipe';
import { ValidationComponent } from '../../../_shared/ui/app-validation.component';
import { UserLabelHighlightComponent } from '../../../projectsnav/controls/user-label-highlight.component';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorComponent } from '../../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
// ────────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-api-info',
    templateUrl: './api-info.dialog.html',
    styleUrls: ['./api-info.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatIconModule, NgIf, MatProgressBarModule, MatDialogModule, ErrorComponent, NgFor, MatChipsModule, MatFormFieldModule, MatInputModule, FormsModule, MatTooltipModule, MatButtonModule, MatAutocompleteModule, ReactiveFormsModule, MatOptionModule, NgClass, UserLabelHighlightComponent, ValidationComponent, AsyncPipe, ValidationMessagePipe]
})
export class ApiInfoDialog implements OnInit, OnDestroy {
    @ViewChild('contactInput') contactInput!: ElementRef<HTMLInputElement>;
    @ViewChild('contactAuto') contactAutocomplete!: MatAutocomplete;

    @ViewChild('ownerInput') ownerInput!: ElementRef<HTMLInputElement>;
    @ViewChild('ownerAuto') ownerAutocomplete!: MatAutocomplete;

    @ViewChild('countryInput') countryInput!: ElementRef<HTMLInputElement>;
    @ViewChild('countryAuto') countryAutocomplete!: MatAutocomplete;

    @ViewChild('commodityInput') commodityInput!: ElementRef<HTMLInputElement>;
    @ViewChild('commodityAuto') commodityAutocomplete!: MatAutocomplete;

    @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
    @ViewChild('tagAuto') tagAutocomplete!: MatAutocomplete;

    contactControl = new UntypedFormControl();
    filteredContacts!: Observable<UserDocData[]>;

    ownerControl = new UntypedFormControl();
    filteredOwners!: Observable<UserDocData[]>;

    private _commodityList: string[] = [];
    commodityControl = new UntypedFormControl();
    filteredCommodities!: Observable<string[]>;

    private _countryList: string[] = [];
    countryControl = new UntypedFormControl();
    filteredCountries!: Observable<string[]>;

    private _tagList: string[] = [];
    tagControl = new UntypedFormControl();
    filteredTags!: Observable<string[]>;

    searchingContact = false;
    searchingOwner = false;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    private _subscriptions = new Subscription();
    vm: ApiDetailViewModel;

    // #endregion Properties (8)

    // #region Constructors (1)

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: [string, SwaggerLinkData, OdefinitionData[]],
        private _cd: ChangeDetectorRef,
        private _confirmSvc: ConfirmService,
        private _notifierSvc: NotifierService,
        private _appapisService: AppApisService,
        private _userState: GlobalState,
        public dialogRef: MatDialogRef<ApiInfoDialog>
    ) {
        const apiId = data[0];
        const swagger = data[1];
        const scopes = data[2];
        const vm = (this.vm = new ApiDetailViewModel(
            ViewModelManager.INSTANCE.createViewModelEntry(APIS_TYPEDEF, { apiId })
        ));

        vm.loadData({
            id: apiId,
            info: {
                scopes,
                projects: [swagger.project]
            },
            swaggeruis: [swagger]
        });
        vm.view.info.name = pascalCase(apiId);
        this.vm.view.validate();
        this.vm.editBehavior = {
            notify: _notifierSvc.notifyFunc()
        };

        this._subscriptions.add(
            this.vm.onStateChanged.subscribe((s) => {
                if (s === CommandNotification.StateChanged) {
                    _cd.markForCheck();
                }
            })
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (6)

    get info(): ApiInfoView {
        return this.vm.view.info;
    }

    get initialized(): boolean {
        return this.vm.loaded;
    }

    get label(): string {
        return this.initialized ? this.vm.view.info.name : '...';
    }

    get running(): boolean {
        return !!this.runningOp;
    }

    get runningOp(): string | undefined {
        return this.initialized ? this.vm.runningOp : 'Loading ...';
    }

    // #endregion Public Accessors (6)

    // #region Public Methods (4)

    cmdCancel() {
        this.vm.view.info.$editor!.cancelEdit();
        this.dialogRef.close(false);
    }

    cmdSave() {
        this.refreshAfter(this.vm.saveInfoAsync());
    }

    ngOnDestroy() {
        this._subscriptions.unsubscribe();
        if (this.vm) {
            this.vm.editBehavior = undefined;
        }
    }

    // #endregion Public Methods (4)

    // #region Private Methods (1)

    private refreshAfter(promise: Promise<any>) {
        const self = this;
        promise
            .then((_) => {
                self.dialogRef.close(true);
            })
            .catch((err) => {
                self.vm.setError(err);
                self._cd.markForCheck();
            });
    }

    ngOnInit(): void {
        this._subscriptions.add(
            this._appapisService.allTags().subscribe((data) => (this._tagList = data))
        );

        this._subscriptions.add(
            this._appapisService.allCountries().subscribe((data) => (this._countryList = data))
        );

        this._subscriptions.add(
            this._appapisService.allCommodities().subscribe((data) => (this._commodityList = data))
        );

        this.filteredContacts = this.contactControl.valueChanges.pipe(
            debounceTime(150),
            mergeMap((value: string | null) =>
                isAssigned(value)
                    ? this._appapisService.internalSearchAsync(value!.toLowerCase())
                    : of([])
            )
        );

        this.filteredOwners = this.ownerControl.valueChanges.pipe(
            debounceTime(150),
            mergeMap((value: string | null) =>
                isAssigned(value)
                    ? this._appapisService.internalSearchAsync(value!.toLowerCase())
                    : of([])
            )
        );

        this.filteredCommodities = this.commodityControl.valueChanges.pipe(
            startWith(''),
            map((value: string | null) =>
                isAssigned(value) ? this._filterCommodities(value!) : this._commodityList.slice()
            ),
            finalize(() => this._cd.markForCheck())
        );

        this.filteredCountries = this.countryControl.valueChanges.pipe(
            startWith(''),
            debounceTime(150),
            map((value: string | null) =>
                isAssigned(value) ? this._filterCountries(value!) : this._countryList.slice()
            ),
            finalize(() => this._cd.markForCheck())
        );

        this.filteredTags = this.tagControl.valueChanges.pipe(
            startWith(''),
            map((value: string | null) =>
                isAssigned(value) ? this._filterTags(value!) : this._tagList.slice()
            ),
            finalize(() => this._cd.markForCheck())
        );
    }

    private _filterCommodities(value: string): string[] {
        const filterValue = (value || '').toLowerCase();

        return filterValue.length > 0
            ? this._commodityList.filter((option) => option.toLowerCase().indexOf(filterValue) > -1)
            : this._commodityList.slice();
    }

    private _filterCountries(value: string): string[] {
        const filterValue = (value || '').toLowerCase();

        return filterValue.length > 0
            ? this._countryList.filter((option) => option.toLowerCase().indexOf(filterValue) > -1)
            : this._countryList.slice();
    }

    private _filterTags(value: string): string[] {
        const filterValue = (value || '').toLowerCase();

        return filterValue.length > 0
            ? this._tagList.filter((option) => option.toLowerCase().indexOf(filterValue) > -1)
            : this._tagList.slice();
    }

    selectedContact(event: MatAutocompleteSelectedEvent): void {
        this.info.$edit();
        this.info.businessContacts.add(event.option.value);
        this.contactInput.nativeElement.value = '';
        this.contactControl.setValue(null);
    }

    selectedOwner(event: MatAutocompleteSelectedEvent): void {
        this.info.$edit();
        this.info.productOwners.add(event.option.value);
        this.ownerInput.nativeElement.value = '';
        this.ownerControl.setValue(null);
    }

    addCountry(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (isStringAssigned(value)) {
            this.info.$edit();
            this.info.countries.$edit().add(value);
            event.chipInput?.clear();
            this.countryControl.setValue(null);
        }
    }

    selectedCountry(event: MatAutocompleteSelectedEvent): void {
        this.info.$edit();
        this.info.countries.add(event.option.viewValue);
        this.countryInput.nativeElement.value = '';
        this.countryControl.setValue(null);
    }

    addCommodity(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (isStringAssigned(value)) {
            this.info.$edit();
            this.info.commodities.$edit().add(value);
            event.chipInput?.clear();
            this.commodityControl.setValue(null);
        }
    }

    selectedCommodity(event: MatAutocompleteSelectedEvent): void {
        this.info.commodities.$edit().add(event.option.viewValue);
        this.commodityInput.nativeElement.value = '';
        this.commodityControl.setValue(null);
    }

    addTag(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (isStringAssigned(value)) {
            this.info.$edit();
            this.info.tags.$edit().add(value);
            event.chipInput?.clear();
            this.tagControl.setValue(null);
        }
    }

    selectedTag(event: MatAutocompleteSelectedEvent): void {
        this.info.tags.$edit().add(event.option.viewValue);
        this.tagInput.nativeElement.value = '';
        this.tagControl.setValue(null);
    }

    userLabel(user: UserDocData): string {
        return isBlank(user.profile.firstName) && isBlank(user.profile.lastName)
            ? isBlank(user.profile.login)
                ? '?'
                : user.profile.login
            : pascalCase(user.profile.firstName || '') +
                  ' ' +
                  pascalCase(user.profile.lastName || '');
    }

    updateUi() {
        this._cd.markForCheck();
    }

    searchedUserLayout(user: UserDocData) {
        return IS_INTERNAL(user.profile ) ? ['block', 'isB2E'] : ['block', 'isIdp'];
    }

    public uxCardTitle(swagger: SwaggerLinkView) {
        return swagger.env === 'prd' ? ['mat-title', 'prod'] : ['mat-title', 'beta'];
    }
    public uxCardButton(swagger: SwaggerLinkView) {
        return swagger.env === 'prd' ? ['round-border-prod'] : ['round-border-beta'];
    }
}
