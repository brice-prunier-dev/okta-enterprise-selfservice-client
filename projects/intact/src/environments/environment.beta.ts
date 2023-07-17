// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    env: 'beta',
    iam: {
        clientId: '2-b-intact-client-NTFBHCDNKPAJAKP',
        issuer: 'https://gem-beta.oktapreview.com/oauth2/aus3v6rg3e9zNHMxe0x6',
        redirectUri: 'https://iamapi-client-beta.ase.ncd.infrasys16.com',
        postLogoutRedirectUri: 'https://iamapi-client-beta.ase.ncd.infrasys16.com/home',
        responseType: 'code',
        scope: 'openid profile email api.iam api.iam.apps.commands api.iam.users.commands api.iam.admin.commands api.iam.projects.commands api.iam.kpis',
        showDebugInformation: true,
        sessionChecksEnabled: true,
        nonceStateSeparator: ';',

        useSilentRefresh: true,
        fallbackAccessTokenExpirationTimeInSec: 3600,
        silentRefreshRedirectUri:
            'https://iamapi-client-beta.ase.ncd.infrasys16.com/assets/silent-refresh.html',
        tokenEndpoint: 'https://gem-beta.oktapreview.com/oauth2/aus3v6rg3e9zNHMxe0x6/v1/token'
    },
    api: {
        // url: 'https://iamapi-dev.ase.ncd.infrasys16.com/api',
        url: 'https://iamapi-beta.ase.ncd.infrasys16.com',
        signalr: 'wss://iamapi-beta.ase.ncd.infrasys16.com/projectshub'
    },
    easyapi: {
        // url: 'https://iamapi-dev.ase.ncd.infrasys16.com/api',
        url: 'https://easyapi-prod-client.ase.ncd.infrasys16.com'
    },
    audiences: {
        gem: { oid: '00g3whdruoc0aSzRA0x6', label: 'GEM', description: 'All GEMers' },
        b2e: { oid: '00g38v4eg4S88TaIw0x6', label: 'ENGIE', description: 'All Engie employees' },
        all: { oid: '00g2g0wq3Lp7ExABt0x6', label: 'EVERYONE', description: 'Everyone' }
    },
    toggleFeatures: {
        kpis: true
    }
};
