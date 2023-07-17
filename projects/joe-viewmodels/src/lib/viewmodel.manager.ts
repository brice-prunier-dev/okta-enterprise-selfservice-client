import {
    ArrayViewFactory,
    asArray,
    MetadataHelper,
    IDataInfo,
    Tobject,
    JoeLogger,
    sameObject,
    isAssigned,
    JsonObj,
    StringMap,
    isBlank,
    isArrayAssigned
} from 'joe-fx';

import {ViemModelConstructor, IViewModelManager, RuntimeEntry, DocEntry, EntryCallback, IRuntimeContext} from './types';

import {Subject} from 'rxjs';

import {queryAny} from './queries';


export const DEFAULT_OUTLET = 'default';

export class ViewModelManager implements IViewModelManager {
    // #endregion Properties (8)

    // #region Constructors (1)

    constructor() {
        this._currents = {};
        this._vmEntries = [];
        this.doGC = true;
        this.onCurrentViewModelChanged = new Subject<IRuntimeContext>();
    }
    // #region Properties (8)

    public static readonly CACHE_DELAY = 1;
    public static readonly GC_PERIOD = 60000;

    // #endregion Constructors (1)

    // #region Public Static Methods (2)

    public static INSTANCE: ViewModelManager;
    public static LEASE_DATE(): Date {
        const now = new Date();
        now.setMinutes(now.getMinutes() + ViewModelManager.CACHE_DELAY);
        return now;
    }

    // #endregion Public Methods (16)

    // #region Private Static Methods (1)

    private static isStillUsed(vmEntries: RuntimeEntry[], doc: any | any[]): boolean {
        for (const vmEntry of vmEntries) {
            if (vmEntry.instance!.contains(doc)) {
                return true;
            }
        }
        return false;
    }

    public static runGC() {
        ViewModelManager.INSTANCE.gc();
    }

    private static DEPRECATION_CALLBACK(deprecatedCache: IDataInfo[]): EntryCallback {
        const func: EntryCallback = (doc: JsonObj | JsonObj[]): void => {
            if (deprecatedCache) {
                if (asArray(doc)) {
                    for (const d of doc) {
                        const dataInfo = MetadataHelper.getTypeInfo(d);
                        if (dataInfo && deprecatedCache.indexOf(dataInfo.obj) === -1) {
                            deprecatedCache.push(dataInfo);
                        }
                    }
                } else {
                    const dataInfo = MetadataHelper.getTypeInfo(doc);
                    if (dataInfo && deprecatedCache.indexOf(dataInfo.obj) === -1) {
                        deprecatedCache.push(dataInfo);
                    }
                }
            }
        };
        return func;
    }

    public readonly onCurrentViewModelChanged: Subject<IRuntimeContext>;

    private _ci: any;
    private _currents: {[name: string]: IRuntimeContext};


    private _isCurrent(context: IRuntimeContext): boolean {
        const contexts = Object.values(this._currents);
        return contexts.includes(context);
    }


    private _setCurrent(context: IRuntimeContext | undefined, outlet: string = DEFAULT_OUTLET) {
        const previousCurrent = this._currents[outlet];
        if (previousCurrent !== context) {
            if (previousCurrent !== undefined) {
                previousCurrent.entry.current = false;
            }
            if (context !== undefined) {
                this._currents[outlet] = context;
                context.entry.current = true;
                context.entry.parentContext = undefined;

            } else if (previousCurrent !== undefined) {
                delete this._currents[outlet];
            }
            this.onCurrentViewModelChanged.next(context!);
        }

    }
    // private _deprecatedCache: IDataInfo[];
    private _vmEntries: RuntimeEntry[];

    public doGC: boolean;

    // #endregion Public Static Methods (2)

    // #region Public Methods (16)

    public clearCache() {
        const cache = this._vmEntries;
        if (cache.length > 0) {
            cache.forEach((vm) => vm.instance!.terminate());
            this.gc();
        }
    }

    public clearViewModels(key: string = '*', query?: JsonObj) {
        const vmEntry = isBlank(query)
            ? this._vmEntries.find((e) => e.key === key || key === '*')
            : this._vmEntries.find((e) => e.key === key && sameObject(e.query, query));
        if (vmEntry) {
            vmEntry.instance!.terminate();
            this.gc();
        }
    }

    public createViewModelEntry(key: string, query: JsonObj = {}): RuntimeEntry {
        return {
            key,
            query: query as StringMap<any>,
            instance: null,
            validity: ViewModelManager.LEASE_DATE(),
            current: false,
            active: false,
            handled: false
        };
    }

