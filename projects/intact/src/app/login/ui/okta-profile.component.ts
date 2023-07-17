/*!
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Component, OnInit, Inject } from '@angular/core';
import { GlobalState, APP_VERSION } from '../../_core';
import { HttpClient } from '@angular/common/http';
import { JoeLogger, JsonObj, StringMap } from 'joe-fx';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface Claim {
    claim: string;
    value: string;
}

@Component({
    selector: 'iam-okta-profile',
    templateUrl: './okta-profile.component.html',
    styleUrls: ['./okta-profile.component.css'],
    standalone: true,
    imports: [MatSlideToggleModule, FormsModule, NgFor, MatDividerModule, MatButtonModule, ClipboardModule, MatIconModule]
})
export class OktaProfileComponent implements OnInit {
    claims: Claim[] = [];
    accessToken: string | undefined = 'N/A';
    azAccessToken = 'N/A';
    apiUrl = 'N/A';
    apiVersion = 'N/A';
    constructor(
        private _appSvc: GlobalState,
        private _http: HttpClient,
        @Inject(APP_VERSION) public uiVersion: string,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.apiUrl = baseUrl + '/health';
    }

    ngOnInit() {
        this.getApiVersion();
        this.accessToken = this._appSvc.accessToken;
        const userClaims = this._appSvc.claims;
        this.claims = Object.entries(userClaims as object).map((entry) => ({
            claim: entry[0],
            value: entry[1]
        }));
        this.claims.push({
            claim: 'groups_local',
            value: this._appSvc.groups.join(',')
        });
    }

    public getApiVersion() {
        const $this = this;
        const url = this.apiUrl;
        this._http.get<string>(url).subscribe({
            next: (s) => ($this.apiVersion = s),
            error: (err) => ($this.apiVersion = err.error.text)
        });
    }

    public get isIntactAdmin(): boolean {
        return this._appSvc.isIntactAdmin;
    }

    public get withDebug(): boolean {
        return !JoeLogger.isProd;
    }
    public set withDebug(value: boolean) {
        JoeLogger.isProd = !value;
    }
}
