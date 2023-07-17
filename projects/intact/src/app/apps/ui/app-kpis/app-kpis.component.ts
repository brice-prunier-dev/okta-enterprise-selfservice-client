import {
    Component,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PartialObserver, Subscription } from 'rxjs';
import { ProjectsViewModel } from '../../../_core';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { AppViewModel } from '../../data/app.viewmodel';
import { AppDataInput } from '../../data/types';
import { MyKpiListViewModel } from '../../../_app/data/my-kpi-list.viewmodel';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
    selector: 'iam-app-kpis',
    templateUrl: './app-kpis.component.html',
    styleUrls: ['./app-kpis.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgFor, DatePipe]
})
export class AppKpisComponent implements OnDestroy {
    // #region Properties (7)


    private _subs = new Subscription();
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public vm!: AppViewModel;
    public myKpisVm!: MyKpiListViewModel;

    // #endregion Properties (7)

    // #region Public Accessors (4)


    public get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded);
    }


    // #endregion Public Accessors (4)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this._subs.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    // #endregion Constructors (1)

    // #region Private Methods (2)

    private _inputsObserver(d: { inputs: AppDataInput, myKpis: MyKpiListViewModel }) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.vm = d.inputs[2];
        this.myKpisVm = d.myKpis;

        if (this.vm.loaded) {
            this._titleService.setTitle(this.vm.view.client_name + ' (Kpis)');
        }
        this._subs.add(this.vm.onStateChanged.subscribe(() => this._cd.markForCheck()))
        this._subs.add(this.myKpisVm.onStateChanged.subscribe(() => this._cd.markForCheck()))
        this._cd.markForCheck();
    }


    public ngOnDestroy() {
        this._subs.unsubscribe();
    }


    getWarnings() {
        return this.myKpisVm.appWarnings(this.projVm.view, this.vm.app);
    }

    // #endregion Public Methods (7)
}
