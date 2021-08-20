import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------18 - Check type lack of information---------', () => {
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

        it('18 - Check type lack of information', function (done) {
            (async () => {
                console.log('Start checking type lack of information')
                await driver.findElement(By.css('.loginButton')).click();
                const loginButton = await driver.findElement(By.css('#loginButton'));
                await driver.findElement(By.css('#userNameInput')).sendKeys('1234Abc12#$!$@#$!5fgafaljfhsl');
                const loginButtonCssPointerEvents = await loginButton.getCssValue('pointerEvents');
                const loginButtonCssColor = await loginButton.getCssValue('color');
                if (loginButtonCssPointerEvents === 'none' && loginButtonCssColor === 'rgba(255, 255, 255, 0.54)') {
                    console.log('18 - Check type lack of information successfully')
                    done()
                } else {
                    console.log('18 - Check type lack of information failed')
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