    public gc() {
        const now = new Date();
        const vmEntries = this._vmEntries;
        const deprecatedCache: IDataInfo[] = [];
        const logger = JoeLogger;
        logger.group('GC');
        try {
            if (vmEntries && vmEntries.length) {
                logger.log('' + vmEntries.length + '# RuntimeContext to check');
                if (!JoeLogger.isProd) {
                    vmEntries.forEach((val, idx, arr) => {
                        this.traceEntry(val, now, idx);
                    }, this);
                    logger.separator();
                }
                const validEntries: RuntimeEntry[] = [];
                vmEntries
                    .filter(
                        (e) =>
                            !isBlank(e) &&
                            !isBlank(e.instance) &&
                            ((e.active && e.current) || e.static)
                    )
                    .forEach((e) => e.instance!.resetLifecycleValidity());
                vmEntries.forEach((entry, index, list) => {
                    if (isBlank(entry)) {
                        logger.header('RuntimeEntry undefined ');
                    } else if (isBlank(entry.instance)) {
                        logger.header('RuntimeEntry instance undefined ');
                    } else {
                        if (
                            entry.active &&
                            (entry.current || entry.static || now < entry.validity)
                        ) {
                            validEntries.push(entry);
                        } else {
                            logger.group('RELEASING : ' + entry.instance!.contextname);
                            JoeLogger.info('type: ' + entry.key);
                            JoeLogger.info('query: ' + +JSON.stringify(entry.query));
                            entry.instance!.invalidCacheNotification.call(
                                entry.instance,
                                '*',
                                queryAny,
                                ViewModelManager.DEPRECATION_CALLBACK(deprecatedCache)
                            );
                            try {
                                entry.instance!.release();
                            } catch (ex) {
                                logger.error(ex as Error);
                            }
                            logger.endgroup();
                        }
                    }
                });
                this._vmEntries = validEntries;

                if (deprecatedCache.length > 0) {
                    logger.group('Doc(s) to release: ' + deprecatedCache.length + '#.');
                    for (const cachedDoc of deprecatedCache) {
                        if (!ViewModelManager.isStillUsed(validEntries, cachedDoc.obj)) {
                            logger.debug(
                                cachedDoc.type.title + ' - ' + cachedDoc.path + ' - > Unprepared'
                            );
                            cachedDoc.type.unprepare(cachedDoc.obj);
                        } else {
                            logger.debug(
                                cachedDoc.type.title + ' - ' + cachedDoc.path + ' -> Still used'
                            );
                        }
                    }
                    logger.endgroup;
                }
            }
        } catch (ex) {
            logger.error(ex as Error);
        }
        logger.endgroup();
    }

    public getCacheData(
        key: string,
        query: JsonObj,
        source?: IRuntimeContext
    ): DocEntry | undefined {
        if (!source) {
            source = this.getCurrentViewModel();
        }
        if (source) {
            const fromSource = source.getCacheEntry(key, query);
            if (fromSource) {
                return fromSource;
            }
        }
        const matchingEntry = this._vmEntries.find(
            (e) => e.instance!.getCacheEntry(key, query) !== undefined
        );
        if (matchingEntry) {
            return matchingEntry.instance!.getCacheEntry(key, query);
        }
        return undefined;
    }


    public getManyAsync<T>(
        query: JsonObj,
        caller: IRuntimeContext,
        call: () => Promise<T[]>,
        objType?: Tobject,
        sort?: string[]
    ): Promise<T[]> {
        const type = objType || (caller.type as Tobject);
        const withType = isAssigned(type);

        const cacheEntry = withType ? this.getCacheData(type.title, query, caller) : undefined;
        if (cacheEntry) {
            caller.setDocInLocalCache(type.title, query, cacheEntry.doc);
            return Promise.resolve(cacheEntry.doc as unknown as T[]);
        } else {
            return call().then((jsonArray) => {
                let array = jsonArray || [];
                if (withType) {
                    const sortArray = Array.isArray(sort)
                        ? ArrayViewFactory.SortFromPropertyList(array, sort)
                        : ArrayViewFactory.SortFromTypeDef(array, type);
                    caller.setDocInLocalCache(type.title, query, sortArray);
                    array = sortArray;
                } else {
                    array = ArrayViewFactory.SortFromPropertyList(array, sort!);
                }
                return array;
            });
        }
    }

