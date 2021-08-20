var electronInstaller = require('electron-winstaller');
console.log('window installer starting...');
var path = require('path');

const resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: 'release-builds/OM Equix-win32-ia32',
    outputDirectory: 'release-builds/installer/win',
    authors: 'Quant Edge Pty Ltd',
    exe: 'OM Equix.exe',
    description: 'test'
});

resultPromise.then(() => console.log('window installer finished...'), (e) => console.log(`No dice: ${e.message}`));
