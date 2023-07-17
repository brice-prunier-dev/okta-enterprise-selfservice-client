import {
    Component,
    OnDestroy,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    Input
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────────
import { AppLinkView, GroupScopesData } from 'intact-models';
// ────────────────────────────────────────────────────────────────────────────────
import { GlobalState, ProjectsViewModel } from '../../../_core';
import { AppViewModel } from '../../../apps';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { ScopesSubscriptionDialog } from '../../dialogs/scopes-subscriptions/scopes-subscriptions.dialog';
import { PascalCasePipe } from '../../../_shared/pipes/pascal-case.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor } from '@angular/common';
// ────────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'iam-group-subscriptions',
    templateUrl: './group-subscriptions.component.html',
    styleUrls: ['./group-subscriptions.component.scss', '../../ui/app-apis.page.scss'],
    standalone: true,
    imports: [NgIf, MatProgressBarModule, NgFor, MatCardModule, MatIconModule, MatChipsModule, MatTooltipModule, MatButtonModule, PascalCasePipe]
})
export class AppGroupSubscriptionsComponent implements OnChanges, OnDestroy {
    // #region Properties (10)

    #appLink!: AppLinkView;
    #cd: ChangeDetectorRef;
    #subs = new Subscription();
    #userState: GlobalState;
    @Input() appVm!: AppViewModel;
    @Input() projListVm!: ProjectsViewModel;
    @Input() projVm!: ProjectDetailViewModel;

    dialog: MatDialog;
    groupLinks!: GroupScopesData[];
    runningOp: string | undefined;

    // #endregion Properties (10)

    // #region Constructors (1)

    constructor(cd: ChangeDetectorRef, userState: GlobalState, dialog: MatDialog) {
        this.#cd = cd;
        this.#userState = userState;
        this.dialog = dialog;
        this.runningOp = 'loading groups data...';
    }

    // #endregion Constructors (1)

    // #region Public Accessors (3)

    public get editable(): boolean {
        return (
            this.#userState.isIntactAdmin ||
            this.#userState.isMyProject(this.projVm.view.id) ||
            this.projVm.isItemAdmin(
                this.projVm.selectedItem!,
                this.#userState.login,
                this.#userState.groups
            )
        );
    }

    public get initialized(): boolean {
        return !!this.groupLinks;
    }

    public get running(): boolean {
        return !!this.runningOp;
    }

    // #endregion Public Accessors (3)

    // #region Public Methods (5)

    public apiColor(groupOid: string, scomeName: string): string[] {
        const groupLink = this.groupLinks.find((grp) => grp.oid === groupOid)!;
        return groupLink.scopes.includes(scomeName) ? ['subscribed'] : ['not-subscribed'];
    }

    public editScopes(groupId: string) {
        const appLink = this.#appLink;
        const groupInfo = this.groupLinks.find((grp) => grp.oid === groupId);
        1;
        if (this.editable) {
            const self = this;

            this.dialog
                .open(ScopesSubscriptionDialog, {
                    data: [appLink, this.projVm, groupInfo],
                    minWidth: '600px'
                })
                .afterClosed()
                .subscribe(() => {
                    self.#cd.markForCheck();
                });
        }
    }

    ngOnChanges(changements: SimpleChanges) {
        if (this.projListVm && this.projVm && this.appVm) {
            const project = this.projVm.view;
            const appLink = (this.#appLink = project.apps.find(
                (a) => a.oid === this.appVm.view.id
            )!);
            const self = this;
            this.appVm.swaggerScopes.getAllAppGroupsScopesAsync(project, appLink).then((r) => {
                self.groupLinks = r;
                this.runningOp = undefined;
                self.#cd.markForCheck();
            });
        }
    }

    public ngOnDestroy() {
        this.#subs.unsubscribe();
    }

    ngOnInit() {}

    // #endregion Public Methods (5)
}
