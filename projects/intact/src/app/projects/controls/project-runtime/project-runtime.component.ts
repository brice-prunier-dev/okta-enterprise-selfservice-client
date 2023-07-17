import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import {ProjectsViewModel} from '../../../_core';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {NotifierService} from '../../../_core';
import {Router} from '@angular/router';
import {PROJECTITEM_TYPE, SubscriptionStatus} from 'intact-models';
import {sameString, JoeLogger} from 'joe-fx';
import {getG6AppItem, getG6Item} from '../graph-utils';
import {Subscription} from 'rxjs';
import {Graph, GraphData} from '@antv/g6';
const graph_width = 1242;
@Component({
    selector: 'iam-project-runtime',
    templateUrl: './project-runtime.component.html',
    styleUrls: ['./project-runtime.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ProjectRuntimeComponent implements OnChanges, OnInit, OnDestroy {
    private static _runtimeGraphDataCreation(vm: ProjectDetailViewModel): GraphData {
        const graphData: GraphData = {
            nodes: [],
            edges: []
        };
        const project = vm.view;
        // const scopeInfos: [ string, string ][] = project.scopes.map( s => [ s.oid, project.id ] );
        const extApps: string[] = [];
        const extScopes: string[] = [];
        const audienceGroups: string[] = [];

        let index = 0;

        // GROUPS NODES
        index = 0;
        for (const app of project.apps.filter((a) => a.hasAudience())) {
            if (!audienceGroups.includes(app.audience)) {
                audienceGroups.push(app.audience);
                graphData.nodes!.push(
                    getG6Item(PROJECTITEM_TYPE.group, app.audience, app.audience, index++)
                );
            }
        }
        for (const grp of project.groups) {
            graphData.nodes!.push(getG6Item(PROJECTITEM_TYPE.group, grp.oid, grp.label, index++));
        }

        // APPS NODES
        index = 0;
        for (const app of project.apps) {
            graphData.nodes!.push(
                getG6AppItem(
                    PROJECTITEM_TYPE.application,
                    app.swagger == true ? 'swagger' : app.type,
                    app.oid,
                    app.label,
                    index++
                )
            );
        }

        // SCOPES NODES

        index = 1;
        const scopeDone = [] as string[];
        for (const scp of project.scopes) {
            if (!scopeDone.includes(scp.oid)) {
                const node = getG6Item(PROJECTITEM_TYPE.scope, scp.oid, scp.oid, index++);
                graphData.nodes!.push(node);
                scopeDone.push(scp.oid);
            }
        }

        // EXT-SCOPES NODES
        const projectId = project.id;
        for (const sub of vm.subscriptions!.filter(
            (s) =>
                s.what.project !== projectId &&
                (s.status === SubscriptionStatus.Validated ||
                    s.status === SubscriptionStatus.Active)
        )) {
            const extScopeId = sub.what.item.oid;
            if (!extScopes.includes(extScopeId)) {
                extScopes.push(extScopeId);
                graphData.nodes!.push(
                    getG6Item(PROJECTITEM_TYPE.externalScp, extScopeId, extScopeId, index++)
                );
            }
        }

        // EXT-APPS NODES
        index = 0;
        for (const sub of vm.subscriptions!.filter((s) => s.target.project !== projectId)) {
            const extAppId = sub.target.item.oid;
            if (!extApps.includes(extAppId)) {
                extApps.push(extAppId);
                graphData.nodes!.push(
                    getG6Item(
                        PROJECTITEM_TYPE.externalApp,
                        extAppId,
                        sub.target.item.label,
                        index++
                    )
                );
            }
            // EXT-APPS EDGES
            if (sub.status === SubscriptionStatus.Active) {
                graphData.edges!.push({
                    source: extAppId,
                    target: sub.what.item.oid,
                    type: 'arc-dash'
                });
            } else if (sub.status === SubscriptionStatus.Validated) {
                graphData.edges!.push({
                    source: extAppId,
                    target: sub.what.item.oid
                });
            }
        }

        // APPS EDGES
        for (const item of project.apps) {
            if (item.hasAudience()) {
                graphData.edges!.push({
                    source: item.audience,
                    target: item.oid
                });
            }

            item.groups.forEach((gid) => {
                graphData.edges!.push({
                    source: gid,
                    target: item.oid
                });
            });

            item.scopes.forEach((sid) => {
                graphData.edges!.push({
                    source: item.oid,
                    target: sid
                });
            });

            item.subs.forEach((sid) => {
                graphData.edges!.push({
                    source: item.oid,
                    target: sid,
                    type: 'arc-dash'
                });
            });
        }

        vm.totalScopes = project.scopes.length + extScopes.length;
        vm.totalExtApps = extApps.length;
        return graphData;
    }

    private _runtimeGraph: Graph | undefined;
    private _runtimeGraphData!: GraphData;
    private _sub = new Subscription();
    private _initDone = false;
    private _graphDone = false;

    @Input() public projListVm!: ProjectsViewModel;
    @Input() public vm!: ProjectDetailViewModel;

    constructor(
        private _cd: ChangeDetectorRef,
        private _notifierSvc: NotifierService,
        private _router: Router
    ) { }

    private _runtimeGraphDataInitializer(graph: GraphData) {
        this._runtimeGraphData = graph;
    }

    private _runtimeGraphHeigthCalculation(): number {
        if (!!this.vm && !!this.vm.loaded && this.vm.subscriptions) {
            const projView = this.vm.view;
            const maxItem = Math.max(
                projView.apps.length,
                projView.groups.length,
                this.vm.totalExtApps + 1,
                this.vm.totalScopes
            );
            return 50 + 75 * maxItem;
        }
        return 715;
    }

    private _graphNavigation(value: string, className: string) {
        if (this.vm.selection !== value || this.vm.selectionType !== className) {
            const router = this._router;
            const view = this.vm.view;
            switch (className) {
                case PROJECTITEM_TYPE.application:
                    const appLnk = view.apps.find((a) => a.oid === value)!;
                    const appUrl = `/projects/${this.vm.view.id}/apps/${appLnk.label}/details`;
                    router.navigateByUrl(appUrl);
                    break;
                case PROJECTITEM_TYPE.group:
                    if (['all', 'b2e', 'gem'].includes(value)) {
                        this._notifierSvc.notify('Navigation Cancelled', 'Invalid target');
                    } else {
                        const grpLnk = view.groups.find((a) => a.oid === value)!;
                        const grpUrl = `/projects/${view.id}/groups/${grpLnk.label}/details`;
                        router.navigateByUrl(grpUrl);
                    }
                    break;
                case PROJECTITEM_TYPE.scope:
                    const scpUrl = `/projects/${view.id}/scopes/${value}/details`;
                    router.navigateByUrl(scpUrl);
                    break;
                case PROJECTITEM_TYPE.externalApp:
                    const extarnalApp = this.vm.subscriptions!.find((ea) =>
                        sameString(ea.target.item.oid, value)
                    );

                    if (extarnalApp) {
                        const exAppUrl = `/projects/${extarnalApp.target.project}/apps/${extarnalApp.target.item.label}/details`;
                        router.navigateByUrl(exAppUrl);
                        router
                            .navigateByUrl('/', {skipLocationChange: true})
                            .then(() => router.navigateByUrl(exAppUrl));
                    } else {
                        this._notifierSvc.notify(
                            'Navigation cancelled',
                            'No project having "' + value + '" for app!'
                        );
                    }

                    break;
                case PROJECTITEM_TYPE.externalScp:
                    const apiProject = this.projListVm.view.find((p) =>
                        p.scopes.some((s2) => s2.oid === value)
                    );
                    if (apiProject) {
                        const exScpUrl = `/projects/${apiProject.id}/scopes/${value}/details`;
                        router.navigateByUrl(exScpUrl);
                    } else {
                        this._notifierSvc.notify(
                            'Navigation cancelled',
                            'No project having "' + value + '" for scopes!'
                        );
                    }

                    break;
            }
        }
    }

    private _runtimeGraphInitializer() {
        this._runtimeGraph = new Graph({
            container: 'projectRuntimeGraph',
            width: graph_width,
            height: this._runtimeGraphHeigthCalculation(),
            modes: {
                default: ['activate-relations']
            },

            defaultNode: {
                size: 32,
                labelCfg: {
                    position: 'bottom'
                }
            },
            defaultEdge: {
                curveOffset: -80,
                size: 1,
                style: {
                    endArrow: true
                }
            },
            edgeStateStyles: {
                active: {
                    lineWidth: 2,
                    stroke: '#0069A7'
                }
            }
        });
        JoeLogger.debug('ProjectDetailcomponent - Runtimme Graph Created');
    }

    private _runtimeGraphRender() {
        if (this._initDone && this._runtimeGraphData && !this._runtimeGraph) {
            this._runtimeGraphInitializer();
        }

        // const router = this._router;
        if (!this._graphDone && this._runtimeGraphData && this._runtimeGraph) {
            this._graphDone = true;
            const cd = this._cd;
            const navigate = this._graphNavigation.bind(this);
            const h = this._runtimeGraphHeigthCalculation();
            this._runtimeGraph.set('height', h);
            this._runtimeGraph.data(this._runtimeGraphData);
            if (this._runtimeGraphData.edges!.length === 0) {
                this._runtimeGraph.removeBehaviors('activate-relations', 'default');
            }
            this._runtimeGraph.on('node:click', (evt: any) => {
                navigate(evt.item.get('id'), evt.item.getModel().class);
            });

            cd.markForCheck();
            this._runtimeGraph.render();
            JoeLogger.headedInfo('Project ' + this.vm.view.id, 'Graph Runtime Render - h = ' + h);
        }
    }

    ngOnChanges(changements: SimpleChanges) {
        if (this.projListVm && this.vm) {
            if (this.vm.loaded && this.vm.subscriptions) {
                this._runtimeGraphDataInitializer(
                    ProjectRuntimeComponent._runtimeGraphDataCreation(this.vm)
                );
                this._runtimeGraphRender();
            }
            const self = this;
            this._sub.add(
                this.vm.onStateChanged.subscribe((p) => {
                    if (p === ProjectsViewModel.ProjectChangedEvent && this.vm.subscriptions) {
                        self._runtimeGraphDataInitializer(
                            ProjectRuntimeComponent._runtimeGraphDataCreation(self.vm)
                        );
                        self._runtimeGraphRender();
                    }
                })
            );
        }
    }

    // comment 2
    ngOnInit(): void {
        this._graphDone = false;
        this._initDone = true;
        this._runtimeGraphRender();
    }

    ngOnDestroy() {
        this._initDone = false;
        this._sub.unsubscribe();
        if (this._runtimeGraph) {
            this._runtimeGraph.data({
                nodes: [],
                edges: []
            });
            this._runtimeGraph.refresh();
            this._runtimeGraph.destroy();
            this._runtimeGraph = undefined;
            this._runtimeGraphData = {};
            JoeLogger.debug('ProjectDetailcomponent - Runtime Graph Destroy');
        }
    }
}
