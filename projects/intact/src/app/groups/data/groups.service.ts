import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import { JsonObj } from 'joe-fx';
import { IamApiStore } from 'joe-store-api';
import {
    GroupDocData,
    UserDocData,
    GroupLinkData,
    ResourceLinkData,
    GROUP_ID,
    GROUP_REV
} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class GroupsService extends IamApiStore<GroupDocData> {
    // #region Properties (2)

    private _projectsUrl: string;
    private _groupCommandsUrl: string;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(private _http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        super(GROUP_ID, GROUP_REV);
        this._projectsUrl = baseUrl + '/projects';
        this._groupCommandsUrl = baseUrl + '/groupcommands';
    }

    // #endregion Constructors (1)

    // #region Public Methods (11)

    public getGroupMembersAsync(oid: string): Promise<UserDocData[]> {
        const url = this._projectsUrl + `/groups/${oid}/members`;
        return lastValueFrom(this._http.get<UserDocData[]>(url));
    }

    public async createProjectGroup(
        projId: string,
        payload: GroupLinkData
    ): Promise<GroupLinkData> {
        const url = this._groupCommandsUrl + `/${projId}`;
        return lastValueFrom(this._http.post<GroupLinkData>(url, payload));
    }

    public async renameAsync(data: ResourceLinkData): Promise<any> {
        const url = this._groupCommandsUrl + `/definition`;
        return lastValueFrom(this._http.put(url, data));
    }

    public getOneAsync<GroupDocData>(query: JsonObj): Promise<GroupDocData> {
        return Promise.reject('GroupsService.getOneAsync is not supported !');
    }

    // #endregion Public Methods (11)
}
