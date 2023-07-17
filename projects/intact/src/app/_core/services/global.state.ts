import {Injectable, InjectionToken, Inject, EventEmitter, inject} from '@angular/core';
import {AuthConfig, OAuthService, OAuthErrorEvent} from 'angular-oauth2-oidc';

// ────────────────────────────────────────────────────────────────────────────
import {JoeLogger, isStringAssigned, sameString, JsonObj} from 'joe-fx';
import {ViewModelManager, StoreManager} from 'joe-viewmodels';
import {Router} from '@angular/router';
import {IStore} from 'joe-types';
import {ProjectNotificationService} from './projects-signalr.service';
import {CurrentUserService} from './current-user.service';
// ────────────────────────────────────────────────────────────────────────────
export const IAM_CONFIG = new InjectionToken<AuthConfig>('iam.api.angular');
export const APP_VERSION = new InjectionToken<string>('1.0.0.0');
// ────────────────────────────────────────────────────────────────────────────

type OAuthClaims = {
    sub: string;
    name: string;
    email: string;
    iss: string;
    aud: string;
    iat: string;
    exp: string;
    jti: string;
    amr: string;
    idp: string;
    nonce: string;
    preferred_username: string;
    auth_time: string;
    at_hash: string;
    groups: string[];
    implicit_groups: string[];
};

@Injectable({
    providedIn: 'root'
})
export class GlobalState {
    // #region Properties

    private _authConfig: AuthConfig;
    private _initDone = false;
    private _isIntactAdmin: boolean | undefined;
    private _loginDone = false;
    private _oauthService: OAuthService;
    private _router: Router;
    private _spareUrl: string = '';

    claims: OAuthClaims | undefined;
    groups: string[] = [];
    error: any;
    onEvent: EventEmitter<string>;

    // #endregion Properties

    // #region Public Accessors

    get accessToken(): string | undefined {
        return this.isAuthenticated ? this._oauthService.getAccessToken() : undefined;
    }

    get enterUrl(): string {
        if (this._spareUrl === '') {
            return (this._spareUrl = localStorage.getItem('app.spareUrl') || '');
        } else {
            return this._spareUrl;
        }
    }

    set enterUrl(value: string) {
        if (isStringAssigned(value)) {
            localStorage.setItem('app.spareUrl', (this._spareUrl = value));
        } else {
            if (isStringAssigned(this._spareUrl)) {
                localStorage.removeItem('app.spareUrl');
            }
            this._spareUrl = '';
        }
    }

    get isAuthenticated(): boolean {
        return this.claims !== undefined;
    }

    get isIntactAdmin(): boolean {
        // return false;
        if (this._isIntactAdmin === undefined && this.groups.length > 0) {
            const intactAdminGroups = [
                'iam-admin',
                'iam-admins',
                'client-iam-admin-client-iam',
                'intact-client-owner',
                'intact-owner',
                'intact-admin',
                'intact-admins'
            ];
            this._isIntactAdmin = this.groups.some((g) => intactAdminGroups.includes(g));
        }
        return true === this._isIntactAdmin;
    }

    get login(): string {
        return this.claims?.preferred_username ?? '?';
    }

    get mail(): string {
        return this.claims?.email ?? '?';
    }

    get userName(): string {
        return this.claims?.name ?? '?';
    }

    // #endregion Public Accessors

    // #region Constructors

    constructor(
        private _currentUserService: CurrentUserService,
        private _projectNotificationService: ProjectNotificationService,
        oauthService: OAuthService,
        @Inject(IAM_CONFIG) authConfig: AuthConfig,
        router: Router
    ) {
        this._authConfig = authConfig;
        this._router = router;
        this._oauthService = oauthService;
        this.onEvent = new EventEmitter<string>();
        this._oauthService.configure(this._authConfig);
        this._oauthService.setupAutomaticSilentRefresh();
        JoeLogger.header('SessionState');
    }

    // #endregion Constructors

    // #region Private Methods

    private enforceAdminGroups() {
        if (this.claims === undefined) {
            this.claims = this._oauthService.getIdentityClaims() as OAuthClaims;
            if (this.claims) {
                this.groups = this.claims!.groups ?? [];
                const self = this;
                this._currentUserService
                    .getUserGroups(self.claims!.preferred_username)
                    .then((grps) => (self.groups = grps));
            }
        }
    }

    // #endregion Private Methods

    // #region Public Methods

    initFlow(spareUrl: string) {
        this.enterUrl = spareUrl;
        if (!this._initDone) {
            this._oauthService.initCodeFlow();
            this._initDone = true;
        }
    }

    isMyProject(projId: string): boolean {
        return projId.length === 6 && sameString(this.login.substring(0, 6), projId);
    }

    logout(spareUrl?: string) {
        if (spareUrl) {
            this.enterUrl = spareUrl;
        }
        this._oauthService.logOut();
        this.onEvent.emit('logout');
    }

    register(name: string, proxy: IStore): void {
        const store = StoreManager.INSTANCE.store(name);
        if (!store) {
            StoreManager.INSTANCE.registerStore(proxy, name);
        }
    }

    runLoginFlow() {
        if (!this._loginDone) {
            const self = this;
            this._oauthService.events.subscribe((event) => {
                JoeLogger.debug('OAuth - ' + event.type);
                switch (event.type) {
                    case 'token_received':
                        const spareUrl = self.enterUrl;
                        self.enforceAdminGroups();
                        self._projectNotificationService.init(self.accessToken);
                        
                        if (isStringAssigned(spareUrl)) {
                            if (spareUrl !== self._router.url) {
                                JoeLogger.info('Redirect: ' + spareUrl);
                                self.enterUrl = '';
                                self._router.navigateByUrl(spareUrl);
                            }
                        } else {
                            JoeLogger.info('Redirect: /me');
                            self._router.navigateByUrl('/me');
                        }
                        break;

                    case 'code_error':
                        this.error = (event as OAuthErrorEvent).params;
                        const currentVm = ViewModelManager.INSTANCE.getCurrentViewModel();
                        if (currentVm) {
                            currentVm.setError(this.error);
                        }
                        break;
                }
            });

            this._oauthService.loadDiscoveryDocumentAndTryLogin();
            this._loginDone = true;
        }
    }

    // #endregion Public Methods
}
