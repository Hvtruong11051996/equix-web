import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------2 - Check effects when opening news widget---------', () => {
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

        it('2 - Check effects when opening news widget', function (done) {
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
