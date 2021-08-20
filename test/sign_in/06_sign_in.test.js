import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------06 - Check click signin from header---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('06 - Check click signin from header', function (done) {
            (async () => {
                console.log('Find login button')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('.rootLogin'));
                console.log('Found login container')
                done();
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
