export const environment = {
    production: true,
    env: 'prod',
    iam: {
        clientId: '3-b-intact-client-91PRJ2MC01G12DW',
        issuer: 'https://gem.okta-emea.com/oauth2/aus2jp8vmz3yYrDnc0i7',
        redirectUri: 'https://iamapi-client.ase.ncd.infrasys16.com',
        logoutUrl: 'https://iamapi-client.ase.ncd.infrasys16.com/home',
        postLogoutRedirectUri: 'https://iamapi-client.ase.ncd.infrasys16.com/home',
        responseType: 'code',
        scope: 'openid profile email api.iam api.iam.apps.commands api.iam.users.commands api.iam.admin.commands api.iam.projects.commands api.iam.kpis',
        showDebugInformation: true,
        sessionChecksEnabled: true,
        nonceStateSeparator: ';',
        useSilentRefresh: true,
        fallbackAccessTokenExpirationTimeInSec: 3600,
        silentRefreshRedirectUri:
            'https://iamapi-client.ase.ncd.infrasys16.com/assets/silent-refresh.html',
        tokenEndpoint: 'https://gem.okta-emea.com/oauth2/aus2jp8vmz3yYrDnc0i7/v1/token'
    },
    api: {
        url: 'https://iamapi.ase.ncd.infrasys16.com',
        signalr: 'wss://iamapi.ase.ncd.infrasys16.com/projectshub'
    },
    easyapi: {
        // url: 'https://iamapi-dev.ase.ncd.infrasys16.com/api',
        url: 'https://easyapi-prod-client.ase.ncd.infrasys16.com'
    },
    audiences: {
        gem: { oid: '00g2k3cl47F61Ske20i7', label: 'GEM', description: 'All GEMers' },
        b2e: { oid: '00g1f0ovm5pt9TVax0i7', label: 'ENGIE', description: 'All Engie employees' },
        all: { oid: '00g178nctiSAnmPGv0i7', label: 'EVERYONE', description: 'Everyone' }
    },
    toggleFeatures: {
        kpis: true
    }
};
