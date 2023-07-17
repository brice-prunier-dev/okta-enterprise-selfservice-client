import {
    ListDataModel,
    CommandNotification,
    DetailViewModel,
    StoreManager,
    IRuntimeContext,
    RuntimeEntry
} from 'joe-viewmodels';

import {
    ProjectDocData,
    ProjectDocType,
    ProjectDocView,
    PROJECT_STORE,
    ScopeLinkData,
    SubscriptionDocData
} from 'intact-models';
import {ArrayViewFactory, JoeLogger, sameString, SortComparer} from 'joe-fx';
import {ProjectsService} from '../../../_core';

export class ProjectsViewModel extends ListDataModel<ProjectDocData> {
    private static _LOCATION(
        element: ProjectDocData,
        array: ProjectDocData[],
        comparer: SortComparer,
        start?: number,
        end?: number
    ): number {
        if (array.length === 0) {
            return -1;
        }

        start = start || 0;
        end = end || array.length;
        const pivot = (start + end) >> 1; // should be faster than dividing by 2

        const c = comparer(element, array[pivot]);
        if (end - start <= 1) {
            return c === -1 ? start : end;
        }
        switch (c) {
            case -1:
                return ProjectsViewModel._LOCATION(element, array, comparer, start, pivot);
            case 1:
                return ProjectsViewModel._LOCATION(element, array, comparer, pivot, end);
            default:
                return pivot;
        }
    }

    // #region Properties (8)

    static ProjectChangedEvent = 'project-changed';

    private _initialized = false;
    private _myView!: ProjectDocData[];
    private _myViewNames!: string[];
    private _projectDetailVm!: DetailViewModel<ProjectDocData, ProjectDocView> | undefined;
    private _viewNames!: string[];
    myProject: ProjectDocData | undefined;

    // #endregion Properties (8)

    // #region Constructors (1)

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, ProjectDocType, parentContext);
        this.contextname = 'Projects';
    }

    // #endregion Constructors (1)

    // #region Public Accessors (5)

    get currentProject(): DetailViewModel<ProjectDocData, ProjectDocView> | undefined {
        return this._projectDetailVm;
    }

    get loaded(): boolean {
        return super.loaded && this._myViewNames !== undefined && this._myView !== undefined;
    }

    get myView(): ProjectDocData[] {
        return this._myView;
    }

    get myViewNames(): string[] {
        return this._myViewNames;
    }

    get viewNames(): string[] {
        return this._viewNames;
    }

    // #endregion Public Accessors (5)

    // #region Public Methods (9)

    initModel() {
        if (!this._initialized) {
            this._initialized = true;
            this.view.forEach((project) => {
                project.apps.forEach((app) => {
                    app.subs.forEach((scp) => {
                        const targetProj = this.view.find((p) =>
                            p.scopes.some((s) => sameString(s.oid, scp))
                        );
                        if (targetProj !== undefined) {
                            const scope = targetProj.scopes.find((s) =>
                                sameString(s.oid, scp)
                            ) as ScopeLinkData;
                            scope.subsCount = (scope.subsCount || 0) + 1;
                        }
                    });
                });
            });
        }
    }

    loadMy(value: string[], username: string) {
        const view = this.view;
        this._myViewNames = value;
        this._viewNames = view.map((p) => p.id);
        if (view.length > 0 && !view[0].public) {
            const p = view[0];
            if (username.toLowerCase().startsWith(p.id)) {
                this.myProject = p;
            }
        }
        this._myView = view.filter((v) => this.myViewNames.includes(v.id))!;
        this.onStateChanged.next(CommandNotification.StateChanged);
    }

    loadOp(username: string): Promise<any> {
        const projectsProxy = StoreManager.INSTANCE.store<ProjectsService>(PROJECT_STORE);
        const allProjectsPromise = projectsProxy.getMyContextAsync();
        const myProjectPromise = projectsProxy.getMineAsync();
        const self = this;
        return Promise.all([allProjectsPromise, myProjectPromise])
            .then((ops: [ProjectDocData[], string[]]) => {
                const allResult = ops[0];
                const myResult = ops[1];
                self.loadData(allResult);
                self.loadMy(myResult, username);
                self.initModel();
            })
            .catch((err) => {
                self.setError(err);
            });
    }

    setProjectContext(projects: ProjectDocData[]) {
        const view = this.view;
        const comparer = ArrayViewFactory.PropertiesComparer(['id']);

        projects.forEach((value) => {
            ProjectDocType.prepare(value);
            const projectIndex = view.findIndex((p) => p.id === value.id);
            if (projectIndex > -1) {
                const old = view[projectIndex];
                view[projectIndex] = value;
            } else {
                const index = ProjectsViewModel._LOCATION(value, view, comparer);
                view.splice(index, 0, value);
            }
        });
    }

    refreshProjectContext(changedProject: ProjectDocData) {
        const view = this.view;
        const comparer = ArrayViewFactory.PropertiesComparer(['id']);

        const projectIndex = view.findIndex((p) => p.id === changedProject.id);
        if (projectIndex > -1) {
            ProjectDocType.prepare(changedProject);
            const old = view[projectIndex];
            view[projectIndex] = changedProject;
            JoeLogger.debug('ProjectDoc refresh for ' + changedProject.id);
        }
    }

    retrieveSubscribers(project: string, scope: string): SubscriptionDocData[] {
        let result: SubscriptionDocData[] = [];
        this.view.forEach((p) => {
            result = result.concat(
                p.apps
                    .filter((a) => a.scopes?.includes(scope) || a.subs?.includes(scope))
                    .map<SubscriptionDocData>((a) => {
                        return {
                            id: scope + '~' + a.oid,
                            status: a.subs?.includes(scope) ? 'active' : 'default',
                            env: '?',
                            requests: [],
                            responses: [],
                            what: {
                                project,
                                description: '?',
                                itemtype: 'scp',
                                item: {
                                    oid: scope,
                                    label: scope,
                                    description: '?'
                                }
                            },
                            target: {
                                project: p.id,
                                description: p.description,
                                itemtype: 'app',
                                item: {
                                    oid: a.oid,
                                    label: a.label,
                                    description: a.description
                                }
                            }
                        } as SubscriptionDocData;
                    })
            );
        });
        return result;
    }

    setCurrentProject(id: string, vm: DetailViewModel<ProjectDocData, ProjectDocView>): boolean {
        if (this._projectDetailVm !== vm) {
            if (this._projectDetailVm) {
                this._projectDetailVm.entry.static = false;
            }
            this._projectDetailVm = vm;
            if (vm && !vm.loaded) {
                const selected = this.view.find((p) => sameString(p.id, id));
                const view = new ProjectDocView(selected);
                vm.entry.static = true;
                vm.error = undefined;
                vm.setView(view);
                return selected !== undefined;
            }
        }
        return this._projectDetailVm === vm;
    }

    uninitModel() {
        if (!this._initialized) {
            return;
        }
        this._initialized = false;
        this.view.forEach((project) => {
            project.scopes.forEach((scope) => {
                const scpLnk = scope as ScopeLinkData;
                if (scpLnk.subsCount) {
                    delete scpLnk.subsCount;
                }
            });
        });
    }

    unsetCurrentProject() {
        if (this._projectDetailVm) {
            this._projectDetailVm.entry.static = false;
            this._projectDetailVm = undefined;
        }
    }
    // #endregion Public Methods (9)
}
