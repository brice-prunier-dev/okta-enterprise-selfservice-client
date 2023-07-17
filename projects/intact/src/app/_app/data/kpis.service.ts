import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { IamApiStore } from 'joe-store-api';
import { KpiInfoData, KPI_ID, MyKpiInfoData } from 'intact-models';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class KpisService extends IamApiStore<KpiInfoData> {

    #baseUrl: string;
    #http: HttpClient;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(@Inject('BASE_URL') baseUrl: string, http: HttpClient) {
        super(KPI_ID, KPI_ID);
        this.#http = http;
        this.#baseUrl = baseUrl;
    }

    getAll() {
        return firstValueFrom(this.#http.get<KpiInfoData[]>(this.#baseUrl + "/kpis"));
    }

    getForUser() {
        return firstValueFrom(this.#http.get<KpiInfoData[]>(this.#baseUrl + "/kpiData/mine"));
    }
    getMine() {
        return firstValueFrom(this.#http.get<MyKpiInfoData[]>(this.#baseUrl + "/kpiData/mine"));
    }
}
