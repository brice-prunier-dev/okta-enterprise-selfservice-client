import {
    ObjectDef,
    IViewElement,
    StringMap,
    NumberPattern,
    Tstring,
    Tnumber,
    Tobject,
    Objview,
    Tarray,
    Setview,
    Tmap,
    Mapview,
    ArrayDef,
    AnyDef,
    TupleDef,
    ISetElement,
    StringDef,
    TarrayTupleItem,
    SetviewTypeConstructor
} from 'joe-fx';

export const STR_DEF: StringDef = {
    type: 'string',
    title: 'S_FREE',
    minlength: 1,
    maxlength: 4000
};

export const STR_TYPE = new Tstring(STR_DEF);

export const STR_ARRAY_DEF: ArrayDef = {
    type: 'array',
    title: 'string_t_array_0_n',
    minlength: 0,
    maxlength: Number.MAX_SAFE_INTEGER,
    items: STR_TYPE
};

export const STR_ARRAY_TYPE = new Tarray<string>(STR_ARRAY_DEF);

export const INT_TYPE = new Tnumber({
    type: 'number',
    title: 'INT',
    pattern: NumberPattern.INT,
    default: 0,
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER
});

export interface RelationDefData {
    type: string;
    rev?: string;
    href: string;
    path: string;
    title: string;
}
export interface RelationLookupLocalData<T> extends RelationDefData {
    value?: T;
}
const RelationDefDef: ObjectDef<RelationDefData> = {
    type: 'object',
    title: 'relationdef_type',
    properties: {
        type: STR_TYPE,
        rev: STR_TYPE,
        href: STR_TYPE,
        path: STR_TYPE,
        title: STR_TYPE
    },
    required: ['type', 'href', 'path', 'title'],
    index: {
        id: 'href',
        sort: ['kind']
    }
};

function RelationLookupLocalDefFactory<T>(
    lkpType: ObjectDef<T>
): ObjectDef<RelationLookupLocalData<T>> {
    return {
        type: 'object',
        title: 'relationlookup_' + lkpType.title,
        extends: [RelationDefDef],
        properties: {
            value: lkpType
        },
        required: [...RelationDefDef.required]
    };
}

export const RelationDefType = new Tobject(RelationDefDef);
export class RelationDefView extends Objview<RelationDefData> implements RelationDefData {
    constructor(entity?: any, parent?: IViewElement) {
        super(RelationDefType, entity, parent);
    }
    type!: string;
    rev?: string;
    href!: string;
    path!: string;
    title!: string;
}
RelationDefType.viewctor = RelationDefView;

//
// ─── ADDRRESS ───────────────────────────────────────────────────────────────────
//

export interface AddressData {
    oid: string;
    kind: string;
    city: string;
    num: number;
    street: string;
    info?: string;
}
const AddressDef: ObjectDef<AddressData> = {
    type: 'object',
    title: 'address_type',
    properties: {
        oid: STR_TYPE,
        kind: STR_TYPE,
        city: STR_TYPE,
        num: INT_TYPE,
        street: STR_TYPE,
        info: STR_TYPE
    },
    required: ['oid', 'kind', 'city', 'street'],
    index: {
        id: 'oid',
        sort: ['oid', 'kind', 'city', 'street', 'num']
    }
};

export const AddressType = new Tobject(AddressDef);
export const AddressCollectionType = new Tarray({
    type: 'array',
    title: 'address_t_array_0_n',
    minlength: 0,
    maxlength: 4,
    items: AddressType
});

export const AddressMapType = new Tmap({
    type: 'map',
    title: 'address_map',
    minlength: 0,
    maxlength: Number.MAX_SAFE_INTEGER,
    items: AddressType
});
export class AddressView extends Objview<AddressData> implements AddressData {
    constructor(entity?: any, parent?: IViewElement) {
        super(AddressType, entity, parent);
    }
    oid!: string;
    kind!: string;
    city!: string;
    num!: number;
    street!: string;
    info?: string;
    override asString() {
        return this.info
            ? '' + this.num + ' ' + this.street + ', ' + this.city + ' (' + this.info + ').'
            : '' + this.num + ' ' + this.street + ', ' + this.city + '.';
    }
}
AddressType.viewctor = AddressView;

//
// ─── PERSON ─────────────────────────────────────────────────────────────────────
//

export interface PersonNameData {
    first: string;
    last: string;
}

