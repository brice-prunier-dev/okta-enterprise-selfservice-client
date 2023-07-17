import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import { Subject, Subscription, from } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
// ────────────────────────────────────────────────────────────────────────────
import { JoeLogger, isStringAssigned, isBlank } from 'joe-fx';
import {
    Component,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectorRef
} from '@angular/core';
import { ProjectsViewModel, GlobalState, NotifierService, ProjectsService } from '../../_core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { NgIf, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

// ────────────────────────────────────────────────────────────────────────────
@Component({
    selector: 'iam-projects-bar',
    templateUrl: './projects-bar.component.html',
    styleUrls: ['./projects-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatIconModule, MatFormFieldModule, MatAutocompleteModule, NgIf, MatOptionModule, MatProgressSpinnerModule, NgFor, MatInputModule, RouterLinkActive, RouterLink]
})
export class ProjectsBarComponent implements OnInit, OnDestroy {
    // #region Properties (10)

    private _searchEvent!: Subject<string>;
    private _subscriptions = new Subscription();
    private _searchText = '';

    @Input() projListVm!: ProjectsViewModel;

    searchedProjects!: string[];
    searching = false;

    // #endregion Properties (10)

    // #region Constructors (1)

    constructor(
        private _projectService: ProjectsService,
        private _cd: ChangeDetectorRef,
        private _notifierSvc: NotifierService,
        private _userState: GlobalState,
        private _router: Router
    ) {}

    // #endregion Constructors (1)

    // #region Public Accessors (1)

    get searchText(): string {
        return this._searchText;
    }

    // #endregion Public Accessors (1)

    // #region Public Methods (6)

    newApp() {
        this._router.navigateByUrl(`/projects/${this.projListVm.currentProject!.view.id}/apps/new`);
    }

    ngOnDestroy() {
        this._subscriptions.unsubscribe();
    }

    ngOnInit() {
        this._searchText = '';
        this.searching = false;
        this._resetSearch();
        this.searchedProjects = [];
    }

    onSearchTextChanged(event: KeyboardEvent) {
        const newInput = ((event.target as HTMLInputElement).value || '').trim().toLowerCase();
        JoeLogger.action('ProjectsMenuComponent.onSearchTextChanged', newInput);
        const changed = newInput !== this._searchText;
        if (changed) {
            const isValidSearch = newInput.length > 0;
            if (!isValidSearch) {
                this.searchedProjects = [];
                this.searching = false;
                this._cd.markForCheck();
            } else if (!this.searching) {
                this.searching = true;
                this._cd.markForCheck();
            }
            if (this.searching) {
                this._searchText = newInput || '';
                this._searchEvent.next(newInput);
            }
        }
    }

    async onSelection(arg: MatAutocompleteSelectedEvent) {
        const input = arg.option.value as string;
        this._searchText = input || '';
        if (isStringAssigned(input)) {
            const self = this;
            this._projectService.getProjectContextAsync(input).then((result) => {
                self._cd.markForCheck();
                self.projListVm.setProjectContext(result);
                self.searchedProjects = [];
                self._router.navigateByUrl('/projects/' + input + '/home');
            });
        }
    }

    // #endregion Public Methods (6)

    // #region Private Methods (2)

    private _resetSearch() {
        const self = this;
        this.xReleaseSearch();
        this._searchEvent = new Subject<string>();
        // if ( this.projListVm.currentProject ) {
        //   this._searchText = this.projListVm.currentProject.view.id;
        // }
        this._subscriptions.add(
            this._searchEvent
                .pipe<string, string[]>(
                    debounceTime(150),
                    switchMap((search: string) => self._projectService.searchAsync(search))
                )
                .subscribe({
                    next: (projectIds) => {
                        self.searchedProjects = projectIds;
                        this.searching = false;
                        self._cd.markForCheck();
                    },
                    error: () => {
                        self._cd.markForCheck();
                        self._resetSearch();
                    }
                })
        );
    }

    private xReleaseSearch() {
        this._subscriptions.unsubscribe();
        this._subscriptions = new Subscription();
    }

    // #endregion Private Methods (2)
}
