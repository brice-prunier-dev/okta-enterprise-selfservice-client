import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy,
    ViewChild,
    ElementRef
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {ProjectsViewModel, ProjectsService, CmdbAppInfoData} from '../../_core';
import {ProjectDetailViewModel} from '../../projectsnav';
import {PROJECTITEM_TYPE} from 'intact-models';
import {Subject, Subscription} from 'rxjs';
import {CommandNotification} from 'joe-viewmodels';
import {GlobalState, NotifierService} from '../../_core';
import {registerEdge} from '@antv/g6';
import {ConfirmService} from '../../_shared';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {isArrayAssigned, isStringAssigned, sameString} from 'joe-fx';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import {OitemData, OitemView} from 'joe-models';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { ValidationMessagePipe } from '../../_shared/pipes/valmsg.pipe';
import { ProjectAdminsComponent } from '../controls/project-admins/project-admins.component';
import { ProjectHistoryComponent } from '../controls/project-history/project-history.component';
import { ProjectOwnershipComponent } from '../controls/project-ownership/project-ownership.component';
import { ProjectRuntimeComponent } from '../controls/project-runtime/project-runtime.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { UserLabelHighlightComponent } from '../../projectsnav/controls/user-label-highlight.component';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorComponent } from '../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor } from '@angular/common';

const lineDash = [4, 2, 1, 2];
registerEdge(
    'arc-dash',
    {
        // Rewrite setState
        setState(name, value, item) {
            const shape = item!.get('keyShape');
            // Response the running state
            if (name === 'running') {
                // When the running state is turned to be true
                if (value) {
                    let index = 0;
                    shape.animate(
                        () => {
                            index++;
                            if (index > 9) {
                                index = 0;
                            }
                            const res = {
                                lineDash,
                                lineDashOffset: -index
                            };
                            // Returns the configurations to be modified in this frame. Here the return value contains lineDash and lineDashOffset
                            return res;
                        },
                        {
                            repeat: true, // whether executed repeatly
                            duration: 3000 // animation's duration
                        }
                    );
                } else {
                    // When the running state is turned to be false
                    // Stop the animation
                    shape.stopAnimate();
                    // Clear the lineDash
                    shape.attr('lineDash', null);
                }
            }
        }
    },
    'arc'
);

