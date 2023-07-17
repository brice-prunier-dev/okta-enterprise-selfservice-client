import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy
} from '@angular/core';
import {ProjectsViewModel, NotifierService} from '../../_core';
import {GlobalState} from '../../_core';
import {PartialObserver, Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data} from '@angular/router';
import {SubscriptionDocData, ProjectDocView, SubscriptionResponseData} from 'intact-models';
import {ProjectDetailViewModel} from '../../projectsnav';
import {ScopeSubscriberType} from '../data/types';
import {ConfirmService, InputService} from '../../_shared';
import {ScopesService} from '../data/scopes.service';
import {isStringAssigned, sameString, ArrayViewFactory, isArrayAssigned} from 'joe-fx';
import {CommandNotification} from 'joe-viewmodels';
import {SubscriptionRequestData} from 'projects/intact-models/src';

type SubscriptionHistory = SubscriptionRequestData | SubscriptionResponseData;

@Component({
    selector: 'iam-scope-detail',
    templateUrl: './scope-detail.component.html',
    styleUrls: ['./scope-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScopeDetailComponent implements OnInit, OnDestroy {

    static CLAIM_RELATED_PREFIX = 'datascience';

    static IS_CLAIM_RELATED(scope: string): boolean {
        return scope.startsWith('api.' + ScopeDetailComponent.CLAIM_RELATED_PREFIX + '.');
    }

    // static CLAIM_PROFILE(scope: string): string | undefined {
    //   try {
    //     return ScopeDetailComponent.CLAIM_RELATED_PREFIX + '_' + scope.split('.')[2];
    //   }

    //   catch {
    //     return undefined;
    //   }
    // }


    private _subscriptions = new Subscription();
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public scopeId!: string;
    public list: SubscriptionDocData[] = [];
    public running = '';
    public withClaim = false;
    public get initialized(): boolean {
        return this.projVm && this.projVm.loaded;
    }

    public get editable(): boolean {
        if (!this.initialized) {
            return false;
        }

        const scope = this.projVm.view.scopes.find((s) => sameString(s.oid, this.scopeId))!;
        const userState = this._userState;
        return (
            userState.isIntactAdmin ||
            userState.isMyProject(this.projVm.view.id) ||
            this.projVm.isProjectAdmin ||
            this.projVm.isItemAdmin(scope, userState.login, userState.groups)
        );
    }

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _titleService: Title,
        private _notifierSvc: NotifierService,
        private _confirmService: ConfirmService,
        private _inputService: InputService,
        private _scopeApiSvc: ScopesService,
        route: ActivatedRoute
    ) {
        _titleService.setTitle('scopes subscribers');
        this._subscriptions.add(
            route.data.subscribe(
                this._inputsObserver.bind(this) as unknown as PartialObserver<Data>
            )
        );
    }

    private _inputsObserver(d: {inputs: ScopeSubscriberType}) {
        this.projListVm = d.inputs[0];
        const projVm = (this.projVm = d.inputs[1]);
        const scopeId = (this.scopeId = d.inputs[2]);
        const self = this;
        this.withClaim = ScopeDetailComponent.IS_CLAIM_RELATED(scopeId);

        // if (this.withClaim) {
        //   this.#profile = ScopeDetailComponent.CLAIM_PROFILE(scopeId);
        // }

        const initComponent = () => {
            self._titleService.setTitle(scopeId + '(subscribers)');

            const externalApps = projVm.subscriptions!.filter(
                (s) => s.what.item.oid === scopeId && s.target.project !== projVm.view.id
            );
            const internalApps = projVm.subscriptions!.filter(
                (s) => s.what.item.oid === scopeId && s.target.project === projVm.view.id
            );

            // self.list = [ ...externalApps, ...internalApps ];
            self.list = [...internalApps, ...externalApps];
            self._cd.markForCheck();
        };

        if (projVm.loaded && projVm.subscriptions) {
            initComponent();
        } else {
            this._subscriptions.add(
                projVm.onStateChanged.subscribe(() => {
                    if (projVm.loaded && projVm.subscriptions) {
                        initComponent();
                    }
                })
            );
        }
    }

    private _teminateAction(done: boolean, action: string) {
        this.running = '';
        this._cd.markForCheck();
        this._notifierSvc.notify('Subscription ' + action, done ? 'Done' : 'Failed');

        if (done) {
            this.projVm.onStateChanged.next(CommandNotification.StateChanged);
        }
    }

    public ngOnInit() { }

    public ngOnDestroy() {
        this._subscriptions.unsubscribe();
    }

    public cmdCheckClaim(sub: SubscriptionDocData) {
        if (sub.claim === undefined && this.withClaim) {
            const self = this;
            this.running = sub.id;
            this._cd.markForCheck();

            this._scopeApiSvc
                .getClaimInfoAsync(sub.id)
                .then((r) => {
                    sub.claim = r;
                    self._teminateAction(true, 'Claim Loading');
                })
                .catch((err) => {
                    self._teminateAction(false, 'Claim Loading');
                });
        }
    }

    public cmdResetClaim(sub: SubscriptionDocData) {
        if (this.withClaim) {
            const self = this;

            this._inputService
                .ask('Data Science Extra Claim', 'API KEY', false)
                .subscribe((input: string) => {
                    if (isStringAssigned(input)) {
                        sub.claim = {
                            key: input
                        };
                        self.running = sub.id + '-claim-loading';
                        self._cd.markForCheck();

                        self._scopeApiSvc
                            .resetClaimInfoAsync(sub.id, sub.claim)
                            .then((r) => self._teminateAction(true, 'Claim Loading'))
                            .catch((err) => {
                                sub.claim!.key = undefined;
                                self._teminateAction(false, 'Claim Loading');
                            });
                    }
                });
        }
    }

    public isInternal(project: string): boolean {
        return this.projVm.view.id === project;
    }

    public chipLabel(scopeId: string): string {
        return this.isInternal(scopeId) ? 'Intern' : 'Extern';
    }

    public subscriberColor(sub: SubscriptionDocData) {
        const internalColor = '#0af';
        const externalColor = '#009934';
        const subsColor = '#FF5722';
        return sub.status === 'active'
            ? subsColor
            : this.projVm.view.id === sub.target.project
                ? internalColor
                : externalColor;
    }

    public subHistory(sub: SubscriptionDocData): SubscriptionHistory[] {
        if (!isArrayAssigned(sub.responses)) {
            return sub.requests;
        }

        const r = ArrayViewFactory.SortFromPropertyList<SubscriptionHistory>(
            [...sub.requests, ...sub.responses],
            ['date']
        );
        return r;
    }

    public asResponse(sub: SubscriptionHistory): SubscriptionResponseData {
        return sub as SubscriptionResponseData;
    }

    public cmdValidate(sub: SubscriptionDocData) {
        if (this.withClaim) {
            this._askForClaim(sub);
        } else {
            this._validate(sub);
        }
    }

    private _validate(sub: SubscriptionDocData) {
        const self = this;
        const view =
            this.projVm.view.id === sub.target.project
                ? this.projVm.view
                : new ProjectDocView(this.projListVm.view.find((p) => p.id === sub.target.project));
        const target = view.apps.find((a) => a.oid === sub.target.item.oid)!;
        const what = this.projVm.view.scopes.find((s) => s.oid === this.scopeId)!;

        this._confirmService
            .confirm(
                'Subscription Validation',
                `Do you confirm the subscription of "${sub.what.item.oid}"by "${sub.target.item.label}"?`
            )
            .then((ok) => {
                if (ok) {
                    self.running = sub.id;
                    self._cd.markForCheck();

                    self._scopeApiSvc
                        .validateSubscriptionAsync(sub.id, sub.claim)
                        .then((r) => {
                            sub.responses.splice(0, 0, r);
                            sub.status = 'validated';

                            target.subs.remove(sub.what.item.oid);
                            target.scopes.add(sub.what.item.oid);

                            if (target.$isEditing) {
                                target.$editor!.endEdit();
                            }

                            what.removeSub(sub);
                            self.projVm.subscriptionsDeprecated = true;

                            self._teminateAction(true, 'Validation');
                        })
                        .catch((err) => {
                            self._teminateAction(false, 'Validation');
                        });
                }
            });
    }

    private _askForClaim(sub: SubscriptionDocData) {
        const self = this;

        this._inputService
            .ask('Data Science Extra Claim', `API KEY`, false)
            .subscribe((input: string) => {
                if (isStringAssigned(input)) {
                    sub.claim = {
                        key: input
                    };
                    self._validate(sub);
                }
            });
    }

    public cmdRenew(sub: SubscriptionDocData) {
        const self = this;
        const view =
            this.projVm.view.id === sub.target.project
                ? this.projVm.view
                : new ProjectDocView(this.projListVm.view.find((p) => p.id === sub.target.project));
        const target = view.apps.find((a) => a.oid === sub.target.item.oid)!;
        const what = this.projVm.view.scopes.find((s) => s.oid === this.scopeId)!;

        this._confirmService
            .confirm(
                'Subscription Renewal',
                `Do you confirm the subscription renewal of "${sub.what.item.label}"by "${sub.target.item.label}"?`
            )
            .then((ok) => {
                if (ok) {
                    self.running = sub.id;
                    self._cd.markForCheck();

                    self._scopeApiSvc
                        .renewSubscriptionAsync(sub.id)
                        .then((r) => {
                            sub.requests.splice(0, 0, r);
                            sub.status = 'active';

                            target.subs.add(sub.what.item.oid);

                            if (target.$isEditing) {
                                target.$editor!.endEdit();
                            }

                            what.addSub(sub);
                            self.projVm.subscriptionsDeprecated = true;
                            self._teminateAction(true, 'Renew');
                        })
                        .catch((err) => {
                            self._teminateAction(false, 'Renew');
                        });
                }
            });
    }

    public cmdReject(sub: SubscriptionDocData) {
        const self = this;
        const view =
            this.projVm.view.id === sub.target.project
                ? this.projVm.view
                : new ProjectDocView(this.projListVm.view.find((p) => p.id === sub.target.project));
        const target = view.apps.find((a) => a.oid === sub.target.item.oid)!;
        const what = this.projVm.view.scopes.find((s) => s.oid === this.scopeId)!;

        this._inputService
            .ask('Subscription Reject', `Comment`, false)
            .subscribe((comment: string) => {
                if (isStringAssigned(comment)) {
                    self.running = sub.id;
                    self._cd.markForCheck();

                    self._scopeApiSvc
                        .rejectSubscriptionAsync(sub.id, comment)
                        .then((r) => {
                            sub.responses.splice(0, 0, r);
                            sub.status = 'rejected';

                            target.subs.remove(sub.what.item.oid);

                            if (target.$isEditing) {
                                target.$editor!.endEdit();
                            }

                            what.removeSub(sub);
                            self.projVm.links = undefined;
                            self._teminateAction(true, 'Reject');
                        })
                        .catch((err) => {
                            self._teminateAction(false, 'Reject');
                        });
                }
            });
    }

    public cmdCancel(sub: SubscriptionDocData) {
        const self = this;
        const view =
            this.projVm.view.id === sub.target.project
                ? this.projVm.view
                : new ProjectDocView(this.projListVm.view.find((p) => p.id === sub.target.project));
        const target = view.apps.find((a) => a.oid === sub.target.item.oid)!;
        const what = this.projVm.view.scopes.find((s) => s.oid === this.scopeId);

        this._inputService
            .ask('Subscription Cancellation', 'Comment', false)
            .subscribe((comment: string) => {
                if (isStringAssigned(comment)) {
                    self.running = sub.id;
                    self._cd.markForCheck();

                    self._scopeApiSvc
                        .cancelSubscriptionAsync(sub.id, comment)
                        .then((r) => {
                            sub.responses.splice(0, 0, r);
                            sub.status = 'canceled';
                            target.scopes.remove(sub.what.item.oid);

                            if (target.$isEditing) {
                                target.$editor!.endEdit();
                            }

                            self.projVm.subscriptionsDeprecated = true;
                            self._teminateAction(true, 'Cancelation');
                        })
                        .catch((err) => {
                            self._teminateAction(false, 'Cancelation');
                        });
                }
            });
    }
}
