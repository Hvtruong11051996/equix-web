#!/bin/bash

# Name of your app.
APP="OMEquix"
# The path of your app to sign.
APP_PATH="./release-builds/OMEquix-mas-x64/OMEquix.app"
# The path to the location you want to put the signed package.
RESULT_PATH="./release-builds/OMEquix-mas-x64/$APP.pkg"
# The name of certificates you requested.
APP_KEY="3rd Party Mac Developer Application: Quant Edge Joint Stock Company (3WCRW3Y258)"
INSTALLER_KEY="3rd Party Mac Developer Installer: Quant Edge Joint Stock Company (3WCRW3Y258)"
# The path of your plist files.
CHILD_PLIST="./child.plist"
PARENT_PLIST="./parent.plist"

electron-osx-sign "$APP_PATH" --entitlements-inherit=child.plist --entitlements=parent.plist --identity="$APP_KEY" --provisioning-profile=EquixNext.provisionprofile
electron-osx-flat "$APP_PATH" --platform=mas --pkg="$RESULT_PATH" --identity="$INSTALLER_KEY"