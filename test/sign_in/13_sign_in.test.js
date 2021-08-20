import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------13 - Send data into username field---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('13 - Send data into username field', function (done) {
            (async () => {
                console.log('Start sending data into username field')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#userNameInput')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys('AbCd');
                await driver.findElement(By.css('#closeEmail')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys('1234Abc');
                await driver.findElement(By.css('#closeEmail')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys('1234Abc12#$!$@#$!5fgafaljfhsl');
                console.log('13 - Sent data into username field successfully')
                done()
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
