// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    env: 'beta',
    iam: {
        // PPRD
        // clientId: '0oa3cq4al8xwFLOoO0i7',
        // issuer: 'https://gem-preprod.okta-emea.com/oauth2/aus2kpy8s5bMYjI7e0i7',

        // BETA REFreshToken
        // clientId: '2-b-intact-next-client-KBBZPZH3JLP3J13',
        // issuer: 'https://gem-beta.oktapreview.com/oauth2/aus3v6rg3e9zNHMxe0x6',

        // BETA
        clientId: '2-b-intact-client-NTFBHCDNKPAJAKP',
        issuer: 'https://gem-beta.oktapreview.com/oauth2/aus3v6rg3e9zNHMxe0x6',

        // PROD
        // clientId: '3-b-intact-client-91PRJ2MC01G12DW',
        // issuer: 'https://gem.okta-emea.com/oauth2/aus2jp8vmz3yYrDnc0i7',

        redirectUri: 'https://localhost:4201',
        logoutUrl: 'https://localhost:4201/home',
        postLogoutRedirectUri: 'https://localhost:4201/home',
        responseType: 'code',
        // // tslint:disable-next-line: max-line-length
        scope: 'openid profile email api.iam api.iam.apps.commands api.iam.users.commands api.iam.admin.commands api.iam.projects.commands api.iam.kpis',
        showDebugInformation: true,
        sessionChecksEnabled: true,
        nonceStateSeparator: ';',
        useSilentRefresh: true,
        fallbackAccessTokenExpirationTimeInSec: 3600,
        silentRefreshRedirectUri: 'https://localhost:4201/assets/silent-refresh.html',
        // BETA REFreshToken
        tokenEndpoint: 'https://gem-beta.oktapreview.com/oauth2/aus3v6rg3e9zNHMxe0x6/v1/token'
        // PROD
        // tokenEndpoint: 'https://gem.okta-emea.com/oauth2/aus2jp8vmz3yYrDnc0i7/v1/token'
    },
    // iam: {
    //     clientId: '0oa2u03xevPkBswnO0i7',
    //     issuer: 'https://gem.okta-emea.com/oauth2/aus2jp8vmz3yYrDnc0i7',
    //     redirectUri: 'http://localhost:4200/home',
    //     logoutUrl: 'http://localhost:4200/home',
    //     // tslint:disable-next-line: max-line-length
    //     scope: 'openid profile email api.iam api.iam.apps.commands api.iam.users.commands api.iam.admin.commands
    // api.iam.users.external.commands',
    //     showDebugInformation: true,
    //     sessionChecksEnabled: true,
    //     nonceStateSeparator: ';'
    // },
    api: {
        // url: 'https://iamapi-dev.ase.ncd.infrasys16.com/api',
        // DEV
        url: 'https://localhost:44307',
        signalr: 'ws://localhost:44307/projectshub'
        // PROD
        // url: 'https://localhost:44318',
        // signalr: 'wss://localhost:44318/projectshub'
    },
    easyapi: {
        // url: 'https://iamapi-dev.ase.ncd.infrasys16.com/api',
        url: 'https://easyapi-prod-client.ase.ncd.infrasys16.com'
    },
    audiences: {
        gem: {
            oid: '00g3whdruoc0aSzRA0x6',
            label: 'GEM',
            description: 'All GEMers'
        },
        b2e: {
            oid: '00g38v4eg4S88TaIw0x6',
            label: 'ENGIE',
            description: 'All Engie employees'
        },
        all: {
            oid: '00g2g0wq3Lp7ExABt0x6',
            label: 'EVERYONE',
            description: 'Everyone'
        }
    },
    toggleFeatures: {
        kpis: true
    }
};
