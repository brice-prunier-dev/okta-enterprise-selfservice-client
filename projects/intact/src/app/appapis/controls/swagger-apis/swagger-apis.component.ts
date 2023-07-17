import {
    Component,
    OnDestroy,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    Input
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import {Subject, Subscription} from 'rxjs';
import {debounceTime, tap} from 'rxjs/operators';
// ────────────────────────────────────────────────────────────────────────────────
import {
    isArrayAssigned,
    isStringAssigned,
    JoeLogger,
    RuntimeMessage,
    sameString,
    Tstring,
    ValidationState
} from 'joe-fx';
import {t} from 'joe-types';
import {OdefinitionData} from 'joe-models';
import {AppLinkView, GroupScopesData} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────────
import {ConfirmService} from '../../../_shared';
import {GlobalState, ProjectsViewModel} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {AppViewModel} from '../../../apps';
import {ApiRefData, AppApisService} from '../../data/appapis.service';
import {ApiInfoDialog} from '../../dialogs/api-info/api-info.dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UserLabelHighlightComponent } from '../../../projectsnav/controls/user-label-highlight.component';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorComponent } from '../../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor } from '@angular/common';
// ────────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-swagger-apis',
    templateUrl: './swagger-apis.component.html',
    styleUrls: ['./swagger-apis.component.scss', '../../ui/app-apis.page.scss'],
    standalone: true,
    imports: [NgIf, MatProgressBarModule, ErrorComponent, MatFormFieldModule, MatAutocompleteModule, NgFor, MatOptionModule, UserLabelHighlightComponent, MatIconModule, MatInputModule, MatButtonModule, MatChipsModule]
})
export class AppSwaggerApisComponent implements OnChanges, OnDestroy {
    // #region Properties

    private _apiQuery: string = '';
    private _apis: ApiRefData[] = [];
    private _isSelecting = false;
    private _keyType: Tstring;
    private _searchInputObserver = new Subject<string>();
    private _subs = new Subscription();

    @Input() appVm!: AppViewModel;
    @Input() projListVm!: ProjectsViewModel;
    @Input() projVm!: ProjectDetailViewModel;

    apiQueryValidationState: ValidationState;
    appLink!: AppLinkView;
    dialog: MatDialog;
    runningOp: string | undefined;
    searchApis: ApiRefData[] = [];

    // #endregion Properties

    // #region Public Accessors

    get apiQuery(): string {
        return this._apiQuery;
    }

    get apiQueryAssigned(): boolean {
        return isStringAssigned(this._apiQuery);
    }

