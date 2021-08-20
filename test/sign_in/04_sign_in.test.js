import { login, startApp } from '../helper/functionUtils';

const { By, until } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------04 - Find header signin---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('04 - Find header signin', function (done) {
            (async () => {
                console.log('Start finding login button')
                await driver.findElement(By.css('.loginButton'))
                console.log('Found login button successsully')
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