    public getOneAsync<T>(
        query: JsonObj,
        caller: IRuntimeContext,
        call: () => Promise<T>,
        objType?: Tobject
    ): Promise<T> {
        const type = objType || caller.type;
        const withType = isAssigned(type);
        const that = this;
        const cacheEntry = withType ? this.getCacheData(type.title, query, caller) : undefined;
        if (cacheEntry) {
            caller.setDocInLocalCache(type.title, query, cacheEntry.doc);
            return Promise.resolve<T>(cacheEntry.doc as unknown as T);
        } else {
            return call()
                .then((result) => {
                    if (withType) {
                        caller.setDocInLocalCache(type.title, query, result as unknown as JsonObj);
                    }
                    return result;
                })
                .catch((err) => {
                    caller.setError(err);
                    return Promise.reject(err);
                });
        }
    }

    public getViewModel<T extends IRuntimeContext>(key: any, query: JsonObj): T | undefined {
        const vmEntry = this._vmEntries.find(
            (e) => e.instance instanceof key && sameObject(e.query, query)
        );
        return vmEntry ? (vmEntry.instance as T) : undefined;
    }

    getCurrentViewModel(outlet: string = DEFAULT_OUTLET): IRuntimeContext {
        return this._currents[outlet];
    }


    // public getOrCreateViewModel<T extends IRuntimeContext>(
    //     key: string,
    //     query: JsonObj,
    //     vmtype: ViemModelConstructor<T>
    // ): T {
    //     const entry = this._vmEntries.find((e) => e.key === key && sameObject(e.query, query));
    //     if (entry) {
    //         return entry.instance as T;
    //     }
    //     const newentry = this.createViewModelEntry(key, query);
    //     const vm = new vmtype(newentry);
    //     this._vmEntries.push(newentry);
    //     return vm;
    // }

    public resolveCurrentViewModel<T extends IRuntimeContext>(
        vmtype: ViemModelConstructor<T>,
        query: JsonObj,
        outlet: string = DEFAULT_OUTLET
    ): T {
        const key = (vmtype as any).name;
        JoeLogger.log(`Resolving Current ViewModel: ${key} and ${JSON.stringify(query)}`);
        let vm = this.getViewModel<T>(vmtype, query);
        if (vm !== undefined) {
            if (!(vm.entry as RuntimeEntry).active) {
                vm = undefined;
                this.gc();
            } else {
                JoeLogger.log(
                    `Resolved Current ViewModel: ${vm.contextname}`
                );
                vm.clearError();
            }
        }
        if (vm === undefined) {
            const newentry = this.createViewModelEntry(key, query);
            vm = new vmtype(newentry);
            JoeLogger.log(
                `Resolved Current ViewModel as New: ${vm?.contextname} and ${JSON.stringify(query)}`
            );
            const shouldStartGC = this._vmEntries.length === 0;
            this._vmEntries.push(newentry);
            
            if (shouldStartGC) {
                this._startGC();
            }
        }
        this._setCurrent(vm!, outlet);
        return vm!;
    }

    public resolveDependentViewModel<T extends IRuntimeContext>(
        vmtype: ViemModelConstructor<T>,
        query: JsonObj,
        owner: IRuntimeContext
    ): T {
        const key = (vmtype as any).name;

        JoeLogger.log(`Resolving Dependent ViewModel: ${key} and ${JSON.stringify(query)}`);
        let vm = this.getViewModel<T>(vmtype, query);
        if (vm !== undefined) {
            if (!(vm.entry as RuntimeEntry).active) {
                vm = undefined;
                this.gc();
            } else {
                JoeLogger.log(
                    `Resolved Dependent ViewModel: ${vm.contextname}`
                );
                vm.clearError();
            }
        }
        if (vm === undefined) {
            const newentry = this.createViewModelEntry(key, query);
            vm = new vmtype(newentry, owner);

            JoeLogger.log(
                `Resolved Dependend ViewModel as New: ${vm.contextname} and ${JSON.stringify(query)}`
            );

            const shouldStartGC = this._vmEntries.length === 0;
            this._vmEntries.push(newentry);
            
            if (shouldStartGC) {
                this._startGC();
            }
        }
        if (vm!.entry.parentContext !== owner) {
            vm!.entry.parentContext = owner;
            const parentContextEntry = owner.entry;
            const parentContextEntryDependencies = parentContextEntry.dependencies || [];
            if (!parentContextEntryDependencies.includes(vm!)) {
                parentContextEntryDependencies.push(vm!);
            }
            parentContextEntry.dependencies = parentContextEntryDependencies;
        }
        return vm!;
    }

