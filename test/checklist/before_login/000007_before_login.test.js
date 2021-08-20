const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { defaultMarkets } = require('../../helper/constances');
let driver;

describe('---------- Before Login: 000007 - Check News ---------', () => {
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

        it('Check News', function (done) {
            (async () => {
                const defaultCode = 'ANZ.ASX'
                console.log('Start checking news')
                driver.findElement(By.css('#newsContainer'))
                .then(async newsComponent => {
                    let loginText = await newsComponent.findElement(By.css('.please-login')).getText();
                    loginText = loginText.toString();
                    if (loginText.indexOf('sign in') > -1 && loginText.indexOf('to access Market Announcements') > -1) {
                        console.log('News widget - block guests from seeing the content: SUCCESSFUL');
                        return newsComponent.findElement(By.css('.nodeSearchBox'));
                    }
                    console.log('News widget - block guests from seeing the content: FAILED');
                    return new Error('');
                }).then(async nodeSearchBox => {
                    const val = await nodeSearchBox.findElement(By.css('input')).getAttribute('value');
                    if (val === defaultCode) {
                        console.log(`Display News with code ${val}: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Display News with code ${val}: FAILED`);
                    }
                }).catch(error => {
                    console.log(`Find element progress: Fail\n${error}`);
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
