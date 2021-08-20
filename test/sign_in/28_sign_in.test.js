import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------28 - Check signin successfully with account which have never signed in before---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await driver.navigate().to(config.domain);
                console.log('go to domain')
                await driver.findElement(By.css('body'))
                await driver.sleep(2000);
                done();
            })();
        });

        it('Check signin successfully with account which have never signed in before', function (done) {
            (async () => {
                console.log('Start checking signin successfully with account which have never signed in before')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys(config.username);
                await driver.findElement(By.css('#passwordInput')).sendKeys(config.password);
                await driver.findElement(By.css('#loginButton')).click();
                await driver.sleep(3000);
                await driver.findElement(By.css('.pinFormRoot'));
                const pinFormTitleText = await driver.findElement(By.css('.pinFormTitle')).getText();
                if (pinFormTitleText === 'PIN for "OM EQUIX"') {
                    console.log('Checked signin successfully with account which have never signed in before successfully')
                    done()
                } else {
                    console.log('Checked signin successfully with account which have never signed in before failed')
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
    }
});
