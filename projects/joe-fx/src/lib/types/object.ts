import {
    asObject,
    asString,
    isAssigned,
    isStringAssigned,
    MetadataHelper,
    readTypeName,
    MessageDomain,
    MessageTypology,
    RuntimeMessage,
    RuntimeSummary,
    PATH_LOCAL,
    PATH_ROOT,
    AType,
    AnyDef,
    BaseType,
    IndexDef,
    MType,
    OType,
    ObjectDef,
    ObjviewType,
    PropertiesInfo,
    PropertyTypology,
    StringMap,
    ValidationRule,
    Properties,
    ElementValidationState,
    PartialPropertiesDef,
    readPath,
    toPath,
    PATH_NEXT,
    isViewElement,
    AsyncValidationRule,
    DataAction,
    DataOrigin,
    XType,
    XObjectDef,
    ElementErrorResults,
    Property,
    CoreEntityTypeBehaviour,
    JsonObj,
    isArray,
    JoeLogger,
    isBlank,
    asArray,
    ValidationState,
    DataObj,
    ASYNCRULE_RUNNING,
    isObjAssigned,
    normalizePath,
    PATH_UNASSIGNED,
    encodeSelector,
    toIndexSelector,
    ValidationScopes,
    isDataAssigned,
    PropertyDef
} from '../core';

import { TobjectArrayItemProperty } from './object-property.array';
import { TobjectMapProperty } from './object-property.map';
import { TobjectSimpleProperty } from './object-property.simple';
import { TypeFactory } from './factory-type';
import { ObjectTypeFactory } from './factory-otype';
import { TxobjectSimpleProperty } from './object-property.xsimple';
import { corelateValidationWithParents } from './common';

function asSimplePath(path: string): string {
    return path.lastIndexOf(PATH_NEXT) < 2 && path.startsWith(PATH_LOCAL + PATH_NEXT)
        ? path.substring(2)
        : path;
}

RuntimeMessage.Register('asyncrule', (args) => {
    return args['running'] === true
        ? `Asynchronous validation is running...`
        : `Runtime Error: ${args['error']}`;
});

/**
 * Type definition for an Object.
 *
 * Reminder: An Object is an instance having properties at the opposite of an
 * Array that is a set of scalar values or Object references.
 * Tobject<T = any> is a class that receives on its constructor a type definition for a specific data interface
 *  and a name. It return an Tobtect<T> instance that will enforce the type validation for this scpecific interface.
 * @param typeDef {ObjectDef<T>} type definition for the data interface T
 */
export class Tobject<T = any> implements OType<T> {
    constructor(typeDef: ObjectDef<T>, name?: string) {
        this.type = 'object';
        this.isScalar = false;
        this.title = name || typeDef.title;
        this.required = typeDef.required;
        this.needHoisting = false;
        this.properties = typeDef.properties;
        this.rules = {};
        this.asyncrules = {};
        const propertiesInfo: PropertiesInfo = {};
        const indexInfo: IndexDef = { id: '' };
        this._buildObjectType(typeDef.extends, propertiesInfo, indexInfo, this.required);
        this._buildPropertyType(typeDef.properties, propertiesInfo, this.required);

        this._buildObjectTypeIndex(indexInfo, typeDef.index);

        const propNames = Object.keys(propertiesInfo);
        const sortedPropNames = propNames.sort((a, b) => ~~(a > b));
        const properties: any = {};

        for (let i = 0; i < sortedPropNames.length; i++) {
            const propName = sortedPropNames[i];
            const propInfo = propertiesInfo[propName];
            properties[propName] = propInfo;
            if (!this.needHoisting && propInfo.kind !== PropertyTypology.Scalar) {
                this.needHoisting = true;
            }
        }
        this.allProperties = properties;

        if (indexInfo.id) {
            this.index = indexInfo;
        }
    }

    public get withIndex(): boolean {
        return this.index !== undefined;
    }

     /**
     * Merge any inherited or new index definition or index property.
     * @param index : Index Option.
     * @param def : Index definition.
     * @return : Index definition.
     */
    private _buildObjectTypeIndex(index: IndexDef, def?: IndexDef): void {
        // TODO : Gerer le cas d'extrends
        if (def) {
            index.id = asString(def.id)
                ? [normalizePath(def.id)]
                : def.id.map((s) => normalizePath(s));
            if (def.rev) {
                index.rev = normalizePath(def.rev);
            }
            if (def.sort) {
                index.sort = asString(def.sort) ? [def.sort] : def.sort;
            }
        }
    }

