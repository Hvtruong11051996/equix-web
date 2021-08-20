const sign = require('electron-osx-sign');
const cp = require('child_process');
const applicationId = '3rd Party Mac Developer Application: Quant Edge Joint Stock Company (3WCRW3Y258)';
const pathFolder = 'release-builds/OMEquix-mas-x64';
const bundleId = 'com.quantedge.equixnext';
const buildPath = '/Volumes/Data/Working/equix-au/equix-web/electron/release-builds/OMEquix-mas-x64/OMEquix.app';
const buildPathPkg = '/Volumes/Data/Working/equix-au/equix-web/electron/release-builds/OMEquix-mas-x64/OMEquix.pkg';
const buildPathUnsignedPkg = '/Volumes/Data/Working/equix-au/equix-web/electron/release-builds/OMEquix-mas-x64/OMEquix-unsigned.pkg';
const installerId = '3rd Party Mac Developer Installer: Quant Edge Joint Stock Company (3WCRW3Y258)';
// electron-osx-sign release-builds/OMEquix-mas-x64/OMEquix.app --entitlements-inherit=child.plist --entitlements=parent.plis
// t --identity="3rd Party Mac Developer Application: Quant Edge Joint Stock Company (3WCRW3Y258)" --provisioning-profile=Equix_Next.provisionprofile
const pwd = cp.execSync('pwd');
console.log(__dirname);
sign({
    app: buildPath,
    identity: applicationId,
    // 'entitlements-inherit': 'child.plist',
    // 'entitlements': 'parent.plist',
    // 'provisioning-profile': 'Equix_Next.provisionprofile'
}, function done(err) {
    if (err) {
        console.log('error: ', err);
        process.exit(1);
    }
});
// return;
// sign({
//     app: buildPath,
//     identity: applicationId
// }, function done(err) {
//     if (err) {
//         console.log('error: ', err);
//         process.exit(1);
//     }

// console.log('Application Signed');
// console.log('Pack starting...');
// const command = `electron-osx-flat "${buildPath}" --identity="${installerId}"`;
// cp.execSync(command);
// console.log('Pack finished...');
// const commandExpand = `pkgutil --expand "${buildPathPkg}" "${pathFolder}/expanded"`;
// console.log('Expand starting...');
// console.log('===>: ', commandExpand);
// cp.execSync(commandExpand);
// console.log('Expand finished...');
// console.log('chmod starting...');
// cp.execSync(`chmod 755 "${pathFolder}/expanded/${bundleId}.pkg"`);
// console.log('chmod finished...');
// cp.execSync(`pkgutil --flatten "${pathFolder}/expanded" "${buildPathPkg}"`);
// console.log('re-pack finished...');
// cp.execSync(`rm -rf ${pathFolder}/expanded`);
// console.log('remove folder finished...');
// cp.execSync(`mv "${buildPathPkg}" "${buildPathUnsignedPkg}"`);
// console.log('rename finished...');
// cp.execSync(`productsign --sign "${installerId}" "${buildPathUnsignedPkg}" "${buildPathPkg}"`);
// console.log('Signed...');
// console.log('Application Ready for upload and in-app purchases...');
// // });
