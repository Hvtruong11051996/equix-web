import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------6 - Check symbol field---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('Check login', function (done) {
            (async () => {
                await login(driver, done)
            })();
        });

        it('Check opening news from menu', function (done) {
            (async () => {
                await driver.findElement(By.css('.headerBoxHover')).click();
                await driver.findElement(By.css('.menuContainer > div:nth-child(4)')).click();
                await driver.findElement(By.css('div.contentItemMenu.notLogin > div:nth-child(2)')).click();
                await driver.sleep(1000);
                await driver.findElement(By.css('.newsContainer'))
                done();
            })();
        });

        it('6 - Check symbol field', function (done) {
            (async () => {
                console.log('Start checking symbol field successfully')
                const symbolInput = await driver.findElement(By.css('.newsContainer .inputAddon > input'))
                const symbolInputValue = await symbolInput.getAttribute('value')
                const symbolInputPadding = await symbolInput.getCssValue('padding-left')
                if (/\.[\w]{0,}$/.test(symbolInputValue) && symbolInputPadding === '8px') {
                    console.log('Check symbol field successfully')
                    done()
                } else {
                    console.log('Check symbol field failed')
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
