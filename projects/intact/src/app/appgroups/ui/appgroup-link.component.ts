import {Component, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Data} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {PartialObserver, Subscription} from 'rxjs';
import {CommandNotification} from 'joe-viewmodels';
import {ProjectsViewModel} from '../../_core';
import {ProjectDetailViewModel} from '../../projectsnav';
import {
    GroupLinkData,
    AppLinkView,
    GroupLinkType,
    GroupLinkView,
    AppLinkType,
    AppLinkData,
    ENGIE_GroupData,
    GEM_GroupData
} from 'intact-models';
import {ArrayViewFactory, sameString} from 'joe-fx';
import {AppViewModel, ApplicationService} from '../../apps';
import {AppDataInput} from '../../apps';
import {GlobalState, NotifierService} from '../../_core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ConfirmService} from '../../_shared';

@Component({
    selector: 'iam-appgroup-link',
    templateUrl: './appgroup-link.component.html',
    styleUrls: ['./appgroup-link.component.scss']
})
export class AppGroupLinkComponent implements OnInit, OnDestroy {
    private _sub = new Subscription();
    private _appLink!: AppLinkView;
    private _projGroups!: GroupLinkView[];
    private _projApps!: AppLinkView[];

    public runningOp: string | undefined;
    public error: any;
    public projListVm!: ProjectsViewModel;
    public projVm!: ProjectDetailViewModel;
    public appVm!: AppViewModel;

    public get initialized(): boolean {
        return !!this.appVm && !!this._appLink;
    }

