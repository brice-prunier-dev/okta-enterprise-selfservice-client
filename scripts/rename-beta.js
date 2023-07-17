const replaceJSONProperty = require('replace-json-property');

var environment = process.argv[2];
replaceJSONProperty.replace('./projects/intact/src/manifest.webmanifest', 'name', 'intact-beta');
replaceJSONProperty.replace(
    './projects/intact/src/manifest.webmanifest',
    'short_name',
    'intact-beta'
);
var betaicons = [
    {
        src: 'assets/icons/icon-beta-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable any'
    },
    {
        src: 'assets/icons/icon-beta-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
    }
];
replaceJSONProperty.replace('./projects/intact/src/manifest.webmanifest', 'icons', betaicons);
