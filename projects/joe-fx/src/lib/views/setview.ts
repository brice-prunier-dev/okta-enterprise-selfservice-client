import {
    PATH_ROOT,
    toArraySelector,
    MetadataHelper,
    IDataInfo,
    IViewElement,
    ISetElement,
    PropertyTypology,
    DataPayload,
    ObjviewType,
    AType,
    Scalar,
    MapviewType,
    SetviewTypeConstructor,
    MType,
    ListValidationState,
    ValidationState,
    JsonObj,
    PATH_UNASSIGNED,
    ChangeSet,
    decodeSelector,
    extractContent,
    isTextObject,
    isTextArray,
    isMatchingSelector,
    decodeSimpleObj,
    encodeSelector,
    asArray,
    ValidationRule,
    isObjAssigned,
    DataObj,
    ValidationScopes,
    JoeLogger,
    IRootViewElement
} from '../core';
import { Tarray, ArrayViewFactory, Tobject, corelateValidationWithParents } from '../types';
import { SetviewEditor } from './setview-editor';

const NO_NOTIFY = -100;
const setfreezedSym = Symbol('__setfreezed__');
function nowrite() {
    return;
}

export class Setview<T extends Scalar | IViewElement | ISetElement<T>>
    extends Array<T>
    implements ISetElement<T>
{
    private _parent_?: IViewElement;
    private _ver_ = 1;
    public $editor?: SetviewEditor<T>;
    public $validation: ListValidationState;
    public $rules?: { _: ValidationRule<T[]> };
    public get hasScalarItems(): boolean {
        return (this.$src.type as Tarray).itemsTypeDef!.kind === PropertyTypology.Scalar;
    }

    public get $isEditing() {
        return this.$editor !== undefined;
    }

    public get $isTracking(): boolean {
        return this._ver_ > 0;
    }

    public get $src(): IDataInfo {
        return MetadataHelper.getTypeInfo(this);
    }

    constructor(array: any[], type?: AType, parent?: IViewElement) {
        super();
        Object.setPrototypeOf(this, new.target.prototype);
        // Object.setPrototypeOf( this, Setview.prototype );
        this.$validation = new ListValidationState();
        if (!type) {
            // Instance created on array operation as slice
            return;
        }
        if (!array) {
            array = [];
        }
        this._parent_ = parent;
        if (!parent) {
            type.prepare(array, null, PATH_ROOT);
        }
        const atype = type as Tarray;
        MetadataHelper.link(array, this, atype);
        // const symbol = MetadataHelper.getSymbol();
        // const obj = this as any;
        // obj[symbol] = dataInfo;
        // this[symbol] = dataInfo;
        if (!atype.isTuple) {
            if (array && atype.itemsTypeDef!.kind === PropertyTypology.Scalar) {
                array.forEach((scalarValue) => this.push(scalarValue));
            } else if (array && parent) {
                const sortViews = array.map<T>((value, i) => {
                    atype.prepare(value, array, toArraySelector(i));
                    return atype.itemsTypeDef!.readAsView(value, i, this);
                }, this);
                ArrayViewFactory.SortFromTypeDef<T>(sortViews).forEach((e: T) => this.push(e));
            } else {
                atype.itemsTypeDef!.prepare(array, undefined, PATH_ROOT);
                array.forEach((value, i) => {
                    atype.itemsTypeDef!.prepare(value, undefined, PATH_ROOT);
                    this.push(atype.itemsTypeDef!.readAsView(value, i, this));
                }, this);
            }
        }
    }

    public add(input: T, index: number = -1) {
        this.$edit().add(input, index);
    }

    public update(index: number, input: T) {
        this.$edit().update(index, input);
    }

    public $assign(value: any): this {
        if (asArray(value)) {
            const editor = this.$edit(false);
            const chekDeleted = this.$isEditing && this.$editor!.hasDeletedItem;
            const isScalar = this.hasScalarItems;
            const atype = this.$src.type as Tarray;
            for (const assignItem of value) {
                if (isScalar) {
                    this.add(assignItem as T, this.length);
                } else {
                    const idxObj = atype.buildIndexObjFromSelectorValue(
                        atype.getIndexValue(assignItem)
                    );
                    if (chekDeleted) {
                        const deletedInfo = this.$editor!.indexInfoOfDeletedItem(assignItem);
                        if (deletedInfo) {
                            const childView = this.$newChild().$assign(assignItem) as T;
                            this.add(childView, deletedInfo[0]);
                            continue;
                        }
                    }
                    let assignItemExists = false;
                    for (let idx = 0; idx < this.length; idx++) {
                        if (isMatchingSelector((this[idx] as IViewElement).$src.obj, idxObj)) {
                            assignItemExists = true;
                            (this[idx] as IViewElement).$assign(assignItem);
                            break;
                        }
                    }
                    if (!assignItemExists) {
                        const childView = this.$newChild().$assign(assignItem) as T;
                        this.add(childView, this.length);
                    }
                    
                }
            }
        }
        return this;
    }

    public $children(): IViewElement[] {
        if (!this.hasScalarItems) {
            const result: IViewElement[] = [];
            for (const i of this) {
                const di = i as any;
                result.push(di as IViewElement);
            }
            return result;
        }
        return [];
    }

    public $json(): JsonObj {
        const data: T[] = [];
        if (this.hasScalarItems) {
            for (let idx = 0; idx < this.length; idx++) {
                data[idx] = this[idx];
            }
        } else {
            for (let idx = 0; idx < this.length; idx++) {
                data[idx] = (this[idx] as IViewElement).$json() as T;
            }
        }
        return data as unknown as JsonObj;
    }

    public clone(parent?: IViewElement): Setview<T> {
        const cloneObj = JSON.parse(JSON.stringify(this.$src.obj)) as T[];
        return new Setview<T>(cloneObj, this.$src.type as AType, parent);
    }

    public contains(item: T): boolean {
        return this.indexOf(item) > -1;
    }

    public indexOfPath(path: string): number {
        if (isTextArray(path)) {
            return Number.parseInt(extractContent(path));
        }

        const tt = (this.$src.type as Tarray).itemsTypeDef!.def as any;
        const itemType = tt.type as string;

        const idxObj = isTextObject(path)
            ? decodeSimpleObj(path)
            : (tt as Tobject).buildIndexObjFromSelectorValue(decodeSelector(path));

        for (let idx = 0; idx < this.length; idx++) {
            if (isMatchingSelector((this[idx] as IViewElement).$src.obj, idxObj)) {
                return idx;
            }
        }
        return -1;
    }

    public $edit(forceTracking: boolean = false): SetviewEditor<T> {
        if (forceTracking) {
            this.$trackChange(true);
        }
        if (!this.$editor) {
            JoeLogger.debug(this.$src.type.title + ' -> ' + this.$src.path + ' --- EDIT.');
            const isRoot = this.$isRoot();
            if (!this.$isRoot()) {
                this.$parent().$edit();
            }
            this.$editor = new SetviewEditor<T>(this, this.$src.obj);
            if (isRoot && this.onEditingChanged !== undefined) {
                const type = this.$src.type;
                JoeLogger.debug(
                    this.$src.type.title +
                        ' -> ' +
                        this.$src.path +
                        ' --- IS NOTIFYING ITS EDITING STATE.'
                );

                this.onEditingChanged!();
            }
        }

        return this.$editor;
    }

    /**
     * Is the current item the root of the doc.
     */
    public $isRoot(): boolean {
        return this._parent_ === undefined;
    }
    public $newChild<Ta extends IViewElement>(): Ta {
        const tt = (this.$src.type as Tarray).itemsTypeDef!.def as any;
        const itemType = tt.type as string;
        let child: Ta;
        switch (itemType) {
            case 'array':
                const atype = tt.viewctor as SetviewTypeConstructor;
                child = new atype([], tt as AType, this) as Ta;
                break;
            case 'map':
                const mtype = tt as MapviewType;
                child = new mtype({}, tt as MType, this) as Ta;
                break;
            default:
                const otype = tt.viewctor as ObjviewType;
                child = new otype(undefined, this) as Ta;
                break;
        }
        tt.prepare(child.$src.obj, this.$src.obj, PATH_UNASSIGNED);
        child.$edit();
        return child;
    }

    public $notify(arg: DataPayload) {
        if (
            this._ver_ === NO_NOTIFY ||
            arg.sourcePath === PATH_UNASSIGNED ||
            arg.origin === undefined
        ) {
            return;
        }
        this._ver_++;
        if (this.$isRoot()) {
            JoeLogger.group('SEND NOTIF From View ' + this.$src.type.title);
            JoeLogger.info(arg);
            JoeLogger.endgroup();
            this.$editor!.onViewChanged!.next(arg);
        } else {
            this.$parent().$notify(arg);
        }
    }
    /**
     * Doc parent item.
     */
    public $parent(): IViewElement {
        return this._parent_ || this;
    }

    public onEditingChanged?: () => void;

    public remove(input: T) {
        return this.$edit().remove(input);
    }

    public removeAt(index: number) {
        this.remove(this[index]);
    }

    public $root(): IRootViewElement {
        let parent = this._parent_;
        while (parent && !parent.$isRoot()) {
            if (parent !== parent.$parent()) {
                parent = parent.$parent();
            } else {
                throw new Error('Infinite loop on Objview.$root()!');
            }
        }
        return (parent || this) as IRootViewElement;
    }

    public $release(): void {
        if (!this.hasScalarItems && this.length > 0) {
            this.forEach((item) => (item as IViewElement).$release(), this);
        }
        this.$rules = undefined;
        this.$editor = undefined;
        this._parent_ = undefined;
        MetadataHelper.clearTypeInfo(this);
    }

    public $resetCache(lookupOnly: boolean): void {
        if (!this.$isEditing && !this.hasScalarItems) {
            this.$children().forEach((child) => child.$resetCache(lookupOnly));
        }
    }

    public $refresh(data: T[]): void {
        const src = this.$src;
        const path = src.path;
        const atype = src.type as Tarray;
        if (!src.isRoot) {
            this.$parent().$refreshChild(path, data);
        } else {
            atype.prepare(data, undefined, PATH_ROOT);

            const changeSet = [] as ChangeSet;

            if (this.$isEditing) {
                this.$editor!.writeChangeSet(changeSet);
                this.$editor!.cancelEdit();
            }

            src.obj = data;
            if (!atype.isScalar) {
                this.forEach((value) => (value as IViewElement).$release());
            }
            this.splice(0);
            this.$src.obj = data;

            if (data && atype.itemsTypeDef!.kind === PropertyTypology.Scalar) {
                data.forEach((scalarValue) => this.push(scalarValue));
            } else {
                data.forEach((value, i) => {
                    atype.itemsTypeDef!.prepare(value, undefined, PATH_ROOT);
                    this.push(atype.itemsTypeDef!.readAsView(value, i, this));
                }, this);
            }

            if (changeSet.length > 0) {
                this.$edit().applyChangeSet(changeSet);
            }
        }
    }

    public $refreshChild(property: string, data: T): void {
        const src = this.$src;
        const atype = src.type as Tarray;
        if (!atype.isScalar) {
            return;
        }
        const array = this.$src.obj as any[];

        const index = this.indexOfPath(property);

        const oldData = (this[index] as IViewElement).$src.obj;
        const oldDataIndex = array.indexOf(oldData);
        if (oldData) {
            MetadataHelper.detach(oldData);
        }

        array[oldDataIndex] = data;
        const itemInfo = atype.itemsTypeDef!;
        itemInfo.prepare(array, data, property);

        if (index > -1) {
            this[index] = itemInfo.readAsView(data, oldDataIndex, this) as T;
        }
    }

    public $trackChange(active: boolean): this {
        if (active) {
            if (this._ver_ === NO_NOTIFY) {
                this._ver_ = (this as unknown as any)[setfreezedSym] || 1;
                delete (this as unknown as any)[setfreezedSym];
            }
        } else {
            if (this._ver_ !== NO_NOTIFY) {
                (this as unknown as any)[setfreezedSym] = this._ver_;
                this._ver_ = NO_NOTIFY;
            }
        }

        return this;
    }

    public validate(
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const type = this.$src.type;
        const validationContext = this.$validation;
        type.validate(this, scope, scopeRef);
        if (this.$rules?._ != undefined) {
            const errors = this.$rules!._(this as unknown as Setview<T>);
            if (errors === undefined) {
                validationContext.setItemErrors('_', errors);
            } else {
                for (const [ruleName, validationRule] of Object.entries(errors)) {
                    validationContext.setItemError(
                        '_',
                        ruleName,
                        validationRule as DataObj | undefined
                    );
                }
            }
        }
        corelateValidationWithParents(this);
        validationContext.debug(type.title + ' - ' + scope, this.$isRoot());
        return validationContext;
    }

    public asString(): string {
        return 'Array of ' + this.$src.type.title;
    }
}

ArrayViewFactory.InitializeConstructor(Setview);
