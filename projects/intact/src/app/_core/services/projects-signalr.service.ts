import { Inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HubConnection } from '@microsoft/signalr';
import { ProjectDocData } from 'intact-models';
import { NotifierService } from './notifier.service';
import { queryList, ViewModelManager } from 'joe-viewmodels';
import { ProjectsViewModel } from '../data/projects/projects-list.viewmodel';
import { Router } from '@angular/router';
import { JoeLogger } from 'joe-fx';

@Injectable({
    providedIn: 'root'
})
export class ProjectNotificationService {
    private hubConnection: HubConnection | undefined;
    messages: Subject<ProjectDocData> = new Subject();

    constructor(
        @Inject('BASE_URL') private _baseUrl: string,
        @Inject('SIGNALR_URL') private _signalUrl: string,
        private _router: Router,
        private _notifierService: NotifierService,
        private _http: HttpClient
    ) {}

    init(accessToken: string | undefined) {
        let options = {
            // accessTokenFactory: () => accessToken || '?',
            transport: signalR.HttpTransportType.WebSockets,
            skipNegotiation: true
        };
        const notifierService = this._notifierService;
        const signalUrl = this._signalUrl;
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(signalUrl, options)
            .configureLogging(signalR.LogLevel.Trace)
            .withAutomaticReconnect([0, 2000, 10000, 30000, 60000])
            .build();

        this.hubConnection!.start().catch((err) => console.error(err.toString()));

        this.hubConnection!.on('OnProjectChanges', (data: ProjectDocData) => {
            const projectPath = `/projects/${data.id}/`;
            JoeLogger.info('Signal-R notifies changes on ' + data.id);
            if (!this._router.url.includes(projectPath)) {
                const vm = ViewModelManager.INSTANCE.resolveStaticViewModel<ProjectsViewModel>(
                    ProjectsViewModel,
                    queryList
                ) as ProjectsViewModel;
                vm.refreshProjectContext(data);
            }
        });
    }

    // send(message: string): Observable<void> {
    //     console.log(`{APP-NOTIFICATION HubConnection.send: ${message}`);
    //     let requestUrl = `${this._baseUrl}messages`;
    //     return this._http.post(requestUrl, message).pipe(map((result: any) => {}));
    // }
}
