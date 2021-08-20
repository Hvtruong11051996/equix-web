import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------10 - Check click outside the signin popup---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('10 - Check click outside the signin popup', function (done) {
            (async () => {
                console.log('Start checking click outside the signin popup')
                await driver.findElement(By.css('.loginButton')).click();
                const rootLogin = await driver.findElement(By.css('.rootLogin'))
                const closeLoginFormButton = await driver.findElement(By.css('.closeLoginForm'));
                await closeLoginFormButton.click()
                // const result = await rootLogin.isDisplayed()
                // console.log(result)
                // console.log(rootLogin)
                // if (rootLogin) {
                //     console.log('false')
                // } else {
                //     console.log('true')
                // }
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
