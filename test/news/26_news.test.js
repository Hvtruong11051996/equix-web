import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------26 - Check button display---------', () => {
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

        it('26 - Check button display', function (done) {
            (async () => {
                console.log('Start checking button display')
                const page = await driver.findElement(By.css('.newsContainer .paginate > div:last-child'))
                const lastPageButton = await page.findElement(By.css('div:nth-child(4)'))
                const lastPageButtonClass = await lastPageButton.getAttribute('class')
                if (lastPageButtonClass === 'disabled') {
                    console.log('Cannot click last disabled button')
                } else {
                    await lastPageButton.click()
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
