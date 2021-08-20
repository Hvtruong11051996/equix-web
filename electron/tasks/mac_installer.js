var createDMG = require('electron-installer-dmg');
console.log('starting...');

const opts = {
    appPath: 'release-builds/Equix-darwin-x64/Equix.app',
    name: 'OMEquix'
};

createDMG(opts, function done(err) {
    if (err) {
        console.log('error: ', err);
    } else {
        console.log('finished...');
    }
});
