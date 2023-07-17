import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    OnDestroy
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { PartialObserver, Subscription } from 'rxjs';
import { ProjectsViewModel } from '../../../_core';
import { KpiListViewModel } from '../../data/kpi-list.viewmodel';
import { MatIconModule } from '@angular/material/icon';
import { ErrorComponent } from '../../../_shared/ui/app-error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ProjectsBarComponent } from '../../controls/projects-bar.component';

@Component({
    selector: 'iam-project-list',
    templateUrl: './iam-project-list.component.html',
    styleUrls: ['./iam-project-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ProjectsBarComponent, NgIf, MatProgressBarModule, ErrorComponent, NgFor, MatIconModule, AsyncPipe]
})
export class IamProjectListComponent implements OnInit, OnDestroy {
    private _sub = new Subscription();

    public runningOp: string | undefined;
    public searching = false;
    public vm!: KpiListViewModel;
    public projectsVm!: ProjectsViewModel;
    // #endregion Properties (8)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _router: Router,
        private _titleService: Title,
        route: ActivatedRoute
    ) {
        this.runningOp = 'Loading projects';

        this._titleService.setTitle('Gems projects');
        this._sub.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (2)

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded && !this.running);
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    // #endregion Public Accessors (2)

    // #region Public Static Methods (1)

    public static navigate(router: Router, projId: string) {
        const url = `/projects/${projId}/home`;
        router.navigateByUrl(url);
    }

    // #endregion Public Static Methods (1)

    // #region Public Methods (3)

    public navigate2Project(projId: string) {
        IamProjectListComponent.navigate(this._router, projId);
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public ngOnInit() {}

    // #endregion Public Methods (3)

    // #region Private Static Methods (1)

    // #endregion Private Static Methods (1)

    // #region Private Methods (5)

    private _initObserver(d: { input: KpiListViewModel, projects: ProjectsViewModel }) {
        this.runningOp = 'Loading projects';
        this.vm = d.input;
        this.projectsVm = d.projects;

        if (this.vm.loaded) {
            this.runningOp = undefined;
            // this._initGraphData(
            //     IamProjectListComponent._computeGraphData4Gem(this.vm.view, this._userState)
            // );
            this._cd.markForCheck();
        } else {
            const self = this;
            this._sub = this.vm.onStateChanged.subscribe(() => {
                if (self.vm.loaded) {
                    // self._initGraphData(
                    //     IamProjectListComponent._computeGraphData4Gem(self.vm.view, this._userState)
                    // );
                    self.runningOp = undefined;
                    self._cd.markForCheck();
                }
            });
        }
    }

    // #endregion Private Methods (5)
}
