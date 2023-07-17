import {Component, OnInit, ChangeDetectorRef, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import {ENTER} from '@angular/cdk/keycodes';
import {Subject, Observable, from} from 'rxjs';
import {switchMap, debounceTime} from 'rxjs/operators';
// ────────────────────────────────────────────────────────────────────────────────
import {sameArrays, JoeLogger, sameString, Setview, isArray} from 'joe-fx';
import {t} from 'joe-types';
import {
    ScopeDocData,
    ReferenceChangesMessageData,
    SCOPES_OPENID,
    AppLinkView,
    GroupScopesData,
    AppApisInfoData
} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────────
import {GlobalState} from '../../../_core';
import {ConfirmService} from '../../../_shared';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {AppApisService} from '../../data/appapis.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { ErrorComponent } from '../../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
// ────────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-scopes-subscriptions-dialog',
    templateUrl: './scopes-subscriptions.dialog.html',
    styleUrls: ['./scopes-subscriptions.dialog.scss'],
    standalone: true,
    imports: [MatIconModule, NgIf, MatProgressBarModule, MatDialogModule, ErrorComponent, MatChipsModule, NgFor, NgClass, MatAutocompleteModule, MatOptionModule, MatFormFieldModule, MatInputModule, MatButtonModule, AsyncPipe]
})
export class ScopesSubscriptionDialog implements OnInit {
    // #region Properties (13)

    private _oldScopes: string[];
    private _searchEvent = new Subject<string>();
    private _searchText = '';
    private _groupScopesData!: GroupScopesData;
    public readonly _targetIsGroup: boolean;

    public readonly appLink: AppLinkView;
    public readonly projVm: ProjectDetailViewModel;
    public readonly separatorKeysCodes: number[] = [ENTER];

    public resScopes: string[];
    public error: any;
    public inputError: string | undefined;
    public runningOp: string | undefined;
    public scopes: ScopeDocData[] = [];
    public searchScopes!: Observable<ScopeDocData[]>;
    public searching = false;

