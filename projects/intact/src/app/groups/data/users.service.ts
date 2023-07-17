import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import { JsonObj } from 'joe-fx';
import { OitemData } from 'joe-models';
import { IamApiStore } from 'joe-store-api';
import {
    UserDocData,
    UserPayloadData,
    GroupDocData,
    ReferenceChangesMessageData,
    USER_ID,
    USER_REV,
    AssignStatus
} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────

interface GroupProfileData {
    name: string;
    description: string;
}
interface GroupData {
    id: string;
    profile: GroupProfileData;
}

@Injectable({
    providedIn: 'root'
})
export class UsersService extends IamApiStore<UserDocData> {
    private _userCommandsUrl: string;
    private _projectCommandsUrl: string;
    private _appsUrl: string;
    private _usersUrl: string;

    constructor(private _http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        super(USER_ID, USER_REV);
        this._projectCommandsUrl = baseUrl + '/projectcommands';
        this._userCommandsUrl = baseUrl + '/usercommands';
        this._usersUrl = baseUrl + '/users';
        this._appsUrl = baseUrl + '/apps';
    }

    public updateAsync(doc: UserPayloadData): Promise<UserDocData> {
        const url = this._userCommandsUrl + '/update';
        return lastValueFrom(this._http.post<UserDocData>(url, doc));
    }

    public createAsync(doc: UserPayloadData): Promise<UserDocData> {
        const url = this._userCommandsUrl + '/define';
        return lastValueFrom(this._http.post<UserDocData>(url, doc));
    }

    public suspendAsync(login: string): Promise<any> {
        const url = this._userCommandsUrl + '/suspend-account/' + login;
        return lastValueFrom(this._http.post(url, null));
    }

    public unsuspendAsync(login: string): Promise<any> {
        const url = this._userCommandsUrl + '/unsuspend-account/' + login;
        return lastValueFrom(this._http.post(url, null));
    }

    public userMembershipAsync(data: ReferenceChangesMessageData): Promise<AssignStatus[]> {
        const url = this._projectCommandsUrl + `/membership`;
        return lastValueFrom(this._http.post<AssignStatus[]>(url, data));
    }

    public getOneAsync<UserDocData>(id: JsonObj): Promise<UserDocData> {
        return Promise.reject('UsersService.getOneAsync is not supported !');
    }

    public createGroup(data: any): Promise<any> {
        const url = this._projectCommandsUrl + `/rename/group`;
        return lastValueFrom(this._http.post(url, data));
    }

    public internalSearchAsync(query: string): Observable<UserDocData[]> {
        const url = this._usersUrl + `/internals`;
        const params = new HttpParams().set('q', query).set('size', 25);
        return this._http.get<UserDocData[]>(url, { params });
    }

    public externalSearchAsync(query: string): Observable<UserDocData[]> {
        const url = this._usersUrl + `/externals`;
        const params = new HttpParams().set('q', query);
        return this._http.get<UserDocData[]>(url, { params });
    }

    public getAppMembersAsync(appLabel: string): Promise<UserDocData[]> {
        const url = this._appsUrl + `/${appLabel}/users`;
        return lastValueFrom(this._http.get<UserDocData[]>(url));
    }
    public getAppUserGroupsAsync(appLabel: string, login: string): Promise<OitemData[]> {
        const url = this._appsUrl + `/${appLabel}/users/${login}/groups`;
        return lastValueFrom(this._http.get<GroupData[]>(url)).then((data) => {
            return data.map<OitemData>((r: GroupData) => ({
                oid: r.profile.name,
                label: r.profile.description
            }));
        });
    }

    public getGroupMembersAsync(grpLabel: string): Promise<UserDocData[]> {
        const url = this._usersUrl + `/groups/${grpLabel}`;
        return lastValueFrom(this._http.get<UserDocData[]>(url));
    }

    public getLoginGroupsAsync(login: string): Promise<GroupDocData[]> {
        const url = this._usersUrl + `/${login}/groups`;
        return lastValueFrom(this._http.get<GroupDocData[]>(url));
    }
}
