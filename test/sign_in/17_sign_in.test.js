import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------17 - Send data into password field---------', () => {
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

        it('17 - Send data into password field', function (done) {
            (async () => {
                console.log('Start sending data into password field')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('#passwordInput')).click();
                await driver.findElement(By.css('#passwordInput')).sendKeys('1234Abc12#$!$@#$!5fgafaljfhsl');
                await driver.findElement(By.css('#checkPassword')).click();
                const type = await driver.findElement(By.css('#passwordInput')).getAttribute('type')
                if (type === 'text') {
                    console.log('17 - Send data into password field successfully')
                    done()
                } else {
                    console.log('17 - Send data into password field failed')
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
