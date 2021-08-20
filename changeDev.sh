#!/usr/bin/env bash
nextBundle='const inProduction = true'
currentBundle='const inProduction = false'
sed -i -e "s/$currentBundle/$nextBundle/g" webpack.config.babel.js
rm -f webpack.config.babel.js-e
