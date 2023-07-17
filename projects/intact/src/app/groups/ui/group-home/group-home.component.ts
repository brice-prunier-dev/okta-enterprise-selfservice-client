import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {ActivatedRoute, Data} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {PartialObserver, Subscription} from 'rxjs';
import {sameString} from 'joe-fx';
import {
    ProjectsViewModel,
    GroupMembersViewModel
} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {MyKpiListViewModel} from '../../../_app/data/my-kpi-list.viewmodel';
import {environment} from 'projects/intact/src/environments/environment';

@Component({
    selector: 'iam-app-home',
    templateUrl: './group-home.component.html',
    styleUrls: ['./group-home.component.scss']
})
export class GroupHomeComponent implements OnInit, OnDestroy {
    private _sub = new Subscription();
    public runningOp: string | undefined;
    public searching = false;
    public vm!: GroupMembersViewModel;
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public myKpisVm!: MyKpiListViewModel;
    public get initialized(): boolean {
        return this.vm && this.vm.loaded;
    }

    public get loading(): boolean {
        return !(this.vm && this.vm.loaded && !this.running);
    }

    public get running(): boolean {
        return !!this.runningOp;
    }
    constructor(
        private _cd: ChangeDetectorRef,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this.runningOp = 'Loading application...';
        this._sub.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    private _inputsObserver(d: {inputs: [ProjectsViewModel, ProjectDetailViewModel, string], myKpis: MyKpiListViewModel}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.myKpisVm = d.myKpis;
        const self = this;

        const initializeVm = () => {
            self.vm = this.projVm.groupMembersViewModels.find((vm) =>
                sameString(vm.group.label, d.inputs[2])
            )!;
        };

        if (this.projVm.areUsersLoaded) {
            initializeVm();
            this.runningOp = undefined;
            this._cd.markForCheck();
        } else {
            this._cd.markForCheck();
            this._sub.add(
                this.projVm.onStateChanged.subscribe((p) => {
                    if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                        initializeVm();
                        self.runningOp = undefined;
                        self._cd.markForCheck();
                    }
                })
            );
        }

        this._sub.add(
            this.myKpisVm.onStateChanged.subscribe(() => {
                self._cd.markForCheck();
            })
        );
    }
    hasWarning() {
        return environment.toggleFeatures.kpis && this.myKpisVm.groupHasWarning(this.projVm?.view!, this.vm.group, this.projVm.users)
    }

    ngOnInit() { }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }
}
