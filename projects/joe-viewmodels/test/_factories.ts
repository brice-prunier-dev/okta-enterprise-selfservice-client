import { SocietyData, EmployeeData, PersonData, ApiData } from './_types';

export function getSociety_SG(): SocietyData {
    return {
        oid: 'sg',
        name: {
            common: 'SG',
            legal: 'Société Générale'
        },
        addresses: [
            {
                oid: 'sg-main',
                kind: 'main',
                city: 'PARIS LA DEFENSE CEDEX',
                num: 17,
                street: 'cours valmy',
                info: 'tour SG'
            },
            {
                oid: 'sg-main_it',
                kind: 'main_it',
                city: 'FONTENAY SOUS BOIS',
                num: 5,
                street: 'av du val de fontenay',
                info: 'imm gaya'
            },
            {
                oid: 'sg->titre_haussman',
                kind: 'titre_haussman',
                city: 'PARIS',
                num: 50,
                street: 'bd haussman',
                info: 'service info Titres exploitation'
            },
            {
                oid: 'sg-grc',
                kind: 'grc',
                city: 'PARIS',
                num: 102,
                street: 'terrasse Boieldieu',
                info: 'GRC-Tour Winterthur '
            }
        ]
    };
}

export function getSociety_AF(): SocietyData {
    return {
        oid: 'af',
        name: {
            common: 'Air France',
            legal: 'Air France'
        },
        addresses: [
            {
                oid: 'af-main',
                kind: 'main',
                city: 'CHARLES DE GAULLE',
                num: 0,
                street: 'Aeroport'
            },
            {
                oid: 'af-main_it',
                kind: 'main_it',
                city: 'MASSY',
                num: 0,
                street: 'Domaine de Vilgenis',
                info: 'centre informatique'
            },
            {
                oid: 'af-paray',
                kind: 'paray',
                city: 'PARAY VIELLE POSTE CEDEX',
                num: 1,
                street: 'avenue Marechal Devaux'
            }
        ]
    };
}

export function getAllSocieties(): SocietyData[] {
    return [
        getSociety_SG(),
        getSociety_AF()
    ]
}

export function getEmployee_SG_1(): EmployeeData {
    return {
        oid: 'af-brice_prunier-01',
        name: {
            first: 'Brice',
            last: 'Prunier'
        },
        job: 'Tech lead',
        addressRef: {
            type: 'society',
            href: 'af',
            path: '$>addresses>(af-main_it)',
            title: 'Domaine de Vilgenis, MASSY'
        },
        societyRef: {
            type: 'society',
            href: 'af',
            path: '$>name',
            title: 'Air France'
        }
    };
}

export function getPerson_BP_1(): PersonData {
    return {
        oid: 'brice_prunier-01',
        name: {
            first: 'Brice',
            last: 'Prunier'
        },
        addresses: {
            main: {
                oid: 'bp-main',
                kind: 'main',
                city: 'Paris',
                num: 72,
                street: 'rue Michel Ange'
            },
            pro: {
                oid: 'bp-main',
                kind: 'pro',
                city: 'Paris',
                num: 72,
                street: 'rue Michel Ange'
            }
        }
    };
}

export function getApi_Intact(): ApiData {
    return {
        oid: 'intact',
        name: 'intact',
        operations: [
            ['api/', 'get', ['tag1', 'tag2']],
            ['api/', 'post', ['tag1', 'tag2']],
            ['car/list', 'get', ['tag2', 'tag3']],
            ['car/{id}', 'get', ['tag2']],
            ['car/{id}', 'post', ['tag2']]
        ]
    };
}
