import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------5 - Check effects when switching filter---------', () => {
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

        it('5 - Check effects when switching filter', function (done) {
            (async () => {
                // await driver.sleep(1000);
                // const newsComponent = await driver.findElement(By.css('.lm_tab[title="News"]'))
                // const busyBox = await newsComponent.findElement(By.css('img[src="img/Spinner-white.svg"]'))
                // const busyBoxCssDisplay = await busyBox.getCssValue('display')
                // console.log(busyBoxCssDisplay)
                done();
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