    public resolveStaticViewModel<T extends IRuntimeContext>(
        vmtype: ViemModelConstructor<T>,
        query: JsonObj,
        outlet?: string
    ): T {
        const key = (vmtype as any).name;
        JoeLogger.log(`Resolving Static ViewModel: ${key} and ${JSON.stringify(query)}`);
        let vm = this.getViewModel<T>(vmtype, query);
        if (vm !== undefined) {
            JoeLogger.log(
                `Resolved Static ViewModel: ${vm.contextname} and ${JSON.stringify(query)}`
            );
            vm!.clearError();
        }
        if (vm === undefined) {
            const newentry = this.createViewModelEntry(key, query);
            vm = new vmtype(newentry);
            JoeLogger.log(
                `Resolved Static ViewModel as New: ${vm.contextname} and ${JSON.stringify(query)}`
            );
            const shouldStartGC = this._vmEntries.length === 0;
            this._vmEntries.push(newentry);
            
            if (shouldStartGC) {
                this._startGC();
            }
        }
        const entry = vm!.entry as RuntimeEntry;
        if (!entry.static) {
            entry.static = true;
        }
        
        if (outlet) {
            this._setCurrent(vm!, outlet);
        }
        return vm!;
    }

    public turnIntoReleasableViewModel(vmtype: ViemModelConstructor<any>, query: JsonObj) {
        const key = (vmtype as any).name;
        let vm = this.getViewModel(vmtype, query);
        if (vm && (vm.entry as RuntimeEntry).static) {
            JoeLogger.log(`turnIntoReleasableViewModel: ${key} and ${JSON.stringify(query)}`);
            (vm.entry as RuntimeEntry).static = false;
            vm.resetLifecycleValidity();
        }
    }

    public traceEntry(entry: RuntimeEntry, now: Date, idx: number): void {
        if (entry.instance) {
            JoeLogger.group(entry.instance.contextname);
        } else {
            JoeLogger.group('Released entry');
        }

        if (entry.static) {
            JoeLogger.info('static');
        } else if (entry.current) {
            JoeLogger.info('current');
        } else if (entry.parentContext) {
            JoeLogger.info('child of ' + entry.parentContext.contextname);
        }
        if (!entry.static && entry.active) {
            let validity = 'past out';
            if (now < entry.validity) {
                validity =
                    'valid for ' +
                    Math.ceil(Math.abs(now.getTime() - entry.validity.getTime()) / 1000) +
                    ' sec';
            }
            JoeLogger.info(validity);
        }
        if (!entry.active) {
            JoeLogger.info('deprecated');
        }

        const entries = entry.instance!.getCacheEntries();
        if (entries.length > 0) {
            entries.forEach((e, i) =>
                JoeLogger.info(
                    ' doc ' + (i + 1) + '# in cache : ' + e.key + ' -> ' + JSON.stringify(e.query)
                )
            );
        } else {
            JoeLogger.info('no doc in cache');
        }

        JoeLogger.endgroup();
    }

    // private _initEntryViewModel(vm: IRuntimeContext): void {
    //     for (const vmEntry of this._vmEntries) {
    //         vmEntry.current = vmEntry.instance === vm;
    //         if (vmEntry.current) {
    //             vmEntry.active = true;
    //             vmEntry.parentContext = undefined;
    //             // if (isArrayAssigned(vmEntry.dependencies)) {
    //             //     vmEntry.dependencies!.forEach((rc) => this._setCurrentParentContext(rc, vm));
    //             // }
    //         }
    //     }
    //     this.onCurrentViewModelChanged.next(vm);
    // }

    // private _setCurrentParentContext(childVm: IRuntimeContext, parentVm: IRuntimeContext): void {
    //     (childVm.entry as RuntimeEntry).parentContext = parentVm;
    //     if (isArrayAssigned((childVm.entry as RuntimeEntry).dependencies)) {
    //         (childVm.entry as RuntimeEntry).dependencies!.forEach((rc) =>
    //             this._setCurrentParentContext(rc, childVm)
    //         );
    //     }
    // }

    private _startGC(): void {
        if (this._ci === undefined && this.doGC) {
            this.doGC = false;
            JoeLogger.log(
                `ViewModelManager._starting GC with period: ${ViewModelManager.GC_PERIOD}`
            );
            this._ci = setInterval(this.gc.bind(this), ViewModelManager.GC_PERIOD);
            JoeLogger.log(`ViewModelManager._started GC with _ci: ${this._ci}`);
        }
    }
}

export function initViewModelManager(): void {
    if (ViewModelManager.INSTANCE === undefined) {
        ViewModelManager.INSTANCE = new ViewModelManager();
    }
}

initViewModelManager();
