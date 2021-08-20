import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------25 - Send data to username and password fields---------', () => {
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

        it('Send data to username and password fields', function (done) {
            (async () => {
                console.log('Start sending data to username and password fields')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#userNameInput')).sendKeys(config.false_username);
                await driver.findElement(By.css('#passwordInput')).sendKeys(config.false_password);
                await driver.findElement(By.css('.closeLoginForm')).click()
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('.rootLogin'));
                const userNameInputValue = await driver.findElement(By.css('#userNameInput')).getAttribute('value');
                const passwordInputValue = await driver.findElement(By.css('#passwordInput')).getAttribute('value');
                if (userNameInputValue === '' && passwordInputValue === '') {
                    console.log('Send data to username and password fields successfully')
                    done()
                } else {
                    console.log('Send data to username and password fields failed')
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