    /**
     * Merge source properties into propertiesInfo map.
     * @param source : source object type.
     * @param propertiesInfo : property definition collector.
     */
    private static _importPropertyDefs<T>(
        source: OType<any>,
        propertiesInfo: PropertiesInfo
    ): void {
        for (const propName in source.allProperties) {
            if (propertiesInfo[propName] === undefined) {
                propertiesInfo[propName] = source.allProperties[propName];
            }
        }
    }
    /**
     * Merge input properties definition into propertiesInfo map.
     * @param propertiesDef : properties definition.
     * @param propertiesInfo : property definition collector.
     */
    private _buildPropertyType<T>(
        propertiesDef: PartialPropertiesDef<T>,
        propertiesInfo: PropertiesInfo,
        required: (keyof T)[]
    ): void {
        if (isAssigned(propertiesDef)) {
            for (const propName in propertiesDef) {
                // if (propertiesInfo[propName] === undefined) {
                    const propDef = propertiesDef[propName];
                    const propPair: [AnyDef, boolean] = [
                        propDef as AnyDef,
                        required.includes(propName as keyof T)
                    ];
                    if (TobjectMapProperty.Matches(propPair[0])) {
                        propertiesInfo[propName] = new TobjectMapProperty(
                            propName,
                            TypeFactory.TYPEDEF(propPair[0] as AnyDef) as MType,
                            propPair[1]
                        );
                    } else if (TxobjectSimpleProperty.Matches(propPair[0])) {
                        propertiesInfo[propName] = new TxobjectSimpleProperty(
                            propName,
                            TypeFactory.XTYPEDEF(propPair[0] as XObjectDef) as XType,
                            propPair[1]
                        );
                    } else if (TobjectSimpleProperty.Matches(propPair[0])) {
                        const simpleDef =
                            propPair[0].title === this.title
                                ? this
                                : (TypeFactory.TYPEDEF(propPair[0]) as AnyDef & BaseType);
                        propertiesInfo[propName] = new TobjectSimpleProperty(
                            propName,
                            simpleDef,
                            propPair[1]
                        );
                    } else if (TobjectArrayItemProperty.Matches(propPair[0])) {
                        propertiesInfo[propName] = new TobjectArrayItemProperty(
                            propName,
                            TypeFactory.TYPEDEF(propPair[0] as AnyDef) as AType,
                            propPair[1]
                        );
                    }
                // }
            }
        }
    }
    /**
     * Create a PropertyInfo into a PropertiesInfo form one or few ObjectDef
     * @param exts input ObjectDef
     * @param propertiesInfo global PropertirsInfo context
     * @param indexInfo extra indefInfo
     */
    private _buildObjectType<T>(
        exts: ObjectDef[] | undefined,
        propertiesInfo: PropertiesInfo,
        indexInfo: IndexDef,
        required: (keyof T)[]
    ): void {
        if (exts) {
            exts.forEach((baseSch) => {
                if (baseSch instanceof Tobject) {
                    Tobject._importPropertyDefs<T>(baseSch, propertiesInfo);
                } else {
                    this._buildObjectType<T>(baseSch.extends, propertiesInfo, indexInfo, required);

                    this._buildPropertyType<T>(baseSch.properties, propertiesInfo, required);
                }
                this._buildObjectTypeIndex(indexInfo, baseSch.index);
            });
        }
    }
    public readonly isScalar: boolean;
    public readonly allProperties: Properties<T>;
    public viewctor?: ObjviewType;
    public extends?: ObjectDef[];
    public type: 'object';
    public properties: PartialPropertiesDef<T>;
    public required: (keyof T)[];
    public rules: { [P in keyof T]?: ValidationRule<T> } & { _?: ValidationRule<T> };
    public asyncrules: { [P in keyof T]?: AsyncValidationRule<T> } & {
        _?: AsyncValidationRule<T>;
    };
    /**
     * Index definition :
     * 'id' fields goes fotsthe technical index
     * and
     * 'key' fiels goes for the business index.
     */
    public index?: IndexDef;
    /**
     * Class name matching the object definition. 'title' matches with json schema specs.
     */
    public title: string;
    /**
     * Flag to indicate if objview's instance need a local cache for object or array properties
     */
    public needHoisting: boolean;

    /**
     * Extract index {'.>[0]': 'xxx'} from obj (Xxx)
     */
    public buildIndexObjFromSelectorValue(value: string | number | (string | number)[]): any {
        const index = {} as any;
        if (asArray<string | number>(value)) {
            (this.index!.id as string[]).forEach((p, idx) => (index[p] = value[idx]));
        } else {
            index[this.index!.id[0]] = value;
        }

        return index;
    }

