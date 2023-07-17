import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { map } from 'rxjs/operators';

type UserGroupData = {profile: {name: string}};


@Injectable({
    providedIn: 'root'
})
export class CurrentUserService {
    // #region Properties (3)

    #baseUrl: string;
    #http: HttpClient;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(
        @Inject('BASE_URL') baseUrl: string,
        http: HttpClient) {
        this.#http = http;
        this.#baseUrl = baseUrl;
    }

    // #endregion Constructors (1)

    getUserGroups(login: string): Promise<string[]> {
        const url = this.#baseUrl + `/users/${login}/groups`;
        return firstValueFrom(
            this.#http
                .get<UserGroupData[]>(url)
                .pipe(map<UserGroupData[], string[]>((groups) => groups.map((g) => g.profile.name)))
        );
    }

}
