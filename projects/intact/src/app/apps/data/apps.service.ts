import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, map, Observable } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import { DataObj, JsonObj } from 'joe-fx';
import { IamApiStore } from 'joe-store-api';
// ────────────────────────────────────────────────────────────────────────────
import {
    APPDEF_ID,
    APPDEF_REV,
    GroupDocData,
    AppDocData,
    AppInfoData,
    UserDocData,
    ResourceLinkData,
    GroupScopesData,
    AppApisInfoData,
    DefaultAppDocType
} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class ApplicationService extends IamApiStore<AppDocData> {
    // #region Properties (3)

    private _adminCommandsUrl: string;
    private _groupsUrl: string;
    private _groupCommandsUrl: string;
    private _appCommandsUrl: string;
    private _appsUrl: string;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(private _http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        super(APPDEF_ID, APPDEF_REV);
        this._appsUrl = baseUrl + '/apps';
        const appCommand = (this._appCommandsUrl = baseUrl + '/appcommands');
        this._groupsUrl = baseUrl + '/groups';
        this._groupCommandsUrl = baseUrl + '/groupcommands';
        this._adminCommandsUrl = baseUrl + '/admincommands';
        DefaultAppDocType.asyncrules.client_name = (
            entity: AppDocData
        ): Promise<DataObj | undefined> => {
            const url = `${appCommand}/exists/${entity.client_name}`;
            return lastValueFrom<DataObj | undefined>(
                this._http.get<boolean>(url).pipe<DataObj | undefined>(
                    map((exists: boolean) => {
                        return exists ? { uniquename: true } : undefined;
                    })
                )
            );
        };
    }

    // #endregion Constructors (1)

    // #region Public Methods (12)

    public async existsAppName(appName: string): Promise<boolean> {
        const url = this._appCommandsUrl + `/exists/${appName}`;
        return lastValueFrom(this._http.get<boolean>(url));
    }

    public async getAllAsync(): Promise<AppDocData[]> {
        return Promise.reject('AppsService.getAllAsync is not supported !');
    }

    public async getAppGroupsAsync(label: string): Promise<GroupDocData[]> {
        const url = this._appsUrl + `/${label}/groups`;
        return lastValueFrom(this._http.get<GroupDocData[]>(url));
    }

    public async getAppUsersByLabelAsync(label: string): Promise<UserDocData[]> {
        const url = this._appsUrl + `/${label}/users`;
        return lastValueFrom(this._http.get<UserDocData[]>(url));
    }

    public async getAppApisInfoAsync(label: string): Promise<AppApisInfoData[]> {
        const url = this._appsUrl + `/${label}/apis-info`;
        return lastValueFrom(this._http.get<AppApisInfoData[]>(url));
    }

    public async getSwaggerScopesAsync(label: string): Promise<GroupScopesData[]> {
        const url = this._appsUrl + `/${label}/groups-scopes`;
        return lastValueFrom(this._http.get<GroupScopesData[]>(url));
    }

    public async getByLabel(appName: string): Promise<AppDocData> {
        const url = this._appsUrl + `/${appName}`;
        return lastValueFrom(this._http.get<AppDocData>(url));
    }

    public async getOneAsync<AppDocData>(query: JsonObj): Promise<AppDocData> {
        return Promise.reject('AppsService.getOneAsync is not supported !');
    }

    public async renameAsync(data: ResourceLinkData): Promise<any> {
        const url = this._appCommandsUrl + '/definition';
        return lastValueFrom(this._http.put(url, data));
    }

    public async putOneAsync(doc: AppDocData): Promise<AppDocData> {
        const url = this._appCommandsUrl;
        return lastValueFrom(this._http.post<AppDocData>(url, doc));
    }

    public async removeOneAsync(appName: string): Promise<any> {
        const url = this._adminCommandsUrl + '/deleteapp';
        return lastValueFrom(this._http.post(url, appName));
    }

    public searchAsync(query: string): Observable<AppInfoData[]> {
        const url = this._appCommandsUrl + '/search';
        const params = new HttpParams().set('q', query);
        return this._http.get<AppInfoData[]>(url, { params });
    }

    public async linkGroup(projId: string, appId: string, grpId: string): Promise<boolean> {
        const url = this._groupCommandsUrl + '/link';
        return lastValueFrom(this._http.post<boolean>(url, [projId, appId, grpId]));
    }

    public async unlinkGroup(projId: string, appId: string, grpId: string): Promise<any> {
        const url = this._groupCommandsUrl + '/unlink';
        return lastValueFrom(this._http.post(url, [projId, appId, grpId]));
    }

    // #endregion Public Methods (12)
}
