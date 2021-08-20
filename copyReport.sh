#!/usr/bin/env bash
git reset --hard
git pull origin HEAD:master
DIRECTORY=$PWD/automation-reports/
echo $DIRECTORY
rm -rf $DIRECTORY
echo '===> DELETE'
cp -R /Users/admin/Desktop/reportDetox/ $DIRECTORY
echo '===> COPY'
git add -A
git commit -a -m "add reports"
git push origin HEAD:master
# yarn
# npm run build
# firebase deploy --token "1/qFWy39G_cAS8ppH2QgNm-pU9NSmj_yN8zs74-6BCfkSs60oqhzpaC4DumPOyROKY"