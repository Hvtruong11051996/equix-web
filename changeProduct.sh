#!/usr/bin/env bash
echo "console.log('%c$(date +"%H:%M %d/%m/%Y")', 'color: #0f0;font-size:36px')" > public/print.js

nextBundle="`date +%Y%m%d%H%M`"
currentBundle="precache-v1"
sed -i -e "s/$currentBundle/$nextBundle/g" public/service-worker.js
rm -f public/service-worker.js-e

nextBundle='const inProduction = true'
currentBundle='const inProduction = false'
sed -i -e "s/$currentBundle/$nextBundle/g" webpack.config.babel.js
rm -f webpack.config.babel.js-e
