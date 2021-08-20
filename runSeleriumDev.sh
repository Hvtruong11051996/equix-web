#!/usr/bin/env bash
npm run test-mocha
rm -rf /Users/admin/Desktop/reportDetox/equix-au/web/test-selenium-web/ && cp -r mochawesome-report/ /Users/admin/Desktop/reportDetox/equix-au/web/test-selenium-web/