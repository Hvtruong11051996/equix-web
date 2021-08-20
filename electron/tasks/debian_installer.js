const installer = require('electron-installer-debian');

const options = {
    src: 'release-builds/OMEquix-linux-x64',
    dest: 'release-builds/installer/debian',
    arch: 'amd64',
    'categories': [
        'Utility'
    ],
    description: 'description',
    // 'SvgIcon': 'resources/Icon.png',
    productDescription: 'productDescription',
    'depends': [
        'git',
        'gconf2',
        'gconf-service',
        'gvfs-bin',
        'libc6',
        'libcap2',
        'libgtk2.0-0',
        'libudev0 | libudev1',
        'libgcrypt11 | libgcrypt20',
        'libappindicator1',
        'libnotify4',
        'libnss3',
        'libxtst6',
        'python',
        'xdg-utils'
    ],
    'lintianOverrides': [
        'changelog-file-missing-in-native-package'
    ]
};

console.log('Creating package (this may take a while)');
console.log('starting...');

installer(options, function (err) {
    if (err) {
        console.error(err, err.stack)
        process.exit(1)
    }

    console.log('Successfully created package at ' + options.dest)
});
