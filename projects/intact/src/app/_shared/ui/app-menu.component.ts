import { MediaMatcher } from '@angular/cdk/layout';
import { Location } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    Inject,
    OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalState, APP_VERSION } from '../../_core';
import { trigger, state, style } from '@angular/animations';
import { environment } from '../../../environments/environment';
import { ViewModelManager } from 'joe-viewmodels';
import { JoeLogger } from 'joe-fx';
import { Subscription } from 'rxjs';

@Component({
    selector: 'iam-menu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('menuState', [
            state('nolabel', style({ display: 'none' })),
            state('labeled', style({ display: 'flex' }))
        ])
    ]
})
export class AppMenuComponent implements OnInit, OnDestroy {
    // #region Properties Internal (2)

    private _mobileQueryListener: () => void;
    private _subs = new Subscription();

    // #endregion Properties Internal (2)

    // #region Properties Public (6)

    public mobileQuery: MediaQueryList;

    public get env(): any {
        return environment.env;
    }

    public get isHomeOption(): any {
        return this.router.url && this.router.url.endsWith('/home') ? 'active-link' : 'enable-link';
    }

    public get isIntactAdmin(): boolean {
        return this._userState.isIntactAdmin;
    }

    public get isNewAppsOption(): any {
        return this.router.url && this.router.url.endsWith('/apps/new')
            ? 'active-link'
            : 'enable-link';
    }

    public get userName(): string {
        return this._userState.userName;
    }

    // #endregion Properties Public (6)

    // #region Constructors (1)

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        media: MediaMatcher,
        public router: Router,
        @Inject(APP_VERSION) public version: string
    ) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => _cd.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    // #endregion Constructors (1)

    // #region Methods Public (5)

    public goHome() {
        ViewModelManager.INSTANCE.clearCache();
        this.router.navigateByUrl('/gem');
    }

    public logout(): void {
        this._userState.logout();
    }

    public ngOnDestroy() {
        this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
        this._subs.unsubscribe();
    }

    public ngOnInit() {
        const cd = this._cd;
        this._subs.add(this._userState.onEvent.subscribe(() => cd.markForCheck()));
    }

    public refresh() {
        this._cd.markForCheck();
    }

    public uxRoot() {
        return JoeLogger.env.startsWith('prod') ? ['tool-bar', 'primary'] : ['tool-bar', 'dark'];
    }

    public uxHelp() {
        return JoeLogger.env.startsWith('prod')
            ? ['mat-caption', 'primary', 'lh-35']
            : ['mat-caption', 'dark', 'lh-35'];
    }
    public uxLogoutIcon() {
        return JoeLogger.env.startsWith('prod') ? ['offset-5', 'primary'] : ['offset-5', 'dark', 'flex-row', 'flex-align-center', 'inline-flex'];
    }
    public uxInfoIcon() {
        return JoeLogger.env.startsWith('prod') ? ['small', 'primary'] : ['small', 'dark', 'flex-row', 'flex-align-center', 'inline-flex'];
    }
    public uxCaption() {
        return JoeLogger.env.startsWith('prod')
            ? ['mat-caption', 'primary']
            : ['mat-caption', 'dark'];
    }

    // #endregion Methods Public (5)
}
