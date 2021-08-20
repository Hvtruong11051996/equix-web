const installer = require('electron-installer-flatpak');

const options = {
    src: 'release-builds/OMEquix-linux-x64/',
    dest: 'release-builds/installer/',
    description: 'description',
    productDescription: 'productDescription',
    categories: [
        'Utility'
    ],
    arch: 'x64'
};

console.log('Creating package (this may take a while)');

installer(options, function (err) {
    if (err) {
        console.error(err, err.stack)
        process.exit(1)
    }

    console.log('Successfully created package at ' + options.dest)
});
