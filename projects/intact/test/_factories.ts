import { AppDocData, GroupDocData, UserDocData, AppInfoData } from 'intact-models';

export function loadAppData_inctact_client(): AppInfoData {
    return {
        status: 'ACTIVE',
        name: 'intact-client',
        label: 'intact-client'
    };
}

export function loadAppDetail_inctact_client(): AppDocData {
    return {
        client_name: 'intact-client',
        client_id: '1-b-intact-client-CJ6K8G20JKXKLH4',
        application_type: 'browser',
        client_uri: 'http://localhost:4200/home',
        redirect_uris: [
            'https://iamapi-client-dev.ase.ncd.infrasys16.com/home',
            'http://localhost:4200',
            'https://iamapi-client-dev.ase.ncd.infrasys16.com'
        ],
        logout_uris: [
            'http://localhost:4200/home',
            'https://iamapi-client-dev.ase.ncd.infrasys16.com/home'
        ],
        grant_type: 'authorization_code',
        initiate_login_uri: 'https://iamapi-client-dev.ase.ncd.infrasys16.com',
        response_types: [
            'code'
        ],
        created: '11/14/2019 09:01:10'
    } as AppDocData;
}

export function loadAppGroups_inctact_client(): GroupDocData[] {
    return [
        {
            created: '2019-11-14T09:01:13Z',
            type: 'OKTA_GROUP',
            profile: {
                name: 'intact-client-default',
                description: 'This is the default group of the intact-client application'
            }
        },
        {
            created: '2019-11-14T14:51:41Z',
            type: 'OKTA_GROUP',
            profile: {
                name: 'intact-client-owner',
                description: 'Persons in charge of \'intact-client\' application.'
            }
        },
        ,
        {
            created: '2019-11-14T14:51:41Z',
            type: 'OKTA_GROUP',
            profile: {
                name: 'intact-client-admin',
                description: 'Persons granted for INTACT admin operations.'
            }
        },
        {
            created: '2019-11-14T09:01:11Z',
            type: 'OKTA_GROUP',
            profile: {
                name: 'client-iam-admin-intact-client',
                description: 'This is the admin group of the intact-client application'
            }
        }
    ] as unknown as GroupDocData[];
}

export function loadAppUsers_inctact_client(): UserDocData[] {
    return [
        {
            status: 'ACTIVE',
            created: '2019-11-15T15:54:27Z',
            statusChanged: '2019-11-15T15:54:27Z',
            lastUpdated: '2019-11-15T15:54:27Z',
            b2e: false,
            profile: {
                login: 'DC5735@engie.com',
                firstName: 'Alexandre',
                lastName: 'GIRAUD',
                email: 'alexandre.giraud@engie.com',
                locale: 'en_US',
                userType: 'I',
                isInternal: true
            }
        },
        {
            status: 'ACTIVE',
            created: '2019-11-14T09:14:18Z',
            statusChanged: '2019-11-14T09:01:14Z',
            lastUpdated: '2019-11-14T09:14:18Z',
            b2e: false,
            profile: {
                login: 'hv5496@engie.com',
                firstName: 'Lamia',
                lastName: 'Mansouri',
                email: 'lamia.mansouri@engie.com',
                locale: 'en_US'
            },
        },
        {
            status: 'ACTIVE',
            created: '2019-11-14T09:01:14Z',
            statusChanged: '2019-11-14T09:01:14Z',
            lastUpdated: '2019-11-14T09:01:20Z',
            b2e: false,
            profile: {
                login: 'gk1211@engie.com',
                firstName: 'Brice',
                lastName: 'PRUNIER',
                email: 'brice.prunier@engie.com',
                locale: 'en_US',
                userType: 'I',
                isInternal: true
            },
        }
    ] as any as UserDocData[];
}

export function loadAppApiInfos_inctact_client(): any[] {
    return [];
}

export function loadAlexandre_giraud(): UserDocData {
    return {
        status: 'ACTIVE',
        created: '2019-11-15T15:54:27Z',
        lastUpdated: '2019-11-15T15:54:27Z',
        b2e: false,
        profile: {
            login: 'DC5735@engie.com',
            firstName: 'Alexandre',
            lastName: 'GIRAUD',
            email: 'alexandre.giraud@engie.com',
            locale: 'en_US',
            userType: 'I',
            isInternal: true,
            preferredLanguage: 'fr',
            accountId: '0',
            legalEntityId: '0',
            locationId: '0',
        },
        lastLogin: '',
        groupNames: [ 'intact-client-default', 'intact-client-owner', 'intact-client-admin' ],
        activated: '2019-11-15T15:54:27Z',
    } as any;
}