const PersonNameDef: ObjectDef<PersonNameData> = {
    type: 'object',
    title: 'personname_type',
    properties: {
        first: STR_TYPE,
        last: STR_TYPE
    },
    required: ['first', 'last'],
    index: {
        id: ['first', 'last'],
        sort: ['last', 'first']
    }
};
export const PersonNameType = new Tobject(PersonNameDef);
export class PersonNameView extends Objview<PersonNameData> implements PersonNameData {
    constructor(entity?: any, parent?: IViewElement) {
        super(PersonNameType, entity, parent);
    }
    first!: string;
    last!: string;
    override asString() {
        return '' + this.first + ' ' + this.last + '.';
    }
}
PersonNameType.viewctor = PersonNameView;

//
// ────────────────────────────────────────────────────────────────── SOCIETY ─────
//

export interface PersonData {
    oid: string;
    name: PersonNameData;
    addresses: StringMap<AddressData>;
}

const PersonDef: ObjectDef<PersonData> = {
    type: 'object',
    title: 'person_type',
    properties: {
        oid: STR_TYPE,
        name: PersonNameType,
        addresses: AddressMapType
    },
    required: ['oid', 'name', 'addresses'],
    index: {
        id: 'oid',
        sort: ['name>last', 'name>first']
    }
};
export const PersonType = new Tobject(PersonDef);
export class PersonView extends Objview<PersonData> implements PersonData {
    constructor(entity?: any, parent?: IViewElement) {
        super(PersonType, entity);
    }
    oid!: string;
    name!: PersonNameView;
    addresses!: Mapview<AddressView>;
}
PersonType.viewctor = PersonView;

//
// ─── SOCIETY ────────────────────────────────────────────────────────────────────
//

//
// ────────────────────────────────────────────────────────────── SOCIETYNAME ─────
//

export interface SocietyNameData {
    common: string;
    legal: string;
}

const SocietyNameDef: ObjectDef<SocietyNameData> = {
    type: 'object',
    title: 'societyname_type',
    properties: {
        common: STR_TYPE,
        legal: STR_TYPE
    },
    required: ['common', 'legal'],
    index: {
        id: ['common'],
        sort: ['legal']
    }
};
export const SocietyNameType = new Tobject(SocietyNameDef);

export class SocietyNameView extends Objview<SocietyNameData> implements SocietyNameData {
    constructor(entity?: any, parent?: IViewElement) {
        super(SocietyNameType, entity, parent);
    }
    common!: string;
    legal!: string;
    override asString() {
        return this.legal + '.';
    }
}
SocietyNameType.viewctor = SocietyNameView;

//
// ────────────────────────────────────────────────────────────────── SOCIETY ─────
//

export interface SocietyData {
    oid: string;
    name: SocietyNameData;
    addresses: AddressData[];
}

const SocietyDef: ObjectDef<SocietyData> = {
    type: 'object',
    title: 'society_type',
    properties: {
        oid: STR_TYPE,
        name: SocietyNameType,
        addresses: AddressCollectionType
    },
    required: ['oid', 'name', 'addresses'],
    index: {
        id: 'oid',
        sort: 'name'
    }
};
export const SocietyType = new Tobject(SocietyDef);
export class SocietyView extends Objview<SocietyData> implements SocietyData {
    constructor(entity?: any, parent?: IViewElement) {
        super(SocietyType, entity);
    }
    oid!: string;
    name!: SocietyNameView;
    addresses!: Setview<AddressView>;
}
SocietyType.viewctor = SocietyView;

//
// ─── EMPLOYEE ───────────────────────────────────────────────────────────────────
//

export interface EmployeeData {
    oid: string;
    name: PersonNameData;
    job: string;
    addressRef: RelationLookupLocalData<AddressData>;
    societyRef: RelationLookupLocalData<SocietyNameData>;
}

const LookupLocalAddressDef = RelationLookupLocalDefFactory(AddressType);
const LookupLocalAddressType = new Tobject(LookupLocalAddressDef);
export class LookupLocalAddressView
    extends Objview<RelationLookupLocalData<AddressData>>
    implements RelationLookupLocalData<AddressData>
{
    constructor(entity?: any, parent?: IViewElement) {
        super(LookupLocalAddressType, entity, parent);
    }
    type!: string;
    rev?: string;
    href!: string;
    path!: string;
    title!: string;
    value?: AddressView;
}
LookupLocalAddressType.viewctor = LookupLocalAddressView;