    public get loading(): boolean {
        return !this.initialized;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    public get editable(): boolean {
        return (
            this.initialized &&
            (this._userState.isIntactAdmin ||
                this._userState.isMyProject(this.projVm.view.id) ||
                this.projVm.isItemAdmin(
                    this._appLink,
                    this._userState.login,
                    this._userState.groups
                ))
        );
    }

    public get groups(): GroupLinkView[] {
        return this.editable
            ? this._projGroups
            : this._projGroups.filter((g) => this._appLink.groups.includes(g.oid));
    }

    constructor(
        private _cd: ChangeDetectorRef,
        private _userState: GlobalState,
        private _applicationSvc: ApplicationService,
        private _notifierSvc: NotifierService,
        private _confirmSvc: ConfirmService,
        private _titleService: Title,
        public dialog: MatDialog,
        route: ActivatedRoute
    ) {
        this.runningOp = 'Loading data...';
        this._sub.add(
            route.data.subscribe(this._initObserver.bind(this) as unknown as PartialObserver<Data>)
        );
    }

    private _initObserver(d: {inputs: AppDataInput}) {
        this.projListVm = d.inputs[0];
        this.projVm = d.inputs[1];
        this.appVm = d.inputs[2];
        if (this.appVm.loaded) {
            const project = this.projVm.view;
            const appId = this.appVm.view.id;
            this._appLink = this.projVm.view.apps.find((a) => a.oid === appId)!;
            this._titleService.setTitle(this.appVm.view.client_name + ' (Groups)');

            this._projGroups = ArrayViewFactory.SortFromTypeDef<GroupLinkData>(
                this.projVm.view.groups.slice(),
                GroupLinkType
            ) as GroupLinkView[];
            this._projApps = ArrayViewFactory.SortFromTypeDef<AppLinkData>(
                project.apps,
                AppLinkType
            ) as AppLinkView[];
            this._projGroups.unshift(
                new GroupLinkView(ENGIE_GroupData),
                new GroupLinkView(GEM_GroupData)
            );

            this.appVm.swaggerScopes.getAllAppGroupsScopesAsync(project, this._appLink);

            this.runningOp = undefined;
            this._cd.markForCheck();
        } else {
            const self = this;
            this._sub.add(
                self.appVm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        const project = self.projVm.view;
                        const appId = self.appVm.view.id;
                        self._appLink = self.projVm.view.apps.find((a) => a.oid === appId)!;
                        self._titleService.setTitle(self.appVm.view.client_name + ' (Groups)');
                        self._projGroups = ArrayViewFactory.SortFromTypeDef<GroupLinkData>(
                            self.projVm.view.groups.slice(),
                            GroupLinkType
                        ) as GroupLinkView[];
                        self._projGroups.unshift(
                            new GroupLinkView(ENGIE_GroupData),
                            new GroupLinkView(GEM_GroupData)
                        );
                        self._projApps = ArrayViewFactory.SortFromTypeDef<AppLinkData>(
                            self.projVm.view.apps,
                            AppLinkType
                        ) as AppLinkView[];

                        self.appVm.swaggerScopes.getAllAppGroupsScopesAsync(project, self._appLink);
                        self.runningOp = undefined;
                        self._cd.markForCheck();
                    }
                })
            );
        }
    }

    public isSelected(oid: string): boolean {
        if (this.initialized) {
            switch (oid) {
                case ENGIE_GroupData.oid:
                case GEM_GroupData.oid:
                    return sameString(this._appLink.audience, oid);
                default:
                    return this._appLink.groups.some((grpOid) => sameString(grpOid, oid));
            }
        }
        return false;
    }

    public groupApps(group: GroupLinkView): string {
        const oid = group.oid;
        return (
            this._projApps
                .filter((a) => a.groups.includes(oid))
                .map((a) => a.label)
                .join(', ') || 'None'
        );
    }

    public groupUserCount(group: GroupLinkView): string {
        const oid = group.oid;
        if (ENGIE_GroupData.oid === oid || GEM_GroupData.oid === oid) {
            return '...';
        }
        const groupMembers = this.projVm.groupMembersViewModels.find((vm) => vm.group.oid === oid);

        return groupMembers && groupMembers.view ? '' + groupMembers.view.length : '...';
    }

    ngOnInit() { }

    public linkedGroupChanged(arg: MatSlideToggleChange) {
        const oid = arg.source.name as string;
        if (arg.checked) {
            this.addGroup(oid);
        } else {
            this.removeGroup(oid);
        }
    }

    public addGroup(oid: string) {
        this.error = undefined;
        if (this.editable) {
            const $this = this;

            this._applicationSvc
                .linkGroup(this.projVm.view.id, this._appLink.oid, oid)
                .then((r) => {
                    switch (oid) {
                        case ENGIE_GroupData.oid:
                        case GEM_GroupData.oid:
                            $this._appLink.audience = oid;
                            break;
                        default:
                            if (!this._appLink.groups.includes(oid)) {
                                $this._appLink.groups.add(oid);
                            }
                            break;
                    }
                    $this._cd.markForCheck();
                    $this._notifierSvc.notify('Groups Management', 'Succeed');
                })
                .catch((err) => {
                    $this.error = err;
                    $this._cd.markForCheck();
                });
        }
    }

    public removeGroup(oid: string) {
        this.error = undefined;
        if (this.editable) {
            if (
                this._appLink.swagger &&
                (this._appLink.groups.includes(oid) || oid === this._appLink.audience)
            ) {
                if (!this.appVm.swaggerScopes.loaded) {
                    this._confirmSvc.info(
                        'Warning',
                        'Swagger group info not yet loaded please retry in 3 seconds...'
                    );
                    this.addGroup(oid);
                    this._cd.markForCheck();
                } else if (this.appVm.swaggerScopes.view.some((info) => sameString(info.oid, oid))) {
                    const self = this;

                    this._confirmSvc
                        .confirm(
                            'Confirmation',
                            "You're about to unlink a group with scope's Access Policy. If you confirm the operation the Access Policy wil be deleted!"
                        )
                        .then((ok) => {
                            if (ok) {
                                self._doRemoveGroup(oid);
                            } else {
                                self.addGroup(oid);
                            }
                        });
                } else {
                    this._doRemoveGroup(oid);
                }
            } else {
                this._doRemoveGroup(oid);
            }
        }
    }

    private _doRemoveGroup(oid: string) {
        const self = this;
        this._applicationSvc
            .unlinkGroup(this.projVm.view.id, this._appLink.oid, oid)
            .then((r) => {
                self._appLink.groups.remove(oid);
                self._cd.markForCheck();
                self._notifierSvc.notify('Groups Management', 'Succeed');
            })
            .catch((err) => {
                self.error = err;
                self._cd.markForCheck();
            });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    groupColor(grp: GroupLinkData) {
        const defaultColor = '#269955';
        const internalColor = '#0af';
        const adminColor = 'red';
        const grpName = grp.label;

        if (grpName.endsWith('-owner') || grpName.endsWith('-admin')) {
            return adminColor;
        }

        if (grpName.endsWith('-default')) {
            return defaultColor;
        }

        return internalColor;
    }
}
