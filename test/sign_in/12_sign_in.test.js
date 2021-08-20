import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------12 - Select username field---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('12 - Select username field', function (done) {
            (async () => {
                console.log('Start selecting username field')
                await driver.findElement(By.css('.loginButton')).click();
                const userNameInput = await driver.findElement(By.css('#userNameInput'))
                await userNameInput.click()
                const clickUserNameInput = await driver.switchTo().activeElement()
                const clickUserNameInputId = await clickUserNameInput.getAttribute('id')
                if (clickUserNameInputId === 'userNameInput') {
                    console.log('12 - Selected username field successfully')
                    done()
                } else {
                    console.log('12 - Selected username field failed')
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
