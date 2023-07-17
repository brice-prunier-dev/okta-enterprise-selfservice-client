import {
    Component,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import {ActivatedRoute, Data} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {PartialObserver, Subscription} from 'rxjs';
import {GroupMembersViewModel, ProjectsViewModel} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {MyKpiListViewModel} from '../../../_app/data/my-kpi-list.viewmodel';
import {sameString} from 'joe-fx';

@Component({
    selector: 'iam-group-kpis',
    templateUrl: './group-kpis.component.html',
    styleUrls: ['./group-kpis.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupKpisComponent implements OnDestroy {
    // #region Properties (7)


    private _subs = new Subscription();
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public vm!: GroupMembersViewModel;
    public myKpisVm!: MyKpiListViewModel;
    public _groupId!: string;

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

    private _inputsObserver(d: {inputs: [ProjectsViewModel, ProjectDetailViewModel, string], myKpis: MyKpiListViewModel}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this._groupId = d.inputs[2];
        this._titleService.setTitle(this._groupId + ' (Members)');
        const self = this;
        this.myKpisVm = d.myKpis;
        const initializerFunc = () => {
            self.vm = self.projVm.groupMembersViewModels.find((grpvm) =>
                sameString(grpvm.group.label, self._groupId)
            )!;
            self._cd.markForCheck();
        };
        if (this.projVm.areUsersLoaded) {
            initializerFunc();
        }

        this._subs.add(
            this.projVm.onStateChanged.subscribe((p) => {
                if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                    initializerFunc();
                }
            })
        );
        this._subs.add(
            this.myKpisVm.onStateChanged.subscribe((p) => this._cd.markForCheck())
        );
    }


    public ngOnDestroy() {
        this._subs.unsubscribe();
    }


    getWarnings() {
        return this.myKpisVm.groupsWarnings(this.projVm.view, this.vm.group, this.projVm.users);
    }

    // #endregion Public Methods (7)
}
