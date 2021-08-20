#!/usr/bin/env bash
npm run coverage
DIRECTORY_COVERAGE=$PWD/automation-reports/equix-au/web/coverage/
DIRECTORY_REPORT=$PWD/coverage/lcov-report/
rm -rf $DIRECTORY_COVERAGE
cp -R $DIRECTORY_REPORT $DIRECTORY_COVERAGE/
