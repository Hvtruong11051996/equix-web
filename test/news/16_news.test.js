import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------16 - Check click next button---------', () => {
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

        it('16 - Check click next button', function (done) {
            (async () => {
                console.log('Start checking click next button')
                const page = await driver.findElement(By.css('.newsContainer .paginate > div:last-child'))
                const nextPageButton = await page.findElement(By.css('div:nth-child(3)'))
                const nextPageButtonClass = await nextPageButton.getAttribute('class')
                if (nextPageButtonClass === 'disabled') {
                    console.log('Cannot click disabled button')
                } else {
                    await nextPageButton.click()
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
