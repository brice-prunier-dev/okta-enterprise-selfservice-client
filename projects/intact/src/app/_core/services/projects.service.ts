import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────
import { ChangeSet, JsonObj } from 'joe-fx';
import { IamApiStore } from 'joe-store-api';
import type {
    ProjectDocData,
    UserDocData,
    ReferenceChangesMessageData,
    GroupLinkData,
    SubscriptionDocData
} from 'intact-models';
import { PROJECTITEM_TYPE, PROJECT_ID, PROJECT_REV, ProjectPosition } from 'intact-models';
import { map } from 'rxjs/operators';
import { OitemData } from 'joe-models';

// ────────────────────────────────────────────────────────────────────────────

export interface ProjectHistory {
    date: string;
    project: string;
    user: string;
    operation: string;
    description: string;
    failed: boolean;
    isException: boolean;
    message: string;
}

export interface CmdbAppInfoData {
    applicationId: string;
    operational_status: string;
    name: string;
    short_description: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectsService extends IamApiStore<ProjectDocData> {
    // #region Properties (3)

    #baseUrl: string;
    #http: HttpClient;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(@Inject('BASE_URL') baseUrl: string, http: HttpClient) {
        super(PROJECT_ID, PROJECT_REV);
        this.#http = http;
        this.#baseUrl = baseUrl;
    }

    // #endregion Constructors (1)

    // #region Public Methods (12)

