import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {JoeLogger} from 'joe-fx';
import {DetailDataModel} from 'joe-viewmodels';
import {Observer, Subscription} from 'rxjs';
import {GlobalState} from '../../../_core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgClass, NgIf, JsonPipe } from '@angular/common';

@Component({
    selector: 'iam-home',
    templateUrl: './iam-home.component.html',
    styleUrls: ['./iam-home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgClass, NgIf, MatProgressBarModule, MatDividerModule, JsonPipe]
})
export class IamHomeComponent implements OnDestroy {
    // #region Properties (7)

    private _subscriptions = new Subscription();

    error: any;
    isRejected = false;
    runningOp: string | undefined;
    vm!: DetailDataModel;

    // #endregion Properties (7)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        public appSvc: GlobalState,
        private router: Router,
        titleService: Title,
        route: ActivatedRoute
    ) {
        this.runningOp = appSvc.isAuthenticated ? undefined : 'Checking your identity...';
        titleService.setTitle('Home');
        this._subscriptions.add(
            route.data.subscribe(this.initialize.bind(this) as Partial<Observer<Data>>)
        );
    }

    // #endregion Constructors (1)

    // #region Public Accessors (1)

    get running(): boolean {
        return !!this.runningOp;
    }

    // #endregion Public Accessors (1)

    // #region Public Methods (2)

    ngOnDestroy() {
        this._subscriptions.unsubscribe();
    }

    ux_root() {
        return JoeLogger.env.startsWith('prod')
            ? ['home', 'primary', 'mat-typography']
            : ['home', 'dark', 'mat-typography'];
    }

    // #endregion Public Methods (2)

    // #region Private Methods (2)

    private initialize(d: {vm: DetailDataModel}) {
        this.vm = d.vm;
        this.vm.contextname = 'Home';
        this.runningOp = undefined;
        this.error = this.appSvc.error;
        this.isRejected = this.error !== undefined;
        this._cd.markForCheck();
        console.log('CHECK AUTHENTICATION !');
        if (this.appSvc.isAuthenticated) {
            console.log('ROUTE TO ME !');
            this.router.navigate(['/me'])
        }
    }

    // #endregion Private Methods (2)
}
