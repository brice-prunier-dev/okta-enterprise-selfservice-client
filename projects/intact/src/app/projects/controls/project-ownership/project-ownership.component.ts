import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import {Graph, GraphData, Item} from '@antv/g6';
import {JoeLogger, sameString} from 'joe-fx';
import {PROJECTITEM_TYPE, GroupLinkData} from 'intact-models';
import {getG6Item} from '../graph-utils';
import {ProjectDetailViewModel} from '../../../projectsnav';
import {NotifierService} from '../../../_core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CommandNotification} from 'joe-viewmodels';

@Component({
    selector: 'iam-project-ownership',
    templateUrl: './project-ownership.component.html',
    styleUrls: ['./project-ownership.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ProjectOwnershipComponent implements OnChanges, OnInit, OnDestroy {
    private static _adminGraphDataCreation(vm: ProjectDetailViewModel): GraphData {
        const project = vm.view;

        const graphData: GraphData = {
            nodes: [],
            edges: []
        };

        const groups: GroupLinkData[] = [];

        let appIndex = 0;
        let grpIndex = 0;
        let scpIndex = 0;

        for (const item of project.apps) {
            graphData.nodes!.push(
                getG6Item(PROJECTITEM_TYPE.application, item.oid, item.label, appIndex++)
            );

            item.admins.forEach((gid) => {
                const grp = project.groups.find((g2) => g2.oid === gid);

                if (grp) {
                    if (!groups.some((g) => g.oid === grp.oid)) {
                        groups.push(grp);
                        graphData.nodes!.push(
                            getG6Item(PROJECTITEM_TYPE.group, grp.oid, grp.label, grpIndex++)
                        );
                    }
                    graphData.edges!.push({
                        id: item.oid + '_' + grp.oid,
                        source: item.oid,
                        target: grp.oid,
                        curveOffset: 30
                    });
                }
            });
        }

        for (const item of project.scopes) {
            graphData.nodes!.push(
                getG6Item(PROJECTITEM_TYPE.scope, item.oid, item.oid, scpIndex++)
            );

            item.admins.forEach((gid) => {
                const grp = project.groups.find((g2) => g2.oid === gid);

                if (grp) {
                    if (!groups.some((g) => g.oid === grp.oid)) {
                        groups.push(grp);
                        graphData.nodes!.push(
                            getG6Item(PROJECTITEM_TYPE.group, grp.oid, grp.label, grpIndex++)
                        );
                    }

                    graphData.edges!.push({
                        id: item.oid + '_' + grp.oid,
                        source: item.oid,
                        target: grp.oid,
                        curveOffset: 30
                    });
                }
            });
        }

        for (const item of project.groups) {
            if (!groups.some((g) => g.oid === item.oid)) {
                groups.push(item);
                graphData.nodes!.push(
                    getG6Item(PROJECTITEM_TYPE.group, item.oid, item.label, grpIndex++)
                );
            }
        }

        for (const item of project.groups) {
            item.admins.forEach((gid) => {
                const grp = project.groups.find((g2) => g2.oid === gid);
                if (grp) {
                    graphData.edges!.push({
                        id: item.oid + '_' + grp.oid,
                        source: item.oid,
                        target: grp.oid,
                        curveOffset: 100
                    });
                }
            });
        }

        return graphData;
    }

    private _adminGraph: Graph | undefined;
    private _adminGraphData: GraphData | undefined;
    private _sub = new Subscription();

    @Input() public vm!: ProjectDetailViewModel;

    constructor(
        private _cd: ChangeDetectorRef,
        private _notifierSvc: NotifierService,
        private _router: Router
    ) { }

    private _adminGraphInitializer() {
        this._adminGraph = new Graph({
            container: 'projectAdminGraph',
            width: 818,
            height: this._adminGraphHeigthCalculation(),
            linkCenter: true,
            modes: {
                default: ['activate-relations']
            },
            defaultNode: {
                type: 'image',
                size: 32,
                labelCfg: {
                    position: 'bottom'
                }
            },
            defaultEdge: {
                type: 'arc-dash',
                size: 1,
                color: '#5B8FF9',
                fillOpacity: 0,
                opacity: 0
            },
            edgeStateStyles: {
                running: {
                    stroke: '#0069A7',
                    size: 2,
                    lineWidth: 2
                }
            }
        });
        JoeLogger.debug('ProjectDetailcomponent - Admin Graph Created');

        if (this.vm.loaded) {
            this._adminGraphRender();
        }
    }

    private _adminGraphDataInitializer(graph: GraphData) {
        this._adminGraphData = graph;
        this._adminGraphRender();
    }

    private _adminGraphRender() {
        // const router = this._router;
        if (this._adminGraphData && this._adminGraph) {
            const navigate = this._graphNavigation.bind(this);

            const h = this._adminGraphHeigthCalculation();
            this._adminGraph.set('height', h);
            this._adminGraph.data(this._adminGraphData);

            this._adminGraph.on('node:click', (evt: any) => {
                navigate(evt.item.get('id'), evt.item.getModel().class);
            });
            this._adminGraph.on('node:mouseenter', (ev: any) => {
                // Get the target node of the event
                const node = ev.item;
                // Get the related edges of the target node
                const edges = node.getEdges() as Item[];
                // Turn the running state of all the related edges to be true. The setState function will be activated now
                edges.forEach((edge: Item) =>
                    this._adminGraph!.setItemState(edge, 'running', true)
                );
                if (edges && edges.length > 0) {
                    if (edges.length === 1) {
                        edges[0].toBack();
                    } else {
                        for (let index = edges.length - 1; index > 0; index--) {
                            edges[index].toBack();
                        }
                    }
                    node.toFront();
                    // edges[ edges.length - 1 ][ 0 ].toBack();
                }
            });

            // Listen the mouseleave event on node
            this._adminGraph.on('node:mouseleave', (ev: any) => {
                // Get the target node of the event
                const node = ev.item;
                // Get the related edges of the target node
                const edges = node.getEdges() as Item[];
                // Turn the running state of all the related edges to be false. The setState function will be activated now
                edges.forEach((edge: Item) =>
                    this._adminGraph!.setItemState(edge, 'running', false)
                );
            });

            this._adminGraph.render();
            JoeLogger.headedInfo('Project ' + this.vm.view.id, 'Graph Admin Render - h = ' + h);
        }
    }

    private _graphNavigation(value: string, className: string) {
        if (this.vm.selection !== value) {
            switch (className) {
                case PROJECTITEM_TYPE.application:
                    const appLnk = this.vm.view.apps.find((a) => a.oid === value)!;
                    const appUrl = `/projects/${this.vm.view.id}/apps/${appLnk.label}/details`;
                    this._router.navigateByUrl(appUrl);
                    break;
                case PROJECTITEM_TYPE.group:
                    if (['all', 'b2e', 'gem'].includes(value)) {
                        this._notifierSvc.notify('Navigation Cancelled', 'Invalid target');
                    } else {
                        const grpLnk = this.vm.view.groups.find((a) => a.oid === value)!;
                        const grpUrl = `/projects/${this.vm.view.id}/groups/${grpLnk.label}/details`;
                        this._router.navigateByUrl(grpUrl);
                    }
                    break;
                case PROJECTITEM_TYPE.scope:
                    const scpUrl = `/projects/${this.vm.view.id}/scopes/${value}/details`;
                    this._router.navigateByUrl(scpUrl);
                    break;
            }
        }
    }

    private _adminGraphHeigthCalculation(): number {
        if (this.vm.loaded) {
            const projView = this.vm.view;
            const maxItem = Math.max(
                projView.apps.length,
                projView.groups.length,
                projView.scopes.length
            );
            return 50 + 75 * maxItem;
        }
        return 1000;
    }

    ngOnChanges(changements: SimpleChanges) {
        if (this.vm) {
            if (this.vm.loaded) {
                this._adminGraphDataInitializer(
                    ProjectOwnershipComponent._adminGraphDataCreation(this.vm)
                );
            } else {
                const self = this;
                this._sub = this.vm.onStateChanged.subscribe((p) => {
                    if (p === CommandNotification.StateChanged) {
                        self._adminGraphDataInitializer(
                            ProjectOwnershipComponent._adminGraphDataCreation(self.vm)
                        );
                    } else if (p === ProjectDetailViewModel.MEMBER_LOADED) {
                        self._cd.markForCheck();
                    }
                });
            }
        }
    }

    ngOnInit(): void {
        this._adminGraphInitializer();
    }

    ngOnDestroy() {
        this._sub.unsubscribe();

        if (this._adminGraph) {
            this._adminGraph.data({
                nodes: [],
                edges: []
            });
            this._adminGraph.refresh();
            this._adminGraph.destroy();
            this._adminGraph = undefined;
            this._adminGraphData = undefined;
            JoeLogger.debug('ProjectDetailcomponent - Admin Graph Destroy');
        }
    }
}