    async existsAppName(appId: string): Promise<boolean> {
        const url = this.#baseUrl + `appcommands/exists/${appId}`;
        return firstValueFrom(this.#http.get<boolean>(url));
    }

    async getAllAsync(): Promise<ProjectDocData[]> {
        const url = this.#baseUrl + '/projects';
        const params = new HttpParams().set('withMyProject', 'true');
        return firstValueFrom(this.#http.get<ProjectDocData[]>(url, { params }));
    }

    async getMyContextAsync(): Promise<ProjectDocData[]> {
        const url = this.#baseUrl + '/projects/mine/context';
        return firstValueFrom(this.#http.get<ProjectDocData[]>(url));
    }

    async getProjectContextAsync(projId: string): Promise<ProjectDocData[]> {
        const url = `${this.#baseUrl}/projects/${projId}/context`;
        return firstValueFrom(this.#http.get<ProjectDocData[]>(url));
    }

    async getMineAsync(): Promise<string[]> {
        const url = this.#baseUrl + '/projects/mine';
        return firstValueFrom(this.#http.get<string[]>(url));
    }

    async getOneAsync<ProjectDocData>(query: JsonObj): Promise<ProjectDocData> {
        const url = this.#baseUrl + `/projects/${query.id}`;
        return firstValueFrom(this.#http.get<ProjectDocData>(url));
    }

    getGroupMembersAsync(oid: string): Promise<UserDocData[]> {
        const url = this.#baseUrl + `/projects/groups/${oid}/members`;
        return firstValueFrom(this.#http.get<UserDocData[]>(url));
    }

    async renameItem(type: PROJECTITEM_TYPE, data: {}): Promise<any> {
        const url =
            type === PROJECTITEM_TYPE.application
                ? this.#baseUrl + '/appcommands/definition'
                : type === PROJECTITEM_TYPE.group
                ? this.#baseUrl + '/groupcommands/definition'
                : type === PROJECTITEM_TYPE.project
                ? this.#baseUrl + '/projectcommands/rename'
                : this.#baseUrl + '/scopecommands/rename';
        return firstValueFrom(this.#http.put(url, data));
    }

    async lockGroup(oid: string, label: string, locked: boolean, project: string): Promise<any> {
        const url = this.#baseUrl + `/groupcommands/lock`;
        const payload = {
            oid,
            label,
            project,
            locked
        };
        return firstValueFrom(
            this.#http.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            })
        );
    }

    async toggleAppstatus(
        projectId: string,
        appId: string,
        appLabel: string,
        inactive: boolean
    ): Promise<any> {
        const url = this.#baseUrl + `/appcommands/change-status`;
        const payload = {
            projectId,
            appId,
            appLabel,
            inactive
        };
        return firstValueFrom(
            this.#http.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            })
        );
    }

    async deleteGroup(projId: string, grpId: string): Promise<any> {
        const url = this.#baseUrl + `/groupcommands/${projId}/${grpId}`;
        return firstValueFrom(
            this.#http.delete(url, { headers: { 'Content-Type': 'application/json' } })
        );
    }
    async deleteApp(projId: string, grpId: string): Promise<any> {
        const url = this.#baseUrl + `/appcommands/${projId}/${grpId}`;
        return firstValueFrom(
            this.#http.delete(url, { headers: { 'Content-Type': 'application/json' } })
        );
    }

    deleteScopeAsync(projId: string, scopeId: string): Promise<any> {
        const url = `${this.#baseUrl}/scopecommands/${projId}`;
        return firstValueFrom(
            this.#http.delete(url, {
                headers: {'Content-Type': 'application/json'},
                body: [scopeId ]
            })
        );
    }

    async copyTo(sourceGroupId: string, targetGroupId: string): Promise<any> {
        const url = this.#baseUrl + '/groupcommands/copy';
        return firstValueFrom(this.#http.post(url, [sourceGroupId, targetGroupId]));
    }

    async renameAsync(oid: string, description: string, cmdbs: OitemData[]): Promise<any> {
        const url = this.#baseUrl + '/projectcommands/definition';
        return firstValueFrom(this.#http.put(url, { oid, description, cmdbs }));
    }

    async addCmdAsync(oid: string, description: string): Promise<any> {
        const url = this.#baseUrl + '/projectcommands/definition';
        return firstValueFrom(this.#http.post(url, { oid, description }));
    }

    async putOneAsync(doc: ProjectDocData, cs?: ChangeSet): Promise<ProjectDocData> {
        const url = this.#baseUrl + '/projectcommands/create/' + doc.id + '/default';
        return firstValueFrom(this.#http.post<ProjectDocData>(url, doc));
    }

    async removeOneAsync(id: string, cs?: ChangeSet): Promise<any> {
        const url = this.#baseUrl + `/projectcommands/${id}`;
        return firstValueFrom(this.#http.delete<string>(url));
    }

    searchAsync(query: string): Observable<string[]> {
        const url = this.#baseUrl + '/projects/search';
        const params = new HttpParams().set('q', query);
        return this.#http.get<string[]>(url, { params });
    }

    resetPositionsAsync(position: ProjectPosition[]): Promise<any> {
        const url = this.#baseUrl + '/projectcommands/reset-positions';
        return firstValueFrom(this.#http.post<string>(url, position));
    }

    ownershipAsync(data: ReferenceChangesMessageData): Promise<any> {
        const url = this.#baseUrl + '/projectcommands/ownership';
        return firstValueFrom(this.#http.post(url, data));
    }

    async meGroup(): Promise<GroupLinkData> {
        const url = this.#baseUrl + '/groups/me';
        return firstValueFrom(this.#http.get<GroupLinkData>(url));
    }

    internalSearchAsync(query: string): Observable<UserDocData[]> {
        const url = this.#baseUrl + '/users/internals';
        const params = new HttpParams().set('q', query);
        return this.#http.get<UserDocData[]>(url, { params }).pipe(
            map((list: UserDocData[]) => {
                return list;
            })
        );
    }

    subscriptionsByProjectAsync(projectId: string): Promise<SubscriptionDocData[]> {
        const url = this.#baseUrl + `/subscriptions/projects/${projectId}`;
        return firstValueFrom(this.#http.get<SubscriptionDocData[]>(url));
    }

    getHistoryAsync(id: string): Observable<ProjectHistory[]> {
        const url = this.#baseUrl + `/admincommands/history/${id}`;
        return this.#http.get<ProjectHistory[]>(url);
    }

    searchCmdbAppsAsync(query: string): Observable<CmdbAppInfoData[]> {
        const url = this.#baseUrl + '/projects/cmdb/search';
        const params = new HttpParams().set('q', query);
        return this.#http.get<CmdbAppInfoData[]>(url, { params }).pipe(
            map((list: CmdbAppInfoData[]) => {
                return list;
            })
        );
    }
}
