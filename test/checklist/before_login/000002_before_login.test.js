const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { defaultMarkets } = require('../../helper/constances');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
let driver;

describe('---------- Before Login: 000002 - Display Delay 20 Minutes Text ---------', () => {
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

        it('Display Delay Text on Header', function (done) {
            (async () => {
                console.log('Start checking text delay');
                let title = await findElementSync(driver, '.alertDelayed.show');
                title = await title.getText()
                if (title === '20 Minutes Delayed') {
                    console.log('Display delay text: SUCCESSFUL')
                    done()
                } else {
                    console.log('Display delay text: FAILED')
                }
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
