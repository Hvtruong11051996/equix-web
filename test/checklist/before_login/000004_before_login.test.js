const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { defaultMarkets } = require('../../helper/constances');
let driver;

describe('---------- Before Login: 000004 - Check Watchlist ---------', () => {
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

        it('Check Watchlists', function (done) {
            (async () => {
                const watchlistDefaultMarkets = {
                    'ASX Top Gainers': 'ASX Top Gainers',
                    'ASX S&P 20': 'ASX S&P 20'
                }
                console.log('Start checking watchlist')
                driver.findElements(By.css('.watchlistRoot')).then(async watchlistComponents => {
                    const promises = [];
                    watchlistComponents.map(wlstCom => {
                        promises.push(wlstCom.findElement(By.css('.left')).getText());
                    })
                    const vals = await Promise.all(promises);
                    return vals;
                }).then(vals => {
                    let flag = true;
                    vals.map(val => {
                        const code = watchlistDefaultMarkets[val];
                        if (code) console.log(`Watchlist market: ${code}`);
                        else flag = false;
                    })
                    if (flag) {
                        console.log(`Display watchlist: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Display watchlist: FAILED`);
                    }
                })
            })();
        })

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
