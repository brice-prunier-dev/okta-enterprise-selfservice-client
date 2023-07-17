import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpEventType
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GlobalState } from '../../_core';
import { Router } from '@angular/router';
import { ConfirmService } from './confirm.service';

@Injectable()
export class TokenValidityInterceptor implements HttpInterceptor {
    constructor(
        private _userState: GlobalState,
        private _confirmService: ConfirmService,
        private _router: Router
    ) {}

    expirationDate(): Date {
        const expirationEpoch = Number.parseInt(sessionStorage.getItem('expires_at') ?? '0');
        if (expirationEpoch > 0) {
            return new Date(expirationEpoch);
        } else {
            const defaultExpirationDate = new Date();
            defaultExpirationDate.setHours(defaultExpirationDate.getHours() + 1);
            return defaultExpirationDate;
        }
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const userState = this._userState;
        if (userState.isAuthenticated) {
            const validity = this.expirationDate();
            const now = new Date();
            if (now > validity) {
                const url = this._router.url;
                this._confirmService
                    .info('Security Information', 'Session expired.')
                    .then((_) => userState.logout(url));
                return of({ type: HttpEventType.Sent } as HttpEvent<unknown>);
            }
        }
        return next.handle(request);
    }
}
