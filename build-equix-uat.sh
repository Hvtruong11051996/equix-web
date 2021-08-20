#!/usr/bin/env bash
rm -rf dist/
mkdir dist

nextBundle='prj-equix-uat'
currentBundle='quant-edge-23211'
sed -i -e "s/$currentBundle/$nextBundle/g" .firebaserc
sed -i -e "s/$currentBundle/$nextBundle/g" public/config.js

currentBundle='202008190000'
nextBundle=`date +%Y%m%d%H%M`
sed -i -e "s/$currentBundle/$nextBundle/g" public/config.js