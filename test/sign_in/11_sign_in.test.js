import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------11 - Check username fields---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('11 - Check username fields', function (done) {
            (async () => {
                console.log('Start checking username fields')
                await driver.findElement(By.css('.loginButton')).click();
                const placeHolderEmail = await driver.findElement(By.css('.placeHolderEmail'))
                const placeHolderEmailText = await placeHolderEmail.getText()
                const placeHolderEmailCssColor = await placeHolderEmail.getCssValue('color')
                const closeEmailIcon = await driver.findElement(By.css('#closeEmail > svg'))
                const closeEmailIconColor = await closeEmailIcon.getCssValue('color')
                const userNameInput = await driver.findElement(By.css('.inputEmailDiv > input:first-child'))
                const userNameInputId = await userNameInput.getAttribute('id')
                if (placeHolderEmailText === 'Username' && placeHolderEmailCssColor === 'rgba(132, 147, 168, 1)' && closeEmailIconColor === 'rgba(0, 0, 0, 0.87)' && userNameInputId === 'userNameInput') {
                    console.log('11 - Checked username fields successfully')
                    done()
                } else {
                    console.log('11 - Checked username fields failed')
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
