import { I } from '@angular/cdk/keycodes';
import { Subject } from 'rxjs/internal/Subject';
import {
    toArraySelector,
    decodeOneSelector,
    readPath,
    AType,
    BaseProperty,
    PropertyTypology,
    EditCache,
    ChangeSet,
    ChangeStateEnum,
    Scalar,
    ChangeItem,
    MetadataHelper,
    IViewElement,
    IEditor,
    ISetElement,
    JoeLogger,
    SortComparer,
    isBlank,
    DataAction,
    DataOrigin,
    IndexableType,
    isMatchingSelector,
    asRelativePathWithSelector,
    BaseType,
    AnyDef,
    ValidationScopes,
    DataPayload
} from '../core';
import { Tobject, Tarray, ArrayViewFactory } from '../types';
import { Objview } from './objview';

export class SetviewEditor<T extends Scalar | IViewElement> implements IEditor {
    public readonly isNew: any | undefined;
    public onViewChanged?: Subject<DataPayload>;

    constructor(private _setview: ISetElement<T>, private _sourceArray: T[]) {
        this.editCache = { inserted: [], deleted: [], modified: [] };
        const src = _setview.$src;
        const t = src.type as Tarray;
        this.isNew = (src.type as Tarray).isNew(src.obj);
        this.isSortArray = t.hasObjectItems && (t.itemsTypeDef!.def as Tobject<T>).withIndex;
        if (_setview.$isRoot() || this.isNew) {
            this.onViewChanged = new Subject<DataPayload>();
        }
    }

    protected get hasScalarItems(): boolean {
        const type = this._setview.$src.type as Tarray;
        return type.itemsTypeDef!.kind === PropertyTypology.Scalar;
    }

    public isPristine(): boolean {
        return (
            this.editCache.inserted.length === 0 &&
            this.editCache.deleted.length === 0 &&
            this.editCache.modified.length === 0
        );
    }

    public get hasDeletedItem(): boolean {
        return this.editCache.deleted.length > 0;
    }

