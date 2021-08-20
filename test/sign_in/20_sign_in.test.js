import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------20 - Check visibility of signin button---------', () => {
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

        it('20 - Check visibility of signin button', function (done) {
            (async () => {
                console.log('Start checking visibility of signin button')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys('1234Abc12#$!$@#$!5fgafaljfhsl');
                await driver.findElement(By.css('#passwordInput')).sendKeys('1234Abc12#$!$@#$!5fgafaljfhsl');
                const loginButton = await driver.findElement(By.css('#loginButton'));
                const loginButtonCssColor = await loginButton.getCssValue('color');
                const loginButtonCssBackgroundColor = await loginButton.getCssValue('backgroundColor');
                if (loginButtonCssColor === 'rgba(255, 255, 255, 1)' && loginButtonCssBackgroundColor === 'rgba(24, 189, 201, 1)') {
                    console.log('Checked visibility of signin button successfully')
                    done()
                } else {
                    console.log('Checked visibility of signin button failed')
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