    /**
     * Extract index {id: 'xxx'} from obj { id: 'xxx', label:'tyty' }
     */
    public getObjDescription(obj: any): string {
        let result: string | null = null;
        if (isAssigned(obj) && this.withIndex) {
            const sortProperties = this.index!.sort as string[];
            if (
                !isStringAssigned(sortProperties) ||
                sortProperties.some((s) => s.toLowerCase().includes('date'))
            ) {
                const idProperties = this.index!.id as string[];
                for (const idProperty of idProperties) {
                    if (idProperty.startsWith(PATH_LOCAL)) {
                        result =
                            result === null
                                ? readPath(obj, idProperty)
                                : result + ', ' + readPath(obj, idProperty);
                    } else {
                        result =
                            result === null ? obj[idProperty] : result + ', ' + obj[idProperty];
                    }
                }
            } else {
                for (const sortProperty of sortProperties) {
                    if (sortProperty.startsWith(PATH_LOCAL)) {
                        result =
                            result === null
                                ? readPath(obj, sortProperty)
                                : result + ', ' + readPath(obj, sortProperty);
                    } else {
                        result =
                            result === null ? obj[sortProperty] : result + ', ' + obj[sortProperty];
                    }
                }
            }
        }
        if (result === null) {
            result = this.title;
        }
        return result;
    }

    /**
     * Return index obj {id: 'xxx'} from 'xxx'
     * @param obj from where index should be extract;
     */
    public getIndexObjFromValue(obj: any | any[]): JsonObj {
        const index: StringMap<any> = {};
        const idDef = this.index!.id;
        if (!idDef) {
            throw new Error('No index for ' + this.title);
        } else if (asString(idDef)) {
            index[normalizePath(idDef)] = obj;
        } else {
            if (idDef.length === 1) {
                const normalizedPath = normalizePath(idDef[0]);
                index[normalizedPath] = isArray(obj) ? obj[0] : obj;
            } else {
                const idValues = obj as any[];
                idDef.forEach((idName, idx) => {
                    index[asSimplePath(idName)] = idValues[idx];
                });
            }
        }
        return index;
    }

