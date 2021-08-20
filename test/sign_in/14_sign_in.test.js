import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------Delete all typed information---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('Delete all typed information', function (done) {
            (async () => {
                console.log('Start deleting all typed information')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#userNameInput')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys('AbCd');
                await driver.findElement(By.css('#closeEmail')).click();
                console.log('Deleted all typed information successfully')
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
