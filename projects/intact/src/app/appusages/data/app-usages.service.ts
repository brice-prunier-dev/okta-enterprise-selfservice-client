import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IamApiStore } from 'joe-store-api';
import { firstValueFrom } from 'rxjs';
import { UsageQueryData, UsageResponseData } from 'intact-models';
import { JsonObj } from 'joe-fx';

@Injectable({
    providedIn: 'root'
})
export class AppUsagesService extends IamApiStore<UsageQueryData> {
    private cdhUrl: string;

    constructor(private _http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        super('api', 'api');
        this.cdhUrl = baseUrl + '/cdh';
    }

    query(query: UsageQueryData): Promise<UsageResponseData> {
        const url = this.cdhUrl + '/query';
        return firstValueFrom(this._http.post<UsageResponseData>(url, query));
    }

    getOneAsync<UsageQueryData>(query: JsonObj): Promise<UsageQueryData> {
        return Promise.reject('CdhService.getOneAsync is not supported !');
    }
}
