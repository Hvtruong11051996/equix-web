var zip = require('electron-installer-zip');

var opts = {
    // dir: 'dist/MongoDB Compass-darwin-x64/MongoDB Compass.app',
    dir: 'release-builds/OM Equix-darwin-x64/OM Equix.app',
    out: 'release-builds/abc.zip'
};

zip(opts, function (err, res) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Zip file written to: ', res);
});
