const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { defaultMarkets } = require('../../helper/constances');
let driver;

describe('---------- Before Login: 000003 - Check Market Overview ---------', () => {
    try {
        it('Open App', function (done) {
            driver = builder();
            (async () => {
                console.log('Start app')
                await driver.navigate().to(config.testDomain);
                console.log(`Go to domain: ${config.testDomain}`)
                await driver.wait(until.elementLocated(By.css('body')));
                await driver.sleep(7000);
                console.log('Open app: SUCCESSFUL')
                done()
            })();
        });

        it('Check Market Overview', function (done) {
            (async () => {
                console.log('Start checking market overview');
                await driver.sleep(1000);
                driver.findElement(By.css('.mk-overview')).then(marketComponent => {
                    return marketComponent.findElements(By.css('.flex'));
                }).then(async markets => {
                    const result = [];
                    markets.map(mrk => {
                        result.push(mrk.getText());
                    })
                    const vals = await Promise.all(result)
                    return vals;
                }).then(vals => {
                    let flag = true;
                    vals.map(val => {
                        const code = defaultMarkets[val];
                        if (code) console.log(`Market: ${code}`)
                        else flag = false;
                    })
                    if (flag) {
                        console.log(`Display markets: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Display markets: FAILED`);
                    }
                })
            })();
        });

        it('Quit App', function (done) {
            (async () => {
                await driver.quit();
                done();
            })();
        });
    } catch (error) {
        console.log(`Error: ${error}`)
    }
});
