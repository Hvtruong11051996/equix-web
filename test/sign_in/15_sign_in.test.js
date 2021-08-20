import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------15 - Check password field---------', () => {
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

        it('15 - Check password field', function (done) {
            (async () => {
                console.log('Start checking password field')
                await driver.findElement(By.css('.loginButton')).click();
                const placeHolderPass = await driver.findElement(By.css('.placeHolderPass'))
                const placeHolderPassText = await placeHolderPass.getText()
                const placeHolderPassCssColor = await placeHolderPass.getCssValue('color')
                const checkPasswordIcon = await driver.findElement(By.css('#checkPassword > svg'))
                const checkPasswordIconColor = await checkPasswordIcon.getCssValue('color')
                const passwordInput = await driver.findElement(By.css('.inputPassDiv > input:first-child'))
                const passwordInputId = await passwordInput.getAttribute('id')
                console.log(placeHolderPassText, placeHolderPassCssColor, checkPasswordIconColor, passwordInputId)
                if (placeHolderPassText === 'Password' && placeHolderPassCssColor === 'rgba(132, 147, 168, 1)' && checkPasswordIconColor === 'rgba(0, 0, 0, 0.87)' && passwordInputId === 'passwordInput') {
                    console.log('15 - Checked password field successfully')
                    done()
                } else {
                    console.log('15 - Checked password field failed')
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
