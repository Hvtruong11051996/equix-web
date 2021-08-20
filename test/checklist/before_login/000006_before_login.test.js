const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { defaultMarkets } = require('../../helper/constances');
let driver;

describe('---------- Before Login: 000006 - Check Chart ---------', () => {
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

        it('Check Chart', function (done) {
            (async () => {
                const DEFAULT_INTERVAL = 5;
                console.log('Start checking chart')
                const {status, statusText, data} = await axios.get(config.url.ChartANZ);
                if (status === 200 && statusText === 'OK' && data) {
                    console.log('Retrive data: SUCCESSFUL \n Ignore checking default interval');
                    done();
                    // driver.findElement(By.css('.chartTV'))
                    // .then(chartComponent => {
                    //     return chartComponent.findElement(By.css('iframe'));
                    // })
                    // .then(iframe => {
                    //     return iframe.findElement(By.css('.no-first'));
                    // })
                    // .then(wrap => {
                    //     return wrap.findElement(By.css('.quick'));
                    // })
                    // .then(wrap2 => {
                    //     return wrap2.findElement(By.css('.apply-common-tooltip'));
                    // })
                    // .then(promise => {
                    //     console.log(promise)
                    // })
                    // .catch(error => {
                    //     console.log('Render Chart component: FAILED')
                    // });
                } else {
                    console.log('Retrive data in Chart: FAILED');
                }
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
