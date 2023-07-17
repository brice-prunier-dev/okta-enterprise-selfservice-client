import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { PartialObserver, Subscription } from 'rxjs';
import { isArrayAssigned, isString, JoeLogger } from 'joe-fx';
import { CommandNotification } from 'joe-viewmodels';
import { ProjectsService, NotifierService, GlobalState, ProjectsViewModel } from '../../../_core';
import {
    NewProjectDialog,
    NewProjectDialogInput,
    NewProjectDialogOutput
} from '../../dialogs/new-project/new-project.dialog';
import { MyKpiListViewModel } from '../../data/my-kpi-list.viewmodel';
import { environment } from 'projects/intact/src/environments/environment';
import { ProjectDocData } from 'intact-models';

@Component({
    selector: 'iam-my-projects',
    templateUrl: './iam-my-projects.component.html',
    styleUrls: ['./iam-my-projects.component.scss']
})
export class IamMyProjectsComponent implements OnInit, OnDestroy {
    // #region Private Fields
    private _sub = new Subscription();

    public runningOp: string | unknown;
    public searching = false;
    public vm!: ProjectsViewModel;
    public vmMyKpis!: MyKpiListViewModel;
    showKpis = environment.toggleFeatures.kpis;

    // #endregion Private Fields

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _titleService: Title,
        private _router: Router,
        private _projectsSvc: ProjectsService,
        private _notifierSvc: NotifierService,
        private _dialog: MatDialog,
        public userState: GlobalState,
        route: ActivatedRoute
    ) {
        this.runningOp = 'Loading projects';
        this._titleService.setTitle('My projects');
        this._sub.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    private _initObserver(d: { input: ProjectsViewModel, myKpis: MyKpiListViewModel }) {
        this.runningOp = 'Loading projects';
        this.vmMyKpis = d.myKpis;
        this.vm = d.input;

        if (this.vm.loaded && d.myKpis.loaded) {
            this.runningOp = undefined;
            this._cd.markForCheck();
        } else {
            const self = this;

            this._sub = this.vm.onStateChanged.subscribe((p) => {
                if (p === CommandNotification.StateChanged) {
                    self.runningOp = undefined;
                    self._cd.markForCheck();
                }
            });
        }
    }

    // #endregion Constructors (1)

    // #region Public Accessors (4)

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded && !this.running);
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get isProjectAdmin(): boolean {
        return this.userState.groups.some(
            (s) => s.endsWith('-admin') || s.startsWith('admin-') || s.endsWith('-owner')
        );
    }

    // #endregion Public Accessors (4)

    // #region Public Methods (7)

    public ngOnDestroy() {
        if (this.vm) {
            if (this._sub) {
                this._sub.unsubscribe();
            }
        }
    }

    public ngOnInit() {}

    public navigate2Project(projId: string, newby = false) {
        const url = newby ? `/projects/${projId}/home?info=newby` : `/projects/${projId}/home`;
        this._router.navigateByUrl(url);
    }

    public callNewProjectDialog() {
        const self = this;
        this._dialog
            .open<NewProjectDialog, NewProjectDialogInput, NewProjectDialogOutput>(
                NewProjectDialog,
                {
                    minWidth: '400px',
                    maxWidth: '600px',
                    data: self.vm.view
                }
            )
            .afterClosed()
            .subscribe({
                next: (p) => {
                    if (isArrayAssigned(p) && p![0]) {
                        this._projectsSvc
                            .putOneAsync({
                                id: p![1]!,
                                env: '',
                                public: true,
                                description: p![2]!,
                                apps: [],
                                groups: [],
                                scopes: [],
                                admins: [],
                                cmdbs: []
                            })
                            .then((r) => {
                                self.userState.groups.push(r.groups[0].label)
                                self.vm.view.push(r);
                                self.navigate2Project(r.id, true);
                            })
                            .catch((err) =>
                                self._notifierSvc.notify('Error', isString(err) ? err : err.message)
                            );
                    }
                }
            });
    }

    noApplication(proj: ProjectDocData) {
        return proj.public && proj.apps.length === 0;
    }
    isUnusedProject(proj: ProjectDocData) {
        return this.vmMyKpis.unusedApps(proj).length === proj.apps.length;
    }

    public uxCard() {
        return JoeLogger.env.startsWith('prod')
            ? ['project-card', 'card-prod']
            : ['project-card', 'card-beta'];
    }
    public uxCardHeader() {
        return JoeLogger.env.startsWith('prod')
            ? ['card-header', 'primary']
            : ['card-header', 'dark'];
    }
    // #endregion Public Methods (7)
}
