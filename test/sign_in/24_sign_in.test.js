import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------24 - Check send wrong username and password---------', () => {
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

        it('Check send wrong username and password', function (done) {
            (async () => {
                console.log('Start checking send wrong username and password')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys(config.false_username);
                await driver.findElement(By.css('#passwordInput')).sendKeys(config.false_password);
                await driver.findElement(By.css('#loginButton')).click();
                const imageSrc = await driver.findElement(By.css('#loginButton > div img')).getAttribute('src')
                const incorrectEmail = await driver.findElement(By.css('.incorrectEmail'));
                const incorrectEmailText = await incorrectEmail.getText()
                const incorrectEmailColor = await incorrectEmail.getCssValue('color');
                const incorrectEmailBackgroundColor = await incorrectEmail.getCssValue('backgroundColor');
                if (imageSrc === 'https://dev1.equixapp.com/img/Spinner-white.svg' &&
                    // incorrectEmailText === 'Login was unsuccessful' &&
                    incorrectEmailColor === 'rgba(242, 242, 242, 1)' &&
                    incorrectEmailBackgroundColor === 'rgba(223, 0, 0, 1)') {
                    console.log('Check send wrong username and password successfully')
                    done()
                } else {
                    console.log('Check send wrong username and password failed')
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