    // #endregion Properties (13)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _appApisService: AppApisService,
        private _confirm: ConfirmService,
        @Inject(MAT_DIALOG_DATA)
        public data: [AppLinkView, ProjectDetailViewModel, AppApisInfoData[] | GroupScopesData],
        public dialogRef: MatDialogRef<ScopesSubscriptionDialog>
    ) {
        this.appLink = data[0];
        this.projVm = data[1];
        if (this.appLink.swagger && !isArray(data[2])) {
            this._targetIsGroup = true;
            this._groupScopesData = data[2] as GroupScopesData;
            this._oldScopes = this._groupScopesData.scopes.slice();
            this.resScopes = this._oldScopes.slice();
        } else {
            this._targetIsGroup = false;
            const openIdApi = (data[2] as AppApisInfoData[]).find((a) => a.id === 'idtoken');
            const openIdScopes = !!openIdApi ? openIdApi.appScopes : [];
            this._oldScopes = [
                ...openIdScopes,
                ...this.appLink.scopes,
                ...this.appLink.subs
            ].sort();
            this.resScopes = this._oldScopes.slice();
        }
    }

    // #endregion Constructors (1)

    // #region Public Accessors (5)

    public get editable(): boolean {
        const userState = this._userState;
        const projVm = this.projVm;
        return (
            userState.isIntactAdmin ||
            userState.isMyProject(projVm.view.id) ||
            projVm.isItemAdmin(this.appLink, userState.login, userState.groups)
        );
    }

    public get isDirty(): boolean {
        return !sameArrays(this._oldScopes, this.resScopes);
    }

    public get removedScopes(): string[] {
        const appScopes = this.resScopes;
        return this._oldScopes.filter((s) => !appScopes.includes(s));
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get searchText(): string {
        return this._searchText;
    }

    // #endregion Public Accessors (5)

    // #region Public Methods (12)

    public cancel() {
        this.dialogRef.close();
    }

    public isNew(scope: string): boolean {
        return this.resScopes.includes(scope) && !this._oldScopes.includes(scope);
    }

    public isRemove(scope: string): boolean {
        return !this.resScopes.includes(scope) && this._oldScopes.includes(scope);
    }

    public ngOnInit() {
        this.dialogRef.updateSize('400px', 'auto');
        const self = this;
        this._appApisService
            .getAllAsync()
            .then((r) => {
                self.scopes = r;
                this._prepareScopeSearch();
                self._cd.markForCheck();
            })
            .catch((err) => {
                self.error = err;
                self._cd.markForCheck();
            });
    }

    public ok() {
        const self = this;
        const appLink = this.appLink;
        const newScopes = this.resScopes.filter((scp) => self.isNew(scp));
        const removedScopes = this._oldScopes.filter((scp) => self.isRemove(scp));
        const targetIsGroup = this._targetIsGroup;
        if (
            !this._userState.isIntactAdmin &&
            !this._userState.isMyProject(this.projVm.view.id) &&
            !this.projVm.isProjectAdmin &&
            !this.projVm.isItemAdmin(appLink, this._userState.login, this._userState.groups)
        ) {
            this._confirm.info(
                'Scope Subscription',
                "You're not accedited to subscribe for application: " + appLink.label + ' !'
            );
            return;
        }

        this._confirm
            .confirm(
                `Confirmation`,
                `You're about to change the subscriptions of "${appLink.label}". Do you want to continue ?`
            )
            .then((ok) => {
                if (ok) {
                    this.runningOp = 'Saving scopes dependencies...';
                    this._cd.markForCheck();
                    const subscription = {
                        project: self.projVm.view.id,
                        targetType: 'app',
                        target: appLink.label,
                        changes: {
                            added: newScopes,
                            removed: removedScopes
                        }
                    } as ReferenceChangesMessageData;
                    const scopeView = targetIsGroup
                        ? new Setview(this._oldScopes, t.array.of(t.string.name))
                        : appLink.scopes;
                    if (targetIsGroup) {
                        subscription.changeTargetType = 'group';
                        subscription.changeTarget = this._groupScopesData.label;
                    }
                    self._appApisService
                        .subscribeAsync(subscription)
                        .then((r) => {
                            self.runningOp = undefined;
                            self.projVm.resetSubscriptions();
                            const result = r;
                            if (result.changes.removed.length > 0) {
                                result.changes.removed.forEach((s) => scopeView.remove(s));
                            }
                            if (result.changes.added.length > 0) {
                                result.changes.added
                                    .filter(
                                        (s) =>
                                            targetIsGroup ||
                                            !SCOPES_OPENID.includes(s.toLowerCase())
                                    )
                                    .forEach((s) => scopeView.add(s));
                            }
                            if (result.subscriptions.length > 0) {
                                result.subscriptions.forEach((s) =>
                                    appLink.subs.add(s.split('~')[0])
                                );
                            }
                            if (appLink.$isEditing) {
                                appLink.$editor!.endEdit();
                            }
                            if (targetIsGroup) {
                                this._groupScopesData.scopes =
                                    scopeView.$json() as unknown as string[];
                            }
                            self.dialogRef.close(true);
                        })
                        .catch((err) => {
                            self.runningOp = undefined;
                            self.error = err;
                            self._cd.markForCheck();
                        });
                }
            });
    }

    public onScopeSelection(arg: MatAutocompleteSelectedEvent) {
        this.error = undefined;
        if (this._addScope(arg.option.value as string)) {
            this.resetSearchInput();
        }
    }

    public onSearchTextChanged(event?: KeyboardEvent) {
        this.inputError = undefined;
        const input = ((event?.target as HTMLInputElement)?.value || '').trim();
        if (event?.key === 'Enter') {
            this._addScope(input);
        } else if (event?.key === 'Delete' && event.ctrlKey) {
            this.resetSearchInput();
        } else {
            if (input !== this._searchText) {
                this._searchText = input as string;
                this._searchEvent.next(this._searchText);
            }
        }
    }

    public onValidateTextChanged(event: KeyboardEvent) {
        this.inputError = undefined;
        const input = ((event.target as HTMLInputElement).value || '').trim();
    }

    public removeScope(scopeName: string): void {
        if (this.editable) {
            const idx = this.resScopes.indexOf(scopeName);
            if (idx > -1) {
                this.resScopes.splice(idx, 1);
                this._cd.markForCheck();
            }
        }
    }

    public resetSearchInput() {
        this.inputError = undefined;
        this._searchText = 'api.';
        this._prepareScopeSearch();
        this._cd.markForCheck();
    }

    public scopeColor(scp: string) {
        return this._targetIsGroup
            ? SCOPES_OPENID.includes(scp.toLowerCase()) ||
                this._groupScopesData.scopes.find((s) => sameString(s, scp))
                ? ['primary']
                : ['new']
            : SCOPES_OPENID.includes(scp.toLowerCase()) ||
                this.appLink.scopes.find((s) => sameString(s, scp))
                ? ['primary']
                : this.appLink.subs.find((s) => sameString(s, scp))
                    ? ['warn']
                    : ['new'];
    }

    public searchDisplayFn(scope: any): string {
        return scope
            ? typeof scope === 'string'
                ? (scope as string) || ''
                : scope.name || ''
            : '';
    }

    // #endregion Public Methods (12)

    // #region Private Methods (2)

    private _addScope(newScopeName: string): boolean {
        this.inputError = undefined;
        if (!this.scopes.find((r) => r.name === newScopeName)) {
            this.inputError = `${newScopeName} is not an existing scope!`;
        } else if (!this.resScopes.includes(newScopeName)) {
            this.resScopes.push(newScopeName);
            this.resScopes = this.resScopes.sort();
        } else {
            this.inputError = `${newScopeName} is already a selected!`;
        }
        this._cd.markForCheck();
        return !!this.inputError;
    }

    private _prepareScopeSearch() {
        const that = this;
        this.searchScopes = this._searchEvent.pipe(
            debounceTime(300),
            switchMap<string, Observable<ScopeDocData[]>>((search) => {
                if (search.length < 5 && 'api.'.startsWith(search)) {
                    return from([]);
                }
                const searchRegex: RegExp = new RegExp('\\b' + search, 'i');
                return from([that.scopes.filter((s) => searchRegex.test(s.name))]);
            })
        );
    }

    // #endregion Private Methods (2)
}
