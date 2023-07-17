import {
    Component,
    OnDestroy,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    Input
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────────
import {sameString, isStringAssigned} from 'joe-fx';
import {OdefinitionData} from 'joe-models';
import {CommandNotification} from 'joe-viewmodels';
import {AppLinkView, AppApisInfoData} from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────────
import {GlobalState, ProjectsViewModel} from '../../../_core';
import {ConfirmService} from '../../../_shared';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {AppApisViewModel, ApplicationService, AppViewModel} from '../../../apps';
import {ScopesSubscriptionDialog} from '../../dialogs/scopes-subscriptions/scopes-subscriptions.dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ErrorComponent } from '../../../_shared/ui/app-error.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor, NgClass } from '@angular/common';
// ────────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-app-subscriptions',
    templateUrl: './app-subscriptions.component.html',
    styleUrls: ['./app-subscriptions.component.scss', '../../ui/app-apis.page.scss'],
    standalone: true,
    imports: [NgIf, MatProgressBarModule, MatButtonModule, MatTooltipModule, MatIconModule, ErrorComponent, MatExpansionModule, NgFor, MatChipsModule, NgClass]
})
export class AppSubscriptionsComponent implements OnChanges, OnDestroy {
    private _subs = new Subscription();
    private _openApiInfo!: AppApisInfoData;

    @Input() appVm!: AppViewModel;
    @Input() projVm!: ProjectDetailViewModel;
    @Input() projListVm!: ProjectsViewModel;
    vm!: AppApisViewModel;
    runningOp: string | undefined;
    dialog: MatDialog;

    constructor(
        private _cd: ChangeDetectorRef,
        private _appApiSvc: ApplicationService,
        private _confirm: ConfirmService,
        private _userState: GlobalState,
        dialog: MatDialog
    ) {
        this.dialog = dialog;
        this.runningOp = 'loading api data...';
    }

    ngOnChanges(changements: SimpleChanges) {
        if (this.projListVm && this.projVm && this.appVm) {
            this.vm = this.appVm.apis;

            const self = this;

            if (this.vm.loaded && this.projVm.subscriptions) {
                this._loadEnded();
            } else {
                if (!this.vm.loaded) {
                    this._subs.add(
                        this.vm.onStateChanged.subscribe((p) => {
                            if (p === CommandNotification.StateChanged && self.vm.loaded) {
                                self._loadEnded();
                            }
                        })
                    );
                }
                if (!this.projVm.subscriptions) {
                    this._subs.add(
                        this.vm.onStateChanged.subscribe((p) => {
                            if (
                                p === ProjectsViewModel.ProjectChangedEvent &&
                                self.projVm.subscriptions
                            ) {
                                self._loadEnded();
                            }
                        })
                    );
                }
            }
        }
    }

    private _loadEnded() {
        this.initModel();
        this.runningOp = undefined;
        this._cd.markForCheck();
    }

    private _reload() {
        const self = this;
        this._appApiSvc.getAppApisInfoAsync(this.appVm.view.client_name).then((qry_result) => {
            self.vm.loadData(qry_result);
            self.initModel();
            self._cd.markForCheck();
        });
    }
    private initModel() {
        const self = this;
        if (self.vm.loaded && self.projVm.subscriptions) {
            const appId = self.appVm.view.id;
            const apis = self.vm.view;
            const subscriptions = self.projVm.subscriptions.filter(
                (s) => s.target.item.oid === appId
            );
            const missingApis: string[] = [];
            subscriptions
                .filter(
                    (s) =>
                        s.status !== 'rejected' &&
                        !apis.some((api) =>
                            api.info.scopes.some((i) => sameString(i.oid, s.what.item.oid))
                        )
                )
                .forEach((s) => {
                    if (!missingApis.includes(s.what.project)) {
                        missingApis.push(s.what.project);
                    }
                });
            missingApis.forEach((s) =>
                apis.splice(0, 0, {
                    id: s,
                    appScopes: [],
                    info: {
                        created_on: '',
                        name: s,
                        description: subscriptions.find((sub) => sameString(s, sub.what.project))!
                            .what.description!,
                        scopes:
                            self.projListVm.view
                                .find((p) => sameString(p.id, s))
                                ?.scopes?.map<OdefinitionData>((scp, idx, arr) => {
                                    return {
                                        oid: scp.oid,
                                        description: scp.description
                                    } as OdefinitionData;
                                }) ?? [],
                        tags: [],
                        businessContacts: [],
                        productOwners: subscriptions.find((sub) => sameString(s, sub.what.project))!
                            .what.item.admins!,
                        category: '',
                        horizon: '',
                        nature: '',
                        commodities: [],
                        countries: [],
                        links: {
                            app: undefined,
                            wiki: undefined,
                            wiki2: undefined,
                            swagger: undefined,
                            backlog: undefined,
                            teams: undefined
                        },
                        draft: true,
                        projects: []
                    }
                })
            );
            // self.vm.view.forEach(api => api.clientSubs = subscriptions
            //     .filter(
            //         s => api.clientScopes.includes(s.what.item.oid)
            //             ||
            //             api.scopes.some(s2 => sameString(s2.name, s.what.item.oid)))
            // );
            self._openApiInfo = self.vm.view.find((ai) => sameString(ai.id, 'idtoken'))!;
        }
    }

    public get editable(): boolean {
        return (
            this._userState.isIntactAdmin ||
            this._userState.isMyProject(this.projVm.view.id) ||
            this.projVm.isItemAdmin(
                this.projVm.selectedItem!,
                this._userState.login,
                this._userState.groups
            )
        );
    }

    public get initialized(): boolean {
        return !!this.vm;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    ngOnInit() { }

    public editDependencies() {
        if (this.editable) {
            const self = this;
            if (
                !isStringAssigned(this.projVm.view.description) ||
                !isStringAssigned(this.projVm.selectedItem!.description)
            ) {
                this._confirm.info(
                    'Scope Subscription',
                    'You can\'t manage scopes if there is no "Description" for your project or your current Application.' +
                    'Scope subscription will generate "Subscription Request" to API managers.' +
                    'These description are required to agree or not your request!'
                );
            } else {
                this.dialog
                    .open(ScopesSubscriptionDialog, {
                        data: [this.projVm.selectedItem, this.projVm, this.vm.view],
                        minWidth: '600px'
                    })
                    .afterClosed()
                    .subscribe((ok) => {
                        if (ok) {
                            self._reload();
                        }
                        self._cd.markForCheck();
                    });
            }
        }
    }

    public apiColor(scomeName: string): string[] {
        const appLnk = this.projVm.selectedItem as AppLinkView;
        const subscribed =
            appLnk.scopes.includes(scomeName) ||
            (this._openApiInfo && this._openApiInfo.appScopes.includes(scomeName));
        const subscribing = !subscribed && appLnk.subs && appLnk.subs.includes(scomeName);
        return subscribed ? ['subscribed'] : subscribing ? ['subscribing'] : ['not-subscribed'];
    }

    public ngOnDestroy() {
        this._subs.unsubscribe();
    }
}