    public isNew(obj: any): boolean {
        if (!isBlank(obj)) {
            for (const [propName, propInfo] of Object.entries(this.allProperties)) {
                if ((propInfo as Property).required && isBlank(obj[propName])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * turn { id: 'xxx' } into '{#xxx, yyy}'
     */
    public getIndexPath(obj: any, index?: number): string {
        if (!this.withIndex) {
            return index === undefined ? '' : `${index}`;
        }
        const idDef = this.index!.id;
        let indexVal = this.getIndexValue(obj);
        const indexContent = encodeSelector(indexVal);
        return isStringAssigned(indexContent) ? toIndexSelector(indexContent) : '';
    }

    public getIndexValue(obj: any): string | number | (string | number)[] {
        if (!this.withIndex) {
            return '';
        }
        const idDef = this.index!.id;

        if (idDef) {
            if (asString(idDef)) {
                return readPath(obj, normalizePath(idDef));
            } else {
                if (idDef.length === 1) {
                    return readPath(obj, normalizePath(idDef[0]));
                } else {
                    return idDef.map<string | number>((s) => readPath(obj, normalizePath(s)));
                }
            }
        }
        return '';
    }

    public getRevValue(obj: any): string | number {
        return this.index && this.index.rev ? readPath(obj, normalizePath(this.index.rev)) : '';
    }

    public getDocId(obj: any): string | number {
        if (!this.withIndex) {
            throw console.error('Doc is a single id value !');
        }
        const idDef = this.index!.id;

        if (idDef) {
            if (asString(idDef)) {
                return readPath(obj, normalizePath(idDef));
            } else {
                if (idDef.length === 1) {
                    return readPath(obj, normalizePath(idDef[0]));
                } else {
                    throw console.error('Doc is a single id value !');
                }
            }
        }
        throw console.error('Doc is a single id value !');
    }

    public setIndex(index: IndexDef): this {
        this.index = index;
        return this;
    }

    /**
     * This method visit an object graph and set for each node (Object or Array) a DataInfo definition through a Symbol property.
     * Using a Symbol won't alter its Json serialization
     * The new DataInfo property provides several information about the json node type definiton:
     * - The type instance that rule the data object
     * - A reference to its parent if any
     * - The path that identify the node in the json hierarchy
     * @param target instance to prepare (required).
     * @param parent parent instance if any (optional).
     * @param path the path route of the current node in the hierarchy.
     */
    public prepare(obj: any, parent?: any, path: string = PATH_ROOT) {
        if (obj) {
            const notPrepared = MetadataHelper.isNotPrepared(obj);

            const objInfo = MetadataHelper.getTypeInfoSafe(obj, this);
            if (parent && (notPrepared || objInfo.detached)) {
                const parentInfo = MetadataHelper.getTypeInfo(parent);
                if (path != PATH_UNASSIGNED) {
                    if (parentInfo.isArray && this.withIndex) {
                        path = this.getIndexPath(obj);
                    }
                }
                const childPath = parentInfo.childPath(path);
                // JoeLogger.debug(childPath);
                objInfo.setParent(childPath, parentInfo);
            } else if (!parent && (notPrepared || objInfo.detached)) {
                objInfo.setPath(PATH_ROOT);
                // JoeLogger.header(objInfo.type.title);
            }
            if (notPrepared) {
                for (const [propName, propInfo] of Object.entries(this.allProperties)) {
                    if ((propInfo as unknown as CoreEntityTypeBehaviour).prepare) {
                        (propInfo as unknown as CoreEntityTypeBehaviour).prepare(
                            obj,
                            parent,
                            propName
                        );
                    }
                }
            }
        }
    }

    public unprepare(obj: any) {
        if (obj && typeof obj === 'object') {
            const objInfo = MetadataHelper.getTypeInfo(obj);
            if (objInfo) {
                for (const [propName, propInfo] of Object.entries(this.allProperties)) {
                    if ((propInfo as unknown as CoreEntityTypeBehaviour).unprepare) {
                        (propInfo as unknown as CoreEntityTypeBehaviour).unprepare(obj[propName]);
                    }
                }

                objInfo.release();
                MetadataHelper.clearTypeInfo(obj);
            }
        }
    }

    /**
     * Check the validity of an object instance on the current schema.
     * @param subject instance to validate (required).
     * @returns ValidationResult, map of errors by property name;
     */
    public validateAsync(
        subject: any,
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: string | boolean | object
    ): void {
        const validationContext = isViewElement(subject)
            ? (subject.$validation as ElementValidationState<T>)
            : new ElementValidationState<T>();

        const withScope = isStringAssigned(scopeRef);
        if (
            asObject(subject) &&
            MetadataHelper.getTypeInfo(subject).attached &&
            isObjAssigned(this.asyncrules)
        ) {
            for (const [asyncRuleName, asyncValidationRule] of Object.entries(this.asyncrules)) {
                if (
                    asyncRuleName === '_' ||
                    !withScope ||
                    (withScope && scopeRef === asyncRuleName)
                ) {
                    validationContext.setItemErrors(asyncRuleName, ASYNCRULE_RUNNING);
                    if (MetadataHelper.asView(subject)) {
                        corelateValidationWithParents(subject);
                        subject.$notify({
                            action: DataAction.Validation,
                            sourcePath: subject.$src.path,
                            dataPath: asyncRuleName,
                            origin: DataOrigin.code
                        });
                    }

                    asyncValidationRule(subject as T)
                        .then((asyncResult) => {
                            validationContext.setItemErrors(asyncRuleName, asyncResult);
                            if (MetadataHelper.asView(subject)) {
                                corelateValidationWithParents(subject);
                                subject.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: subject.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            }
                        })
                        .catch((err) => {
                            validationContext.setItemErrors(asyncRuleName, {
                                asyncrule: { running: false, error: err }
                            } as DataObj);
                            if (MetadataHelper.asView(subject)) {
                                corelateValidationWithParents(subject);
                                subject.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: subject.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            }
                        });
                } else if (validationContext.errors[asyncRuleName] === undefined) {
                    validationContext.setItemErrors(asyncRuleName, ASYNCRULE_RUNNING);
                    if (MetadataHelper.asView(subject)) {
                        corelateValidationWithParents(subject);
                        subject.$notify({
                            action: DataAction.Validation,
                            sourcePath: subject.$src.path,
                            dataPath: asyncRuleName,
                            origin: DataOrigin.code
                        });
                    }

                    asyncValidationRule(subject as T)
                        .then((asyncResult) => {
                            validationContext.setItemErrors(asyncRuleName, asyncResult);
                            if (MetadataHelper.asView(subject)) {
                                corelateValidationWithParents(subject);
                                subject.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: subject.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            }
                        })
                        .catch((err) => {
                            validationContext.setItemErrors(asyncRuleName, {
                                asyncrule: { running: false, error: err }
                            } as DataObj);
                            if (MetadataHelper.asView(subject)) {
                                corelateValidationWithParents(subject);
                                subject.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: subject.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            }
                        });
                }
            }
        }
    }

    public validate(
        subject: any,
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const validationContext = isViewElement(subject)
            ? (subject.$validation as ElementValidationState<T>)
            : new ElementValidationState<T>();

        if (!validationContext.initialized || scope !== ValidationScopes.State) {
            if (asObject(subject)) {
                const typename = readTypeName(subject);
                const badtype =
                    typename !== 'object' && typename !== this.title
                        ? ({ _badtype: { typedef: this.title } } as DataObj)
                        : undefined;
                validationContext.setItemErrors('_', badtype);
                // #region obj property validation scan
                for (const [propName, propInfo] of Object.entries(this.allProperties)) {
                    if (scope === ValidationScopes.Property && propName !== scopeRef) {
                        continue;
                    }

                    const propValue = subject[propName];
                    if (
                        validationContext.matchesRequiredConstraint(
                            propName as keyof T | '_',
                            (propInfo as Property).required,
                            propValue
                        )
                    ) {
                        const isOptionalPristineChild =
                            !(propInfo as Property).required &&
                            asObject(propValue) &&
                            MetadataHelper.asView(propValue) &&
                            !propValue.$isRoot() &&
                            ((propValue.$isEditing && propValue.$editor!.isPristine()) ||
                                !propValue.$isEditing);

                        if (!isOptionalPristineChild) {
                            (propInfo as Property).validate(
                                validationContext,
                                propValue,
                                scope,
                                propName
                            );
                        }
                    }
                }
                // #endregion
                // #region Type validation scan
                if (MetadataHelper.getTypeInfo(subject).attached) {
                    if (isObjAssigned(this.rules)) {
                        for (const [ruleName, validationRule] of Object.entries(this.rules)) {
                            if (ruleName === '_' && !validationContext.withError()) {
                                validationContext.setItemErrors(
                                    ruleName,
                                    validationRule!(subject as T)
                                );
                            } else if (validationContext.errors[ruleName] === undefined) {
                                validationContext.setItemErrors(
                                    ruleName,
                                    validationRule!(subject as T)
                                );
                            }
                        }
                    }
                }
            } else {
                validationContext.setItemErrors('_', { _badtype: { typedef: this.title } });
            }
        }
        validationContext.initialized = true;
        return validationContext;
    }

    public defaultValue(): any {
        const json: JsonObj = {};
        MetadataHelper.unsureTypeInfo(json, this);
        for (const propName in this.allProperties) {
            if (this.allProperties.hasOwnProperty(propName)) {
                const propDef = this.allProperties[propName];
                if (propDef.kind === PropertyTypology.Scalar) {
                    json[propName] = propDef.defaultValue();
                } else if (propDef.required) {
                    json[propName] = propDef.defaultValue();
                }
            }
        }
        // this.prepare(json);
        return json;
    }

    public fillValidationSummary(
        objErrors: StringMap,
        summary: RuntimeSummary,
        path: string
    ): RuntimeSummary {
        for (const propName in objErrors) {
            if (objErrors.hasOwnProperty(propName)) {
                const errorDefs = objErrors[propName];
                const propType = this.properties[propName as keyof T];
                const errorSource = [path, propName];
                const propPath = toPath(errorSource);
                if (propType) {
                    if (Array.isArray(propType)) {
                        const propSchema0 = propType[0] as any;
                        if (propSchema0 && propSchema0.fillValidationSummary) {
                            propSchema0.fillValidationSummary(errorDefs, summary, propPath);
                        }
                    } else {
                        const schema = propType as any;
                        if (schema.fillValidationSummary) {
                            schema.fillValidationSummary(errorDefs, summary, propPath);
                        } else {
                            for (const errorFacet in errorDefs) {
                                if (errorDefs.hasOwnProperty(errorFacet)) {
                                    const errorDef = errorDefs[errorFacet];
                                    const msg = RuntimeMessage.ErrorText(errorFacet, errorDef);
                                    summary.push(
                                        new RuntimeMessage(
                                            msg,
                                            MessageDomain.VALIDATION,
                                            errorSource,
                                            MessageTypology.Error,
                                            errorDef
                                        )
                                    );
                                }
                            }
                        }
                    }
                } else {
                    const errorDef = errorDefs._;
                    const msg = RuntimeMessage.ErrorText(propName, errorDefs);
                    summary.push(
                        new RuntimeMessage(
                            msg,
                            MessageDomain.VALIDATION,
                            errorSource,
                            MessageTypology.Error,
                            errorDef
                        )
                    );
                }
            }
        }
        return summary;
    }
}

ObjectTypeFactory.InitializeConstructor(Tobject);