    set apiQuery(value: string) {
        this._apiQuery = (value || '')
            .toLocaleLowerCase()
            .replace(' ', '-')
            .replace(/[\.\/,;~#:^!?%$@]/, '');

        this.apiQueryValidationState = this.apiQueryAssigned
            ? this._keyType.validate(this._apiQuery)
            : this._keyType.validate('xx');
    }

    get apiQueryErrorMessage(): string | null {
        return this.apiQueryValidationState.withError()
            ? RuntimeMessage.AsText(this.apiQueryValidationState.errors)
            : null;
    }

    get editable(): boolean {
        return (
            this._userState.isIntactAdmin ||
            this._userState.isMyProject(this.projVm.view.id) ||
            this.projVm.isItemAdmin(
                this.projVm.selectedItem!,
                this._userState.login,
                this._userState.groups
            )
        );
    }

    get initialized(): boolean {
        return !!this.appLink;
    }

    get running(): boolean {
        return !!this.runningOp;
    }

    // #endregion Public Accessors

    // #region Constructors

    constructor(
        private _appApisService: AppApisService,
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _confirmService: ConfirmService,
        dialog: MatDialog
    ) {
        this._keyType = t.string.id;
        this.dialog = dialog;
        this.runningOp = 'loading api data...';
        this.apiQueryValidationState = this._keyType.validate('xx');
    }

    // #endregion Constructors

    // #region Private Methods

    private _prepareApiSearch() {
        const proxy = this._appApisService;
        const that = this;
        this._subs.add(
            this._searchInputObserver
                .pipe(
                    tap(() => {
                        that._cd.markForCheck();
                    }),
                    debounceTime(200)
                )
                .subscribe((q) => {
                    that.searchApis = isArrayAssigned(that._apis)
                        ? that._apis.filter((api) => api.oid.includes(q) || api.label.includes(q))
                        : [];
                    that._cd.markForCheck();
                })
        );
    }

    // #endregion Private Methods

    // #region Public Methods

    apiSearchChanged(event: KeyboardEvent) {
        const key = event.key;
        switch (key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                this._isSelecting = this.searchApis?.length > 0;
                break;
            default:
                const newInput = (event.target as HTMLInputElement).value;
                this.handleTextChanged(newInput.replace(' ', '.'));
                break;
        }
    }

    async apiSelectionAsyncEvent(arg: MatAutocompleteSelectedEvent) {
        if (typeof arg.option.value === 'string') {
            this._apiQuery = arg.option.value;
            if (
                this.editable &&
                this.apiQueryAssigned &&
                !this.apiQueryValidationState.withError()
            ) {
                const apiKey = this._apiQuery;

                if (isStringAssigned(apiKey) && !this.appLink.apis.includes(apiKey)) {
                    const confirmed = await this._confirmService.confirm(
                        'Confirmation',
                        `Do you want to link the current swagger to "${apiKey}" API in Easyapi?`
                    );
                    if (confirmed) {
                        this.runningOp = 'Saving...';
                        this._cd.markForCheck();
                        const payload = {
                            oid: this.appLink.oid,
                            label: this.appLink.label,
                            env: JoeLogger.env.startsWith('prod') ? 'prd' : 'bta',
                            project: this.projVm.view.id,
                            api: apiKey
                        };
                        try {
                            await this._appApisService.registerApiAsync(payload);
                            this.appLink.apis.add(apiKey);
                            this.appLink.apis.$editor!.endEdit();
                            this.runningOp = undefined;
                            this._cd.markForCheck();
                        } catch (ex) {
                            this.appVm.setError(ex);
                            this.runningOp = undefined;
                            this._cd.markForCheck();
                        }
                    }
                }
                // Reset the input value
                this._apiQuery = '';
                this._cd.markForCheck();
            }
        }
    }

    async cmdRemoveApiAsync(apiKey: string) {
        if (this.editable) {
            if (isStringAssigned(apiKey) && this.appLink.apis.includes(apiKey)) {
                const confirmed = await this._confirmService.confirm(
                    'Confirmation',
                    `Do you want to unlink the current swagger from "${apiKey}" API in Easyapi?`
                );
                if (confirmed) {
                    this.runningOp = 'Saving...';
                    this._cd.markForCheck();
                    const payload = {
                        oid: this.appLink.oid,
                        label: this.appLink.label,
                        env: JoeLogger.env.startsWith('prod') ? 'prd' : 'bta',
                        project: this.projVm.view.id,
                        api: apiKey
                    };
                    try {
                        await this._appApisService.unregisterApiAsync(payload);
                        this.appLink.apis.remove(apiKey);
                        this.appLink.apis.$editor!.endEdit();
                        this.runningOp = undefined;
                        this._cd.markForCheck();
                    } catch (ex) {
                        this.appVm.setError(ex);
                        this.runningOp = undefined;
                        this._cd.markForCheck();
                    }
                }
            }

            this._cd.markForCheck();
        }
    }

    handleTextChanged(input: string) {
        this.apiQuery = input;
        this._isSelecting = false;
        this._searchInputObserver.next(this._apiQuery);
    }

    async newApiAsyncRequest(event: any) {
        const self = this;
        if (
            this.editable &&
            this.apiQueryAssigned &&
            !this.apiQueryValidationState.withError() &&
            !this._isSelecting
        ) {
            const apiKey = this._apiQuery;

            if (this.searchApis && this.searchApis.some((api) => api.oid === apiKey)) {
                return;
            }
            var scopeDef = this.projVm.view.scopes
                .filter((scp) => this.appLink.scopes.some((s) => sameString(s, scp.oid)))
                .map<OdefinitionData>((scp) => {
                    return {oid: scp.oid, description: scp.description};
                });

            const dialogData = {
                data: [
                    apiKey,
                    {
                        oid: this.appLink.oid,
                        label: this.appLink.label,
                        env: JoeLogger.env.startsWith('prod') ? 'prd' : 'bta',
                        project: this.projVm.view.id,
                        api: apiKey
                    },
                    scopeDef
                ] // ,
                // width: this._media.isMatched('(min-width: 1024px)')
                //     ? '1000px'
                //     : undefined
            };

            this._subs.add(
                await this.dialog
                    .open(ApiInfoDialog, dialogData)
                    .afterClosed()
                    .subscribe((done) => {
                        if (done) {
                            self.appLink.apis.add(apiKey!);
                            self.appLink.apis.$editor!.endEdit();
                        }
                        self._apiQuery = '';
                        self._cd.markForCheck();
                    })
            );
        }
    }

    ngOnChanges(changements: SimpleChanges) {
        if (this.projListVm && this.projVm && this.appVm) {
            const project = this.projVm.view;
            const appLink = (this.appLink = project.apps.find(
                (a) => a.oid === this.appVm.view.id
            )!);
            this.runningOp = undefined;
            this._cd.markForCheck();
        }
    }

    ngOnDestroy() {
        this._subs.unsubscribe();
    }

    ngOnInit() {
        const self = this;
        this._appApisService.apiDefs('').then((data) => (self._apis = data));
        this._prepareApiSearch();
    }

    // #endregion Public Methods
}