const LookupLocalSocietyNameDef = RelationLookupLocalDefFactory(SocietyNameType);
const LookupLocalSocietyNameType = new Tobject(LookupLocalSocietyNameDef);
export class LookupLocalSocietyNameView
    extends Objview<RelationLookupLocalData<SocietyNameData>>
    implements RelationLookupLocalData<SocietyNameData>
{
    constructor(entity?: any, parent?: IViewElement) {
        super(LookupLocalSocietyNameType, entity, parent);
    }
    type!: string;
    rev?: string;
    href!: string;
    path!: string;
    title!: string;
    value?: SocietyNameView;
}
LookupLocalSocietyNameType.viewctor = LookupLocalSocietyNameView;

const EmployeeDef: ObjectDef<EmployeeData> = {
    type: 'object',
    title: 'employee_type',
    properties: {
        oid: STR_TYPE,
        name: PersonNameType,
        job: STR_TYPE,
        addressRef: LookupLocalAddressType,
        societyRef: LookupLocalSocietyNameType
    },
    required: ['oid', 'name', 'job', 'addressRef', 'societyRef'],
    index: {
        id: 'oid',
        sort: ['@>name>last', '@>name>first']
    }
};
const EmployeeType = new Tobject(EmployeeDef);
export class EmployeeView extends Objview<EmployeeData> implements EmployeeData {
    constructor(entity?: any, parent?: IViewElement) {
        super(EmployeeType, entity, parent);
    }
    oid!: string;
    name!: PersonNameData;
    job!: string;
    addressRef!: LookupLocalAddressView;
    societyRef!: LookupLocalSocietyNameView;
}
EmployeeType.viewctor = EmployeeView;

//
// ────────────────────────────────────────────────────────────────── API OP ─────
//

export type ApiOperationTypes = string | IViewElement;
export type ApiOperationSetview = Setview<ApiOperationTypes>;
export type ApiOperationView = [string, string, Setview<string>];
export type ApiOperationData = [string, string, string[]] | ApiOperationSetview;
const ApiOperationDef: TupleDef = {
    type: 'array',
    title: 'apioperation_tuple',

    minlength: 3,
    maxlength: 3,
    items: [STR_TYPE, STR_TYPE, STR_ARRAY_TYPE],
    index: {
        id: ['[0]', '[1]']
    }
};

export const ApiOperationTuple = new Tarray<ApiOperationData>(ApiOperationDef);

export class ApiOperationTupleView extends Setview<ApiOperationTypes> {
    constructor(array: any[], type?: Tarray, parent?: IViewElement) {
        super(array, ApiOperationTuple, parent);
        const tupleItems = ApiOperationTuple.itemsTypeDef as TarrayTupleItem;
        if (array.length === 0) {
            array.push(STR_TYPE.defaultValue());
            array.push(STR_TYPE.defaultValue());
            array.push(STR_ARRAY_TYPE.defaultValue());
        }
        this[0] = array[0];
        this[1] = array[1];
        this[2] = STR_ARRAY_TYPE.itemsTypeDef!.readAsView(array, 2, this);
    }
}
ApiOperationTuple.viewctor = ApiOperationTupleView as SetviewTypeConstructor;

const ApiOperationListDef: ArrayDef = {
    type: 'array',
    title: 'apioperationlist_array',

    minlength: 0,
    maxlength: Number.MAX_SAFE_INTEGER,
    items: ApiOperationTuple
};

const ApiOperationList = new Tarray<ApiOperationSetview>(ApiOperationListDef);

//
// ─── API ───────────────────────────────────────────────────────────────────
//

export interface ApiData {
    oid: string;
    name: string;
    operations: ApiOperationData[];
}

const ApiDef: ObjectDef<ApiData> = {
    type: 'object',
    title: 'api_type',
    properties: {
        oid: STR_TYPE,
        name: STR_TYPE,
        operations: ApiOperationList
    },
    required: ['oid', 'name', 'operations'],
    index: {
        id: 'oid',
        sort: ['.>name']
    }
};
export const ApiType = new Tobject(ApiDef);
export class ApiView extends Objview<ApiData> implements ApiData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ApiType, entity, parent);
    }
    oid!: string;
    name!: string;
    operations!: Setview<ApiOperationSetview>;
}
ApiType.viewctor = ApiView;