@Component({
    selector: 'iam-project-home',
    templateUrl: './project-home.component.html',
    styleUrls: ['./project-home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, ErrorComponent, MatFormFieldModule, MatInputModule, FormsModule, MatChipsModule, NgFor, MatIconModule, MatAutocompleteModule, MatOptionModule, UserLabelHighlightComponent, MatButtonModule, MatTabsModule, ProjectRuntimeComponent, ProjectOwnershipComponent, ProjectHistoryComponent, ProjectAdminsComponent, ValidationMessagePipe]
})
export class ProjectHomeComponent implements OnInit, OnDestroy {
    private _subs = new Subscription();
    private _isNewby: boolean;
    private _cmdbSearch: string | null = null;
    private _cmdbSearchObserver = new Subject<string>();
    @ViewChild('cmdbInput') cmdbInput!: ElementRef<HTMLInputElement>;

    error: any;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    cmdbQueryError: any;
    runningOp: string | undefined;
    graphView = 'graph-runtime';
    selectedIndex: number | null = null;
    searching = false;

    projListVm!: ProjectsViewModel;
    vm!: ProjectDetailViewModel;
    searchCmdbApps: CmdbAppInfoData[] = [];

    get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    get withError(): boolean {
        return !!this.vm.error;
    }

    get running(): boolean {
        return !!this.runningOp || (this.initialized && this.vm.running);
    }

    get editable(): boolean {
        if (this.initialized) {
            const projVm = this.projListVm.currentProject as ProjectDetailViewModel;
            const userState = this._userState;
            return (
                userState.isIntactAdmin ||
                userState.isMyProject(projVm.view.id) ||
                projVm.isProjectAdmin
            );
        }
        return false;
    }

    get canSave(): boolean {
        return this.vm.view.$isEditing && this.vm.view.$editor!.isTouched();
    }

    get cmdbSearch(): string | null {
        return this._cmdbSearch;
    }

    set cmdbSearch(value: string | null) {
        if (value !== this._cmdbSearch) {
            this._cmdbSearch = value;
            if (isStringAssigned(value) && value!.length > 2) {
                this._cmdbSearchObserver.next(value!);
            } else {
                this.searchCmdbApps = [];
                this._cd.markForCheck();
            }
        }
    }

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _notifierSvc: NotifierService,
        private _confirmSvc: ConfirmService,
        private _projectService: ProjectsService,
        private _titleService: Title,
        route: ActivatedRoute
    ) {
        const self = this;
        this.selectedIndex = null;
        const initComponent = () => {
            self.runningOp = undefined;
            self._titleService.setTitle(self.vm.view.id + ' (Home)');
            self._cd.markForCheck();
        };
        this._isNewby = route.snapshot.queryParams.info === 'newby';
        route.data.subscribe((d) => {
            self.projListVm = d.inputs[0];
            self.vm = d.inputs[1];
            self.vm.selecting(undefined, PROJECTITEM_TYPE.project);

            self._subs.add(
                self.vm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged && self.vm.loaded) {
                        initComponent();
                    } else {
                        if (p === CommandNotification.DataChanged) {
                            self._cd.markForCheck();
                        }
                    }
                })
            );

            if (self.vm.loaded) {
                self.vm.onStateChanged.next(CommandNotification.StateChanged);
            }
        });
    }

    private _prepareCmdbSearch() {
        const proxy = this._projectService;
        const that = this;
        this._subs.add(
            this._cmdbSearchObserver
                .pipe(
                    tap(() => {
                        that.runningOp = 'Loading...';
                        that._cd.markForCheck();
                    }),
                    debounceTime(200),
                    switchMap((search: string) => proxy.searchCmdbAppsAsync(search.trim()))
                )
                .subscribe((searchResult) => {
                    that.searchCmdbApps = isArrayAssigned(searchResult) ? searchResult : [];
                    that.runningOp = undefined;
                    that._cd.markForCheck();
                })
        );
    }

    ngOnInit() {
        this.selectedIndex = 1;
        const cd = this._cd;
        this._prepareCmdbSearch();
        setTimeout(() => {
            this.selectedIndex = 0;
            cd.markForCheck();
        }, 10);
    }

    ngOnDestroy() {
        this.selectedIndex = null;
        this._subs.unsubscribe();
    }

    cmdAddCmdbSelection(event: MatAutocompleteSelectedEvent | MatChipInputEvent): void {
        const prjCmdbs = this.vm.view.cmdbs;
        const cmdRef = prjCmdbs.$newChild<OitemView>();
        const cmdbApp =
            event instanceof MatAutocompleteSelectedEvent
                ? (event.option.value as CmdbAppInfoData)
                : this.searchCmdbApps.find((i) => sameString(i.name, event.value))!;

        cmdRef.$assign({oid: cmdbApp.applicationId, label: cmdbApp.name});
        prjCmdbs.add(cmdRef);

        this._cmdbSearch = this.cmdbInput.nativeElement.value = '';
        this.searchCmdbApps = [];
        this._cd.markForCheck();
    }

    cmdCancel() {
        this.vm.view.$editor!.cancelEdit();
        this._cmdbSearch = '';
        this._cd.markForCheck();
    }
    cmdSaveAsync() {
        if (this.editable) {
            this.runningOp = 'Saving data...';
            this.vm.error = undefined;
            const self = this;
            const view = this.vm.view;
            this._projectService
                .renameAsync(
                    view.id,
                    view.description,
                    view.cmdbs.$json() as unknown as OitemData[]
                )
                .then((r) => {
                    self._notifierSvc.notify('Definition Update', 'Succeed');
                    view.$editor!.endEdit();
                    this.runningOp = undefined;
                    this._cd.markForCheck();
                })
                .catch((err) => {
                    self.vm.error = err;
                    self._cd.markForCheck();
                });
        }
    }
}