    private static _LOCATION(
        element: IViewElement,
        array: IViewElement[],
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
                return SetviewEditor._LOCATION(element, array, comparer, start, pivot);
            case 1:
                return SetviewEditor._LOCATION(element, array, comparer, pivot, end);
            default:
                return pivot;
        }
    }
    public isSortArray: boolean;

    public readonly editCache: EditCache<[number, T][]>;

    private _release() {
        this._setview.$editor = undefined;
    }

    public isDirty(property?: string): boolean {
        if (isBlank(property)) {
            return !this.isPristine();
        } else {
            return (
                this.isInsertedItem(property) ||
                this.isDeletedItem(property) ||
                this.isModifiedItem(property)
            );
        }
    }

    public isTouched(): boolean {
        if (!this.isPristine()) {
            return true;
        }
        const children = this._setview.$children() as IViewElement[];
        for (const child of children) {
            if (child.$isEditing) {
                if (child.$editor!.isTouched()) {
                    return true;
                }
            }
        }
        return false;
    }

    public getIndexPath(item: any, index: number): string {
        return (this._setview.$src.type as IndexableType).getIndexPath(item, index);
    }

    public isInsertedItem(item: any): boolean {
        return this.editCache.inserted.some((i) => i[1] === item);
    }

    public indexInfoOfInsertedItem(item: any): [number, number] | undefined {
        for (let index = 0; index < this.editCache.inserted.length; index++) {
            const rec = this.editCache.inserted[index];
            if (rec[1] === item) {
                return [rec[0], index];
            }
        }
        return undefined;
    }

    public isDeletedItem(item: any): boolean {
        return this.editCache.deleted.some((i) => i[1] === item);
    }

    public indexInfo(item: any): [number, number] | undefined {
        for (let index = 0; index < this.editCache.deleted.length; index++) {
            const rec = this.editCache.deleted[index];
            if (rec[1] === item) {
                return [rec[0], index];
            }
        }
        return undefined;
    }

    public indexInfoOfDeletedItem(item: any): [number, number] | undefined {
        for (let index = 0; index < this.editCache.deleted.length; index++) {
            const rec = this.editCache.deleted[index];
            if (rec[1] === item) {
                return [rec[0], index];
            }
        }
        return undefined;
    }

    public indexInfoOfDeletedIndexObj(idxObj: {}): [number, T] | undefined {
        for (let index = 0; index < this.editCache.deleted.length; index++) {
            const rec = this.editCache.deleted[index];
            if (isMatchingSelector((rec[1] as IViewElement).$src.obj, idxObj)) {
                return rec;
            }
        }
        return undefined;
    }

    public isModifiedItem(item: any): boolean {
        return this.editCache.modified.some((i) => i[1] === item);
    }

    public indexInfoOfModified(index: number): [number, T] | undefined {
        for (let index = 0; index < this.editCache.modified.length; index++) {
            const rec = this.editCache.modified[index];
            if (rec[0] === index) {
                return rec;
            }
        }
        return undefined;
    }

    public itemChangeState(item: any): ChangeStateEnum {
        if (this.isInsertedItem(item)) {
            return ChangeStateEnum.inserted;
        } else if (this.isDeletedItem(item)) {
            return ChangeStateEnum.deleted;
        } else if (this.isModifiedItem(item)) {
            return ChangeStateEnum.updated;
        }
        return ChangeStateEnum.none;
    }

    public validate(): string[] | undefined {
        return undefined;
    }

    public add(input: T, index: number = -1): ISetElement<T> {
        if (this._setview.indexOf(input) > -1) {
            return this._setview;
        }
        let isRollback = false;
        const indexInfoIfDeleted = this.indexInfoOfDeletedItem(input);
        isRollback = indexInfoIfDeleted !== undefined;
        if (isRollback) {
            this.editCache.deleted.splice(indexInfoIfDeleted![1], 1);
            index = indexInfoIfDeleted![0] -1
        }
        if (this.isSortArray) {
            const otype = (this._setview.$src.type as Tarray).itemsTypeDef!.def as Tobject;
            const comparer = otype.index!.sort
                ? ArrayViewFactory.PropertiesComparer(otype.index!.sort as string[])
                : ArrayViewFactory.PropertiesComparer(otype.index!.id as string[]);
            index = this.getPushIndex(input as IViewElement, comparer);
        }

        if (index === -1) {
            index = this._setview.length;
            index = this._setview.push(input);
        } else {
            this._setview.splice(index, 0, input);
        }

        let path = toArraySelector(index);
        if (!this._setview.hasScalarItems) {
            const tmp = input as any;
            const childView = tmp as IViewElement;
            if ((childView.$src.type as IndexableType).withIndex) {
                path = (childView.$src.type as IndexableType).getIndexPath(childView);
            }
            this._setview.$src.setParentChildView(childView, path);
        }
        if (!isRollback) {
            this.editCache.inserted.push([index, input]);
        }
        this._setview.validate(ValidationScopes.AddChild, path);

        this._setview.$notify({
            action: DataAction.Added,
            sourcePath: this._setview.$src.path,
            dataPath: path,
            origin: DataOrigin.code
        });
        return this._setview;
    }

    public update(index: number, input: T): ISetElement<T> {
        const src = this._setview.$src;
        const atype = src.type as Tarray;
        if (atype.isTuple) {
            const modifRec = this.indexInfoOfModified(index);
            const valueType = (atype.itemsTypeDef!.def as (AnyDef & BaseType)[])[index] as AnyDef &
                BaseType;
            this._setview[index] = input;
            if (modifRec) {
                modifRec[1] = input;
            } else {
                this.editCache.modified.push([index, input]);
            }
        }
        return this._setview;
    }

    public remove(input: T): ISetElement<T> {
        const index = this._setview.indexOf(input);
        if (index === -1) {
            return this._setview;
        }
        const indexInfoIfInserted = this.indexInfoOfInsertedItem(input);
        let path = toArraySelector(index);
        if (!this._setview.hasScalarItems) {
            const childView = input as IViewElement;
            if ((childView.$src.type as IndexableType).withIndex) {
                path = (childView.$src.type as IndexableType).getIndexPath(childView);
            }
        }
        let doRemove = index > -1;
        let registerRemove = isBlank(indexInfoIfInserted);
        if (doRemove && !registerRemove) {
            this.editCache.inserted.splice(indexInfoIfInserted![1], 1);
        }
        if (doRemove) {
            this._setview.splice(index, 1);
            this._setview.validate(ValidationScopes.RemoveChild, path);
        }
        if (registerRemove) {
            this.editCache.deleted.push([index, input]);
            this._setview.$notify({
                action: DataAction.Removed,
                sourcePath: this._setview.$src.path,
                dataPath: '' + index,
                origin: DataOrigin.code
            });
        }

        this._setview.$notify({
            action: DataAction.Removed,
            sourcePath: this._setview.$src.path,
            dataPath: path,
            origin: DataOrigin.code
        });
        return this._setview;
    }

    public endEdit(fromParent: boolean = false): any {
        if (!fromParent) {
            const rootView = this._setview.$root();
            return rootView.$editor!.endEdit(true);
            if (rootView.onEditingChanged !== undefined) {
                rootView.onEditingChanged!();
            }
        } else {
            const type = this._setview.$src.type as AType;
            JoeLogger.indent();
            JoeLogger.action('End Edit', type.title);

            if (!this.hasScalarItems) {
                this._setview.forEach((item: any) => {
                    const docElement = item as IViewElement;
                    if (docElement.$isEditing) {
                        docElement.$editor!.endEdit(true);
                    }
                });
            }
            this._sourceArray.splice(0);
            if (this._setview.length > 0) {
                if (this.hasScalarItems) {
                    this._setview.forEach((s: T) => this._sourceArray.push(s));
                } else {
                    (this._setview as unknown as IViewElement[]).forEach(
                        (s) => this._sourceArray.push(s.$src.obj),
                        this
                    );
                }
            }
            JoeLogger.action('Editor release', type.title);
            JoeLogger.unindent();
            const result = this._sourceArray;
            this._release();
            return result;
        }
    }

    public cancelEdit(fromParent: boolean = false) {
        if (!fromParent) {
            const rootView = this._setview.$root();
            rootView.$editor!.cancelEdit(true);
            rootView.validate(ValidationScopes.EnforceState);
            if (rootView.onEditingChanged !== undefined) {
                rootView.onEditingChanged!();
            }
        } else {
            const src = this._setview.$src;
            const type = src.type as Tarray;
            const array = this._setview.$src.obj as T[];
            if (type.hasObjectItems) {
                const elements = [
                    ...(this._setview as unknown as IViewElement[]),
                    ...this.editCache.deleted.map((d) => d[1] as unknown as IViewElement)
                ];
                elements
                    .filter((value) => !this.isInsertedItem(value))
                    .filter((value) => (value as IViewElement).$isEditing)
                    .forEach((value) => (value as IViewElement).$editor!.cancelEdit(true), this);

                this._setview.splice(0);
                this._sourceArray.forEach(
                    (value) => this._setview.push(elements.find((e) => e.$src.obj === value)),
                    this
                );

                this.editCache.inserted.forEach(
                    (value) => (value[1] as IViewElement).$release(),
                    this
                );
            } else {
                this._setview.splice(0);
                this._sourceArray.forEach((value) => this._setview.push(value), this);
            }
            this._setview.$validation.clear();
        }

        this._release();
    }

    public getPushIndex(item: IViewElement, comparer: SortComparer): number {
        const array = this._setview as any;
        return SetviewEditor._LOCATION(item, array as IViewElement[], comparer);
        // return index === 0
        //     ? 0
        //     : index + 1;
    }
    public writeChangeSet(changeset: ChangeSet): void {
        const src = this._setview.$src;
        const atype = src.type as Tarray;
        const [relativePath, selector] = asRelativePathWithSelector(src.path);
        if (this.isNew) {
            changeset.push({
                op: ChangeStateEnum.inserted,
                path: relativePath,
                obj: this._setview.$json(),
                selector
            });
            return;
        }
        const scalarItems = atype.hasScalarItems;
        const multiDim = atype.isMultiDimension;
        if (this.editCache.deleted.length > 0) {
            for (const [deleletedIndex, deleletedView] of this.editCache.deleted) {
                if (scalarItems) {
                    changeset.push({
                        op: ChangeStateEnum.deleted,
                        path: this._setview.$src.path,
                        selector: toArraySelector(deleletedIndex),
                        obj: deleletedView
                    });
                } else if (MetadataHelper.asView(deleletedView)) {
                    const delInfo = deleletedView.$src;
                    if ((delInfo.type as IndexableType).withIndex) {
                        changeset.push({
                            op: ChangeStateEnum.deleted,
                            path: this._setview.$src.path,
                            selector: (delInfo.type as IndexableType).getIndexPath(
                                deleletedView,
                                deleletedIndex
                            ),
                            obj: deleletedView.$json
                        });
                    } else {
                        changeset.push({
                            op: ChangeStateEnum.deleted,
                            path: this._setview.$src.path,
                            selector: toArraySelector(deleletedIndex),
                            obj: delInfo.obj
                        });
                    }
                }
            }
        }
        if (scalarItems) {
            if (this.editCache.inserted.length > 0) {
                for (const [newScalarIndex, newScalarValue] of this.editCache.inserted) {
                    changeset.push({
                        op: ChangeStateEnum.inserted,
                        path: this._setview.$src.path,
                        selector: toArraySelector(newScalarIndex),
                        obj: newScalarValue
                    });
                }
            }
        } else {
            for (const viewItem of this._setview as unknown as IViewElement[]) {
                if (viewItem.$isEditing) {
                    const insertedIndexInfo = this.indexInfoOfInsertedItem(viewItem);
                    if (insertedIndexInfo) {
                        changeset.push({
                            op: ChangeStateEnum.inserted,
                            path: viewItem.$src.path,
                            selector: atype.getIndexPath(viewItem, insertedIndexInfo[0]),
                            obj: viewItem.$src.obj
                        });
                    }
                    viewItem.$editor!.writeChangeSet(changeset);
                }
            }
        }
    }
    public applyChangeSet(changeset: ChangeSet): void {
        if (changeset.length === 1) {
            this._applyChange(changeset[0]);
        } else {
            for (const change of changeset) {
                this._applyChange(change);
            }
        }
    }
    private _applyChange(change: ChangeItem): void {
        const src = this._setview.$src;
        const atype = src.type as Tarray;
        const scalarItems = atype.hasScalarItems;
        if (change.path === src.path) {
            switch (change.op) {
                case ChangeStateEnum.inserted:
                    if (scalarItems) {
                        this._setview.add(change.obj as T, -1);
                    } else if (atype.isTuple) {
                        this._setview.add(change.obj, decodeOneSelector(change.selector as string));
                    } else if (atype.isMultiDimension) {
                        const newItemSet = this._setview.$newChild();
                        this._setview.add(newItemSet as T, -1);
                    } else {
                        const newItem = this._setview.$newChild();
                        if (newItem instanceof Objview) {
                            newItem.$assign(change.obj);
                        }
                        this._setview.add(newItem as T, -1);
                    }
                    break;
                case ChangeStateEnum.deleted:
                    if (scalarItems) {
                        this._setview.remove(change.obj as T);
                    } else {
                        this._setview.removeAt(this._setview.indexOfPath(change.selector!));
                    }
                    break;
            }
            if (change.op === ChangeStateEnum.updated || change.op === ChangeStateEnum.inserted) {
                this._setview.$assign(change.obj);
            }
        } else {
            const root = src.root().obj as IViewElement;
            const target = readPath(root, change.path) as IViewElement;
            if (target) {
                target.$edit().applyChangeSet([change]);
            }
        }
    }
}
