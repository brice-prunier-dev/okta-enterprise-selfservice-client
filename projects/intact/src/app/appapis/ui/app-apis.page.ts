import { Component, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data } from '@angular/router';
import { PartialObserver, Subscription } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────────
import { AppLinkData } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────────
import { ProjectsViewModel } from '../../_core';
import { ProjectDetailViewModel } from '../../projectsnav';
import { AppViewModel, AppDataInput } from '../../apps';

@Component({
    selector: 'iam-app-apis',
    templateUrl: './app-apis.page.html',
    styleUrls: ['./app-apis.page.scss']
})
export class AppSubscriptionsPage implements OnInit, OnDestroy {
    // #region Properties (4)

    #subs = new Subscription();
    public appVm!: AppViewModel;
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;

    // #endregion Properties (4)

    // #region Constructors (1)

    constructor(
        private _titleService: Title,
        private _cd: ChangeDetectorRef,

        route: ActivatedRoute
    ) {
        this.#subs.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (2)

    public get isSwagger(): boolean {
        return (
            (this.projVm.selectedItem as AppLinkData).swagger == true &&
            (this.projVm.selectedItem as AppLinkData).type !== 'service'
        );
    }

    public get running(): boolean {
        return !this.appVm || !this.projVm || !this.projListVm;
    }

    // #endregion Public Accessors (2)

    // #region Public Methods (2)

    public ngOnDestroy() {
        this.#subs.unsubscribe();
    }

    ngOnInit() {}

    // #endregion Public Methods (2)

    // #region Private Methods (1)

    private _initObserver(d: { inputs: AppDataInput }) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.appVm = d.inputs[2];
        this._titleService.setTitle(this.appVm.entry.query.id + ' (Apis)');
        this._cd.markForCheck();
    }

    // #endregion Private Methods (1)
}
