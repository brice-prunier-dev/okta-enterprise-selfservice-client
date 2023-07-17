const fs = require('fs');
const replaceJSONProperty = require('replace-json-property');

function asStr2(s) {
    return ('0' + ('' + s)).slice(-2);
}

let input = process.argv[2] || '01';
if (input.indexOf('.') > -1 && input.indexOf('.') < input.length - 1) {
    input = input.split('.')[1];
}

console.log('Build: ' + input);
const versionFilePath = './projects/intact/src/app/app.version.ts';
const stats = fs.statSync(versionFilePath);
if (stats.isFile()) {
    const versionDef = fs.readFileSync(versionFilePath, 'utf8');
    console.log(versionDef);
    const re = /([0-9]{1,4}).([0-9]{1,4}).([0-9]{1,4}).([0-9]{1,4})/;
    const [_, major, minor, build, release] = versionDef.match(re);
    console.log('Major: ' + major);
    console.log('Minor: ' + minor);
    console.log('Old Build: ' + build);
    console.log('Old Release: ' + release);

    const today = new Date();
    const build2 = asStr2(today.getFullYear()) + asStr2(today.getUTCMonth() + 1);
    const release2 = asStr2(today.getDate()) + asStr2(input);
    console.log('New Build: ' + build2);
    console.log('New Release: ' + release2);
    const version2 = `${major}.${minor}.${build2}.${release2}`;
    const versionText = `export const version = "${major}.${minor}.${build2}.${release2}";`;
    console.log(version2);
    console.log(versionText);
    console.log('');

    // tslint:disable-next-line:no-shadowed-variable
    fs.unlinkSync(versionFilePath);
    fs.writeFileSync(versionFilePath, versionText, { encoding: 'utf8' });

    replaceJSONProperty.replace('./projects/intact/ngsw-config.json', 'version', version2);
}
