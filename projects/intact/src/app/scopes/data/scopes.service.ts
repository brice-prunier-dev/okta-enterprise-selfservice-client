import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IamApiStore } from 'joe-store-api';
import {
    ScopeDocData,
    ResourceLinkData,
    SCOPE_ID,
    SCOPE_REV,
    SubscriptionRequestData,
    ClaimData
} from 'intact-models';
import { ChangeSet, JsonObj } from 'joe-fx';
import { SubscriptionResponseData } from 'projects/intact-models/src';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScopesService extends IamApiStore<ScopeDocData> {
    // #region Properties (2)

    private _scopesUrl: string;
    private _baseUrl: string;
    private _scopeCmdsUrl: string;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(private _http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        super(SCOPE_ID, SCOPE_REV);
        this._scopesUrl = baseUrl + '/scopes';
        this._scopeCmdsUrl = baseUrl + '/scopeCommands';
        this._baseUrl = baseUrl;
    }

    // #endregion Constructors (1)

    // #region Public Methods (11)

    public getAllAsync(): Promise<ScopeDocData[]> {
        const url = this._scopesUrl;
        return lastValueFrom(this._http.get<ScopeDocData[]>(url));
    }

    public getOneAsync<ScopeDocData>(query: JsonObj): Promise<ScopeDocData> {
        return Promise.reject('ScopesService.getOneAsync is not supported !');
    }

    public createScopeAsync(projId: string, doc: ResourceLinkData): Promise<ResourceLinkData> {
        const url = this._scopeCmdsUrl + `/${projId}`;
        return lastValueFrom(this._http.post<ResourceLinkData>(url, doc));
    }

    public renameAsync(data: ResourceLinkData): Promise<any> {
        const url = this._scopeCmdsUrl + `/definition`;
        return lastValueFrom(this._http.put(url, data));
    }

    public putOneAsync(doc: ScopeDocData, cs?: ChangeSet): Promise<ScopeDocData> {
        const url = this._scopeCmdsUrl + `/create/scope`;
        return lastValueFrom(this._http.post<ScopeDocData>(url, doc));
    }

    public removeOneAsync(id: string, cs?: ChangeSet): Promise<any> {
        const url = this._scopeCmdsUrl + `/delete/scope/${id}`;
        return lastValueFrom(this._http.post(url, undefined));
    }

    public updateOneAsync(doc: ScopeDocData, cs?: ChangeSet): Promise<ScopeDocData> {
        const url = this._scopeCmdsUrl + `/update/scope/${doc.name}`;
        return lastValueFrom(this._http.post<ScopeDocData>(url, doc));
    }

    public validateSubscriptionAsync(
        subId: string,
        claim?: unknown
    ): Promise<SubscriptionResponseData> {
        const url = this._baseUrl + `/subscriptioncommands/validate`;
        return lastValueFrom(
            this._http.post<SubscriptionResponseData>(url, {
                sub: subId,
                claim
            })
        );
    }

    public renewSubscriptionAsync(subId: string): Promise<SubscriptionRequestData> {
        const url = this._baseUrl + `/subscriptioncommands/renew`;
        return lastValueFrom(this._http.post<SubscriptionRequestData>(url, { sub: subId }));
    }

    public rejectSubscriptionAsync(
        subId: string,
        comment: string
    ): Promise<SubscriptionResponseData> {
        const url = this._baseUrl + `/subscriptioncommands/reject`;
        return lastValueFrom(
            this._http.post<SubscriptionResponseData>(url, { sub: subId, comment })
        );
    }

    public cancelSubscriptionAsync(
        subId: string,
        comment: string
    ): Promise<SubscriptionResponseData> {
        const url = this._baseUrl + `/subscriptioncommands/cancel`;
        return lastValueFrom(
            this._http.post<SubscriptionResponseData>(url, { sub: subId, comment })
        );
    }

    public getClaimInfoAsync(subId: string, claim?: unknown): Promise<ClaimData> {
        const url = this._baseUrl + `/subscriptions/claim-info/${subId}`;
        return lastValueFrom(this._http.get<ClaimData>(url));
    }

    public resetClaimInfoAsync(subId: string, claim?: unknown): Promise<any> {
        const url = this._baseUrl + `/subscriptioncommands/claim`;
        return lastValueFrom(
            this._http.post(url, {
                sub: subId,
                claim
            })
        );
    }
    // #endregion Public Methods (11)
}
