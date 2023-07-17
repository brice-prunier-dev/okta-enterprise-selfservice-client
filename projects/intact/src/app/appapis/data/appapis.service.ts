import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IamApiStore } from 'joe-store-api';
import {
    ScopeDocData,
    ReferenceChangesMessageData,
    ReferenceChangesResponseMessageData,
    UserDocData
} from 'intact-models';
import { isStringAssigned, JsonObj } from 'joe-fx';
import { OitemData } from 'joe-models';
import { ApiDocData } from './api-doc.model';
import { SwaggerApiData } from './models';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiRefData extends OitemData {
    draft: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AppApisService extends IamApiStore<ScopeDocData> {
    // #region Properties (2)

    private _apisUrl: string;
    private _apiCmdsUrl: string;
    private _appCmdsUrl: string;
    private _scopesUrl: string;
    private _userUrl: string;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(private _http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        super('name', 'name');
        this._appCmdsUrl = baseUrl + '/appcommands';
        this._scopesUrl = baseUrl + '/scopes';
        this._apisUrl = baseUrl + '/apis';
        this._apiCmdsUrl = baseUrl + '/apicommands';
        this._userUrl = baseUrl + '/users';
    }

    // #endregion Constructors (1)

    // #region Public Methods (11)

    public getAllAsync(): Promise<ScopeDocData[]> {
        const url = this._scopesUrl;
        return firstValueFrom(this._http.get<ScopeDocData[]>(url));
    }

    public subscribeAsync(
        subscription: ReferenceChangesMessageData
    ): Promise<ReferenceChangesResponseMessageData> {
        const url = this._appCmdsUrl + `/subscribe`;
        return firstValueFrom(
            this._http.post<ReferenceChangesResponseMessageData>(url, subscription)
        );
    }

    public getOneAsync<ScopeDocData>(query: JsonObj): Promise<ScopeDocData> {
        return Promise.reject('AppApisService.getOneAsync is not supported !');
    }

    public putOneAsync(): Promise<ScopeDocData> {
        return Promise.reject('AppApisService.putOneAsync is not supported !');
    }

    public removeOneAsync(): Promise<any> {
        return Promise.reject('AppApisService.removeOneAsync is not supported !');
    }

    public updateOneAsync(): Promise<ScopeDocData> {
        return Promise.reject('AppApisService.updateOneAsync is not supported !');
    }

    public apiDefs(q: string): Promise<ApiRefData[]> {
        const url = this._apisUrl;
        return isStringAssigned(q)
            ? firstValueFrom(this._http.get<ApiRefData[]>(url, { params: { q } }))
            : firstValueFrom(this._http.get<ApiRefData[]>(url));
    }

    public allTags(): Observable<string[]> {
        const url = this._apisUrl + `/tags`;
        return this._http.get<string[]>(url);
    }

    public allCommodities(): Observable<string[]> {
        const url = this._apisUrl + `/commodities`;
        return this._http.get<string[]>(url);
    }

    public allCountries(): Observable<string[]> {
        const url = this._apisUrl + `/countries`;
        return this._http.get<string[]>(url);
    }

    public registerApiAsync(payload: SwaggerApiData): Promise<any> {
        const url = this._apiCmdsUrl + `/register-swagger-api`;
        return firstValueFrom(this._http.post<any>(url, payload));
    }

    public unregisterApiAsync(payload: SwaggerApiData): Promise<any> {
        const url = this._apiCmdsUrl + `/unregister-swagger-api`;
        return firstValueFrom(this._http.post<any>(url, payload, { params: { easyapi: true } }));
    }

    async putApiAsync(payload: ApiDocData): Promise<any> {
        const url = this._apiCmdsUrl;
        return firstValueFrom(this._http.post<ApiDocData>(url, payload));
    }

    internalSearchAsync(query: string): Observable<UserDocData[]> {
        const url = this._userUrl + '/internals';
        const params = new HttpParams().set('q', query);
        return this._http.get<UserDocData[]>(url, { params }).pipe(
            map((list: UserDocData[]) => {
                return list;
            })
        );
    }

    // #endregion Public Methods (11)
}
