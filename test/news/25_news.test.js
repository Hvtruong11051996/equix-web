import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------25 - Check button display---------', () => {
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

        it('Check button display', function (done) {
            (async () => {
                console.log('Start checking button display')
                const page = await driver.findElement(By.css('.newsContainer .paginate > div:last-child'))
                const previousPageButton = await page.findElement(By.css('div:nth-child(2)'))
                const previousPageButtonClass = await previousPageButton.getAttribute('class')
                if (previousPageButtonClass === 'disabled') {
                    console.log('Cannot click previous disabled button')
                } else {
                    await previousPageButton.click()
                }
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
